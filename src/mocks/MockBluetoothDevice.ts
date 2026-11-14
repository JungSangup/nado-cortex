import { PacketFramer, FramedPacket } from '../bluetooth/PacketFramer';
import { useAppStore } from '../core/store';

export class MockBluetoothDevice {
  private isConnected = false;
  private framer = new PacketFramer();
  private onPacketCallback?: (packet: FramedPacket) => void;

  public connect(onPacketReceived?: (packet: FramedPacket) => void): boolean {
    this.isConnected = true;
    this.onPacketCallback = onPacketReceived;

    const store = useAppStore.getState();
    store.setBleStatus('connected', 'Nano Cortex (Virtual Mock)');
    store.addLog({
      direction: 'ble_in',
      source: 'MOCK_CORTEX',
      message: 'Virtual Nano Cortex Connected over BLE [c304/c305 Ready]',
    });

    return true;
  }

  public disconnect(): void {
    this.isConnected = false;
    const store = useAppStore.getState();
    store.setBleStatus('disconnected');
    store.addLog({
      direction: 'ble_in',
      source: 'MOCK_CORTEX',
      message: 'Virtual Nano Cortex Disconnected',
    });
  }

  public receiveCommand(messageType: number, payload: Uint8Array): void {
    if (!this.isConnected) return;

    const store = useAppStore.getState();

    // Simulate Nano Cortex internal reaction
    const packet = this.framer.encode(messageType, payload);
    store.addLog({
      direction: 'ble_in',
      source: 'MOCK_CORTEX',
      message: `ACK Command 0x${messageType.toString(16).padStart(8, '0')} (Len: ${payload.length}B)`,
      rawBytes: Array.from(packet),
    });

    if (this.onPacketCallback) {
      this.onPacketCallback({
        messageType,
        payload,
        raw: packet,
      });
    }
  }

  public get connected(): boolean {
    return this.isConnected;
  }
}
