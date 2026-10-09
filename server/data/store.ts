import type { ValidatedWasteRecord, DatasetValidationResult } from '../engine/schemaValidator';
import type { ComputedHotspotItem } from '../engine/hotspotEngine';
import type { ForwardPredictionItem } from '../engine/predictionEngine';
import type { OperationalIntervention } from '../engine/operationsEngine';
import { buildCanonicalDemoState } from './demoSeed';

export interface ActiveDatasetState {
  datasetId: string;
  name: string;
  fileName: string;
  isDemo: boolean;
  uploadedAt: string;
  s3RawKey?: string;
  s3ProcessedKey?: string;
  records: ValidatedWasteRecord[];
  validation: DatasetValidationResult;
  hotspots: ComputedHotspotItem[];
  predictions: ForwardPredictionItem[];
  interventions: OperationalIntervention[];
}

class DataStore {
  private activeState: ActiveDatasetState | null = null;

  getActive(autoInitialize = true): ActiveDatasetState | null {
    if (!this.activeState && autoInitialize) {
      this.activeState = buildCanonicalDemoState();
    }
    return this.activeState;
  }

  setActive(state: ActiveDatasetState) {
    this.activeState = state;
  }

  clear() {
    this.activeState = null;
  }
}

export const dataStore = new DataStore();
