// server/scripts/import-cli.ts
import { importExcelToSnapshot } from "../import/importExcel";

function getArg(flag: string) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

async function main() {
  const file = getArg("--file");
  if (!file) {
    console.error("Usage: npm run import:xlsx -- --file /path/to/_VN30_AutoScore_PRO.xlsx");
    process.exit(1);
  }

  const { snapshotId } = await importExcelToSnapshot(file);
  console.log("Imported snapshot:", snapshotId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});