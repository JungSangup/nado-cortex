# [Plan] v0.0.6 - Nexfoot 직관적 MIDI Learn & Nano Cortex 양방향 통신 정밀 진단

- **마일스톤**: v0.0.6
- **상태**: 계획 수립 (Planning Phase)
- **작성일**: 2026-11-20
- **기준 명세서**: [spec.md (v0.0.6)](file:///Users/imac/Workspace/github/nado-cortex/spec.md)

---

## 1. 마일스톤 개요 및 핵심 목표

v0.0.6은 실물 하드웨어(Neural DSP Nano Cortex, Livtra Nexfoot)와의 실제 연결 환경에서 발견된 2가지 핵심 문제를 근본적으로 해결하고, 사용자가 신호의 송수신 상태를 투명하게 확인하며 손쉽게 제어할 수 있도록 완성도를 극대화하는 마일스톤입니다:

1. **Livtra Nexfoot 패널 중심의 직관적 MIDI Learn 시스템**:
   - 기존 파라미터 랙에 숨어 있던 Learn 버튼의 한계를 탈피하여, **가상 Nexfoot 패널의 각 SW 1~4 노브, 푸시 스위치, EXP 페달 카드에서 현재 CC 번호를 직접 확인하고 그 자리에서 원클릭으로 MIDI Learn**을 수행할 수 있도록 전면 재설계.
   - 실제 Nexfoot 하드웨어의 CC 세팅이 어떤 번호로 되어 있든, 패널에서 10초 만에 1:1 매핑을 완결할 수 있도록 보장.
2. **Nano Cortex BLE 양방향 통신 무결성 복구 & 실시간 진단 도구 (Diagnostics Inspector)**:
   - `PacketFramer`와 `NotifyDecoder` 사이의 `0xC0` Delimiter 오프셋 불일치로 인해 실제 기기의 물리 노브/버튼 조작 신호가 화면에 반영되지 않던 역방향 동기화 버그를 완벽히 수정.
   - 브라우저 ➔ 기기 송신(TX) GATT Write 응답 방식 호환성 강화.
   - Nano Cortex 패널에 **실시간 TX/RX 통신 인디케이터(LED 점멸, 패킷 카운터, 최근 패킷 덤프) 및 원클릭 테스트 핑(Ping) 도구**를 구축하여, 양방향 신호가 정상적으로 오고 가는지 사용자가 두 눈으로 직접 확인하고 진단할 수 있도록 지원.

---

## 2. 세부 설계 및 아키텍처

### 2.1 Nexfoot 패널 중심 직관적 MIDI Learn 아키텍처

#### (1) 바인딩 및 상태 매핑 구조
- `src/types.ts`: `MidiLearnTarget`에 `sw_rotate`, `sw_push`, `exp_pedal` 타겟 타입 추가 또는 확장.
  ```typescript
  export interface MidiLearnTarget {
    type: 'slot_param' | 'slot_toggle' | 'page_nav' | 'sw_rotate' | 'sw_push' | 'exp_pedal';
    swId?: 'sw1' | 'sw2' | 'sw3' | 'sw4';
    slotId?: CortexSlotId;
    paramIndex?: number;
  }
  ```
- **SW 1~4 노브 (Rotate)**:
  - 현재 활성 프로필(`activeProfile.bindings`)에서 해당 `swId`의 `rotate` 바인딩을 찾아 현재 CC 번호(기본 57~60)와 입력 모드(Relative/Absolute)를 카드 상단에 표시.
  - `[Learn]` 클릭 시 `MidiLearnEngine.startLearn({ type: 'sw_rotate', swId })` 실행.
  - 실제 노브 조작 신호 수신 시 CC 번호와 Relative/Absolute 모드를 자동 판정하여 프로필 갱신.
- **SW 1~4 푸시 (Push)**:
  - 현재 활성 프로필에서 해당 `swId`의 `push` 바인딩을 찾아 푸시 CC 번호(기본 21~24)와 푸시 동작(`slot_toggle` 또는 `page_nav`) 표시.
  - `[Learn]` 클릭 시 `MidiLearnEngine.startLearn({ type: 'sw_push', swId })` 실행.
  - 실제 풋스위치 조작 신호 수신 시 CC 번호를 즉시 해당 푸시 바인딩으로 갱신.
- **EXP 페달**:
  - `activeProfile` 또는 `ExpressionRouter`의 타겟 CC 번호(기본 1) 표시 및 `[Learn]` 지원.
  - 페달 밟았을 때 들어오는 CC를 익스프레션 페달 CC로 자동 바인딩.

#### (2) 가상 Nexfoot 카드 UI 개선 (`src/ui/NexfootVirtualPanel.tsx`)
- 각 SW 카드 상단에 노브 CC 및 `[Learn]` 버튼 배치:
  ```tsx
  <div className="flex items-center gap-1.5">
    <span className="font-mono text-[10px] text-cortex-muted">CC {rotateCc}</span>
    <button onClick={handleLearnRotate} className="...">
      {isLearningRotate ? 'Learn...' : 'Learn'}
    </button>
  </div>
  ```
- 푸시 스위치 영역에도 푸시 CC 및 `[Learn]` 버튼 배치.
- 학습 활성화 시 해당 영역이 앰버/보라색 글로우 및 펄스(`animate-pulse`)로 명확한 시각적 피드백 제공.

---

### 2.2 Nano Cortex BLE 양방향 통신 무결성 및 수신 디코더 버그 픽스

#### (1) 문제 원인 정밀 분석
- `PacketFramer.pushChunk()`는 완성된 프레임에서 `0xC0` Delimiter 바로 다음 바이트부터 마지막 4바이트(messageType) 직전까지를 `payload`로 잘라냅니다.
  - 즉 `payload`에는 `0xC0`가 포함되어 있지 않습니다!
- 그러나 `NotifyDecoder.decode(payload)`는 다음과 같이 검사하고 있었습니다:
  ```typescript
  if (payload.length < 4 || payload[1] !== 0xC0) {
    return { type: 'unknown' }; // <--- 모든 정상 수신 패킷이 여기서 탈락!
  }
  ```
- 또한 `App.tsx`에서는 `router.handleNotifyPacket(packet.payload)`를 넘겨주고 있어, 실제 Nano Cortex에서 날아오는 모든 역방향 노브/버튼 알림이 100% 무시되고 있었습니다.

#### (2) 수정 방안
- `NotifyDecoder.decode(bytes: Uint8Array)`가 `raw` 전체 패킷(`0B C0 18...`)과 `payload`(`18 ...`) 어느 쪽이 전달되더라도 완벽하게 복원 및 식별할 수 있도록 다형적(Polymorphic) 파서로 강화:
  - `0xC0`가 0번째나 1번째에 존재하는지 확인하고, 존재하면 그 다음 바이트부터 Protobuf 필드를 추출.
  - `0xC0`가 이미 제거된 순수 페이로드인 경우에도 메시지 헤더 바이트를 정확히 인식하여 `amp_knob`, `slot_bypass`, `preset_change`, `fx_param`을 안전하게 디코딩.
- `App.tsx`에서 `router.handleNotifyPacket(packet.raw, packet.payload)` 형태로 전체 정보 전달.

#### (3) 송신(TX) GATT Write 안정화 (`src/bluetooth/WebBluetoothManager.ts`)
- Characteristic 쓰기 시 `writeValueWithResponse` 지원 여부를 안전하게 판별하고, 기기 사양에 따라 실패 시 `writeValueWithoutResponse`로 자동 폴백:
  ```typescript
  if (this.writeCharacteristic.writeValueWithoutResponse) {
    await this.writeCharacteristic.writeValueWithoutResponse(buffer);
  } else if (this.writeCharacteristic.writeValueWithResponse) {
    await this.writeCharacteristic.writeValueWithResponse(buffer);
  } else {
    await this.writeCharacteristic.writeValue(buffer);
  }
  ```

---

### 2.3 실시간 BLE 양방향 통신 진단기 (Diagnostics Inspector)

사용자가 Nano Cortex와 실시간으로 신호가 정상적으로 오고 가는지 한눈에 확인할 수 있는 진단 도구를 대시보드에 구축합니다:

1. **상태 관리 (`src/core/store.ts`)**:
   - `bleTxCount: number` (송신 패킷 누적 카운터)
   - `bleRxCount: number` (수신 패킷 누적 카운터)
   - `lastTxDescription: string` (마지막 송신 패킷 내용)
   - `lastRxDescription: string` (마지막 수신 디코딩 내용)
   - `lastRxRawHex: string` (마지막 수신 패킷 HEX 덤프)
2. **진단 UI (`src/ui/BleDiagnosticsBar.tsx` 또는 `CortexMonitorPanel.tsx` 상단/하단)**:
   - **실시간 LED 인디케이터**:
     - `TX` (녹색/사이언 LED): 브라우저에서 기기로 명령 보낼 때 0.15초간 반짝임.
     - `RX` (오렌지/에메랄드 LED): Nano Cortex에서 알림 수신 시 0.15초간 반짝임.
   - **원클릭 테스트 핑 (Test Signal) 버튼**:
     - `[Ping: 프리셋 토글]`: 현재 프리셋 ➔ 다음 프리셋 ➔ 원복
     - `[Ping: 슬롯 토글]`: Pre-FX 1 바이패스 토글
     - 기기가 물리적으로 반응하는지 1초 만에 확인 가능.
   - **최근 수신 패킷 실시간 모니터 바**:
     - `최근 수신: [Amp Knob 0 Gain: 65%] (RAW: 0B C0 18 00 20 A6 28 00)` 형태로 화면에 즉시 노출.

---

## 3. 테스트 및 검증 계획

1. **단위 테스트 (Unit Tests)**:
   - `tests/NexfootHardwareLearn.test.ts`:
     - Nexfoot SW 1~4 회전(Rotate) 및 푸시(Push) MIDI Learn 시 CC 번호 및 모드 감지 검증.
     - EXP 페달 MIDI Learn 시 CC 1 이외의 커스텀 CC 바인딩 검증.
   - `tests/BleNotifyIntegration.test.ts`:
     - `PacketFramer`와 `NotifyDecoder` 연동 시 `packet.raw` 및 `packet.payload` 양쪽 모두 100% 정상 디코딩 검증.
     - 실제 기기 덤프 패킷(Amp Knob, Slot Bypass, Preset Change) 역방향 동기화 검증.
2. **통합 빌드 검증 (`npm run build`)**:
   - TypeScript 컴파일 무결점 및 프로덕션 번들링 검증.

---

## 4. 완료 기준 (Definition of Done)
1. 가상 Nexfoot 패널에서 SW 1~4 노브, 푸시, EXP 페달의 CC 번호가 명확히 표시되고, 각각의 `[Learn]` 버튼으로 실제 하드웨어 조작을 감지하여 즉시 매핑될 것.
2. `PacketFramer`와 `NotifyDecoder`의 오프셋 불일치가 해결되어 Nano Cortex 본체 조작 시 웹 대시보드가 100% 실시간으로 역동기화될 것.
3. 실시간 BLE 양방향 통신 진단기(TX/RX 점멸, 카운터, 테스트 핑, 최근 수신 패킷 HEX)가 화면에 제공되어 통신 상태를 사용자가 즉시 확인할 수 있을 것.
4. 전체 Vitest 테스트 100% 통과 및 프로덕션 빌드 성공.
