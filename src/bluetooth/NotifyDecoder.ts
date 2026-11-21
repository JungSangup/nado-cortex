import { CortexSlotId } from '../types';
import { useAppStore } from '../core/store';
import { CORTEX_SLOT_CONFIGS } from '../core/DeviceCatalog';

export interface DecodedNotifyEvent {
  type: 'amp_knob' | 'slot_bypass' | 'preset_change' | 'fx_param' | 'unknown';
  slotId?: CortexSlotId;
  paramIndex?: number;
  value?: number;
  presetIndex?: number;
  isBypassed?: boolean;
}

export class NotifyDecoder {
  /**
   * Decodes raw bytes received from Nano Cortex c305 characteristic
   * Supports both raw framed packets ([len, 0xC0, payload...]) and sliced payload packets.
   */
  public static decode(bytes: Uint8Array): DecodedNotifyEvent {
    if (!bytes || bytes.length < 3) {
      return { type: 'unknown' };
    }

    // Determine payload offset based on 0xC0 delimiter if present
    const c0Index = bytes.indexOf(0xC0);
    const p = c0Index !== -1 ? bytes.subarray(c0Index + 1) : bytes;

    // 1. Amp Front Knob Event:
    // Raw: 0A/0B C0 18 <knobId> 20 <value> 28 00 1A 00 00 00
    // Payload: 18 <knobId> 20 <value> ...
    if (p.length >= 4 && p[0] === 0x18 && p[2] === 0x20) {
      const knobId = p[1];
      const val0to255 = p[3];
      const normalized = Math.max(0, Math.min(1.0, val0to255 / 255.0));

      return {
        type: 'amp_knob',
        slotId: 'amp',
        paramIndex: knobId,
        value: normalized,
      };
    }

    // 2. Continuous FX Param Event (Check this BEFORE slot_bypass because header prefix 08 01 18 is shared):
    // Raw: 0F C0 08 01 18 <modelSlot> 20 <paramIndex> 2D <float32LE> 63 00 00 00
    // Payload: 08 01 18 <modelSlot> 20 <paramIndex> 2D <float32LE> ...
    if (
      p.length >= 11 &&
      p[0] === 0x08 &&
      p[1] === 0x01 &&
      p[2] === 0x18 &&
      p[4] === 0x20 &&
      p[6] === 0x2D
    ) {
      const modelSlot = p[3];
      const paramIndex = p[5];
      const dv = new DataView(p.buffer, p.byteOffset + 7, 4);
      const floatVal = Math.max(0, Math.min(1.0, dv.getFloat32(0, true)));

      const matchedSlot = Object.values(CORTEX_SLOT_CONFIGS).find(
        (cfg) => cfg.modelSlot === modelSlot
      );

      return {
        type: 'fx_param',
        slotId: matchedSlot?.slotId,
        paramIndex,
        value: floatVal,
      };
    }

    // 3. Slot Bypass/Enable Event:
    // Raw: 0A C0 08 01 18 <enableSlot> 20 <00:ON / 01:OFF> 1F 00 00 00
    // Payload: 08 01 18 <enableSlot> 20 <00:ON / 01:OFF> ...
    if (p.length >= 6 && p[0] === 0x08 && p[1] === 0x01 && p[2] === 0x18 && p[4] === 0x20) {
      const enableSlot = p[3];
      const isOff = p[5] === 0x01; // 0x01 is Bypass/OFF, 0x00 is ON

      const matchedSlot = Object.values(CORTEX_SLOT_CONFIGS).find(
        (cfg) => cfg.enableSlot === enableSlot
      );

      return {
        type: 'slot_bypass',
        slotId: matchedSlot?.slotId,
        isBypassed: isOff,
      };
    }

    // 4. Preset Change Event:
    // Raw: 06 C0 08 02 10 <preset> 1B 00 00 00
    // Payload: 08 02 10 <preset> ...
    if (p.length >= 4 && p[0] === 0x08 && p[1] === 0x02 && p[2] === 0x10) {
      const presetIndex = p[3];
      return {
        type: 'preset_change',
        presetIndex,
      };
    }

    return { type: 'unknown' };
  }

  /**
   * Applies the decoded event directly to Zustand App Store
   */
  public static applyToStore(event: DecodedNotifyEvent): void {
    const store = useAppStore.getState();

    switch (event.type) {
      case 'amp_knob':
      case 'fx_param': {
        if (event.slotId && event.paramIndex !== undefined && event.value !== undefined) {
          store.updateSlotParamValue(event.slotId, event.paramIndex, event.value);
        }
        break;
      }

      case 'slot_bypass': {
        if (event.slotId && event.isBypassed !== undefined) {
          store.setSlotBypass(event.slotId, event.isBypassed);
        }
        break;
      }

      case 'preset_change': {
        if (event.presetIndex !== undefined) {
          store.setCurrentPresetIndex(event.presetIndex);
        }
        break;
      }
    }
  }
}
