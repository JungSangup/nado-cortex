import { NexfootEvent } from '../midi/NexfootParser';
import { RateLimiter } from './RateLimiter';
import { useAppStore } from './store';
import { NanoCortexProtocol, AMP_KNOB_IDS } from '../bluetooth/NanoCortexProtocol';
import { CORTEX_SLOT_CONFIGS, DEVICE_CATALOG } from './DeviceCatalog';
import { dynamicPagingRouter } from './DynamicPagingRouter';
import { midiLearnEngine } from './MidiLearnEngine';
import { expressionRouter } from './ExpressionRouter';
import { NotifyDecoder } from '../bluetooth/NotifyDecoder';
import { CortexSlotId } from '../types';

export interface BridgeRouterConfig {
  throttleIntervalMs?: number;
  onSendRawBlePacket?: (packet: Uint8Array) => Promise<boolean> | boolean;
}

export class BridgeRouter {
  private rateLimiter: RateLimiter;
  private onSendRawBlePacket?: (packet: Uint8Array) => Promise<boolean> | boolean;

  constructor(config: BridgeRouterConfig = {}) {
    this.rateLimiter = new RateLimiter(config.throttleIntervalMs ?? 30);
    this.onSendRawBlePacket = config.onSendRawBlePacket;

    // Connect Expression Router callback
    expressionRouter.setSendParamCallback((slotId, paramIndex, value) => {
      this.updateSlotParameter(slotId, paramIndex, value);
    });
  }

  public setBleSender(sender: (packet: Uint8Array) => Promise<boolean> | boolean): void {
    this.onSendRawBlePacket = sender;
  }

  /**
   * Handles incoming reverse notification from Nano Cortex c305
   */
  public handleNotifyPacket(rawOrPayload: Uint8Array): void {
    const store = useAppStore.getState();
    const decoded = NotifyDecoder.decode(rawOrPayload);
    const hex = Array.from(rawOrPayload)
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');

    let desc = '알 수 없는 패킷';
    if (decoded.type === 'amp_knob') {
      desc = `앰프 노브 P${decoded.paramIndex}: ${Math.round((decoded.value ?? 0) * 100)}%`;
    } else if (decoded.type === 'slot_bypass') {
      desc = `슬롯 ${decoded.slotId}: ${decoded.isBypassed ? 'BYPASS' : 'ACTIVE'}`;
    } else if (decoded.type === 'preset_change') {
      desc = `프리셋 전환 -> ${decoded.presetIndex}`;
    } else if (decoded.type === 'fx_param') {
      desc = `FX ${decoded.slotId} P${decoded.paramIndex}: ${Math.round((decoded.value ?? 0) * 100)}%`;
    }

    store.recordBleRx(desc, hex);

    if (decoded.type !== 'unknown') {
      NotifyDecoder.applyToStore(decoded);
      store.addLog({
        direction: 'ble_in',
        source: 'REVERSE_SYNC',
        message: `Synced ${decoded.type}: ${desc}`,
        rawBytes: Array.from(rawOrPayload),
      });
    }
  }

  /**
   * Switches Nano Cortex preset (0 ~ 63)
   */
  public changePreset(presetIndex: number): void {
    const store = useAppStore.getState();
    const clamped = Math.max(0, Math.min(63, Math.round(presetIndex)));
    store.setCurrentPresetIndex(clamped);

    const packet = NanoCortexProtocol.buildPresetChangePacket(clamped);
    this.sendBlePacket(packet, `Preset Change -> ${clamped + 1} (${store.currentPresetName})`);
  }

  /**
   * Triggers Tap Tempo transmission (CC#42 / BLE packet)
   */
  public triggerTapTempo(): void {
    const store = useAppStore.getState();
    const bpm = store.bpm;
    const packet = new Uint8Array([0x06, 0xC0, 0x08, 0x04, 0x10, bpm, 0x2A, 0x00, 0x00, 0x00]);
    this.sendBlePacket(packet, `Tap Tempo (${bpm} BPM)`);
  }

  /**
   * Toggles Tuner mode (CC#43 / BLE packet)
   */
  public toggleTuner(): void {
    const store = useAppStore.getState();
    const active = store.isTuning;
    const packet = new Uint8Array([0x06, 0xC0, 0x08, 0x05, 0x10, active ? 0x01 : 0x00, 0x2B, 0x00, 0x00, 0x00]);
    this.sendBlePacket(packet, `Tuner Mode: ${active ? 'ON (Mute)' : 'OFF'}`);
  }

  /**
   * Changes device/effect model on a slot and sends 0x88 BLE packet
   */
  public changeSlotModel(slotId: CortexSlotId, modelId: string): void {
    const store = useAppStore.getState();
    const cfg = CORTEX_SLOT_CONFIGS[slotId];
    const model = DEVICE_CATALOG[modelId];
    if (!cfg || !model) return;

    store.setSlotModel(slotId, modelId);
    store.addLog({
      direction: 'core',
      source: 'ROUTER',
      message: `Changed Slot ${cfg.name} Model -> ${model.name}`,
    });

    const packet = NanoCortexProtocol.buildDeviceModelChangePacket(cfg.modelSlot, modelId);
    this.sendBlePacket(packet, `Change Model [Slot ${cfg.name}: ${model.name}]`);
  }

