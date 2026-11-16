# [Review] v0.0.5 구현 및 검증 결과 보고서

- **마일스톤**: v0.0.5
- **상태**: 구현 및 검증 완료 (Review Phase)
- **일자**: 2026-11-16
- **기준 명세서 및 계획서**:
  - [spec.md (v0.0.5)](file:///Users/imac/Workspace/github/nado-cortex/spec.md)
  - [docs/v0.0.5/plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.5/plan.md)
  - [docs/v0.0.5/tasks.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.5/tasks.md)

---

## 1. 구현 개요
v0.0.5 마일스톤에서는 무대 라이브 환경에서의 극적인 시인성과 사용 편의성, 그리고 실제 하드웨어 이펙터의 아날로그 조작감을 그대로 웹으로 가져오는 UI/UX 개선을 완수하였습니다:
1. **Live 모드 vs Advanced 모드 제공**: 화면 최상단 세그먼트 스위치로 무대 연주용 간편 뷰(Live)와 전체 에디터 뷰(Advanced)를 원터치로 전환.
2. **Nexfoot 노브 가동 범위 및 0%~100% 게이지 개선**: 실제 아날로그 스톰프박스와 동일하게 7시 방향(0%/MIN)에서 시작하여 4시/5시 방향(100%/MAX)에서 끝나는 270도 회전 아크 및 마커 튜닝.
3. **Core Amp/Cab 및 Nexfoot 패널 아코디언 접기/펼치기**: 필요할 때만 펼쳐볼 수 있도록 접이식 아코디언 인터랙션 적용.

---

## 2. 세부 구현 내역

### 2.1 최상단 Live / Advanced 듀얼 모드 스위처 (`src/ui/Header.tsx`, `src/core/store.ts`, `src/App.tsx`)
- **Header 최상단 바**: `[LIVE 모드] | [ADVANCED 모드]` 세그먼트 컨트롤 배치.
- **Live 모드 동작 (극상의 무대 전용 미니멀 뷰)**:
  - **전면 노출 항목 (4가지 핵심 기능만 유지)**:
    1. **현재 템포(TAP & BPM)**: 큼직하고 누르기 편한 대형 탭 버튼 및 비트 펄스.
    2. **프리셋 정보**: 대형 프리셋 번호 및 세트리스트 곡명, 이전/다음 내비게이터.
    3. **FX 슬롯**: 모델 선택 드롭다운을 감추고 대형 온/오프 바이패스 토글 버튼과 슬롯 선택에 집중.
    4. **파라미터 조절**: MIDI Learn 등 부가 기능을 감추고 슬라이더 및 수치 직접 입력에 집중.
  - **완전 숨김 항목**:
    - Core Amp & Cab 랙: 1줄 요약 바까지 포함하여 완전히 숨김.
    - Livtra Nexfoot 가상 패널: 화면에서 완전히 숨김.
    - 실시간 이벤트 로그 콘솔 및 푸터: 화면에서 완전히 숨김.
    - Header 부가 설정/연결 드로어 및 Nexfoot ON/OFF 토글: 숨김.
- **Advanced 모드 동작**:
  - Core Amp/Cab 2단 랙(접기/펼치기 가능), FX 페달 체인(모델 드롭다운 포함), Nexfoot 4노브+EXP 패널(아코디언 접기 가능), 이벤트 로그 등 모든 뷰가 기본 **펼침(Expanded)** 상태로 노출되는 정밀 에디터 뷰.
- **LocalStorage 영구 보존**: 키 `nado_view_mode`를 통해 새로고침 후에도 사용자의 모드 선택 상태 유지.

### 2.2 Core Amp & Cab 아코디언 접기/펼치기 (`src/ui/CortexMonitorPanel.tsx`)
- 헤더 우측에 `[접기 / 펼치기]` (`ChevronUp` / `ChevronDown`) 버튼 제공.
- **접힌 상태**: 1줄 컴팩트 요약 바(`[AMP: 02 Plexi 100 Lead ● ON] [CAB: 4x12 Greenback ● ON]`)로 현재 사운드 상태를 확인하면서 클릭 시 즉시 상세 랙으로 펼쳐짐.
- **펼친 상태**: 앰프 헤드 메탈 골드 컨테이너 2-Card 상세 랙 노출.

### 2.3 Nexfoot 노브 가동 범위 (7시~4시) 및 패널 접기 (`src/ui/NexfootVirtualPanel.tsx`)
- **SVG 원호 시작각 튜닝**: SVG 컨테이너를 `rotate-[135deg]`로 회전하여 시작점이 정확히 **7시 방향**에서 출발.
- **노브 중앙 바디 회전**: `angle = currentValue * 270 - 135` 도를 적용하여 0%일 때 7시 방향, 50%일 때 12시 방향, 100%일 때 4시 반/5시 방향을 정확히 지시.
- **외곽 물리 마커**: 7시 위치에 `0%`, 4시 위치에 `100%` 레이블을 배치하여 아날로그 이펙터의 직관성 극대화.
- **패널 아코디언 접기/펼치기**: 헤더 우측에 `[패널 접기 / 패널 펼치기]` 버튼을 제공하여 필요할 때만 노브 그리드를 펼쳐볼 수 있도록 지원.

### 2.4 세부 UI/UX 리파인먼트 (`src/ui/Header.tsx`, `src/ui/CortexMonitorPanel.tsx`)
1. **모드 전환 버튼 라벨 간소화**: `[Live | Advanced]`로 군더더기 없는 모던한 텍스트로 축약.
2. **타이틀 일관성 유지**: Live 모드에서도 타이틀을 변경 없이 `Nano Cortex`로 통일.
3. **Tuner 버튼 위치 고정**: On/Off 토글 시 텍스트 길이 변경에 따른 줄바꿈(wrap) 현상을 방지하기 위해 라벨을 `TUNER`로 고정하고 `w-[90px] shrink-0`을 적용하여 원위치에서 안정적으로 조작 가능.
4. **FX 슬롯 1~5번 개별 고유 컬러 & Bypass 시 채도 다운**:
   - `pre_fx_1` (Gate): 스틸 실버 / 슬레이트 그레이 (`border-slate-400/50 bg-slate-900/50 text-slate-100`)
   - `pre_fx_2` (Transposer): 모던 민트 / 틸 (`border-teal-500/50 bg-teal-950/30 text-teal-100`)
   - `post_fx_1` (FX1 Drive): 빈티지 웜 앰버 (`border-amber-500/50 bg-amber-950/30 text-amber-100`)
   - `post_fx_2` (FX2 Mod): 라벤더 바이올렛 (`border-purple-500/50 bg-purple-950/30 text-purple-100`)
   - `post_fx_3` (FX3 Delay/Rev): 딥 스카이 블루 (`border-sky-500/50 bg-sky-950/30 text-sky-100`)
   - **Bypass (Off) 상태**: `grayscale opacity-45 bg-zinc-950/40 border-zinc-800/60 text-zinc-500`로 채도를 다운시켜 전원 꺼짐 상태를 극적으로 구분.

---

## 3. 검증 결과

### 3.1 단위 및 통합 테스트 (`npm test`)
- 테스트 파일: **16개 파일 전부 통과 (16 passed)**
- 테스트 케이스: **53개 전원 성공 (53 passed, 0 failed)**
  - 신규 `tests/StoreViewMode.test.ts` (5개 케이스 100% 통과)
  - 기존 통신, 라우팅, 페이징, 토글, 디코더 테스트 전원 회귀 없음

### 3.2 프로덕션 빌드 검증 (`npm run build`)
- TypeScript 타입 컴파일 무결점 (`tsc --noEmit` 통과)
- Vite 프로덕션 번들링 성공 (`dist/assets/index-Rq2yvygC.js`, `dist/assets/index-ZrBith-8.css`)

---

## 4. 결론
v0.0.5 마일스톤의 명세, 설계, 작업, 구현 및 검증이 모두 완료되었습니다.
실제 무대 위 라이브 연주 시에는 **Live 모드**로 필요한 기능만 큼직하게 보고, 톤 메이킹 시에는 **Advanced 모드**로 전환하여 모든 파라미터와 앰프를 세밀하게 조작할 수 있습니다.
