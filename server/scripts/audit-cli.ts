// server/scripts/audit-cli.ts
/* eslint-disable no-console */
import "dotenv/config";
import { Client } from "pg";

type AuditRow = {
  n_rows: number;

  check_row_count: "PASS" | "FAIL";

  check_sum_weight_1: "PASS" | "FAIL";
  sum_weight: number;
  min_weight: number;
  max_weight: number;

  check_change_pct_not_null: "PASS" | "FAIL";
  null_change_pct: number;

  check_change_abs_not_null: "PASS" | "FAIL";
  null_change_abs: number;

  check_value_bil_scale: "PASS" | "FAIL";
  still_too_big: number;
  max_value_bil: number;
  null_value_bil: number;

  check_range_pos_0_1: "PASS" | "FAIL";
  bad_range_pos: number;
  min_range_pos: number;
  max_range_pos: number;

  check_binary_flags: "PASS" | "FAIL";
  bad_near_high: number;
  bad_near_low: number;
  bad_up: number;
  bad_down: number;
  bad_up_gt_1: number;
  bad_down_lt_minus_1: number;

  check_class_flags: "PASS" | "FAIL";
  bad_is_bank: number;
  bad_is_heavyweight: number;
  heavy_count: number;

  check_updown_consistency: "PASS" | "FAIL";
  bad_updown_pos: number;
  bad_updown_neg: number;
  bad_updown_zero: number;

  check_weighted_move_math: "PASS" | "FAIL";
  bad_weighted_move: number;

  check_weighted_range_pos_math: "PASS" | "FAIL";
  bad_weighted_range_pos: number;

  check_influence_completeness: "PASS" | "WARN" | "FAIL";
  null_influence_points: number;
  null_influence_pct: number;
  null_proportion_pct: number;
};

const SQL = `
-- VN30 AutoScore Audit (one-shot)
-- change snapshot id here:
WITH params AS (
  SELECT $1::bigint AS snapshot_id
),
a AS (
  SELECT *
  FROM autoscore
  WHERE snapshot_id = (SELECT snapshot_id FROM params)
),
stats AS (
  SELECT
    COUNT(*)::int                                 AS n_rows,
    SUM(weight)::double precision                  AS sum_weight,
    MIN(weight)::double precision                  AS min_weight,
    MAX(weight)::double precision                  AS max_weight,

    COUNT(*) FILTER (WHERE change_pct IS NULL)::int AS null_change_pct,
    COUNT(*) FILTER (WHERE change_abs IS NULL)::int AS null_change_abs,

    COUNT(*) FILTER (WHERE value_bil IS NULL)::int  AS null_value_bil,
    COUNT(*) FILTER (WHERE value_bil > 10000)::int  AS still_too_big,
    MAX(value_bil)::double precision               AS max_value_bil,

    COUNT(*) FILTER (WHERE range_pos < 0 OR range_pos > 1)::int AS bad_range_pos,
    MIN(range_pos)::double precision               AS min_range_pos,
    MAX(range_pos)::double precision               AS max_range_pos,

    COUNT(*) FILTER (WHERE near_high NOT IN (0,1))::int AS bad_near_high,
    COUNT(*) FILTER (WHERE near_low  NOT IN (0,1))::int AS bad_near_low,
    COUNT(*) FILTER (WHERE up        NOT IN (0,1))::int AS bad_up,
    COUNT(*) FILTER (WHERE down      NOT IN (0,1))::int AS bad_down,
    COUNT(*) FILTER (WHERE up_gt_1   NOT IN (0,1))::int AS bad_up_gt_1,
    COUNT(*) FILTER (WHERE down_lt_minus_1 NOT IN (0,1))::int AS bad_down_lt_minus_1,

    COUNT(*) FILTER (WHERE is_bank NOT IN (0,1))::int        AS bad_is_bank,
    COUNT(*) FILTER (WHERE is_heavyweight NOT IN (0,1))::int AS bad_is_heavyweight,
    SUM(is_heavyweight)::int                                  AS heavy_count,

    -- consistency checks
    COUNT(*) FILTER (WHERE change_pct > 0 AND (up <> 1 OR down <> 0))::int AS bad_updown_pos,
    COUNT(*) FILTER (WHERE change_pct < 0 AND (down <> 1 OR up <> 0))::int AS bad_updown_neg,
    COUNT(*) FILTER (WHERE change_pct = 0 AND (up <> 0 OR down <> 0))::int AS bad_updown_zero,

    -- weighted_move should ~ weight * change_pct (tolerance for float rounding)
    COUNT(*) FILTER (
      WHERE ABS((weighted_move) - (weight * COALESCE(change_pct,0))) > 1e-9
    )::int AS bad_weighted_move,

    -- weighted_range_pos should ~ weight * range_pos
    COUNT(*) FILTER (
      WHERE ABS((weighted_range_pos) - (weight * range_pos)) > 1e-9
    )::int AS bad_weighted_range_pos,

    -- influence sanity (optional: allow nulls if you don't have influence for a ticker)
    COUNT(*) FILTER (WHERE influence_points IS NULL)::int AS null_influence_points,
    COUNT(*) FILTER (WHERE influence_pct    IS NULL)::int AS null_influence_pct,
    COUNT(*) FILTER (WHERE proportion_pct   IS NULL)::int AS null_proportion_pct
  FROM a
),
passfail AS (
  SELECT
    n_rows,

    -- Core expectations
    CASE WHEN n_rows = 30 THEN 'PASS' ELSE 'FAIL' END AS check_row_count,

    CASE WHEN ABS(sum_weight - 1.0) < 1e-9 THEN 'PASS' ELSE 'FAIL' END AS check_sum_weight_1,
    sum_weight, min_weight, max_weight,

    CASE WHEN null_change_pct = 0 THEN 'PASS' ELSE 'FAIL' END AS check_change_pct_not_null,
    null_change_pct,
    CASE WHEN null_change_abs = 0 THEN 'PASS' ELSE 'FAIL' END AS check_change_abs_not_null,
    null_change_abs,

    CASE WHEN still_too_big = 0 THEN 'PASS' ELSE 'FAIL' END AS check_value_bil_scale,
    still_too_big, max_value_bil, null_value_bil,

    CASE WHEN bad_range_pos = 0 THEN 'PASS' ELSE 'FAIL' END AS check_range_pos_0_1,
    bad_range_pos, min_range_pos, max_range_pos,

    CASE WHEN (bad_near_high + bad_near_low + bad_up + bad_down + bad_up_gt_1 + bad_down_lt_minus_1) = 0
         THEN 'PASS' ELSE 'FAIL' END AS check_binary_flags,
    bad_near_high, bad_near_low, bad_up, bad_down, bad_up_gt_1, bad_down_lt_minus_1,

    CASE WHEN (bad_is_bank + bad_is_heavyweight) = 0 THEN 'PASS' ELSE 'FAIL' END AS check_class_flags,
    bad_is_bank, bad_is_heavyweight, heavy_count,

    CASE WHEN (bad_updown_pos + bad_updown_neg + bad_updown_zero) = 0 THEN 'PASS' ELSE 'FAIL' END AS check_updown_consistency,
    bad_updown_pos, bad_updown_neg, bad_updown_zero,

    CASE WHEN bad_weighted_move = 0 THEN 'PASS' ELSE 'FAIL' END AS check_weighted_move_math,
    bad_weighted_move,

    CASE WHEN bad_weighted_range_pos = 0 THEN 'PASS' ELSE 'FAIL' END AS check_weighted_range_pos_math,
    bad_weighted_range_pos,

    -- optional: influence completeness (pass if you expect all 30 present)
    CASE WHEN (null_influence_points + null_influence_pct + null_proportion_pct) = 0 THEN 'PASS' ELSE 'WARN' END AS check_influence_completeness,
    null_influence_points, null_influence_pct, null_proportion_pct
  FROM stats
)
SELECT * FROM passfail;
`;

