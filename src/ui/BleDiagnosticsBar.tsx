import React from 'react';
import { useAppStore } from '../core/store';
import { Radio, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface BleDiagnosticsBarProps {
  onPingPreset?: () => void;
  onPingToggleSlot?: () => void;
}

export const BleDiagnosticsBar: React.FC<BleDiagnosticsBarProps> = ({
  onPingPreset,
  onPingToggleSlot,
}) => {
  const {
    bleStatus,
    bleTxCount,
    bleRxCount,
    lastTxDescription,
    lastRxDescription,
    lastRxHex,
    isBleTxActive,
    isBleRxActive,
    resetBleCounts,
  } = useAppStore();

  const isConnected = bleStatus === 'connected';

  return (
    <div className="mb-4 bg-cortex-dark/80 border border-cortex-border/70 rounded-xl px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
      {/* Left: Signal Activity LED & Counters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-cortex-cyan' : 'text-slate-600'}`} />
          <span className="text-[11px] font-bold text-slate-300">BLE 양방향 진단:</span>
        </div>

        {/* TX Indicator */}
        <div className="flex items-center gap-1 bg-cortex-panel px-2 py-0.5 rounded border border-cortex-border font-mono text-[11px]">
          <span
            className={`w-2 h-2 rounded-full transition-all duration-100 ${
              isBleTxActive
                ? 'bg-cortex-cyan shadow-sm shadow-cortex-cyan scale-125'
                : 'bg-cortex-cyan/30'
            }`}
          />
          <span className="font-bold text-cortex-cyan">TX</span>
          <span className="text-white font-bold ml-0.5">{bleTxCount}</span>
        </div>

        {/* RX Indicator */}
        <div className="flex items-center gap-1 bg-cortex-panel px-2 py-0.5 rounded border border-cortex-border font-mono text-[11px]">
          <span
            className={`w-2 h-2 rounded-full transition-all duration-100 ${
              isBleRxActive
                ? 'bg-emerald-400 shadow-sm shadow-emerald-400 scale-125'
                : 'bg-emerald-400/30'
            }`}
          />
          <span className="font-bold text-emerald-400">RX</span>
          <span className="text-white font-bold ml-0.5">{bleRxCount}</span>
        </div>

        {/* Reset Counter Button */}
        <button
          onClick={resetBleCounts}
          className="text-cortex-muted hover:text-white p-0.5 rounded transition-all"
          title="진단 카운터 초기화"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Middle: Last TX / RX Live Summary */}
      <div className="flex-1 min-w-[220px] flex flex-wrap sm:flex-nowrap items-center gap-3 overflow-hidden px-1">
        <div className="font-mono text-[10px] text-slate-300 truncate">
          <span className="text-cortex-cyan font-bold mr-1">최근 TX:</span>
          <span>{lastTxDescription}</span>
        </div>
        <div className="font-mono text-[10px] text-slate-300 truncate">
          <span className="text-emerald-400 font-bold mr-1">최근 RX:</span>
          <span>{lastRxDescription}</span>
          {lastRxHex && (
            <span className="text-slate-500 ml-1.5 hidden md:inline">[{lastRxHex}]</span>
          )}
        </div>
      </div>

      {/* Right: Test Ping Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-slate-400 hidden sm:inline">테스트 신호:</span>
        <button
          onClick={onPingPreset}
          className="text-[10px] font-mono font-bold bg-cortex-panel hover:bg-slate-700/60 text-cortex-cyan border border-cortex-border hover:border-cortex-cyan/50 px-2 py-0.5 rounded-lg transition-all flex items-center gap-1"
          title="현재 프리셋 신호 다시 송신하여 기기 반응 확인"
        >
          <Send className="w-2.5 h-2.5" />
          <span>Ping 프리셋</span>
        </button>

        <button
          onClick={onPingToggleSlot}
          className="text-[10px] font-mono font-bold bg-cortex-panel hover:bg-slate-700/60 text-emerald-400 border border-cortex-border hover:border-emerald-400/50 px-2 py-0.5 rounded-lg transition-all flex items-center gap-1"
          title="Pre-FX 1 바이패스 신호 송신하여 기기 릴레이/LED 반응 확인"
        >
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>Ping 슬롯</span>
        </button>
      </div>
    </div>
  );
};
