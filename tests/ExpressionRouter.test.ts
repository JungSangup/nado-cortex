import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExpressionRouter } from '../src/core/ExpressionRouter';
import { useAppStore } from '../src/core/store';

describe('ExpressionRouter (TASK-310)', () => {
  let router: ExpressionRouter;

  beforeEach(() => {
    router = new ExpressionRouter();
    useAppStore.getState().setSelectedSlotId('pre_fx_1');
  });

  it('should resolve default target parameter for selected slot', () => {
    const target = router.resolveTarget();
    expect(target.slotId).toBe('pre_fx_1');
    expect(target.paramIndex).toBe(0);
  });

  it('should auto-resolve Wah Sweep Position when crying_wah is loaded', () => {
    useAppStore.getState().setSlotModel('pre_fx_1', 'crying_wah');
    const target = router.resolveTarget();
    expect(target.label).toContain('Wah');
    expect(target.paramIndex).toBe(0);
  });

  it('should handle expression MIDI CC 1 and modulate normalized value 0.0 ~ 1.0', () => {
    const sendCb = vi.fn();
    router.setSendParamCallback(sendCb);

    // Val 127 = 100% (1.0)
    const res1 = router.handleExpressionMidi(127);
    expect(res1?.normalizedValue).toBe(1.0);
    expect(router.getExpValue()).toBe(127);
    expect(sendCb).toHaveBeenCalledWith('pre_fx_1', 0, 1.0);

    // Val 0 = 0% (0.0)
    const res2 = router.handleExpressionMidi(0);
    expect(res2?.normalizedValue).toBe(0.0);
    expect(router.getExpValue()).toBe(0);

    // Val 64 = ~50% (0.504)
    const res3 = router.handleExpressionMidi(64);
    expect(res3?.normalizedValue).toBeCloseTo(64 / 127, 2);
  });

  it('should support inverted expression range', () => {
    router.setCustomTarget({
      slotId: 'post_fx_1',
      paramIndex: 1,
      invert: true,
    });

    const res = router.handleExpressionMidi(127); // Inverted 127 -> 0.0
    expect(res?.normalizedValue).toBe(0.0);
  });
});
