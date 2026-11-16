import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TunerTempoEngine } from '../src/core/TunerTempoEngine';

describe('TunerTempoEngine (TASK-311)', () => {
  let engine: TunerTempoEngine;

  beforeEach(() => {
    vi.useFakeTimers();
    engine = new TunerTempoEngine();
  });

  it('should calculate accurate BPM from tap intervals', () => {
    // Simulate tapping at 120 BPM (500ms intervals)
    engine.tap(); // Tap 1
    vi.advanceTimersByTime(500);
    engine.tap(); // Tap 2 -> 120 BPM

    expect(engine.getBpm()).toBe(120);

    vi.advanceTimersByTime(500);
    engine.tap(); // Tap 3 -> 120 BPM
    expect(engine.getBpm()).toBe(120);
  });

  it('should reset tap sequence if timeout exceeds 2000ms', () => {
    engine.tap();
    vi.advanceTimersByTime(2500); // Exceeds timeout
    engine.tap(); // Resets sequence
    vi.advanceTimersByTime(1000); // 60 BPM (1000ms)
    engine.tap();

    expect(engine.getBpm()).toBe(60);
  });

  it('should toggle tuner and update pitch states', () => {
    expect(engine.getTunerState().active).toBe(false);

    engine.toggleTuner();
    expect(engine.getTunerState().active).toBe(true);

    engine.updateTunerPitch('A', 0, 440);
    const inTuneState = engine.getTunerState();
    expect(inTuneState.note).toBe('A');
    expect(inTuneState.isInTune).toBe(true);

    engine.updateTunerPitch('A', 15, 443);
    const sharpState = engine.getTunerState();
    expect(sharpState.isInTune).toBe(false);
  });
});
