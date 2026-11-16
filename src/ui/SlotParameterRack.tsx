import React from 'react';
import { useAppStore } from '../core/store';
import { CORTEX_SLOT_CONFIGS, DEVICE_CATALOG } from '../core/DeviceCatalog';
import { dynamicPagingRouter } from '../core/DynamicPagingRouter';
import { Sliders, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { CortexSlotId } from '../types';

interface SlotParameterRackProps {
  onParamChange?: (slotId: CortexSlotId, paramIndex: number, value: number) => void;
}

export const SlotParameterRack: React.FC<SlotParameterRackProps> = ({ onParamChange }) => {
  const {
    selectedSlotId,
    cortexSlots,
    paramPageIndex,
    nextParamPage,
    prevParamPage,
    midiLearnState,
    startMidiLearn,
    cancelMidiLearn,
    updateSlotParamValue,
  } = useAppStore();

  const currentSlot = cortexSlots.find((s) => s.slotId === selectedSlotId);
  const slotConfig = CORTEX_SLOT_CONFIGS[selectedSlotId];
  const modelId = currentSlot?.modelId || slotConfig?.defaultModelId || 'ts9_overdrive';
  const model = DEVICE_CATALOG[modelId];

  if (!model) {
    return null;
  }

  const allParams = model.parameters;
  const totalPages = Math.max(1, Math.ceil(allParams.length / 4));
  const startIndex = paramPageIndex * 4;
  const currentAssignedIndices = [startIndex, startIndex + 1, startIndex + 2, startIndex + 3];

  const handleSliderChange = (paramIndex: number, val: number) => {
    updateSlotParamValue(selectedSlotId, paramIndex, val);
    if (onParamChange) {
      onParamChange(selectedSlotId, paramIndex, val);
    }
  };

  return (
    <div className="mt-4 bg-cortex-panel/90 border border-cortex-border rounded-xl p-4 sm:p-5 shadow-inner">
      {/* Header with Title and Paging Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-cortex-border/70 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cortex-cyan" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            상세 파라미터 랙: <span className="text-cortex-cyan">{model.name}</span>
          </h3>
          <span className="text-[11px] font-mono text-cortex-muted bg-cortex-dark px-2 py-0.5 rounded border border-cortex-border">
            총 {allParams.length}개 파라미터
          </span>
        </div>

        {/* Paging Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-cortex-muted font-medium hidden sm:inline">Nexfoot 노브 페이징:</span>
          <div className="flex items-center gap-1.5 bg-cortex-dark px-2 py-1 rounded-lg border border-cortex-border">
            <button
              onClick={prevParamPage}
              disabled={totalPages <= 1}
              className="p-1 rounded text-cortex-muted hover:text-white disabled:opacity-30 disabled:hover:text-cortex-muted transition-all"
              title="이전 페이지"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-cortex-cyan px-2">
              Page {paramPageIndex + 1} / {totalPages}
            </span>
            <button
              onClick={nextParamPage}
              disabled={totalPages <= 1}
              className="p-1 rounded text-cortex-muted hover:text-white disabled:opacity-30 disabled:hover:text-cortex-muted transition-all"
              title="다음 페이지"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Parameter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {allParams.map((param) => {
          const val = dynamicPagingRouter.getParameterValue(selectedSlotId, param.paramIndex, param.defaultValue);
          const formatted = param.valueFormat ? param.valueFormat(val) : `${Math.round(val * 100)}%`;

          // Determine which SW encoder controls this param on current page (if any)
          const assignedSwIndex = currentAssignedIndices.indexOf(param.paramIndex);
          const isAssignedToEncoder = assignedSwIndex !== -1;
          const assignedSwLabel = isAssignedToEncoder ? `SW ${assignedSwIndex + 1}` : null;

          const isLearningThis =
            midiLearnState.active &&
            midiLearnState.target?.type === 'slot_param' &&
            midiLearnState.target.slotId === selectedSlotId &&
            midiLearnState.target.paramIndex === param.paramIndex;

          return (
            <div
              key={param.id}
              className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                isLearningThis
                  ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/20 animate-pulse'
                  : isAssignedToEncoder
                  ? 'bg-cortex-dark/80 border-cortex-cyan/40 shadow-sm'
                  : 'bg-cortex-dark/40 border-cortex-border/50 opacity-80'
              }`}
            >
              {/* Card Top: Param Name & SW Encoder Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white tracking-wide truncate">
                  {param.name}
                </span>

                <div className="flex items-center gap-1.5">
                  {isAssignedToEncoder && (
                    <span className="text-[10px] font-mono font-bold bg-cortex-cyan/20 text-cortex-cyan px-1.5 py-0.5 rounded border border-cortex-cyan/30">
                      {assignedSwLabel}
                    </span>
                  )}

                  {/* MIDI Learn Button */}
                  <button
                    onClick={() => {
                      if (isLearningThis) {
                        cancelMidiLearn();
                      } else {
                        startMidiLearn({
                          type: 'slot_param',
                          slotId: selectedSlotId,
                          paramIndex: param.paramIndex,
                          swId: isAssignedToEncoder ? (`sw${assignedSwIndex + 1}` as any) : 'sw1',
                        });
                      }
                    }}
                    title={isLearningThis ? '학습 취소' : 'MIDI Learn (노브 돌려 감지)'}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-all flex items-center gap-1 ${
                      isLearningThis
                        ? 'bg-amber-500 text-black font-bold border-amber-400'
                        : 'bg-cortex-panel text-cortex-muted border-cortex-border hover:text-white hover:border-cortex-border/90'
                    }`}
                  >
                    <Target className="w-2.5 h-2.5" />
                    <span>{isLearningThis ? 'Learn...' : 'Learn'}</span>
                  </button>
                </div>
              </div>

              {/* Value Display */}
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[11px] font-mono text-cortex-muted">실제값</span>
                <span className="text-sm font-mono font-black text-cortex-cyan">{formatted}</span>
              </div>

              {/* Interactive Range Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={val}
                onChange={(e) => handleSliderChange(param.paramIndex, parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cortex-cyan focus:outline-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
