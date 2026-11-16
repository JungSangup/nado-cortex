import { CortexSlotId, DeviceModelDef } from '../types';

/**
 * Nano Cortex Official / Standard Device Model Catalog
 * Defines FX blocks, Amp models, IRs, and their parameters for Nano Cortex slots.
 */

export interface SlotMetadata {
  slotId: CortexSlotId;
  name: string;
  enableSlot: number;
  modelSlot: number; // Used for continuous FX params
  category: 'pre_fx' | 'amp' | 'cab' | 'post_fx';
  defaultModelId: string;
}

export const CORTEX_SLOT_CONFIGS: Record<CortexSlotId, SlotMetadata> = {
  pre_fx_1: {
    slotId: 'pre_fx_1',
    name: 'Pre FX 1',
    enableSlot: 0x04,
    modelSlot: 0x00,
    category: 'pre_fx',
    defaultModelId: 'ts9_overdrive',
  },
  pre_fx_2: {
    slotId: 'pre_fx_2',
    name: 'Pre FX 2',
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
    defaultModelId: 'capture_plexi_lead',
  },
  cab: {
    slotId: 'cab',
    name: 'Cab / IR',
    enableSlot: 0x03,
    modelSlot: 0x03,
    category: 'cab',
    defaultModelId: 'ir_4x12_greenback',
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
    name: 'Post FX 3 (Mod / Gate)',
    enableSlot: 0x08,
    modelSlot: 0x04,
    category: 'post_fx',
    defaultModelId: 'noise_gate',
  },
};

