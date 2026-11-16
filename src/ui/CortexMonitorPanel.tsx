import React from 'react';
import { useAppStore } from '../core/store';
import { Sliders, Volume2, Power, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Layers, Music, Activity, Disc } from 'lucide-react';
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

/**
 * FX 슬롯 1~5번 세련된 은은한 고유 컬러 팔레트 정의
 * - pre_fx_1 (Gate): 스틸 실버 / 슬레이트
 * - pre_fx_2 (Transposer): 모던 민트 / 틸
 * - post_fx_1 (FX1 Drive): 빈티지 웜 앰버
 * - post_fx_2 (FX2 Mod): 라벤더 바이올렛
 * - post_fx_3 (FX3 Delay/Rev): 딥 스카이 블루
 */
interface SlotTheme {
  borderActive: string;
  bgActive: string;
  textActive: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  powerActive: string;
  ringFocus: string;
  glow: string;
}

const FX_SLOT_THEMES: Record<string, SlotTheme> = {
  pre_fx_1: {
    borderActive: 'border-slate-400/50 hover:border-slate-300/70',
    bgActive: 'bg-slate-900/50',
    textActive: 'text-slate-100',
    badgeBg: 'bg-slate-800/80',
    badgeText: 'text-slate-300',
    badgeBorder: 'border-slate-500/40',
    powerActive: 'text-slate-200 bg-slate-700/50 hover:bg-slate-600/60',
    ringFocus: 'ring-slate-300 border-slate-300 shadow-slate-400/20',
    glow: 'shadow-slate-500/10',
  },
  pre_fx_2: {
    borderActive: 'border-teal-500/50 hover:border-teal-400/70',
    bgActive: 'bg-teal-950/30',
    textActive: 'text-teal-100',
    badgeBg: 'bg-teal-900/60',
    badgeText: 'text-teal-300',
    badgeBorder: 'border-teal-500/40',
    powerActive: 'text-teal-300 bg-teal-500/20 hover:bg-teal-500/30',
    ringFocus: 'ring-teal-400 border-teal-400 shadow-teal-400/20',
    glow: 'shadow-teal-500/10',
  },
  post_fx_1: {
    borderActive: 'border-amber-500/50 hover:border-amber-400/70',
    bgActive: 'bg-amber-950/30',
    textActive: 'text-amber-100',
    badgeBg: 'bg-amber-900/60',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/40',
    powerActive: 'text-amber-300 bg-amber-500/20 hover:bg-amber-500/30',
    ringFocus: 'ring-amber-400 border-amber-400 shadow-amber-400/20',
    glow: 'shadow-amber-500/10',
  },
  post_fx_2: {
    borderActive: 'border-purple-500/50 hover:border-purple-400/70',
    bgActive: 'bg-purple-950/30',
    textActive: 'text-purple-100',
    badgeBg: 'bg-purple-900/60',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-500/40',
    powerActive: 'text-purple-300 bg-purple-500/20 hover:bg-purple-500/30',
    ringFocus: 'ring-purple-400 border-purple-400 shadow-purple-400/20',
    glow: 'shadow-purple-500/10',
  },
  post_fx_3: {
    borderActive: 'border-sky-500/50 hover:border-sky-400/70',
    bgActive: 'bg-sky-950/30',
    textActive: 'text-sky-100',
    badgeBg: 'bg-sky-900/60',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-500/40',
    powerActive: 'text-sky-300 bg-sky-500/20 hover:bg-sky-500/30',
    ringFocus: 'ring-sky-400 border-sky-400 shadow-sky-400/20',
    glow: 'shadow-sky-500/10',
  },
};

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
    coreAmpCabExpanded,
    toggleCoreAmpCabExpanded,
    viewMode,
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
          {/* Preset / Setlist Navigator (Live 모드에서는 큼직하게 강조) */}
          <div className="flex items-center gap-1.5 bg-cortex-panel px-3 py-1.5 rounded-xl border border-cortex-cyan/50 shadow-sm">
            <Volume2 className="w-4 h-4 text-cortex-cyan" />
            <button
              onClick={handlePrevPreset}
              className="p-1 rounded text-cortex-muted hover:text-white transition-all"
              title="이전 프리셋/곡"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {setlistMode ? (
              <span className="text-sm font-black text-white px-2 truncate max-w-[180px] sm:max-w-[240px]">
                {currentSong ? `[${currentSetlistIndex + 1}] ${currentSong.title}` : currentPresetName}
              </span>
            ) : (
              <select
                value={currentPresetIndex}
                onChange={handlePresetSelect}
                className="bg-cortex-dark text-xs sm:text-sm font-mono font-black text-white px-2 py-1 rounded-lg border border-cortex-border focus:outline-none focus:border-cortex-cyan"
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
              className="p-1 rounded text-cortex-muted hover:text-white transition-all"
              title="다음 프리셋/곡"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Tap Tempo Button (Live 모드에서 큼직하게) */}
          <button
            onClick={handleTap}
            className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-xl bg-cortex-panel border border-cortex-border hover:border-cortex-cyan text-cortex-cyan font-mono font-black active:scale-95 transition-all shadow-sm shrink-0"
            title="탭 템포 (클릭 시 BPM 연산)"
          >
            <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
            <span>TAP {bpm} BPM</span>
          </button>

          {/* Tuner Button - 크기 및 위치 고정 */}
          <button
            onClick={handleTuner}
            className={`flex items-center justify-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-xl border font-bold transition-all w-[90px] shrink-0 whitespace-nowrap shadow-sm ${
              isTuning
                ? 'bg-amber-950/70 border-amber-500 text-amber-300 shadow-amber-500/20'
                : 'bg-cortex-panel border-cortex-border text-slate-300 hover:text-white'
            }`}
            title="튜너 모드 토글 (음소거 및 튜너 뷰)"
          >
            <Disc className={`w-4 h-4 shrink-0 ${isTuning ? 'animate-spin text-amber-400' : ''}`} />
            <span>TUNER</span>
            {isTuning && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
          </button>

          {/* Setlist Mode Toggle (Advanced 모드에서만 노출) */}
          {viewMode !== 'live' && (
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
          )}
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

      {/* Signal Chain Blocks - 2-Row Split (Core Amp/Cab vs FX Pedals) */}
      <div className="space-y-4">
        {/* Row 1: Core Neural Capture & Cab/IR Line (Collapsible Accordion - Live 모드에서는 완전히 숨김) */}
        {viewMode !== 'live' && (
          <div className="bg-gradient-to-r from-amber-950/20 via-cortex-panel/40 to-amber-950/20 p-3 sm:p-3.5 rounded-xl border border-amber-500/30 shadow-sm transition-all">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Core: Neural Capture & Cab / IR 라인</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 hidden sm:inline">
                  앰프 헤드 캡처 & 캐비닛 IR (메인 톤 엔진)
                </span>
                <button
                  onClick={toggleCoreAmpCabExpanded}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 hover:bg-amber-900/60 px-2 py-0.5 rounded-lg border border-amber-500/40 transition-all"
                  title={coreAmpCabExpanded ? 'Core 랙 접기' : 'Core 랙 펼치기'}
                >
                  <span>{coreAmpCabExpanded ? '접기' : '펼치기'}</span>
                  {coreAmpCabExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {!coreAmpCabExpanded ? (
              /* Collapsed Compact 1-Line Summary Bar */
              <div
                onClick={toggleCoreAmpCabExpanded}
                className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-cortex-dark/70 border border-amber-500/20 cursor-pointer hover:border-amber-400/50 hover:bg-cortex-dark transition-all"
                title="클릭하여 Core 앰프/캐비닛 랙 상세 펼치기"
              >
                <div className="flex flex-wrap items-center gap-3">
                  {cortexSlots
                    .filter((slot) => slot.slotId === 'amp' || slot.slotId === 'cab')
                    .map((slot) => (
                      <div key={slot.slotId} className="flex items-center gap-1.5 text-xs">
                        <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/40">
                          {slot.slotId === 'amp' ? 'AMP' : 'CAB'}
                        </span>
                        <span className="font-bold text-white tracking-wide">{slot.modelName}</span>
                        <span
                          className={`text-[10px] font-mono ${
                            !slot.isBypassed ? 'text-emerald-400 font-bold' : 'text-slate-500'
                          }`}
                        >
                          {!slot.isBypassed ? '● ON' : '○ BYPASS'}
                        </span>
                      </div>
                    ))}
                </div>
                <span className="text-[10px] text-amber-400 font-mono font-medium">클릭하여 펼치기 ▾</span>
              </div>
            ) : (
              /* Expanded Full Cards View */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                {cortexSlots
                  .filter((slot) => slot.slotId === 'amp' || slot.slotId === 'cab')
                  .map((slot) => {
                    const isActive = !slot.isBypassed;
                    const isSelected = slot.slotId === selectedSlotId;
                    const availableModels = getModelsForSlot(slot.slotId);

                    return (
                      <div
                        key={slot.slotId}
                        onClick={() => setSelectedSlotId(slot.slotId)}
                        className={`p-3 sm:p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                          isSelected
                            ? 'ring-2 ring-amber-400 border-amber-400 bg-cortex-panel shadow-lg shadow-amber-400/20'
                            : isActive
                            ? 'bg-cortex-panel/80 border-amber-500/40 hover:border-amber-400/60'
                            : 'bg-cortex-panel/30 border-cortex-border/40 opacity-60'
                        }`}
                      >
                        {/* Top: Name & Power */}
                        <div className="flex items-center justify-between w-full mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-amber-400 font-black uppercase px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40">
                              {slot.slotId === 'amp' ? 'AMP' : 'CAB'}
                            </span>
                            <span className="text-xs font-bold text-white truncate max-w-[150px]">
                              {slot.name}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleSlot) onToggleSlot(slot.slotId);
                              else toggleSlotBypass(slot.slotId);
                            }}
                            title={isActive ? '슬롯 끄기 (Bypass)' : '슬롯 켜기 (Active)'}
                            className={`p-1 rounded-md transition-all ${
                              isActive
                                ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                                : 'text-slate-500 bg-slate-800/40 hover:bg-slate-800'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Model Name */}
                        <div className="font-bold text-sm text-white truncate my-1">
                          {slot.modelName}
                        </div>

                        {/* Model Selector Dropdown */}
                        <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={slot.modelId}
                            onChange={(e) => handleModelChange(slot.slotId, e.target.value)}
                            className="w-full bg-cortex-dark/90 text-xs text-white px-2 py-1 rounded-lg border border-cortex-border focus:outline-none focus:border-amber-400 truncate"
                          >
                            {availableModels.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Status Indicator */}
                        <div className="text-[10px] font-mono mt-1.5 flex items-center justify-between">
                          {isActive ? (
                            <span className="text-emerald-400 font-bold">● ACTIVE</span>
                          ) : (
                            <span className="text-slate-500">○ BYPASS</span>
                          )}
                          {isSelected && (
                            <span className="text-amber-400 text-[10px] font-bold">INSPECTOR FOCUS</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Row 2: FX Pedals Line (Pre-FX & Post-FX Stompbox Chain) */}
        <div className="bg-cortex-panel/30 p-3 sm:p-3.5 rounded-xl border border-cortex-border/70 shadow-sm">
          <div className="text-xs font-semibold text-cortex-muted mb-2.5 uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cortex-cyan" />
              <span>{viewMode === 'live' ? 'FX 슬롯 제어' : 'FX 페달 라인 (Pre / Post Effects)'}</span>
            </div>
            {viewMode !== 'live' && (
              <span className="text-[10px] font-mono text-cortex-cyan lowercase hidden sm:inline">
                Pre-FX (Gate/Trans/FX1) ➔ Core Amp/Cab ➔ Post-FX (FX2/FX3)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {cortexSlots
              .filter((slot) => slot.slotId !== 'amp' && slot.slotId !== 'cab')
              .map((slot) => {
                const isActive = !slot.isBypassed;
                const isSelected = slot.slotId === selectedSlotId;
                const availableModels = getModelsForSlot(slot.slotId);
                const theme = FX_SLOT_THEMES[slot.slotId] || FX_SLOT_THEMES.pre_fx_1;

                return (
                  <div
                    key={slot.slotId}
                    onClick={() => setSelectedSlotId(slot.slotId)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      viewMode === 'live' ? 'min-h-[92px]' : 'min-h-[108px]'
                    } ${
                      isSelected
                        ? `ring-2 ${theme.ringFocus} bg-cortex-panel shadow-lg`
                        : isActive
                        ? `${theme.bgActive} ${theme.borderActive} ${theme.glow} shadow-md`
                        : 'bg-zinc-950/40 border-zinc-800/60 opacity-45 grayscale hover:opacity-70 hover:border-zinc-700/60'
                    }`}
                  >
                    {/* Slot Top: Label & Bypass Power Button */}
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={`text-[10px] font-mono font-bold truncate max-w-[70px] px-1.5 py-0.5 rounded border ${
                          isActive
                            ? `${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`
                            : 'bg-zinc-900/80 text-zinc-500 border-zinc-800'
                        }`}
                      >
                        {slot.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSlot) onToggleSlot(slot.slotId);
                          else toggleSlotBypass(slot.slotId);
                        }}
                        title={isActive ? '슬롯 끄기 (Bypass)' : '슬롯 켜기 (Active)'}
                        className={`p-1.5 rounded-lg transition-all ${
                          isActive
                            ? `${theme.powerActive} shadow-sm`
                            : 'text-zinc-600 bg-zinc-900/60 hover:bg-zinc-800 hover:text-zinc-400'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Model Name */}
                    <div
                      className={`font-bold text-xs sm:text-sm truncate my-1 ${
                        isActive ? theme.textActive : 'text-zinc-500'
                      }`}
                    >
                      {slot.modelName}
                    </div>

                    {/* Model Selector Dropdown (Advanced 모드에서만 노출) */}
                    {viewMode !== 'live' && (
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
                    )}

                    {/* Status Indicator */}
                    <div className="text-[10px] font-mono mt-1 flex items-center justify-between">
                      {isActive ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ON
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                          OFF
                        </span>
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
      </div>

      {/* Detailed Parameter Rack */}
      <SlotParameterRack onParamChange={onParamChange} />
    </section>
  );
};
