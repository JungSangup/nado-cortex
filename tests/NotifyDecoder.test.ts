import { describe, it, expect } from 'vitest';
import { NotifyDecoder } from '../src/bluetooth/NotifyDecoder';
import { useAppStore } from '../src/core/store';

describe('NotifyDecoder (TASK-311)', () => {
  it('should decode Amp knob notify packet and apply to store', () => {
    // 0B C0 18 <knobId 0:Gain> 20 <val 255> 28 00 1A 00 00 00
    const packet = new Uint8Array([0x0B, 0xC0, 0x18, 0x00, 0x20, 255, 0x28, 0x00, 0x1A, 0x00, 0x00, 0x00]);
    const event = NotifyDecoder.decode(packet);

    expect(event.type).toBe('amp_knob');
    expect(event.slotId).toBe('amp');
    expect(event.paramIndex).toBe(0);
    expect(event.value).toBe(1.0); // 255 / 255 = 1.0

    NotifyDecoder.applyToStore(event);
  });

  it('should decode slot bypass notify packet', () => {
    // 0A C0 08 01 18 <enableSlot 0x04: pre_fx_1> 20 <01:Bypass> 1F 00 00 00
    const packet = new Uint8Array([0x0A, 0xC0, 0x08, 0x01, 0x18, 0x04, 0x20, 0x01, 0x1F, 0x00, 0x00, 0x00]);
    const event = NotifyDecoder.decode(packet);

    expect(event.type).toBe('slot_bypass');
    expect(event.slotId).toBe('pre_fx_1');
    expect(event.isBypassed).toBe(true);

    NotifyDecoder.applyToStore(event);
    const slot = useAppStore.getState().cortexSlots.find((s) => s.slotId === 'pre_fx_1');
    expect(slot?.isBypassed).toBe(true);
  });

  it('should decode preset change notify packet', () => {
    // 06 C0 08 02 10 <preset 5> 1B 00 00 00
    const packet = new Uint8Array([0x06, 0xC0, 0x08, 0x02, 0x10, 5, 0x1B, 0x00, 0x00, 0x00]);
    const event = NotifyDecoder.decode(packet);

    expect(event.type).toBe('preset_change');
    expect(event.presetIndex).toBe(5);

    NotifyDecoder.applyToStore(event);
    expect(useAppStore.getState().currentPresetIndex).toBe(5);
  });
});
