export type RawStat = {
  symbol: string;
  basic: number | null;
  open: number | null;
  close: number | null;
  high: number | null;
  low: number | null;
  average: number | null;
  change_abs: number | null;
  change_pct: number | null;
  total_vol: number | null;
  total_val: number | null;
  market_cap: number | null;
};

export type RawInfluence = {
  stock: string;
  proportion_pct: number | null;
  influence_pct: number | null;
  influence_points: number | null;
};

export type AutoScoreRow = {
  ticker: string;
  ref_price: number | null;
  price: number | null;
  high: number | null;
  low: number | null;
  change_abs: number | null;
  change_pct: number | null;
  volume: number | null;
  value_bil: number | null;
  weight: number;
  is_bank: number;
  is_heavyweight: number;
  range_pos: number;
  near_high: number;
  near_low: number;
  up: number;
  down: number;
  up_gt_1: number;
  down_lt_minus_1: number;
  weighted_move: number;
  weighted_range_pos: number;
  influence_points: number | null;
  influence_pct: number | null;
  proportion_pct: number | null;
};

export type DashboardMetricsComputed = {
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
  weightedMoveSum: number;
  heavyweightsWeightedMove: number;
  nonHeavyweightsWeightedMove: number;
  weightedUpShare: number;
  weightedDownShare: number;
  influenceConcentration: number;
  top3Share: number;
  topHeavyweightInfluenceShare: number;
  bankShare: number;
  top3ProportionShare: number;
  top3InfluenceShare: number;
  rotationDelta: number | null;
  indexDependencyRisk: number;
  msiSimple: string;
  compositeClamped: number;
};
