export type KeyMetricsPayload = {
  snapshotId: number;
  capturedAt: string;
  breadthUp: number;
  breadthDown: number;
  pctUp: number;
  pctDown: number;
  nearHighCount: number;
  nearLowCount: number;
  pctNearHigh: number;
  pctNearLow: number;
  upGt1Count: number;
  downLtMinus1Count: number;
  weightedUpShare: number;
  weightedDownShare: number;
  heavyweightsWeightedMove: number;
  nonHeavyweightsWeightedMove: number;
  msiSimple: string;
};

export type MarketSnapshotPayload = {
  snapshotId: number;
  capturedAt: string;
  upPercent: number;
  downPercent: number;
  nearHighPercent: number;
  nearLowPercent: number;
  upGt1Count: number;
  downLtMinus1Count: number;
  weightedUpShare: number;
  weightedDownShare: number;
  heavyweightsWeightedMove: number;
  nonHeavyweightsWeightedMove: number;
  msiSimple: string;
};

export type MarketHealthPayload = {
  snapshotId: number;
  capturedAt: string;
  msiScore: number;
  composite: number;
  breadthScore: number;
  distortion: number;
  weightedBreadth: number;
  influenceConcentration: number;
  top3Share: number;
  topHeavyweightInfluenceShare: number;
  bankShare: number;
  top3ProportionShare: number;
  top3InfluenceShare: number;
  rotationDelta: number;
  indexDependencyRisk: number;
  bulltrap: string;
  washout: string;
  squeeze: string;
  regime: string;
  structure: string;
  riskFlag: string;
  finalVerdict: string;
  actionBias: string;
  actionWhy: string;
  preferredSetup: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

let keyMetricsPromise: Promise<KeyMetricsPayload> | null = null;
let snapshotPromise: Promise<MarketSnapshotPayload> | null = null;
let healthPromise: Promise<MarketHealthPayload> | null = null;

export function getKeyMetrics() {
  if (!keyMetricsPromise) {
    keyMetricsPromise = fetchJson<KeyMetricsPayload>('/api/dashboard/key-metrics');
  }
  return keyMetricsPromise;
}

export function getMarketSnapshot() {
  if (!snapshotPromise) {
    snapshotPromise = fetchJson<MarketSnapshotPayload>('/api/dashboard/market-snapshot');
  }
  return snapshotPromise;
}

export function getMarketHealth() {
  if (!healthPromise) {
    healthPromise = fetchJson<MarketHealthPayload>('/api/dashboard/market-health');
  }
  return healthPromise;
}
