import React from 'react';
import { useAppStore } from '../core/store';
import { Sliders, Volume2, Power, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { CortexSlotId } from '../types';
import { getModelsForSlot } from '../core/DeviceCatalog';
import { SlotParameterRack } from './SlotParameterRack';

interface CortexMonitorPanelProps {
  onToggleSlot?: (slotId: CortexSlotId) => void;
  onChangePreset?: (presetIndex: number) => void;
  onChangeModel?: (slotId: CortexSlotId, modelId: string) => void;
  onParamChange?: (slotId: CortexSlotId, paramIndex: number, value: number) => void;
}

export const CortexMonitorPanel: React.FC<CortexMonitorPanelProps> = ({
  onToggleSlot,
  onChangePreset,
  onChangeModel,
  onParamChange,
}) => {
  const {
    currentPresetIndex,
    setCurrentPresetIndex,
    cortexSlots,
    selectedSlotId,
    setSelectedSlotId,
    toggleSlotBypass,
    setSlotModel,
  } = useAppStore();

  const handlePrevPreset = () => {
    const nextIdx = Math.max(0, currentPresetIndex - 1);
    setCurrentPresetIndex(nextIdx);
    if (onChangePreset) onChangePreset(nextIdx);
  };

  const handleNextPreset = () => {
    const nextIdx = Math.min(63, currentPresetIndex + 1);
    setCurrentPresetIndex(nextIdx);
    if (onChangePreset) onChangePreset(nextIdx);
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

  return (
    <section className="bg-cortex-card border border-cortex-border rounded-2xl p-5 sm:p-6 shadow-xl">
      {/* Panel Top Header: Title & Preset Controller */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-cortex-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-cortex-cyan" />
          <h2 className="text-base font-bold text-white tracking-wide">
            NANO CORTEX 실시간 모니터 & 컨트롤러
          </h2>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 bg-cortex-panel px-3 py-1.5 rounded-xl border border-cortex-border">
          <Volume2 className="w-4 h-4 text-cortex-cyan" />
          <span className="text-xs text-cortex-muted font-medium">프리셋:</span>
          
          <button
            onClick={handlePrevPreset}
            disabled={currentPresetIndex <= 0}
            className="p-1 rounded text-cortex-muted hover:text-white disabled:opacity-30 disabled:hover:text-cortex-muted transition-all"
            title="이전 프리셋"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={currentPresetIndex}
            onChange={handlePresetSelect}
            className="bg-cortex-dark text-xs font-mono font-bold text-white px-2 py-1 rounded-lg border border-cortex-border focus:outline-none focus:border-cortex-cyan"
          >
            {Array.from({ length: 64 }).map((_, i) => (
              <option key={i} value={i}>
                [{String(i + 1).padStart(2, '0')}] Preset {String(i + 1).padStart(2, '0')}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextPreset}
            disabled={currentPresetIndex >= 63}
            className="p-1 rounded text-cortex-muted hover:text-white disabled:opacity-30 disabled:hover:text-cortex-muted transition-all"
            title="다음 프리셋"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Signal Chain Blocks */}
      <div>
        <div className="text-xs font-semibold text-cortex-muted mb-3 uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cortex-cyan" />
            <span>시그널 체인 슬롯 (클릭하여 상세 파라미터 확인)</span>
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
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                  isSelected
                    ? 'ring-2 ring-cortex-cyan border-cortex-cyan bg-cortex-panel shadow-lg shadow-cortex-cyan/20'
                    : isActive
                    ? 'bg-cortex-panel/70 border-cortex-border/80 hover:border-cortex-cyan/40'
                    : 'bg-cortex-panel/30 border-cortex-border/40 opacity-60'
                }`}
              >
                {/* Slot Top: Label & Bypass Power Button */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-mono text-cortex-muted font-bold">
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

                {/* Model Name & Category */}
                <div className="font-bold text-xs text-white truncate my-1">
                  {slot.modelName}
                </div>

                {/* Model Selector Dropdown */}
                <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={slot.modelId}
                    onChange={(e) => handleModelChange(slot.slotId, e.target.value)}
                    className="w-full bg-cortex-dark/90 text-[10px] text-cortex-muted hover:text-white px-1.5 py-1 rounded border border-cortex-border focus:outline-none focus:border-cortex-cyan truncate"
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

      {/* Detailed Parameter Rack (Connected to Selected Slot) */}
      <SlotParameterRack onParamChange={onParamChange} />
    </section>
  );
};
