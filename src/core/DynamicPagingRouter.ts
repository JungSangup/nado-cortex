import { CortexSlotId, DeviceParameterDef } from '../types';
import { CORTEX_SLOT_CONFIGS, DEVICE_CATALOG } from './DeviceCatalog';

export interface PagedParameterMapping {
  encoderIndex: number; // 0 (SW1), 1 (SW2), 2 (SW3), 3 (SW4)
  encoderLabel: 'SW 1' | 'SW 2' | 'SW 3' | 'SW 4';
  parameter: DeviceParameterDef | null;
  currentValue: number; // 0.0 ~ 1.0 normalized
  formattedValue: string;
}

export class DynamicPagingRouter {
  private selectedSlotId: CortexSlotId = 'pre_fx_1';
  private currentPageIndex: number = 0;
  
  // Storage of current runtime parameter values: Map<slotId, Map<paramIndex, normalizedValue>>
  private parameterValues: Map<string, Map<number, number>> = new Map();

  constructor() {
    this.initDefaultValues();
  }

  public getSelectedSlotId(): CortexSlotId {
    return this.selectedSlotId;
  }

  public setSelectedSlotId(slotId: CortexSlotId): void {
    if (this.selectedSlotId !== slotId) {
      this.selectedSlotId = slotId;
      this.currentPageIndex = 0; // Reset to page 0 on slot change
    }
  }

  public getCurrentPageIndex(): number {
    return this.currentPageIndex;
  }

  public getTotalPages(modelId?: string): number {
    const params = this.getParametersForSlot(this.selectedSlotId, modelId);
    return Math.max(1, Math.ceil(params.length / 4));
  }

  public nextPage(modelId?: string): number {
    const total = this.getTotalPages(modelId);
    this.currentPageIndex = (this.currentPageIndex + 1) % total;
    return this.currentPageIndex;
  }

  public prevPage(modelId?: string): number {
    const total = this.getTotalPages(modelId);
    this.currentPageIndex = (this.currentPageIndex - 1 + total) % total;
    return this.currentPageIndex;
  }

  public setPageIndex(index: number, modelId?: string): void {
    const total = this.getTotalPages(modelId);
    this.currentPageIndex = Math.max(0, Math.min(total - 1, index));
  }

  /**
   * Gets parameters assigned to SW 1~4 for the current page
   */
  public getCurrentPageMappings(modelId?: string): PagedParameterMapping[] {
    const labels: ('SW 1' | 'SW 2' | 'SW 3' | 'SW 4')[] = ['SW 1', 'SW 2', 'SW 3', 'SW 4'];
    const params = this.getParametersForSlot(this.selectedSlotId, modelId);
    const startIndex = this.currentPageIndex * 4;

    return labels.map((label, idx) => {
      const param = params[startIndex + idx] || null;
      let val = 0.5;
      let formatted = 'None';

      if (param) {
        val = this.getParameterValue(this.selectedSlotId, param.paramIndex, param.defaultValue);
        formatted = param.valueFormat ? param.valueFormat(val) : `${Math.round(val * 100)}%`;
      }

      return {
        encoderIndex: idx,
        encoderLabel: label,
        parameter: param,
        currentValue: val,
        formattedValue: formatted,
      };
    });
  }

  public getParameterValue(slotId: CortexSlotId, paramIndex: number, fallback: number = 0.5): number {
    const slotMap = this.parameterValues.get(slotId);
    if (!slotMap || !slotMap.has(paramIndex)) {
      return fallback;
    }
    return slotMap.get(paramIndex)!;
  }

  public setParameterValue(slotId: CortexSlotId, paramIndex: number, value: number): number {
    const clamped = Math.max(0, Math.min(1.0, value));
    if (!this.parameterValues.has(slotId)) {
      this.parameterValues.set(slotId, new Map());
    }
    this.parameterValues.get(slotId)!.set(paramIndex, clamped);
    return clamped;
  }

  /**
   * Adjusts parameter value by step delta (e.g. +0.01 for CW, -0.01 for CCW)
   */
  public adjustParameterValue(slotId: CortexSlotId, paramIndex: number, delta: number): number {
    const current = this.getParameterValue(slotId, paramIndex);
    const rawUpdated = current + delta;
    // Round to 2 decimal places to avoid floating point drift (e.g. 0.45000000000000007)
    const rounded = Math.round(rawUpdated * 100) / 100;
    const updated = Math.max(0, Math.min(1.0, rounded));
    return this.setParameterValue(slotId, paramIndex, updated);
  }

  public onModelChanged(slotId: CortexSlotId, modelId: string): void {
    const model = DEVICE_CATALOG[modelId];
    if (!model) return;
    const slotMap = new Map<number, number>();
    model.parameters.forEach(p => {
      slotMap.set(p.paramIndex, p.defaultValue);
    });
    this.parameterValues.set(slotId, slotMap);
    this.currentPageIndex = 0; // Reset page
  }

  public getParametersForSlot(slotId: CortexSlotId, modelId?: string): DeviceParameterDef[] {
    const config = CORTEX_SLOT_CONFIGS[slotId];
    if (!config) return [];
    const targetModelId = modelId || config.defaultModelId;
    const model = DEVICE_CATALOG[targetModelId];
    return model ? model.parameters : [];
  }

  private initDefaultValues(): void {
    Object.values(CORTEX_SLOT_CONFIGS).forEach(cfg => {
      const model = DEVICE_CATALOG[cfg.defaultModelId];
      if (model) {
        const slotMap = new Map<number, number>();
        model.parameters.forEach(p => {
          slotMap.set(p.paramIndex, p.defaultValue);
        });
        this.parameterValues.set(cfg.slotId, slotMap);
      }
    });
  }
}

export const dynamicPagingRouter = new DynamicPagingRouter();
