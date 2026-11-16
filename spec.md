# 시스템 명세서: Nado Cortex (나도 코텍스)

- **상태**: 작성 및 검토 중 (Living Document)
- **현재 진행 마일스톤**: [v0.0.5 (Live vs Advanced 모드, Nexfoot 7시~4시 노브 및 패널 접기)](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.5/plan.md)
- **최신 버전**: v0.0.5
- **작성일**: 2026-11-16

---

## 0. 버전 변경 이력 (Changelog)

| 버전 | 일자 | 주요 내용 | 관련 문서 |
| :--- | :--- | :--- | :--- |
| **v0.0.1** | 2026-11-13 | • 최초 명세서 작성<br>• Nano Cortex BLE (c304/c305) 및 Livtra Nexfoot Web MIDI 스펙 정의<br>• SDD 워크플로우 (spec ➔ plan ➔ task) 정립<br>• [v0.0.1 완료] MVP 브릿지 파이프라인 및 가상 Mock 대시보드 구축<br>• 실물 기기(Nano Cortex + Nexfoot) BLE/MIDI 양방향 통신 검증 완료 | [plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.1/plan.md), [tasks.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.1/tasks.md), [review.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.1/review.md) |
| **v0.0.2** | 2026-11-16 | • **동적 MIDI Learn 엔진** (상대/절대/푸시 모드 자동 감지 및 바인딩)<br>• **매핑 프로필 관리** (LocalStorage 다중 저장, JSON Export/Import)<br>• **3단 레이아웃 구축** (Cortex 모니터 ➔ Nexfoot 패널 ➔ 접이식 로그)<br>• **Nano Cortex 컨트롤** (프리셋 0~63 전환, 30종 이상 공식 전체 이펙트/앰프 라이브러리 교체)<br>• **슬롯 상세 파라미터 인스펙터** 및 **Nexfoot 4노브 다이내믹 페이징** 연동 완료 | [plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.2/plan.md), [tasks.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.2/tasks.md), [review.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.2/review.md) |
| **v0.0.3** | 2026-11-16 | • **1. 스마트 익스프레션 페달(EXP In) 연동** (CC 1 수신 ➔ Wah, Pitch Wham, Volume, 딜레이 믹스 실시간 제어 및 가상 EXP 바)<br>• **2. 프리셋별 곡명(Setlist) 및 공연 모드** (0~63 프리셋에 곡명 지정, 공연 순서대로 넘기는 세트리스트 내비게이션)<br>• **3. 탭 템포(Tap Tempo) & 튜너(Tuner) 화면 연동** (BPM 연산 및 Nano Cortex 튜너 모드 On/Off 및 시각 튜너 디스플레이)<br>• **4. 실기기 역방향 동기화(Notify c305 정밀 디코더)** (본체 물리 노브/버튼 조작 시 화면 및 가상 게이지 실시간 미러링)<br>• **5. 모바일 최적화 상단 고정 헤더 접기/펼치기** (모바일 화면 공간 확보를 위한 상단 컴팩트 토글)<br>• **6. UI 타이틀 간소화** ("Nano Cortex", "Livtra Nexfoot"으로 심플 표기) | [plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.3/plan.md), [tasks.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.3/tasks.md), [review.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.3/review.md) |
| **v0.0.4** | 2026-11-16 | • **1. 시그널 체인 슬롯 분리 라인 처리** (Neural Capture 및 Cab/IR을 FX 슬롯과 별개의 독립 라인/섹션으로 분리 렌더링)<br>• **2. 파라미터 직접 입력 모드 (Direct Numeric Input)** (슬라이더 조작뿐 아니라 수치 라벨 클릭 시 키보드 직접 타이핑 및 Min/Max 검증)<br>• **3. Livtra Nexfoot 독립 모드 & 패널 On/Off 토글** (Nexfoot 미사용 시 가상 패널을 On/Off 숨겨 Nano Cortex 풀화면 에디터로 활용) | [plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.4/plan.md), [tasks.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.4/tasks.md), [review.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.4/review.md) |
| **v0.0.5** | 2026-11-16 | • **1. Live 모드 vs Advanced 모드 전환** (화면 최상단 원터치 스위치: 연주 전용 간편 Live 모드 vs 전체 에디터 Advanced 모드)<br>• **2. Nexfoot 노브 가동 범위 개선** (실제 아날로그 이펙터와 동일한 7시~4시 방향 270도 아크 게이지 및 0%~100% 시각화)<br>• **3. Core Amp/Cab 및 Nexfoot 패널 아코디언 접기/펼치기** (이벤트 로그처럼 필요할 때만 펼쳐보는 접이식 패널 인터랙션)<br>• **4. UI/UX 리파인먼트** (Live/Advanced 라벨 간소화, Nano Cortex 타이틀 고정, Tuner 버튼 위치 고정, FX 슬롯 1~5번 개별 고유 컬러 및 Bypass 시 채도 다운) | [plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.5/plan.md), [tasks.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.5/tasks.md), [review.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.5/review.md) |

