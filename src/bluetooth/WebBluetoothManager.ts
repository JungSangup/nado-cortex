import { PacketFramer, FramedPacket } from './PacketFramer';

export interface BluetoothManagerCallbacks {
  onStatusChange: (status: 'disconnected' | 'connecting' | 'connected' | 'error', deviceName?: string) => void;
  onPacketReceived: (packet: FramedPacket) => void;
  onError: (error: Error) => void;
}

export class WebBluetoothManager {
  // Official Nano Cortex BLE UUIDs
  public static readonly SERVICE_UUIDS = [
    '0000a002-0000-1000-8000-00805f9b34fb',
    '0000a003-0000-1000-8000-00805f9b34fb',
  ];
  public static readonly C304_UUID = '0000c304-0000-1000-8000-00805f9b34fb';
  public static readonly C305_UUID = '0000c305-0000-1000-8000-00805f9b34fb';

  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private notifyCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  
  private framer = new PacketFramer();
  private callbacks: BluetoothManagerCallbacks;

  constructor(callbacks: BluetoothManagerCallbacks) {
    this.callbacks = callbacks;
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      this.callbacks.onError(new Error('Web Bluetooth is not supported in this browser.'));
      return false;
    }

    try {
      this.callbacks.onStatusChange('connecting');

      // Request device with Nano Cortex specific optionalServices
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: WebBluetoothManager.SERVICE_UUIDS,
      });

      this.device.addEventListener('gattserverdisconnected', this.handleDisconnected);

      if (!this.device.gatt) {
        throw new Error('GATT server not found on device.');
      }

      this.server = await this.device.gatt.connect();

      this.writeCharacteristic = null;
      this.notifyCharacteristic = null;

      // Enumerate A002 / A003 services to find C304 and C305 characteristics
      for (const serviceUuid of WebBluetoothManager.SERVICE_UUIDS) {
        try {
          const service = await this.server.getPrimaryService(serviceUuid);
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            const uuid = char.uuid.toLowerCase();
            if (uuid === WebBluetoothManager.C304_UUID || uuid.includes('c304')) {
              this.writeCharacteristic = char;
            }
            if (uuid === WebBluetoothManager.C305_UUID || uuid.includes('c305')) {
              this.notifyCharacteristic = char;
            }
          }
        } catch {
          // Continue to next service if this one is not available
        }
      }

      if (!this.writeCharacteristic || !this.notifyCharacteristic) {
        throw new Error(
          `Nano Cortex characteristics missing (C304 Write: ${!!this.writeCharacteristic}, C305 Notify: ${!!this.notifyCharacteristic})`
        );
      }

      await this.notifyCharacteristic.startNotifications();
      this.notifyCharacteristic.addEventListener(
        'characteristicvaluechanged',
        this.handleCharacteristicValueChanged
      );

      const deviceName = this.device.name || 'Nano Cortex';
      this.callbacks.onStatusChange('connected', deviceName);
      return true;
    } catch (err: unknown) {
      this.callbacks.onStatusChange('error');
      const error = err instanceof Error ? err : new Error(String(err));
      this.callbacks.onError(error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.notifyCharacteristic) {
      try {
        await this.notifyCharacteristic.stopNotifications();
        this.notifyCharacteristic.removeEventListener(
          'characteristicvaluechanged',
          this.handleCharacteristicValueChanged
        );
      } catch {
        // Ignore during disconnect
      }
    }

    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
    }

    this.device = null;
    this.server = null;
    this.writeCharacteristic = null;
    this.notifyCharacteristic = null;
    this.framer.reset();
    this.callbacks.onStatusChange('disconnected');
  }

  private writeQueue: Promise<void> = Promise.resolve();

  public async sendRawPacket(rawPacket: Uint8Array): Promise<boolean> {
    if (!this.writeCharacteristic) {
      return false;
    }

    const run = async () => {
      if (!this.writeCharacteristic) return;
      const buffer = rawPacket.buffer.slice(rawPacket.byteOffset, rawPacket.byteOffset + rawPacket.byteLength) as ArrayBuffer;
      if (this.writeCharacteristic.writeValueWithResponse) {
        await this.writeCharacteristic.writeValueWithResponse(buffer);
      } else {
        await this.writeCharacteristic.writeValue(buffer);
      }
    };

    try {
      this.writeQueue = this.writeQueue.then(run, run);
      await this.writeQueue;
      return true;
    } catch (err) {
      this.callbacks.onError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  }

  public async sendCommand(messageType: number, payload: Uint8Array): Promise<boolean> {
    const packet = this.framer.encode(messageType, payload);
    return this.sendRawPacket(packet);
  }

  private handleCharacteristicValueChanged = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;

    const chunk = new Uint8Array(target.value.buffer);
    const packets = this.framer.pushChunk(chunk);
    for (const packet of packets) {
      this.callbacks.onPacketReceived(packet);
    }
  };

  private handleDisconnected = () => {
    this.callbacks.onStatusChange('disconnected');
    this.writeCharacteristic = null;
    this.notifyCharacteristic = null;
    this.framer.reset();
  };
}
