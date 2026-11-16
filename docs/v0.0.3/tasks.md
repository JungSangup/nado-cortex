# [Tasks] v0.0.3 - 익스프레션, 세트리스트, 탭/튜너, 역동기화 및 모바일 UI 최적화

- **마일스톤**: v0.0.3
- **상태**: 준비 완료 (Ready to Execute)
- **작성일**: 2026-11-16
- **기준 계획서**: [plan.md (v0.0.3)](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.3/plan.md)
- **기준 명세서**: [spec.md (v0.0.3)](file:///Users/imac/Workspace/github/nado-cortex/spec.md)

---

## 작업 개요 (Task Overview)

| 그룹 | 태스크 ID | 작업 내용 | 우선순위 | 상태 |
| :--- | :--- | :--- | :---: | :---: |
| **Data & Core** | `TASK-301` | 스마트 익스프레션 페달 라우터 구현 (`ExpressionRouter.ts` - CC 1 연동) | P0 | [x] |
| **Data & Core** | `TASK-302` | 세트리스트 및 곡명 관리자 개발 (`SetlistManager.ts`) | P0 | [x] |
| **Data & Core** | `TASK-303` | 지능형 탭 템포 및 튜너 엔진 개발 (`TunerTempoEngine.ts`) | P0 | [x] |
| **Bluetooth**   | `TASK-304` | 실기기 역방향 수신 패킷 디코더 구현 (`NotifyDecoder.ts` - c305 파싱) | P0 | [x] |
| **State Store** | `TASK-305` | Zustand 스토어 확장 (EXP 값, BPM, 튜너 모드, 세트리스트, 모바일 헤더 상태) | P0 | [x] |
| **UI Components**| `TASK-306` | 모바일 최적화 상단 헤더 접기/펼치기 지원 (`Header.tsx` 개편) | P1 | [x] |
| **UI Components**| `TASK-307` | "Nano Cortex" 패널 타이틀 간소화 및 세트리스트/튜너/템포 바 통합 (`CortexMonitorPanel.tsx`) | P0 | [x] |
| **UI Components**| `TASK-308` | "Livtra Nexfoot" 패널 타이틀 간소화 및 가상 EXP 페달 슬라이더 추가 (`NexfootVirtualPanel.tsx`) | P0 | [x] |
| **Integration**  | `TASK-309` | `BridgeRouter.ts` 및 `App.tsx`에 신규 엔진들 바인딩 | P0 | [x] |
| **Testing**      | `TASK-310` | `ExpressionRouter` 및 `SetlistManager` 단위 테스트 작성 | P0 | [x] |
| **Testing**      | `TASK-311` | `TunerTempoEngine` 및 `NotifyDecoder` 단위 테스트 작성 | P0 | [x] |
| **Testing**      | `TASK-312` | E2E 파이프라인 통합 테스트 확장 | P0 | [x] |
| **Review & Doc** | `TASK-313` | v0.0.3 검증 보고서 작성 (`docs/v0.0.3/review.md`), 빌드 및 Git 푸시 | P1 | [x] |

---

## 세부 태스크 명세

### 1. `TASK-301`: 스마트 익스프레션 페달 라우터
- **목표**: Nexfoot EXP 포트(`CC:1`, 0~127)를 수신하여 정규화(0.0~1.0)하고 타겟 파라미터(Wah, Wham, Volume, Delay Mix 등)를 실시간 조작 및 BLE 송신.
- **파일**: `src/core/ExpressionRouter.ts`

### 2. `TASK-302`: 세트리스트 및 곡명 관리자
- **목표**: 프리셋 0~63에 대한 커스텀 곡명 저장 및 라이브 공연용 세트리스트 순서 목록 관리, 이전/다음 곡 이동 지원.
- **파일**: `src/core/SetlistManager.ts`

### 3. `TASK-303`: 탭 템포 및 튜너 엔진
- **목표**: 풋스위치 탭 신호 간격을 계산하여 BPM 산출(40~240) 및 기기 전송, 튜너 모드 On/Off 토글 지원.
- **파일**: `src/core/TunerTempoEngine.ts`

### 4. `TASK-304`: 실기기 역방향 수신 패킷 디코더
- **목표**: `c305` 알림 패킷을 분석하여 본체 조작 시 앰프 노브, 슬롯 바이패스, 프리셋 번호를 화면에 역미러링.
- **파일**: `src/bluetooth/NotifyDecoder.ts`

### 5. `TASK-305`: Zustand 스토어 확장
- **목표**: `expValue`, `bpm`, `isTuning`, `songTitles`, `setlist`, `headerExpanded` 상태 및 액션 통합.
- **파일**: `src/core/store.ts`

### 6. `TASK-306`: 모바일 헤더 접기/펼치기
- **목표**: 작은 모바일 화면에서 상단 Header를 컴팩트하게 접어둘 수 있는 토글 지원.
- **파일**: `src/ui/Header.tsx`

### 7. `TASK-307`: "Nano Cortex" 패널 개편
- **목표**: 타이틀 간소화("Nano Cortex"), 상단에 세트리스트 곡명 및 튜너/탭 템포 바 일체화.
- **파일**: `src/ui/CortexMonitorPanel.tsx`

### 8. `TASK-308`: "Livtra Nexfoot" 패널 개편
- **목표**: 타이틀 간소화("Livtra Nexfoot"), 4개 엔코더 우측에 EXP 페달 수직/수평 게이지 추가 및 가상 드래그 테스트 지원.
- **파일**: `src/ui/NexfootVirtualPanel.tsx`

### 9. `TASK-309`: 라우터 및 App 통합
- **목표**: `BridgeRouter.ts`와 `App.tsx`에서 EXP, 템포, 튜너, 역수신 디코더를 실시간 연결.
- **파일**: `src/core/BridgeRouter.ts`, `src/App.tsx`

### 10~12. `TASK-310 ~ TASK-312`: 테스트 작성
- **목표**: 익스프레션, 세트리스트, 탭 템포, 튜너, 역디코더 단위 및 E2E 테스트 100% 통과.

### 13. `TASK-313`: 보고서 및 빌드/푸시
- **목표**: `docs/v0.0.3/review.md` 작성 및 `git push origin main`.
