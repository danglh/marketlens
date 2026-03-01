// server/compute/computeSnapshot.ts
import { pool } from "../db/pool";

type RawStat = {
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

type RawInfluence = {
  stock: string;
  proportion_pct: number | null;
  influence_pct: number | null;
  influence_points: number | null;
};

function clamp01(x: number) {
  if (Number.isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

/**
 * Excel-like percentile (PERCENTILE.INC).
 * p=0.8 means 80th percentile inclusive.
 */
function percentileInc(values: number[], p: number) {
  const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (xs.length === 0) return 0;
  if (p <= 0) return xs[0];
  if (p >= 1) return xs[xs.length - 1];

  const n = xs.length;
  const rank = (n - 1) * p;
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return xs[lo];
  const w = rank - lo;
  return xs[lo] * (1 - w) + xs[hi] * w;
}

function toBilVndMixed(totalVal: number | null): number | null {
  if (totalVal == null) return null;
  const v = totalVal;

  // If it's huge (e.g., 91252), it's likely "million VND" -> /1000 => bil
  // If it's already in bil (e.g., 1788.467), keep.
  const abs = Math.abs(v);
  if (abs >= 10_000) return v / 1_000;

  return v;
}

function labelRegime(score: number) {
  // Mirrors your nested IF idea (tweak as needed)
  if (score >= 80) return "STRONG BULL";
  if (score >= 70) return "BULL";
  if (score >= 60) return "WEAK BULL";
  if (score >= 45) return "NEUTRAL";
  if (score >= 30) return "DISTRIBUTION";
  return "BEAR";
}

export async function computeSnapshot(snapshotId: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Load settings (bank tickers)
    const bankRows = await client.query<{ ticker: string }>(
      `SELECT ticker FROM settings_bank_ticker`
    );
    const bankSet = new Set(bankRows.rows.map((r) => r.ticker));

    // 2) Load raw tables
    const statRes = await client.query<RawStat>(
      `
      SELECT
        symbol,
        basic, 
        open, close, high, low, average,
        change_abs, change_pct,
        total_vol, total_val,
        market_cap
      FROM raw_vn30_statistic
      WHERE snapshot_id = $1
      `,
      [snapshotId]
    );

    const infRes = await client.query<RawInfluence>(
      `
      SELECT
        stock,
        proportion_pct,
        influence_pct,
        influence_points
      FROM raw_vn30_influence
      WHERE snapshot_id = $1
      `,
      [snapshotId]
    );

    // Map raw influence by ticker
    const infMap = new Map<string, RawInfluence>();
    for (const r of infRes.rows) infMap.set(r.stock, r);

    // 3) Compute weights
    // Prefer influence proportion_pct; fallback to market_cap if missing.
    const propSum = infRes.rows
      .map((r) => r.proportion_pct ?? 0)
      .reduce((a, b) => a + b, 0);

    const mcapSum = statRes.rows
      .map((r) => r.market_cap ?? 0)
      .reduce((a, b) => a + b, 0);

    const autoscoreRows = statRes.rows.map((s) => {
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

   // ✅ choose ref_price like Excel: Basic (reference price) first, fallback to Open, then Close/Average
      const refPrice = s.basic ?? s.open ?? null;

      // ✅ choose "price" like Excel: Close first, fallback to Average, then Open
      const price = s.close ?? s.average ?? s.open ?? null;

      const high = s.high ?? null;
      const low = s.low ?? null;

      // ✅ Excel-like fallback for change_abs
      const changeAbs =
        s.change_abs ??
        (price != null && refPrice != null ? price - refPrice : null);

      // ✅ Excel-like fallback for change_pct (percent, not ratio)
      const changePct =
        s.change_pct ??
        (changeAbs != null && refPrice != null && refPrice !== 0
          ? (changeAbs / refPrice) * 100
          : null);

      // ✅ flags should treat null as 0 only at the very end (for booleans), not for storing change_pct
      const changePctForFlags = changePct ?? 0;

      // ✅ Value(Bil VND) fix:
      // Your raw total_val is "thousand VND" -> to "bil VND": divide by 1e6
      // Example: 364,340,000 (thousand VND) / 1,000,000 = 364.34 (bil VND)
      const valueBil = toBilVndMixed(s.total_val);

      const rangePos =
        price != null && high != null && low != null && high !== low
          ? clamp01((price - low) / (high - low))
          : 0.5;

      const nearHigh = rangePos >= 0.8 ? 1 : 0;
      const nearLow = rangePos <= 0.2 ? 1 : 0;

      const up = changePctForFlags > 0 ? 1 : 0;
      const down = changePctForFlags < 0 ? 1 : 0;
      const upGt1 = changePctForFlags >= 1 ? 1 : 0;          // ✅ more Excel-ish for ">= 1%"
      const downLtMinus1 = changePctForFlags <= -1 ? 1 : 0;  // ✅ more Excel-ish for "<= -1%"

      const weightedMove = weight * changePctForFlags;

      return {
        ticker: s.symbol,
        ref_price: refPrice,
        price,
        high,
        low,

        change_abs: changeAbs,
        change_pct: changePct,        // ✅ store real pct (can be null if impossible)

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

    // 4) Heavyweight flag = weight >= P80
    const weights = autoscoreRows.map((r) => r.weight);
    const p80 = percentileInc(weights, 0.8);
    for (const r of autoscoreRows) {
      r.is_heavyweight = r.weight >= p80 ? 1 : 0;
    }

    // 5) Write autoscore rows    
    for (const r of autoscoreRows) {
      const isBank = bankSet.has(r.ticker) ? 1 : 0;
      await client.query(
        `
        INSERT INTO autoscore (
          snapshot_id, ticker,
          ref_price, price, high, low,
          change_abs, change_pct,
          volume, value_bil,
          weight, is_bank, is_heavyweight,
          range_pos, near_high, near_low,
          up, down, up_gt_1, down_lt_minus_1,
          weighted_move, weighted_range_pos,
          influence_points, influence_pct, proportion_pct
        ) VALUES (
          $1,$2,
          $3,$4,$5,$6,
          $7,$8,
          $9,$10,
          $11,$12,$13,
          $14,$15,$16,
          $17,$18,$19,$20,
          $21,$22,
          $23,$24,$25
        )
        ON CONFLICT (snapshot_id, ticker)
        DO UPDATE SET
          ref_price=EXCLUDED.ref_price,
          price=EXCLUDED.price,
          high=EXCLUDED.high,
          low=EXCLUDED.low,
          change_abs=EXCLUDED.change_abs,
          change_pct=EXCLUDED.change_pct,
          volume=EXCLUDED.volume,
          value_bil=EXCLUDED.value_bil,
          weight=EXCLUDED.weight,
          is_bank=EXCLUDED.is_bank,
          is_heavyweight=EXCLUDED.is_heavyweight,
          range_pos=EXCLUDED.range_pos,
          near_high=EXCLUDED.near_high,
          near_low=EXCLUDED.near_low,
          up=EXCLUDED.up,
          down=EXCLUDED.down,
          up_gt_1=EXCLUDED.up_gt_1,
          down_lt_minus_1=EXCLUDED.down_lt_minus_1,
          weighted_move=EXCLUDED.weighted_move,
          weighted_range_pos=EXCLUDED.weighted_range_pos,
          influence_points=EXCLUDED.influence_points,
          influence_pct=EXCLUDED.influence_pct,
          proportion_pct=EXCLUDED.proportion_pct
        `,
        [
          snapshotId,
          r.ticker,
          r.ref_price,
          r.price,
          r.high,
          r.low,
          r.change_abs,
          r.change_pct,
          r.volume,
          r.value_bil,
          r.weight,
          isBank,
          r.is_heavyweight,
          r.range_pos,
          r.near_high,
          r.near_low,
          r.up,
          r.down,
          r.up_gt_1,
          r.down_lt_minus_1,
          r.weighted_move,
          r.weighted_range_pos,
          r.influence_points,
          r.influence_pct,
          r.proportion_pct,
        ]
      );
    }

    // 6) Compute dashboard_metrics from autoscoreRows
    const n = autoscoreRows.length || 1;

    const breadthUp = autoscoreRows.reduce((a, r) => a + r.up, 0);
    const breadthDown = autoscoreRows.reduce((a, r) => a + r.down, 0);
    const pctUp = breadthUp / n;
    const pctDown = breadthDown / n;

    const nearHighCount = autoscoreRows.reduce((a, r) => a + r.near_high, 0);
    const nearLowCount = autoscoreRows.reduce((a, r) => a + r.near_low, 0);
    const pctNearHigh = nearHighCount / n;
    const pctNearLow = nearLowCount / n;

    const upGt1Count = autoscoreRows.reduce((a, r) => a + r.up_gt_1, 0);
    const downLtMinus1Count = autoscoreRows.reduce((a, r) => a + r.down_lt_minus_1, 0);

    const weightedMoveSum = autoscoreRows.reduce((a, r) => a + r.weighted_move, 0);

    const heavyweightsWeightedMove = autoscoreRows
      .filter((r) => r.is_heavyweight === 1)
      .reduce((a, r) => a + r.weighted_move, 0);

    const nonHeavyweightsWeightedMove = autoscoreRows
      .filter((r) => r.is_heavyweight === 0)
      .reduce((a, r) => a + r.weighted_move, 0);

    const weightedUpShare = autoscoreRows
      .filter((r) => r.change_pct > 0)
      .reduce((a, r) => a + r.weight, 0);

    const weightedDownShare = autoscoreRows
      .filter((r) => r.change_pct < 0)
      .reduce((a, r) => a + r.weight, 0);

    // Influence concentration-style metrics using influence_points (AutoScore!V logic)
    const absInf = autoscoreRows
      .map((r) => Math.abs(r.influence_points ?? 0))
      .reduce((a, b) => a + b, 0);

    const sortedAbsInf = autoscoreRows
      .map((r) => Math.abs(r.influence_points ?? 0))
      .sort((a, b) => b - a);

    const top3AbsSum = (sortedAbsInf[0] ?? 0) + (sortedAbsInf[1] ?? 0) + (sortedAbsInf[2] ?? 0);
    const top3Share = absInf > 0 ? (100 * top3AbsSum) / absInf : 0;

    const topHeavyweightAbs = autoscoreRows
      .filter((r) => r.is_heavyweight === 1)
      .reduce((a, r) => a + Math.abs(r.influence_points ?? 0), 0);

    const bankAbs = autoscoreRows
      .filter((r) => r.is_bank === 1)
      .reduce((a, r) => a + Math.abs(r.influence_points ?? 0), 0);

    const topHeavyweightInfluenceShare = absInf > 0 ? (100 * topHeavyweightAbs) / absInf : 0;
    const bankShare = absInf > 0 ? (100 * bankAbs) / absInf : 0;

    const propSorted = autoscoreRows
      .map((r) => r.proportion_pct ?? 0)
      .sort((a, b) => b - a);
    const top3ProportionShare = ((propSorted[0] ?? 0) + (propSorted[1] ?? 0) + (propSorted[2] ?? 0)) / 100;

    const infPctSorted = autoscoreRows
      .map((r) => r.influence_pct ?? 0)
      .sort((a, b) => b - a);
    const top3InfluenceShare = (infPctSorted[0] ?? 0) + (infPctSorted[1] ?? 0) + (infPctSorted[2] ?? 0);

    // Index dependency risk (Excel-like): 100*ABS(SUM(V where heavyweight=1))/SUM(ABS(V))
    const sumInfHeavy = autoscoreRows
      .filter((r) => r.is_heavyweight === 1)
      .reduce((a, r) => a + (r.influence_points ?? 0), 0);
    const indexDependencyRisk = absInf > 0 ? (100 * Math.abs(sumInfHeavy)) / absInf : 0;

    // A simple composite proxy (you can replace with your true Excel composite later)
    // Here: weighted move + breadth + concentration (quick heuristic)
    const composite = Math.round(
      50 +
        20 * weightedMoveSum + // trend-ish
        20 * (pctUp - pctDown) - // breadth-ish
        0.2 * top3Share // penalize concentration
    );
    const compositeClamped = Math.max(0, Math.min(100, composite));
    const msiSimple = labelRegime(compositeClamped);

    await client.query(
      `
      INSERT INTO dashboard_metrics (
        snapshot_id,
        breadth_up, breadth_down, pct_up, pct_down,
        near_high_count, near_low_count, pct_near_high, pct_near_low,
        up_gt_1_count, down_lt_minus_1_count,
        weighted_move_sum, heavyweights_weighted_move, non_heavyweights_weighted_move,
        weighted_up_share, weighted_down_share,
        influence_concentration,
        top3_share, top_heavyweight_influence_share, bank_share,
        top3_proportion_share, top3_influence_share,
        rotation_delta, index_dependency_risk,
        msi_simple,
        regime, structure, risk_flag, final_verdict, action_bias, action_why, preferred_setup,
        composite, breadth_score, distortion, weighted_breadth
      ) VALUES (
        $1,
        $2,$3,$4,$5,
        $6,$7,$8,$9,
        $10,$11,
        $12,$13,$14,
        $15,$16,
        $17,
        $18,$19,$20,
        $21,$22,
        $23,$24,
        $25,
        NULL,NULL,NULL,NULL,NULL,NULL,NULL,
        $26,NULL,NULL,NULL
      )
      ON CONFLICT (snapshot_id)
      DO UPDATE SET
        breadth_up=EXCLUDED.breadth_up,
        breadth_down=EXCLUDED.breadth_down,
        pct_up=EXCLUDED.pct_up,
        pct_down=EXCLUDED.pct_down,
        near_high_count=EXCLUDED.near_high_count,
        near_low_count=EXCLUDED.near_low_count,
        pct_near_high=EXCLUDED.pct_near_high,
        pct_near_low=EXCLUDED.pct_near_low,
        up_gt_1_count=EXCLUDED.up_gt_1_count,
        down_lt_minus_1_count=EXCLUDED.down_lt_minus_1_count,
        weighted_move_sum=EXCLUDED.weighted_move_sum,
        heavyweights_weighted_move=EXCLUDED.heavyweights_weighted_move,
        non_heavyweights_weighted_move=EXCLUDED.non_heavyweights_weighted_move,
        weighted_up_share=EXCLUDED.weighted_up_share,
        weighted_down_share=EXCLUDED.weighted_down_share,
        influence_concentration=EXCLUDED.influence_concentration,
        top3_share=EXCLUDED.top3_share,
        top_heavyweight_influence_share=EXCLUDED.top_heavyweight_influence_share,
        bank_share=EXCLUDED.bank_share,
        top3_proportion_share=EXCLUDED.top3_proportion_share,
        top3_influence_share=EXCLUDED.top3_influence_share,
        rotation_delta=EXCLUDED.rotation_delta,
        index_dependency_risk=EXCLUDED.index_dependency_risk,
        msi_simple=EXCLUDED.msi_simple,
        composite=EXCLUDED.composite
      `,
      [
        snapshotId,
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
        top3Share, // placeholder for influence_concentration (can refine later)
        top3Share,
        topHeavyweightInfluenceShare,
        bankShare,
        top3ProportionShare,
        top3InfluenceShare,
        null,
        indexDependencyRisk,
        msiSimple,
        compositeClamped,
      ]
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}