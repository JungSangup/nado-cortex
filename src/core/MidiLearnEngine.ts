import { MidiLearnTarget, MidiLearnState, MidiInputMode, ControlBinding } from '../types';
import { profileManager } from './ProfileManager';

export type MidiLearnListener = (state: MidiLearnState) => void;

export class MidiLearnEngine {
  private state: MidiLearnState = {
    active: false,
    target: null,
  };

  private listeners: Set<MidiLearnListener> = new Set();
  private sampleHistory: { channel: number; cc: number; val: number; timestamp: number }[] = [];

  public getState(): MidiLearnState {
    return { ...this.state };
  }

  public subscribe(listener: MidiLearnListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public startLearn(target: MidiLearnTarget): void {
    this.sampleHistory = [];
    this.state = {
      active: true,
      target,
    };
    this.notify();
  }

  public cancelLearn(): void {
    this.sampleHistory = [];
    this.state = {
      active: false,
      target: null,
    };
    this.notify();
  }

  /**
   * Called by WebMidiManager when raw MIDI CC / Note message arrives
   * Returns true if the message was consumed by MIDI Learn
   */
  public handleMidiMessage(channel: number, cc: number, val: number): boolean {
    if (!this.state.active || !this.state.target) {
      return false;
    }

    const now = Date.now();
    this.sampleHistory.push({ channel, cc, val, timestamp: now });

    if (this.sampleHistory.length > 10) {
      this.sampleHistory.shift();
    }

    const isTargetToggle = this.state.target.type === 'slot_toggle' || this.state.target.type === 'page_nav';

    if (isTargetToggle) {
      this.finalizeLearn(channel, cc, 'push_toggle');
      return true;
    }

    // Continuous parameter target
    const vals = this.sampleHistory.map(s => s.val);
    const hasIntermediate = vals.some(v => v > 1 && v < 127);

    // 1) If intermediate pot value (2 ~ 126), immediate Absolute
    if (hasIntermediate) {
      this.finalizeLearn(channel, cc, 'absolute');
      return true;
    }

    // 2) If 0 or 1 ticks (Relative mode), require at least 2 ticks to confirm
    const all0or1 = vals.every(v => v === 0 || v === 1);
    if (all0or1 && this.sampleHistory.length >= 2) {
      this.finalizeLearn(channel, cc, 'relative');
      return true;
    }

    return true; // Consumed while waiting for more samples
  }

  /**
   * Classifies samples into 'relative', 'absolute', or 'push_toggle'
   */
  public detectInputMode(samples: { channel: number; cc: number; val: number }[]): MidiInputMode {
    if (samples.length === 0) return 'relative';

    const vals = samples.map(s => s.val);
    const hasIntermediate = vals.some(v => v > 1 && v < 127);
    if (hasIntermediate) {
      return 'absolute';
    }

    const all0or1 = vals.every(v => v === 0 || v === 1);
    if (all0or1) {
      return 'relative';
    }

    return 'push_toggle';
  }

  private finalizeLearn(channel: number, cc: number, mode: MidiInputMode): void {
    if (!this.state.target) return;

    const target = this.state.target;
    const activeProfile = profileManager.getActiveProfile();

    const swId = target.swId || 'sw1';
    const isPush = target.type === 'slot_toggle' || target.type === 'page_nav';

    const binding: ControlBinding = {
      id: `bind_${swId}_${isPush ? 'push' : 'rot'}_learned`,
      swId,
      type: isPush ? 'push' : 'rotate',
      targetType: target.type,
      targetSlotId: target.slotId,
      targetParamIndex: target.paramIndex,
      midiChannel: channel,
      ccNumber: cc,
      mode,
      min: 0,
      max: mode === 'absolute' ? 127 : 1,
      invert: false,
    };

    profileManager.updateBinding(activeProfile.id, binding);

    this.state = {
      active: false,
      target: null,
      detectedMode: mode,
      detectedCC: cc,
      detectedChannel: channel,
    };

    this.notify();
  }

  private notify(): void {
    const s = this.getState();
    this.listeners.forEach(fn => fn(s));
  }
}

export const midiLearnEngine = new MidiLearnEngine();
