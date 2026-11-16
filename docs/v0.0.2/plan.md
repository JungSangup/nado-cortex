# [Plan] v0.0.2 - 동적 MIDI Learn, 디바이스/파라미터 제어 및 UI 전면 개편

- **마일스톤**: v0.0.2
- **상태**: 작성 및 승인 대기 (Plan Phase)
- **작성일**: 2026-11-16
- **기준 명세서**: [spec.md (v0.0.2)](file:///Users/imac/Workspace/github/nado-cortex/spec.md)
- **목표**: 
  1. 원클릭 **동적 MIDI Learn 엔진** 및 **매핑 프로필 관리(Local/JSON)** 구축
  2. 사용자 중심의 **3단 화면 레이아웃 재구성** (Cortex 모니터 ➔ Nexfoot 패널 ➔ 접이식 로그)
  3. **Nano Cortex 컨트롤 확장** (프리셋 0~63 전환 및 슬롯별 Device/이펙트 모델 변경)
  4. **슬롯별 상세 파라미터 인스펙터** 및 화면 직접 제어
  5. **Nexfoot 로터리 다이내믹 페이징 매핑** (선택 슬롯의 파라미터를 SW 1~4 노브에 자동 할당, 4개 초과 시 페이징 지원)

---

## 1. 아키텍처 개요 및 데이터 흐름

### 1.1 전체 시스템 구조도

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
│  │                     Core Bridge & Router                         │  │
│  │                                                                  │  │
│  │  ┌────────────────────┐    ┌──────────────────────────────────┐  │  │
│  │  │  MidiLearnEngine   │    │      DynamicPagingEngine         │  │  │
│  │  │ - Input Sniffer    │    │ - Selected Slot Params Inspector │  │  │
│  │  │ - Mode Identifier  │    │ - 4-Param Paging Slice (SW 1~4)  │  │  │
│  │  │ - CC/Note Binding  │    │ - Page Prev / Next Navigator     │  │  │
│  │  └─────────┬──────────┘    └────────────────┬─────────────────┘  │  │
│  │            │                                │                    │  │
│  │            ▼                                ▼                    │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │                   ProfileManager                           │  │  │
│  │  │  - Active Profile / Presets Store                          │  │  │
│  │  │  - LocalStorage Persistence & JSON Export/Import           │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │            │                                                     │  │
│  │            ▼                                                     │  │
│  │  ┌────────────────────┐                     ┌─────────────────┐  │  │
│  │  │ RateLimiter (30ms) │────────────────────>│ PacketFramer    │  │  │
│  │  └────────────────────┘                     └─────────────────┘  │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │ State Update                        │
│                                  ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  Zustand Store (App State)                       │  │
│  │  - selectedSlotId: 'pre_fx_1' | 'amp' | 'post_fx_1' 등            │  │
│  │  - paramPageIndex: 0 (SW1~4 -> params[0..3]), 1 (params[4..7])    │  │
│  │  - slotModels: 슬롯별 장착 모델 정보 및 파라미터 맵               │  │
│  │  - midiLearnState: { active, targetSlotId, targetParamIndex }    │  │
│  │  - activeProfile: MappingProfile                                 │  │
│  │  - uiState: { logExpanded: boolean, modelSelectorOpen: boolean }  │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │ Reactive Bindings                   │
│                                  ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       React UI View                              │  │
│  │  [Header / Connection & Profile Bar]                             │  │
│  │  [1. Nano Cortex Live Monitor & Parameter Inspector Rack]        │  │
│  │  [2. Nexfoot Virtual Controller Panel & Paging Indicators]        │  │
│  │  [3. Collapsible Packet Event Console (접이식)]                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 세부 모듈 설계

### 2.1 디바이스 카탈로그 및 파라미터 정의 (`src/core/DeviceCatalog.ts`)
Nano Cortex의 시그널 체인은 7개의 고정 슬롯으로 구성되며, 각 슬롯에 장착할 수 있는 공식 디바이스 모델 목록과 파라미터 스키마를 정의합니다.

1. **시그널 체인 슬롯 구조**:
   - `pre_fx_1` (슬롯 인덱스 0x04): Compressor, Overdrive, Boost, Chorus 등
   - `pre_fx_2` (슬롯 인덱스 0x05): Distortion, Fuzz, Pitch 등
   - `amp` (슬롯 인덱스 0x01): Neural Capture 앰프 모델 (Gain, Bass, Mid, Treble, Level, Master 등)
   - `cab` (슬롯 인덱스 0x03): Cab / IR 로더 (IR Slot 1~5, Level, Low Cut, High Cut)
   - `post_fx_1` (슬롯 인덱스 0x06): Delay (Analog, Digital, Tape - Time, Feedback, Mix, Tone, Mod 등)
   - `post_fx_2` (슬롯 인덱스 0x07): Reverb (Plate, Hall, Spring, Ambient - Decay, Pre-Delay, Mix, Tone 등)
   - `post_fx_3` (슬롯 인덱스 0x08): Modulation / Utility (Tremolo, Flanger, Graphic EQ, Noise Gate)

2. **디바이스 모델 스키마**:
   ```typescript
   export interface DeviceParameterDef {
     id: string;
     name: string;
     paramIndex: number;
     min: number;
     max: number;
     defaultValue: number;
     unit?: string;
     step?: number;
     valueFormat?: (val: number) => string;
   }

   export interface DeviceModelDef {
     id: string; // Nano Cortex BLE modelId
     name: string;
     category: 'pre_fx' | 'amp' | 'cab' | 'post_fx';
     description: string;
     parameters: DeviceParameterDef[];
   }
   ```

### 2.2 동적 MIDI Learn 엔진 (`src/core/MidiLearnEngine.ts`)
1. **학습 워크플로우**:
   - 사용자가 UI에서 특정 파라미터 또는 슬롯 바이패스 토글의 `[Learn]` 버튼 클릭 ➔ `MidiLearnEngine.startLearn(target)` 호출.
   - MIDI 메시지 입력 감지 (`WebMidiManager` ➔ `MidiLearnEngine.onMidiMessage(msg)`).
   - **모드 자동 식별**:
     - 수신된 연속 2~3회 신호의 value가 `0`과 `1`로만 구성된 경우 ➔ **상대 모드 (Relative 0=CW, 1=CCW)** 자동 감지.
     - 수신된 값이 $0 \sim 127$ 범위의 일반 가변값인 경우 ➔ **절대 모드 (Absolute)** 자동 감지.
     - Note On 또는 CC Val 127/0 스위칭인 경우 ➔ **푸시 토글 모드 (Momentary / Toggle)** 자동 감지.
   - 감지된 바인딩 정보를 현재 프로필(`activeProfile`)에 즉시 반영 및 `localStorage` 자동 저장.
   - Learn 성공 시 시각적 피드백(녹색 플래시) 후 자동 종료.

### 2.3 매핑 프로필 관리 (`src/core/ProfileManager.ts`)
1. **프로필 데이터 구조**:
   ```typescript
   export interface ControlBinding {
     id: string;
     swId: 'sw1' | 'sw2' | 'sw3' | 'sw4' | 'exp';
     type: 'push' | 'rotate';
     targetType: 'slot_toggle' | 'slot_param' | 'preset_change' | 'page_nav';
     targetSlotId?: string;
     targetParamIndex?: number;
     midiChannel: number;
     ccNumber: number;
     mode: 'relative' | 'absolute' | 'push_toggle';
     min: number;
     max: number;
     invert: boolean;
   }

   export interface MappingProfile {
     id: string;
     name: string;
     description: string;
     version: '0.0.2';
     bindings: ControlBinding[];
   }
   ```
2. **저장 및 Import/Export**:
   - `localStorage` 키: `nado_cortex_profiles`, `nado_cortex_active_profile_id`
   - 기본 제공 프로필:
     - `Factory Default (Nexfoot 4-Rotary Paging)`: SW 1~4 노브는 선택된 슬롯의 현재 페이지 파라미터 1~4번 자동 매핑, SW 1~4 푸시는 Pre/Post 슬롯 바이패스 토글, SW4 Long Press는 파라미터 다음 페이지 전환.
   - JSON 내보내기: `JSON.stringify(profile)`를 Blob으로 변환하여 `profile.name.json` 파일 다운로드.
   - JSON 가져오기: 파일 업로드 후 스키마 유효성 검사 후 프로필 목록에 추가 및 활성화.

### 2.4 슬롯 파라미터 페이징 라우터 (`src/core/DynamicPagingRouter.ts`)
1. **페이징 메커니즘**:
   - 사용자가 UI 상단 시그널 체인에서 특정 슬롯(예: `post_fx_1 Delay`, 파라미터 5개)을 클릭하면 `selectedSlotId = 'post_fx_1'`로 설정.
   - `totalPages = Math.ceil(parameters.length / 4)`. (파라미터가 5개면 2페이지).
   - `paramPageIndex` (0부터 시작):
     - `paramPageIndex === 0`: SW 1 ➔ Param[0], SW 2 ➔ Param[1], SW 3 ➔ Param[2], SW 4 ➔ Param[3].
     - `paramPageIndex === 1`: SW 1 ➔ Param[4], SW 2/3/4 ➔ Unassigned (또는 여분).
   - Nexfoot 노브 회전 이벤트 수신 시:
     - `BridgeRouter`가 현재 `selectedSlotId` 및 `paramPageIndex`를 확인하여 즉시 해당 파라미터의 Float32LE BLE 패킷을 계산하여 송신.

### 2.5 Nano Cortex 프로토콜 확장 (`src/bluetooth/NanoCortexProtocol.ts`)
1. **프리셋 변경 패킷 (`buildPresetChangePacket`)**:
   - 공식 BLE 명령: `[0x06, 0xC0, 0x08, 0x02, 0x10, presetIndex, 0x1B, 0x00, 0x00, 0x00]` (프리셋 0~63).
2. **슬롯 디바이스 모델 변경 패킷 (`buildDeviceModelChangePacket`)**:
   - 공식 BLE 명령: `[0x07 + modelId.length, 0xC0, 0x18, modelSlot, 0x20, ...modelIdBytes, 0x88, 0x00, 0x00, 0x00]`.
3. **슬롯 상세 파라미터 Float32LE 패킷 (`buildSlotParamPacket`)**:
   - `[0x0F, 0xC0, 0x08, 0x01, 0x18, modelSlot, 0x20, paramIndex, 0x2D, ...float32LE, 0x63, 0x00, 0x00, 0x00]`.

---

## 3. UI/UX 레이아웃 설계

화면은 공연장 및 합주실의 어두운 환경과 넓은 시야각을 고려한 고대비 다크 테마(Tailwind CSS)로 구성되며, 사용자가 요청한 **3단 구조**로 완전히 재배치됩니다.

```
┌────────────────────────────────────────────────────────────────────────┐
│ [HEADER] NADO CORTEX v0.0.2    [BLE: Connected] [MIDI: Nexfoot] [⚙️]  │
│  Profile: [ Nexfoot 4-Rotary Dynamic Paging ▼ ] [Export] [Import] [+]  │
├────────────────────────────────────────────────────────────────────────┤
│ ▼ SECTION 1: NANO CORTEX 실시간 모니터 & 슬롯 컨트롤                  │
│                                                                        │
│  Preset: [◀] [ Preset 01: Plexi Lead Crunch (0~63) ▼ ] [▶]            │
│                                                                        │
│  [SIGNAL CHAIN SLOTS] - 클릭하여 파라미터 랙 포커스                    │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐   │
│  │Pre FX 1  │Pre FX 2  │ Capture  │ Cab / IR │Post FX 1*│Post FX 2 │...│
│  │[ACTIVE]  │[BYPASS]  │[ACTIVE]  │[ACTIVE]  │[ACTIVE]  │[ACTIVE]  │   │
│  │Tube Screa│Rodent Dri│UK100 Lead│4x12 Green│Digi Delay│Plate Rev │   │
│  │[Change ▾]│[Change ▾]│[Change ▾]│[Change ▾]│[Change ▾]│[Change ▾]│   │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘   │
│                                                     * 현재 선택된 슬롯 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [SLOT PARAMETER INSPECTOR: Post FX 1 - Digital Delay]            │  │
│  │  Page: [◀ Prev] [ Page 1 / 2 ] [Next ▶] (SW 1~4 엔코더 바인딩)    │  │
│  │                                                                  │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │  │
│  │  │ SW1 [Learn] │ │ SW2 [Learn] │ │ SW3 [Learn] │ │ SW4 [Learn] │ │  │
│  │  │ Time        │ │ Feedback    │ │ Mix         │ │ Tone        │ │  │
│  │  │   450 ms    │ │    40 %     │ │    35 %     │ │    65 %     │ │  │
│  │  │ [===|=====] │ │ [====|====] │ │ [===|=====] │ │ [======|==] │ │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│ ▼ SECTION 2: LIVTRA NEXFOOT 컨트롤러 가상 패널                         │
│                                                                        │
│  ┌───────────────┬───────────────┬───────────────┬───────────────┐     │
│  │ SW 1 (A)      │ SW 2 (B)      │ SW 3 (C)      │ SW 4 (D)      │     │
│  │ [PUSH] Pre 1  │ [PUSH] Post 1 │ [PUSH] Tap/M  │ [PUSH] Page ▶ │     │
│  │ [ROT] DelayTim│ [ROT] DelayFbk│ [ROT] DelayMix│ [ROT] DelayTon│     │
│  │  (CC 21 / 57) │  (CC 22 / 58) │  (CC 23 / 59) │  (CC 24 / 60) │     │
│  │     (( 45% )) │     (( 40% )) │     (( 35% )) │     (( 65% )) │     │
│  └───────────────┴───────────────┴───────────────┴───────────────┘     │
├────────────────────────────────────────────────────────────────────────┤
│ ▶ SECTION 3: 실시간 패킷 및 미디 이벤트 로그 콘솔 (접기/펼치기 가능)   │
│   [▼ 펼치기 (14건의 최신 이벤트)]                       [로그 비우기]  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 단계별 검증 및 테스트 계획

1. **디바이스 카탈로그 및 파라미터 매핑 검증**:
   - `DeviceCatalog`의 슬롯별 파라미터 정의 및 Float32LE 변환 단위 테스트.
2. **MidiLearnEngine 단위 테스트**:
   - 상대 모드(Val 0/1) 및 절대 모드(0~127) 시뮬레이션 이벤트 주입 ➔ 바인딩 결과 검증.
3. **ProfileManager 단위 테스트**:
   - 프로필 로컬 저장, JSON Export, JSON Import 유효성 검사 테스트.
4. **DynamicPagingRouter 통합 테스트**:
   - 5개 이상 파라미터를 가진 슬롯 선택 시 Page 1 ➔ SW 1~4, Page 2 ➔ SW 1 라우팅 전환 검증.
5. **E2E 하드웨어 Mock 테스트**:
   - Nexfoot Mock 회전 ➔ Paging Router ➔ RateLimiter ➔ NanoCortex BLE Mock 패킷 수신까지의 전체 파이프라인 무결성 검증.
