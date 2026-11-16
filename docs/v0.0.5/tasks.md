# [Tasks] v0.0.5 - 작업 목록 및 진행 상황 (WBS)

- **마일스톤**: v0.0.5
- **상태**: 완료 (Completed Phase)
- **작성일**: 2026-11-16
- **기준 계획서**: [docs/v0.0.5/plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.5/plan.md)

---

## 1. 작업 분할 및 체크리스트

### 1단계: 스토어 확장 및 상태 관리 (Store Layer)
- [x] **Task 1.1**: `src/core/store.ts`에 `viewMode`('live' | 'advanced'), `coreAmpCabExpanded`, `nexfootExpanded` 상태 및 액션 추가
- [x] **Task 1.2**: `setViewMode` 시 각 모드별 기본 접기/펼치기 및 LocalStorage 동기화 로직 구현
- [x] **Task 1.3**: 단위 테스트 작성 및 검증 (`tests/StoreViewMode.test.ts` 5개 케이스 통과)

### 2단계: 최상단 모드 전환 UI (Header UI)
- [x] **Task 2.1**: `src/ui/Header.tsx` 화면 최상단에 `[LIVE 모드] | [ADVANCED 모드]` 세그먼트 컨트롤 추가
- [x] **Task 2.2**: 모드별 시각적 하이라이트 스타일링 (Live 모드: 에메랄드/앰버 액센트, Advanced 모드: 사이언/퍼플 액센트)
- [x] **Task 2.3**: 모바일 및 작은 화면에서도 1줄 컴팩트 유지 반응형 레이아웃 튜닝

### 3단계: Core Amp & Cab 랙 접기/펼치기 아코디언 (Cortex Panel)
- [x] **Task 3.1**: `src/ui/CortexMonitorPanel.tsx`의 Core 라인 헤더에 `ChevronDown`/`ChevronUp` 토글 버튼 추가
- [x] **Task 3.2**: 접힌 상태(Collapsed)일 때 컴팩트 1줄 요약 바 (현재 앰프명, 캐비닛명, On/Off 뱃지) 구현
- [x] **Task 3.3**: 펼친 상태(Expanded)일 때 기존 앰프/캐비닛 2-Card 랙 전환 인터랙션 구현

### 4단계: Nexfoot 노브 가동 범위 (7시~4시) 및 패널 접기 (Nexfoot Panel)
- [x] **Task 4.1**: `src/ui/NexfootVirtualPanel.tsx` SVG 원호의 회전 시작각을 7시 방향(`rotate-[135deg]`)으로 재정렬
- [x] **Task 4.2**: 노브 외곽에 7시(0%), 4시(100%) 마커 및 눈금 레이블 추가
- [x] **Task 4.3**: Nexfoot 패널 헤더 우측에 `ChevronDown`/`ChevronUp` 아코디언 토글 버튼 추가
- [x] **Task 4.4**: `nexfootExpanded` 상태에 따른 본문 그리드 접기/펼치기 애니메이션 및 렌더링 적용

### 5단계: 통합 검증 및 문서화
- [x] **Task 5.1**: 전체 Vitest 단위 및 통합 테스트 실행 (16개 파일 53개 케이스 100% 통과)
- [x] **Task 5.2**: 프로덕션 빌드 검증 (`npm run build`, TypeScript 무결점)
- [x] **Task 5.3**: `docs/v0.0.5/review.md` 작성 및 최종 보고서 작성

### 6단계: UI/UX 마이너 리파인먼트 (User Feedback 반영)
- [x] **Task 6.1**: 최상단 모드 전환 버튼 라벨 `Live` / `Advanced` 로 간결화 ("모드" 텍스트 제거)
- [x] **Task 6.2**: Live 모드 시에도 패널 타이틀을 일관되게 `Nano Cortex`로 유지
- [x] **Task 6.3**: Tuner 버튼 라벨 고정(`TUNER`) 및 고정 너비(`w-[90px] shrink-0`) 적용으로 클릭 시 위치 이동 현상 방지
- [x] **Task 6.4**: FX 슬롯 1~5번 개별 고유 테마 컬러 매핑 (Slate, Teal, Amber, Purple, Sky) 및 Off 시 `grayscale opacity-45` 채도 다운 적용

---

## 2. 작업 진행 현황 요약
- 전체 태스크: 19개
- 완료 태스크: 19개
- 진행률: 100%
