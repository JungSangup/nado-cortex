import { describe, it, expect, beforeEach } from 'vitest';
import { DynamicPagingRouter } from '../src/core/DynamicPagingRouter';

describe('DynamicPagingRouter (TASK-215)', () => {
  let router: DynamicPagingRouter;

  beforeEach(() => {
    router = new DynamicPagingRouter();
  });

  it('should calculate total pages correctly for model with >4 parameters', () => {
    // digital_delay has 6 parameters (Time, Feedback, Mix, Tone, Modulation, Spillover)
    router.setSelectedSlotId('post_fx_1');
    const total = router.getTotalPages('digital_delay');
    expect(total).toBe(2); // 6 / 4 = ceil(1.5) = 2 pages
  });

  it('should slice parameters into Page 1 and Page 2', () => {
    router.setSelectedSlotId('post_fx_1');

    // Page 0 (Page 1)
    router.setPageIndex(0, 'digital_delay');
    const p1 = router.getCurrentPageMappings('digital_delay');
    expect(p1.length).toBe(4);
    expect(p1[0].parameter?.name).toBe('Time');     // param 0
    expect(p1[1].parameter?.name).toBe('Feedback'); // param 1
    expect(p1[2].parameter?.name).toBe('Mix');      // param 2
    expect(p1[3].parameter?.name).toBe('Tone / Hi-Cut'); // param 3

    // Next Page (Page 2)
    router.nextPage('digital_delay');
    expect(router.getCurrentPageIndex()).toBe(1);

    const p2 = router.getCurrentPageMappings('digital_delay');
    expect(p2[0].parameter?.name).toBe('Mod Depth'); // param 4
    expect(p2[1].parameter?.name).toBe('Spillover Trail'); // param 5
    expect(p2[2].parameter).toBeNull();              // unassigned
    expect(p2[3].parameter).toBeNull();              // unassigned
  });

  it('should adjust parameter value within 0.0 ~ 1.0 clamped range', () => {
    router.setSelectedSlotId('pre_fx_1');
    router.setParameterValue('pre_fx_1', 0, 0.50);

    // Increment +0.04
    const nextVal = router.adjustParameterValue('pre_fx_1', 0, 0.04);
    expect(nextVal).toBeCloseTo(0.54, 3);

    // Over-clamp to max 1.0
    const clampedMax = router.adjustParameterValue('pre_fx_1', 0, 1.0);
    expect(clampedMax).toBe(1.0);

    // Under-clamp to min 0.0
    const clampedMin = router.adjustParameterValue('pre_fx_1', 0, -2.0);
    expect(clampedMin).toBe(0.0);
  });
});