export const DEVICE_CATALOG: Record<string, DeviceModelDef> = {
  // --- Pre FX (Overdrive & Comp) ---
  ts9_overdrive: {
    id: 'ts9_overdrive',
    name: 'Tube Screamer (Green Drive)',
    category: 'pre_fx',
    description: 'Classic mid-hump overdrive pedal based on TS9.',
    parameters: [
      { id: 'gain', name: 'Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.45, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'tone', name: 'Tone', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Level', paramIndex: 2, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  rodent_distortion: {
    id: 'rodent_distortion',
    name: 'Rodent Drive',
    category: 'pre_fx',
    description: 'Aggressive hard-clipping distortion pedal based on ProCo Rat.',
    parameters: [
      { id: 'distortion', name: 'Distortion', paramIndex: 0, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'filter', name: 'Filter', paramIndex: 1, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'volume', name: 'Volume', paramIndex: 2, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  classic_compressor: {
    id: 'classic_compressor',
    name: 'Studio Compressor',
    category: 'pre_fx',
    description: 'Transparent optical compressor for smooth dynamic control.',
    parameters: [
      { id: 'sustain', name: 'Sustain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'attack', name: 'Attack', paramIndex: 1, min: 0, max: 1, defaultValue: 0.30, unit: 'ms', valueFormat: v => `${Math.round(v * 50)}ms` },
      { id: 'blend', name: 'Blend', paramIndex: 2, min: 0, max: 1, defaultValue: 0.80, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Level', paramIndex: 3, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },

  // --- Amp / Capture ---
  capture_plexi_lead: {
    id: 'capture_plexi_lead',
    name: 'UK 100 Lead Crunch (Plexi)',
    category: 'amp',
    description: 'Vintage high-power British stack capture with punchy harmonics.',
    parameters: [
      { id: 'gain', name: 'Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Bass', paramIndex: 2, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mid', name: 'Mid', paramIndex: 3, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 4, min: 0, max: 1, defaultValue: 0.60, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Level', paramIndex: 1, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'presence', name: 'Presence', paramIndex: 5, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  capture_us_clean: {
    id: 'capture_us_clean',
    name: 'US Twin Clean 65',
    category: 'amp',
    description: 'Sparkling clean American tube amp with wide headroom.',
    parameters: [
      { id: 'gain', name: 'Gain', paramIndex: 0, min: 0, max: 1, defaultValue: 0.35, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'bass', name: 'Bass', paramIndex: 2, min: 0, max: 1, defaultValue: 0.55, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mid', name: 'Mid', paramIndex: 3, min: 0, max: 1, defaultValue: 0.45, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'treble', name: 'Treble', paramIndex: 4, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'level', name: 'Level', paramIndex: 1, min: 0, max: 1, defaultValue: 0.75, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },

  // --- Cab / IR ---
  ir_4x12_greenback: {
    id: 'ir_4x12_greenback',
    name: '4x12 Greenback UK',
    category: 'cab',
    description: 'Iconic 1970s British 4x12 cabinet with Celestion Greenbacks.',
    parameters: [
      { id: 'slot', name: 'IR Slot', paramIndex: 0, min: 0, max: 1, defaultValue: 0.20, unit: 'Slot', valueFormat: v => `Slot ${Math.round(v * 4) + 1}` },
      { id: 'level', name: 'Level', paramIndex: 1, min: 0, max: 1, defaultValue: 0.80, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'low_cut', name: 'Low Cut', paramIndex: 2, min: 0, max: 1, defaultValue: 0.15, unit: 'Hz', valueFormat: v => `${Math.round(20 + v * 200)} Hz` },
      { id: 'high_cut', name: 'High Cut', paramIndex: 3, min: 0, max: 1, defaultValue: 0.85, unit: 'kHz', valueFormat: v => `${(4 + v * 16).toFixed(1)} kHz` },
    ],
  },

  // --- Post FX 1 (Delay) ---
  digital_delay: {
    id: 'digital_delay',
    name: 'Digital Delay Studio',
    category: 'post_fx',
    description: 'Pristine 24-bit studio delay with modulation and hi-cut filter.',
    parameters: [
      { id: 'time', name: 'Time', paramIndex: 0, min: 0, max: 1, defaultValue: 0.45, unit: 'ms', valueFormat: v => `${Math.round(20 + v * 1480)} ms` },
      { id: 'feedback', name: 'Feedback', paramIndex: 1, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mix', name: 'Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 0.35, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'tone', name: 'Tone', paramIndex: 3, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'modulation', name: 'Mod Depth', paramIndex: 4, min: 0, max: 1, defaultValue: 0.20, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'trail', name: 'Spillover', paramIndex: 5, min: 0, max: 1, defaultValue: 1.0, unit: '', valueFormat: v => v > 0.5 ? 'ON' : 'OFF' },
    ],
  },
  analog_delay: {
    id: 'analog_delay',
    name: 'BBD Analog Delay',
    category: 'post_fx',
    description: 'Warm Bucket-Brigade delay with organic saturation.',
    parameters: [
      { id: 'time', name: 'Time', paramIndex: 0, min: 0, max: 1, defaultValue: 0.35, unit: 'ms', valueFormat: v => `${Math.round(40 + v * 560)} ms` },
      { id: 'repeats', name: 'Repeats', paramIndex: 1, min: 0, max: 1, defaultValue: 0.50, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'mix', name: 'Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'drive', name: 'Drive', paramIndex: 3, min: 0, max: 1, defaultValue: 0.25, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },

  // --- Post FX 2 (Reverb) ---
  plate_reverb: {
    id: 'plate_reverb',
    name: 'Plate Reverb 140',
    category: 'post_fx',
    description: 'Lush mechanical plate reverb with dense reflections.',
    parameters: [
      { id: 'decay', name: 'Decay', paramIndex: 0, min: 0, max: 1, defaultValue: 0.55, unit: 's', valueFormat: v => `${(0.5 + v * 6.5).toFixed(1)} s` },
      { id: 'pre_delay', name: 'Pre-Delay', paramIndex: 1, min: 0, max: 1, defaultValue: 0.20, unit: 'ms', valueFormat: v => `${Math.round(v * 100)} ms` },
      { id: 'mix', name: 'Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 0.30, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'high_cut', name: 'High Cut', paramIndex: 3, min: 0, max: 1, defaultValue: 0.70, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'low_cut', name: 'Low Cut', paramIndex: 4, min: 0, max: 1, defaultValue: 0.20, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },
  hall_reverb: {
    id: 'hall_reverb',
    name: 'Concert Hall Reverb',
    category: 'post_fx',
    description: 'Expansive acoustic space for ambient and cinematic textures.',
    parameters: [
      { id: 'decay', name: 'Decay', paramIndex: 0, min: 0, max: 1, defaultValue: 0.70, unit: 's', valueFormat: v => `${(1.0 + v * 12.0).toFixed(1)} s` },
      { id: 'pre_delay', name: 'Pre-Delay', paramIndex: 1, min: 0, max: 1, defaultValue: 0.35, unit: 'ms', valueFormat: v => `${Math.round(v * 150)} ms` },
      { id: 'mix', name: 'Mix', paramIndex: 2, min: 0, max: 1, defaultValue: 0.40, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'size', name: 'Room Size', paramIndex: 3, min: 0, max: 1, defaultValue: 0.80, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'diffusion', name: 'Diffusion', paramIndex: 4, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
    ],
  },

  // --- Post FX 3 (Mod / Gate) ---
  noise_gate: {
    id: 'noise_gate',
    name: 'Adaptive Noise Gate',
    category: 'post_fx',
    description: 'Fast response noise suppressor to eliminate hum and hiss.',
    parameters: [
      { id: 'threshold', name: 'Threshold', paramIndex: 0, min: 0, max: 1, defaultValue: 0.50, unit: 'dB', valueFormat: v => `${Math.round(-80 + v * 60)} dB` },
      { id: 'decay', name: 'Release', paramIndex: 1, min: 0, max: 1, defaultValue: 0.30, unit: 'ms', valueFormat: v => `${Math.round(10 + v * 490)} ms` },
    ],
  },
  sine_tremolo: {
    id: 'sine_tremolo',
    name: 'Optical Tremolo',
    category: 'post_fx',
    description: 'Smooth vintage amplitude modulation.',
    parameters: [
      { id: 'speed', name: 'Speed', paramIndex: 0, min: 0, max: 1, defaultValue: 0.40, unit: 'Hz', valueFormat: v => `${(0.5 + v * 9.5).toFixed(1)} Hz` },
      { id: 'depth', name: 'Depth', paramIndex: 1, min: 0, max: 1, defaultValue: 0.65, unit: '%', valueFormat: v => `${Math.round(v * 100)}%` },
      { id: 'waveform', name: 'Shape', paramIndex: 2, min: 0, max: 1, defaultValue: 0.0, unit: '', valueFormat: v => v > 0.5 ? 'Square' : 'Sine' },
    ],
  },
};

/**
 * Gets models compatible with a specific category
 */
export function getModelsForCategory(category: 'pre_fx' | 'amp' | 'cab' | 'post_fx'): DeviceModelDef[] {
  return Object.values(DEVICE_CATALOG).filter(m => m.category === category);
}

/**
 * Gets models compatible with a specific slot
 */
export function getModelsForSlot(slotId: CortexSlotId): DeviceModelDef[] {
  const config = CORTEX_SLOT_CONFIGS[slotId];
  if (!config) return [];
  return getModelsForCategory(config.category);
}
