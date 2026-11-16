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

describe('useAppStore - Nexfoot Panel Toggle & LocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useAppStore.setState({ showNexfootPanel: true });
  });

  it('기본적으로 Nexfoot 패널 표시 상태는 true 여야 한다', () => {
    expect(useAppStore.getState().showNexfootPanel).toBe(true);
  });

  it('toggleNexfootPanel 호출 시 상태가 반전되고 localStorage에 저장되어야 한다', () => {
    useAppStore.getState().toggleNexfootPanel();
    expect(useAppStore.getState().showNexfootPanel).toBe(false);
    expect(localStorageMock.getItem('nado_show_nexfoot_panel')).toBe('false');

    useAppStore.getState().toggleNexfootPanel();
    expect(useAppStore.getState().showNexfootPanel).toBe(true);
    expect(localStorageMock.getItem('nado_show_nexfoot_panel')).toBe('true');
  });

  it('setShowNexfootPanel 로 직접 값을 설정할 수 있어야 한다', () => {
    useAppStore.getState().setShowNexfootPanel(false);
    expect(useAppStore.getState().showNexfootPanel).toBe(false);
    expect(localStorageMock.getItem('nado_show_nexfoot_panel')).toBe('false');
  });
});
