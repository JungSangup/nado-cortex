import React, { useRef } from 'react';
import { useAppStore } from '../core/store';
import { Bluetooth, Radio, Cpu, Sparkles, Download, Upload, Plus, Trash2 } from 'lucide-react';
import { profileManager } from '../core/ProfileManager';

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
    activeProfile,
    profiles,
    setActiveProfile,
    createProfile,
    importProfile,
    deleteProfile,
    addLog,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBleConnected = bleStatus === 'connected';
  const isMidiConnected = midiStatus === 'connected';

  const handleExportProfile = () => {
    const jsonStr = profileManager.exportProfileJson(activeProfile.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nado-cortex-${activeProfile.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addLog({
      direction: 'core',
      source: 'PROFILE',
      message: `Exported profile: ${activeProfile.name}`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importProfile(content);
        if (res.success) {
          addLog({
            direction: 'core',
            source: 'PROFILE',
            message: `Successfully imported profile from ${file.name}`,
          });
        } else {
          alert(`프로필 가져오기 실패: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleCreateProfile = () => {
    const name = window.prompt('새 프로필 이름을 입력하세요:', 'My Custom Profile');
    if (name && name.trim()) {
      createProfile(name.trim());
      addLog({
        direction: 'core',
        source: 'PROFILE',
        message: `Created profile: ${name.trim()}`,
      });
    }
  };

  const handleDeleteProfile = () => {
    if (profiles.length <= 1) {
      alert('최소 하나의 프로필은 유지되어야 합니다.');
      return;
    }
    if (window.confirm(`'${activeProfile.name}' 프로필을 삭제하시겠습니까?`)) {
      const name = activeProfile.name;
      deleteProfile(activeProfile.id);
      addLog({
        direction: 'core',
        source: 'PROFILE',
        message: `Deleted profile: ${name}`,
      });
    }
  };

  return (
    <header className="border-b border-cortex-border bg-cortex-dark/95 backdrop-blur px-6 py-3.5 sticky top-0 z-50">
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
                v0.0.2
              </span>
            </div>
            <p className="text-xs text-cortex-muted">Nano Cortex & Livtra Nexfoot Realtime Bridge</p>
          </div>
        </div>

        {/* Profile Manager Bar */}
        <div className="flex items-center gap-2 bg-cortex-panel px-3 py-1.5 rounded-xl border border-cortex-border">
          <span className="text-xs text-cortex-muted font-medium mr-1">프로필:</span>
          <select
            value={activeProfile.id}
            onChange={(e) => setActiveProfile(e.target.value)}
            className="bg-cortex-dark text-xs text-cortex-text font-semibold px-2.5 py-1 rounded-lg border border-cortex-border focus:outline-none focus:border-cortex-cyan"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleCreateProfile}
            title="새 프로필 생성"
            className="p-1 rounded-md text-cortex-muted hover:text-cortex-cyan hover:bg-cortex-border/50 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportProfile}
            title="프로필 JSON 내보내기"
            className="p-1 rounded-md text-cortex-muted hover:text-cortex-purpleHover hover:bg-cortex-border/50 transition-all"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="프로필 JSON 가져오기"
            className="p-1 rounded-md text-cortex-muted hover:text-emerald-400 hover:bg-cortex-border/50 transition-all"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {profiles.length > 1 && (
            <button
              onClick={handleDeleteProfile}
              title="현재 프로필 삭제"
              className="p-1 rounded-md text-cortex-muted hover:text-rose-400 hover:bg-cortex-border/50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
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
            <span>가상 Mock: {isMockMode ? 'ON' : 'OFF'}</span>
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
                ? 'BLE 연결 중...'
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
