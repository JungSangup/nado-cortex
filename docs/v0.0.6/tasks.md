# [Tasks] v0.0.6 - 작업 목록 및 진행 상황 (WBS)

- **마일스톤**: v0.0.6
- **상태**: 완료 (Completed Phase)
- **작성일**: 2026-11-20
- **기준 계획서**: [docs/v0.0.6/plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.6/plan.md)

---

## 1. 작업 분할 및 체크리스트

### 1단계: 코어 타입 및 상태 관리 확장 (Core Layer)
- [x] **Task 1.1**: `src/types/index.ts`의 `MidiLearnTarget`에 `sw_rotate`, `sw_push`, `exp_pedal` 타겟 타입 확장
- [x] **Task 1.2**: `src/core/store.ts`에 BLE 진단 상태(`bleTxCount`, `bleRxCount`, `lastTxDescription`, `lastRxDescription`, `lastRxHex`, `isBleTxActive`, `isBleRxActive`) 및 액션 추가
- [x] **Task 1.3**: `src/core/MidiLearnEngine.ts`에서 하드웨어 SW/EXP 타겟 학습 및 프로필 바인딩 로직 구현

### 2단계: Nexfoot 패널 중심 직관적 MIDI Learn UI 구현 (Nexfoot Panel)
- [x] **Task 2.1**: `src/ui/NexfootVirtualPanel.tsx` 각 SW 1~4 카드 상단에 노브 회전 CC 표시 및 `[Learn]` 버튼 추가
- [x] **Task 2.2**: 각 SW 1~4 푸시 버튼 영역에 푸시 CC 표시 및 `[Learn]` 버튼 추가
- [x] **Task 2.3**: EXP 페달 카드에 EXP CC 표시 및 `[Learn]` 버튼 추가
- [x] **Task 2.4**: 학습 중 펄스 애니메이션(`animate-pulse`) 및 감지 완료 시 실시간 피드백 스타일 적용

### 3단계: Nano Cortex BLE 양방향 통신 무결성 및 수신 디코더 버그 픽스 (Bluetooth Layer)
- [x] **Task 3.1**: `src/bluetooth/NotifyDecoder.ts`의 `0xC0` 오프셋 불일치 해결 및 다형적(Polymorphic) 패킷 디코딩 구현
- [x] **Task 3.2**: `src/App.tsx` 및 `src/core/BridgeRouter.ts`의 수신 핸들러 연결 정밀화 (`packet.raw` 및 `packet.payload` 안전 전달)
- [x] **Task 3.3**: `src/bluetooth/WebBluetoothManager.ts`의 GATT Write 호환성(`writeValueWithoutResponse` 우선 및 폴백) 개선

### 4단계: 실시간 BLE 양방향 통신 진단기 (Diagnostics Inspector UI)
- [x] **Task 4.1**: Nano Cortex 패널 내 실시간 TX/RX LED 인디케이터 및 패킷 카운터 바 구현 (`src/ui/BleDiagnosticsBar.tsx`)
- [x] **Task 4.2**: 원클릭 테스트 핑(Ping) 도구 구현 (프리셋 핑, 슬롯 온오프 핑)
- [x] **Task 4.3**: 최근 수신 패킷 덤프(HEX) 및 디코딩 요약 실시간 모니터 바 제공

### 5단계: 검증 및 문서화 (Verification & Review)
- [x] **Task 5.1**: `tests/NexfootHardwareLearn.test.ts` 작성 및 통과 검증 (5/5 passed)
- [x] **Task 5.2**: `tests/BleNotifyIntegration.test.ts` 작성 및 통과 검증 (4/4 passed)
- [x] **Task 5.3**: Nexfoot Relative 모드 하드웨어 스펙(CW=127, CCW=0) 반영 및 파서 테스트 갱신
- [x] **Task 5.4**: MIDI Learn 완료 후 스토어/파서 동기화 누락 버그 해결 및 자동 동기화 이벤트 연동
- [x] **Task 5.5**: 전체 Vitest 단위/통합 테스트 (`npm test`) 100% 통과 확인 (18 files, 62 tests passed)
- [x] **Task 5.6**: 프로덕션 빌드 (`npm run build`) 확인
- [x] **Task 5.7**: `docs/v0.0.6/review.md` 작성 및 최종 보고서 작성

---

## 2. 작업 진행 현황 요약
- 전체 태스크: 20개
- 완료 태스크: 20개
- 진행률: 100%
