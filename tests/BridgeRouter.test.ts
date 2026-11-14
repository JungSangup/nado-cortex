import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BridgeRouter } from '../src/core/BridgeRouter';
import { useAppStore } from '../src/core/store';

describe('BridgeRouter', () => {
  let router: BridgeRouter;
  let bleSenderMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    bleSenderMock = vi.fn().mockReturnValue(true);
    router = new BridgeRouter({
      throttleIntervalMs: 10,
      onSendRawBlePacket: bleSenderMock,
    });
  });

  it('should toggle slot bypass when receiving a push event mapped to slot_bypass', () => {
    const initialSlotState = useAppStore.getState().cortexSlots.find((s) => s.slotIndex === 1)?.isBypassed;

    router.handleNexfootEvent({
      encoderId: 1, // SW1 maps to slot 1 bypass
      type: 'push',
      isPushed: true,
      channel: 1,
      rawCcOrNote: 21,
    });

    const updatedSlotState = useAppStore.getState().cortexSlots.find((s) => s.slotIndex === 1)?.isBypassed;
    expect(updatedSlotState).toBe(!initialSlotState);
    expect(bleSenderMock).toHaveBeenCalledWith(expect.any(Uint8Array));
  });

  it('should update parameter value when receiving a rotate event', () => {
    router.handleNexfootEvent({
      encoderId: 1, // SW1 maps to drive_gain
      type: 'rotate',
      rotateValue: 127, // Maximum 100%
      isRelative: false,
      channel: 1,
      rawCcOrNote: 21,
    });

    const updatedParam = useAppStore.getState().cortexParameters['drive_gain'];
    expect(updatedParam.value).toBe(1.0); // 127 / 127 = 1.0
    expect(bleSenderMock).toHaveBeenCalledWith(expect.any(Uint8Array));
  });
});
