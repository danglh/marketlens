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

const inflight = new Map<string, Promise<unknown>>();

async function fetchJson<T>(url: string): Promise<T> {
  const existing = inflight.get(url);
  if (existing) {
    return existing as Promise<T>;
  }

  const request = fetch(url, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      return response.json() as Promise<T>;
    })
    .finally(() => {
      inflight.delete(url);
    });

  inflight.set(url, request as Promise<unknown>);
  return request;
}

export function getKeyMetrics() {
  return fetchJson<KeyMetricsPayload>('/api/dashboard/key-metrics');
}

export function getMarketSnapshot() {
  return fetchJson<MarketSnapshotPayload>('/api/dashboard/market-snapshot');
}

export function getMarketHealth() {
  return fetchJson<MarketHealthPayload>('/api/dashboard/market-health');
}