  /**
   * Directly sets a parameter value from UI, rotary, or EXP pedal
   */
  public updateSlotParameter(slotId: CortexSlotId, paramIndex: number, normalizedValue: number): void {
    const store = useAppStore.getState();
    const cfg = CORTEX_SLOT_CONFIGS[slotId];
    if (!cfg) return;

    const clamped = Math.max(0, Math.min(1.0, normalizedValue));
    store.updateSlotParamValue(slotId, paramIndex, clamped);

    this.rateLimiter.execute(`${slotId}_${paramIndex}`, () => {
      let packet: Uint8Array | null = null;

      if (slotId === 'amp') {
        const knobIds = [AMP_KNOB_IDS.gain, AMP_KNOB_IDS.level, AMP_KNOB_IDS.bass, AMP_KNOB_IDS.mid, AMP_KNOB_IDS.treble];
        const knobId = knobIds[paramIndex] ?? paramIndex;
        packet = NanoCortexProtocol.buildAmpKnobPacket(knobId, clamped * 255);
      } else {
        packet = NanoCortexProtocol.buildFXParamPacket(cfg.modelSlot, paramIndex, clamped);
      }

      if (packet) {
        this.sendBlePacket(packet, `Param ${cfg.name} [P${paramIndex}] ${(clamped * 100).toFixed(0)}%`);
      }
    });
  }

  /**
   * Toggles a slot bypass state and transmits the real BLE packet to Nano Cortex.
   */
  public toggleSlot(slotId: CortexSlotId): void {
    const store = useAppStore.getState();
    const slot = store.cortexSlots.find((s) => s.slotId === slotId);
    if (!slot) return;

    const nextActiveState = slot.isBypassed;
    store.toggleSlotBypass(slotId);

    store.addLog({
      direction: 'core',
      source: 'ROUTER',
      message: `Toggled Slot ${slot.name} -> ${nextActiveState ? 'ON' : 'BYPASS'}`,
    });

    const cfg = CORTEX_SLOT_CONFIGS[slotId];
    if (!cfg) return;

    let rawPacket: Uint8Array | null = null;

    if (slotId === 'amp') {
      rawPacket = NanoCortexProtocol.buildCaptureSlotPacket(nextActiveState ? 1 : 0);
    } else if (slotId === 'cab') {
      rawPacket = NanoCortexProtocol.buildCabSlotPacket(nextActiveState ? 1 : 0);
    } else {
      rawPacket = NanoCortexProtocol.buildFXBlockEnablePacket(cfg.enableSlot, nextActiveState);
    }

    if (rawPacket) {
      this.sendBlePacket(rawPacket, `Slot ${slot.name} ${nextActiveState ? 'ON' : 'BYPASS'}`);
    }
  }

  /**
   * Sets a slot to explicitly ON (active) or OFF (bypassed) and transmits the real BLE packet.
   * Directly synchronizes with Nexfoot latching footswitch state (Val 127 = ON, Val 0 = OFF).
   */
  public setSlotActive(slotId: CortexSlotId, isActive: boolean): void {
    const store = useAppStore.getState();
    const slot = store.cortexSlots.find((s) => s.slotId === slotId);
    if (!slot) return;

    // In CortexSlotState, isBypassed === true means OFF, false means ON
    const targetBypass = !isActive;
    store.setSlotBypass(slotId, targetBypass);

    store.addLog({
      direction: 'core',
      source: 'ROUTER',
      message: `Sync Slot ${slot.name} -> ${isActive ? 'ON' : 'BYPASS'}`,
    });

    const cfg = CORTEX_SLOT_CONFIGS[slotId];
    if (!cfg) return;

    let rawPacket: Uint8Array | null = null;
    if (slotId === 'amp') {
      rawPacket = NanoCortexProtocol.buildCaptureSlotPacket(isActive ? 1 : 0);
    } else if (slotId === 'cab') {
      rawPacket = NanoCortexProtocol.buildCabSlotPacket(isActive ? 1 : 0);
    } else {
      rawPacket = NanoCortexProtocol.buildFXBlockEnablePacket(cfg.enableSlot, isActive);
    }

    if (rawPacket) {
      this.sendBlePacket(rawPacket, `Slot ${slot.name} ${isActive ? 'ON' : 'BYPASS'}`);
    }
  }

  /**
   * Handles expression pedal MIDI CC:1
   */
  public handleExpressionEvent(ccValue: number): void {
    expressionRouter.handleExpressionMidi(ccValue);
  }

