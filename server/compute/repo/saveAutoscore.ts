import type { PoolClient } from "pg";
import type { AutoScoreRow } from "../domain/types";

export async function upsertAutoscoreRows(
  client: PoolClient,
  snapshotId: number,
  autoscoreRows: AutoScoreRow[]
) {
  for (const r of autoscoreRows) {
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
        r.is_bank,
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
}
