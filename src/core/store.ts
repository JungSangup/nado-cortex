import { create } from 'zustand';
import {
  BleConnectionStatus,
  MidiConnectionStatus,
  NexfootEncoderId,
  NexfootEncoderState,
  CortexSlotId,
  CortexSlotState,
  MappingProfile,
  MidiLearnState,
  MidiLearnTarget,
  PacketLogEntry,
} from '../types';
import { CORTEX_SLOT_CONFIGS, DEVICE_CATALOG } from './DeviceCatalog';
import { profileManager } from './ProfileManager';
import { midiLearnEngine } from './MidiLearnEngine';
import { dynamicPagingRouter } from './DynamicPagingRouter';

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

  // Nano Cortex 프리셋 (0 ~ 63)
  currentPresetIndex: number;
  currentPresetName: string;
  setCurrentPresetIndex: (index: number) => void;

  // 시그널 체인 슬롯 (7개 슬롯)
  cortexSlots: CortexSlotState[];
  selectedSlotId: CortexSlotId;
  setSelectedSlotId: (slotId: CortexSlotId) => void;
  toggleSlotBypass: (slotId: CortexSlotId) => void;
  setSlotBypass: (slotId: CortexSlotId, isBypassed: boolean) => void;
  setSlotModel: (slotId: CortexSlotId, modelId: string) => void;

  // 파라미터 인스펙터 & 페이징 상태
  paramPageIndex: number;
  setParamPageIndex: (index: number) => void;
  nextParamPage: () => void;
  prevParamPage: () => void;
  updateSlotParamValue: (slotId: CortexSlotId, paramIndex: number, value: number) => void;

  // 프로필 관리
  activeProfile: MappingProfile;
  profiles: MappingProfile[];
  setActiveProfile: (profileId: string) => void;
  createProfile: (name: string) => void;
  importProfile: (jsonString: string) => { success: boolean; error?: string };
  deleteProfile: (profileId: string) => boolean;

  // MIDI Learn 상태
  midiLearnState: MidiLearnState;
  startMidiLearn: (target: MidiLearnTarget) => void;
  cancelMidiLearn: () => void;

  // UI 상태 (로그 펼치기/접기)
  logExpanded: boolean;
  setLogExpanded: (expanded: boolean) => void;
  toggleLogExpanded: () => void;

  // 패킷/이벤트 로그
  logs: PacketLogEntry[];
  addLog: (entry: Omit<PacketLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const buildInitialSlots = (): CortexSlotState[] => {
  const slotIds: CortexSlotId[] = [
    'pre_fx_1',
    'pre_fx_2',
    'amp',
    'cab',
    'post_fx_1',
    'post_fx_2',
    'post_fx_3',
  ];

  return slotIds.map((slotId) => {
    const cfg = CORTEX_SLOT_CONFIGS[slotId];
    const model = DEVICE_CATALOG[cfg.defaultModelId];
    return {
      slotId,
      slotIndex: cfg.enableSlot,
      name: cfg.name,
      category: cfg.category,
      isBypassed: false,
      modelId: cfg.defaultModelId,
      modelName: model ? model.name : cfg.name,
    };
  });
};

export const useAppStore = create<AppState>((set, get) => {
  // Subscribe to MidiLearnEngine
  midiLearnEngine.subscribe((learnState) => {
    set({ midiLearnState: learnState });
  });

  return {
    isMockMode: true,
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

    currentPresetIndex: 0,
    currentPresetName: 'Preset 01: Plexi Lead Crunch',
    setCurrentPresetIndex: (index) => {
      const clamped = Math.max(0, Math.min(63, Math.round(index)));
      set({
        currentPresetIndex: clamped,
        currentPresetName: `Preset ${String(clamped + 1).padStart(2, '0')}`,
      });
    },

    cortexSlots: buildInitialSlots(),
    selectedSlotId: 'pre_fx_1',
    setSelectedSlotId: (slotId) => {
      dynamicPagingRouter.setSelectedSlotId(slotId);
      set({
        selectedSlotId: slotId,
        paramPageIndex: 0,
      });
    },

    toggleSlotBypass: (slotId) => {
      set((state) => ({
        cortexSlots: state.cortexSlots.map((slot) =>
          slot.slotId === slotId ? { ...slot, isBypassed: !slot.isBypassed } : slot
        ),
      }));
    },

    setSlotBypass: (slotId, isBypassed) => {
      set((state) => ({
        cortexSlots: state.cortexSlots.map((slot) =>
          slot.slotId === slotId ? { ...slot, isBypassed } : slot
        ),
      }));
    },

    setSlotModel: (slotId, modelId) => {
      const model = DEVICE_CATALOG[modelId];
      if (!model) return;
      set((state) => ({
        cortexSlots: state.cortexSlots.map((slot) =>
          slot.slotId === slotId
            ? { ...slot, modelId: model.id, modelName: model.name }
            : slot
        ),
      }));
    },

    paramPageIndex: 0,
    setParamPageIndex: (index) => {
      const slot = get().cortexSlots.find((s) => s.slotId === get().selectedSlotId);
      dynamicPagingRouter.setPageIndex(index, slot?.modelId);
      set({ paramPageIndex: dynamicPagingRouter.getCurrentPageIndex() });
    },

    nextParamPage: () => {
      const slot = get().cortexSlots.find((s) => s.slotId === get().selectedSlotId);
      const newPage = dynamicPagingRouter.nextPage(slot?.modelId);
      set({ paramPageIndex: newPage });
    },

    prevParamPage: () => {
      const slot = get().cortexSlots.find((s) => s.slotId === get().selectedSlotId);
      const newPage = dynamicPagingRouter.prevPage(slot?.modelId);
      set({ paramPageIndex: newPage });
    },

    updateSlotParamValue: (slotId, paramIndex, value) => {
      dynamicPagingRouter.setParameterValue(slotId, paramIndex, value);
      // Force trigger state update
      set((state) => ({ ...state }));
    },

    // Profiles
    activeProfile: profileManager.getActiveProfile(),
    profiles: profileManager.getProfiles(),

    setActiveProfile: (profileId) => {
      const p = profileManager.setActiveProfile(profileId);
      set({ activeProfile: p, profiles: profileManager.getProfiles() });
    },

    createProfile: (name) => {
      const p = profileManager.createProfile(name);
      set({ activeProfile: p, profiles: profileManager.getProfiles() });
    },

    importProfile: (jsonString) => {
      const res = profileManager.importProfileJson(jsonString);
      if (res.success && res.profile) {
        set({ activeProfile: res.profile, profiles: profileManager.getProfiles() });
        return { success: true };
      }
      return { success: false, error: res.error };
    },

    deleteProfile: (profileId) => {
      const ok = profileManager.deleteProfile(profileId);
      if (ok) {
        set({
          activeProfile: profileManager.getActiveProfile(),
          profiles: profileManager.getProfiles(),
        });
      }
      return ok;
    },

    // MIDI Learn
    midiLearnState: midiLearnEngine.getState(),
    startMidiLearn: (target) => midiLearnEngine.startLearn(target),
    cancelMidiLearn: () => midiLearnEngine.cancelLearn(),

    // UI
    logExpanded: false, // 기본값: 접힘 (화면 확보)
    setLogExpanded: (expanded) => set({ logExpanded: expanded }),
    toggleLogExpanded: () => set((state) => ({ logExpanded: !state.logExpanded })),

    // Logs
    logs: [],
    addLog: (entry) => {
      const now = new Date();
      const timeStr =
        now.toTimeString().split(' ')[0] +
        '.' +
        String(now.getMilliseconds()).padStart(3, '0');
      const newEntry: PacketLogEntry = {
        ...entry,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: timeStr,
      };
      set((state) => ({
        logs: [newEntry, ...state.logs.slice(0, 99)],
      }));
    },
    clearLogs: () => set({ logs: [] }),
  };
});
