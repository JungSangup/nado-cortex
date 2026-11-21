import { NexfootEncoderId } from '../types';

export interface NexfootEvent {
  encoderId: NexfootEncoderId;
  type: 'rotate' | 'push';
  rotateValue?: number; // 0 ~ 127
  isRelative?: boolean;
  step?: number; // +1, -1 (for relative mode)
  isPushed?: boolean;
  channel: number;
  rawCcOrNote: number;
}

export interface NexfootMidiConfig {
  sw1: { pushCc: number; rotateCc: number };
  sw2: { pushCc: number; rotateCc: number };
  sw3: { pushCc: number; rotateCc: number };
  sw4: { pushCc: number; rotateCc: number };
}

/**
 * Livtra Nexfoot Factory MIDI CC Mapping:
 * SW 1 (A): Push CC 21, Rotate CC 57 (Relative: Val 0 = CW, Val 1 = CCW)
 * SW 2 (B): Push CC 22, Rotate CC 58
 * SW 3 (C): Push CC 23, Rotate CC 59
 * SW 4 (D): Push CC 24, Rotate CC 60
 */
export const DEFAULT_NEXFOOT_CONFIG: NexfootMidiConfig = {
  sw1: { pushCc: 21, rotateCc: 57 },
  sw2: { pushCc: 22, rotateCc: 58 },
  sw3: { pushCc: 23, rotateCc: 59 },
  sw4: { pushCc: 24, rotateCc: 60 },
};

export class NexfootParser {
  private config: NexfootMidiConfig;

  constructor(config: NexfootMidiConfig = DEFAULT_NEXFOOT_CONFIG) {
    this.config = config;
  }

  public setConfig(config: NexfootMidiConfig): void {
    this.config = config;
  }

  public getConfig(): NexfootMidiConfig {
    return { ...this.config };
  }

  /**
   * Synchronizes CC mapping from MappingProfile bindings
   */
  public syncFromProfile(bindings: Array<{ swId: string; type: string; ccNumber: number }>): void {
    const updated: NexfootMidiConfig = {
      sw1: { ...this.config.sw1 },
      sw2: { ...this.config.sw2 },
      sw3: { ...this.config.sw3 },
      sw4: { ...this.config.sw4 },
    };

    for (let i = 1; i <= 4; i++) {
      const swKey = `sw${i}` as keyof NexfootMidiConfig;
      const rotBind = bindings.find((b) => b.swId === swKey && b.type === 'rotate');
      const pushBind = bindings.find((b) => b.swId === swKey && b.type === 'push');
      if (rotBind) updated[swKey].rotateCc = rotBind.ccNumber;
      if (pushBind) updated[swKey].pushCc = pushBind.ccNumber;
    }

    this.config = updated;
  }

  /**
   * Parses standard 3-byte MIDI message
   * Status byte: 0xBn = CC, 0x9n = NoteOn, 0x8n = NoteOff
   */
  public parse(data: Uint8Array): NexfootEvent | null {
    if (data.length < 3) return null;

    const status = data[0];
    const messageType = status & 0xF0;
    const channel = (status & 0x0F) + 1;
    const data1 = data[1]; // CC number or Note number
    const data2 = data[2]; // Value or Velocity

    // Control Change (CC)
    if (messageType === 0xB0) {
      const ccNum = data1;
      const val = data2;

      for (let i = 1; i <= 4; i++) {
        const id = i as NexfootEncoderId;
        const key = `sw${id}` as keyof NexfootMidiConfig;
        const conf = this.config[key];

        // Check Push CC (Val 127 = pressed, 0 = released, or >= 64)
        if (ccNum === conf.pushCc) {
          const isPushed = val >= 64;
          return {
            encoderId: id,
            type: 'push',
            isPushed,
            channel,
            rawCcOrNote: ccNum,
          };
        }

        // Check Rotate CC
        if (ccNum === conf.rotateCc) {
          // Livtra Nexfoot Relative Mode:
          // 시계방향 (CW) 1틱 = Val 127 (+1)
          // 반시계방향 (CCW) 1틱 = Val 0 (-1)
          if (val === 127 || val === 65) {
            return {
              encoderId: id,
              type: 'rotate',
              isRelative: true,
              step: 1, // Clockwise tick (+1)
              channel,
              rawCcOrNote: ccNum,
            };
          } else if (val === 0 || val === 63) {
            return {
              encoderId: id,
              type: 'rotate',
              isRelative: true,
              step: -1, // Counter-Clockwise tick (-1)
              channel,
              rawCcOrNote: ccNum,
            };
          } else if (val === 1) {
            // General Relative fallback
            return {
              encoderId: id,
              type: 'rotate',
              isRelative: true,
              step: 1,
              channel,
              rawCcOrNote: ccNum,
            };
          }

          // Fallback: Absolute CC (0~127)
          return {
            encoderId: id,
            type: 'rotate',
            isRelative: false,
            rotateValue: val,
            channel,
            rawCcOrNote: ccNum,
          };
        }
      }
    }

    return null;
  }
}
