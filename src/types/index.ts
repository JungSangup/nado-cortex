export type BleConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type MidiConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type NexfootEncoderId = 1 | 2 | 3 | 4;

export interface NexfootEncoderState {
  id: NexfootEncoderId;
  rotateValue: number; // 0 ~ 127
  isPushed: boolean;
  lastUpdated: number;
}

export type CortexSlotType = 'gate' | 'drive' | 'capture' | 'cab' | 'fx1' | 'fx2' | 'fx3' | 'fx4' | 'fx5';

export interface CortexSlotState {
  slotIndex: number;
  name: string;
  type: CortexSlotType;
  isBypassed: boolean;
}

export interface CortexParameter {
  id: string;
  name: string;
  slotIndex: number;
  value: number; // 0.0 ~ 1.0 (normalized)
  min: number;
  max: number;
  unit?: string;
}

export interface NexfootMapping {
  encoderId: NexfootEncoderId;
  label: string;
  pushAction: {
    type: 'slot_bypass' | 'tuner' | 'tap_tempo' | 'preset_select';
    slotIndex?: number;
    presetNumber?: number;
  };
  rotateAction: {
    type: 'parameter' | 'preset_scroll';
    paramId?: string;
    slotIndex?: number;
    step?: number;
  };
}

export interface PacketLogEntry {
  id: string;
  timestamp: string;
  direction: 'midi_in' | 'ble_out' | 'ble_in' | 'core' | 'error';
  source: string;
  message: string;
  rawBytes?: number[];
}
