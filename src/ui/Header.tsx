import React, { useRef } from 'react';
import { useAppStore } from '../core/store';
import { Bluetooth, Radio, Cpu, Sparkles, Download, Upload, Plus, Trash2, ChevronDown, ChevronUp, Menu, Eye, EyeOff, Zap, SlidersHorizontal } from 'lucide-react';
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
    headerExpanded,
    toggleHeaderExpanded,
    showNexfootPanel,
    toggleNexfootPanel,
    viewMode,
    setViewMode,
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
    <header className="border-b border-cortex-border bg-cortex-dark/95 backdrop-blur px-4 sm:px-6 py-2.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        {/* Always visible Top Compact Bar */}
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cortex-cyan to-cortex-purple flex items-center justify-center shadow-md shadow-cortex-cyan/20">
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-wider text-white">NADO CORTEX</h1>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cortex-cyan/20 text-cortex-cyan border border-cortex-cyan/30 font-mono">
                  v0.0.5
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher Segment Control: [ Live | Advanced ] */}
          <div className="flex items-center bg-cortex-panel/90 p-0.5 rounded-xl border border-cortex-border shadow-inner">
            <button
              onClick={() => setViewMode('live')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'live'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                  : 'text-cortex-muted hover:text-white'
              }`}
              title="Live 모드: 연주에 필요한 세트리스트, 템포, FX 위주 간편 뷰"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Live</span>
            </button>
            <button
              onClick={() => setViewMode('advanced')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'advanced'
                  ? 'bg-cortex-cyan text-black shadow-md shadow-cortex-cyan/30'
                  : 'text-cortex-muted hover:text-white'
              }`}
              title="Advanced 모드: 모든 앰프/캐비닛/FX/Nexfoot 에디터 전체 노출"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Advanced</span>
            </button>
          </div>

          {/* Quick Connection Bullets & Toggle Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nexfoot Panel Show/Hide Toggle Button (Advanced 모드에서만 표시) */}
            {viewMode !== 'live' && (
              <button
                onClick={toggleNexfootPanel}
                title={showNexfootPanel ? 'Nexfoot 가상 패널 숨기기 (단독 Cortex 에디터 모드)' : 'Nexfoot 가상 패널 표시하기'}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  showNexfootPanel
                    ? 'bg-purple-950/40 border-purple-500/60 text-purple-300 font-bold hover:bg-purple-900/50'
                    : 'bg-cortex-panel border-cortex-border text-slate-400 hover:text-white hover:border-cortex-border/90'
                }`}
              >
                {showNexfootPanel ? <Eye className="w-3.5 h-3.5 text-purple-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[11px] hidden sm:inline">Nexfoot: {showNexfootPanel ? 'ON' : 'OFF'}</span>
              </button>
            )}

            {/* Quick Status Badges */}
            <div className="flex items-center gap-2 text-[11px] font-mono bg-cortex-panel/80 px-2.5 py-1 rounded-lg border border-cortex-border">
              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBleConnected ? 'bg-emerald-400 ring-2 ring-emerald-400/40' : 'bg-slate-600'
                  }`}
                />
                <span className="hidden sm:inline text-cortex-muted">BLE:</span>
                <span className={isBleConnected ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {isBleConnected ? 'Cortex' : 'Off'}
                </span>
              </span>

              <span className="text-slate-600">|</span>

              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isMidiConnected ? 'bg-purple-400 ring-2 ring-purple-400/40' : 'bg-slate-600'
                  }`}
                />
                <span className="hidden sm:inline text-cortex-muted">MIDI:</span>
                <span className={isMidiConnected ? 'text-purple-400 font-bold' : 'text-slate-400'}>
                  {isMidiConnected ? 'Nexfoot' : 'Off'}
                </span>
              </span>
            </div>

            {/* Mobile / Compact Expand Toggle Button (Advanced 모드에서만 노출) */}
            {viewMode !== 'live' && (
              <button
                onClick={toggleHeaderExpanded}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  headerExpanded
                    ? 'bg-cortex-cyan/20 border-cortex-cyan text-cortex-cyan font-bold'
                    : 'bg-cortex-panel border-cortex-border text-cortex-muted hover:text-white'
                }`}
                title="설정 및 연결 컨트롤 접기/펼치기"
              >
                <Menu className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden xs:inline">{headerExpanded ? '설정 접기' : '설정/연결'}</span>
                {headerExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Controls Drawer */}
        {viewMode !== 'live' && headerExpanded && (
          <div className="pt-3 mt-2.5 border-t border-cortex-border/70 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            {/* Profile Manager Bar */}
            <div className="flex flex-wrap items-center gap-1.5 bg-cortex-panel px-2.5 py-1 rounded-xl border border-cortex-border">
              <span className="text-[11px] text-cortex-muted font-medium mr-1">프로필:</span>
              <select
                value={activeProfile.id}
                onChange={(e) => setActiveProfile(e.target.value)}
                className="bg-cortex-dark text-xs text-cortex-text font-semibold px-2 py-0.5 rounded-lg border border-cortex-border focus:outline-none focus:border-cortex-cyan"
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
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExportProfile}
                title="프로필 JSON 내보내기"
                className="p-1 rounded-md text-cortex-muted hover:text-cortex-purpleHover hover:bg-cortex-border/50 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                title="프로필 JSON 가져오기"
                className="p-1 rounded-md text-cortex-muted hover:text-emerald-400 hover:bg-cortex-border/50 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
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
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Hardware Connection Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Mock Mode Switch */}
              <button
                onClick={() => setMockMode(!isMockMode)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
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
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
                  isBleConnected
                    ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300'
                    : bleStatus === 'connecting'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 animate-pulse'
                    : 'bg-cortex-panel border-cortex-border text-slate-300 hover:border-cortex-cyan hover:text-cortex-cyan'
                }`}
              >
                <Bluetooth className={`w-3.5 h-3.5 ${isBleConnected ? 'text-emerald-400' : ''}`} />
                <span>
                  {isBleConnected
                    ? bleDeviceName || 'Cortex 연결됨'
                    : bleStatus === 'connecting'
                    ? 'BLE 연결 중...'
                    : 'Nano Cortex 연결'}
                </span>
              </button>

              {/* MIDI Connection Button */}
              <button
                onClick={isMidiConnected ? onDisconnectMidi : onConnectMidi}
                disabled={midiStatus === 'connecting'}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
                  isMidiConnected
                    ? 'bg-purple-950/60 border-purple-500/80 text-purple-300'
                    : midiStatus === 'connecting'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 animate-pulse'
                    : 'bg-cortex-panel border-cortex-border text-slate-300 hover:border-cortex-purple hover:text-cortex-purple'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${isMidiConnected ? 'text-purple-400' : ''}`} />
                <span>
                  {isMidiConnected
                    ? midiDeviceName || 'Nexfoot 연결됨'
                    : midiStatus === 'connecting'
                    ? 'MIDI 감지 중...'
                    : 'Nexfoot 연결'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
