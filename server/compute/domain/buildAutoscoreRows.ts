import { clamp01, percentileInc, toBilVndMixed } from "./math";
import type { AutoScoreRow, RawInfluence, RawStat } from "./types";

type BuildAutoscoreRowsInput = {
  stats: RawStat[];
  influences: RawInfluence[];
  bankSet: Set<string>;
};

export function buildAutoscoreRows(input: BuildAutoscoreRowsInput): AutoScoreRow[] {
  const { stats, influences, bankSet } = input;

  const infMap = new Map<string, RawInfluence>();
  for (const r of influences) infMap.set(r.stock, r);

  // Prefer influence proportion_pct; fallback to market_cap if missing.
  const propSum = influences
    .map((r) => r.proportion_pct ?? 0)
    .reduce((a, b) => a + b, 0);

  const mcapSum = stats
    .map((r) => r.market_cap ?? 0)
    .reduce((a, b) => a + b, 0);

  const autoscoreRows = stats.map((s) => {
    const inf = infMap.get(s.symbol);
    const proportionPct = inf?.proportion_pct ?? null;
    const influencePct = inf?.influence_pct ?? null;
    const influencePoints = inf?.influence_points ?? null;

    let weight = 0;
    if (proportionPct != null && propSum > 0) {
      weight = proportionPct / propSum; // ratio 0..1
    } else if (s.market_cap != null && mcapSum > 0) {
      weight = s.market_cap / mcapSum; // fallback
    }

    const refPrice = s.basic ?? s.open ?? null;
    const price = s.close ?? s.average ?? s.open ?? null;
    const high = s.high ?? null;
    const low = s.low ?? null;

    const changeAbs = s.change_abs ?? (price != null && refPrice != null ? price - refPrice : null);

    const changePct =
      s.change_pct ??
      (changeAbs != null && refPrice != null && refPrice !== 0 ? (changeAbs / refPrice) * 100 : null);

    const changePctForFlags = changePct ?? 0;
    const valueBil = toBilVndMixed(s.total_val);

    const rangePos =
      price != null && high != null && low != null && high !== low
        ? clamp01((price - low) / (high - low))
        : 0.5;

    const nearHigh = rangePos >= 0.8 ? 1 : 0;
    const nearLow = rangePos <= 0.2 ? 1 : 0;

    const up = changePctForFlags > 0 ? 1 : 0;
    const down = changePctForFlags < 0 ? 1 : 0;
    const upGt1 = changePctForFlags >= 1 ? 1 : 0;
    const downLtMinus1 = changePctForFlags <= -1 ? 1 : 0;

    const weightedMove = weight * changePctForFlags;

    return {
      ticker: s.symbol,
      ref_price: refPrice,
      price,
      high,
      low,
      change_abs: changeAbs,
      change_pct: changePct,
      volume: s.total_vol ?? null,
      value_bil: valueBil,
      weight,
      is_bank: bankSet.has(s.symbol) ? 1 : 0,
      is_heavyweight: 0, // set later
      range_pos: rangePos,
      near_high: nearHigh,
      near_low: nearLow,
      up,
      down,
      up_gt_1: upGt1,
      down_lt_minus_1: downLtMinus1,
      weighted_move: weightedMove,
      weighted_range_pos: weight * rangePos,
      influence_points: influencePoints ?? null,
      influence_pct: influencePct ?? null,
      proportion_pct: proportionPct ?? null,
    };
  });

  // Heavyweight flag = weight >= P80.
  const p80 = percentileInc(autoscoreRows.map((r) => r.weight), 0.8);
  for (const r of autoscoreRows) {
    r.is_heavyweight = r.weight >= p80 ? 1 : 0;
  }

  return autoscoreRows;
}