---

## 1. 개요 및 프로젝트 목적

### 1.1 배경 및 문제 정의
**Neural DSP Nano Cortex**는 뛰어난 사운드 퀄리티와 휴대성을 갖춘 기타 앰프 모델러 겸 캡처 페달입니다. 그러나 본체의 1/4" TRS 물리 MIDI 포트의 제어 범위는 매우 제한적입니다.
- 프리셋 호출(PC 0~63), 블록 바이패스(CC#34~41), 탭 템포(CC#42), 튜너(CC#43), 글로벌 익스프레션(CC#1)만 지원합니다.
- **게인, 개별 EQ, 딜레이 타임/피드백, 리버브 믹스 등 내부 이펙트 파라미터를 개별 MIDI CC로 직접 조절하는 기능은 공식적으로 제공되지 않습니다.**

### 1.2 해결 방안
공식 모바일 앱인 **Cortex Cloud**는 기기 내부의 모든 사운드 블록과 세부 파라미터를 **Bluetooth Low Energy (BLE)**를 통해 실시간으로 양방향 제어합니다.

**Nado Cortex**는 최신 웹 브라우저(Chrome, Edge, iOS Bluefy 등)에서 구동되는 웹 애플리케이션으로 다음을 수행합니다:
1. **Web MIDI API**를 통해 **Livtra Nexfoot**의 4개 엔코더 및 익스프레션 페달 입력을 수신합니다.
2. **Web Bluetooth API**를 통해 **Neural DSP Nano Cortex**와 직접 무선으로 연결합니다.
3. 지능형 브릿지이자 시각적 에디터로서, 발끝으로 모든 슬롯 파라미터(게인, 딜레이 믹스 등)를 페이징 제어하고, 세트리스트 곡 순서로 프리셋을 전환하며, 튜너와 탭 템포를 화면에서 바로 시각화합니다.
4. 모바일 및 오프라인 환경에 최적화된 고대비 UI를 제공합니다.

---

## 2. 시스템 아키텍처 및 데이터 흐름

```
┌────────────────────────────────────────────────────────┐
│                   Livtra Nexfoot                       │
│    (4x Push-Rotary 엔코더 + 1x Expression 페달 포트)   │
└──────────────────────────┬─────────────────────────────┘
                           │ USB-C / Bluetooth MIDI (CC 21~24, 57~60, CC 1)
                           ▼
┌────────────────────────────────────────────────────────┐
│              웹 브라우저 (호스트 플랫폼)                 │
│                                                        │
│  ┌────────────────────┐      ┌──────────────────────┐  │
│  │   Web MIDI 모듈     │      │   UI 대시보드 v0.0.5 │  │
│  │  - 장치 감지/수신  │      │  - [1] Live/Adv 모드 │  │
│  │  - CC/상대틱 정규화│      │  - [2] 접이식 헤더   │  │
│  │  - EXP In (CC 1)   │      │  - [3] Nano Cortex   │  │
│  └─────────┬──────────┘      │        • 접이식 Core │  │
│            │                 │        • FX 페달라인 │  │
│            ▼                 │        • 슬라이더+입력│  │
│  ┌────────────────────────┐  │  - [4] Livtra Nexfoot│  │
│  │  핵심 엔진 (Core)      │  │        • 7시~4시 노브│  │
│  │  - MidiLearnEngine     │  │        • 아코디언 접기│  │
│  │  - DynamicPagingRouter │  │  - [5] 접이식 로그   │  │
│  │  - SetlistManager      │  └──────────┬───────────┘  │
│  │  - TunerTempoEngine    │             │              │
│  │  - NotifyDecoder       │<────────────┘              │
│  │  - ProfileManager      │                            │
│  │  - RateLimiter (30ms)  │                            │
│  └─────────┬──────────────┘                            │
│            │                                           │
│            ▼ BLE 송신 (c304) / BLE 역방향 수신 (c305)  │
│  ┌──────────────────────────────────────────────────┐  │
│  │             Web Bluetooth 모듈                   │  │
│  │  - GATT 클라이언트 (Service A002/A003, C304/C305)│  │
│  │  - PacketFramer & 양방향 디스패처                │  │
│  └──────────────────────┬───────────────────────────┘  │
└─────────────────────────┼──────────────────────────────┘
                          │ Bluetooth Low Energy 무선 통신
                          ▼
┌────────────────────────────────────────────────────────┐
│               Neural DSP Nano Cortex                   │
│   (실시간 파라미터 변경, 블록 온오프, 프리셋, 튜너/템포) │
└────────────────────────────────────────────────────────┘
```

---

## 3. 통신 프로토콜 명세

### 3.1 Neural DSP Nano Cortex (Bluetooth LE)
- **Primary Service UUIDs**: `A002`, `A003`
- **Write Characteristic (`c304`)**: `0000c304-0000-1000-8000-00805f9b34fb` (`writeValueWithResponse`).
- **Notify Characteristic (`c305`)**: `0000c305-0000-1000-8000-00805f9b34fb`.
- **명령 패킷 규격**:
  - **프리셋 변경**: `[0x06, 0xC0, 0x08, 0x02, 0x10, presetIndex, 0x1B, 0x00, 0x00, 0x00]`
  - **FX 블록 활성화/바이패스**: `[0x0A, 0xC0, 0x08, 0x01, 0x18, enableSlot, 0x20, value, 0x1F, 0x00, 0x00, 0x00]`
  - **Capture / Cab 슬롯 선택/바이패스**: `[0x08, 0xC0, 0x18, slotType, 0x20, slot, 0x1C, 0x00, 0x00, 0x00]`
  - **Amp 전면 노브 조절 (0~255)**: `[0x0B, 0xC0, 0x18, knobId, 0x20, value, 0x28, 0x00, 0x1A, 0x00, 0x00, 0x00]`
  - **연속형 FX 파라미터 (Float32 LE)**: `[0x0F, 0xC0, 0x08, 0x01, 0x18, modelSlot, 0x20, paramIndex, 0x2D, ...float32LE, 0x63, 0x00, 0x00, 0x00]`
  - **디바이스 모델 교체**: `[payloadLen, 0xC0, 0x18, modelSlot, 0x20, ...modelIdBytes, 0x88, 0x00, 0x00, 0x00]`
  - **[신규 v0.0.3] 탭 템포 패킷**: `[0x06, 0xC0, 0x08, 0x04, 0x10, bpmByte, 0x2A, 0x00, 0x00, 0x00]` (또는 MIDI CC#42 Val 127)
  - **[신규 v0.0.3] 튜너 토글 패킷**: `[0x06, 0xC0, 0x08, 0x05, 0x10, active ? 0x01 : 0x00, 0x2B, 0x00, 0x00, 0x00]` (또는 MIDI CC#43)

### 3.2 Livtra Nexfoot (Web MIDI)
- SW 1~4 Push: `CC:21 ~ 24`
- SW 1~4 Rotate: `CC:57 ~ 60` (상대 틱: Val 0=CW, Val 1=CCW)
- **[신규 v0.0.3] EXP In**: `CC:1` (0 ~ 127 가변 연속값)

---

## 4. 기능 요구사항 (Functional Requirements)

### 4.1 기존 완료 기능 (v0.0.1 ~ v0.0.2)
- **FR-01 ~ FR-03**: BLE 페어링, Web MIDI 감지, 초기 핸드셰이크
- **FR-04**: 대시보드 3단 기본 레이아웃 (Cortex ➔ Nexfoot ➔ 로그)
- **FR-05 ~ FR-06**: 프리셋 0~63 전환 및 30종 이상 공식 라이브러리 모델 교체
- **FR-07 ~ FR-08**: 슬롯 상세 파라미터 인스펙터 랙 및 화면 직접 조작
- **FR-09 ~ FR-10**: Nexfoot 로터리 4노브 다이내믹 페이징 매핑
- **FR-11 ~ FR-13**: 동적 MIDI Learn 엔진
- **FR-14 ~ FR-15**: 매핑 프로필 로컬 저장 및 JSON Import/Export

### 4.2 [신규 v0.0.3] 모바일 최적화 & UI 심플화
- **FR-16 (상단 고정 헤더 접기/펼치기)**:
  - 모바일 세로 화면에서 화면 공간을 절약할 수 있도록, 상단 Header를 미니멀한 1줄 상태 바로 접어두거나 버튼 클릭으로 전체 컨트롤 드로어를 펼칠 수 있는 토글 지원.
- **FR-17 (UI 타이틀 간소화)**:
  - "NANO CORTEX 실시간 모니터 & 컨트롤러" ➔ **"Nano Cortex"**로 간소화.
  - "LIVTRA NEXFOOT 가상 패널" ➔ **"Livtra Nexfoot"**으로 간소화.

### 4.3 [신규 v0.0.3] 스마트 익스프레션(EXP In) 연동
- **FR-18 (EXP 페달 입력 수신 및 파라미터 맵핑)**:
  - Nexfoot EXP In(CC 1) 신호를 수신하여 타겟 파라미터(와 Wah, 피치 Wham, 볼륨, 딜레이 믹스 등)를 실시간 연속 제어.
  - 가상 Nexfoot 패널에 EXP 페달 슬라이더/게이지 시각화 및 드래그 조작 지원.
  - 프로필에서 EXP 타겟 파라미터 및 Min/Max 범위 설정 지원.

### 4.4 [신규 v0.0.3] 세트리스트(Setlist) & 곡명 관리
- **FR-19 (프리셋별 곡명 네이밍)**:
  - 0~63 각 프리셋에 사용자가 원하는 곡 이름(Song Title) 및 아티스트 메모를 지정하고 저장.
- **FR-20 (라이브 세트리스트 모드)**:
  - 공연 순서(예: 1번곡 ➔ 5번곡 ➔ 12번곡)를 구성하는 세트리스트 목록 지원.
  - 화면의 [이전 곡] / [다음 곡] 또는 Nexfoot 풋스위치 매핑으로 라이브 무대에서 순서대로 프리셋을 넘김.

### 4.5 [신규 v0.0.3] 탭 템포(Tap Tempo) & 튜너(Tuner) 연동
- **FR-21 (지능형 탭 템포 계산 및 송신)**:
  - 풋스위치 탭 간격을 정밀 계산하여 BPM 산출(40~240 BPM) 및 기기 전송.
  - 화면에 현재 BPM 깜빡임 인디케이터 제공.
- **FR-22 (튜너 모드 On/Off 및 시각 튜너)**:
  - 튜너 토글 시 음소거(Mute) 및 튜너 뷰어 팝업/패널 노출.

### 4.6 [신규 v0.0.3] 실기기 역방향 동기화 (Notify c305 정밀 디코더)
- **FR-23 (BLE Notify 실시간 미러링)**:
  - Nano Cortex 본체에서 물리 노브나 버튼을 조작했을 때 수신되는 `c305` 패킷을 디코딩하여 웹 대시보드 화면에 즉시 역반영.

### 4.7 [신규 v0.0.4] 시그널 체인 슬롯 분리 라인 처리 (2-Row Signal Chain)
- **FR-24 (Core Amp/Cab 라인과 FX 페달 라인의 독립 분리)**:
  - 기존 1열 단순 나열 방식에서 벗어나, **[Core: Neural Capture & Cab/IR 라인]**과 **[FX: Pre/Post 이펙터 페달 라인]**을 별개의 독립 라인/섹션으로 시각적 및 논리적으로 분리 렌더링.
  - 신호 라우팅: `Guitar In ➔ [FX1 Pre] ➔ [Neural Capture (Amp)] ➔ [Cab/IR] ➔ [FX2 Post] ➔ [FX3 Post] ➔ Output`.
  - Core 라인은 앰프 모델 캡처 및 전면 8개 노브(Gain, Bass, Mid, Treble, Amount, Level 등)와 Cab IR을 전면에 배치하여 앰프 헤드/캐비닛 랙 형태로 가시화.
  - FX 라인은 Pre-FX(FX1: Gate/Transposer/Comp/Drive) 및 Post-FX(FX2: Mod/EQ/Pitch, FX3: Delay/Reverb)를 스톰프박스 페달보드 형태로 가시화.
  - 각 슬롯의 On/Off 바이패스 및 모델 교체, 파라미터 랙 연동을 라인별로 명확하게 구분.

### 4.8 [신규 v0.0.4] 파라미터 직접 입력 모드 (Direct Numeric Input)
- **FR-25 (슬라이더 조절 + 수치 키보드 직접 타이핑)**:
  - 슬롯 파라미터 랙의 각 파라미터 값 표시부(Value Badge/Label)를 클릭 또는 더블클릭 시 인라인 텍스트 입력 모드(`input type="number"` / formatted)로 전환.
  - 마우스/터치 슬라이더 드래그 조작 외에 정밀한 수치(예: 7.5, 50%, 120ms 등)를 키보드로 직접 타이핑하여 입력.
  - Enter 키 입력 또는 포커스 아웃(`blur`) 시 Min/Max 허용 범위를 자동 검사(Clamping)하여 스토어 갱신 및 Nano Cortex BLE(`c304`) 연속형 Float32 패킷으로 즉각 송신.
  - ESC 키 입력 시 수정을 취소하고 이전 값으로 안전하게 복귀.

### 4.9 [신규 v0.0.4] Livtra Nexfoot 독립 모드 & 패널 On/Off 토글 (Standalone Mode)
- **FR-26 (Nexfoot 가상 패널 표시 On/Off 토글 및 레이아웃 최적화)**:
  - Livtra Nexfoot 하드웨어 페달보드가 없는 사용자도 순수 Nano Cortex 웹 에디터/컨트롤러로 사용할 수 있도록 가상 Nexfoot 패널을 On/Off(표시/숨김)할 수 있는 UI 토글 제공.
  - 상단 Header 바 또는 대시보드 상단에 원클릭 `[Nexfoot 패널 (ON/OFF)]` 스위치 제공.
  - 설정값은 브라우저 `localStorage`에 자동 영구 저장되어 새로고침 후에도 유지.
  - Nexfoot 패널이 OFF인 경우, 화면 공간 전체를 Nano Cortex 2단 시그널 체인(Core Amp/Cab + FX) 및 파라미터 인스펙터가 넓게 차지하여 모바일/태블릿/PC에서 쾌적한 에디터 화면 제공.
  - Nexfoot 패널이 OFF 상태라도 실제 Nexfoot 하드웨어가 연결되면 백그라운드 MIDI 메시지는 정상 수신되어 Nano Cortex를 제어 가능.

### 4.10 [신규 v0.0.5] Live 모드 vs Advanced 모드 전환 (Dual View Modes)
- **FR-27 (라이브 공연 모드 vs 정밀 에디터 모드)**:
  - 화면 최상단(Header)에 원클릭 세그먼트 스위치 `[LIVE 모드] | [ADVANCED 모드]` 배치.
  - **Live 모드**:
    - 무대 공연 및 합주 연주 시 필요한 핵심 기능(세트리스트 곡 순서, 프리셋 0~63, 탭 템포/BPM, 시각 튜너, FX 슬롯 온오프 바이패스, 슬롯 파라미터 제어)에 집중.
    - Core Amp/Cab 랙은 기본 접힘(collapsed by default) 상태로 숨겨두고 접기/펼치기 아코디언 제공.
    - Livtra Nexfoot 패널은 숨김(OFF) 상태로 전환하여 연주 화면을 극대화.
  - **Advanced 모드**:
    - 기기의 모든 기능과 세부 설정을 제어할 수 있는 풀 에디터 화면.
    - 접기/펼치기가 지원되는 모든 컴포넌트(Core Amp/Cab, Nexfoot 가상 패널, 이벤트 로그)가 기본 펼침(expanded by default) 상태로 노출.
  - 모드 설정은 LocalStorage(`nado_view_mode`)에 저장되어 새로고침 후에도 유지.

### 4.11 [신규 v0.0.5] Nexfoot 노브 가동 범위 및 이펙터 게이지 개선
- **FR-28 (7시 방향~4시 방향 270도 노브 회전 및 0%~100% 시각화)**:
  - 실제 아날로그 스톰프박스/앰프의 노브 가동 범위인 7시(MIN/0%) ~ 4시/5시(MAX/100%) 방향(총 270도)으로 회전 아크 및 눈금 재정렬.
  - SVG 원호(Arc) 시작점을 7시 방향으로 맞추어, 실제 이펙터 노브를 돌리는 듯한 현실감과 시각적 직관성 부여.
  - 7시(0)와 4시/5시(100) 마커를 표시하여 노브 현재 위치를 즉시 인지 가능.

### 4.12 [신규 v0.0.5] 컴포넌트 아코디언 접기/펼치기 인터랙션
- **FR-29 (Core Amp/Cab 및 Nexfoot 패널 접기/펼치기)**:
  - 이벤트 로그 콘솔처럼, Core Amp/Cab 라인 및 Nexfoot 가상 패널의 헤더 우측에 `ChevronUp`/`ChevronDown` 접기/펼치기 버튼 제공.
  - 원클릭으로 패널 본문을 접거나 펼칠 수 있으며, 접힌 상태에서도 슬롯 이름 및 On/Off 상태를 요약 바 형태로 확인 가능.

### 4.13 [신규 v0.0.5] 세부 UI/UX 정밀 리파인먼트
- **FR-30 (모드 라벨, 타이틀 고정, Tuner 버튼 위치 고정 및 FX 슬롯 개별 컬러)**:
  - **모드 라벨 간소화**: 최상단 스위처 버튼 라벨을 `[Live | Advanced]`로 간결화 ("모드" 텍스트 제거).
  - **패널 타이틀 일관성**: Live 모드 시에도 뷰 타이틀을 `Nano Cortex`로 변함없이 유지.
  - **Tuner 버튼 위치 고정**: 토글 시 텍스트 변경으로 인한 줄바꿈(wrap) 현상을 방지하기 위해 라벨을 `TUNER`로 고정하고 고정 너비(`w-[90px] shrink-0`)를 주어 클릭 시 제자리에서 안정적으로 On/Off 토글 지원.
  - **FX 슬롯 1~5번 개별 컬러 매핑**:
    - `pre_fx_1` (Gate): 스틸 실버 / 슬레이트
    - `pre_fx_2` (Transposer): 모던 민트 / 틸
    - `post_fx_1` (FX1 Drive): 빈티지 웜 앰버
    - `post_fx_2` (FX2 Mod): 라벤더 바이올렛
    - `post_fx_3` (FX3 Delay/Rev): 딥 스카이 블루
    - **Bypass (Off) 상태**: `grayscale opacity-45` 및 무채색(`text-zinc-500`)으로 채도를 다운시켜 전원 꺼짐을 직관적으로 식별 가능.

---

## 5. 비기능 요구사항 (NFR)
- **NFR-01**: 스마트폰 세로/가로 모드 완벽 반응형 UI 지원 (Nexfoot 패널 OFF 시 에디터 높이 자동 확장).
- **NFR-02**: MIDI 입력 ➔ BLE 패킷 송신 레이턴시 15ms 이하 유지.
- **NFR-03**: 파라미터 직접 입력 시 30ms Rate Limiter와 연동되어 급격한 패킷 플러딩 방지.
- **NFR-04**: 모드 전환 시 리렌더링 깜빡임 없이 부드러운 애니메이션 트랜지션 제공.

---

## 6. 다음 단계
1. **`docs/v0.0.5/plan.md` 작성**: v0.0.5 상세 아키텍처 및 Live/Advanced 모드, 7시~4시 노브, 접이식 패널 설계
2. **`docs/v0.0.5/tasks.md` 작성**: 작업 분할 WBS 수립
3. **v0.0.5 모듈 순차 구현 및 검증**
