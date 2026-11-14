import React, { useState } from 'react';
import { useAppStore } from '../core/store';
import { NexfootEncoderId } from '../types';
import { RotateCw, CircleDot } from 'lucide-react';

interface NexfootVirtualPanelProps {
  onSimulateRotate?: (id: NexfootEncoderId, value: number) => void;
  onSimulatePush?: (id: NexfootEncoderId, isPushed: boolean) => void;
}

export const NexfootVirtualPanel: React.FC<NexfootVirtualPanelProps> = ({
  onSimulateRotate,
  onSimulatePush,
}) => {
  const { nexfootStates, mappings, isMockMode } = useAppStore();

  return (
    <section className="bg-cortex-card border border-cortex-border rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <CircleDot className="w-5 h-5 text-cortex-purple" />
          <h2 className="text-base font-bold text-white tracking-wide">
            LIVTRA NEXFOOT 컨트롤러
          </h2>
          <span className="text-xs text-cortex-muted">
            (4x Push-Rotary Footswitches)
          </span>
        </div>
        {isMockMode && (
          <span className="text-xs bg-cortex-purple/20 text-cortex-purpleHover border border-cortex-purple/40 px-2.5 py-1 rounded-full font-mono">
            가상 조작 가능 (클릭/드래그)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {([1, 2, 3, 4] as NexfootEncoderId[]).map((id) => (
          <EncoderCard
            key={id}
            id={id}
            state={nexfootStates[id]}
            mapping={mappings[id]}
            isMockMode={isMockMode}
            onRotate={(val) => onSimulateRotate?.(id, val)}
            onPush={(pushed) => onSimulatePush?.(id, pushed)}
          />
        ))}
      </div>
    </section>
  );
};

interface EncoderCardProps {
  id: NexfootEncoderId;
  state: ReturnType<typeof useAppStore.getState>['nexfootStates'][1];
  mapping: ReturnType<typeof useAppStore.getState>['mappings'][1];
  isMockMode: boolean;
  onRotate: (val: number) => void;
  onPush: (isPushed: boolean) => void;
}

const EncoderCard: React.FC<EncoderCardProps> = ({
  id,
  state,
  mapping,
  isMockMode,
  onRotate,
  onPush,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [startVal, setStartVal] = useState(0);

  // Map 0~127 to -135deg ~ +135deg (total 270 degrees)
  const angle = (state.rotateValue / 127) * 270 - 135;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMockMode) return;
    setIsDragging(true);
    setDragStartY(e.clientY);
    setStartVal(state.rotateValue);
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
      {/* Header */}
      <div className="w-full flex items-center justify-between text-xs mb-2">
        <span className="font-mono font-bold text-cortex-purple bg-cortex-purple/15 px-2 py-0.5 rounded border border-cortex-purple/30">
          SW {id}
        </span>
        <span className="text-cortex-muted font-medium truncate max-w-[120px]">
          {mapping?.label || 'Custom'}
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
        {/* SVG Circular Track */}
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
            strokeDasharray={`${(state.rotateValue / 127) * 207} 277`}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Knob Body */}
        <div
          className="absolute w-20 h-20 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 shadow-inner flex items-center justify-center transition-transform duration-75"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {/* Indicator Dot */}
          <div className="w-2 h-2 rounded-full bg-cortex-purple shadow-sm shadow-cortex-purple -translate-y-6" />
        </div>

        {/* Value Text Overlay */}
        <div className="absolute flex flex-col items-center pointer-events-none">
          <span className="text-xl font-black font-mono text-white tracking-tight">
            {state.rotateValue}
          </span>
          <span className="text-[10px] text-cortex-muted uppercase font-mono">
            {Math.round((state.rotateValue / 127) * 100)}%
          </span>
        </div>
      </div>

      {/* Push Button / Indicator */}
      <button
        type="button"
        onMouseDown={() => isMockMode && onPush(true)}
        onMouseUp={() => isMockMode && onPush(false)}
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
            <RotateCw className="w-3 h-3 text-cortex-purple" /> 회전:
          </span>
          <span className="text-slate-200 font-mono font-medium truncate max-w-[110px]">
            {mapping?.rotateAction.type === 'parameter'
              ? mapping.rotateAction.paramId
              : 'Preset Scroll'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <CircleDot className="w-3 h-3 text-emerald-400" /> 푸시:
          </span>
          <span className="text-slate-200 font-mono font-medium truncate max-w-[110px]">
            {mapping?.pushAction.type === 'slot_bypass'
              ? `Slot ${mapping.pushAction.slotIndex} Toggle`
              : mapping?.pushAction.type}
          </span>
        </div>
      </div>
    </div>
  );
};
