import { labelRegime } from "./math";
import type { AutoScoreRow, DashboardMetricsComputed } from "./types";

export function calcDashboardMetrics(rows: AutoScoreRow[]): DashboardMetricsComputed {
  const n = rows.length || 1;

  const breadthUp = rows.reduce((a, r) => a + r.up, 0);
  const breadthDown = rows.reduce((a, r) => a + r.down, 0);
  const pctUp = breadthUp / n;
  const pctDown = breadthDown / n;

  const nearHighCount = rows.reduce((a, r) => a + r.near_high, 0);
  const nearLowCount = rows.reduce((a, r) => a + r.near_low, 0);
  const pctNearHigh = nearHighCount / n;
  const pctNearLow = nearLowCount / n;

  const upGt1Count = rows.reduce((a, r) => a + r.up_gt_1, 0);
  const downLtMinus1Count = rows.reduce((a, r) => a + r.down_lt_minus_1, 0);

  const weightedMoveSum = rows.reduce((a, r) => a + r.weighted_move, 0);

  const heavyweightsWeightedMove = rows
    .filter((r) => r.is_heavyweight === 1)
    .reduce((a, r) => a + r.weighted_move, 0);

  const nonHeavyweightsWeightedMove = rows
    .filter((r) => r.is_heavyweight === 0)
    .reduce((a, r) => a + r.weighted_move, 0);

  const weightedUpShare = rows.filter((r) => (r.change_pct ?? 0) > 0).reduce((a, r) => a + r.weight, 0);

  const weightedDownShare = rows.filter((r) => (r.change_pct ?? 0) < 0).reduce((a, r) => a + r.weight, 0);

  const absInf = rows
    .map((r) => Math.abs(r.influence_points ?? 0))
    .reduce((a, b) => a + b, 0);

  const sortedAbsInf = rows
    .map((r) => Math.abs(r.influence_points ?? 0))
    .sort((a, b) => b - a);

  const top3AbsSum = (sortedAbsInf[0] ?? 0) + (sortedAbsInf[1] ?? 0) + (sortedAbsInf[2] ?? 0);
  const top3Share = absInf > 0 ? (100 * top3AbsSum) / absInf : 0;

  const topHeavyweightAbs = rows
    .filter((r) => r.is_heavyweight === 1)
    .reduce((a, r) => a + Math.abs(r.influence_points ?? 0), 0);

  const bankAbs = rows
    .filter((r) => r.is_bank === 1)
    .reduce((a, r) => a + Math.abs(r.influence_points ?? 0), 0);

  const topHeavyweightInfluenceShare = absInf > 0 ? (100 * topHeavyweightAbs) / absInf : 0;
  const bankShare = absInf > 0 ? (100 * bankAbs) / absInf : 0;

  const propSorted = rows
    .map((r) => r.proportion_pct ?? 0)
    .sort((a, b) => b - a);
  const top3ProportionShare = ((propSorted[0] ?? 0) + (propSorted[1] ?? 0) + (propSorted[2] ?? 0)) / 100;

  const infPctSorted = rows
    .map((r) => r.influence_pct ?? 0)
    .sort((a, b) => b - a);
  const top3InfluenceShare = (infPctSorted[0] ?? 0) + (infPctSorted[1] ?? 0) + (infPctSorted[2] ?? 0);

  // Index dependency risk (Excel-like): 100*ABS(SUM(V where heavyweight=1))/SUM(ABS(V)).
  const sumInfHeavy = rows
    .filter((r) => r.is_heavyweight === 1)
    .reduce((a, r) => a + (r.influence_points ?? 0), 0);
  const indexDependencyRisk = absInf > 0 ? (100 * Math.abs(sumInfHeavy)) / absInf : 0;

  // A simple composite proxy.
  const composite = Math.round(50 + 20 * weightedMoveSum + 20 * (pctUp - pctDown) - 0.2 * top3Share);
  const compositeClamped = Math.max(0, Math.min(100, composite));
  const msiSimple = labelRegime(compositeClamped);

  return {
    breadthUp,
    breadthDown,
    pctUp,
    pctDown,
    nearHighCount,
    nearLowCount,
    pctNearHigh,
    pctNearLow,
    upGt1Count,
    downLtMinus1Count,
    weightedMoveSum,
    heavyweightsWeightedMove,
    nonHeavyweightsWeightedMove,
    weightedUpShare,
    weightedDownShare,
    influenceConcentration: top3Share,
    top3Share,
    topHeavyweightInfluenceShare,
    bankShare,
    top3ProportionShare,
    top3InfluenceShare,
    rotationDelta: null,
    indexDependencyRisk,
    msiSimple,
    compositeClamped,
  };
}
