# [Tasks] v0.0.1 - MVP 기반 구축 및 실시간 하드웨어 브릿지 검증

- **마일스톤**: v0.0.1
- **상태**: 작성 및 검토 중 (Draft)
- **작성일**: 2026-11-13
- **기준 문서**: [spec.md (Living Spec)](file:///Users/imac/Workspace/github/nado-cortex/spec.md), [docs/v0.0.1/plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.1/plan.md)

---

## 1. 작업 개요 및 의존성 흐름도

```
[Phase 1: 기반 환경 구축]
  Task 1.1: Vite + React + TS + Tailwind 세팅
  Task 1.2: Vitest 테스트 환경 구성
  Task 1.3: 타입 정의 & Zustand 스토어 뼈대
       │
       ▼
[Phase 2: 통신 프로토콜 구현] ───────────────┐
  Task 2.1: PacketFramer (인코딩/디코딩/재조합) │
  Task 2.2: PacketFramer 단위 테스트           │
  Task 2.3: WebBluetoothManager (GATT c304/c305)
  Task 2.4: NexfootParser & WebMidiManager     │
  Task 2.5: NexfootParser 단위 테스트          │
       │                                       │
       ▼                                       │
[Phase 3: 코어 브릿지 & 라우팅]                 ▼
  Task 3.1: RateLimiter (스로틀러)         [Phase 4: 가상 Mock 시스템]
  Task 3.2: RateLimiter 단위 테스트         Task 4.1: MockBluetoothDevice
  Task 3.3: BridgeRouter (이벤트 변환)      Task 4.2: MockMidiAccess
       │                                       │
       └───────────────────┬───────────────────┘
                           │
                           ▼
[Phase 5: UI 대시보드 컴포넌트]
  Task 5.1: 헤더 및 연결 관리 바
  Task 5.2: NexfootVirtualPanel (4개 엔코더 게이지/LED)
  Task 5.3: CortexMonitorPanel (실시간 파라미터 반응 뷰어)
  Task 5.4: EventLogConsole (패킷 로그 콘솔)
  Task 5.5: 다크 네온 테마 스타일링
       │
       ▼
[Phase 6: 통합 검증 및 마일스톤 회고]
  Task 6.1: 통합 파이프라인 E2E 검증 (Mock 모드 연동)
  Task 6.2: 전체 단위 테스트 실행 및 통과 확인
  Task 6.3: v0.0.1/review.md 작성 및 마일스톤 완료
```

---

## 2. 세부 작업 목록 (WBS)

### Phase 1: 기반 환경 구축 (Project Setup)

- [x] **Task 1.1: Vite + React + TypeScript + Tailwind CSS 스캐폴딩**
  - **설명**: 프로젝트 루트에 Vite 기반 React + TypeScript 프로젝트를 초기화하고 Tailwind CSS 환경을 설정합니다.
  - **우선순위**: High
  - **의존성**: 없음
  - **완료 조건**: `npm run dev` 실행 시 기본 Vite 리액트 화면이 오류 없이 렌더링되고 Tailwind 클래스가 정상 적용됨.

- [x] **Task 1.2: Vitest 테스트 프레임워크 환경 구성**
  - **설명**: Vite 환경과 완전히 호환되는 Vitest 및 jsdom 환경을 구성하고 가상 하드웨어 API(Web Bluetooth/Web MIDI) Mocking 기반을 마련합니다.
  - **우선순위**: High
  - **의존성**: Task 1.1
  - **완료 조건**: `npm test` 실행 시 샘플 테스트가 정상 통과됨.

- [x] **Task 1.3: 핵심 타입 정의 및 Zustand 전역 스토어 뼈대 구축**
  - **설명**: `src/types/`에 BLE 상태, MIDI 이벤트, Nano Cortex 파라미터 모델 타입을 정의하고, `src/core/store.ts`에 Zustand 상태 스토어를 생성합니다.
  - **우선순위**: High
  - **의존성**: Task 1.1
  - **완료 조건**: BLE/MIDI 연결 상태, 넥스풋 4개 엔코더 상태, Cortex 파라미터 상태를 관리하는 스토어 액션이 정의됨.

---

### Phase 2: 통신 프로토콜 구현 (Protocol Layer)

- [x] **Task 2.1: BLE PacketFramer 구현**
  - **설명**: Nano Cortex BLE 패킷 규격인 `[길이] | 0xC0 | [페이로드] | [32-bit LE 메시지타입]` 구조의 인코더/디코더를 작성하고, MTU 초과 시 수신되는 분할 패킷을 `0xC0` 구분자 기반으로 재조합하는 버퍼링 로직을 구현합니다.
  - **우선순위**: High
  - **의존성**: Task 1.3
  - **완료 조건**: 단일 패킷 인코딩/디코딩 및 2개 이상으로 쪼개진 청크가 하나의 완성된 프레임으로 복원됨.

- [x] **Task 2.2: PacketFramer 단위 테스트 작성 및 검증**
  - **설명**: `tests/PacketFramer.test.ts`에 정상 패킷, 분할 수신 패킷, 손상된 패킷 복구 시나리오에 대한 테스트 케이스를 작성합니다.
  - **우선순위**: High
  - **의존성**: Task 2.1
  - **완료 조건**: `npm test`를 통해 모든 프레이밍 단위 테스트가 100% 통과함.

- [x] **Task 2.3: WebBluetoothManager 구현**
  - **설명**: `navigator.bluetooth.requestDevice`를 호출하여 Nano Cortex와 GATT 연결을 수립하고, Write Characteristic(`c304`) 및 Notify Characteristic(`c305`) 핸들러를 등록합니다.
  - **우선순위**: High
  - **의존성**: Task 2.1
  - **완료 조건**: 디바이스 연결, 알림 수신 리스너 등록, c304 패킷 송신 메서드가 구현됨.

- [x] **Task 2.4: NexfootParser & WebMidiManager 구현**
  - **설명**: Web MIDI API를 통해 "NEXFOOT" 기기를 감지하고, 수신된 미디 메시지를 4개 엔코더의 회전(CC 절대값/상대값) 및 푸시(Note/CC 토글) 이벤트로 정규화하는 파서를 작성합니다.
  - **우선순위**: High
  - **의존성**: Task 1.3
  - **완료 조건**: 미디 메시지 이벤트 발생 시 `NexfootEvent` 객체가 생성되어 스토어에 전달됨.

- [x] **Task 2.5: NexfootParser 단위 테스트 작성 및 검증**
  - **설명**: `tests/NexfootParser.test.ts`에 CC 0~127 회전값, 상대값(+1/-1), 스위치 누름/뗌 신호 파싱 테스트를 작성합니다.
  - **우선순위**: High
  - **의존성**: Task 2.4
  - **완료 조건**: 모든 미디 파서 단위 테스트가 100% 통과함.

---

### Phase 3: 코어 브릿지 & 라우팅 (Core Bridge)

- [x] **Task 3.1: RateLimiter (스로틀러) 구현**
  - **설명**: 로터리 엔코더를 빠르게 회전시킬 때 BLE 무선 대역폭 초과로 인한 패킷 드랍을 방지하기 위해 30ms 간격으로 마지막 입력값을 보장하는 트레일링 엣지 스로틀러를 작성합니다.
  - **우선순위**: High
  - **의존성**: Task 1.3
  - **완료 조건**: 고빈도 함수 호출 시 설정된 인터벌(30ms)마다 최신 파라미터 값만 방출함.

- [x] **Task 3.2: RateLimiter 단위 테스트 작성 및 검증**
  - **설명**: `tests/RateLimiter.test.ts`에서 가상 타이머(fake timers)를 사용하여 100ms 동안 50회 연속 호출 시 스로틀링된 전송 횟수와 최종값 도달 여부를 검증합니다.
  - **우선순위**: High
  - **의존성**: Task 3.1
  - **완료 조건**: 단위 테스트 100% 통과.

- [x] **Task 3.3: BridgeRouter 파이프라인 구현**
  - **설명**: Nexfoot 이벤트가 발생했을 때 매핑 정보를 조회하여 Nano Cortex 제어 패킷(`SET_PARAMETER_VALUE`, `SET_SLOT_STATE`)으로 변환하고 RateLimiter를 거쳐 BluetoothManager로 전달하는 브릿지 라우터를 구현합니다.
  - **우선순위**: High
  - **의존성**: Task 2.1, Task 2.3, Task 2.4, Task 3.1
  - **완료 조건**: Nexfoot 회전 시 Cortex 파라미터 패킷이 생성되어 송신 파이프라인으로 라우팅됨.

---

### Phase 4: 가상 Mock 시스템 (Mock Hardware Layer)

- [x] **Task 4.1: MockBluetoothDevice 구현**
  - **설명**: 실제 Nano Cortex 페달 없이 브라우저 환경에서 개발/테스트할 수 있도록 c304 수신 시 가상 상태를 업데이트하고 c305 알림을 시뮬레이션하는 가상 BLE 어댑터를 구현합니다.
  - **우선순위**: Med
  - **의존성**: Task 2.1, Task 2.3
  - **완료 조건**: Mock 모드 활성화 시 실제 Web Bluetooth API 호출 없이 양방향 통신 시뮬레이션 동작.

- [x] **Task 4.2: MockMidiAccess 구현**
  - **설명**: 실제 Nexfoot 컨트롤러 없이 화면에서 마우스/키보드로 가상 엔코더를 돌리거나 스위치를 누를 수 있도록 가상 미디 입력을 생성하는 어댑터를 구현합니다.
  - **우선순위**: Med
  - **의존성**: Task 2.4
  - **완료 조건**: 화면의 가상 노브 조작 시 표준 Web MIDI 이벤트와 동일한 신호가 브릿지로 인입됨.

---

### Phase 5: UI 대시보드 컴포넌트 구현 (UI Layer)

- [x] **Task 5.1: 헤더 및 연결 관리 컴포넌트 (`Header.tsx`)**
  - **설명**: Nano Cortex BLE 연결/해제 버튼, 미디 장치 선택 드롭다운, 하드웨어 Mock 모드 토글 스위치 및 연결 인디케이터를 구현합니다.
  - **우선순위**: High
  - **의존성**: Task 1.3, Task 4.1
  - **완료 조건**: 원클릭으로 연결을 시도하고 상태(연결됨/끊김/Mock모드)가 실시간 반영됨.

- [x] **Task 5.2: Nexfoot 가상 패널 컴포넌트 (`NexfootVirtualPanel.tsx`)**
  - **설명**: 4개의 푸시-로터리 엔코더 위젯을 원형 SVG 게이지와 푸시 LED 인디케이터로 렌더링하고, 실제 또는 가상 조작 시 회전 각도와 누름 상태를 시각화합니다.
  - **우선순위**: High
  - **의존성**: Task 1.3, Task 4.2
  - **완료 조건**: 엔코더 1~4번의 회전값($0 \sim 127$)과 푸시 On/Off 상태가 실시간 그래픽으로 반영됨.

- [x] **Task 5.3: Nano Cortex 파라미터 모니터 컴포넌트 (`CortexMonitorPanel.tsx`)**
  - **설명**: 현재 활성화된 시그널 블록 상태와 FX1 파라미터(Gain, Tone, Level) 슬라이더를 표시하며, Nexfoot을 돌렸을 때 슬라이더가 실시간으로 부드럽게 연동되는 뷰어를 작성합니다.
  - **우선순위**: High
  - **의존성**: Task 3.3
  - **완료 조건**: Nexfoot 회전 시 화면의 Cortex 파라미터 수치와 게이지가 동기화되어 즉각 변경됨.

- [x] **Task 5.4: 실시간 패킷 로그 콘솔 (`EventLogConsole.tsx`)**
  - **설명**: MIDI IN 신호, 브릿지 라우팅 변환 내역, BLE OUT 패킷 정보를 밀리초 타임스탬프와 함께 출력하고 클리어(Clear) 기능을 제공합니다.
  - **우선순위**: Med
  - **의존성**: Task 1.3
  - **완료 조건**: 송수신 이벤트가 실시간으로 스크롤되며 콘솔 창에 누적 표시됨.

- [x] **Task 5.5: 다크 네온 테마 스타일링 적용**
  - **설명**: 어두운 공연장/작업실에 최적화된 Dark Slate 배경, Cyan/Purple 네온 악센트 컬러, 반응형 레이아웃 스타일을 적용합니다.
  - **우선순위**: Med
  - **의존성**: Task 5.1 ~ 5.4
  - **완료 조건**: 직관적이고 시인성 높은 다크 모드 인터페이스 완성.

---

### Phase 6: 통합 검증 및 마일스톤 회고 (Verification & Completion)

- [x] **Task 6.1: 통합 파이프라인 E2E 검증 (Mock 모드 연동)**
  - **설명**: 브라우저에서 가상 Mock 모드를 켜고 가상 Nexfoot SW1 노브를 회전시켰을 때:
    `Nexfoot 회전 ➔ MIDI 파싱 ➔ 스로틀링 ➔ BLE 패킷 생성 ➔ 가상 Cortex 수신 ➔ 파라미터 모니터 UI 갱신`까지의 전 과정이 정상 작동하는지 확인합니다.
  - **우선순위**: High
  - **의존성**: Phase 1 ~ Phase 5 전체
  - **완료 조건**: 끊김이나 에러 없이 전 파이프라인 실시간 연동 성공.

- [x] **Task 6.2: 전체 단위 테스트 실행 및 100% 통과 확인**
  - **설명**: `npm test`를 실행하여 모든 프로토콜, 파서, 스로틀러 단위 테스트가 오류 없이 통과하는지 확인합니다.
  - **우선순위**: High
  - **의존성**: Task 2.2, Task 2.5, Task 3.2
  - **완료 조건**: 전체 테스트 슈트 통과 (0 failures).

- [x] **Task 6.3: v0.0.1 마일스톤 결과 요약 (`docs/v0.0.1/review.md`) 작성**
  - **설명**: v0.0.1 마일스톤 구현 결과, 테스트 통과 내역, 발생했던 이슈 및 해결책을 기록하고 v0.0.2 마일스톤 계획을 준비합니다.
  - **우선순위**: Med
  - **의존성**: Task 6.1, Task 6.2
  - **완료 조건**: `docs/v0.0.1/review.md` 작성 및 v0.0.1 공식 마감.
