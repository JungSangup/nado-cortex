import React from 'react';
import { useAppStore } from '../core/store';
import { Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export const EventLogConsole: React.FC = () => {
  const { logs, clearLogs, logExpanded, toggleLogExpanded } = useAppStore();

  const latestLog = logs[0];

  return (
    <section className="bg-cortex-card border border-cortex-border rounded-2xl shadow-xl overflow-hidden transition-all">
      {/* Collapsible Header Bar */}
      <div
        onClick={toggleLogExpanded}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-cortex-panel/50 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            실시간 패킷 및 이벤트 로그
          </h2>
          <span className="text-xs font-mono text-cortex-muted bg-cortex-dark px-2 py-0.5 rounded border border-cortex-border">
            {logs.length} 이벤트
          </span>

          {!logExpanded && latestLog && (
            <span className="text-xs text-cortex-muted font-mono truncate max-w-md hidden md:inline ml-2">
              최신: <span className="text-slate-300">[{latestLog.source}] {latestLog.message}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={clearLogs}
            className="flex items-center gap-1.5 text-xs text-cortex-muted hover:text-white px-2.5 py-1 rounded-lg bg-cortex-panel hover:bg-slate-700 border border-cortex-border transition-colors mr-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>지우기</span>
          </button>

          <button
            onClick={toggleLogExpanded}
            className="flex items-center gap-1 text-xs text-cortex-cyan px-2.5 py-1 rounded-lg bg-cortex-cyan/10 hover:bg-cortex-cyan/20 border border-cortex-cyan/30 transition-all font-semibold"
          >
            {logExpanded ? (
              <>
                <span>접기</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>펼치기</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Log Content */}
      {logExpanded && (
        <div className="p-4 pt-0 border-t border-cortex-border/60">
          <div className="bg-slate-950/90 border border-cortex-border/70 rounded-xl p-4 font-mono text-xs h-56 overflow-y-auto space-y-1.5 mt-3">
            {logs.length === 0 ? (
              <div className="text-cortex-muted italic text-center py-20">
                아직 수신/송신된 이벤트 로그가 없습니다. 노브를 돌리거나 스위치를 눌러보세요.
              </div>
            ) : (
              logs.map((log) => {
                let badgeClass = 'bg-slate-800 text-slate-300';
                if (log.direction === 'midi_in') badgeClass = 'bg-purple-950 text-purple-300 border border-purple-800/60';
                if (log.direction === 'ble_out') badgeClass = 'bg-cyan-950 text-cyan-300 border border-cyan-800/60';
                if (log.direction === 'ble_in') badgeClass = 'bg-emerald-950 text-emerald-300 border border-emerald-800/60';
                if (log.direction === 'core') badgeClass = 'bg-blue-950 text-blue-300 border border-blue-800/60';
                if (log.direction === 'error') badgeClass = 'bg-rose-950 text-rose-300 border border-rose-800/60';

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-2.5 leading-relaxed hover:bg-slate-900/60 px-1.5 py-0.5 rounded"
                  >
                    <span className="text-slate-500 text-[11px] shrink-0">{log.timestamp}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${badgeClass}`}>
                      {log.direction.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 font-bold text-[11px] shrink-0">
                      [{log.source}]
                    </span>
                    <span className="text-slate-200 break-all">{log.message}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </section>
  );
};
