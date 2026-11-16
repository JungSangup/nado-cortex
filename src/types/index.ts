export type BleConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type MidiConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type NexfootEncoderId = 1 | 2 | 3 | 4;

export interface NexfootEncoderState {
  id: NexfootEncoderId;
  rotateValue: number; // 0 ~ 127
  isPushed: boolean;
  lastUpdated: number;
}

export type CortexSlotId = 
  | 'pre_fx_1' // enableSlot: 0x04, modelSlot: 0x00
  | 'pre_fx_2' // enableSlot: 0x05, modelSlot: 0x01
  | 'amp'      // enableSlot: 0x01, modelSlot: 0x01 (Capture)
  | 'cab'      // enableSlot: 0x03, modelSlot: 0x03 (IR)
  | 'post_fx_1'// enableSlot: 0x06, modelSlot: 0x02
  | 'post_fx_2'// enableSlot: 0x07, modelSlot: 0x03
  | 'post_fx_3';// enableSlot: 0x08, modelSlot: 0x04

export interface CortexSlotState {
  slotId: CortexSlotId;
  slotIndex: number;
  name: string;
  category: 'pre_fx' | 'amp' | 'cab' | 'post_fx';
  isBypassed: boolean;
  modelId: string;
  modelName: string;
}

export interface DeviceParameterDef {
  id: string;
  name: string;
  paramIndex: number;
  min: number;
  max: number;
  defaultValue: number;
  unit?: string;
  step?: number;
  valueFormat?: (val: number) => string;
}

export interface DeviceModelDef {
  id: string; // Nano Cortex Model ID
  name: string;
  category: 'pre_fx' | 'amp' | 'cab' | 'post_fx';
  description: string;
  parameters: DeviceParameterDef[];
}

export type MidiInputMode = 'relative' | 'absolute' | 'push_toggle';

export interface ControlBinding {
  id: string;
  swId: 'sw1' | 'sw2' | 'sw3' | 'sw4' | 'exp';
  type: 'push' | 'rotate';
  targetType: 'slot_toggle' | 'slot_param' | 'preset_change' | 'page_nav';
  targetSlotId?: CortexSlotId;
  targetParamIndex?: number;
  midiChannel: number;
  ccNumber: number;
  mode: MidiInputMode;
  min: number;
  max: number;
  invert: boolean;
}

export interface MappingProfile {
  id: string;
  name: string;
  description: string;
  version: '0.0.2';
  bindings: ControlBinding[];
}

export interface MidiLearnTarget {
  type: 'slot_toggle' | 'slot_param' | 'page_nav';
  slotId?: CortexSlotId;
  paramIndex?: number;
  swId?: 'sw1' | 'sw2' | 'sw3' | 'sw4';
}

export interface MidiLearnState {
  active: boolean;
  target: MidiLearnTarget | null;
  detectedMode?: MidiInputMode;
  detectedCC?: number;
  detectedChannel?: number;
}

export interface PacketLogEntry {
  id: string;
  timestamp: string;
  direction: 'midi_in' | 'ble_out' | 'ble_in' | 'core' | 'error';
  source: string;
  message: string;
  rawBytes?: number[];
}
