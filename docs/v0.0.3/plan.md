# [Plan] v0.0.3 - 익스프레션, 세트리스트, 탭/튜너, 역동기화 및 모바일 UI 최적화

- **마일스톤**: v0.0.3
- **상태**: 작성 및 승인 대기 (Plan Phase)
- **작성일**: 2026-11-16
- **기준 명세서**: [spec.md (v0.0.3)](file:///Users/imac/Workspace/github/nado-cortex/spec.md)
- **목표**: 
  1. **스마트 익스프레션 페달(EXP In / CC 1) 연동** 및 가상 EXP 컨트롤러
  2. **프리셋별 곡명(Setlist) 및 라이브 세트리스트 순서 관리**
  3. **지능형 탭 템포(Tap Tempo) & 시각 튜너(Tuner) 화면 연동**
  4. **실기기 역방향 동기화(Notify c305 패킷 디코더)**
  5. **모바일 지원 상단 고정 헤더 접기/펼치기 및 UI 타이틀 간소화**

---

## 1. 아키텍처 개요 및 데이터 흐름

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Application                               │
│                                                                        │
│  ┌───────────────────────┐                    ┌─────────────────────┐  │
│  │   WebMidiManager      │                    │ WebBluetoothManager │  │
│  │ - SW 1~4 Push/Rotate  │                    │ - Write c304        │  │
│  │ - EXP In (CC 1)       │                    │ - Notify c305       │  │
│  └──────────┬────────────┘                    └──────────▲──────────┘  │
│             │ MIDI Event                                 │             │
│             ▼                                            │ BLE Packets │
│  ┌───────────────────────────────────────────────────────┴──────────┐  │
│  │                     Core Bridge & Engines                        │  │
│  │                                                                  │  │
│  │  ┌────────────────────┐   ┌─────────────────┐ ┌───────────────┐  │  │
│  │  │  SetlistManager    │   │ TunerTempoEngine│ │ NotifyDecoder │  │  │
│  │  │ - Song Titles 0~63 │   │ - Tap Interval  │ │ - c305 Parse  │  │  │
│  │  │ - Live Order Steps │   │ - Tuner On/Off  │ │ - Mirror Store│  │  │
│  │  └─────────┬──────────┘   └────────┬────────┘ └───────┬───────┘  │  │
│  │            │                       │                  │          │  │
│  │            ▼                       ▼                  ▼          │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ DynamicPagingRouter & ExpressionRouter                     │  │  │
│  │  │ - EXP In (CC 1) -> Wah / Wham / Delay Mix / Volume        │  │  │
│  │  │ - 4-Param Paging Slice & MIDI Learn Integration            │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                    │                             │  │
│  │                                    ▼                             │  │
│  │  ┌────────────────────┐                     ┌─────────────────┐  │  │
│  │  │ RateLimiter (30ms) │────────────────────>│ PacketFramer    │  │  │
│  │  └────────────────────┘                     └─────────────────┘  │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │ State Update                        │
│                                  ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  Zustand Store (App State)                       │  │
│  │  - expValue: 0 ~ 127                                             │  │
│  │  - bpm: number, isTapping: boolean, isTunerOpen: boolean         │  │
│  │  - songTitles: Record<number, string>, setlist: SetlistItem[]    │  │
│  │  - setlistIndex: number                                          │  │
│  │  - headerExpanded: boolean (모바일 접기 지원)                    │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │ Reactive Bindings                   │
│                                  ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       React UI View                              │  │
│  │  [Collapsible Mobile Header (접기/펼치기)]                       │  │
│  │  [1. "Nano Cortex" (Setlist 바, 튜너/템포 바, 슬롯 & 파라미터)]  │  │
│  │  [2. "Livtra Nexfoot" (4x Encoders + 1x EXP 수직/수평 페달)]     │  │
│  │  [3. 실시간 패킷 로그 콘솔 (접이식)]                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 세부 모듈 설계

### 2.1 스마트 익스프레션 페달 라우터 (`src/core/ExpressionRouter.ts`)
1. **입력 신호 규격**:
   - Livtra Nexfoot EXP 포트 ➔ `Ch: 1 CC: 1 Val: 0 ~ 127`
2. **타겟 파라미터 매핑**:
   - 프로필 바인딩에 EXP 대상 등록:
     - 기본값 1: 현재 선택된 슬롯이 Wah(`crying_wah`)인 경우 ➔ `position` 파라미터 자동 연동
     - 기본값 2: 현재 선택된 슬롯이 Wham(`wham_pitch`)인 경우 ➔ `heel_toe` 파라미터 자동 연동
     - 기본값 3: 일반 앰프/딜레이인 경우 ➔ Volume 또는 Mix 파라미터 연동
3. **가상 EXP 페달 UI**:
   - `NexfootVirtualPanel` 우측에 EXP 페달 슬라이더/인디케이터 추가. 마우스/터치 드래그로 가상 페달 조작 가능.

### 2.2 세트리스트 및 곡명 관리자 (`src/core/SetlistManager.ts`)
1. **데이터 모델**:
   ```typescript
   export interface SetlistSong {
     id: string;
     title: string;
     artist?: string;
     presetIndex: number; // 0 ~ 63
     bpm?: number;
     memo?: string;
   }
   ```
2. **기능**:
   - 프리셋 0~63에 대한 기본 곡명 커스터마이징 (예: Preset 1 ➔ "Hotel California (Intro Clean)")
   - 공연 라이브 순서(세트리스트) 목록 생성 및 순차 이동 (`nextSong()`, `prevSong()`)
   - 풋스위치 매핑: 특정 SW 푸시 동작을 `next_song`으로 지정하여 무대에서 발로 곡 전환.

### 2.3 탭 템포 및 튜너 엔진 (`src/core/TunerTempoEngine.ts`)
1. **탭 템포**:
   - 최근 4회 탭 간격 평균 계산 ➔ $40 \sim 240$ BPM 산출.
   - Nano Cortex로 CC 42 전송 및 BLE 패킷 발송. 화면에 템포 비트 깜빡임 인디케이터 표시.
2. **튜너 모드**:
   - 튜너 On 시 기기 오디오 음소거 및 CC 43 전송.
   - 화면에 시각적 튜너 디스플레이(가상 바늘/센트 게이지) 오버레이.

### 2.4 실기기 역방향 동기화 디코더 (`src/bluetooth/NotifyDecoder.ts`)
1. **동작 메커니즘**:
   - Nano Cortex 본체에서 사용자가 전면 Gain 노브를 돌리거나 슬롯 버튼을 누르면 `c305` 특성으로 Notify 패킷 송신.
   - `NotifyDecoder.decode(bytes)`:
     - `0x0B C0 18 <knobId> 20 <val> ...` ➔ Amp 전면 노브 상태 역동기화
     - `0x0A C0 08 01 18 <enableSlot> 20 <val> ...` ➔ 슬롯 On/Bypass 역동기화
     - `0x06 C0 08 02 10 <preset> ...` ➔ 현재 프리셋 번호 역동기화
   - 웹 화면의 노브와 슬롯 상태가 즉시 실제 기기와 100% 일치하도록 업데이트.

### 2.5 모바일 헤더 접기/펼치기 및 타이틀 간소화
1. **모바일 헤더**:
   - `Header.tsx` 상단에 컴팩트 접기 토글 버튼 탑재.
   - 접힘 상태: 로고 + 연결 상태 뱃지만 한 줄로 심플하게 표시 (화면 공간 극대화).
   - 펼침 상태: 프로필 관리, 연결 버튼, 가상 Mock 스위치 모두 표시.
2. **타이틀 간소화**:
   - `CortexMonitorPanel`: "NANO CORTEX 실시간 모니터 & 컨트롤러" ➔ **"Nano Cortex"**
   - `NexfootVirtualPanel`: "LIVTRA NEXFOOT 가상 패널" ➔ **"Livtra Nexfoot"**

---

## 3. 검증 및 테스트 계획
1. `ExpressionRouter` 단위 테스트: CC 1 입력 시 정규화 값(0.0~1.0) 계산 및 타겟 파라미터 패킷 발송 검증
2. `SetlistManager` 단위 테스트: 곡명 변경, 세트리스트 곡 순서 이동 및 로컬스토리지 보존 검증
3. `TunerTempoEngine` 단위 테스트: 탭 간격에 따른 정확한 BPM 산출 및 튜너 상태 전환 검증
4. `NotifyDecoder` 단위 테스트: BLE 역방향 수신 패킷 바이트 디코딩 검증
5. E2E 통합 테스트 및 프로덕션 번들 빌드 검증
