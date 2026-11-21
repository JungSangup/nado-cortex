import { useEffect, useRef } from 'react';
import { useAppStore } from './core/store';
import { Header } from './ui/Header';
import { CortexMonitorPanel } from './ui/CortexMonitorPanel';
import { NexfootVirtualPanel } from './ui/NexfootVirtualPanel';
import { EventLogConsole } from './ui/EventLogConsole';
import { BridgeRouter } from './core/BridgeRouter';
import { WebBluetoothManager } from './bluetooth/WebBluetoothManager';
import { WebMidiManager } from './midi/WebMidiManager';
import { MockBluetoothDevice } from './mocks/MockBluetoothDevice';
import { MockMidiAccess } from './mocks/MockMidiAccess';
import { NexfootEncoderId, CortexSlotId } from './types';
import { NexfootParser } from './midi/NexfootParser';
import { midiLearnEngine } from './core/MidiLearnEngine';

export default function App() {
  const { isMockMode, setBleStatus, setMidiStatus, addLog, showNexfootPanel, viewMode, activeProfile } = useAppStore();

  const bridgeRouterRef = useRef<BridgeRouter | null>(null);
  const bleManagerRef = useRef<WebBluetoothManager | null>(null);
  const midiManagerRef = useRef<WebMidiManager | null>(null);
  const mockBleRef = useRef<MockBluetoothDevice | null>(null);
  const mockMidiRef = useRef<MockMidiAccess | null>(null);

  useEffect(() => {
    // 1. Initialize Mock Devices
    mockBleRef.current = new MockBluetoothDevice();
    mockMidiRef.current = new MockMidiAccess();

    // 2. Initialize Bridge Router
    const router = new BridgeRouter({
      throttleIntervalMs: 30,
      onSendRawBlePacket: (packet) => {
        if (useAppStore.getState().isMockMode) {
          mockBleRef.current?.receiveCommand(0, packet);
          return true;
        } else {
          return bleManagerRef.current?.sendRawPacket(packet) ?? false;
        }
      },
    });
    bridgeRouterRef.current = router;

    // 3. Initialize Web Bluetooth Manager
    bleManagerRef.current = new WebBluetoothManager({
      onStatusChange: (status, deviceName) => setBleStatus(status, deviceName),
      onPacketReceived: (packet) => {
        addLog({
          direction: 'ble_in',
          source: 'NANO_CORTEX',
          message: `Received Type:0x${packet.messageType.toString(16)} Len:${packet.payload.length}B`,
          rawBytes: Array.from(packet.payload),
        });

        // Trigger Reverse Synchronization Decoder (raw frame preferred)
        router.handleNotifyPacket(packet.raw || packet.payload);
      },
      onError: (err) => {
        addLog({
          direction: 'error',
          source: 'BLE_MANAGER',
          message: err.message,
        });
      },
    });

    // 4. Initialize Web MIDI Manager
    midiManagerRef.current = new WebMidiManager({
      onStatusChange: (status, deviceName) => setMidiStatus(status, deviceName),
      onNexfootEvent: (event) => {
        router.handleNexfootEvent(event);
      },
      onRawMidiMessage: (data) => {
        if (data.length >= 3) {
          const status = data[0] & 0xF0;
          const ch = (data[0] & 0x0F) + 1;
          const cc = data[1];
          const val = data[2];

          if (status === 0xB0) {
            addLog({
              direction: 'midi_in',
              source: 'RAW_MIDI',
              message: `Raw CC [Ch:${ch} CC:${cc} Val:${val}]`,
            });

            // Handle Expression Pedal:
            // Only process if MIDI Learn is inactive, profile explicitly defines 'exp' binding,
            // and this CC is NOT assigned to any SW1~SW4 knob (rotate) or push switch.
            const storeState = useAppStore.getState();
            if (!storeState.midiLearnState.active) {
              const expBinding = storeState.activeProfile.bindings.find((b) => b.swId === 'exp');
              const isEncoderCc = storeState.activeProfile.bindings.some(
                (b) => b.swId !== 'exp' && b.ccNumber === cc
              );

              if (expBinding && expBinding.ccNumber === cc && !isEncoderCc) {
                router.handleExpressionEvent(val);
              }
            }

            // Feed to MidiLearnEngine if active
            midiLearnEngine.handleMidiMessage(ch, cc, val);
          }
        }
      },
      onError: (err) => {
        addLog({
          direction: 'error',
          source: 'MIDI_MANAGER',
          message: err.message,
        });
      },
    });

    // 5. Connect Mocks by default in mock mode
    if (useAppStore.getState().isMockMode) {
      mockBleRef.current.connect();
      mockMidiRef.current.connect((data) => {
        const parser = new NexfootParser();
        const event = parser.parse(data);
        if (event) {
          router.handleNexfootEvent(event);
        }
      });
    }

    return () => {
      mockBleRef.current?.disconnect();
      mockMidiRef.current?.disconnect();
      bleManagerRef.current?.disconnect();
      midiManagerRef.current?.disconnect();
    };
  }, [setBleStatus, setMidiStatus, addLog]);

  // Synchronize Nexfoot Parser when Active Profile changes
  useEffect(() => {
    if (activeProfile && midiManagerRef.current) {
      midiManagerRef.current.syncFromProfile(activeProfile.bindings);
    }
  }, [activeProfile]);

  // Mode Switch Handler
  useEffect(() => {
    if (isMockMode) {
      bleManagerRef.current?.disconnect();
      midiManagerRef.current?.disconnect();
      mockBleRef.current?.connect();
      mockMidiRef.current?.connect((data) => {
        const parser = new NexfootParser();
        const event = parser.parse(data);
        if (event) {
          bridgeRouterRef.current?.handleNexfootEvent(event);
        }
      });
    } else {
      mockBleRef.current?.disconnect();
      mockMidiRef.current?.disconnect();
    }
  }, [isMockMode]);

  const handleConnectBle = async () => {
    if (isMockMode) {
      mockBleRef.current?.connect();
    } else {
      const ok = await bleManagerRef.current?.connect();
      if (ok) {
        setTimeout(async () => {
          // Metadata request
          await bleManagerRef.current?.sendRawPacket(
            new Uint8Array([0x06, 0xC0, 0x08, 0x03, 0x01, 0x00, 0x00, 0x00])
          );
          // Current preset state request
          await bleManagerRef.current?.sendRawPacket(
            new Uint8Array([0x0C, 0xC0, 0x08, 0x03, 0x18, 0x01, 0x20, 0x01, 0x28, 0x01, 0x01, 0x00, 0x00, 0x00])
          );
        }, 150);
      }
    }
  };

  const handleDisconnectBle = () => {
    if (isMockMode) {
      mockBleRef.current?.disconnect();
    } else {
      bleManagerRef.current?.disconnect();
    }
  };

  const handleConnectMidi = async () => {
    if (isMockMode) {
      mockMidiRef.current?.connect((data) => {
        const parser = new NexfootParser();
        const event = parser.parse(data);
        if (event) {
          bridgeRouterRef.current?.handleNexfootEvent(event);
        }
      });
    } else {
      await midiManagerRef.current?.init();
    }
  };

  const handleDisconnectMidi = () => {
    if (isMockMode) {
      mockMidiRef.current?.disconnect();
    } else {
      midiManagerRef.current?.disconnect();
    }
  };

  const handleSimulateRotate = (id: NexfootEncoderId, value: number) => {
    if (isMockMode && mockMidiRef.current) {
      mockMidiRef.current.simulateRotate(id, value);
    }
  };

  const handleSimulatePush = (id: NexfootEncoderId, isPushed: boolean) => {
    if (isMockMode && mockMidiRef.current) {
      mockMidiRef.current.simulatePush(id, isPushed);
    }
  };

  const handleSimulateExp = (value: number) => {
    bridgeRouterRef.current?.handleExpressionEvent(value);
  };

  const handleToggleSlot = (slotId: CortexSlotId) => {
    bridgeRouterRef.current?.toggleSlot(slotId);
  };

  const handleChangePreset = (presetIndex: number) => {
    bridgeRouterRef.current?.changePreset(presetIndex);
  };

  const handleChangeModel = (slotId: CortexSlotId, modelId: string) => {
    bridgeRouterRef.current?.changeSlotModel(slotId, modelId);
  };

  const handleParamChange = (slotId: CortexSlotId, paramIndex: number, value: number) => {
    bridgeRouterRef.current?.updateSlotParameter(slotId, paramIndex, value);
  };

  const handleTapTempo = () => {
    bridgeRouterRef.current?.triggerTapTempo();
  };

  const handleToggleTuner = () => {
    bridgeRouterRef.current?.toggleTuner();
  };

  const handlePingPreset = () => {
    const cur = useAppStore.getState().currentPresetIndex;
    bridgeRouterRef.current?.changePreset(cur);
  };

  const handlePingToggleSlot = () => {
    bridgeRouterRef.current?.toggleSlot('pre_fx_1');
  };

  return (
    <div className="min-h-screen bg-cortex-dark text-cortex-text flex flex-col">
      <Header
        onConnectBle={handleConnectBle}
        onDisconnectBle={handleDisconnectBle}
        onConnectMidi={handleConnectMidi}
        onDisconnectMidi={handleDisconnectMidi}
      />

      {/* Main 3-Section Dashboard: 1. Nano Cortex -> 2. Livtra Nexfoot -> 3. Event Logs */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-5">
        {/* 1. 최상단: Nano Cortex 모니터 & 컨트롤러 (세트리스트, 튜너/템포, 슬롯 및 파라미터) */}
        <CortexMonitorPanel
          onToggleSlot={handleToggleSlot}
          onChangePreset={handleChangePreset}
          onChangeModel={handleChangeModel}
          onParamChange={handleParamChange}
          onTapTempo={handleTapTempo}
          onToggleTuner={handleToggleTuner}
          onPingPreset={handlePingPreset}
          onPingToggleSlot={handlePingToggleSlot}
        />

        {/* 2. 중단: Livtra Nexfoot 컨트롤러 (Live 모드에서는 숨김, Advanced 모드에서만 토글 가능) */}
        {viewMode !== 'live' && showNexfootPanel && (
          <NexfootVirtualPanel
            onSimulateRotate={handleSimulateRotate}
            onSimulatePush={handleSimulatePush}
            onSimulateExp={handleSimulateExp}
          />
        )}

        {/* 3. 최하단: 실시간 패킷 및 미디 이벤트 로그 콘솔 (Live 모드에서는 숨김) */}
        {viewMode !== 'live' && <EventLogConsole />}
      </main>

      {viewMode !== 'live' && (
        <footer className="border-t border-cortex-border py-3 px-6 text-center text-xs text-cortex-muted">
          Nado Cortex v0.0.6 • Spec-Driven Development • Built for Neural DSP Nano Cortex & Livtra Nexfoot
        </footer>
      )}
    </div>
  );
}
