import React from 'react';
import { useAppStore } from '../core/store';
import { Bluetooth, Radio, Cpu, Sparkles } from 'lucide-react';

interface HeaderProps {
  onConnectBle: () => void;
  onDisconnectBle: () => void;
  onConnectMidi: () => void;
  onDisconnectMidi: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onConnectBle,
  onDisconnectBle,
  onConnectMidi,
  onDisconnectMidi,
}) => {
  const {
    isMockMode,
    setMockMode,
    bleStatus,
    bleDeviceName,
    midiStatus,
    midiDeviceName,
  } = useAppStore();

  const isBleConnected = bleStatus === 'connected';
  const isMidiConnected = midiStatus === 'connected';

  return (
    <header className="border-b border-cortex-border bg-cortex-dark/90 backdrop-blur px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cortex-cyan to-cortex-purple flex items-center justify-center shadow-lg shadow-cortex-cyan/20">
            <Cpu className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider text-white">NADO CORTEX</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cortex-cyan/20 text-cortex-cyan border border-cortex-cyan/30 font-mono">
                v0.0.1
              </span>
            </div>
            <p className="text-xs text-cortex-muted">Nano Cortex & Livtra Nexfoot Realtime Bridge</p>
          </div>
        </div>

        {/* Mode Toggle & Device Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mock Mode Switch */}
          <button
            onClick={() => setMockMode(!isMockMode)}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              isMockMode
                ? 'bg-cortex-purple/20 border-cortex-purple text-cortex-purpleHover font-medium shadow-sm shadow-cortex-purple/30'
                : 'bg-cortex-panel border-cortex-border text-cortex-muted hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>가상 Mock 모드: {isMockMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* BLE Connection Button */}
          <button
            onClick={isBleConnected ? onDisconnectBle : onConnectBle}
            disabled={bleStatus === 'connecting'}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
              isBleConnected
                ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 shadow-emerald-900/30'
                : bleStatus === 'connecting'
                ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 animate-pulse'
                : 'bg-cortex-panel border-cortex-border text-slate-300 hover:border-cortex-cyan hover:text-cortex-cyan'
            }`}
          >
            <Bluetooth className={`w-4 h-4 ${isBleConnected ? 'text-emerald-400' : ''}`} />
            <span>
              {isBleConnected
                ? bleDeviceName || 'Nano Cortex 연결됨'
                : bleStatus === 'connecting'
                ? 'BLE 연결 시도 중...'
                : 'Nano Cortex 연결'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isBleConnected
                  ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                  : bleStatus === 'connecting'
                  ? 'bg-amber-400'
                  : 'bg-slate-600'
              }`}
            />
          </button>

          {/* MIDI Connection Button */}
          <button
            onClick={isMidiConnected ? onDisconnectMidi : onConnectMidi}
            disabled={midiStatus === 'connecting'}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
              isMidiConnected
                ? 'bg-purple-950/60 border-purple-500/80 text-purple-300 shadow-purple-900/30'
                : midiStatus === 'connecting'
                ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 animate-pulse'
                : 'bg-cortex-panel border-cortex-border text-slate-300 hover:border-cortex-purple hover:text-cortex-purple'
            }`}
          >
            <Radio className={`w-4 h-4 ${isMidiConnected ? 'text-purple-400' : ''}`} />
            <span>
              {isMidiConnected
                ? midiDeviceName || 'Nexfoot 연결됨'
                : midiStatus === 'connecting'
                ? 'MIDI 감지 중...'
                : 'Nexfoot MIDI 연결'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isMidiConnected
                  ? 'bg-purple-400 ring-2 ring-purple-400/30'
                  : midiStatus === 'connecting'
                  ? 'bg-amber-400'
                  : 'bg-slate-600'
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
