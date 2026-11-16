# [Tasks] v0.0.4 - 작업 목록 및 진행 상황 (WBS)

- **마일스톤**: v0.0.4
- **상태**: 완료 (Completed Phase)
- **작성일**: 2026-11-16
- **기준 계획서**: [docs/v0.0.4/plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.4/plan.md)

---

## 1. 작업 분할 및 체크리스트

### 1단계: 스토어 확장 및 상태 관리 (Store Layer)
- [x] **Task 1.1**: `src/core/store.ts`에 `showNexfootPanel` 상태 및 `toggleNexfootPanel` 액션 추가
- [x] **Task 1.2**: `localStorage`(`nado_show_nexfoot_panel`) 연동으로 토글 상태 영구 보존 로직 추가
- [x] **Task 1.3**: 단위 테스트 작성 및 검증 (`tests/StoreNexfootToggle.test.ts`)

### 2단계: 파라미터 직접 입력 모드 (Direct Numeric Input)
- [x] **Task 2.1**: `src/ui/SlotParameterRack.tsx`에 인라인 편집 상태(`editingParamIndex`, `tempInputVal`) 추가
- [x] **Task 2.2**: 수치 텍스트 파싱 유틸리티 함수 구현 (퍼센트 `%`, 밀리초 `ms`, `dB`, 소수점 ➔ 0.0~1.0 정규화 및 Min/Max 클램핑)
- [x] **Task 2.3**: Enter 키/Blur 시 값 커밋 및 Nano Cortex BLE/스토어 전송, ESC 키 시 취소 핸들러 추가
- [x] **Task 2.4**: 수치 배지 클릭/더블클릭 시 input 전환 UI 인터랙션 구현

### 3단계: 시그널 체인 슬롯 2단 분리 라인 처리 (2-Row Signal Chain)
- [x] **Task 3.1**: `src/ui/CortexMonitorPanel.tsx`에서 슬롯 목록을 [Core Amp & Cab]과 [FX 페달]로 분류
- [x] **Task 3.2**: **[Core: Neural Capture & Cab/IR 랙]** 독립 섹션 렌더링 (앰프 헤드 메탈릭 스타일 및 전면 8노브/캐비닛 슬롯)
- [x] **Task 3.3**: **[FX: Pre-FX & Post-FX 페달보드 랙]** 독립 섹션 렌더링 (Gate/Trans/FX1 ➔ FX2/FX3 스톰프박스 스타일)
- [x] **Task 3.4**: 슬롯 간 시그널 라우팅 흐름 화살표(`➔`) 및 모바일 반응형 그리드 최적화

### 4단계: Livtra Nexfoot 독립 모드 & 패널 On/Off 토글 (UI Layout)
- [x] **Task 4.1**: `src/ui/Header.tsx` 상단 바에 `[Nexfoot: ON / OFF]` 토글 스위치 버튼 추가
- [x] **Task 4.2**: `src/App.tsx`에서 `showNexfootPanel` 상태에 따른 `NexfootVirtualPanel` 조건부 렌더링
- [x] **Task 4.3**: Nexfoot 패널 OFF 시 Nano Cortex 에디터 풀스크린 뷰 확장 검증
- [x] **Task 4.4**: Nexfoot 패널 OFF 상태에서도 백그라운드 MIDI 통신이 정상 동작하는지 검증

### 5단계: 통합 검증 및 문서화
- [x] **Task 5.1**: 전체 Vitest 단위 및 통합 테스트 실행 (15개 파일 48개 케이스 100% 통과)
- [x] **Task 5.2**: 프로덕션 빌드 검증 (`npm run build`, TypeScript 무결점, 번들링 완료)
- [x] **Task 5.3**: `docs/v0.0.4/review.md` 작성 및 최종 보고서 작성

---

## 2. 작업 진행 현황 요약
- 전체 태스크: 15개
- 완료 태스크: 15개
- 진행률: 100%
