import { DEFAULT_NEXFOOT_CONFIG, NexfootMidiConfig } from '../midi/NexfootParser';
import { useAppStore } from '../core/store';
import { NexfootEncoderId } from '../types';

export class MockMidiAccess {
  private isConnected = false;
  private config: NexfootMidiConfig;
  private onMidiDataCallback?: (data: Uint8Array) => void;

  constructor(config: NexfootMidiConfig = DEFAULT_NEXFOOT_CONFIG) {
    this.config = config;
  }

  public connect(onMidiData: (data: Uint8Array) => void): boolean {
    this.isConnected = true;
    this.onMidiDataCallback = onMidiData;

    const store = useAppStore.getState();
    store.setMidiStatus('connected', 'Livtra Nexfoot (Virtual Mock)');
    store.addLog({
      direction: 'midi_in',
      source: 'MOCK_NEXFOOT',
      message: 'Virtual Livtra Nexfoot Connected [4 Push-Rotary Ready]',
    });

    return true;
  }

  public disconnect(): void {
    this.isConnected = false;
    const store = useAppStore.getState();
    store.setMidiStatus('disconnected');
    store.addLog({
      direction: 'midi_in',
      source: 'MOCK_NEXFOOT',
      message: 'Virtual Livtra Nexfoot Disconnected',
    });
  }

  /**
   * Simulates turning a Nexfoot rotary encoder
   */
  public simulateRotate(encoderId: NexfootEncoderId, value: number): void {
    if (!this.isConnected || !this.onMidiDataCallback) return;

    const key = `sw${encoderId}` as keyof NexfootMidiConfig;
    const cc = this.config[key].rotateCc;
    const clampedVal = Math.max(0, Math.min(127, Math.round(value)));

    // MIDI CC Message: [0xB0 (Ch 1 CC), ccNumber, value]
    const midiMsg = new Uint8Array([0xB0, cc, clampedVal]);
    this.onMidiDataCallback(midiMsg);
  }

  /**
   * Simulates pressing/releasing a Nexfoot footswitch
   */
  public simulatePush(encoderId: NexfootEncoderId, isPushed: boolean): void {
    if (!this.isConnected || !this.onMidiDataCallback) return;

    const key = `sw${encoderId}` as keyof NexfootMidiConfig;
    const cc = this.config[key].pushCc;
    const val = isPushed ? 127 : 0;

    const midiMsg = new Uint8Array([0xB0, cc, val]);
    this.onMidiDataCallback(midiMsg);
  }

  public get connected(): boolean {
    return this.isConnected;
  }
}
