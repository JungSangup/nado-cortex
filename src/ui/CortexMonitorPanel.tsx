import React from 'react';
import { useAppStore } from '../core/store';
import { Sliders, Volume2, Power, ChevronLeft, ChevronRight, Layers, Music, Activity, Disc } from 'lucide-react';
import { CortexSlotId } from '../types';
import { getModelsForSlot } from '../core/DeviceCatalog';
import { setlistManager } from '../core/SetlistManager';
import { SlotParameterRack } from './SlotParameterRack';

interface CortexMonitorPanelProps {
  onToggleSlot?: (slotId: CortexSlotId) => void;
  onChangePreset?: (presetIndex: number) => void;
  onChangeModel?: (slotId: CortexSlotId, modelId: string) => void;
  onParamChange?: (slotId: CortexSlotId, paramIndex: number, value: number) => void;
  onTapTempo?: () => void;
  onToggleTuner?: () => void;
}

export const CortexMonitorPanel: React.FC<CortexMonitorPanelProps> = ({
  onToggleSlot,
  onChangePreset,
  onChangeModel,
  onParamChange,
  onTapTempo,
  onToggleTuner,
}) => {
  const {
    currentPresetIndex,
    currentPresetName,
    setCurrentPresetIndex,
    cortexSlots,
    selectedSlotId,
    setSelectedSlotId,
    toggleSlotBypass,
    setSlotModel,
    setlistMode,
    toggleSetlistMode,
    nextSetlistSong,
    prevSetlistSong,
    currentSetlistIndex,
    bpm,
    tapBpm,
    isTuning,
    toggleTuner,
  } = useAppStore();

  const handlePrevPreset = () => {
    if (setlistMode) {
      prevSetlistSong();
      if (onChangePreset) onChangePreset(useAppStore.getState().currentPresetIndex);
    } else {
      const nextIdx = Math.max(0, currentPresetIndex - 1);
      setCurrentPresetIndex(nextIdx);
      if (onChangePreset) onChangePreset(nextIdx);
    }
  };

  const handleNextPreset = () => {
    if (setlistMode) {
      nextSetlistSong();
      if (onChangePreset) onChangePreset(useAppStore.getState().currentPresetIndex);
    } else {
      const nextIdx = Math.min(63, currentPresetIndex + 1);
      setCurrentPresetIndex(nextIdx);
      if (onChangePreset) onChangePreset(nextIdx);
    }
  };

  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextIdx = parseInt(e.target.value, 10);
    setCurrentPresetIndex(nextIdx);
    if (onChangePreset) onChangePreset(nextIdx);
  };

  const handleModelChange = (slotId: CortexSlotId, modelId: string) => {
    setSlotModel(slotId, modelId);
    if (onChangeModel) onChangeModel(slotId, modelId);
  };

  const handleTap = () => {
    tapBpm();
    if (onTapTempo) onTapTempo();
  };

  const handleTuner = () => {
    toggleTuner();
    if (onToggleTuner) onToggleTuner();
  };

  const currentSong = setlistManager.getCurrentSong();

  return (
    <section className="bg-cortex-card border border-cortex-border rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Top Header: Title & Utility Bar (Setlist, Tap Tempo, Tuner) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-cortex-border/60 pb-3.5">
        {/* Simple Clean Title */}
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cortex-cyan" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
            Nano Cortex
          </h2>
        </div>

        {/* Setlist & Tuner / Tap Utility Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Setlist Mode Toggle */}
          <button
            onClick={toggleSetlistMode}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl border transition-all ${
              setlistMode
                ? 'bg-cortex-purple/20 border-cortex-purple text-cortex-purpleHover font-bold shadow-sm'
                : 'bg-cortex-panel border-cortex-border text-cortex-muted hover:text-white'
            }`}
            title="공연 세트리스트 모드 토글"
          >
            <Music className="w-3.5 h-3.5" />
            <span>세트리스트: {setlistMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Tap Tempo Button */}
          <button
            onClick={handleTap}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-cortex-panel border border-cortex-border hover:border-cortex-cyan text-cortex-cyan font-mono font-bold active:scale-95 transition-all"
            title="탭 템포 (연속 클릭 시 BPM 연산)"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>TAP ({bpm} BPM)</span>
          </button>

          {/* Tuner Button */}
          <button
            onClick={handleTuner}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl border font-bold transition-all ${
              isTuning
                ? 'bg-amber-950/70 border-amber-500 text-amber-300 shadow-sm shadow-amber-500/20'
                : 'bg-cortex-panel border-cortex-border text-slate-300 hover:text-white'
            }`}
            title="튜너 모드 토글 (음소거 및 튜너 뷰)"
          >
            <Disc className={`w-3.5 h-3.5 ${isTuning ? 'animate-spin text-amber-400' : ''}`} />
            <span>TUNER {isTuning ? 'ON' : ''}</span>
          </button>

          {/* Preset / Setlist Navigator */}
          <div className="flex items-center gap-1 bg-cortex-panel px-2.5 py-1 rounded-xl border border-cortex-border">
            <Volume2 className="w-3.5 h-3.5 text-cortex-cyan mr-1" />
            <button
              onClick={handlePrevPreset}
              className="p-0.5 rounded text-cortex-muted hover:text-white transition-all"
              title="이전 프리셋/곡"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {setlistMode ? (
              <span className="text-xs font-bold text-white px-1.5 truncate max-w-[150px] sm:max-w-[200px]">
                {currentSong ? `[${currentSetlistIndex + 1}] ${currentSong.title}` : currentPresetName}
              </span>
            ) : (
              <select
                value={currentPresetIndex}
                onChange={handlePresetSelect}
                className="bg-cortex-dark text-xs font-mono font-bold text-white px-2 py-0.5 rounded-lg border border-cortex-border focus:outline-none focus:border-cortex-cyan"
              >
                {Array.from({ length: 64 }).map((_, i) => (
                  <option key={i} value={i}>
                    {setlistManager.getSongTitle(i)}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleNextPreset}
              className="p-0.5 rounded text-cortex-muted hover:text-white transition-all"
              title="다음 프리셋/곡"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Tuner Display (Active Overlay) */}
      {isTuning && (
        <div className="mb-4 bg-amber-950/30 border border-amber-500/60 rounded-xl p-3.5 flex flex-col items-center justify-center animate-in fade-in">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            TUNER ACTIVE (MUTED)
          </div>
          <div className="text-3xl font-black font-mono text-white my-1">
            E <span className="text-xs text-emerald-400 font-bold ml-1">IN TUNE</span>
          </div>
          <div className="w-full max-w-xs h-2 bg-slate-900 rounded-full relative overflow-hidden my-1">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-emerald-400 -translate-x-1/2" />
            <div className="absolute left-1/2 top-0 bottom-0 w-2.5 h-2.5 rounded-full bg-amber-400 -translate-x-1/2" />
          </div>
          <span className="text-[10px] font-mono text-slate-400">440.0 Hz • ±0 Cents</span>
        </div>
      )}

      {/* Signal Chain Blocks */}
      <div>
        <div className="text-xs font-semibold text-cortex-muted mb-2.5 uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cortex-cyan" />
            <span>시그널 체인 슬롯</span>
          </div>
          <span className="text-[11px] font-mono text-cortex-cyan lowercase">
            * 슬롯 클릭 시 하단 파라미터 랙에 즉시 반영
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {cortexSlots.map((slot) => {
            const isActive = !slot.isBypassed;
            const isSelected = slot.slotId === selectedSlotId;
            const availableModels = getModelsForSlot(slot.slotId);

            return (
              <div
                key={slot.slotId}
                onClick={() => setSelectedSlotId(slot.slotId)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between min-h-[105px] ${
                  isSelected
                    ? 'ring-2 ring-cortex-cyan border-cortex-cyan bg-cortex-panel shadow-lg shadow-cortex-cyan/20'
                    : isActive
                    ? 'bg-cortex-panel/70 border-cortex-border/80 hover:border-cortex-cyan/40'
                    : 'bg-cortex-panel/30 border-cortex-border/40 opacity-60'
                }`}
              >
                {/* Slot Top: Label & Bypass Power Button */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-mono text-cortex-muted font-bold truncate max-w-[70px]">
                    {slot.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleSlot) onToggleSlot(slot.slotId);
                      else toggleSlotBypass(slot.slotId);
                    }}
                    title={isActive ? '슬롯 끄기 (Bypass)' : '슬롯 켜기 (Active)'}
                    className={`p-1 rounded-md transition-all ${
                      isActive
                        ? 'text-cortex-cyan bg-cortex-cyan/10 hover:bg-cortex-cyan/20'
                        : 'text-slate-500 bg-slate-800/40 hover:bg-slate-800'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Model Name */}
                <div className="font-bold text-xs text-white truncate my-1">
                  {slot.modelName}
                </div>

                {/* Model Selector Dropdown */}
                <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={slot.modelId}
                    onChange={(e) => handleModelChange(slot.slotId, e.target.value)}
                    className="w-full bg-cortex-dark/90 text-[10px] text-cortex-muted hover:text-white px-1 py-0.5 rounded border border-cortex-border focus:outline-none focus:border-cortex-cyan truncate"
                  >
                    {availableModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Indicator */}
                <div className="text-[10px] font-mono mt-1 flex items-center justify-between">
                  {isActive ? (
                    <span className="text-emerald-400 font-bold">● ON</span>
                  ) : (
                    <span className="text-slate-500">○ BYPASS</span>
                  )}
                  {isSelected && (
                    <span className="text-cortex-cyan text-[9px] font-bold">FOCUS</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Parameter Rack */}
      <SlotParameterRack onParamChange={onParamChange} />
    </section>
  );
};
