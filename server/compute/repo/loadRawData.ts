import type { PoolClient } from "pg";
import type { RawInfluence, RawStat } from "../domain/types";

export async function getBankTickers(client: PoolClient): Promise<Set<string>> {
  const bankRows = await client.query<{ ticker: string }>(`SELECT ticker FROM settings_bank_ticker`);
  return new Set(bankRows.rows.map((r) => r.ticker));
}

export async function getRawStats(client: PoolClient, snapshotId: number): Promise<RawStat[]> {
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
  return statRes.rows;
}

export async function getRawInfluences(client: PoolClient, snapshotId: number): Promise<RawInfluence[]> {
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
  return infRes.rows;
}
