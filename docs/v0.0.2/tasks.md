# [Tasks] v0.0.2 - 동적 MIDI Learn, 디바이스/파라미터 제어 및 UI 전면 개편

- **마일스톤**: v0.0.2
- **상태**: 준비 완료 (Ready to Execute)
- **작성일**: 2026-11-16
- **기준 계획서**: [plan.md (v0.0.2)](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.2/plan.md)
- **기준 명세서**: [spec.md (v0.0.2)](file:///Users/imac/Workspace/github/nado-cortex/spec.md)

---

## 작업 개요 (Task Overview)

| 그룹 | 태스크 ID | 작업 내용 | 우선순위 | 상태 |
| :--- | :--- | :--- | :---: | :---: |
| **Data & Core** | `TASK-201` | Nano Cortex 슬롯별 공식 디바이스 카탈로그 및 파라미터 정의 (`DeviceCatalog.ts`) | P0 | [x] |
| **Data & Core** | `TASK-202` | Nano Cortex BLE 프로토콜 확장 (프리셋 0~63 변경 `0x1B`, 모델 변경 `0x88`, 파라미터 Float32LE `0x63`) | P0 | [x] |
| **Data & Core** | `TASK-203` | 프로필 관리 시스템 구축 (`ProfileManager.ts` - LocalStorage & JSON Export/Import) | P0 | [x] |
| **Data & Core** | `TASK-204` | 동적 MIDI Learn 엔진 개발 (`MidiLearnEngine.ts` - Relative/Absolute 모드 자동 식별) | P0 | [x] |
| **Data & Core** | `TASK-205` | 다이내믹 파라미터 페이징 라우터 구현 (`DynamicPagingRouter.ts`) | P0 | [x] |
| **State Store** | `TASK-206` | Zustand 스토어 확장 (선택 슬롯, 페이징 인덱스, 프로필 목록, MIDI Learn 상태) | P0 | [x] |
| **UI Components**| `TASK-207` | 상단 네비게이션 & 프로필 관리 바 (`Header.tsx` 리팩토링) | P1 | [x] |
| **UI Components**| `TASK-208` | Nano Cortex 실시간 모니터 & 슬롯 컨트롤러 (`CortexMonitorPanel.tsx` 개편) | P0 | [x] |
| **UI Components**| `TASK-209` | 슬롯별 상세 파라미터 인스펙터 랙 (`SlotParameterRack.tsx` 신규 컴포넌트) | P0 | [x] |
| **UI Components**| `TASK-210` | Livtra Nexfoot 가상 패널 및 페이징 연동 인디케이터 (`NexfootVirtualPanel.tsx` 개편) | P1 | [x] |
| **UI Components**| `TASK-211` | 실시간 패킷 로그 콘솔 접기/펼치기 지원 (`EventLogConsole.tsx` 개편) | P1 | [x] |
| **Integration**  | `TASK-212` | 메인 대시보드 3단 레이아웃 통합 (`App.tsx` 전면 리팩토링) | P0 | [x] |
| **Testing**      | `TASK-213` | `DeviceCatalog` 및 `NanoCortexProtocol` 단위 테스트 작성 | P0 | [x] |
| **Testing**      | `TASK-214` | `MidiLearnEngine` 및 `ProfileManager` 단위 테스트 작성 | P0 | [x] |
| **Testing**      | `TASK-215` | `DynamicPagingRouter` 페이징 및 E2E 브릿지 연동 테스트 | P0 | [x] |
| **Review & Doc** | `TASK-216` | v0.0.2 구현 검증 보고서 작성 (`docs/v0.0.2/review.md`) 및 빌드/배포 | P1 | [x] |

---

## 세부 태스크 명세

### 1. `TASK-201`: Nano Cortex 슬롯별 공식 디바이스 카탈로그 및 파라미터 정의
- **목표**: Pre-FX 1/2, Amp, Cab, Post-FX 1/2/3 각 슬롯에 들어가는 대표 디바이스 모델 목록 및 파라미터 메타데이터(이름, 범위, 기본값, 단위) 데이터셋 구축.
- **파일**: `src/core/DeviceCatalog.ts`
- **완료 기준**:
  - Pre-FX (Drive, Compressor, Boost 등) 디바이스 정의
  - Amp (Neural Capture 모델 앰프) 정의
  - Cab (IR 로더 5슬롯) 정의
  - Post-FX (Delay, Reverb, Chorus/Modulation 등) 정의
  - 각 디바이스별 $0.0 \sim 1.0$ 정규화 값과 실제 표시값(Hz, ms, %, dB) 포맷터 함수 구현

### 2. `TASK-202`: Nano Cortex BLE 프로토콜 확장
- **목표**: 프리셋 전환, 디바이스 모델 변경, 슬롯 상세 파라미터 전송을 위한 바이너리 패킷 빌더 구현.
- **파일**: `src/bluetooth/NanoCortexProtocol.ts`
- **완료 기준**:
  - `buildPresetChangePacket(presetIndex: number)` 구현 (프리셋 0~63 지원)
  - `buildDeviceModelChangePacket(slotIndex: number, modelId: string)` 구현
  - `buildSlotParamPacket(slotIndex: number, paramIndex: number, value: number)` Float32LE 빌더 완성

### 3. `TASK-203`: 프로필 관리 시스템 구축
- **목표**: 사용자의 컨트롤러 매핑을 로컬 브라우저에 다중 저장하고 JSON 파일로 백업/복원하는 시스템 구축.
- **파일**: `src/core/ProfileManager.ts`
- **완료 기준**:
  - 기본 팩토리 프로필(Nexfoot Dynamic Paging) 생성
  - `localStorage` 읽기/쓰기 및 동기화
  - 프로필 복제, 수정, 삭제 기능
  - JSON Schema 검증 및 Export/Import (다운로드/업로드)

### 4. `TASK-204`: 동적 MIDI Learn 엔진 개발
- **목표**: 사용자가 UI에서 특정 파라미터의 [Learn]을 누르고 풋스위치/노브를 조작했을 때 CC 및 Relative/Absolute 모드를 자동 감지하여 바인딩.
- **파일**: `src/core/MidiLearnEngine.ts`
- **완료 기준**:
  - `startLearn(target)` / `cancelLearn()` API
  - MIDI CC 이벤트 수신 시 값의 변화 패턴을 분석하여 상대(Val 0/1) vs 절대(0~127) 자동 분류
  - 성공 시 콜백 트리거 및 프로필에 자동 반영

### 5. `TASK-205`: 다이내믹 파라미터 페이징 라우터 구현
- **목표**: 선택된 슬롯의 파라미터를 SW 1~4 엔코더에 4개씩 분할 할당하고 페이지 내비게이션 처리.
- **파일**: `src/core/DynamicPagingRouter.ts`
- **완료 기준**:
  - 슬롯 전환 시 `pageIndex = 0` 초기화
  - 현재 페이지에 해당하는 파라미터 목록 반환
  - Nexfoot SW 1~4 노브 회전 시 현재 페이지의 해당 파라미터 값 가감 및 BLE 패킷 발송 연동
  - `nextPage()` / `prevPage()` 동작 구현

### 6. `TASK-206`: Zustand 스토어 확장
- **목표**: v0.0.2 상태(선택된 슬롯, 페이징, 프로필, MIDI Learn 상태)를 Zustand 스토어에 통합.
- **파일**: `src/core/store.ts`
- **완료 기준**:
  - `selectedSlotId`, `paramPageIndex`, `activeProfile`, `profiles`, `midiLearnState` 상태 필드 및 액션 추가

### 7. `TASK-207`: 상단 네비게이션 & 프로필 관리 바
- **목표**: 프로필 드롭다운, Import/Export 버튼, 새 프로필 생성 모달 연동.
- **파일**: `src/ui/Header.tsx`
- **완료 기준**:
  - 프로필 선택 드롭다운
  - JSON 내보내기/가져오기 버튼
  - BLE/MIDI 연결 상태 유지

### 8. `TASK-208`: Nano Cortex 실시간 모니터 & 슬롯 컨트롤러
- **목표**: 최상단 Cortex 모니터 패널로 프리셋 전환 및 7개 슬롯 표시, 슬롯별 모델 변경 드롭다운/모달 제공.
- **파일**: `src/ui/CortexMonitorPanel.tsx`
- **완료 기준**:
  - 프리셋 0~63 전환 드롭다운 및 이전/다음 화살표
  - 7개 시그널 체인 슬롯 카드 (Pre 1, Pre 2, Amp, Cab, Post 1, Post 2, Post 3)
  - 각 슬롯 활성/바이패스 토글 및 디바이스 모델 선택 드롭다운
  - 슬롯 클릭 시 선택 하이라이트(포커스)

### 9. `TASK-209`: 슬롯별 상세 파라미터 인스펙터 랙
- **목표**: 선택된 슬롯의 모든 파라미터를 노브/슬라이더 랙으로 표시하고 마우스 드래그 및 [Learn] 지원.
- **파일**: `src/ui/SlotParameterRack.tsx` (신규)
- **완료 기준**:
  - 선택된 슬롯의 모든 파라미터 슬라이더/노브 그리드
  - 화면에서 마우스/터치 드래그로 직접 조절 시 BLE 즉시 반영
  - 각 파라미터에 현재 할당된 Nexfoot 엔코더 번호(SW 1~4) 및 [Learn] 버튼 배치
  - 페이징 컨트롤러 (`[◀] Page 1 / 2 [▶]`)

### 10. `TASK-210`: Livtra Nexfoot 가상 패널 및 페이징 연동
- **목표**: 중단에 배치된 Nexfoot 가상 패널에 현재 SW 1~4가 제어하고 있는 슬롯 및 파라미터 정보 시각화.
- **파일**: `src/ui/NexfootVirtualPanel.tsx`
- **완료 기준**:
  - 각 엔코더 카드 상단에 현재 바인딩된 파라미터명과 값 실시간 표시
  - 푸시 스위치 동작 시각화 및 가상 테스트 지원

### 11. `TASK-211`: 실시간 패킷 로그 콘솔 접기/펼치기 지원
- **목표**: 최하단 로그 창을 기본적으로 접어두거나 클릭으로 펼칠 수 있도록 Collapsible UI로 변경.
- **파일**: `src/ui/EventLogConsole.tsx`
- **완료 기준**:
  - 접기/펼치기 토글 버튼 및 상태 표시
  - 로그 지우기 기능 유지

### 12. `TASK-212`: 메인 대시보드 3단 레이아웃 통합
- **목표**: `App.tsx`를 최상단 Cortex ➔ 중단 Nexfoot ➔ 최하단 로그 3단 구조로 조립하고 라우터/엔진 바인딩.
- **파일**: `src/App.tsx`
- **완료 기준**:
  - 3단 순서 배치
  - 미디/블루투스 이벤트 리스너와 `MidiLearnEngine`, `DynamicPagingRouter` 연동

### 13~15. `TASK-213 ~ TASK-215`: 단위 및 E2E 테스트 작성
- **목표**: 카탈로그, 프로토콜, MIDI Learn, 프로필, 페이징 라우팅 단위 테스트 및 E2E 브릿지 연동 검증.
- **파일**: `tests/DeviceCatalog.test.ts`, `tests/MidiLearn.test.ts`, `tests/PagingRouter.test.ts`, `tests/ProfileManager.test.ts`
- **완료 기준**:
  - Vitest 실행 시 모든 테스트 성공 (통과율 100%)

### 16. `TASK-216`: 검증 보고서 및 빌드/배포
- **목표**: `npm run build` 확인, `docs/v0.0.2/review.md` 작성 및 git commit.
- **완료 기준**:
  - TypeScript 오류 0건, 프로덕션 번들 빌드 성공
  - `docs/v0.0.2/review.md` 작성 및 원격 저장소 푸시
