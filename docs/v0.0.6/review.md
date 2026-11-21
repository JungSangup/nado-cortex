# [Review] v0.0.6 구현 및 검증 결과 보고서

- **마일스톤**: v0.0.6
- **상태**: 구현 및 검증 완료 (Review Phase)
- **일자**: 2026-11-20
- **기준 명세서 및 계획서**:
  - [spec.md (v0.0.6)](file:///Users/imac/Workspace/github/nado-cortex/spec.md)
  - [docs/v0.0.6/plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.6/plan.md)
  - [docs/v0.0.6/tasks.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.6/tasks.md)

---

## 1. 구현 개요

v0.0.6 마일스톤에서는 실제 하드웨어 연동 시 사용자가 겪었던 2가지 핵심 병목(Nexfoot MIDI 매핑의 난이도 및 Nano Cortex 신호 이상)을 근본적으로 해결하였습니다:

1. **Nexfoot 패널 중심 직관적 MIDI Learn 탑재**:
   - 기존 파라미터 랙의 복잡한 Learn 구조에서 탈피하여, **가상 Nexfoot 패널의 SW 1~4 노브(Rotate), 푸시 스위치(Push), EXP 페달 카드에서 현재 CC 번호를 직접 확인하고 원클릭 `[Learn]` 버튼으로 즉시 학습**할 수 있도록 전면 개선.
2. **Nano Cortex BLE 역방향 수신 동기화 버그 픽스**:
   - `PacketFramer` 파싱 결과(`0xC0` Delimiter 제외)와 `NotifyDecoder.decode()` 검사 로직 간의 오프셋 불일치 버그를 해결하여, Nano Cortex 본체 물리 노브나 버튼을 조작했을 때 웹 화면에 즉각 미러링되도록 복구.
3. **실시간 BLE 양방향 통신 진단기 (Diagnostics Inspector)**:
   - Nano Cortex 패널 상단에 **TX/RX LED 인디케이터(실시간 깜빡임 및 카운터)**, **테스트 핑(Ping) 도구**, **최근 수신 패킷(HEX 덤프 및 디코딩 요약) 모니터 바**를 장착하여 사용자가 무선 신호의 흐름을 직접 눈으로 보며 진단할 수 있도록 지원.

---

## 2. 세부 구현 내역

### 2.1 Nexfoot 패널 중심 직관적 MIDI Learn (`src/ui/NexfootVirtualPanel.tsx`, `src/core/MidiLearnEngine.ts`)
- **SW 1~4 노브 회전 CC Learn**:
  - 카드 상단에 현재 바인딩된 CC 번호(예: `CC 57`) 표시 및 **`[Learn]`** 버튼 제공.
  - 클릭 시 `SW 노브 Learn...` 펄스 활성화 ➔ 실제 노브 조작 시 상대값(Relative)/절대값(Absolute) 모드 및 CC 번호 자동 감지 및 프로필 갱신.
- **SW 1~4 푸시 스위치 CC Learn**:
  - 푸시 버튼 영역 우측에 현재 푸시 CC(예: `CC 21`) 표시 및 **`[Learn]`** 버튼 제공.
  - 클릭 후 실제 풋스위치를 밟으면 해당 푸시 CC로 즉각 바인딩.
- **EXP 페달 CC Learn**:
  - EXP 카드 상단에 현재 CC(예: `CC 1`) 표시 및 **`[Learn]`** 버튼 제공.
  - 페달 조작 시 수신된 CC를 익스프레션 페달 타겟으로 즉각 바인딩.
- **프로필 동기화 파서 연동 (`src/midi/NexfootParser.ts`, `src/App.tsx`)**:
  - MIDI Learn으로 CC 번호가 변경되면 `NexfootParser.syncFromProfile()`을 통해 파서 내부의 CC 테이블이 즉각 동기화되어 학습 직후 재시작 없이도 즉시 하드웨어 조작 인식.

### 2.2 Nano Cortex 역방향 동기화 무결성 복구 (`src/bluetooth/NotifyDecoder.ts`, `src/App.tsx`)
- **다형적(Polymorphic) 패킷 디코딩 구현**:
  - 바이트 배열 내 `0xC0` 위치를 동적으로 검색하여 프레임 전체(`packet.raw`) 또는 페이로드(`packet.payload`) 어느 것이 전달되어도 앰프 노브, 슬롯 바이패스, 프리셋 전환, 연속 FX 파라미터가 100% 정상 디코딩되도록 개편.
  - `fx_param`과 `slot_bypass`의 헤더 프리픽스 충돌 문제를 검사 순서 재배치를 통해 해결.
- **GATT Write 호환성 보강 (`src/bluetooth/WebBluetoothManager.ts`)**:
  - `writeValueWithResponse`와 `writeValueWithoutResponse`에 대한 자동 폴백 구조를 구현하여 GATT Write 오류 방지.

### 2.3 실시간 BLE 양방향 통신 진단기 (`src/ui/BleDiagnosticsBar.tsx`, `src/core/store.ts`)
- **실시간 LED 인디케이터**:
  - `TX` (청록색): 브라우저에서 명령 송신 시 150ms 동안 점멸 및 송신 누적 카운트 표시.
  - `RX` (에메랄드): Nano Cortex 본체에서 알림 수신 시 150ms 동안 점멸 및 수신 누적 카운트 표시.
- **원클릭 테스트 핑 (Test Signal)**:
  - `[Ping 프리셋]`: 현재 프리셋 신호를 즉시 송신하여 기기 반응 확인.
  - `[Ping 슬롯]`: Pre-FX 1 바이패스 신호를 송신하여 기기 릴레이/LED 반응 확인.
- **실시간 최근 통신 요약 모니터**:
  - 최근 송신 설명 및 최근 수신 내용(예: `[최근 RX: 앰프 노브 P0: 50% [0B C0 18 00 20 80 ...]]`)을 실시간 1줄로 표시.

### 2.4 Nexfoot 엔코더 Relative 모드 스펙 최적화 및 MIDI Learn 동기화 버그 픽스
- **엔코더 회전 Relative 모드 스펙 반영 (`src/midi/NexfootParser.ts`)**:
  - 실제 하드웨어 사양에 맞추어 **시계방향(CW) = CC값 127 (+1 틱)**, **반시계방향(CCW) = CC값 0 (-1 틱)** (및 65/63)으로 파싱하도록 수정.
  - 회전 1틱당 0.02(2%)씩 가감하여 부드럽고 정밀한 파라미터 제어 구현.
- **MIDI Learn 후 화면/기기 싱크 불일치 오류 원인 해결 (`src/core/MidiLearnEngine.ts`, `src/core/store.ts`)**:
  - 원인: `MidiLearnEngine`이 학습을 마친 후 `ProfileManager`에만 저장하고 `useAppStore.activeProfile`을 갱신하지 않아, `WebMidiManager` 내부의 파서가 여전히 이전 CC만 대기하고 있었던 문제.
  - 해결: `setOnProfileUpdated` 이벤트를 연동하여 학습 완료 즉시 `store.syncActiveProfile()`이 호출되고, `WebMidiManager.syncFromProfile()`이 실시간 트리거되어 학습 직후 바로 하드웨어 신호가 화면 및 Nano Cortex로 반영되도록 조치.
  - 추가로 `sw_rotate` 타겟 학습 시 회전 틱 신호(127, 0 등)를 수신하는 즉시 Relative 모드로 자동 확정되도록 보완.

---

## 3. 검증 결과

### 3.1 단위 및 통합 테스트 (`npm test`)
- 테스트 파일: **18개 파일 전부 통과 (18 passed)**
- 테스트 케이스: **62개 전원 성공 (62 passed, 0 failed)**
  - `tests/NexfootHardwareLearn.test.ts` (5개 케이스 통과, 스토어 자동 동기화 E2E 포함)
  - `tests/BleNotifyIntegration.test.ts` (4개 케이스 통과)
  - `tests/NexfootParser.test.ts` (3개 케이스 통과, CW=127, CCW=0 검증)
  - 기존 50개 테스트 케이스 전원 회귀 없음 (100% Pass)

### 3.2 프로덕션 빌드 검증 (`npm run build`)
- TypeScript 타입 컴파일 무결점 (`tsc --noEmit` 통과)
- Vite 프로덕션 번들링 성공 (`dist/index.html`, `dist/assets/index-DblL_Zji.js`, `dist/assets/index-XTjxKogm.css`)

---

## 4. 결론
v0.0.6 마일스톤 구현 및 검증이 완료되었습니다.
이제 실제 무대나 연습 환경에서 Livtra Nexfoot의 4개 노브/푸시 스위치 및 EXP 페달의 CC를 패널에서 바로 확인하고 원하는 대로 원터치 학습시킬 수 있으며, Nano Cortex와의 BLE 송수신 신호를 진단 바를 통해 실시간으로 확인하며 안정적으로 연주할 수 있습니다.
