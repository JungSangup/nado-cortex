# [Plan] v0.0.1 - MVP 기반 구축 및 실시간 하드웨어 브릿지 검증

- **마일스톤**: v0.0.1
- **상태**: 작성 및 검토 중 (Draft)
- **작성일**: 2026-11-13
- **목표**: Web Bluetooth와 Web MIDI를 연동하여 **Livtra Nexfoot의 회전/푸시 신호로 Nano Cortex의 특정 파라미터/블록을 실시간 제어하는 최소 기능 프로토타입(MVP) 및 검증 환경 구축**

---

## 1. 마일스톤 개요 및 핵심 스코프

### 1.1 핵심 목표 (Theme)
물리적인 TRS MIDI 케이블로는 불가능했던 **"로터리 엔코더 회전 ➔ Nano Cortex FX 파라미터 실시간 제어"**의 동작 파이프라인을 최초로 검증합니다. 실제 하드웨어뿐만 아니라, 하드웨어가 없는 환경에서도 로직과 UI를 완벽히 테스트할 수 있는 Mock 환경을 함께 구축합니다.

### 1.2 v0.0.1 구현 스코프
1. **Web Bluetooth 계층**:
   - Chrome/Edge 기반 Nano Cortex BLE 디바이스 스캔 및 GATT 연결
   - Write Characteristic (`c304`) 및 Notify Characteristic (`c305`) 바인딩
   - 패킷 프레이밍 (`[길이] | 0xC0 | [Protobuf 페이로드] | [메시지타입]`) 인코더/디코더 구현
2. **Web MIDI 계층**:
   - Web MIDI API 장치 열거 및 Livtra Nexfoot 자동 감지
   - 4개 푸시-로터리 엔코더(Push / Rotate)의 CC 및 Note 이벤트 파서 구현
3. **Core 브릿지 & 라우팅**:
   - Nexfoot 회전 신호($0 \sim 127$)를 Nano Cortex 정규화 값($0.0 \sim 1.0$)으로 변환
   - BLE 패킷 폭주 방지를 위한 스로틀링(Rate Limiter, 기본 30ms 간격)
   - 기본 1:1 테스트 매핑 파이프라인 (예: SW1 회전 ➔ FX 게인, SW1 푸시 ➔ FX 바이패스 토글)
4. **Mock 하드웨어 시스템**:
   - 브라우저 개발 및 자동화 테스트를 위한 가상 Nano Cortex (BLE Mock) 및 가상 Nexfoot (MIDI Mock)
5. **MVP 대시보드 UI**:
   - BLE 및 MIDI 연결 상태 패널
   - Livtra Nexfoot 4개 가상 노브/스위치 위젯 (실제 풋스위치 동작 시각화)
   - Nano Cortex 파라미터 실시간 반응 뷰어 및 이벤트 로그 콘솔

---

## 2. 전체 기술 구조 (Architecture & Tech Stack)

### 2.1 기술 스택 선정

| 분류 | 기술 스택 | 선정 이유 |
| :--- | :--- | :--- |
| **빌드 & 런타임** | **Vite + TypeScript** | 빠른 HMR, 강력한 타입 안정성, 가벼운 번들링 |
| **UI 라이브러리** | **React 18/19** | 선언적 UI, 풍부한 컴포넌트 생태계, 쉬운 상태 연동 |
| **스타일링** | **Tailwind CSS** | 어두운 공연장/작업실에 최적화된 다크 모드 및 고대비 커스텀 컴포넌트 신속 구현 |
| **전역 상태 관리** | **Zustand** | 가볍고 직관적이며, 리액트 렌더링 주기 밖(미디 이벤트 루프)에서도 실시간 업데이트 가능 |
| **단위/통합 테스트** | **Vitest** | Vite 기반 고속 테스트 실행 및 Web API Mocking 용이 |

---

