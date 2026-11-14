import { useEffect, useRef } from 'react';
import { useAppStore } from './core/store';
import { Header } from './ui/Header';
import { NexfootVirtualPanel } from './ui/NexfootVirtualPanel';
import { CortexMonitorPanel } from './ui/CortexMonitorPanel';
import { EventLogConsole } from './ui/EventLogConsole';
import { BridgeRouter } from './core/BridgeRouter';
import { WebBluetoothManager } from './bluetooth/WebBluetoothManager';
import { WebMidiManager } from './midi/WebMidiManager';
import { MockBluetoothDevice } from './mocks/MockBluetoothDevice';
import { MockMidiAccess } from './mocks/MockMidiAccess';
import { NexfootEncoderId } from './types';
import { NexfootParser } from './midi/NexfootParser';

export default function App() {
  const { isMockMode, setBleStatus, setMidiStatus, addLog } = useAppStore();

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
          if (status === 0xB0) {
            addLog({
              direction: 'midi_in',
              source: 'RAW_MIDI',
              message: `Raw CC [Ch:${ch} CC:${data[1]} Val:${data[2]}]`,
            });
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
        // Request Nano Cortex current state and metadata over BLE
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

  return (
    <div className="min-h-screen bg-cortex-dark text-cortex-text flex flex-col">
      <Header
        onConnectBle={handleConnectBle}
        onDisconnectBle={handleDisconnectBle}
        onConnectMidi={handleConnectMidi}
        onDisconnectMidi={handleDisconnectMidi}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <NexfootVirtualPanel
          onSimulateRotate={handleSimulateRotate}
          onSimulatePush={handleSimulatePush}
        />

        <CortexMonitorPanel
          onToggleSlot={(slotIndex) => bridgeRouterRef.current?.toggleSlot(slotIndex)}
        />

        <EventLogConsole />
      </main>

      <footer className="border-t border-cortex-border py-4 px-6 text-center text-xs text-cortex-muted">
        Nado Cortex v0.0.1 • Spec-Driven Development • Built for Neural DSP Nano Cortex & Livtra Nexfoot
      </footer>
    </div>
  );
}
