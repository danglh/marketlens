import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { pool } from './db/pool';

type SeedMetrics = {
  breadth_up: number;
  breadth_down: number;
  pct_up: number;
  pct_down: number;
  near_high_count: number;
  near_low_count: number;
  pct_near_high: number;
  pct_near_low: number;
  up_gt_1_count: number;
  down_lt_minus_1_count: number;
  weighted_move_sum: number;
  heavyweights_weighted_move: number;
  non_heavyweights_weighted_move: number;
  weighted_up_share: number;
  weighted_down_share: number;
  influence_concentration: number;
  top3_share: number;
  top_heavyweight_influence_share: number;
  bank_share: number;
  top3_proportion_share: number;
  top3_influence_share: number;
  rotation_delta: number;
  index_dependency_risk: number;
  msi_simple: string;
  msi_score: number;
  composite: number;
  breadth_score: number;
  distortion: number;
  weighted_breadth: number;
  bulltrap: string;
  washout: string;
  squeeze: string;
  regime: string;
  structure: string;
  risk_flag: string;
  final_verdict: string;
  action_bias: string;
  action_why: string;
  preferred_setup: string;
};

const seed: SeedMetrics = {
  breadth_up: 10,
  breadth_down: 19,
  pct_up: 0.3333333333333333,
  pct_down: 0.6333333333333333,
  near_high_count: 3,
  near_low_count: 14,
  pct_near_high: 0.1,
  pct_near_low: 0.4666666666666667,
  up_gt_1_count: 4,
  down_lt_minus_1_count: 12,
  weighted_move_sum: -0.2661066168623449,
  heavyweights_weighted_move: 0.24155806289596674,
  non_heavyweights_weighted_move: -0.5076646797583115,
  weighted_up_share: 0.3997242627828537,
  weighted_down_share: 0.5789975014067665,
  influence_concentration: 57,
  top3_share: 43,
  top_heavyweight_influence_share: 50,
  bank_share: 26,
  top3_proportion_share: 0.279833,
  top3_influence_share: 0.68,
  rotation_delta: 40.0167,
  index_dependency_risk: 11,
  msi_simple: 'DISTRIBUTION',
  msi_score: 41,
  composite: 37,
  breadth_score: 35,
  distortion: 57.49222742654278,
  weighted_breadth: 40,
  bulltrap: 'LOW',
  washout: 'LOW',
  squeeze: 'LOW',
  regime: 'DISTRIBUTION',
  structure: 'Risk-off',
  risk_flag: 'Risk contained',
  final_verdict: 'DISTRIBUTION | Risk-off | Risk contained | WAIT CONFIRMATION',
  action_bias: 'WAIT CONFIRMATION',
  action_why: 'WHY: Participation not strong / low dependency / top3 too dominant',
  preferred_setup: 'WAIT / OBSERVE',
};

function num(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

async function initializeSchema() {
  const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'server/db/schema.sql'), 'utf-8');
  await pool.query(schemaSql);
}

