# [Plan] v0.0.4 - 시그널 체인 슬롯 분리, 파라미터 직접 입력, Nexfoot 독립 토글

- **마일스톤**: v0.0.4
- **상태**: 작성 및 구현 진행 (Plan Phase)
- **작성일**: 2026-11-16
- **기준 명세서**: [spec.md (v0.0.4)](file:///Users/imac/Workspace/github/nado-cortex/spec.md)
- **핵심 목표**:
  1. **시그널 체인 슬롯 분리 라인 처리 (2-Row Signal Chain)**: Neural Capture(AMP) 및 Cab/IR(CAB)을 FX 슬롯과 별개의 독립 라인/섹션으로 구조화 및 렌더링
  2. **파라미터 직접 입력 모드 (Direct Numeric Input)**: 슬라이더 조작뿐 아니라 수치 라벨 클릭 시 키보드로 직접 타이핑 입력 지원
  3. **Livtra Nexfoot 독립 모드 & 패널 On/Off 토글 (Standalone Mode)**: Nexfoot 미사용 시 가상 패널을 숨겨 Nano Cortex 풀스크린 에디터로 활용

---

## 1. 아키텍처 개요 및 UI 레이아웃

### 1.1 2-Row Signal Chain 구조
실제 Nano Cortex의 시그널 라우팅을 직관적으로 시각화하기 위해 1열 나열 방식에서 **2단 독립 섹션 구조**로 전면 개편합니다.

```
[ Guitar Audio In ]
       │
       ▼
┌────────────────────────────────────────────────────────────────────────┐
│  라인 1: FX 페달 라인 (Pre-FX & Post-FX Stompboxes)                   │
│                                                                        │
│  [ Pre-FX ]                                                            │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                │
│  │     Gate      │ │  Transposer   │ │      FX1      │ ───┐            │
│  │ (Adaptive/Off)│ │ (+/- Octave)  │ │(Drive/Comp/Wah│    │            │
│  └───────────────┘ └───────────────┘ └───────────────┘    │            │
│                                                           ▼            │
│  라인 2: Core Amp & Cab 라인 (Neural Capture & IR Impulse Response)   │
│  ┌────────────────────────────────────────┐ ┌────────────────────────┐ │
│  │         Neural Capture (AMP)           │ │       Cab / IR (CAB)   │ │
│  │  - 앰프 모델 선택 & Bypass              │ │  - 캐비닛 모델 선택 &  │ │
│  │  - 전면 노브 (Gain, Bass, Mid, Treble) │ │    Bypass 토글         │ │
│  └────────────────────────────────────────┘ └────────────┬───────────┘ │
│                                                          │             │
│  [ Post-FX ] <───────────────────────────────────────────┘             │
│  ┌─────────────────────────────┐ ┌───────────────────────────────────┐ │
│  │             FX2             │ │                FX3                │ │
│  │   (Modulation / Pitch / EQ) │ │         (Delay / Reverb)          │ │
│  └─────────────────────────────┘ └───────────────────┬───────────────┘ │
└──────────────────────────────────────────────────────┼─────────────────┘
                                                       ▼
                                              [ Stereo Audio Out ]
```

### 1.2 대시보드 3단(또는 2단 독립) 레이아웃 변화
```
┌────────────────────────────────────────────────────────────────────────┐
│  [Header] Nano Cortex Status • Nexfoot Status • [Nexfoot 패널 ON/OFF]  │
├────────────────────────────────────────────────────────────────────────┤
│  [Nano Cortex 모니터 & 컨트롤러]                                        │
│  • 프리셋 / 세트리스트 네비게이터 & BPM / 튜너 바                      │
│  • [섹션 A] Core Amp & Cab 랙 (Neural Capture + Cab/IR)                │
│  • [섹션 B] FX 페달보드 랙 (Pre-FX: Gate, Trans, FX1 / Post-FX: FX2, 3)│
│  • [섹션 C] 선택된 슬롯 상세 파라미터 랙 (슬라이더 + 직접 키보드 입력) │
├────────────────────────────────────────────────────────────────────────┤
│  [Livtra Nexfoot 가상 패널]  <-- 토글 스위치로 On/Off 숨김 가능!        │
│  • SW 1~4 엔코더 노브 & 스마트 EXP 슬라이더                            │
│  (OFF 시 화면 공간이 Nano Cortex 전용 풀스크린 에디터로 확장됨)        │
├────────────────────────────────────────────────────────────────────────┤
│  [실시간 패킷 & MIDI 이벤트 로그 콘솔 (접이식)]                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 세부 모듈 및 기능 설계

### 2.1 시그널 체인 슬롯 분리 라인 컴포넌트 (`src/ui/CortexMonitorPanel.tsx`)
1. **슬롯 그룹화 정의**:
   - `coreSlots`: `['amp', 'cab']` (Neural Capture 앰프 헤드 & 캐비닛 IR)
   - `preFxSlots`: `['gate', 'transposer', 'fx1']`
   - `postFxSlots`: `['fx2', 'fx3']`
2. **시각적 차별화**:
   - **Core Amp & Cab 섹션**: 묵직하고 전문적인 앰프 헤드 스타일의 메탈릭/골드 보더, 앰프 전면 8개 노브 및 캐비닛 모델 뱃지 표시.
   - **FX 페달 섹션**: 컴팩트한 스톰프박스 페달보드 스타일 (색상별 LED 및 직관적인 온오프 바이패스 스위치).
   - 슬롯 간에 신호 흐름 화살표(`➔`)를 배치하여 오디오 시그널 루팅 가시화.
3. **인터랙션 일관성**:
   - 어떤 슬롯을 클릭하든 `selectedSlotId`가 활성화되며, 하단 `SlotParameterRack`에 즉시 상세 파라미터들이 로드됨.

### 2.2 파라미터 직접 입력 모드 (`src/ui/SlotParameterRack.tsx`)
1. **상태 관리**:
   - 카드별 인라인 편집 상태: `editingParamIndex: number | null`
   - 현재 임시 타이핑 문자열: `editingText: string`
2. **동작 워크플로우**:
   - 수치 표시 영역(Badge)을 더블클릭하거나 연필 아이콘 클릭 시 `<input type="text">`로 전환되고 자동 포커스.
   - 사용자가 `0.75`, `75%`, `120ms` 또는 `5.0` 등 직접 입력.
   - **유효성 검사 및 정규화(Clamping)**:
     - 백분율(`%`), 데시벨(`dB`), 밀리초(`ms`) 등의 단위 접미사를 안전하게 파싱하여 `0.0 ~ 1.0` 정규화 수치로 변환.
     - `0.0 <= val <= 1.0` 범위로 클램핑.
   - **확정 및 취소**:
     - `Enter` 키 또는 `onBlur` 발생 시 ➔ 정규화된 값을 `updateSlotParamValue` 및 `onParamChange`로 즉시 전달.
     - `Escape` 키 입력 시 ➔ 변경 취소하고 원래 값으로 복귀.
3. **슬라이더와 연동**:
   - 직접 입력이 완료되면 슬라이더 위치도 실시간 애니메이션과 함께 즉각 동기화.

### 2.3 Livtra Nexfoot 독립 모드 & 가상 패널 토글 (`src/core/store.ts` & `src/App.tsx`)
1. **스토어 상태 확장**:
   ```typescript
   showNexfootPanel: boolean; // default: true (localStorage에서 복원)
   toggleNexfootPanel: () => void;
   ```
2. **영구 저장 (`localStorage`)**:
   - 키: `nado_show_nexfoot_panel`
   - 앱 로드 시 저장된 설정을 불러오며, 토글 시 자동 동기화.
3. **UI 토글 스위치**:
   - `Header.tsx` 우측 상단 또는 유틸리티 영역에 깔끔한 토글 버튼(`[Nexfoot 패널 보이기/숨기기]` 또는 아이콘) 배치.
   - Nexfoot 패널이 숨겨졌을 때도 백그라운드 MIDI 연결과 브릿지 라우팅(`BridgeRouter.ts`)은 100% 정상 작동 유지.

---

## 3. 테스트 및 검증 계획
1. **단위 테스트**:
   - `store.test.ts`: `showNexfootPanel` 토글 및 로컬 스토리지 보존 테스트.
   - `DynamicPagingRouter.test.ts` 및 카탈로그 파라미터 유효성 테스트 검증.
2. **통합 컴포넌트 렌더링 검증**:
   - `CortexMonitorPanel`: Core Amp/Cab 라인과 FX 라인이 분리되어 정상 렌더링되는지 확인.
   - `SlotParameterRack`: 직접 수치 입력 후 Enter 시 올바른 Float32 값이 전달되는지 확인.
   - `App`: `showNexfootPanel`에 따라 `NexfootVirtualPanel` 마운트/언마운트 동작 검증.
3. **빌드 검증**:
   - TypeScript 컴파일 무결점(`tsc --noEmit`), Vite 번들링 성공.