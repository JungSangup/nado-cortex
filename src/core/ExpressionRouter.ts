import { CortexSlotId } from '../types';
import { useAppStore } from './store';
import { CORTEX_SLOT_CONFIGS, DEVICE_CATALOG } from './DeviceCatalog';
import { dynamicPagingRouter } from './DynamicPagingRouter';

export interface ExpressionTarget {
  slotId?: CortexSlotId;
  paramIndex?: number;
  label?: string;
  min?: number;
  max?: number;
  invert?: boolean;
}

export class ExpressionRouter {
  private currentExpValue: number = 0; // 0 ~ 127
  private customTarget: ExpressionTarget | null = null;
  private onSendParamCallback?: (slotId: CortexSlotId, paramIndex: number, value: number) => void;

  public setSendParamCallback(fn: (slotId: CortexSlotId, paramIndex: number, value: number) => void): void {
    this.onSendParamCallback = fn;
  }

  public setCustomTarget(target: ExpressionTarget | null): void {
    this.customTarget = target;
  }

  public getExpValue(): number {
    return this.currentExpValue;
  }

  /**
   * Resolves the target slot and parameter index to modulate.
   * Prioritizes custom mapping -> Crying Wah position -> Wham pitch -> Volume/Gain
   */
  public resolveTarget(): { slotId: CortexSlotId; paramIndex: number; label: string } {
    if (this.customTarget && this.customTarget.slotId && this.customTarget.paramIndex !== undefined) {
      return {
        slotId: this.customTarget.slotId,
        paramIndex: this.customTarget.paramIndex,
        label: this.customTarget.label || 'Custom Target',
      };
    }

    const store = useAppStore.getState();
    const selectedSlotId = store.selectedSlotId;
    const currentSlot = store.cortexSlots.find((s) => s.slotId === selectedSlotId);
    const modelId = currentSlot?.modelId || CORTEX_SLOT_CONFIGS[selectedSlotId]?.defaultModelId;
    const model = DEVICE_CATALOG[modelId];

    // 1. If Crying Wah
    if (modelId === 'crying_wah') {
      return { slotId: selectedSlotId, paramIndex: 0, label: 'Wah Pedal Sweep' };
    }

    // 2. If Wham Pitch
    if (modelId === 'wham_pitch') {
      return { slotId: selectedSlotId, paramIndex: 0, label: 'Wham Pitch Bend' };
    }

    // 3. Fallback: First parameter of currently selected slot
    const firstParamName = model?.parameters[0]?.name || 'Primary Param';
    return {
      slotId: selectedSlotId,
      paramIndex: 0,
      label: `${currentSlot?.name || selectedSlotId} (${firstParamName})`,
    };
  }

  /**
   * Handles raw EXP MIDI CC 1 (0 ~ 127)
   */
  public handleExpressionMidi(ccValue: number): { slotId: CortexSlotId; paramIndex: number; normalizedValue: number } | null {
    const clampedCc = Math.max(0, Math.min(127, Math.round(ccValue)));
    this.currentExpValue = clampedCc;

    const store = useAppStore.getState();
    store.updateExpValue(clampedCc);

    const target = this.resolveTarget();
    let norm = clampedCc / 127.0;

    if (this.customTarget?.invert) {
      norm = 1.0 - norm;
    }

    dynamicPagingRouter.setParameterValue(target.slotId, target.paramIndex, norm);
    store.updateSlotParamValue(target.slotId, target.paramIndex, norm);

    if (this.onSendParamCallback) {
      this.onSendParamCallback(target.slotId, target.paramIndex, norm);
    }

    return {
      slotId: target.slotId,
      paramIndex: target.paramIndex,
      normalizedValue: norm,
    };
  }
}

export const expressionRouter = new ExpressionRouter();
