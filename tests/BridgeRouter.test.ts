import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BridgeRouter } from '../src/core/BridgeRouter';
import { useAppStore } from '../src/core/store';
import { dynamicPagingRouter } from '../src/core/DynamicPagingRouter';

describe('BridgeRouter v0.0.2', () => {
  let router: BridgeRouter;
  let bleSenderMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    bleSenderMock = vi.fn().mockReturnValue(true);
    router = new BridgeRouter({
      throttleIntervalMs: 10,
      onSendRawBlePacket: bleSenderMock,
    });
    useAppStore.getState().setSelectedSlotId('pre_fx_1');
    useAppStore.getState().setParamPageIndex(0);
  });

  it('should explicitly set slot active on push=true (127) and bypass on push=false (0)', () => {
    // 1. Send push=true (Nexfoot ON / Val 127)
    router.handleNexfootEvent({
      encoderId: 1,
      type: 'push',
      isPushed: true,
      channel: 1,
      rawCcOrNote: 21,
    });

    let slot = useAppStore.getState().cortexSlots.find((s) => s.slotId === 'pre_fx_1');
    expect(slot?.isBypassed).toBe(false); // Active (ON)
    expect(bleSenderMock).toHaveBeenCalled();

    // 2. Send push=false (Nexfoot OFF / Val 0)
    router.handleNexfootEvent({
      encoderId: 1,
      type: 'push',
      isPushed: false,
      channel: 1,
      rawCcOrNote: 21,
    });

    slot = useAppStore.getState().cortexSlots.find((s) => s.slotId === 'pre_fx_1');
    expect(slot?.isBypassed).toBe(true); // Bypassed (OFF)
  });

  it('should update dynamic slot parameter when receiving a rotate event', () => {
    router.handleNexfootEvent({
      encoderId: 1, // SW1 maps to Param[0] (Gain) of pre_fx_1
      type: 'rotate',
      rotateValue: 127,
      isRelative: false,
      channel: 1,
      rawCcOrNote: 57,
    });

    const updatedVal = dynamicPagingRouter.getParameterValue('pre_fx_1', 0);
    expect(updatedVal).toBe(1.0); // 127 / 127 = 1.0
    expect(bleSenderMock).toHaveBeenCalledWith(expect.any(Uint8Array));
  });

  it('should adjust parameter by exactly +0.01 (+1%) per relative clockwise tick', () => {
    dynamicPagingRouter.setParameterValue('pre_fx_1', 0, 0.50);

    router.handleNexfootEvent({
      encoderId: 1,
      type: 'rotate',
      isRelative: true,
      step: 1, // Clockwise tick (+1)
      channel: 1,
      rawCcOrNote: 57,
    });

    const updatedVal = dynamicPagingRouter.getParameterValue('pre_fx_1', 0);
    expect(updatedVal).toBe(0.51); // 0.50 + 0.01 = 0.51
    expect(bleSenderMock).toHaveBeenCalledWith(expect.any(Uint8Array));
  });

  it('should switch preset and send BLE packet', () => {
    router.changePreset(10);
    expect(useAppStore.getState().currentPresetIndex).toBe(10);
    expect(bleSenderMock).toHaveBeenCalledWith(expect.any(Uint8Array));
  });

  it('should change slot model and send 0x88 BLE packet', () => {
    router.changeSlotModel('pre_fx_1', 'rodent_distortion');
    const slot = useAppStore.getState().cortexSlots.find((s) => s.slotId === 'pre_fx_1');
    expect(slot?.modelId).toBe('rodent_distortion');
    expect(bleSenderMock).toHaveBeenCalledWith(expect.any(Uint8Array));
  });
});
