import React, { useState } from 'react';
import { useAppStore } from '../core/store';
import { NexfootEncoderId } from '../types';
import { CircleDot, RotateCw, ChevronLeft, ChevronRight, Sliders } from 'lucide-react';
import { dynamicPagingRouter } from '../core/DynamicPagingRouter';

interface NexfootVirtualPanelProps {
  onSimulateRotate?: (id: NexfootEncoderId, value: number) => void;
  onSimulatePush?: (id: NexfootEncoderId, isPushed: boolean) => void;
}

export const NexfootVirtualPanel: React.FC<NexfootVirtualPanelProps> = ({
  onSimulateRotate,
  onSimulatePush,
}) => {
  const {
    nexfootStates,
    isMockMode,
    selectedSlotId,
    cortexSlots,
    paramPageIndex,
    nextParamPage,
    prevParamPage,
    activeProfile,
  } = useAppStore();

  const slot = cortexSlots.find((s) => s.slotId === selectedSlotId);
  const totalPages = dynamicPagingRouter.getTotalPages(slot?.modelId);
  const pagedMappings = dynamicPagingRouter.getCurrentPageMappings(slot?.modelId);

  return (
    <section className="bg-cortex-card border border-cortex-border rounded-2xl p-5 sm:p-6 shadow-xl">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-cortex-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <CircleDot className="w-5 h-5 text-cortex-purple" />
          <h2 className="text-base font-bold text-white tracking-wide">
            LIVTRA NEXFOOT 가상 패널
          </h2>
          <span className="text-xs text-cortex-muted hidden sm:inline">
            (4x 푸시-로터리 엔코더 풋스위치)
          </span>
        </div>

        {/* Dynamic Paging Indicator Bar */}
        <div className="flex items-center gap-2 bg-cortex-panel px-3 py-1.5 rounded-xl border border-cortex-border">
          <Sliders className="w-4 h-4 text-cortex-purple" />
          <span className="text-xs text-cortex-muted">현재 제어 슬롯:</span>
          <span className="text-xs font-bold text-cortex-cyan">
            {slot?.modelName || selectedSlotId}
          </span>
          <div className="flex items-center gap-1 bg-cortex-dark px-1.5 py-0.5 rounded border border-cortex-border ml-1">
            <button
              onClick={prevParamPage}
              disabled={totalPages <= 1}
              className="p-0.5 text-cortex-muted hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold text-cortex-purpleHover px-1">
              Page {paramPageIndex + 1}/{totalPages}
            </span>
            <button
              onClick={nextParamPage}
              disabled={totalPages <= 1}
              className="p-0.5 text-cortex-muted hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Encoders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {([1, 2, 3, 4] as NexfootEncoderId[]).map((id) => {
          const mapping = pagedMappings[id - 1];
          const pushBinding = activeProfile.bindings.find((b) => b.swId === `sw${id}` && b.type === 'push');

          return (
            <DynamicEncoderCard
              key={id}
              id={id}
              state={nexfootStates[id]}
              paramDef={mapping?.parameter ?? null}
              currentValue={mapping?.currentValue ?? 0.5}
              formattedValue={mapping?.formattedValue ?? 'None'}
              pushBinding={pushBinding}
              isMockMode={isMockMode}
              onRotate={(val) => onSimulateRotate?.(id, val)}
              onPush={(pushed) => onSimulatePush?.(id, pushed)}
            />
          );
        })}
      </div>
    </section>
  );
};

interface DynamicEncoderCardProps {
  id: NexfootEncoderId;
  state: ReturnType<typeof useAppStore.getState>['nexfootStates'][1];
  paramDef: any;
  currentValue: number; // 0.0 ~ 1.0
  formattedValue: string;
  pushBinding?: any;
  isMockMode: boolean;
  onRotate: (val: number) => void;
  onPush: (isPushed: boolean) => void;
}

