# [Plan] v0.0.5 - Live vs Advanced 모드, Nexfoot 7시~4시 노브 및 접이식 패널

- **마일스톤**: v0.0.5
- **상태**: 작성 및 구현 진행 (Plan Phase)
- **작성일**: 2026-11-16
- **기준 명세서**: [spec.md (v0.0.5)](file:///Users/imac/Workspace/github/nado-cortex/spec.md)
- **핵심 목표**:
  1. **Live 모드 vs Advanced 모드 전환**: 화면 최상단 원클릭 모드 스위치 (연주용 Live 모드 vs 상세 에디터 Advanced 모드)
  2. **Nexfoot 노브 가동 범위 및 게이지 개선**: 실제 아날로그 이펙터와 동일한 7시~4시 방향 270도 회전 아크 및 0%~100% 시각화
  3. **Core Amp/Cab 및 Nexfoot 패널 아코디언 접기/펼치기**: 필요할 때만 펼쳐보는 아코디언 인터랙션 적용

---

## 1. Live 모드 vs Advanced 모드 아키텍처

### 1.1 모드 정의 및 기본 UI 상태

| 항목 | Live 모드 (연주/무대 전용) | Advanced 모드 (상세 에디터/엔지니어) |
| :--- | :--- | :--- |
| **목적** | 공연/합주 연주 중 한눈에 곡/프리셋 확인 및 신속한 풋/손 조작 | 모든 사운드 블록과 파라미터를 정밀하게 디자인 및 모니터링 |
| **화면 최상단** | `[LIVE 모드]` 액티브 (하이라이트 표시) | `[ADVANCED 모드]` 액티브 (하이라이트 표시) |
| **세트리스트 / 템포 / 튜너** | 큼직하게 최상단 강조 표시 | 표준 크기 표시 |
| **Core Amp & Cab 랙** | **접힘(Collapsed) 기본값** (1줄 요약 바, 클릭 시 펼침) | **펼침(Expanded) 기본값** (앰프/캐비닛 전체 카드 노출) |
| **FX 슬롯 & 파라미터 랙** | **항상 표시** (슬롯 On/Off 바이패스 및 선택 슬롯 파라미터) | **항상 표시** (전체 모델 선택 드롭다운 포함) |
| **Livtra Nexfoot 패널** | **숨김(Off / Collapsed) 기본값** | **표시(On / Expanded) 기본값** |
| **실시간 이벤트 로그** | **접힘(Collapsed) 기본값** | 필요에 따라 펼침/접힘 |

### 1.2 모드 전환 시 상태 트리거 흐름
```typescript
setViewMode: (mode: 'live' | 'advanced') => {
  if (mode === 'live') {
    set({
      viewMode: 'live',
      coreAmpCabExpanded: false, // 접힘
      showNexfootPanel: false,    // 숨김
      logExpanded: false,         // 접힘
    });
  } else {
    set({
      viewMode: 'advanced',
      coreAmpCabExpanded: true,  // 펼침
      showNexfootPanel: true,    // 표시
      nexfootExpanded: true,     // 펼침
    });
  }
  localStorage.setItem('nado_view_mode', mode);
}
```

---

## 2. Nexfoot 노브 가동 범위 (7시~4시) 및 게이지 개선

### 2.1 물리적 회전 범위 및 각도 매핑
* 실제 아날로그 스톰프박스/기타 앰프의 가변저항(Potentiometer)은 약 270°~300° 가동 범위를 갖습니다.
* 12시 방향을 $0^\circ$로 할 때:
  * **최솟값 (0% / Min)**: 7시 방향 (약 $-135^\circ$ 또는 $225^\circ$)
  * **중간값 (50% / Mid)**: 12시 방향 ($0^\circ$)
  * **최댓값 (100% / Max)**: 4시~5시 방향 (약 $+135^\circ$ 또는 $315^\circ$)
* **노브 중앙 바디 회전**:
  $$\text{angle} = \text{currentValue} \times 270^\circ - 135^\circ$$
* **SVG 원호(Arc) 렌더링**:
  * 반지름 $r=38$, 원 둘레 $C = 2\pi r \approx 238.76$
  * 가동 각도 $270^\circ / 360^\circ = 0.75 \implies \text{총 호의 길이} = 238.76 \times 0.75 \approx 179$
  * 시작점을 7시 방향으로 설정하기 위해 SVG 회전을 `transform rotate-[135deg]` 적용.
  * 활성 게이지 길이: `currentValue * 179`
* **눈금 및 레이블**:
  * 7시 위치에 `0` (또는 `MIN`), 12시 위치에 `50`, 4시~5시 위치에 `100` (또는 `MAX`) 마커 텍스트 배치.

---

## 3. 컴포넌트별 아코디언 접기/펼치기 인터랙션

### 3.1 Core Amp & Cab 랙 접기/펼치기 (`CortexMonitorPanel.tsx`)
1. **스토어 상태**: `coreAmpCabExpanded: boolean`, `toggleCoreAmpCabExpanded: () => void`.
2. **헤더 바 UI**:
   - `[Core: Neural Capture & Cab/IR 라인]` 헤더에 접기/펼치기 토글 버튼(`ChevronDown` / `ChevronUp`) 배치.
   - 접힌 상태(Collapsed)일 때는 높이를 최소화하여 현재 선택된 앰프 모델명과 캐비닛 모델명, On/Off 상태만 컴팩트한 배지 바 형태로 표시.
   - 펼친 상태(Expanded)일 때는 기존의 풍부한 앰프 헤드 메탈 골드 컨테이너 렌더링.

### 3.2 Livtra Nexfoot 패널 아코디언 접기/펼치기 (`NexfootVirtualPanel.tsx`)
1. **스토어 상태**: `nexfootExpanded: boolean`, `toggleNexfootExpanded: () => void`.
2. **패널 헤더 UI**:
   - `[Livtra Nexfoot]` 패널 헤더 우측에 접기/펼치기 토글 버튼 배치.
   - 접힌 상태에서는 4개 엔코더 노브와 EXP 페달 본문 그리드가 부드럽게 숨겨지고, 헤더 바(현재 제어 슬롯 및 페이지 정보)만 컴팩트하게 노출.

---

## 4. 작업 및 구현 계획
1. **1단계**: Zustand 스토어 확장 (`viewMode`, `coreAmpCabExpanded`, `nexfootExpanded`, 단위 테스트)
2. **2단계**: Header 상단 모드 전환 스위치 (`[LIVE] | [ADVANCED]`) 추가
3. **3단계**: `CortexMonitorPanel.tsx` Core Amp/Cab 접기/펼치기 UI 구현
4. **4단계**: `NexfootVirtualPanel.tsx` 7시~4시 노브 각도/게이지 튜닝 및 접기/펼치기 구현
5. **5단계**: 종합 테스트 및 빌드 검증