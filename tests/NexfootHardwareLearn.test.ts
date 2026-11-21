import { describe, it, expect, beforeEach } from 'vitest';
import { midiLearnEngine } from '../src/core/MidiLearnEngine';
import { profileManager } from '../src/core/ProfileManager';
import { NexfootParser } from '../src/midi/NexfootParser';
import { useAppStore } from '../src/core/store';

describe('Nexfoot Hardware-Centric MIDI Learn (TASK-311)', () => {
  beforeEach(() => {
    midiLearnEngine.cancelLearn();
  });

  it('should learn custom CC and relative mode for SW 1 rotary knob', () => {
    // 1. Start learning SW 1 rotary
    midiLearnEngine.startLearn({
      type: 'sw_rotate',
      swId: 'sw1',
    });

    expect(midiLearnEngine.getState().active).toBe(true);

    // 2. Incoming Relative MIDI CC (CC 15, Val 127 CW)
    const consumed = midiLearnEngine.handleMidiMessage(1, 15, 127);
    expect(consumed).toBe(true);

    // 3. Learning finalized immediately on rotary knob signal
    const state = midiLearnEngine.getState();
    expect(state.active).toBe(false);
    expect(state.detectedMode).toBe('relative');
    expect(state.detectedCC).toBe(15);

    // 4. Active profile binding updated
    const activeProfile = profileManager.getActiveProfile();
    const binding = activeProfile.bindings.find((b) => b.swId === 'sw1' && b.type === 'rotate');
    expect(binding).toBeDefined();
    expect(binding?.ccNumber).toBe(15);
    expect(binding?.mode).toBe('relative');
  });

  it('should learn custom CC for SW 2 push footswitch', () => {
    midiLearnEngine.startLearn({
      type: 'sw_push',
      swId: 'sw2',
    });

    // Push footswitch incoming CC 33
    const consumed = midiLearnEngine.handleMidiMessage(1, 33, 127);
    expect(consumed).toBe(true);

    const state = midiLearnEngine.getState();
    expect(state.active).toBe(false);
    expect(state.detectedCC).toBe(33);
    expect(state.detectedMode).toBe('push_toggle');

    const activeProfile = profileManager.getActiveProfile();
    const binding = activeProfile.bindings.find((b) => b.swId === 'sw2' && b.type === 'push');
    expect(binding?.ccNumber).toBe(33);
  });

  it('should learn custom CC for EXP Pedal', () => {
    midiLearnEngine.startLearn({
      type: 'exp_pedal',
      swId: 'exp',
    });

    // Expression pedal moved with value 64 (CC 11)
    const consumed = midiLearnEngine.handleMidiMessage(1, 11, 64);
    expect(consumed).toBe(true);

    const state = midiLearnEngine.getState();
    expect(state.active).toBe(false);
    expect(state.detectedCC).toBe(11);
    expect(state.detectedMode).toBe('absolute');

    const activeProfile = profileManager.getActiveProfile();
    const binding = activeProfile.bindings.find((b) => b.swId === 'exp');
    expect(binding?.ccNumber).toBe(11);
  });

  it('should synchronize learned CC into NexfootParser', () => {
    const parser = new NexfootParser();
    const bindings = [
      { swId: 'sw1', type: 'rotate', ccNumber: 77 },
      { swId: 'sw1', type: 'push', ccNumber: 88 },
    ];

    parser.syncFromProfile(bindings);
    const config = parser.getConfig();

    expect(config.sw1.rotateCc).toBe(77);
    expect(config.sw1.pushCc).toBe(88);

    // Test parsing with learned CC
    const parsedEvent = parser.parse(new Uint8Array([0xb0, 77, 127])); // CC 77 Val 127 (CW)
    expect(parsedEvent).toBeDefined();
    expect(parsedEvent?.encoderId).toBe(1);
    expect(parsedEvent?.type).toBe('rotate');
    expect(parsedEvent?.step).toBe(1);
  });

  it('should automatically sync useAppStore activeProfile when MidiLearn completes', () => {
    // Start learning SW 3 rotate
    midiLearnEngine.startLearn({
      type: 'sw_rotate',
      swId: 'sw3',
    });

    // Hardware sends CC 95 Val 127 (CW)
    midiLearnEngine.handleMidiMessage(1, 95, 127);

    // Check that store's activeProfile has the learned CC
    const storeProfile = useAppStore.getState().activeProfile;
    const sw3Rot = storeProfile.bindings.find((b: any) => b.swId === 'sw3' && b.type === 'rotate');
    expect(sw3Rot?.ccNumber).toBe(95);
    expect(sw3Rot?.mode).toBe('relative');
  });
});