  /**
   * Main routing handler for incoming Nexfoot MIDI events
   */
  public handleNexfootEvent(event: NexfootEvent): void {
    const store = useAppStore.getState();

    // 1. If MIDI Learn is active, check if consumed
    if (store.midiLearnState.active) {
      const channel = 1;
      const cc = event.rawCcOrNote;
      const val = event.type === 'push' ? (event.isPushed ? 127 : 0) : (event.rotateValue ?? (event.step === 1 ? 0 : 1));
      const consumed = midiLearnEngine.handleMidiMessage(channel, cc, val);
      if (consumed) return;
    }

    // 2. Handle Footswitch Push
    if (event.type === 'push') {
      const isPushed = !!event.isPushed;
      store.updateNexfootPush(event.encoderId, isPushed);

      store.addLog({
        direction: 'midi_in',
        source: 'NEXFOOT',
        message: `SW${event.encoderId} ${isPushed ? 'ON (127)' : 'OFF (0)'} (CC:${event.rawCcOrNote})`,
      });

      this.handlePushAction(event.encoderId, isPushed);
    } 
    // 3. Handle Rotary Rotate
    else if (event.type === 'rotate') {
      let nextRotVal = event.rotateValue ?? 0;
      if (event.isRelative) {
        const curRot = store.nexfootStates[event.encoderId]?.rotateValue ?? 64;
        const tick = (event.step ?? 1) * 1;
        nextRotVal = Math.max(0, Math.min(127, curRot + tick));
      }
      store.updateNexfootRotate(event.encoderId, nextRotVal);

      this.handleRotateAction(event.encoderId, event);
    }
  }

  private handlePushAction(encoderId: number, isPushed: boolean): void {
    const store = useAppStore.getState();
    const swKey = `sw${encoderId}` as 'sw1' | 'sw2' | 'sw3' | 'sw4';
    const binding = store.activeProfile.bindings.find((b) => b.swId === swKey && b.type === 'push');

    if (binding) {
      if (binding.targetType === 'page_nav') {
        // Page Navigation only advances on initial press
        if (isPushed) {
          store.nextParamPage();
          store.addLog({
            direction: 'core',
            source: 'ROUTER',
            message: `Paging: Switched to Page ${store.paramPageIndex + 1}`,
          });
        }
        return;
      } else if (binding.targetType === 'slot_toggle' && binding.targetSlotId) {
        // Directly synchronize with Nexfoot latch switch: Val 127 = ON, Val 0 = OFF
        this.setSlotActive(binding.targetSlotId, isPushed);
        return;
      }
    }

    // Fallback default push behavior:
    // SW1 -> Pre-FX 1, SW2 -> Pre-FX 2, SW3 -> Post-FX 1 (Direct Sync)
    if (encoderId === 1) this.setSlotActive('pre_fx_1', isPushed);
    else if (encoderId === 2) this.setSlotActive('pre_fx_2', isPushed);
    else if (encoderId === 3) this.setSlotActive('post_fx_1', isPushed);
    else if (encoderId === 4) {
      if (isPushed) {
        if (store.setlistMode) {
          store.nextSetlistSong();
          this.changePreset(store.currentPresetIndex);
        } else {
          store.nextParamPage();
        }
      }
    }
  }

  private handleRotateAction(encoderId: number, event: NexfootEvent): void {
    const store = useAppStore.getState();
    const swKey = `sw${encoderId}` as 'sw1' | 'sw2' | 'sw3' | 'sw4';
    const binding = store.activeProfile.bindings.find((b) => b.swId === swKey && b.type === 'rotate');

    const effectiveSlotId = binding?.targetSlotId || store.selectedSlotId;
    const pageIndex = store.paramPageIndex;
    const targetParamIdx =
      binding?.targetSlotId && binding?.targetParamIndex !== undefined
        ? binding.targetParamIndex
        : pageIndex * 4 + (encoderId - 1);

    const slot = store.cortexSlots.find((s) => s.slotId === effectiveSlotId);
    const params = dynamicPagingRouter.getParametersForSlot(effectiveSlotId, slot?.modelId);
    const paramDef = params[targetParamIdx];

    if (!paramDef) {
      store.addLog({
        direction: 'core',
        source: 'ROUTER',
        message: `SW${encoderId} Rotated (No param assigned on page ${pageIndex + 1})`,
      });
      return;
    }

    let delta = 0;
    let nextNormVal = 0.5;

    if (event.isRelative) {
      // Rotate 1칸 당 파라미터 값 1% (0.01) 정확히 증감
      delta = (event.step ?? 1) * 0.01;
      nextNormVal = dynamicPagingRouter.adjustParameterValue(effectiveSlotId, paramDef.paramIndex, delta);
    } else {
      nextNormVal = (event.rotateValue ?? 0) / 127.0;
      dynamicPagingRouter.setParameterValue(effectiveSlotId, paramDef.paramIndex, nextNormVal);
    }

    this.updateSlotParameter(effectiveSlotId, paramDef.paramIndex, nextNormVal);
  }

  private sendBlePacket(packet: Uint8Array, description: string): void {
    const store = useAppStore.getState();
    const hex = Array.from(packet).map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

    store.recordBleTx(description);
    store.addLog({
      direction: 'ble_out',
      source: 'BLE_MANAGER',
      message: `TX ${description}: [${hex}]`,
      rawBytes: Array.from(packet),
    });

    if (this.onSendRawBlePacket) {
      this.onSendRawBlePacket(packet);
    }
  }
}
