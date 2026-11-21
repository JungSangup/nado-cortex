import React, { useState } from 'react';
import { useAppStore } from '../core/store';
import { NexfootEncoderId } from '../types';
import { CircleDot, RotateCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Sliders, Footprints, Target } from 'lucide-react';
import { dynamicPagingRouter } from '../core/DynamicPagingRouter';
import { expressionRouter } from '../core/ExpressionRouter';

interface NexfootVirtualPanelProps {
  onSimulateRotate?: (id: NexfootEncoderId, value: number) => void;
  onSimulatePush?: (id: NexfootEncoderId, isPushed: boolean) => void;
  onSimulateExp?: (value: number) => void;
}

export const NexfootVirtualPanel: React.FC<NexfootVirtualPanelProps> = ({
  onSimulateRotate,
  onSimulatePush,
  onSimulateExp,
}) => {
  const {
    nexfootStates,
    expValue,
    isMockMode,
    selectedSlotId,
    cortexSlots,
    paramPageIndex,
    nextParamPage,
    prevParamPage,
    activeProfile,
    nexfootExpanded,
    toggleNexfootExpanded,
    midiLearnState,
    startMidiLearn,
    cancelMidiLearn,
  } = useAppStore();

  const slot = cortexSlots.find((s) => s.slotId === selectedSlotId);
  const totalPages = dynamicPagingRouter.getTotalPages(slot?.modelId);
  const pagedMappings = dynamicPagingRouter.getCurrentPageMappings(slot?.modelId);
  const expTarget = expressionRouter.resolveTarget();

  const expBinding = activeProfile.bindings.find((b) => b.swId === 'exp');
  const expCc = expBinding ? expBinding.ccNumber : 1;
  const isLearningExp = midiLearnState.active && midiLearnState.target?.type === 'exp_pedal';

  const handleExpChange = (val: number) => {
    if (onSimulateExp) {
      onSimulateExp(val);
    } else {
      expressionRouter.handleExpressionMidi(val);
    }
  };

  return (
    <section className="bg-cortex-card border border-cortex-border rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-cortex-border/60 pb-3.5">
        <div className="flex items-center gap-2">
          <CircleDot className="w-5 h-5 text-cortex-purple" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
            Livtra Nexfoot
          </h2>
          <span className="text-xs text-cortex-muted hidden sm:inline">
            (4x Encoders + 1x Expression • 원터치 MIDI Learn 지원)
          </span>
        </div>

        {/* Right Utility: Paging Indicator & Accordion Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Dynamic Paging Indicator Bar */}
          <div className="flex items-center gap-2 bg-cortex-panel px-3 py-1 rounded-xl border border-cortex-border">
            <Sliders className="w-3.5 h-3.5 text-cortex-purple" />
            <span className="text-xs text-cortex-muted">제어 슬롯:</span>
            <span className="text-xs font-bold text-cortex-cyan truncate max-w-[120px]">
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

          {/* Accordion Toggle Button */}
          <button
            onClick={toggleNexfootExpanded}
            className="flex items-center gap-1 text-xs font-bold text-cortex-purple hover:text-cortex-purpleHover bg-cortex-purple/10 hover:bg-cortex-purple/20 px-2.5 py-1 rounded-xl border border-cortex-purple/30 transition-all"
            title={nexfootExpanded ? 'Nexfoot 패널 접기' : 'Nexfoot 패널 펼치기'}
          >
            <span>{nexfootExpanded ? '패널 접기' : '패널 펼치기'}</span>
            {nexfootExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Grid: 4 Encoders + 1 EXP Pedal Card (Collapsible) */}
      {nexfootExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 animate-in fade-in duration-150">
          {([1, 2, 3, 4] as NexfootEncoderId[]).map((id) => {
            const mapping = pagedMappings[id - 1];
            const swKey = `sw${id}` as 'sw1' | 'sw2' | 'sw3' | 'sw4';
            const pushBinding = activeProfile.bindings.find((b) => b.swId === swKey && b.type === 'push');
            const rotBinding = activeProfile.bindings.find((b) => b.swId === swKey && b.type === 'rotate');

            return (
              <DynamicEncoderCard
                key={id}
                id={id}
                state={nexfootStates[id]}
                paramDef={mapping?.parameter ?? null}
                currentValue={mapping?.currentValue ?? 0.5}
                formattedValue={mapping?.formattedValue ?? 'None'}
                pushBinding={pushBinding}
                rotBinding={rotBinding}
                isMockMode={isMockMode}
                onRotate={(val) => onSimulateRotate?.(id, val)}
                onPush={(pushed) => onSimulatePush?.(id, pushed)}
              />
            );
          })}

          {/* 5. Expression Pedal Card with Direct MIDI Learn */}
          <div className={`bg-cortex-panel/90 border rounded-xl p-4 flex flex-col justify-between transition-all ${
            isLearningExp
              ? 'border-amber-400 bg-amber-950/30 shadow-lg shadow-amber-400/20'
              : 'border-cortex-border/80 hover:border-cortex-cyan/50'
          }`}>
            {/* Card Top */}
            <div className="w-full flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-cortex-cyan" />
                <span className="font-mono font-bold text-cortex-cyan bg-cortex-cyan/15 px-2 py-0.5 rounded border border-cortex-cyan/30">
                  EXP IN
                </span>
              </div>
              
              {/* EXP Learn Button */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-cortex-muted">CC {expCc}</span>
                <button
                  onClick={() => {
                    if (isLearningExp) cancelMidiLearn();
                    else startMidiLearn({ type: 'exp_pedal', swId: 'exp' });
                  }}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-all flex items-center gap-1 ${
                    isLearningExp
                      ? 'bg-amber-500 text-black font-bold border-amber-400 animate-pulse'
                      : 'bg-cortex-dark text-cortex-muted border-cortex-border hover:text-white hover:border-cortex-cyan/50'
                  }`}
                  title={isLearningExp ? '학습 취소' : 'EXP 페달 MIDI Learn (페달 밟아 감지)'}
                >
                  <Target className="w-2.5 h-2.5" />
                  <span>{isLearningExp ? 'Learn...' : 'Learn'}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] font-bold text-white truncate my-1" title={expTarget.label}>
              {expTarget.label}
            </div>

            {/* Vertical Expression Pedal Meter / Slider */}
            <div className="my-2 flex flex-col items-center justify-center">
              <div className="text-2xl font-black font-mono text-cortex-cyan">
                {Math.round((expValue / 127) * 100)}%
              </div>
              <span className="text-[10px] font-mono text-cortex-muted mb-2">
                Val: {expValue} / 127
              </span>

              {/* Range Slider for EXP */}
              <input
                type="range"
                min="0"
                max="127"
                value={expValue}
                onChange={(e) => handleExpChange(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cortex-cyan focus:outline-none"
              />
            </div>

            {/* Bottom Info */}
            <div className="w-full mt-3 pt-2.5 border-t border-cortex-border/50 text-[10px] font-mono text-cortex-muted flex items-center justify-between">
              <span>Target: {expTarget.slotId}</span>
              <span className="text-emerald-400">Continuous</span>
            </div>
          </div>
        </div>
      )}
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
  rotBinding?: any;
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
  rotBinding,
  isMockMode,
  onRotate,
  onPush,
}) => {
  const { midiLearnState, startMidiLearn, cancelMidiLearn } = useAppStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [startVal, setStartVal] = useState(0);

  const angle = currentValue * 270 - 135;
  const swKey = `sw${id}` as 'sw1' | 'sw2' | 'sw3' | 'sw4';

  const rotateCc = rotBinding ? rotBinding.ccNumber : 56 + id;
  const pushCc = pushBinding ? pushBinding.ccNumber : 20 + id;

  const isLearningRotate =
    midiLearnState.active &&
    (midiLearnState.target?.type === 'sw_rotate' || midiLearnState.target?.type === 'slot_param') &&
    midiLearnState.target.swId === swKey;

  const isLearningPush =
    midiLearnState.active &&
    (midiLearnState.target?.type === 'sw_push' ||
      midiLearnState.target?.type === 'slot_toggle' ||
      midiLearnState.target?.type === 'page_nav') &&
    midiLearnState.target.swId === swKey;

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
      className={`relative bg-cortex-panel/90 border rounded-xl p-3.5 flex flex-col items-center justify-between transition-all ${
        isLearningRotate || isLearningPush
          ? 'border-amber-400 bg-amber-950/20 ring-2 ring-amber-400 shadow-lg shadow-amber-400/20'
          : state.isPushed
          ? 'border-cortex-purple ring-2 ring-cortex-purple shadow-lg shadow-cortex-purple/20'
          : 'border-cortex-border/80 hover:border-cortex-purple/50'
      }`}
    >
      {/* Top Header: SW Label & Rotate CC Learn */}
      <div className="w-full flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-cortex-purple bg-cortex-purple/15 px-1.5 py-0.5 rounded border border-cortex-purple/30">
            SW {id}
          </span>
          <span className="text-[10px] font-mono text-cortex-muted">CC {rotateCc}</span>
          
          {/* Rotate CC Learn Button */}
          <button
            onClick={() => {
              if (isLearningRotate) cancelMidiLearn();
              else startMidiLearn({ type: 'sw_rotate', swId: swKey });
            }}
            className={`text-[9px] font-mono px-1 py-0.5 rounded border transition-all flex items-center gap-0.5 ${
              isLearningRotate
                ? 'bg-amber-500 text-black font-bold border-amber-400 animate-pulse'
                : 'bg-cortex-dark text-cortex-muted border-cortex-border hover:text-white hover:border-cortex-purple/50'
            }`}
            title={isLearningRotate ? '학습 취소' : `SW ${id} 노브 회전 CC 학습 (노브 돌려 감지)`}
          >
            <Target className="w-2.5 h-2.5" />
            <span>{isLearningRotate ? '...' : 'Learn'}</span>
          </button>
        </div>

        <span className="text-cortex-cyan font-bold truncate max-w-[80px]">
          {paramDef ? paramDef.name : '(할당 없음)'}
        </span>
      </div>

      {/* Rotary Knob Visual - 7 o'clock to 4 o'clock (270° Sweep) */}
      <div
        onMouseDown={handleMouseDown}
        className={`relative w-24 h-24 my-1.5 flex items-center justify-center cursor-pointer select-none group ${
          isMockMode ? 'cursor-ns-resize' : ''
        }`}
        title={isMockMode ? '위아래로 드래그하여 회전' : ''}
      >
        {/* SVG Arc: Rotated 135deg so stroke starts at 7 o'clock and sweeps 270° to 4 o'clock */}
        <svg className="w-full h-full transform rotate-[135deg]">
          <circle
            cx="48"
            cy="48"
            r="38"
            className="stroke-cortex-border fill-transparent"
            strokeWidth="5"
            strokeDasharray="179 60"
            strokeLinecap="round"
          />
          <circle
            cx="48"
            cy="48"
            r="38"
            className="stroke-cortex-purple fill-transparent transition-all duration-75"
            strokeWidth="5"
            strokeDasharray={`${currentValue * 179} 240`}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Knob Body */}
        <div
          className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 shadow-inner flex items-center justify-center transition-transform duration-75"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-cortex-purple shadow-sm shadow-cortex-purple -translate-y-5" />
        </div>

        {/* Value Text Overlay */}
        <div className="absolute flex flex-col items-center pointer-events-none">
          <span className="text-xs font-black font-mono text-white tracking-tight">
            {formattedValue}
          </span>
          <span className="text-[9px] text-cortex-muted uppercase font-mono">
            {Math.round(currentValue * 100)}%
          </span>
        </div>

        {/* 7 o'clock (0%) & 4 o'clock (100%) Physical Stompbox Markers */}
        <div className="absolute inset-0 pointer-events-none flex items-end justify-between px-2 pb-0.5 text-[8px] font-mono text-slate-400 font-bold">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Push Switch Button & Push CC Learn */}
      <div className="w-full mt-1.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (isMockMode) onPush(!state.isPushed);
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 border ${
            state.isPushed
              ? 'bg-cortex-purple text-white border-cortex-purple shadow-md shadow-cortex-purple/40 scale-[0.98]'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              state.isPushed ? 'bg-white animate-ping' : 'bg-slate-500'
            }`}
          />
          <span>PUSH: {state.isPushed ? 'ON' : 'OFF'}</span>
        </button>

        {/* Push CC Learn Button */}
        <button
          onClick={() => {
            if (isLearningPush) cancelMidiLearn();
            else startMidiLearn({ type: 'sw_push', swId: swKey });
          }}
          className={`text-[10px] font-mono px-2 py-1.5 rounded-lg border transition-all flex items-center gap-1 shrink-0 ${
            isLearningPush
              ? 'bg-amber-500 text-black font-bold border-amber-400 animate-pulse'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-cortex-muted hover:text-white border-slate-700'
          }`}
          title={isLearningPush ? '학습 취소' : `SW ${id} 푸시 스위치 CC 학습 (스위치 밟아 감지)`}
        >
          <Target className="w-3 h-3" />
          <span className="text-[9px]">{isLearningPush ? '...' : `CC ${pushCc}`}</span>
        </button>
      </div>

      {/* Mapping Info Footer */}
      <div className="w-full mt-2.5 pt-2 border-t border-cortex-border/50 text-[10px] text-cortex-muted space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <RotateCw className="w-2.5 h-2.5 text-cortex-purple" /> 노브:
          </span>
          <span className="text-slate-200 font-mono font-medium truncate max-w-[90px]">
            {paramDef ? paramDef.name : 'Unassigned'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <CircleDot className="w-2.5 h-2.5 text-emerald-400" /> 푸시 ({pushCc}):
          </span>
          <span className="text-slate-200 font-mono font-medium truncate max-w-[90px]">
            {pushLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