function envDbUrl(): string {
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL (or NEON_DATABASE_URL).");
  }
  return url;
}

function parseSnapshotId(argv: string[]): bigint {
  // usage: node ... --snapshot 6
  const idx = argv.findIndex((x) => x === "--snapshot" || x === "-s");
  if (idx >= 0 && argv[idx + 1]) return BigInt(argv[idx + 1]);

  // allow positional: node ... 6
  const pos = argv.find((x) => /^\d+$/.test(x));
  if (pos) return BigInt(pos);

  return 6n; // default same as your text
}

function icon(status: string): string {
  if (status === "PASS") return "✅";
  if (status === "WARN") return "⚠️";
  return "❌";
}

function fmt(n: number, digits = 3): string {
  if (Number.isFinite(n)) return n.toFixed(digits);
  return String(n);
}

function almostEquals(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) < eps;
}

function printLine(label: string, status: "PASS" | "WARN" | "FAIL", detail?: string) {
  const right = detail ? ` (${detail})` : "";
  console.log(`${label} ${status} ${icon(status)}${right}`);
}

function aggregateExit(row: AuditRow): number {
  const statuses: Array<string> = [
    row.check_row_count,
    row.check_sum_weight_1,
    row.check_change_pct_not_null,
    row.check_change_abs_not_null,
    row.check_value_bil_scale,
    row.check_range_pos_0_1,
    row.check_binary_flags,
    row.check_class_flags,
    row.check_updown_consistency,
    row.check_weighted_move_math,
    row.check_weighted_range_pos_math,
    // influence completeness is allowed WARN (doesn't fail)
  ];

  return statuses.includes("FAIL") ? 1 : 0;
}