const DynamicEncoderCard: React.FC<DynamicEncoderCardProps> = ({
  id,
  state,
  paramDef,
  currentValue,
  formattedValue,
  pushBinding,
  isMockMode,
  onRotate,
  onPush,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [startVal, setStartVal] = useState(0);

  // Normalize 0.0 ~ 1.0 to -135deg ~ +135deg (total 270 degrees)
  const angle = currentValue * 270 - 135;
  const ccNumbers = { 1: 57, 2: 58, 3: 59, 4: 60 };
  const pushCcNumbers = { 1: 21, 2: 22, 3: 23, 4: 24 };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMockMode) return;
    setIsDragging(true);
    setDragStartY(e.clientY);
    setStartVal(currentValue * 127);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaY = dragStartY - e.clientY;
    const nextVal = Math.max(0, Math.min(127, startVal + deltaY));
    onRotate(nextVal);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const pushLabel = pushBinding
    ? pushBinding.targetType === 'page_nav'
      ? 'Next Page'
      : pushBinding.targetSlotId
      ? `${pushBinding.targetSlotId} Toggle`
      : 'Custom Push'
    : id === 4
    ? 'Next Page'
    : `Slot ${id} Toggle`;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative bg-cortex-panel/90 border border-cortex-border/80 rounded-xl p-4 flex flex-col items-center justify-between transition-all ${
        state.isPushed
          ? 'ring-2 ring-cortex-purple shadow-lg shadow-cortex-purple/20'
          : 'hover:border-cortex-purple/50'
      }`}
    >
      {/* Top Header: SW Label & Target Param */}
      <div className="w-full flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-cortex-purple bg-cortex-purple/15 px-2 py-0.5 rounded border border-cortex-purple/30">
            SW {id}
          </span>
          <span className="text-[10px] font-mono text-cortex-muted">CC {ccNumbers[id]}</span>
        </div>
        <span className="text-cortex-cyan font-bold truncate max-w-[110px]">
          {paramDef ? paramDef.name : '(할당 없음)'}
        </span>
      </div>

      {/* Rotary Knob Visual */}
      <div
        onMouseDown={handleMouseDown}
        className={`relative w-28 h-28 my-2 flex items-center justify-center cursor-pointer select-none group ${
          isMockMode ? 'cursor-ns-resize' : ''
        }`}
        title={isMockMode ? '위아래로 드래그하여 회전' : ''}
      >
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="44"
            className="stroke-cortex-border fill-transparent"
            strokeWidth="6"
            strokeDasharray="207 70"
            strokeLinecap="round"
          />
          <circle
            cx="56"
            cy="56"
            r="44"
            className="stroke-cortex-purple fill-transparent transition-all duration-75"
            strokeWidth="6"
            strokeDasharray={`${currentValue * 207} 277`}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Knob Body */}
        <div
          className="absolute w-20 h-20 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 shadow-inner flex items-center justify-center transition-transform duration-75"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="w-2 h-2 rounded-full bg-cortex-purple shadow-sm shadow-cortex-purple -translate-y-6" />
        </div>

        {/* Value Text Overlay */}
        <div className="absolute flex flex-col items-center pointer-events-none">
          <span className="text-sm font-black font-mono text-white tracking-tight">
            {formattedValue}
          </span>
          <span className="text-[10px] text-cortex-muted uppercase font-mono">
            {Math.round(currentValue * 100)}%
          </span>
        </div>
      </div>

      {/* Push Switch Button */}
      <button
        type="button"
        onMouseDown={() => {
          if (isMockMode) onPush(true);
        }}
        onMouseUp={() => {
          if (isMockMode) onPush(false);
        }}
        className={`w-full mt-2 py-2 px-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-2 border ${
          state.isPushed
            ? 'bg-cortex-purple text-white border-cortex-purple shadow-md shadow-cortex-purple/40 scale-[0.98]'
            : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            state.isPushed ? 'bg-white animate-ping' : 'bg-slate-500'
          }`}
        />
        <span>PUSH: {state.isPushed ? 'ACTIVE' : 'OFF'}</span>
      </button>

      {/* Mapping Info Footer */}
      <div className="w-full mt-3 pt-2.5 border-t border-cortex-border/50 text-[11px] text-cortex-muted space-y-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <RotateCw className="w-3 h-3 text-cortex-purple" /> 노브:
          </span>
          <span className="text-slate-200 font-mono font-medium truncate max-w-[110px]">
            {paramDef ? paramDef.name : 'Unassigned'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <CircleDot className="w-3 h-3 text-emerald-400" /> 푸시 (CC {pushCcNumbers[id]}):
          </span>
          <span className="text-slate-200 font-mono font-medium truncate max-w-[110px]">
            {pushLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
