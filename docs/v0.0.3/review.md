# [Review] v0.0.3 - 익스프레션, 세트리스트, 탭/튜너, 역동기화 및 모바일 UI 최적화

- **마일스톤**: v0.0.3
- **상태**: 완료 (Completed)
- **작성일**: 2026-11-16
- **기준 계획서**: [plan.md (v0.0.3)](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.3/plan.md)
- **기준 명세서**: [spec.md (v0.0.3)](file:///Users/imac/Workspace/github/nado-cortex/spec.md)

---

## 1. 개요 및 마일스톤 요약

v0.0.3 마일스톤에서는 라이브 공연 및 모바일 실사용 환경을 겨냥한 핵심 편의 기능과 실기기 연동 고도화를 성공적으로 구현하였습니다:
1. **스마트 익스프레션(EXP In) 연동**:
   - Nexfoot EXP In(CC 1) 신호 수신 시 Wah Sweep, Wham Pitch, Master Vol, 딜레이 믹스 등을 실시간으로 연속 제어.
   - Nexfoot 패널에 EXP In 가상 슬라이더 및 시각화 게이지 추가.
2. **프리셋별 곡명(Setlist) 및 공연 모드**:
   - 0~63 프리셋에 곡 제목(Song Title) 커스터마이징 및 세트리스트 라이브 순서 목록 관리.
   - 풋스위치 및 화면 클릭으로 곡 순서대로 프리셋을 넘기는 세트리스트 내비게이션 탑재.
3. **탭 템포(Tap Tempo) & 시각 튜너(Tuner)**:
   - 탭 간격 평균을 연산하여 40~240 BPM 산출 및 기기 전송.
   - 원클릭 튜너 온/오프 토글 및 센트 오차 게이지 디스플레이.
4. **실기기 역방향 동기화 (Notify c305 정밀 디코더)**:
   - 본체 물리 노브나 버튼을 조작했을 때 수신되는 `c305` 패킷을 디코딩하여 화면에 실시간 역미러링.
5. **모바일 최적화 상단 헤더 접기/펼치기**:
   - 작은 스마트폰 화면에서 상단 Header를 미니멀 1줄 바로 접어둘 수 있는 토글 지원으로 메인 작업 공간 극대화.
6. **UI 타이틀 간소화**:
   - "Nano Cortex" 및 "Livtra Nexfoot"으로 깔끔하게 심플화.

---

## 2. 검증 결과 (Verification Results)

### 2.1 단위 및 통합 테스트 (`vitest`)
총 14개 테스트 파일, 45개 테스트 케이스 100% 통과 (0 실패):

| 테스트 파일 | 테스트 수 | 결과 | 주요 검증 내용 |
| :--- | :---: | :---: | :--- |
| `ExpressionRouter.test.ts` | 4 | PASS | EXP In (CC 1) 수신, Wah/Wham 자동 타겟팅, 0.0~1.0 정규화 및 반전(Invert) 검증 |
| `SetlistManager.test.ts` | 3 | PASS | 0~63 곡명 커스텀, 세트리스트 곡 순서 이동 및 로컬스토리지 보존 검증 |
| `TunerTempoEngine.test.ts` | 3 | PASS | 탭 인터벌 기반 정확한 BPM 산출(500ms->120BPM), 타임아웃 리셋, 튜너 센트 검증 |
| `NotifyDecoder.test.ts` | 3 | PASS | c305 패킷(Amp 노브, 슬롯 바이패스, 프리셋 변경) 역방향 디코딩 및 스토어 갱신 검증 |
| `DeviceCatalog.test.ts` | 5 | PASS | 30종 이상 공식 라이브러리 모델, 슬롯 호환성, 프리셋/모델교체 BLE 패킷 검증 |
| `MidiLearn.test.ts` | 4 | PASS | 상대 틱(0/1), 절대값(중간값), 모멘터리 푸시 토글 자동 식별 검증 |
| `DynamicPagingRouter.test.ts` | 3 | PASS | 4개 단위 파라미터 분할(Page 1/2) 및 SW 1~4 노브 라우팅 검증 |
| `ProfileManager.test.ts` | 5 | PASS | 프로필 CRUD, JSON 직렬화 및 유효성 검증 Import 검증 |
| `BridgeRouter.test.ts` | 4 | PASS | Nexfoot 이벤트, 프리셋 변경, 모델 변경 전체 라우팅 검증 |
| `E2EIntegration.test.ts` | 2 | PASS | MIDI 가상 입력 ➔ 라우팅 ➔ BLE 가상 패킷 송수신 전체 파이프라인 무결성 검증 |
| `PacketFramer.test.ts` | 3 | PASS | 0xC0 구분자 프레이밍, MTU 분할 재조합 검증 |
| `NexfootParser.test.ts` | 3 | PASS | 실기기 CC 21~24(푸시), CC 57~60(상대 틱 Val 0/1) 파싱 검증 |
| `RateLimiter.test.ts` | 2 | PASS | 30ms 트레일링 엣지 스로틀러 및 대역폭 보호 검증 |
| `setup.test.ts` | 1 | PASS | 테스트 환경 셋업 무결성 검증 |
| **전체 합계** | **45** | **PASS (100%)** | |

### 2.2 빌드 검증 (`tsc && vite build`)
- TypeScript 타입 에러: 0건
- 프로덕션 번들링: 성공 (`dist/assets/index-BKRoWUfK.css` 26.29 kB, `dist/assets/index-BQPdjlxO.js` 250.93 kB)

---

## 3. 결론

v0.0.3 마일스톤이 결함 없이 완벽하게 달성되었습니다. 이제 사용자는 무대 위에서 세트리스트 곡 순서로 프리셋을 손쉽게 전환하고, 발끝의 익스프레션 페달로 Wah와 피치를 실시간 제어하며, 탭 템포와 튜너를 모바일 화면에서 편리하게 확인할 수 있습니다.