async function resolveSnapshotId(
  client: Client,
  argv: string[]
): Promise<bigint> {
  const args = argv;

  // --latest
  if (args.includes("--latest")) {
    const r = await client.query<{ max: string | null }>(
      `SELECT MAX(snapshot_id)::text AS max FROM autoscore`
    );
    const max = r.rows[0]?.max;
    if (!max) throw new Error("No snapshot found in autoscore.");
    console.log(`Auto-detected latest snapshot_id = ${max}`);
    return BigInt(max);
  }

  // --snapshot 7
  const idx = args.findIndex((x) => x === "--snapshot" || x === "-s");
  if (idx >= 0 && args[idx + 1]) return BigInt(args[idx + 1]);

  // positional
  const pos = args.find((x) => /^\d+$/.test(x));
  if (pos) return BigInt(pos);

  // default fallback
  return 6n;
}

async function main() {
  const client = new Client({
    connectionString: envDbUrl(),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    const snapshotId = await resolveSnapshotId(
      client,
      process.argv.slice(2)
    );

    const res = await client.query<AuditRow>(SQL, [
      snapshotId.toString(),
    ]);

    const row = res.rows[0];
    if (!row) throw new Error("Audit query returned 0 rows.");

    console.log(`\nVN30 AutoScore Audit (snapshot_id = ${snapshotId})`);
    console.log("=".repeat(44));

    // 1) Row count
    printLine(
      `Row count = ${row.n_rows}`,
      row.check_row_count,
      "đúng VN30"
    );

    // 2) SUM(weight)
    const sumWeightDetail = `${row.sum_weight}`;
    const sumWeightOk = row.check_sum_weight_1 === "PASS" || almostEquals(row.sum_weight, 1.0, 1e-9);
    printLine(
      `SUM(weight) = ${row.sum_weight}`,
      sumWeightOk ? "PASS" : "FAIL",
      sumWeightOk ? "floating rounding thôi, coi như 1.0" : `min=${row.min_weight} max=${row.max_weight}`
    );

    // 3) change_abs / change_pct null
    printLine(
      `change_abs / change_pct null = ${row.null_change_abs + row.null_change_pct}`,
      row.check_change_abs_not_null === "PASS" && row.check_change_pct_not_null === "PASS" ? "PASS" : "FAIL",
      `null_change_abs=${row.null_change_abs}, null_change_pct=${row.null_change_pct}`
    );

    // 4) value_bil scale
    printLine(
      `Value(bil) scale OK`,
      row.check_value_bil_scale,
      `still_too_big=${row.still_too_big}, max_value_bil=${fmt(row.max_value_bil, 3)}`
    );

    // 5) range_pos
    printLine(
      `range_pos trong [0..1]`,
      row.check_range_pos_0_1,
      `bad=${row.bad_range_pos}, min=${fmt(row.min_range_pos, 6)}, max=${fmt(row.max_range_pos, 6)}`
    );

    // 6) binary flags
    const badBinary =
      row.bad_near_high +
      row.bad_near_low +
      row.bad_up +
      row.bad_down +
      row.bad_up_gt_1 +
      row.bad_down_lt_minus_1;
    printLine(
      `binary flags (near_high/near_low/up/down/up_gt_1/down_lt_minus_1) sạch`,
      row.check_binary_flags,
      `bad_total=${badBinary}`
    );

    // 7) class flags
    printLine(
      `class flags (is_bank/is_heavyweight) sạch`,
      row.check_class_flags,
      `bad_is_bank=${row.bad_is_bank}, bad_is_heavyweight=${row.bad_is_heavyweight}`
    );

    // 8) heavy_count
    printLine(
      `heavy_count = ${row.heavy_count}`,
      row.heavy_count === 6 ? "PASS" : "FAIL",
      "đúng 80th percentile kiểu Excel"
    );

    // 9) weighted_move
    printLine(
      `weighted_move đúng công thức`,
      row.check_weighted_move_math,
      `bad=${row.bad_weighted_move}`
    );

    // 10) weighted_range_pos
    printLine(
      `weighted_range_pos đúng công thức`,
      row.check_weighted_range_pos_math,
      `bad=${row.bad_weighted_range_pos}`
    );

    // 11) up/down consistency
    const badUpDown = row.bad_updown_pos + row.bad_updown_neg + row.bad_updown_zero;
    printLine(
      `up/down consistency`,
      row.check_updown_consistency,
      `bad_total=${badUpDown}`
    );

    // 12) influence completeness
    const nullInfluence =
      row.null_influence_points + row.null_influence_pct + row.null_proportion_pct;
    const influenceStatus = row.check_influence_completeness;
    printLine(
      `influence completeness = ${influenceStatus}`,
      influenceStatus,
      `null_total=${nullInfluence}`
    );

    const exitCode = aggregateExit(row);
    console.log("=".repeat(44));
    console.log(exitCode === 0 ? "AUDIT RESULT: PASS ✅\n" : "AUDIT RESULT: FAIL ❌\n");
    process.exitCode = exitCode;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("\nAUDIT ERROR ❌");
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 2;
});