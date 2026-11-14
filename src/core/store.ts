import { create } from 'zustand';
import {
  BleConnectionStatus,
  MidiConnectionStatus,
  NexfootEncoderId,
  NexfootEncoderState,
  CortexSlotState,
  CortexParameter,
  NexfootMapping,
  PacketLogEntry,
} from '../types';

interface AppState {
  // 모드 설정
  isMockMode: boolean;
  setMockMode: (enabled: boolean) => void;

  // 연결 상태
  bleStatus: BleConnectionStatus;
  bleDeviceName: string | null;
  setBleStatus: (status: BleConnectionStatus, deviceName?: string) => void;

  midiStatus: MidiConnectionStatus;
  midiDeviceName: string | null;
  setMidiStatus: (status: MidiConnectionStatus, deviceName?: string) => void;

  // Livtra Nexfoot 4개 엔코더 상태
  nexfootStates: Record<NexfootEncoderId, NexfootEncoderState>;
  updateNexfootRotate: (id: NexfootEncoderId, value: number) => void;
  updateNexfootPush: (id: NexfootEncoderId, isPushed: boolean) => void;

  // Nano Cortex 가상/실제 상태
  currentPresetIndex: number;
  currentPresetName: string;
  setCurrentPreset: (index: number, name: string) => void;
  cortexSlots: CortexSlotState[];
  toggleSlotBypass: (slotIndex: number) => void;
  setSlotBypass: (slotIndex: number, isBypassed: boolean) => void;

  cortexParameters: Record<string, CortexParameter>;
  updateParameterValue: (paramId: string, normalizedValue: number) => void;

  // 매핑 테이블
  mappings: Record<NexfootEncoderId, NexfootMapping>;
  updateMapping: (id: NexfootEncoderId, mapping: NexfootMapping) => void;

