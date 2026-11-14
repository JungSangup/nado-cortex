import { NexfootParser, NexfootEvent } from './NexfootParser';

export interface MidiManagerCallbacks {
  onStatusChange: (status: 'disconnected' | 'connecting' | 'connected' | 'error', deviceName?: string) => void;
  onNexfootEvent: (event: NexfootEvent) => void;
  onRawMidiMessage?: (data: Uint8Array) => void;
  onError: (error: Error) => void;
}

export class WebMidiManager {
  private midiAccess: MIDIAccess | null = null;
  private selectedInput: MIDIInput | null = null;
  private parser: NexfootParser;
  private callbacks: MidiManagerCallbacks;

  constructor(callbacks: MidiManagerCallbacks, parser = new NexfootParser()) {
    this.callbacks = callbacks;
    this.parser = parser;
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  public async init(): Promise<boolean> {
    if (!this.isSupported()) {
      this.callbacks.onError(new Error('Web MIDI API is not supported in this browser.'));
      return false;
    }

    try {
      this.callbacks.onStatusChange('connecting');
      const access = await navigator.requestMIDIAccess({ sysex: false });
      this.midiAccess = access;

      this.midiAccess.onstatechange = (e) => {
        this.handleStateChange(e as MIDIConnectionEvent);
      };

      // Auto-detect Nexfoot or select first available input
      const inputs = Array.from(this.midiAccess.inputs.values());
      const nexfootInput = inputs.find((inp) =>
        inp.name?.toUpperCase().includes('NEXFOOT') || inp.name?.toUpperCase().includes('LIVTRA')
      );

      if (nexfootInput) {
        this.selectInput(nexfootInput.id);
      } else if (inputs.length > 0) {
        this.selectInput(inputs[0].id);
      } else {
        this.callbacks.onStatusChange('disconnected');
      }

      return true;
    } catch (err) {
      this.callbacks.onStatusChange('error');
      this.callbacks.onError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  }

  public getAvailableInputs(): Array<{ id: string; name: string }> {
    if (!this.midiAccess) return [];
    return Array.from(this.midiAccess.inputs.values()).map((input) => ({
      id: input.id,
      name: input.name || `MIDI Device ${input.id}`,
    }));
  }

  public selectInput(inputId: string): boolean {
    if (!this.midiAccess) return false;

    // Disconnect current
    if (this.selectedInput) {
      this.selectedInput.onmidimessage = null;
    }

    const input = this.midiAccess.inputs.get(inputId);
    if (!input) return false;

    this.selectedInput = input;
    this.selectedInput.onmidimessage = this.handleMidiMessage;

    this.callbacks.onStatusChange('connected', input.name || 'MIDI Controller');
    return true;
  }

  public disconnect(): void {
    if (this.selectedInput) {
      this.selectedInput.onmidimessage = null;
      this.selectedInput = null;
    }
    this.callbacks.onStatusChange('disconnected');
  }

  private handleMidiMessage = (e: MIDIMessageEvent) => {
    const data = e.data;
    if (!data) return;
    if (this.callbacks.onRawMidiMessage) {
      this.callbacks.onRawMidiMessage(data);
    }

    const nexfootEvent = this.parser.parse(data);
    if (nexfootEvent) {
      this.callbacks.onNexfootEvent(nexfootEvent);
    }
  };

  private handleStateChange = (e: MIDIConnectionEvent) => {
    if (e.port?.type === 'input') {
      if (e.port.state === 'disconnected' && this.selectedInput?.id === e.port.id) {
        this.disconnect();
      }
    }
  };
}
