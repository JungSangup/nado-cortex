import { describe, it, expect, beforeEach } from 'vitest';

const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const key in mockStorage) {
      delete mockStorage[key];
    }
  },
};

(globalThis as any).localStorage = localStorageMock;
(globalThis as any).window = globalThis;

import { useAppStore } from '../src/core/store';

describe('useAppStore - View Mode (Live vs Advanced) & Accordions', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useAppStore.setState({
      viewMode: 'advanced',
      coreAmpCabExpanded: true,
      showNexfootPanel: true,
      nexfootExpanded: true,
      logExpanded: false,
    });
  });

  it('기본 모드는 advanced 여야 한다', () => {
    expect(useAppStore.getState().viewMode).toBe('advanced');
    expect(useAppStore.getState().coreAmpCabExpanded).toBe(true);
    expect(useAppStore.getState().showNexfootPanel).toBe(true);
  });

  it('setViewMode("live") 호출 시 Core 접힘, Nexfoot 숨김, 로그 접힘 상태로 전환되어야 한다', () => {
    useAppStore.getState().setViewMode('live');
    expect(useAppStore.getState().viewMode).toBe('live');
    expect(useAppStore.getState().coreAmpCabExpanded).toBe(false);
    expect(useAppStore.getState().showNexfootPanel).toBe(false);
    expect(useAppStore.getState().logExpanded).toBe(false);
    expect(localStorageMock.getItem('nado_view_mode')).toBe('live');
  });

  it('setViewMode("advanced") 호출 시 Core 펼침, Nexfoot 표시, Nexfoot 펼침 상태로 복귀되어야 한다', () => {
    useAppStore.getState().setViewMode('live');
    useAppStore.getState().setViewMode('advanced');
    expect(useAppStore.getState().viewMode).toBe('advanced');
    expect(useAppStore.getState().coreAmpCabExpanded).toBe(true);
    expect(useAppStore.getState().showNexfootPanel).toBe(true);
    expect(useAppStore.getState().nexfootExpanded).toBe(true);
    expect(localStorageMock.getItem('nado_view_mode')).toBe('advanced');
  });

  it('toggleCoreAmpCabExpanded 호출 시 Core 접기/펼치기 상태가 반전되어야 한다', () => {
    expect(useAppStore.getState().coreAmpCabExpanded).toBe(true);
    useAppStore.getState().toggleCoreAmpCabExpanded();
    expect(useAppStore.getState().coreAmpCabExpanded).toBe(false);
    useAppStore.getState().toggleCoreAmpCabExpanded();
    expect(useAppStore.getState().coreAmpCabExpanded).toBe(true);
  });

  it('toggleNexfootExpanded 호출 시 Nexfoot 아코디언 상태가 반전되어야 한다', () => {
    expect(useAppStore.getState().nexfootExpanded).toBe(true);
    useAppStore.getState().toggleNexfootExpanded();
    expect(useAppStore.getState().nexfootExpanded).toBe(false);
    useAppStore.getState().toggleNexfootExpanded();
    expect(useAppStore.getState().nexfootExpanded).toBe(true);
  });
});