### 2.2 모듈 아키텍처 다이어그램

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Application                               │
│                                                                        │
│  ┌───────────────────────┐                    ┌─────────────────────┐  │
│  │   WebMidiManager      │                    │ WebBluetoothManager │  │
│  │ - navigator.requestMIDI│                    │ - navigator.bluetooth│  │
│  │ - NexfootParser       │                    │ - GATT c304 / c305  │  │
│  └──────────┬────────────┘                    └──────────▲──────────┘  │
│             │ MIDI Event                                 │ BLE Packet  │
│             ▼                                            │             │
│  ┌───────────────────────────────────────────────────────┴──────────┐  │
│  │                          Core Bridge                             │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐  │  │
│  │  │ MappingRouter    │  │ RateLimiter      │  │ PacketFramer   │  │  │
│  │  │ (CC -> Param)    │─>│ (30ms Throttler) │─>│ (C0 Delimiter) │  │  │
│  │  └──────────────────┘  └──────────────────┘  └────────────────┘  │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │ State Update                        │
│                                  ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  Zustand Store (App State)                       │  │
│  │  - bleConnection: { status, deviceName, rssi }                   │  │
│  │  - midiConnection: { status, inputDevice }                       │  │
│  │  - nexfootState: { sw1..sw4: { push, rotateValue } }              │  │
│  │  - cortexState: { currentPreset, slots: [...], params: {...} }    │  │
│  │  - packetLogs: Array<{ timestamp, direction, data }>             │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │ Reactive Bindings                   │
│                                  ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       React UI View                              │  │
│  │  [Header / ConnectionBar]                                        │  │
│  │  [NexfootVirtualPedalView (4 Encoders)]                          │  │
│  │  [CortexParameterMonitorView]                                    │  │
│  │  [DebugLogConsole]                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 2.3 핵심 클래스 및 모듈 명세

1. **`WebBluetoothManager` (`src/bluetooth/WebBluetoothManager.ts`)**
   - 역할: Web Bluetooth 수명 주기 관리 및 GATT Characteristic 입출력
   - 메서드:
     - `connect(): Promise<void>`: BLE 디바이스 선택 팝업 트리거 및 서비스 바인딩
     - `disconnect(): void`: 연결 해제 및 리소스 정리
     - `sendPacket(data: Uint8Array): Promise<void>`: `c304` 특성에 패킷 쓰기
     - `onNotification(callback: (data: Uint8Array) => void)`: `c305` 알림 수신 리스너 등록

2. **`PacketFramer` (`src/bluetooth/PacketFramer.ts`)**
   - 역할: Nano Cortex 프로토콜의 패킷 인코딩/디코딩 및 분할 패킷 재조합
   - 인코딩 포맷: `[Length (1~2바이트)] + [0xC0] + [Payload] + [MessageType (4바이트 LE)]`
   - 디코딩: 수신 스트림 버퍼에서 `0xC0`와 길이를 기준으로 완전한 프레임 추출

3. **`WebMidiManager` (`src/midi/WebMidiManager.ts`)**
   - 역할: Web MIDI 연결 및 Livtra Nexfoot 신호 필터링
   - `init(): Promise<boolean>`: MIDIAccess 권한 획득 및 기기 감지
   - `onMidiMessage(e: MIDIMessageEvent)`: CC, Note, PC 신호 분류 및 `NexfootEvent` 생성

4. **`RateLimiter` (`src/core/RateLimiter.ts`)**
   - 역할: 빠른 노브 회전 시 블루투스 무선 대역폭이 포화되지 않도록 스로틀링
   - 동작 방식: 지정된 윈도우(예: 30ms) 내에서는 마지막 파라미터 값만 전송 보장(Trailing Edge Execution)

---

## 3. UI/UX 디자인 및 레이아웃 설계

