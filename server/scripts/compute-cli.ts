// server/scripts/compute-cli.ts
import dotenv from "dotenv";
dotenv.config();

import { computeSnapshot } from "../compute/computeSnapshot.js";

function getArg(flag: string) {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : null;
}

async function main() {
  const idStr = getArg("--snapshot") ?? process.argv[2];
  if (!idStr) {
    console.error("Usage: npm run compute -- --snapshot 1");
    process.exit(1);
  }
  const snapshotId = Number(idStr);
  if (!Number.isFinite(snapshotId)) {
    console.error("snapshot must be a number");
    process.exit(1);
  }

  await computeSnapshot(snapshotId);
  console.log(`✅ Computed autoscore + dashboard_metrics for snapshot_id=${snapshotId}`);
}

main().catch((e) => {
  console.error("❌ Compute failed:", e);
  process.exit(1);
});