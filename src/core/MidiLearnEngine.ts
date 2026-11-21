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
  private onProfileUpdated?: () => void;

  public setOnProfileUpdated(callback: () => void): void {
    this.onProfileUpdated = callback;
  }

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

    const isTargetToggle =
      this.state.target.type === 'slot_toggle' ||
      this.state.target.type === 'page_nav' ||
      this.state.target.type === 'sw_push';

    if (isTargetToggle) {
      this.finalizeLearn(channel, cc, 'push_toggle');
      return true;
    }

    // EXP Pedal is always absolute continuous
    if (this.state.target.type === 'exp_pedal') {
      this.finalizeLearn(channel, cc, 'absolute');
      return true;
    }

    // Nexfoot Rotary Switch target is strictly Relative mode (CW = 127, CCW = 0, or 65/63/1)
    if (this.state.target.type === 'sw_rotate') {
      this.finalizeLearn(channel, cc, 'relative');
      return true;
    }

    // Continuous parameter / other target
    const vals = this.sampleHistory.map(s => s.val);
    const hasIntermediate = vals.some(v => v > 1 && v < 127);

    // 1) If intermediate pot value (2 ~ 126), immediate Absolute
    if (hasIntermediate) {
      this.finalizeLearn(channel, cc, 'absolute');
      return true;
    }

    // 2) If relative tick signals (0, 1, 127, 63, 65), confirm Relative mode
    const isTick = vals.every(v => v === 0 || v === 1 || v === 127 || v === 63 || v === 65);
    if (isTick && this.sampleHistory.length >= 2) {
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

    const isTick = vals.every(v => v === 0 || v === 1 || v === 127 || v === 63 || v === 65);
    if (isTick) {
      return 'relative';
    }

    return 'push_toggle';
  }

  private finalizeLearn(channel: number, cc: number, mode: MidiInputMode): void {
    if (!this.state.target) return;

    const target = this.state.target;
    const activeProfile = profileManager.getActiveProfile();
    const swId = target.swId || 'sw1';

    let binding: ControlBinding;

    if (target.type === 'exp_pedal') {
      const existingExp = activeProfile.bindings.find((b) => b.swId === 'exp');
      binding = {
        id: existingExp ? existingExp.id : 'bind_exp_learned',
        swId: 'exp',
        type: 'rotate',
        targetType: 'exp_mod',
        midiChannel: channel,
        ccNumber: cc,
        mode: 'absolute',
        min: 0,
        max: 127,
        invert: false,
      };
    } else if (target.type === 'sw_rotate') {
      const existingRot = activeProfile.bindings.find((b) => b.swId === swId && b.type === 'rotate');
      const swNum = parseInt(swId.replace('sw', ''), 10) || 1;
      binding = {
        id: existingRot ? existingRot.id : `bind_${swId}_rot_learned`,
        swId,
        type: 'rotate',
        targetType: existingRot?.targetType || 'slot_param',
        targetSlotId: existingRot?.targetSlotId,
        targetParamIndex: existingRot?.targetParamIndex ?? swNum - 1,
        midiChannel: channel,
        ccNumber: cc,
        mode,
        min: 0,
        max: mode === 'absolute' ? 127 : 1,
        invert: false,
      };
    } else if (target.type === 'sw_push') {
      const existingPush = activeProfile.bindings.find((b) => b.swId === swId && b.type === 'push');
      binding = {
        id: existingPush ? existingPush.id : `bind_${swId}_push_learned`,
        swId,
        type: 'push',
        targetType: existingPush?.targetType || (swId === 'sw4' ? 'page_nav' : 'slot_toggle'),
        targetSlotId: existingPush?.targetSlotId,
        midiChannel: channel,
        ccNumber: cc,
        mode: 'push_toggle',
        min: 0,
        max: 127,
        invert: false,
      };
    } else {
      const isPush = target.type === 'slot_toggle' || target.type === 'page_nav';
      binding = {
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
    }

    profileManager.updateBinding(activeProfile.id, binding);

    this.state = {
      active: false,
      target: null,
      detectedMode: mode,
      detectedCC: cc,
      detectedChannel: channel,
    };

    if (this.onProfileUpdated) {
      this.onProfileUpdated();
    }

    this.notify();
  }

  private notify(): void {
    const s = this.getState();
    this.listeners.forEach(fn => fn(s));
  }
}

export const midiLearnEngine = new MidiLearnEngine();
