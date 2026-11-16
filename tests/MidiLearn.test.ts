import { describe, it, expect, beforeEach } from 'vitest';
import { midiLearnEngine } from '../src/core/MidiLearnEngine';

describe('MidiLearnEngine & Profile Integration (TASK-214)', () => {
  beforeEach(() => {
    midiLearnEngine.cancelLearn();
  });

  it('should start and cancel MIDI learn mode', () => {
    expect(midiLearnEngine.getState().active).toBe(false);

    midiLearnEngine.startLearn({
      type: 'slot_param',
      slotId: 'pre_fx_1',
      paramIndex: 0,
      swId: 'sw1',
    });

    expect(midiLearnEngine.getState().active).toBe(true);
    expect(midiLearnEngine.getState().target?.slotId).toBe('pre_fx_1');

    midiLearnEngine.cancelLearn();
    expect(midiLearnEngine.getState().active).toBe(false);
  });

  it('should automatically identify relative mode when receiving 0 and 1 values', () => {
    midiLearnEngine.startLearn({
      type: 'slot_param',
      slotId: 'pre_fx_1',
      paramIndex: 1,
      swId: 'sw2',
    });

    // 1st tick: Relative CW (0) -> consumed, waiting for 2nd tick
    const firstConsumed = midiLearnEngine.handleMidiMessage(1, 58, 0);
    expect(firstConsumed).toBe(true);
    expect(midiLearnEngine.getState().active).toBe(true);

    // 2nd tick: Relative CCW (1) -> finalized to relative
    const secondConsumed = midiLearnEngine.handleMidiMessage(1, 58, 1);
    expect(secondConsumed).toBe(true);

    const state = midiLearnEngine.getState();
    expect(state.active).toBe(false);
    expect(state.detectedMode).toBe('relative');
    expect(state.detectedCC).toBe(58);
  });

  it('should automatically identify absolute mode when receiving values > 1', () => {
    midiLearnEngine.startLearn({
      type: 'slot_param',
      slotId: 'post_fx_1',
      paramIndex: 0,
      swId: 'sw3',
    });

    // Send intermediate absolute value (e.g. 45) -> immediate finalize
    const consumed = midiLearnEngine.handleMidiMessage(1, 11, 45);

    expect(consumed).toBe(true);
    const state = midiLearnEngine.getState();
    expect(state.active).toBe(false);
    expect(state.detectedMode).toBe('absolute');
    expect(state.detectedCC).toBe(11);
  });

  it('should automatically identify push toggle mode for slot toggle target', () => {
    midiLearnEngine.startLearn({
      type: 'slot_toggle',
      slotId: 'pre_fx_2',
      swId: 'sw2',
    });

    // Send momentary push (127)
    const consumed = midiLearnEngine.handleMidiMessage(1, 22, 127);

    expect(consumed).toBe(true);
    const state = midiLearnEngine.getState();
    expect(state.active).toBe(false);
    expect(state.detectedMode).toBe('push_toggle');
    expect(state.detectedCC).toBe(22);
  });
});
