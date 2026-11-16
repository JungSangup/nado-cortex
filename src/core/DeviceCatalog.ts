import { CortexSlotId, DeviceModelDef } from '../types';

/**
 * Nano Cortex Official Complete Device Model Catalog (NanOS Complete Suite)
 * Defines full official Pre-FX pedals, Neural Capture Amp models, Celestion IRs, Delays, Reverbs, and Modulations.
 */

export interface SlotMetadata {
  slotId: CortexSlotId;
  name: string;
  enableSlot: number;
  modelSlot: number;
  category: 'pre_fx' | 'amp' | 'cab' | 'post_fx';
  defaultModelId: string;
}

export const CORTEX_SLOT_CONFIGS: Record<CortexSlotId, SlotMetadata> = {
  pre_fx_1: {
    slotId: 'pre_fx_1',
    name: 'Pre FX 1 (Drive/Comp)',
    enableSlot: 0x04,
    modelSlot: 0x00,
    category: 'pre_fx',
    defaultModelId: 'ts9_overdrive',
  },
  pre_fx_2: {
    slotId: 'pre_fx_2',
    name: 'Pre FX 2 (Dist/Fuzz)',
    enableSlot: 0x05,
    modelSlot: 0x01,
    category: 'pre_fx',
    defaultModelId: 'rodent_distortion',
  },
  amp: {
    slotId: 'amp',
    name: 'Neural Capture / Amp',
    enableSlot: 0x01,
    modelSlot: 0x01,
    category: 'amp',
    defaultModelId: 'capture_slot_01',
  },
  cab: {
    slotId: 'cab',
    name: 'Cab / IR Loader',
    enableSlot: 0x03,
    modelSlot: 0x03,
    category: 'cab',
    defaultModelId: 'ir_slot_01',
  },
  post_fx_1: {
    slotId: 'post_fx_1',
    name: 'Post FX 1 (Delay)',
    enableSlot: 0x06,
    modelSlot: 0x02,
    category: 'post_fx',
    defaultModelId: 'digital_delay',
  },
  post_fx_2: {
    slotId: 'post_fx_2',
    name: 'Post FX 2 (Reverb)',
    enableSlot: 0x07,
    modelSlot: 0x03,
    category: 'post_fx',
    defaultModelId: 'plate_reverb',
  },
  post_fx_3: {
    slotId: 'post_fx_3',
    name: 'Post FX 3 (Mod / Gate / EQ)',
    enableSlot: 0x08,
    modelSlot: 0x04,
    category: 'post_fx',
    defaultModelId: 'noise_gate',
  },
};