  // 패킷/이벤트 로그
  logs: PacketLogEntry[];
  addLog: (entry: Omit<PacketLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const initialSlots: CortexSlotState[] = [
  { slotIndex: 0, name: 'Input Gate', type: 'gate', isBypassed: false },
  { slotIndex: 1, name: 'Rodent Drive', type: 'drive', isBypassed: false },
  { slotIndex: 2, name: 'UK 100 Lead', type: 'capture', isBypassed: false },
  { slotIndex: 3, name: '4x12 Greenback', type: 'cab', isBypassed: false },
  { slotIndex: 4, name: 'Analog Delay', type: 'fx1', isBypassed: false },
  { slotIndex: 5, name: 'Plate Reverb', type: 'fx2', isBypassed: false },
];

const initialParameters: Record<string, CortexParameter> = {
  'drive_gain': { id: 'drive_gain', name: 'Gain', slotIndex: 1, value: 0.5, min: 0, max: 100, unit: '%' },
  'drive_tone': { id: 'drive_tone', name: 'Tone', slotIndex: 1, value: 0.65, min: 0, max: 100, unit: '%' },
  'drive_level': { id: 'drive_level', name: 'Level', slotIndex: 1, value: 0.75, min: 0, max: 100, unit: '%' },
  'delay_mix': { id: 'delay_mix', name: 'Mix', slotIndex: 4, value: 0.35, min: 0, max: 100, unit: '%' },
  'delay_feedback': { id: 'delay_feedback', name: 'Feedback', slotIndex: 4, value: 0.45, min: 0, max: 100, unit: '%' },
  'reverb_mix': { id: 'reverb_mix', name: 'Mix', slotIndex: 5, value: 0.3, min: 0, max: 100, unit: '%' },
  'reverb_decay': { id: 'reverb_decay', name: 'Decay', slotIndex: 5, value: 0.5, min: 0, max: 100, unit: '%' },
};

const initialMappings: Record<NexfootEncoderId, NexfootMapping> = {
  1: {
    encoderId: 1,
    label: 'Drive Control',
    pushAction: { type: 'slot_bypass', slotIndex: 1 },
    rotateAction: { type: 'parameter', paramId: 'drive_gain', slotIndex: 1 },
  },
  2: {
    encoderId: 2,
    label: 'Delay Control',
    pushAction: { type: 'slot_bypass', slotIndex: 4 },
    rotateAction: { type: 'parameter', paramId: 'delay_mix', slotIndex: 4 },
  },
  3: {
    encoderId: 3,
    label: 'Reverb Control',
    pushAction: { type: 'slot_bypass', slotIndex: 5 },
    rotateAction: { type: 'parameter', paramId: 'reverb_mix', slotIndex: 5 },
  },
  4: {
    encoderId: 4,
    label: 'Preset / Tap',
    pushAction: { type: 'tap_tempo' },
    rotateAction: { type: 'preset_scroll', step: 1 },
  },
};

export const useAppStore = create<AppState>((set) => ({
  isMockMode: true, // 기본값을 Mock 모드로 설정하여 하드웨어 없이 즉시 시연 가능
  setMockMode: (enabled) => set({ isMockMode: enabled }),

  bleStatus: 'disconnected',
  bleDeviceName: null,
  setBleStatus: (status, deviceName) =>
    set({ bleStatus: status, bleDeviceName: deviceName ?? null }),

  midiStatus: 'disconnected',
  midiDeviceName: null,
  setMidiStatus: (status, deviceName) =>
    set({ midiStatus: status, midiDeviceName: deviceName ?? null }),

  nexfootStates: {
    1: { id: 1, rotateValue: 64, isPushed: false, lastUpdated: Date.now() },
    2: { id: 2, rotateValue: 45, isPushed: false, lastUpdated: Date.now() },
    3: { id: 3, rotateValue: 38, isPushed: false, lastUpdated: Date.now() },
    4: { id: 4, rotateValue: 0, isPushed: false, lastUpdated: Date.now() },
  },

  updateNexfootRotate: (id, value) => {
    const clamped = Math.max(0, Math.min(127, Math.round(value)));
    set((state) => ({
      nexfootStates: {
        ...state.nexfootStates,
        [id]: { ...state.nexfootStates[id], rotateValue: clamped, lastUpdated: Date.now() },
      },
    }));
  },

  updateNexfootPush: (id, isPushed) => {
    set((state) => ({
      nexfootStates: {
        ...state.nexfootStates,
        [id]: { ...state.nexfootStates[id], isPushed, lastUpdated: Date.now() },
      },
    }));
  },

  currentPresetIndex: 4,
  currentPresetName: '05: Crunch Lead Drive',
  setCurrentPreset: (index, name) =>
    set({ currentPresetIndex: index, currentPresetName: name }),

  cortexSlots: initialSlots,
  toggleSlotBypass: (slotIndex) => {
    set((state) => ({
      cortexSlots: state.cortexSlots.map((slot) =>
        slot.slotIndex === slotIndex ? { ...slot, isBypassed: !slot.isBypassed } : slot
      ),
    }));
  },
  setSlotBypass: (slotIndex, isBypassed) => {
    set((state) => ({
      cortexSlots: state.cortexSlots.map((slot) =>
        slot.slotIndex === slotIndex ? { ...slot, isBypassed } : slot
      ),
    }));
  },

  cortexParameters: initialParameters,
  updateParameterValue: (paramId, normalizedValue) => {
    const clamped = Math.max(0, Math.min(1.0, normalizedValue));
    set((state) => {
      const target = state.cortexParameters[paramId];
      if (!target) return state;
      return {
        cortexParameters: {
          ...state.cortexParameters,
          [paramId]: { ...target, value: clamped },
        },
      };
    });
  },

  mappings: initialMappings,
  updateMapping: (id, mapping) => {
    set((state) => ({
      mappings: {
        ...state.mappings,
        [id]: mapping,
      },
    }));
  },

  logs: [],
  addLog: (entry) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const newEntry: PacketLogEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timeStr,
    };
    set((state) => ({
      logs: [newEntry, ...state.logs.slice(0, 99)], // 최대 100개 유지
    }));
  },
  clearLogs: () => set({ logs: [] }),
}));
