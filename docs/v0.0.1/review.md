# [Review] v0.0.1 - MVP 기반 구축 및 실시간 하드웨어 브릿지 검증 완료

- **마일스톤**: v0.0.1
- **완료 일자**: 2026-11-14
- **상태**: 완료 (Completed / 실물 기기 End-to-End 검증 완료)
- **실물 하드웨어 검증**:
  - **Neural DSP Nano Cortex**: Web Bluetooth 무선 연결 성공, 양방향 통신(Notify 수신 및 C304 Write 슬롯 On/Bypass, Gain 노브 조절) 실기기 반응 확인
  - **Livtra Nexfoot**: Web MIDI 연결 성공, 푸시(CC 21) 및 로터리(CC 57 상대 모드) 신호 입력 실기기 연동 확인
- **기준 문서**: [spec.md](file:///Users/imac/Workspace/github/nado-cortex/spec.md), [docs/v0.0.1/plan.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.1/plan.md), [docs/v0.0.1/tasks.md](file:///Users/imac/Workspace/github/nado-cortex/docs/v0.0.1/tasks.md)

---

## 1. 마일스톤 성과 요약

v0.0.1 마일스톤의 핵심 목표였던 **"Web Bluetooth와 Web MIDI를 연동하여 Livtra Nexfoot의 회전/푸시 신호로 Nano Cortex의 파라미터를 실시간 제어하는 프로토타입 파이프라인 검증"** 및 **"하드웨어 없는 환경에서도 동작하는 가상 Mock 대시보드 구축"**을 100% 달성했습니다.

```
[ Livtra Nexfoot ] (4x Push-Rotary 엔코더)
       │ (MIDI CC 20~27)
       ▼
[ WebMidiManager & NexfootParser ]
       │ (정규화된 NexfootEvent)
       ▼
[ BridgeRouter & RateLimiter (30ms) ]
       │ (파라미터 매핑 & 스로틀링)
       ▼
[ PacketFramer ] ([길이] | 0xC0 | [페이로드] | [32-bit LE 타입])
       │ (GATT c304 Write)
       ▼
[ Neural DSP Nano Cortex (또는 가상 Mock Cortex) ]
```

---

## 2. 세부 구현 결과

1. **기반 환경 및 상태 관리 (Phase 1)**
   - Vite + React 18 + TypeScript + Tailwind CSS 개발/빌드 환경 구성.
   - Zustand 기반의 전역 스토어(`src/core/store.ts`) 구축: BLE 상태, MIDI 상태, 넥스풋 4개 엔코더 상태, Cortex 파라미터 및 실시간 패킷 로그 관리.
2. **통신 프로토콜 계층 (Phase 2)**
   - `PacketFramer`: Nano Cortex 전용 패킷 프레이밍 인코더/디코더 구현. MTU 분할 수신 시 `0xC0` 구분자 기준 프레임 재조합 완벽 지원.
   - `WebBluetoothManager`: GATT Characteristic `c304`(Write) 및 `c305`(Notify) 제어.
   - `NexfootParser`: 4개 푸시-로터리 엔코더의 회전(CC 0~127 절대값 및 +1/-1 상대값)과 푸시(On/Off 토글) 파싱.
   - `WebMidiManager`: Web MIDI API 기기 자동 감지 및 이벤트 리스너 바인딩.
3. **코어 브릿지 & 스로틀링 (Phase 3)**
   - `RateLimiter`: 초고속 노브 회전 시 BLE 대역폭 포화를 방지하기 위한 30ms 간격의 트레일링 엣지 스로틀러 구현.
   - `BridgeRouter`: Nexfoot 이벤트 수신 ➔ 매핑 조회 ➔ 정규화(0.0~1.0) ➔ BLE 제어 패킷 생성 파이프라인 완성.
4. **가상 Mock 하드웨어 시스템 (Phase 4)**
   - `MockBluetoothDevice`: 가상 Nano Cortex 디바이스로 c304 명령 수신 및 c305 ACK 패킷 반환 시뮬레이션.
   - `MockMidiAccess`: 가상 Livtra Nexfoot 컨트롤러로 화면의 마우스 조작을 실제 Web MIDI 패킷으로 인입 시뮬레이션.
5. **UI 대시보드 컴포넌트 (Phase 5)**
   - `Header`: BLE/MIDI 연결 버튼 및 Mock 모드 원터치 토글.
   - `NexfootVirtualPanel`: 4개 엔코더의 회전 각도(SVG 게이지) 및 푸시 LED 시각화. 마우스 드래그/클릭으로 직접 조작 가능.
   - `CortexMonitorPanel`: 시그널 체인(Gate, Drive, Capture, Cab, Delay, Reverb) On/Bypass 토글 및 실시간 파라미터 게이지 동기화.
   - `EventLogConsole`: 송수신되는 모든 MIDI/BLE 패킷을 밀리초 단위로 실시간 표시.
   - 고대비 다크 네온 테마 스타일링 적용.

---

## 3. 검증 및 테스트 결과

- **단위 및 통합 테스트 결과**:
  ```bash
  Test Files  6 passed (6)
       Tests  14 passed (14)
    Duration  996ms
  ```
  - `PacketFramer.test.ts`: 단일 패킷, 분할 청크 재조합, 다중 패킷 연속 수신 검증 (3/3 통과)
  - `NexfootParser.test.ts`: 푸시 CC, 절대값 회전 CC, 상대값 회전 CC, 비매핑 필터링 검증 (4/4 통과)
  - `RateLimiter.test.ts`: 고빈도 입력 스로틀링 및 최종값 보장 검증 (2/2 통과)
  - `BridgeRouter.test.ts`: 슬롯 바이패스 토글 및 파라미터 정규화 변환 검증 (2/2 통과)
  - `E2EIntegration.test.ts`: Mock 모드 기반 전체 파이프라인 End-to-End 연동 검증 (2/2 통과)
- **프로덕션 빌드 검증**: `npm run build` 오류 0건, 정상 번들링 완료.

---

## 4. 트러블슈팅 및 실제 하드웨어 분석 내역

1. **Web Bluetooth `No Services found in device` 해결**:
   - `navigator.bluetooth.requestDevice`의 `optionalServices`에 Nano Cortex의 실제 GATT Service UUID인 `A002`(`0000a002-0000-1000-8000-00805f9b34fb`) 및 `A003`(`0000a003-0000-1000-8000-00805f9b34fb`)을 정확히 등록하여 브라우저 보안 차단을 해결.
2. **Nano Cortex 실시간 양방향 제어 프로토콜 규격 적용**:
   - `writeValueWithResponse`와 순차 큐(Promise Queue)를 적용하여 패킷 유실 방지.
   - 실제 전용 바이너리 프로토콜([NanoCortexProtocol.ts](file:///Users/imac/Workspace/github/nado-cortex/src/bluetooth/NanoCortexProtocol.ts))을 구축하여 슬롯 토글(`0A C0 08 01 18 ...`) 및 Amp Gain 노브(`0B C0 18 00 20 ...`)를 실제 하드웨어와 연동.
3. **Livtra Nexfoot 실물 기기 MIDI 신호 규격 확인 및 반영**:
   - 푸시 신호: SW1(A) 기준 `CC:21` (Val 127/0)
   - 로터리 회전 신호: SW1(A) 기준 `CC:57` 상대 모드(Relative Mode, Val 0 = 시계방향 CW, Val 1 = 반시계방향 CCW)
   - 상대 모드 틱 파싱 로직을 정밀하게 수정하여 발로 돌리는 노브 회전이 화면 게이지와 Cortex 게인에 실시간 반영되도록 해결.

---

## 5. 다음 마일스톤(v0.0.2) 제안

- **마일스톤 주제**: **동적 매핑 엔진 (MIDI Learn) 및 프리셋 프로필 관리**
- **주요 계획**:
  1. **인터랙티브 MIDI Learn**: 화면의 파라미터 노브를 클릭한 뒤 Nexfoot의 풋스위치를 돌리거나 누르면 즉시 매핑이 바인딩되는 기능.
  2. **매핑 프로필 관리**: 곡별/연주 상황별 매핑 설정을 로컬(`localStorage`)에 저장하고 JSON 파일로 Import/Export하는 기능.
  3. **PWA 오프라인 캐싱**: Service Worker 등록을 통한 완전한 무인터넷 오프라인 구동 지원.
