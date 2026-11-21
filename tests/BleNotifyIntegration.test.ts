import { describe, it, expect, beforeEach } from 'vitest';
import { PacketFramer } from '../src/bluetooth/PacketFramer';
import { NotifyDecoder } from '../src/bluetooth/NotifyDecoder';

describe('BLE Notify Integration & Polymorphic Decoder (TASK-321)', () => {
  let framer: PacketFramer;

  beforeEach(() => {
    framer = new PacketFramer();
  });

  it('should correctly decode Amp Front Knob event from both raw frame and sliced payload', () => {
    // Amp Gain (Knob 0) = 128 (0.50)
    // 0x0A (len: 10) + 0xC0 + 18 00 20 80 28 00 (6B) + 1A 00 00 00 (type 4B) = 12 bytes
    const rawKnobPacket = new Uint8Array([
      0x0A, 0xC0, 0x18, 0x00, 0x20, 0x80, 0x28, 0x00, 0x1A, 0x00, 0x00, 0x00,
    ]);

    // 1. Decode raw frame
    const decodedFromRaw = NotifyDecoder.decode(rawKnobPacket);
    expect(decodedFromRaw.type).toBe('amp_knob');
    expect(decodedFromRaw.slotId).toBe('amp');
    expect(decodedFromRaw.paramIndex).toBe(0);
    expect(decodedFromRaw.value).toBeCloseTo(0.5, 2);

    // 2. Decode sliced payload from PacketFramer
    const packets = framer.pushChunk(rawKnobPacket);
    expect(packets.length).toBe(1);
    const framed = packets[0];

    const decodedFromPayload = NotifyDecoder.decode(framed.payload);
    expect(decodedFromPayload.type).toBe('amp_knob');
    expect(decodedFromPayload.slotId).toBe('amp');
    expect(decodedFromPayload.paramIndex).toBe(0);
    expect(decodedFromPayload.value).toBeCloseTo(0.5, 2);
  });

  it('should correctly decode Slot Bypass / Enable event from raw frame and sliced payload', () => {
    // Slot Bypass: 0x0A (len: 10) + 0xC0 + 08 01 18 04 20 01 (6B) + 1F 00 00 00 (4B)
    const rawBypassPacket = new Uint8Array([
      0x0A, 0xC0, 0x08, 0x01, 0x18, 0x04, 0x20, 0x01, 0x1F, 0x00, 0x00, 0x00,
    ]);

    // 1. Raw frame decode
    const decodedRaw = NotifyDecoder.decode(rawBypassPacket);
    expect(decodedRaw.type).toBe('slot_bypass');
    expect(decodedRaw.slotId).toBe('pre_fx_1');
    expect(decodedRaw.isBypassed).toBe(true);

    // 2. Framed payload decode
    const packets = framer.pushChunk(rawBypassPacket);
    expect(packets.length).toBe(1);

    const decodedPayload = NotifyDecoder.decode(packets[0].payload);
    expect(decodedPayload.type).toBe('slot_bypass');
    expect(decodedPayload.slotId).toBe('pre_fx_1');
    expect(decodedPayload.isBypassed).toBe(true);
  });

  it('should correctly decode Preset Change notification', () => {
    // Preset Change -> 12 (0x0C): 0x08 (len: 8) + 0xC0 + 08 02 10 0C (4B) + 1B 00 00 00 (4B)
    const rawPresetPacket = new Uint8Array([
      0x08, 0xC0, 0x08, 0x02, 0x10, 0x0C, 0x1B, 0x00, 0x00, 0x00,
    ]);

    const decoded = NotifyDecoder.decode(rawPresetPacket);
    expect(decoded.type).toBe('preset_change');
    expect(decoded.presetIndex).toBe(12);

    const packets = framer.pushChunk(rawPresetPacket);
    expect(packets.length).toBe(1);
    const decodedPayload = NotifyDecoder.decode(packets[0].payload);
    expect(decodedPayload.type).toBe('preset_change');
    expect(decodedPayload.presetIndex).toBe(12);
  });

  it('should correctly decode Continuous FX Parameter float value', () => {
    // FX ModelSlot 0x00, Param 1, Float32 0.75
    // Content: 08 01 18 00 20 01 2D [float4] (11B) + 63 00 00 00 (4B) = 15B (0x0F)
    const floatBytes = new Uint8Array(4);
    new DataView(floatBytes.buffer).setFloat32(0, 0.75, true);

    const rawFxPacket = new Uint8Array([
      0x0F, 0xC0, 0x08, 0x01, 0x18, 0x00, 0x20, 0x01, 0x2D,
      floatBytes[0], floatBytes[1], floatBytes[2], floatBytes[3],
      0x63, 0x00, 0x00, 0x00,
    ]);

    const decodedRaw = NotifyDecoder.decode(rawFxPacket);
    expect(decodedRaw.type).toBe('fx_param');
    expect(decodedRaw.slotId).toBe('pre_fx_1');
    expect(decodedRaw.paramIndex).toBe(1);
    expect(decodedRaw.value).toBeCloseTo(0.75, 2);

    const packets = framer.pushChunk(rawFxPacket);
    expect(packets.length).toBe(1);
    const decodedPayload = NotifyDecoder.decode(packets[0].payload);
    expect(decodedPayload.type).toBe('fx_param');
    expect(decodedPayload.slotId).toBe('pre_fx_1');
    expect(decodedPayload.paramIndex).toBe(1);
    expect(decodedPayload.value).toBeCloseTo(0.75, 2);
  });
});
