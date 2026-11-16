# 시스템 명세서: Nado Cortex (나도 코텍스)

- **상태**: 작성 및 검토 중 (Living Document)
- **현재 진행 마일스톤**: [v0.0.2 (동적 MIDI Learn, 디바이스/파라미터 제어 및 UI 개편)](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.2/plan.md)
- **최신 버전**: v0.0.2
- **작성일**: 2026-11-16

---

## 0. 버전 변경 이력 (Changelog)

| 버전 | 일자 | 주요 내용 | 관련 문서 |
| :--- | :--- | :--- | :--- |
| **v0.0.1** | 2026-11-13 | • 최초 명세서 작성<br>• Nano Cortex BLE (c304/c305) 및 Livtra Nexfoot Web MIDI 스펙 정의<br>• SDD 워크플로우 (spec ➔ plan ➔ task) 정립<br>• [v0.0.1 완료] MVP 브릿지 파이프라인 및 가상 Mock 대시보드 구축<br>• 실물 기기(Nano Cortex + Nexfoot) BLE/MIDI 양방향 통신 검증 완료 | [plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.1/plan.md), [tasks.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.1/tasks.md), [review.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.1/review.md) |
| **v0.0.2** | 2026-11-16 | • **1. 동적 MIDI Learn 엔진 추가** (노브/스위치 클릭 후 풋스위치 조작으로 CC/모드 자동 감지 및 바인딩)<br>• **2. 매핑 프로필 관리 추가** (로컬 저장소 다중 저장/불러오기, JSON Export/Import)<br>• **3. 대시보드 레이아웃 전면 개편** (최상단: Cortex 모니터 ➔ 중단: Nexfoot 패널 ➔ 하단: 접기/펼치기 패킷 로그)<br>• **4. Nano Cortex 컨트롤 기능 확장** (프리셋 0~63 전환 및 각 슬롯별 Device/이펙트 모델 종류 변경)<br>• **5. 슬롯별 상세 파라미터 인스펙터** (슬롯 선택 시 해당 슬롯의 전체 파라미터 표시 및 화면 조절)<br>• **6. Nexfoot 로터리 다이내믹 페이징** (선택 슬롯 파라미터를 SW 1~4 노브에 자동 할당, 4개 초과 시 페이징 지원) | [plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.2/plan.md) *(작성 예정)* |

---

## 1. 개요 및 프로젝트 목적

