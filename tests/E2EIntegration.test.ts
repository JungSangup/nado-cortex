import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAppStore } from '../src/core/store';
import { BridgeRouter } from '../src/core/BridgeRouter';
import { NexfootParser } from '../src/midi/NexfootParser';
import { MockBluetoothDevice } from '../src/mocks/MockBluetoothDevice';
import { MockMidiAccess } from '../src/mocks/MockMidiAccess';
import { dynamicPagingRouter } from '../src/core/DynamicPagingRouter';

describe('E2E Pipeline Integration (Mock Mode) v0.0.2', () => {
  let mockBle: MockBluetoothDevice;
  let mockMidi: MockMidiAccess;
  let router: BridgeRouter;

  beforeEach(() => {
    vi.useFakeTimers();
    useAppStore.setState({ isMockMode: true });
    useAppStore.getState().setSelectedSlotId('pre_fx_1');
    useAppStore.getState().setParamPageIndex(0);

    mockBle = new MockBluetoothDevice();
    mockMidi = new MockMidiAccess();

    router = new BridgeRouter({
      throttleIntervalMs: 20,
      onSendRawBlePacket: (payload) => {
        mockBle.receiveCommand(0, payload);
        return true;
      },
    });

    mockBle.connect();
    mockMidi.connect((data) => {
      const parser = new NexfootParser();
      const event = parser.parse(data);
      if (event) {
        router.handleNexfootEvent(event);
      }
    });
  });

  afterEach(() => {
    mockBle.disconnect();
    mockMidi.disconnect();
    vi.useRealTimers();
  });

  it('should flow end-to-end: turning SW1 knob updates selected slot parameter and transmits BLE packet', () => {
    // 1. Simulate turning Nexfoot SW1 knob to value 100
    mockMidi.simulateRotate(1, 100);

    // 2. Advance time past throttler window
    vi.advanceTimersByTime(25);

    // 3. Verify state updated in dynamic router
    const updatedVal = dynamicPagingRouter.getParameterValue('pre_fx_1', 0);
    expect(updatedVal).toBeCloseTo(100 / 127, 2);

    // 4. Verify log entry created with actual Nano Cortex protocol message
    const logs = useAppStore.getState().logs;
    const bleLog = logs.find((l) => l.direction === 'ble_out');
    expect(bleLog).toBeDefined();
    expect(bleLog?.message).toContain('Param Pre FX 1');
  });

  it('should flow end-to-end: pushing SW1 toggles Cortex Pre FX 1 bypass and transmits BLE packet', () => {
    const initialBypass = useAppStore.getState().cortexSlots.find((s) => s.slotId === 'pre_fx_1')?.isBypassed;

    // 1. Simulate pushing Nexfoot SW1 footswitch
    mockMidi.simulatePush(1, true);

    // 2. Verify slot bypass state inverted
    const updatedSlot = useAppStore.getState().cortexSlots.find((s) => s.slotId === 'pre_fx_1');
    expect(updatedSlot?.isBypassed).toBe(!initialBypass);

    // 3. Verify log entry
    const logs = useAppStore.getState().logs;
    const slotLog = logs.find((l) => l.message.includes('Toggled Slot Pre FX 1'));
    expect(slotLog).toBeDefined();
  });
});
