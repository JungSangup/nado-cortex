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
   */
  public static decode(payload: Uint8Array): DecodedNotifyEvent {
    if (payload.length < 4 || payload[1] !== 0xC0) {
      return { type: 'unknown' };
    }

    const typePrefix = payload[0];

    // 1. Amp Front Knob Event: 0B C0 18 <knobId> 20 <value> 28 00 1A 00 00 00
    if (typePrefix === 0x0B && payload[2] === 0x18 && payload[4] === 0x20) {
      const knobId = payload[3];
      const val0to255 = payload[5];
      const normalized = val0to255 / 255.0;

      return {
        type: 'amp_knob',
        slotId: 'amp',
        paramIndex: knobId,
        value: normalized,
      };
    }

    // 2. Slot Bypass/Enable Event: 0A C0 08 01 18 <enableSlot> 20 <00:ON / 01:OFF> 1F 00 00 00
    if (typePrefix === 0x0A && payload[2] === 0x08 && payload[4] === 0x18 && payload[6] === 0x20) {
      const enableSlot = payload[5];
      const isOff = payload[7] === 0x01; // 0x01 is Bypass/OFF, 0x00 is ON

      const matchedSlot = Object.values(CORTEX_SLOT_CONFIGS).find(
        (cfg) => cfg.enableSlot === enableSlot
      );

      return {
        type: 'slot_bypass',
        slotId: matchedSlot?.slotId,
        isBypassed: isOff,
      };
    }

    // 3. Preset Change Event: 06 C0 08 02 10 <preset> 1B 00 00 00
    if (typePrefix === 0x06 && payload[2] === 0x08 && payload[4] === 0x10) {
      const presetIndex = payload[5];
      return {
        type: 'preset_change',
        presetIndex,
      };
    }

    // 4. Continuous FX Param Event: 0F C0 08 01 18 <modelSlot> 20 <paramIndex> 2D <float32LE> ...
    if (typePrefix === 0x0F && payload[2] === 0x08 && payload[4] === 0x18 && payload[8] === 0x2D && payload.length >= 13) {
      const modelSlot = payload[5];
      const paramIndex = payload[7];
      const dv = new DataView(payload.buffer, payload.byteOffset + 9, 4);
      const floatVal = dv.getFloat32(0, true);

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
