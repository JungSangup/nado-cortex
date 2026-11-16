export interface TunerState {
  active: boolean;
  note: string;     // e.g. "E", "A", "D", "G", "B", "E"
  cents: number;    // -50 ~ +50 (0 is perfect in-tune)
  frequency: number;// e.g. 440.0 Hz
  isInTune: boolean;// abs(cents) < 3
}

export class TunerTempoEngine {
  private bpm: number = 120;
  private tapTimestamps: number[] = [];
  private tunerState: TunerState = {
    active: false,
    note: 'E',
    cents: 0,
    frequency: 329.63,
    isInTune: true,
  };

  private onBpmChangedCallback?: (bpm: number) => void;
  private onTunerChangedCallback?: (state: TunerState) => void;

  public setCallbacks(bpmCb?: (bpm: number) => void, tunerCb?: (state: TunerState) => void): void {
    this.onBpmChangedCallback = bpmCb;
    this.onTunerChangedCallback = tunerCb;
  }

  public getBpm(): number {
    return this.bpm;
  }

  public setBpm(newBpm: number): void {
    this.bpm = Math.max(40, Math.min(240, Math.round(newBpm)));
    if (this.onBpmChangedCallback) {
      this.onBpmChangedCallback(this.bpm);
    }
  }

  /**
   * Records a tap event and recalculates average BPM across last 4 intervals
   */
  public tap(): number {
    const now = Date.now();

    // If last tap was more than 2 seconds ago, start fresh sequence
    if (this.tapTimestamps.length > 0 && now - this.tapTimestamps[this.tapTimestamps.length - 1] > 2000) {
      this.tapTimestamps = [];
    }

    this.tapTimestamps.push(now);

    // Keep last 5 taps (4 intervals)
    if (this.tapTimestamps.length > 5) {
      this.tapTimestamps.shift();
    }

    if (this.tapTimestamps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < this.tapTimestamps.length; i++) {
        intervals.push(this.tapTimestamps[i] - this.tapTimestamps[i - 1]);
      }

      const avgInterval = intervals.reduce((acc, v) => acc + v, 0) / intervals.length;
      if (avgInterval > 0) {
        const calculatedBpm = Math.round(60000 / avgInterval);
        this.setBpm(calculatedBpm);
      }
    }

    return this.bpm;
  }

  public getTunerState(): TunerState {
    return { ...this.tunerState };
  }

  public toggleTuner(): boolean {
    return this.setTuner(!this.tunerState.active);
  }

  public setTuner(active: boolean): boolean {
    this.tunerState.active = active;
    if (this.onTunerChangedCallback) {
      this.onTunerChangedCallback(this.getTunerState());
    }
    return this.tunerState.active;
  }

  public updateTunerPitch(note: string, cents: number, freq: number = 440): void {
    this.tunerState = {
      ...this.tunerState,
      note,
      cents: Math.max(-50, Math.min(50, Math.round(cents))),
      frequency: freq,
      isInTune: Math.abs(cents) <= 3,
    };
    if (this.onTunerChangedCallback) {
      this.onTunerChangedCallback(this.getTunerState());
    }
  }
}

export const tunerTempoEngine = new TunerTempoEngine();