export const DEVICE_CATALOG: Record<string, DeviceModelDef> = {
  // =========================================================================
  // 1. PRE-FX: Overdrives, Distortions, Fuzz, Compressors, Pitch, Wah
  // =========================================================================
  ts9_overdrive: {
    id: 'ts9_overdrive',
    name: 'Tube Screamer (Green 808)',
    category: 'pre_fx',
    description: 'Iconic mid-hump overdrive pedal based on Ibanez TS9 / TS808.',
    parameters: [
      { id: 'gain', name: 'Overdrive', paramIndex: 0, min: 0, max: 1, defaultValue: 0.45, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'tone', name: 'Tone', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Level', paramIndex: 2, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  obsessive_drive: {
    id: 'obsessive_drive',
    name: 'Obsessive Drive (OCD Style)',
    category: 'pre_fx',
    description: 'Dynamic touch-sensitive overdrive based on Fulltone OCD®.',
    parameters: [
      { id: 'drive', name: 'Drive', paramIndex: 0, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'tone', name: 'Tone', paramIndex: 1, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'volume', name: 'Volume', paramIndex: 2, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'hp_lp', name: 'HP / LP Mode', paramIndex: 3, min: 0, max: 1, defaultValue: 1.0, unit: '', valueFormat: v => v > 0.5 ? 'HP' : 'LP' },
    ],
  },
  rodent_distortion: {
    id: 'rodent_distortion',
    name: 'Rodent Drive (Rat Style)',
    category: 'pre_fx',
    description: 'Aggressive hard-clipping distortion pedal based on ProCo Rat®.',
    parameters: [
      { id: 'distortion', name: 'Distortion', paramIndex: 0, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'filter', name: 'Filter', paramIndex: 1, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'volume', name: 'Volume', paramIndex: 2, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  chief_bd2: {
    id: 'chief_bd2',
    name: 'Chief BD2 (Blues Driver Style)',
    category: 'pre_fx',
    description: 'Warm, tube-like bluesy grit based on Boss BD-2 Blues Driver®.',
    parameters: [
      { id: 'gain', name: 'Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'tone', name: 'Tone', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Level', paramIndex: 2, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  chief_od1: {
    id: 'chief_od1',
    name: 'Chief OD1 (Yellow Overdrive)',
    category: 'pre_fx',
    description: 'Smooth asymmetric clipping classic based on Boss OD-1®.',
    parameters: [
      { id: 'drive', name: 'Drive', paramIndex: 0, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Level', paramIndex: 1, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  exotic_bb: {
    id: 'exotic_bb',
    name: 'Exotic Preamp (BB Preamp Style)',
    category: 'pre_fx',
    description: 'Versatile booster and overdrive with 2-band active EQ based on Xotic BB®.',
    parameters: [
      { id: 'gain', name: 'Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.45, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Bass', paramIndex: 2, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'volume', name: 'Volume', paramIndex: 3, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  myth_drive: {
    id: 'myth_drive',
    name: 'Myth Drive (Klon Centaur Style)',
    category: 'pre_fx',
    description: 'Legendary transparent overdrive with germanium diode clipping.',
    parameters: [
      { id: 'gain', name: 'Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.35, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'output', name: 'Output', paramIndex: 2, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  classic_fuzz: {
    id: 'classic_fuzz',
    name: 'Classic Fuzz (Fuzz Face Style)',
    category: 'pre_fx',
    description: 'Vintage silicon/germanium transistor fuzz with rich cleanup.',
    parameters: [
      { id: 'fuzz', name: 'Fuzz', paramIndex: 0, min: 0, max: 1, defaultValue: 0.75, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'volume', name: 'Volume', paramIndex: 1, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  big_fuzz: {
    id: 'big_fuzz',
    name: 'Big Fuzz (Pi Muff Style)',
    category: 'pre_fx',
    description: 'Sustained, scooped wall of harmonic fuzz based on Big Muff Pi®.',
    parameters: [
      { id: 'sustain', name: 'Sustain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'tone', name: 'Tone', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'volume', name: 'Volume', paramIndex: 2, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  legendary_87: {
    id: 'legendary_87',
    name: 'Legendary 87 Compressor (1176 Style)',
    category: 'pre_fx',
    description: 'Ultra-fast FET peak limiter/compressor based on UA 1176®.',
    parameters: [
      { id: 'input', name: 'Input', paramIndex: 0, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'output', name: 'Output', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'attack', name: 'Attack', paramIndex: 2, min: 0, max: 1, defaultValue: 0.30, unit: 'ms', valueFormat: v => `${Math.round(20 + v * 800)} µs` },
      { id: 'release', name: 'Release', paramIndex: 3, min: 0, max: 1, defaultValue: 0.40, unit: 'ms', valueFormat: v => `${Math.round(50 + v * 1100)} ms` },
      { id: 'ratio', name: 'Ratio', paramIndex: 4, min: 0, max: 1, defaultValue: 0.25, unit: '', valueFormat: v => v < 0.25 ? '4:1' : v < 0.5 ? '8:1' : v < 0.75 ? '12:1' : '20:1' },
      { id: 'mix', name: 'Dry/Wet', paramIndex: 5, min: 0, max: 1, defaultValue: 1.0, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  solid_state_comp: {
    id: 'solid_state_comp',
    name: 'Solid State Bus Comp (SSL Style)',
    category: 'pre_fx',
    description: 'Punchy studio bus compressor with glue character.',
    parameters: [
      { id: 'threshold', name: 'Threshold', paramIndex: 0, min: 0, max: 1, defaultValue: 0.40, unit: 'dB', valueFormat: v => `${Math.round(-30 + v * 30)} dB` },
      { id: 'makeup', name: 'Make-up Gain', paramIndex: 1, min: 0, max: 1, defaultValue: 0.35, unit: 'dB', valueFormat: v => `+${(v * 20).toFixed(1)} dB` },
      { id: 'attack', name: 'Attack', paramIndex: 2, min: 0, max: 1, defaultValue: 0.20, unit: 'ms', valueFormat: v => `${Math.round(1 + v * 30)} ms` },
      { id: 'release', name: 'Release', paramIndex: 3, min: 0, max: 1, defaultValue: 0.50, unit: 's', valueFormat: v => `${(0.1 + v * 1.2).toFixed(1)} s` },
    ],
  },
  clean_boost: {
    id: 'clean_boost',
    name: 'Clean Boost Mini',
    category: 'pre_fx',
    description: 'Pure transparent +20dB clean level boost to push the front-end.',
    parameters: [
      { id: 'boost', name: 'Boost', paramIndex: 0, min: 0, max: 1, defaultValue: 0.40, unit: 'dB', valueFormat: v => `+${Math.round(v * 20)} dB` },
      { id: 'bass', name: 'Bass Cut', paramIndex: 1, min: 0, max: 1, defaultValue: 0.10, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  wham_pitch: {
    id: 'wham_pitch',
    name: 'Wham Pitch Shifter (Whammy Style)',
    category: 'pre_fx',
    description: 'Polyphonic pitch bender and octave generator.',
    parameters: [
      { id: 'heel_toe', name: 'Pedal Position', paramIndex: 0, min: 0, max: 1, defaultValue: 0.0, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mode', name: 'Interval', paramIndex: 1, min: 0, max: 1, defaultValue: 0.30, unit: '', valueFormat: v => v < 0.3 ? '+1 Oct' : v < 0.6 ? '+2 Oct' : '-1 Oct' },
      { id: 'mix', name: 'Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 1.0, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  crying_wah: {
    id: 'crying_wah',
    name: 'Crying Wah (Crybaby Style)',
    category: 'pre_fx',
    description: 'Classic inductor-based wah pedal with sweet vocal resonance.',
    parameters: [
      { id: 'position', name: 'Sweep Position', paramIndex: 0, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'range', name: 'Frequency Range', paramIndex: 1, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'q', name: 'Q Resonance', paramIndex: 2, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },

  // =========================================================================
  // 2. AMP: Neural Capture Slots 01 ~ 25
  // =========================================================================
  capture_slot_01: {
    id: 'capture_slot_01',
    name: 'Slot 01: UK 100 Lead Crunch (Plexi)',
    category: 'amp',
    description: 'Vintage 1968 100W British stack capture with punchy harmonics.',
    parameters: [
      { id: 'gain', name: 'Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Level', paramIndex: 1, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Bass', paramIndex: 2, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mid', name: 'Mid', paramIndex: 3, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 4, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  capture_slot_02: {
    id: 'capture_slot_02',
    name: 'Slot 02: UK JCM800 2203 High Gain',
    category: 'amp',
    description: 'Definitive 1980s hard rock Marshall JCM800 master volume crunch.',
    parameters: [
      { id: 'gain', name: 'Preamp Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Master Level', paramIndex: 1, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Bass', paramIndex: 2, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mid', name: 'Mid', paramIndex: 3, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 4, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  capture_slot_03: {
    id: 'capture_slot_03',
    name: 'Slot 03: US Twin Reverb 65 Clean',
    category: 'amp',
    description: 'Sparkling clean American tube amp with pristine headroom.',
    parameters: [
      { id: 'gain', name: 'Volume / Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.35, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Output Level', paramIndex: 1, min: 0, max: 1, defaultValue: 0.75, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Bass', paramIndex: 2, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mid', name: 'Middle', paramIndex: 3, min: 0, max: 1, defaultValue: 0.45, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 4, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  capture_slot_04: {
    id: 'capture_slot_04',
    name: 'Slot 04: British AC30 Top Boost',
    category: 'amp',
    description: 'Chimey Class-A EL84 chime and jangly British grit.',
    parameters: [
      { id: 'gain', name: 'Top Boost Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Cut / Level', paramIndex: 1, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Bass', paramIndex: 2, min: 0, max: 1, defaultValue: 0.45, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mid', name: 'Tone Cut', paramIndex: 3, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 4, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  capture_slot_05: {
    id: 'capture_slot_05',
    name: 'Slot 05: Friedman BE-100 Brown Sound',
    category: 'amp',
    description: 'Modern hot-rodded British high-gain boutique head.',
    parameters: [
      { id: 'gain', name: 'Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Master', paramIndex: 1, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Bass', paramIndex: 2, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mid', name: 'Mid', paramIndex: 3, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 4, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  capture_slot_06: {
    id: 'capture_slot_06',
    name: 'Slot 06: Cali Dual Rectifier (Mesa Style)',
    category: 'amp',
    description: 'Crushing modern American low-end metal rhythm powerhouse.',
    parameters: [
      { id: 'gain', name: 'Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.75, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Level', paramIndex: 1, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Bass', paramIndex: 2, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mid', name: 'Mid', paramIndex: 3, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 4, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  capture_slot_07: {
    id: 'capture_slot_07',
    name: 'Slot 07: Diezel VH4 Mega Lead',
    category: 'amp',
    description: 'Thick, tight German 4-channel high-gain titan.',
    parameters: [
      { id: 'gain', name: 'Gain Ch4', paramIndex: 0, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Channel Vol', paramIndex: 1, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Deep/Bass', paramIndex: 2, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mid', name: 'Middle', paramIndex: 3, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 4, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  capture_slot_08: {
    id: 'capture_slot_08',
    name: 'Slot 08: EVH 5150 III Red Channel',
    category: 'amp',
    description: 'Blistering saturation with ultra-fast transient attack.',
    parameters: [
      { id: 'gain', name: 'Red Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Red Vol', paramIndex: 1, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Low', paramIndex: 2, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mid', name: 'Mid', paramIndex: 3, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'High', paramIndex: 4, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  capture_slot_09: {
    id: 'capture_slot_09',
    name: 'Slot 09: Bogner Shiva 20th Lead',
    category: 'amp',
    description: 'Thick singing sustain with rich harmonic Bloom.',
    parameters: [
      { id: 'gain', name: 'Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Master', paramIndex: 1, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Bass', paramIndex: 2, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mid', name: 'Mid', paramIndex: 3, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 4, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  capture_slot_10: {
    id: 'capture_slot_10',
    name: 'Slot 10: Dumble ODS Overdrive Special',
    category: 'amp',
    description: 'Legendary rare boutique tone with violin-like sustain.',
    parameters: [
      { id: 'gain', name: 'Overdrive', paramIndex: 0, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Level', paramIndex: 1, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Bass', paramIndex: 2, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mid', name: 'Mid', paramIndex: 3, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 4, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },

  // =========================================================================
  // 3. CAB: Official Celestion IR Slots 01 ~ 10
  // =========================================================================
  ir_slot_01: {
    id: 'ir_slot_01',
    name: 'IR 01: 4x12 Greenback UK (G12M)',
    category: 'cab',
    description: 'Classic 1970s British rock cabinet with warm wood resonance.',
    parameters: [
      { id: 'level', name: 'Level', paramIndex: 0, min: 0, max: 1, defaultValue: 0.80, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'low_cut', name: 'Low Cut', paramIndex: 1, min: 0, max: 1, defaultValue: 0.15, unit: 'Hz', valueFormat: v => `${Math.round(20 + v * 200)} Hz` },
      { id: 'high_cut', name: 'High Cut', paramIndex: 2, min: 0, max: 1, defaultValue: 0.85, unit: 'kHz', valueFormat: v => `${(4 + v * 16).toFixed(1)} kHz` },
    ],
  },
  ir_slot_02: {
    id: 'ir_slot_02',
    name: 'IR 02: 4x12 Vintage 30 UK (V30)',
    category: 'cab',
    description: 'Industry standard tight modern rock & metal cabinet with punchy upper mids.',
    parameters: [
      { id: 'level', name: 'Level', paramIndex: 0, min: 0, max: 1, defaultValue: 0.80, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'low_cut', name: 'Low Cut', paramIndex: 1, min: 0, max: 1, defaultValue: 0.20, unit: 'Hz', valueFormat: v => `${Math.round(20 + v * 200)} Hz` },
      { id: 'high_cut', name: 'High Cut', paramIndex: 2, min: 0, max: 1, defaultValue: 0.80, unit: 'kHz', valueFormat: v => `${(4 + v * 16).toFixed(1)} kHz` },
    ],
  },
  ir_slot_03: {
    id: 'ir_slot_03',
    name: 'IR 03: 2x12 Open Back Alnico Blue',
    category: 'cab',
    description: 'Chimey Vox style open-back cabinet with silky top end and bell chime.',
    parameters: [
      { id: 'level', name: 'Level', paramIndex: 0, min: 0, max: 1, defaultValue: 0.80, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'low_cut', name: 'Low Cut', paramIndex: 1, min: 0, max: 1, defaultValue: 0.10, unit: 'Hz', valueFormat: v => `${Math.round(20 + v * 200)} Hz` },
      { id: 'high_cut', name: 'High Cut', paramIndex: 2, min: 0, max: 1, defaultValue: 0.90, unit: 'kHz', valueFormat: v => `${(4 + v * 16).toFixed(1)} kHz` },
    ],
  },
  ir_slot_04: {
    id: 'ir_slot_04',
    name: 'IR 04: 1x12 Deluxe Oxford (American Clean)',
    category: 'cab',
    description: 'Fender tweed style 1x12 open back with tight low end and sparkling highs.',
    parameters: [
      { id: 'level', name: 'Level', paramIndex: 0, min: 0, max: 1, defaultValue: 0.85, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'low_cut', name: 'Low Cut', paramIndex: 1, min: 0, max: 1, defaultValue: 0.12, unit: 'Hz', valueFormat: v => `${Math.round(20 + v * 200)} Hz` },
      { id: 'high_cut', name: 'High Cut', paramIndex: 2, min: 0, max: 1, defaultValue: 0.85, unit: 'kHz', valueFormat: v => `${(4 + v * 16).toFixed(1)} kHz` },
    ],
  },
  ir_slot_05: {
    id: 'ir_slot_05',
    name: 'IR 05: 4x12 G12T-75 UK Metal',
    category: 'cab',
    description: 'Heavy scooped 1980s Marshall cabinet with huge bottom and sharp highs.',
    parameters: [
      { id: 'level', name: 'Level', paramIndex: 0, min: 0, max: 1, defaultValue: 0.80, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'low_cut', name: 'Low Cut', paramIndex: 1, min: 0, max: 1, defaultValue: 0.25, unit: 'Hz', valueFormat: v => `${Math.round(20 + v * 200)} Hz` },
      { id: 'high_cut', name: 'High Cut', paramIndex: 2, min: 0, max: 1, defaultValue: 0.75, unit: 'kHz', valueFormat: v => `${(4 + v * 16).toFixed(1)} kHz` },
    ],
  },

  // =========================================================================
  // 4. POST-FX 1: Delays
  // =========================================================================
  digital_delay: {
    id: 'digital_delay',
    name: 'Digital Delay Studio',
    category: 'post_fx',
    description: 'Pristine 24-bit studio delay with modulation and hi-cut filter.',
    parameters: [
      { id: 'time', name: 'Time', paramIndex: 0, min: 0, max: 1, defaultValue: 0.45, unit: 'ms', valueFormat: v => `${Math.round(20 + v * 1480)} ms` },
      { id: 'feedback', name: 'Feedback', paramIndex: 1, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mix', name: 'Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 0.35, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'tone', name: 'Tone / Hi-Cut', paramIndex: 3, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mod', name: 'Mod Depth', paramIndex: 4, min: 0, max: 1, defaultValue: 0.20, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'trail', name: 'Spillover Trail', paramIndex: 5, min: 0, max: 1, defaultValue: 1.0, unit: '', valueFormat: v => v > 0.5 ? 'ON' : 'OFF' },
    ],
  },
  analog_delay: {
    id: 'analog_delay',
    name: 'BBD Analog Delay',
    category: 'post_fx',
    description: 'Warm Bucket-Brigade delay with dark organic repeats and saturation.',
    parameters: [
      { id: 'time', name: 'Time', paramIndex: 0, min: 0, max: 1, defaultValue: 0.35, unit: 'ms', valueFormat: v => `${Math.round(40 + v * 560)} ms` },
      { id: 'repeats', name: 'Repeats', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mix', name: 'Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'drive', name: 'Drive', paramIndex: 3, min: 0, max: 1, defaultValue: 0.25, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  tape_delay: {
    id: 'tape_delay',
    name: 'Vintage Tape Delay (Echoplex Style)',
    category: 'post_fx',
    description: 'Warm magnetic tape echoes with wow, flutter, and head saturation.',
    parameters: [
      { id: 'time', name: 'Tape Speed', paramIndex: 0, min: 0, max: 1, defaultValue: 0.40, unit: 'ms', valueFormat: v => `${Math.round(50 + v * 950)} ms` },
      { id: 'feedback', name: 'Feedback', paramIndex: 1, min: 0, max: 1, defaultValue: 0.45, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mix', name: 'Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 0.35, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'flutter', name: 'Wow & Flutter', paramIndex: 3, min: 0, max: 1, defaultValue: 0.30, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'age', name: 'Tape Age', paramIndex: 4, min: 0, max: 1, defaultValue: 0.20, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  dual_delay: {
    id: 'dual_delay',
    name: 'Dual Delay (Stereo Cross-Tap)',
    category: 'post_fx',
    description: 'Independent Left/Right delay lines with cross-feedback.',
    parameters: [
      { id: 'time_l', name: 'Time Left', paramIndex: 0, min: 0, max: 1, defaultValue: 0.30, unit: 'ms', valueFormat: v => `${Math.round(20 + v * 980)} ms` },
      { id: 'time_r', name: 'Time Right', paramIndex: 1, min: 0, max: 1, defaultValue: 0.45, unit: 'ms', valueFormat: v => `${Math.round(20 + v * 980)} ms` },
      { id: 'feedback', name: 'Feedback', paramIndex: 2, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mix', name: 'Mix', paramIndex: 3, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },

  // =========================================================================
  // 5. POST-FX 2: Reverbs
  // =========================================================================
  plate_reverb: {
    id: 'plate_reverb',
    name: 'Plate Reverb 140',
    category: 'post_fx',
    description: 'Lush mechanical plate reverb with dense smooth reflections.',
    parameters: [
      { id: 'decay', name: 'Decay', paramIndex: 0, min: 0, max: 1, defaultValue: 0.55, unit: 's', valueFormat: v => `${(0.5 + v * 6.5).toFixed(1)} s` },
      { id: 'pre_delay', name: 'Pre-Delay', paramIndex: 1, min: 0, max: 1, defaultValue: 0.20, unit: 'ms', valueFormat: v => `${Math.round(v * 100)} ms` },
      { id: 'mix', name: 'Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 0.30, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'high_cut', name: 'High Cut', paramIndex: 3, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'low_cut', name: 'Low Cut', paramIndex: 4, min: 0, max: 1, defaultValue: 0.20, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  mind_hall: {
    id: 'mind_hall',
    name: 'Mind Hall Reverb (Concert Space)',
    category: 'post_fx',
    description: 'Expansive acoustic hall for ambient and cinematic guitar textures.',
    parameters: [
      { id: 'decay', name: 'Decay', paramIndex: 0, min: 0, max: 1, defaultValue: 0.70, unit: 's', valueFormat: v => `${(1.0 + v * 12.0).toFixed(1)} s` },
      { id: 'pre_delay', name: 'Pre-Delay', paramIndex: 1, min: 0, max: 1, defaultValue: 0.35, unit: 'ms', valueFormat: v => `${Math.round(v * 150)} ms` },
      { id: 'mix', name: 'Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'size', name: 'Room Size', paramIndex: 3, min: 0, max: 1, defaultValue: 0.80, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'diffusion', name: 'Diffusion', paramIndex: 4, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  blossom_st: {
    id: 'blossom_st',
    name: 'Blossom ST (Ambient Bloom Style)',
    category: 'post_fx',
    description: 'Slow-blooming ethereal ambient reverb based on Strymon BigSky Bloom®.',
    parameters: [
      { id: 'decay', name: 'Decay', paramIndex: 0, min: 0, max: 1, defaultValue: 0.75, unit: 's', valueFormat: v => `${(1.0 + v * 18.0).toFixed(1)} s` },
      { id: 'bloom_time', name: 'Bloom Time', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mix', name: 'Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 0.45, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'tone', name: 'Tone', paramIndex: 3, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  spring_reverb: {
    id: 'spring_reverb',
    name: 'Spring Reverb 63 (Tube Tank)',
    category: 'post_fx',
    description: 'Vintage surf tube tank with bouncy metallic drip.',
    parameters: [
      { id: 'dwell', name: 'Dwell', paramIndex: 0, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'tone', name: 'Tone', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mix', name: 'Reverb Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 0.35, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  shimmer_reverb: {
    id: 'shimmer_reverb',
    name: 'Shimmer Reverb (Octave Ambient)',
    category: 'post_fx',
    description: 'Angelic upper-octave feedback pitch shimmer for cinematic worship.',
    parameters: [
      { id: 'decay', name: 'Decay', paramIndex: 0, min: 0, max: 1, defaultValue: 0.70, unit: 's', valueFormat: v => `${(1.0 + v * 15.0).toFixed(1)} s` },
      { id: 'shimmer', name: 'Shimmer Amount', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mix', name: 'Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'tone', name: 'Tone', paramIndex: 3, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },

  // =========================================================================
  // 6. POST-FX 3: Modulation, Utility, EQs, Noise Gate
  // =========================================================================
  noise_gate: {
    id: 'noise_gate',
    name: 'Adaptive Noise Gate',
    category: 'post_fx',
    description: 'Fast response studio noise suppressor to eliminate high-gain hiss.',
    parameters: [
      { id: 'threshold', name: 'Threshold', paramIndex: 0, min: 0, max: 1, defaultValue: 0.50, unit: 'dB', valueFormat: v => `${Math.round(-80 + v * 60)} dB` },
      { id: 'release', name: 'Release Time', paramIndex: 1, min: 0, max: 1, defaultValue: 0.30, unit: 'ms', valueFormat: v => `${Math.round(10 + v * 490)} ms` },
    ],
  },
  chorus_dc2w: {
    id: 'chorus_dc2w',
    name: 'Chorus DC-2W (Dimension Style)',
    category: 'post_fx',
    description: 'Spacious motion-free 3D stereo chorus based on Boss DC-2W®.',
    parameters: [
      { id: 'mode', name: 'Preset Button', paramIndex: 0, min: 0, max: 1, defaultValue: 0.25, unit: '', valueFormat: v => v < 0.25 ? 'Mode 1' : v < 0.5 ? 'Mode 2' : v < 0.75 ? 'Mode 3' : 'Mode 4' },
      { id: 'mix', name: 'Mix', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  chief_ce2: {
    id: 'chief_ce2',
    name: 'Chief CE-2 (Analog Chorus Style)',
    category: 'post_fx',
    description: 'Classic warm bucket-brigade analog chorus.',
    parameters: [
      { id: 'rate', name: 'Rate', paramIndex: 0, min: 0, max: 1, defaultValue: 0.35, unit: 'Hz', valueFormat: v => `${(0.2 + v * 4.8).toFixed(1)} Hz` },
      { id: 'depth', name: 'Depth', paramIndex: 1, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  phase_95: {
    id: 'phase_95',
    name: 'Phase 95 (Script / Block)',
    category: 'post_fx',
    description: 'Classic analog four-stage phaser sweep.',
    parameters: [
      { id: 'speed', name: 'Speed', paramIndex: 0, min: 0, max: 1, defaultValue: 0.30, unit: 'Hz', valueFormat: v => `${(0.1 + v * 8.0).toFixed(1)} Hz` },
      { id: 'depth', name: 'Depth', paramIndex: 1, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mode', name: '45 / 90 Mode', paramIndex: 2, min: 0, max: 1, defaultValue: 1.0, unit: '', valueFormat: v => v > 0.5 ? 'Phase 90' : 'Phase 45' },
    ],
  },
  optical_tremolo: {
    id: 'optical_tremolo',
    name: 'Optical Tremolo (Fender Style)',
    category: 'post_fx',
    description: 'Smooth pulsating amplitude modulation.',
    parameters: [
      { id: 'speed', name: 'Speed', paramIndex: 0, min: 0, max: 1, defaultValue: 0.40, unit: 'Hz', valueFormat: v => `${(0.5 + v * 9.5).toFixed(1)} Hz` },
      { id: 'depth', name: 'Depth', paramIndex: 1, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'waveform', name: 'Shape', paramIndex: 2, min: 0, max: 1, defaultValue: 0.0, unit: '', valueFormat: v => v > 0.5 ? 'Square' : 'Sine' },
    ],
  },
  graphic_9_eq: {
    id: 'graphic_9_eq',
    name: 'Graphic-9 Studio EQ',
    category: 'post_fx',
    description: '9-Band graphic equalizer for surgical frequency shaping.',
    parameters: [
      { id: 'band_63', name: '63 Hz', paramIndex: 0, min: 0, max: 1, defaultValue: 0.50, unit: 'dB', valueFormat: v => `${Math.round((v - 0.5) * 24)} dB` },
      { id: 'band_125', name: '125 Hz', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: 'dB', valueFormat: v => `${Math.round((v - 0.5) * 24)} dB` },
      { id: 'band_250', name: '250 Hz', paramIndex: 2, min: 0, max: 1, defaultValue: 0.50, unit: 'dB', valueFormat: v => `${Math.round((v - 0.5) * 24)} dB` },
      { id: 'band_500', name: '500 Hz', paramIndex: 3, min: 0, max: 1, defaultValue: 0.50, unit: 'dB', valueFormat: v => `${Math.round((v - 0.5) * 24)} dB` },
      { id: 'band_1k', name: '1 kHz', paramIndex: 4, min: 0, max: 1, defaultValue: 0.50, unit: 'dB', valueFormat: v => `${Math.round((v - 0.5) * 24)} dB` },
      { id: 'band_2k', name: '2 kHz', paramIndex: 5, min: 0, max: 1, defaultValue: 0.50, unit: 'dB', valueFormat: v => `${Math.round((v - 0.5) * 24)} dB` },
      { id: 'band_4k', name: '4 kHz', paramIndex: 6, min: 0, max: 1, defaultValue: 0.50, unit: 'dB', valueFormat: v => `${Math.round((v - 0.5) * 24)} dB` },
      { id: 'level', name: 'Master Level', paramIndex: 7, min: 0, max: 1, defaultValue: 0.50, unit: 'dB', valueFormat: v => `${Math.round((v - 0.5) * 24)} dB` },
    ],
  },
};

/**
 * Gets models tailored specifically for each Nano Cortex slot
 */
export function getModelsForSlot(slotId: CortexSlotId): DeviceModelDef[] {
  switch (slotId) {
    case 'pre_fx_1':
    case 'pre_fx_2':
      return Object.values(DEVICE_CATALOG).filter(m => m.category === 'pre_fx');
    case 'amp':
      return Object.values(DEVICE_CATALOG).filter(m => m.category === 'amp');
    case 'cab':
      return Object.values(DEVICE_CATALOG).filter(m => m.category === 'cab');
    case 'post_fx_1':
      // Delay slot
      return Object.values(DEVICE_CATALOG).filter(m => m.id.includes('delay'));
    case 'post_fx_2':
      // Reverb slot
      return Object.values(DEVICE_CATALOG).filter(m => m.id.includes('reverb') || m.id.includes('blossom') || m.id.includes('hall'));
    case 'post_fx_3':
      // Modulation, Gate, EQ slot
      return Object.values(DEVICE_CATALOG).filter(
        m => m.category === 'post_fx' && !m.id.includes('delay') && !m.id.includes('reverb') && !m.id.includes('blossom') && !m.id.includes('hall')
      );
    default:
      return [];
  }
}