### 3.1 화면 와이어프레임 (ASCII 레이아웃)

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ [●] NADO CORTEX v0.0.1                    [BLE: 연결됨 (Nano Cortex)] [MIDI: NEXFOOT]│
├───────────────────────────────────────────────────────────────────────────────────┤
│ [ 모드 설정: ● 실제 하드웨어 연결 모드  ○ 가상 Mock 테스트 모드 ]                          │
├───────────────────────────────────────────────────────────────────────────────────┤
│ LIVTRA NEXFOOT 컨트롤러 (실시간 입력 모니터링)                                           │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│ │   [ SW 1 ]      │ │   [ SW 2 ]      │ │   [ SW 3 ]      │ │   [ SW 4 ]      │   │
│ │     ( O ) 64    │ │     ( O ) 0     │ │     ( O ) 127   │ │     ( O ) 32    │   │
│ │   PUSH: OFF     │ │   PUSH: OFF     │ │   PUSH: ON [LED]│ │   PUSH: OFF     │   │
│ │ 매핑: FX1 Gain  │ │ 매핑: Delay Mix │ │ 매핑: Reverb Mix│ │ 매핑: Preset Up  │   │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├───────────────────────────────────────────────────────────────────────────────────┤
│ NANO CORTEX 실시간 파라미터 반응 뷰어                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────────┐   │
│ │ 현재 프리셋: [ 05: Crunch Lead Drive ]                                       │   │
│ │ [Gate: ON] ─── [Drive: ON] ─── [Capture: ON] ─── [Delay: ON] ─── [Reverb: ON]│   │
│ │                                                                             │   │
│ │  FX1 (Overdrive) 실시간 파라미터:                                             │   │
│ │  • GAIN   : [■■■■■■■■□□□□□□□□] 50%  (SW1 회전 시 실시간 변경!)                 │   │
│ │  • TONE   : [■■■■■■■■■■□□□□□□] 65%                                           │   │
│ │  • LEVEL  : [■■■■■■■■■■■■□□□□] 75%                                           │   │
│ └─────────────────────────────────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────────────────────────────────┤
│ [실시간 통신 로그]                                                       [Clear]   │
│ 17:05:12.102 [MIDI IN]  Ch:1 CC:20 Val:64 (SW1 Rotate Clockwise)                  │
│ 17:05:12.115 [CORE]     Mapped to FX1 Gain -> Normalized: 0.504                   │
│ 17:05:12.120 [BLE OUT]  Sent c304: [Len:12 0xC0 Payload:.. Type:0x00000004] (OK)  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.2 컴포넌트 계층 트리 구조

```
App
├── Header
│   ├── LogoBadge
│   ├── BleConnectionButton
│   ├── MidiDeviceSelector
│   └── MockModeToggle
├── MainContent
│   ├── NexfootVirtualPanel
│   │   ├── FootswitchCard (x4)
│   │   │   ├── RotaryGauge (SVG 원형 회전 게이지)
│   │   │   ├── PushIndicatorLed (누름 시 발광)
│   │   │   └── MappingTargetBadge
│   ├── CortexMonitorPanel
│   │   ├── PresetInfoBar
│   │   ├── SignalChainOverview (블록 활성화 뱃지)
│   │   └── ActiveParameterSliders (실시간 반응 슬라이더)
│   └── EventLogConsole
│       ├── LogFilterControls
│       └── LogMessageList
└── Footer
    └── StatusStatusBar (Latency, MTU, Dropped Packets)
```

---

### 3.3 테마 및 인터랙션 디자인 가이드

1. **컬러 팔레트**:
   - Background: Dark Slate `#0b0f19` (어두운 무대/합주실 눈부심 방지)
   - Panel Surface: `#1e293b` (보더 `#334155`)
   - Accent Cyan (Nano Cortex): `#06b6d4`
   - Accent Purple (Nexfoot): `#a855f7`
   - Active Green (이펙트 On / BLE 연결됨): `#10b981`
   - Warning / Alert: `#f59e0b`
2. **시각적 반응성 (Visual Feedback)**:
   - **노브 회전 애니메이션**: 회전 각도($-135^\circ \sim +135^\circ$)를 CSS Transform과 SVG Stroke Dasharray로 부드럽게 표현.
   - **푸시 반응**: 풋스위치 누름 발생 시 네온 링(Ring) 발광 효과 적용.
   - **레이턴시 표시**: MIDI 수신부터 BLE 응답까지의 왕복 시간(ms)을 초록/노랑/빨강 인디케이터로 실시간 표시.

---

## 4. 검증 및 완료 기준 (Acceptance Criteria for v0.0.1)

1. **테스트 완료 기준**:
   - `PacketFramer` 단위 테스트: 분할된 버퍼 재조합 및 프레임 분리 테스트 통과
   - `NexfootParser` 단위 테스트: CC 절대값/상대값 파싱 테스트 통과
   - `RateLimiter` 단위 테스트: 100ms 동안 50회 연속 입력 발생 시 정해진 인터벌로 스로틀링되어 최종 값 전송 확인
2. **UI & 통합 동작 기준**:
   - Mock 모드 활성화 시, 마우스 드래그나 키보드로 가상 Nexfoot 노브를 돌리면 Cortex 파라미터가 실시간으로 매끄럽게 동기화되어 움직여야 함.
   - 실제 Chrome 브라우저에서 Web Bluetooth 및 Web MIDI 장치 권한 팝업이 정상 호출되어야 함.

---

## 5. 다음 단계
본 설계서 검토 및 승인이 완료되면 **3단계: 세부 구현 작업 정의 (`docs/v0.0.1/tasks.md`)**를 작성합니다.
