import { describe, it, expect, beforeEach } from 'vitest';
import { NexfootParser, DEFAULT_NEXFOOT_CONFIG } from '../src/midi/NexfootParser';

describe('NexfootParser', () => {
  let parser: NexfootParser;

  beforeEach(() => {
    parser = new NexfootParser(DEFAULT_NEXFOOT_CONFIG);
  });

  it('should parse SW1 (A) push events (CC 21)', () => {
    // 0xB0 = CC on Ch 1, 21 = SW1 Push, 127 = Pressed
    const pressData = new Uint8Array([0xB0, 21, 127]);
    const pressEvt = parser.parse(pressData);
    expect(pressEvt).not.toBeNull();
    expect(pressEvt?.encoderId).toBe(1);
    expect(pressEvt?.type).toBe('push');
    expect(pressEvt?.isPushed).toBe(true);

    // Release (Val 0)
    const releaseData = new Uint8Array([0xB0, 21, 0]);
    const releaseEvt = parser.parse(releaseData);
    expect(releaseEvt?.isPushed).toBe(false);
  });

  it('should parse SW1 (A) relative rotate events (CC 57, Val 127 = CW, Val 0 = CCW)', () => {
    // Clockwise (Val 127)
    const cwData = new Uint8Array([0xB0, 57, 127]);
    const cwEvt = parser.parse(cwData);
    expect(cwEvt).not.toBeNull();
    expect(cwEvt?.encoderId).toBe(1);
    expect(cwEvt?.type).toBe('rotate');
    expect(cwEvt?.isRelative).toBe(true);
    expect(cwEvt?.step).toBe(1);

    // Counter-Clockwise (Val 0)
    const ccwData = new Uint8Array([0xB0, 57, 0]);
    const ccwEvt = parser.parse(ccwData);
    expect(ccwEvt).not.toBeNull();
    expect(ccwEvt?.isRelative).toBe(true);
    expect(ccwEvt?.step).toBe(-1);
  });

  it('should ignore unmapped CC messages', () => {
    const randomCc = new Uint8Array([0xB0, 99, 10]);
    expect(parser.parse(randomCc)).toBeNull();
  });
});
