import { pool } from "../db/pool";
import { buildAutoscoreRows } from "./domain/buildAutoscoreRows";
import { calcDashboardMetrics } from "./domain/calcDashboardMetrics";
import { getBankTickers, getRawInfluences, getRawStats } from "./repo/loadRawData";
import { upsertAutoscoreRows } from "./repo/saveAutoscore";
import { upsertDashboardMetrics } from "./repo/saveDashboardMetrics";

export async function computeSnapshot(snapshotId: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const bankSet = await getBankTickers(client);
    const stats = await getRawStats(client, snapshotId);
    const influences = await getRawInfluences(client, snapshotId);

    const autoscoreRows = buildAutoscoreRows({
      stats,
      influences,
      bankSet,
    });

    await upsertAutoscoreRows(client, snapshotId, autoscoreRows);

    const dashboardMetrics = calcDashboardMetrics(autoscoreRows);
    await upsertDashboardMetrics(client, snapshotId, dashboardMetrics);

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
