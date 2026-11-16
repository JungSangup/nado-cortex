/**
 * Neural DSP Nano Cortex BLE Protocol Specification & Packet Builders
 * Reverse-engineered from official Cortex Cloud traffic.
 */

export const FX_BLOCK_CONFIG = {
  drive: { label: 'Pre FX 1 (Drive)', modelSlot: 0x00, enableSlot: 0x04 },
  fx1:   { label: 'Post FX 1',       modelSlot: 0x02, enableSlot: 0x06 },
  fx2:   { label: 'Post FX 2',       modelSlot: 0x03, enableSlot: 0x07 },
  fx3:   { label: 'Post FX 3',       modelSlot: 0x04, enableSlot: 0x08 },
};

export const AMP_KNOB_IDS = {
  gain: 0x00,
  level: 0x01,
  bass: 0x02,
  mid: 0x03,
  treble: 0x04,
};

export class NanoCortexProtocol {
  /**
   * Builds packet to enable/bypass an FX block (Pre/Post FX)
   * 0A C0 08 01 18 <enableSlot> 20 <00:ON / 01:OFF> 1F 00 00 00
   */
  public static buildFXBlockEnablePacket(enableSlot: number, enabled: boolean): Uint8Array {
    const value = enabled ? 0x00 : 0x01; // 0x00 is ON, 0x01 is OFF/Bypass
    return new Uint8Array([
      0x0A, 0xC0,
      0x08, 0x01,
      0x18, enableSlot,
      0x20, value,
      0x1F, 0x00, 0x00, 0x00,
    ]);
  }

  /**
   * Builds packet to bypass or select Capture/Amp slot
   * 08 C0 18 01 20 <slot 0:Bypass, 1~25:Slot> 1C 00 00 00
   */
  public static buildCaptureSlotPacket(slot: number): Uint8Array {
    return new Uint8Array([
      0x08, 0xC0,
      0x18, 0x01,
      0x20, slot,
      0x1C, 0x00, 0x00, 0x00,
    ]);
  }

  /**
   * Builds packet to bypass or select Cab/IR slot
   * 08 C0 18 03 20 <slot 0:Bypass, 1~5:Slot> 1C 00 00 00
   */
  public static buildCabSlotPacket(slot: number): Uint8Array {
    return new Uint8Array([
      0x08, 0xC0,
      0x18, 0x03,
      0x20, slot,
      0x1C, 0x00, 0x00, 0x00,
    ]);
  }

  /**
   * Builds packet to switch Nano Cortex Presets (0 ~ 63)
   * 06 C0 08 02 10 <preset 0~63> 1B 00 00 00
   */
  public static buildPresetChangePacket(presetIndex: number): Uint8Array {
    const clampedPreset = Math.max(0, Math.min(63, Math.round(presetIndex)));
    return new Uint8Array([
      0x06, 0xC0,
      0x08, 0x02,
      0x10, clampedPreset,
      0x1B, 0x00, 0x00, 0x00,
    ]);
  }

  /**
   * Builds packet to change device/effect model on a slot
   * [length] C0 18 <modelSlot> 20 <...modelIdBytes> 88 00 00 00
   */
  public static buildDeviceModelChangePacket(modelSlot: number, modelId: string): Uint8Array {
    const encoder = new TextEncoder();
    const idBytes = encoder.encode(modelId);
    const payloadLen = 3 + idBytes.length + 4; // 18 slot 20 idBytes + 88 00 00 00
    const packet = new Uint8Array(2 + payloadLen);

    packet[0] = payloadLen;
    packet[1] = 0xC0;
    packet[2] = 0x18;
    packet[3] = modelSlot;
    packet[4] = 0x20;
    packet.set(idBytes, 5);

    const suffixOffset = 5 + idBytes.length;
    packet[suffixOffset] = 0x88;
    packet[suffixOffset + 1] = 0x00;
    packet[suffixOffset + 2] = 0x00;
    packet[suffixOffset + 3] = 0x00;

    return packet;
  }

  /**
   * Builds packet to set front-panel Amp Knobs (Gain, Level, Bass, Mid, Treble)
   * 0B C0 18 <id> 20 <value varint 0~255> 28 00 1A 00 00 00
   */
  public static buildAmpKnobPacket(knobId: number, value0to255: number): Uint8Array {
    const clampedVal = Math.max(0, Math.min(255, Math.round(value0to255)));
    return new Uint8Array([
      0x0B, 0xC0,
      0x18, knobId,
      0x20, clampedVal,
      0x28, 0x00,
      0x1A, 0x00, 0x00, 0x00,
    ]);
  }

  /**
   * Builds packet to modulate continuous FX parameter (Float32 LE 0.0 ~ 1.0)
   * 0F C0 08 01 18 <modelSlot> 20 <paramIndex> 2D <float32LE> 63 00 00 00
   */
  public static buildFXParamPacket(modelSlot: number, paramIndex: number, normalizedValue: number): Uint8Array {
    const clamped = Math.max(0, Math.min(1.0, normalizedValue));
    const floatBytes = new Uint8Array(4);
    new DataView(floatBytes.buffer).setFloat32(0, clamped, true);

    return new Uint8Array([
      0x0F, 0xC0,
      0x08, 0x01,
      0x18, modelSlot,
      0x20, paramIndex,
      0x2D,
      floatBytes[0], floatBytes[1], floatBytes[2], floatBytes[3],
      0x63, 0x00, 0x00, 0x00,
    ]);
  }
}
