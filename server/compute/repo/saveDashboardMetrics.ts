import type { PoolClient } from "pg";
import type { DashboardMetricsComputed } from "../domain/types";

export async function upsertDashboardMetrics(
  client: PoolClient,
  snapshotId: number,
  m: DashboardMetricsComputed
) {
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
      m.breadthUp,
      m.breadthDown,
      m.pctUp,
      m.pctDown,
      m.nearHighCount,
      m.nearLowCount,
      m.pctNearHigh,
      m.pctNearLow,
      m.upGt1Count,
      m.downLtMinus1Count,
      m.weightedMoveSum,
      m.heavyweightsWeightedMove,
      m.nonHeavyweightsWeightedMove,
      m.weightedUpShare,
      m.weightedDownShare,
      m.influenceConcentration,
      m.top3Share,
      m.topHeavyweightInfluenceShare,
      m.bankShare,
      m.top3ProportionShare,
      m.top3InfluenceShare,
      m.rotationDelta,
      m.indexDependencyRisk,
      m.msiSimple,
      m.compositeClamped,
    ]
  );
}
