import { describe, it, expect } from 'vitest';
import { CORTEX_SLOT_CONFIGS, getModelsForSlot } from '../src/core/DeviceCatalog';
import { NanoCortexProtocol } from '../src/bluetooth/NanoCortexProtocol';

describe('DeviceCatalog & NanoCortexProtocol (TASK-213)', () => {
  it('should define all 7 core slots in Nano Cortex', () => {
    const slotKeys = Object.keys(CORTEX_SLOT_CONFIGS);
    expect(slotKeys).toContain('pre_fx_1');
    expect(slotKeys).toContain('pre_fx_2');
    expect(slotKeys).toContain('amp');
    expect(slotKeys).toContain('cab');
    expect(slotKeys).toContain('post_fx_1');
    expect(slotKeys).toContain('post_fx_2');
    expect(slotKeys).toContain('post_fx_3');
  });

  it('should return matching models for slots', () => {
    const preFxModels = getModelsForSlot('pre_fx_1');
    expect(preFxModels.length).toBeGreaterThan(0);
    expect(preFxModels.some((m) => m.id === 'ts9_overdrive')).toBe(true);

    const postDelayModels = getModelsForSlot('post_fx_1');
    expect(postDelayModels.some((m) => m.id === 'digital_delay')).toBe(true);
  });

  it('should build preset change BLE packet correctly', () => {
    const packet = NanoCortexProtocol.buildPresetChangePacket(5);
    // [0x06, 0xC0, 0x08, 0x02, 0x10, presetIndex, 0x1B, 0x00, 0x00, 0x00]
    expect(packet[0]).toBe(0x06);
    expect(packet[1]).toBe(0xC0);
    expect(packet[5]).toBe(5);
    expect(packet[6]).toBe(0x1B);
  });

  it('should build device model change packet correctly', () => {
    const packet = NanoCortexProtocol.buildDeviceModelChangePacket(0x00, 'ts9_overdrive');
    expect(packet[1]).toBe(0xC0);
    expect(packet[2]).toBe(0x18);
    expect(packet[3]).toBe(0x00);
    expect(packet[4]).toBe(0x20);

    // End suffix should be 0x88 0x00 0x00 0x00
    const len = packet.length;
    expect(packet[len - 4]).toBe(0x88);
    expect(packet[len - 3]).toBe(0x00);
    expect(packet[len - 2]).toBe(0x00);
    expect(packet[len - 1]).toBe(0x00);
  });

  it('should build Float32LE continuous FX param packet correctly', () => {
    const packet = NanoCortexProtocol.buildFXParamPacket(0x02, 1, 0.75);
    expect(packet[0]).toBe(0x0F);
    expect(packet[1]).toBe(0xC0);
    expect(packet[5]).toBe(0x02); // modelSlot
    expect(packet[7]).toBe(1);    // paramIndex
    expect(packet[8]).toBe(0x2D);

    const dv = new DataView(packet.buffer, packet.byteOffset + 9, 4);
    const parsedFloat = dv.getFloat32(0, true);
    expect(parsedFloat).toBeCloseTo(0.75, 4);
  });
});