async function seedIfEmpty() {
  const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM dashboard_metrics');
  if ((countResult.rows[0]?.count ?? 0) > 0) {
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const snapshotResult = await client.query(
      'INSERT INTO dashboard_snapshot (source, note) VALUES ($1, $2) RETURNING snapshot_id',
      ['dashboard_sheet_seed', 'seeded from Dashboard sheet values'],
    );
    const snapshotId = Number(snapshotResult.rows[0].snapshot_id);

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
        msi_simple, msi_score, composite, breadth_score, distortion, weighted_breadth,
        bulltrap, washout, squeeze,
        regime, structure, risk_flag, final_verdict, action_bias, action_why, preferred_setup
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
        $25,$26,$27,$28,$29,$30,
        $31,$32,$33,
        $34,$35,$36,$37,$38,$39,$40
      )
      ON CONFLICT (snapshot_id) DO UPDATE SET
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
        msi_score=EXCLUDED.msi_score,
        composite=EXCLUDED.composite,
        breadth_score=EXCLUDED.breadth_score,
        distortion=EXCLUDED.distortion,
        weighted_breadth=EXCLUDED.weighted_breadth,
        bulltrap=EXCLUDED.bulltrap,
        washout=EXCLUDED.washout,
        squeeze=EXCLUDED.squeeze,
        regime=EXCLUDED.regime,
        structure=EXCLUDED.structure,
        risk_flag=EXCLUDED.risk_flag,
        final_verdict=EXCLUDED.final_verdict,
        action_bias=EXCLUDED.action_bias,
        action_why=EXCLUDED.action_why,
        preferred_setup=EXCLUDED.preferred_setup
      `,
      [
        snapshotId,
        seed.breadth_up,
        seed.breadth_down,
        seed.pct_up,
        seed.pct_down,
        seed.near_high_count,
        seed.near_low_count,
        seed.pct_near_high,
        seed.pct_near_low,
        seed.up_gt_1_count,
        seed.down_lt_minus_1_count,
        seed.weighted_move_sum,
        seed.heavyweights_weighted_move,
        seed.non_heavyweights_weighted_move,
        seed.weighted_up_share,
        seed.weighted_down_share,
        seed.influence_concentration,
        seed.top3_share,
        seed.top_heavyweight_influence_share,
        seed.bank_share,
        seed.top3_proportion_share,
        seed.top3_influence_share,
        seed.rotation_delta,
        seed.index_dependency_risk,
        seed.msi_simple,
        seed.msi_score,
        seed.composite,
        seed.breadth_score,
        seed.distortion,
        seed.weighted_breadth,
        seed.bulltrap,
        seed.washout,
        seed.squeeze,
        seed.regime,
        seed.structure,
        seed.risk_flag,
        seed.final_verdict,
        seed.action_bias,
        seed.action_why,
        seed.preferred_setup,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getLatestDashboardMetrics() {
  const result = await pool.query(`
    SELECT
      s.snapshot_id AS "snapshotId",
      s.captured_at AS "capturedAt",
      m.*
    FROM dashboard_snapshot s
    JOIN dashboard_metrics m ON m.snapshot_id = s.snapshot_id
    ORDER BY s.snapshot_id DESC
    LIMIT 1
  `);

  if (result.rowCount === 0) {
    throw new Error('No dashboard_metrics available');
  }

  return result.rows[0];
}

const app = express();
const port = Number(process.env.API_PORT ?? 4000);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/dashboard/key-metrics', async (_req, res) => {
  try {
    const m = await getLatestDashboardMetrics();

    res.json({
      snapshotId: m.snapshotId,
      capturedAt: m.capturedAt,
      breadthUp: num(m.breadth_up),
      breadthDown: num(m.breadth_down),
      pctUp: num(m.pct_up),
      pctDown: num(m.pct_down),
      nearHighCount: num(m.near_high_count),
      nearLowCount: num(m.near_low_count),
      pctNearHigh: num(m.pct_near_high),
      pctNearLow: num(m.pct_near_low),
      upGt1Count: num(m.up_gt_1_count),
      downLtMinus1Count: num(m.down_lt_minus_1_count),
      weightedUpShare: num(m.weighted_up_share),
      weightedDownShare: num(m.weighted_down_share),
      heavyweightsWeightedMove: num(m.heavyweights_weighted_move),
      nonHeavyweightsWeightedMove: num(m.non_heavyweights_weighted_move),
      msiSimple: text(m.msi_simple),
    });
  } catch {
    res.status(500).json({ error: 'Failed to load key metrics' });
  }
});

app.get('/api/dashboard/market-snapshot', async (_req, res) => {
  try {
    const m = await getLatestDashboardMetrics();

    res.json({
      snapshotId: m.snapshotId,
      capturedAt: m.capturedAt,
      upPercent: num(m.pct_up) * 100,
      downPercent: num(m.pct_down) * 100,
      nearHighPercent: num(m.pct_near_high) * 100,
      nearLowPercent: num(m.pct_near_low) * 100,
      upGt1Count: num(m.up_gt_1_count),
      downLtMinus1Count: num(m.down_lt_minus_1_count),
      weightedUpShare: num(m.weighted_up_share),
      weightedDownShare: num(m.weighted_down_share),
      heavyweightsWeightedMove: num(m.heavyweights_weighted_move),
      nonHeavyweightsWeightedMove: num(m.non_heavyweights_weighted_move),
      msiSimple: text(m.msi_simple),
    });
  } catch {
    res.status(500).json({ error: 'Failed to load market snapshot' });
  }
});

app.get('/api/dashboard/market-health', async (_req, res) => {
  try {
    const m = await getLatestDashboardMetrics();

    res.json({
      snapshotId: m.snapshotId,
      capturedAt: m.capturedAt,
      msiScore: num(m.msi_score, num(m.composite)),
      composite: num(m.composite),
      breadthScore: num(m.breadth_score),
      distortion: num(m.distortion),
      weightedBreadth: num(m.weighted_breadth),
      influenceConcentration: num(m.influence_concentration),
      top3Share: num(m.top3_share),
      topHeavyweightInfluenceShare: num(m.top_heavyweight_influence_share),
      bankShare: num(m.bank_share),
      top3ProportionShare: num(m.top3_proportion_share),
      top3InfluenceShare: num(m.top3_influence_share),
      rotationDelta: num(m.rotation_delta),
      indexDependencyRisk: num(m.index_dependency_risk),
      bulltrap: text(m.bulltrap),
      washout: text(m.washout),
      squeeze: text(m.squeeze),
      regime: text(m.regime, text(m.msi_simple)),
      structure: text(m.structure),
      riskFlag: text(m.risk_flag),
      finalVerdict: text(m.final_verdict),
      actionBias: text(m.action_bias),
      actionWhy: text(m.action_why),
      preferredSetup: text(m.preferred_setup),
    });
  } catch {
    res.status(500).json({ error: 'Failed to load market health' });
  }
});

async function start() {
  await initializeSchema();
  await seedIfEmpty();

  app.listen(port, () => {
    console.log(`Dashboard API listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('API startup failed', error);
  process.exit(1);
});