### 1.1 배경 및 문제 정의
**Neural DSP Nano Cortex**는 뛰어난 사운드 퀄리티와 휴대성을 갖춘 기타 앰프 모델러 겸 캡처 페달입니다. 그러나 본체의 1/4" TRS 물리 MIDI 포트의 제어 범위는 매우 제한적입니다.
- 프리셋 호출(PC 0~63), 블록 바이패스(CC#34~41), 탭 템포(CC#42), 튜너(CC#43), 글로벌 익스프레션(CC#1)만 지원합니다.
- **게인, 개별 EQ, 딜레이 타임/피드백, 리버브 믹스 등 내부 이펙트 파라미터를 개별 MIDI CC로 직접 조절하는 기능은 공식적으로 제공되지 않습니다.**

### 1.2 해결 방안
공식 모바일 앱인 **Cortex Cloud**는 기기 내부의 모든 사운드 블록과 세부 파라미터를 **Bluetooth Low Energy (BLE)**를 통해 실시간으로 양방향 제어합니다.

**Nado Cortex**는 최신 웹 브라우저(Chrome, Edge, iOS Bluefy 등)에서 구동되는 웹 애플리케이션으로 다음을 수행합니다.
1. **Web MIDI API**를 통해 **Livtra Nexfoot** 컨트롤러의 푸시(Push) 및 로터리(Rotate) 회전 신호를 수신합니다.
2. **Web Bluetooth API**를 통해 **Neural DSP Nano Cortex**와 직접 무선으로 연결합니다.
3. 지능형 브릿지이자 시각적 에디터로서, Nexfoot의 노브 회전 신호를 Nano Cortex의 실시간 BLE 파라미터 제어 패킷으로 변환하여 송신합니다.
4. 하드웨어 설정 변경에 구애받지 않는 **MIDI Learn**과 **파라미터 페이징**을 통해 무대 위에서 발끝으로 Nano Cortex의 모든 파라미터를 완벽하게 제어합니다.

---

## 2. 시스템 아키텍처 및 데이터 흐름

```
┌────────────────────────────────────────────────────────┐
│                   Livtra Nexfoot                       │
│      (4개의 푸시-로터리 엔코더 풋스위치 + 1x 익스프레션)   │
└──────────────────────────┬─────────────────────────────┘
                           │ USB-C 유선 또는 Bluetooth MIDI
                           ▼
┌────────────────────────────────────────────────────────┐
│              웹 브라우저 (호스트 플랫폼)                 │
│                                                        │
│  ┌────────────────────┐      ┌──────────────────────┐  │
│  │   Web MIDI 모듈     │      │   UI 대시보드 v0.0.2 │  │
│  │  - 장치 감지/수신  │      │  - [1] Cortex 모니터 │  │
│  │  - CC/상대틱 정규화│      │  - [2] 슬롯 파라미터 │  │
│  └─────────┬──────────┘      │  - [3] Nexfoot 패널  │  │
│            │                 │  - [4] 접이식 로그   │  │
│            ▼                 └──────────┬───────────┘  │
│  ┌──────────────────────────────────────┴───────────┐  │
│  │               핵심 매핑 엔진 (Core Engine)       │  │
│  │  - 동적 MIDI Learn 엔진 (CC & 모드 자동 학습)    │  │
│  │  - 다이내믹 파라미터 페이징 (Slot Params -> SW1~4)│  │
│  │  - 프로필 관리 시스템 (Local Storage & JSON)     │  │
│  │  - BLE 대역폭 보호를 위한 30ms RateLimiter        │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                              │
│                         ▼                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │             Web Bluetooth 모듈                   │  │
│  │  - GATT 클라이언트 (Service A002/A003, C304/C305)│  │
│  │  - 패킷 프레이밍 및 순차 전송 큐 (WithResponse)  │  │
│  │  - NanoCortexProtocol 바이너리 직렬화            │  │
│  └──────────────────────┬───────────────────────────┘  │
└─────────────────────────┼──────────────────────────────┘
                          │ Bluetooth LE 무선 통신
                          ▼
┌────────────────────────────────────────────────────────┐
│               Neural DSP Nano Cortex                   │
│   (실시간 파라미터 변경, 블록 온오프, 디바이스/프리셋)  │
└────────────────────────────────────────────────────────┘
```

---

## 3. 통신 프로토콜 명세

### 3.1 Neural DSP Nano Cortex (Bluetooth LE)
- **연결 방식**: Web Bluetooth API (`navigator.bluetooth.requestDevice`).
- **GATT 서비스 및 특성(Characteristic)**:
  - **Primary Service UUIDs**:
    - `0000a002-0000-1000-8000-00805f9b34fb` (A002)
    - `0000a003-0000-1000-8000-00805f9b34fb` (A003)
  - **Write Characteristic (`c304`)**: `0000c304-0000-1000-8000-00805f9b34fb` (`writeValueWithResponse` 사용).
  - **Notify Characteristic (`c305`)**: `0000c305-0000-1000-8000-00805f9b34fb` (실시간 하드웨어 알림 수신).
- **패킷 프레이밍 구조**:
  $$\text{[전체 길이]} \parallel \text{0xC0 (구분자)} \parallel \text{[바이너리 페이로드]} \parallel \text{[32-bit LE 메시지 타입]}$$
- **주요 바이너리 명령 패킷**:
  - **FX 블록 활성화/바이패스**:
    `[0x0A, 0xC0, 0x08, 0x01, 0x18, enableSlot, 0x20, value, 0x1F, 0x00, 0x00, 0x00]`
    - Pre FX 1 (0x04), Pre FX 2 (0x05), Post FX 1 (0x06), Post FX 2 (0x07), Post FX 3 (0x08)
    - `value`: `0x00` (Active 켜짐), `0x01` (Bypass 꺼짐)
  - **Capture / Amp 슬롯 선택 및 바이패스**:
    `[0x08, 0xC0, 0x18, 0x01, 0x20, slot, 0x1C, 0x00, 0x00, 0x00]` (0: 바이패스, 1~25: 캡처 슬롯)
  - **Cab / IR 슬롯 선택 및 바이패스**:
    `[0x08, 0xC0, 0x18, 0x03, 0x20, slot, 0x1C, 0x00, 0x00, 0x00]` (0: 바이패스, 1~5: IR 슬롯)
  - **Amp 전면 노브 조절 (0~255)**:
    `[0x0B, 0xC0, 0x18, knobId, 0x20, value, 0x28, 0x00, 0x1A, 0x00, 0x00, 0x00]`
    - `gain: 0x00, level: 0x01, bass: 0x02, mid: 0x03, treble: 0x04`
  - **연속형 FX 파라미터 조절 (Float32 LE 0.0 ~ 1.0)**:
    `[0x0F, 0xC0, 0x08, 0x01, 0x18, modelSlot, 0x20, paramIndex, 0x2D, ...float32LE, 0x63, 0x00, 0x00, 0x00]`
  - **FX 모델 변경 (Device Model Change)**:
    `[7 + modelId.length, 0xC0, 0x18, modelSlot, 0x20, ...modelId, 0x88, 0x00, 0x00, 0x00]`

### 3.2 Livtra Nexfoot (Web MIDI)
- **하드웨어 기본 CC 규격 (실기기 검증 완료)**:
  - SW 1 (A): Push `CC:21` (Val 127/0) | Rotate `CC:57` (상대 모드: Val 0=시계방향 CW, Val 1=반시계방향 CCW)
  - SW 2 (B): Push `CC:22` | Rotate `CC:58`
  - SW 3 (C): Push `CC:23` | Rotate `CC:59`
  - SW 4 (D): Push `CC:24` | Rotate `CC:60`
  - EXP In: `CC:1` (0~127)
- **동적 적응 지원**:
  - MIDI Learn 기능을 통해 사용자가 팩토리 기본값이 아닌 임의의 CC 번호나 절대값 모드로 설정하더라도 자동 감지하여 처리.

---

## 4. 기능 요구사항 (Functional Requirements)

### 4.1 연결 및 동기화 관리
- **FR-01 (BLE 페어링)**: Nano Cortex를 단 한 번의 클릭으로 검색하고 페어링하는 기능 제공.
- **FR-02 (MIDI 장치 선택)**: 사용 가능한 Web MIDI 입력 장치 목록 표시 및 선택.
- **FR-03 (자동 재연결 및 핸드셰이크)**: 연결 즉시 기기 메타데이터(`06 C0 08 03 ...`) 및 현재 프리셋 상태(`0C C0 08 03 ...`)를 요청하여 동기화.

### 4.2 [신규 v0.0.2] 화면 레이아웃 재구성
- **FR-04 (사용자 중심 레이아웃 순서)**:
  1. **최상단**: **Nano Cortex 실시간 모니터** (프리셋 셀렉터, 시그널 체인 슬롯, 활성 슬롯의 상세 파라미터 컨트롤 랙)
  2. **중단**: **Livtra Nexfoot 컨트롤러 패널** (SW 1~4 가상 엔코더 게이지 및 푸시 LED, 현재 파라미터 페이징 인디케이터)
  3. **최하단**: **실시간 패킷 로그 콘솔 (접기/펼치기 Collapsible)**: 평소에는 접어두어 화면을 깔끔하게 유지하고, 디버깅이나 패킷 확인이 필요할 때 원클릭으로 펼침.

### 4.3 [신규 v0.0.2] Nano Cortex 컨트롤 기능 (프리셋 & 디바이스 변경)
- **FR-05 (프리셋 변경)**:
  - 화면 상단에서 Nano Cortex의 프리셋(0~63)을 드롭다운 또는 이전/다음 버튼으로 즉시 전환.
  - 프리셋 전환 시 실제 BLE 명령 및 MIDI PC 전송.
- **FR-06 (슬롯별 Device / 이펙트 모델 변경)**:
  - 각 슬롯(Pre FX 1/2, Capture, Cab/IR, Post FX 1/2/3) 클릭 시 현재 로드된 모델을 변경할 수 있는 디바이스 선택 팝업/드롭다운 제공.
  - 선택 가능한 주요 라이브러리:
    - Pre-FX: Rodent Drive, Tube Screamer, Classic Fuzz, Chorus, Compressor 등
    - Capture: UK 100 Lead, Plexi, US Clean 등 앰프/스톰프 캡처 목록
    - Cab/IR: 4x12 Greenback, 2x12 Vintage 30 등 IR 슬롯
    - Post-FX: Analog Delay, Digital Delay, Plate Reverb, Hall Reverb, Tremolo, Flanger 등
  - 모델 변경 시 즉시 Nano Cortex로 `0x88` 모델 교체 BLE 패킷을 전송하여 기기 내부 사운드 엔진 업데이트.

### 4.4 [신규 v0.0.2] 슬롯별 상세 파라미터 인스펙터
- **FR-07 (슬롯 포커스 & 전체 파라미터 노출)**:
  - 시그널 체인 블록(예: Pre FX 1 Drive 또는 Post FX 1 Delay)을 클릭하여 포커스를 지정하면, 해당 슬롯이 가진 **모든 세부 파라미터 노브/슬라이더가 하단 상세 랙에 일목요연하게 표시됨.**
  - 예 (Drive): Gain, Tone, Level
  - 예 (Delay): Time, Feedback, Mix, Tone, Modulation
  - 예 (Reverb): Decay, Pre-Delay, Mix, High Cut, Low Cut
- **FR-08 (화면 직접 조절)**:
  - 마우스 드래그 또는 휠을 통해 화면에서 슬라이더를 직접 움직여 실시간으로 Nano Cortex의 해당 파라미터 값을 조절 가능.

### 4.5 [신규 v0.0.2] Nexfoot 로터리 다이내믹 페이징 매핑
- **FR-09 (선택 슬롯 파라미터 ➔ SW 1~4 자동 바인딩)**:
  - 사용자가 화면에서 특정 슬롯을 선택하면, 해당 슬롯의 파라미터 1~4번이 Nexfoot의 **SW 1, SW 2, SW 3, SW 4 로터리 엔코더에 1:1로 즉시 자동 할당**됨.
- **FR-10 (4개 초과 파라미터 페이징 제어)**:
  - 슬롯의 파라미터가 4개를 초과하는 경우 (예: 5~8개 파라미터):
    - `[Page 1: 1~4번 파라미터]` ↔ `[Page 2: 5~8번 파라미터]` 페이징 내비게이션 제공.
    - 화면의 페이징 버튼 클릭 또는 지정된 풋스위치 동작(예: 특정 스위치 길게 누름)으로 페이지를 전환하여 모든 파라미터를 발끝으로 완벽하게 제어 가능.

### 4.6 [신규 v0.0.2] 동적 MIDI Learn 엔진
- **FR-11 (원클릭 MIDI Learn)**:
  - 화면의 특정 노브 또는 슬롯 온오프 버튼 옆의 `[Learn]` 버튼 클릭 시 "미디 입력 대기 모드"로 진입.
  - Nexfoot의 풋스위치를 밟거나 엔코더를 돌리면 해당 CC 번호 및 채널을 자동 낚아채서(Sniffing) 바인딩 완료.
- **FR-12 (상대값/절대값 모드 자동 판별)**:
  - 입력되는 미디 값 패턴을 분석하여 `Val: 0/1` 상대 모드(Relative)인지 `Val: 0~127` 절대 모드(Absolute)인지 스스로 판별하여 적합한 계산식 적용.
- **FR-13 (범위 및 스케일링 설정)**:
  - 파라미터의 최소값(Min)과 최대값(Max) 및 반전(Invert) 설정 지원 (예: 게인을 30%~80% 사이에서만 조절).

### 4.7 [신규 v0.0.2] 매핑 프로필 관리
- **FR-14 (프로필 로컬 저장 및 전환)**:
  - 곡별, 연주 환경별 매핑 구성을 이름 붙여 `localStorage`에 다중 저장하고 원클릭으로 전환.
- **FR-15 (JSON Export / Import)**:
  - 전체 매핑 프로필을 JSON 파일로 내보내어 백업하거나, 다른 사용자의 프로필을 파일로 불러오기 지원.

---

## 5. 비기능 요구사항 (Non-Functional Requirements)

- **NFR-01 (지연 시간)**: MIDI 입력 발생부터 BLE 전송까지 내부 처리 15ms 이하 유지.
- **NFR-02 (대역폭 보호)**: 로터리를 아무리 빠르게 회전시켜도 30ms 스로틀러(`RateLimiter`)를 통해 BLE 패킷 유실 방지.
- **NFR-03 (무설치 & 오프라인)**: PWA 기반 단독 웹앱으로 인터넷 연결 없는 합주실/무대에서도 로컬 구동 가능.
- **NFR-04 (크로스 플랫폼)**: macOS/Windows Chrome/Edge 및 iOS Bluefy 호환.

---

## 6. 검증 및 테스트 계획

1. **MIDI Learn 단위 테스트**: 가상 미디 신호 주입 시 CC 번호 및 Relative/Absolute 모드 자동 식별 검증.
2. **다이내믹 페이징 단위 테스트**: 슬롯 전환 시 파라미터 1~4번 자동 바인딩 및 4개 초과 파라미터의 Page 1/2 전환 동작 검증.
3. **프로필 저장/복원 테스트**: JSON 직렬화/역직렬화 및 `localStorage` 무결성 검증.
4. **BLE 모델 변경 패킷 검증**: 디바이스 변경 시 `0x88` BLE 패킷 구조 정확성 검증.

---

## 7. 승인 및 다음 단계
본 명세서에 대한 검토가 완료되면 다음 절차에 따라 진행합니다:
1. **2단계: v0.0.2 기술 구조 및 UI/UX 설계 (`docs/v0.0.2/plan.md`)** - 6가지 신규 기능의 상세 아키텍처 및 재구성된 UI 와이어프레임 설계
2. **3단계: v0.0.2 세부 구현 작업 정의 (`docs/v0.0.2/tasks.md`)** - 모듈별 WBS 및 의존성, 완료 기준 수립
3. **4단계: v0.0.2 구현 및 검증** - Task 순서에 따른 구현 및 테스트
