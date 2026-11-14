import { NexfootEvent } from '../midi/NexfootParser';
import { RateLimiter } from './RateLimiter';
import { useAppStore } from './store';
import { NanoCortexProtocol, AMP_KNOB_IDS } from '../bluetooth/NanoCortexProtocol';

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
  }

  public setBleSender(sender: (packet: Uint8Array) => Promise<boolean> | boolean): void {
    this.onSendRawBlePacket = sender;
  }

  /**
   * Toggles a slot bypass state and transmits the real BLE packet to Nano Cortex.
   * Can be invoked from UI button clicks or footswitch push events.
   */
  public toggleSlot(slotIndex: number): void {
    const store = useAppStore.getState();
    const slot = store.cortexSlots.find((s) => s.slotIndex === slotIndex);
    if (!slot) return;

    const nextActiveState = slot.isBypassed; // Currently bypassed -> turn Active
    store.toggleSlotBypass(slotIndex);

    store.addLog({
      direction: 'core',
      source: 'ROUTER',
      message: `Toggled Slot ${slotIndex} (${slot.name}) -> ${nextActiveState ? 'ON' : 'BYPASS'}`,
    });

    let rawPacket: Uint8Array | null = null;

    // Slot 1: Pre FX 1 (Drive) -> enableSlot 0x04
    if (slotIndex === 1) {
      rawPacket = NanoCortexProtocol.buildFXBlockEnablePacket(0x04, nextActiveState);
    }
    // Slot 2: Capture / Amp -> slot 1 or 0
    else if (slotIndex === 2) {
      rawPacket = NanoCortexProtocol.buildCaptureSlotPacket(nextActiveState ? 1 : 0);
    }
    // Slot 3: Cab / IR -> slot 1 or 0
    else if (slotIndex === 3) {
      rawPacket = NanoCortexProtocol.buildCabSlotPacket(nextActiveState ? 1 : 0);
    }
    // Slot 4: Post FX 1 (Delay) -> enableSlot 0x06
    else if (slotIndex === 4) {
      rawPacket = NanoCortexProtocol.buildFXBlockEnablePacket(0x06, nextActiveState);
    }
    // Slot 5: Post FX 2 (Reverb) -> enableSlot 0x07
    else if (slotIndex === 5) {
      rawPacket = NanoCortexProtocol.buildFXBlockEnablePacket(0x07, nextActiveState);
    }

    if (rawPacket) {
      this.sendBlePacket(rawPacket, `Slot ${slotIndex} (${slot.name}) ${nextActiveState ? 'ON' : 'BYPASS'}`);
    }
  }

  /**
   * Main routing handler for incoming Nexfoot MIDI events
   */
  public handleNexfootEvent(event: NexfootEvent): void {
    const store = useAppStore.getState();
    const mapping = store.mappings[event.encoderId];

    if (!mapping) return;

    if (event.type === 'push') {
      store.updateNexfootPush(event.encoderId, !!event.isPushed);

      if (event.isPushed) {
        store.addLog({
          direction: 'midi_in',
          source: 'NEXFOOT',
          message: `SW${event.encoderId} Pushed (CC:${event.rawCcOrNote})`,
        });

        this.handlePushAction(mapping.pushAction);
      } else {
        store.addLog({
          direction: 'midi_in',
          source: 'NEXFOOT',
          message: `SW${event.encoderId} Released`,
        });
      }
    } else if (event.type === 'rotate') {
      let nextRotVal = event.rotateValue ?? 0;
      if (event.isRelative) {
        const curRot = store.nexfootStates[event.encoderId]?.rotateValue ?? 64;
        const tick = (event.step ?? 1) * 4; // 4 steps per tick (~3% gauge movement)
        nextRotVal = Math.max(0, Math.min(127, curRot + tick));
      }
      store.updateNexfootRotate(event.encoderId, nextRotVal);

      this.handleRotateAction(mapping.rotateAction, event);
    }
  }

  private handlePushAction(action: typeof useAppStore.getState.prototype.mappings[1]['pushAction']): void {
    switch (action.type) {
      case 'slot_bypass': {
        const slotIndex = action.slotIndex ?? 1;
        this.toggleSlot(slotIndex);
        break;
      }

      case 'tap_tempo': {
        const store = useAppStore.getState();
        store.addLog({
          direction: 'core',
          source: 'ROUTER',
          message: 'Tap Tempo Triggered',
        });
        break;
      }
    }
  }

  private handleRotateAction(action: typeof useAppStore.getState.prototype.mappings[1]['rotateAction'], event: NexfootEvent): void {
    const store = useAppStore.getState();

    switch (action.type) {
      case 'parameter': {
        if (!action.paramId) return;
        const paramId = action.paramId;

        // Calculate normalized 0.0 ~ 1.0 float value
        let normalizedValue: number;
        if (event.isRelative) {
          const current = store.cortexParameters[paramId]?.value ?? 0.5;
          const delta = (event.step ?? 1) * 0.02; // 2% per tick
          normalizedValue = Math.max(0, Math.min(1.0, current + delta));
        } else {
          normalizedValue = (event.rotateValue ?? 0) / 127.0;
        }

        // Throttle parameter updates via RateLimiter
        this.rateLimiter.execute(paramId, () => {
          store.updateParameterValue(paramId, normalizedValue);

          const param = store.cortexParameters[paramId];
          store.addLog({
            direction: 'core',
            source: 'ROUTER',
            message: `Param ${param?.name ?? paramId} -> ${(normalizedValue * 100).toFixed(1)}%`,
          });

          // Generate actual Nano Cortex BLE packet
          // 1) If it's Amp Gain / Level
          if (paramId === 'drive_gain') {
            const packet = NanoCortexProtocol.buildAmpKnobPacket(AMP_KNOB_IDS.gain, normalizedValue * 255);
            this.sendBlePacket(packet, `Amp Gain ${(normalizedValue * 100).toFixed(0)}%`);
          } else if (paramId === 'drive_level') {
            const packet = NanoCortexProtocol.buildAmpKnobPacket(AMP_KNOB_IDS.level, normalizedValue * 255);
            this.sendBlePacket(packet, `Amp Level ${(normalizedValue * 100).toFixed(0)}%`);
          } else if (paramId === 'delay_mix') {
            // Post FX 1 (modelSlot 0x02, paramIndex 0)
            const packet = NanoCortexProtocol.buildFXParamPacket(0x02, 0, normalizedValue);
            this.sendBlePacket(packet, `Delay Mix ${(normalizedValue * 100).toFixed(0)}%`);
          } else if (paramId === 'reverb_mix') {
            // Post FX 2 (modelSlot 0x03, paramIndex 0)
            const packet = NanoCortexProtocol.buildFXParamPacket(0x03, 0, normalizedValue);
            this.sendBlePacket(packet, `Reverb Mix ${(normalizedValue * 100).toFixed(0)}%`);
          }
        });
        break;
      }
    }
  }

  private sendBlePacket(packet: Uint8Array, description: string): void {
    const store = useAppStore.getState();
    const hex = Array.from(packet).map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

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
