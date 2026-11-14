import React from 'react';
import { useAppStore } from '../core/store';
import { Sliders, Volume2, Power } from 'lucide-react';

interface CortexMonitorPanelProps {
  onToggleSlot?: (slotIndex: number) => void;
}

export const CortexMonitorPanel: React.FC<CortexMonitorPanelProps> = ({ onToggleSlot }) => {
  const {
    currentPresetIndex,
    currentPresetName,
    cortexSlots,
    toggleSlotBypass,
    cortexParameters,
  } = useAppStore();

  return (
    <section className="bg-cortex-card border border-cortex-border rounded-2xl p-6 shadow-xl">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-cortex-cyan" />
          <h2 className="text-base font-bold text-white tracking-wide">
            NANO CORTEX 실시간 모니터
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-cortex-panel px-3.5 py-1.5 rounded-xl border border-cortex-border">
          <Volume2 className="w-4 h-4 text-cortex-cyan" />
          <span className="text-xs text-cortex-muted">현재 프리셋:</span>
          <span className="text-xs font-mono font-bold text-white">
            [{String(currentPresetIndex).padStart(2, '0')}] {currentPresetName}
          </span>
        </div>
      </div>

      {/* Signal Chain Blocks */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-cortex-muted mb-3 uppercase tracking-wider">
          시그널 체인 (Signal Chain Blocks)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {cortexSlots.map((slot) => {
            const isActive = !slot.isBypassed;
            return (
              <button
                key={slot.slotIndex}
                onClick={() => onToggleSlot ? onToggleSlot(slot.slotIndex) : toggleSlotBypass(slot.slotIndex)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 ${
                  isActive
                    ? 'bg-cortex-cyan/10 border-cortex-cyan/50 text-white shadow-md shadow-cortex-cyan/10'
                    : 'bg-cortex-panel/50 border-cortex-border/60 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono text-cortex-muted">
                    SLOT {slot.slotIndex}
                  </span>
                  <Power
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-cortex-cyan animate-pulse' : 'text-slate-500'
                    }`}
                  />
                </div>
                <div className="font-bold text-xs truncate">{slot.name}</div>
                <div className="text-[10px] font-mono font-medium">
                  {isActive ? (
                    <span className="text-emerald-400 font-bold">● ACTIVE</span>
                  ) : (
                    <span className="text-slate-500">○ BYPASS</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Parameters (Controlled by Nexfoot Encoders) */}
      <div>
        <div className="text-xs font-semibold text-cortex-muted mb-3 uppercase tracking-wider flex items-center justify-between">
          <span>실시간 파라미터 모니터 (Live Parameter Feedback)</span>
          <span className="text-[11px] text-cortex-cyan font-mono lowercase">
            * 넥스풋 노브 조작 시 실시간 동기화
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(cortexParameters).map((param) => {
            const percentage = Math.round(param.value * 100);
            return (
              <div
                key={param.id}
                className="bg-cortex-panel/70 border border-cortex-border/70 rounded-xl p-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {param.name}
                  </span>
                  <span className="text-sm font-mono font-black text-cortex-cyan">
                    {percentage}
                    {param.unit || '%'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/60">
                  <div
                    className="bg-gradient-to-r from-cortex-cyan to-cortex-purple h-full rounded-full transition-all duration-100"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-cortex-muted">
                  <span>Slot {param.slotIndex}</span>
                  <span>ID: {param.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
