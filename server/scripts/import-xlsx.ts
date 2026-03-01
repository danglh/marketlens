import XLSX from "xlsx";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required in .env");

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

function num(v: any): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/,/g, "").trim();
  if (!s) return null;
  const pct = s.endsWith("%");
  const n = Number(pct ? s.slice(0, -1) : s);
  if (!Number.isFinite(n)) return null;
  return n;
}

function int(v: any): number | null {
  const n = num(v);
  return n == null ? null : Math.trunc(n);
}

function sheet(wb: XLSX.WorkBook, name: string) {
  const ws = wb.Sheets[name];
  if (!ws) throw new Error(`Missing sheet: ${name}`);
  return XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, any>[];
}

function pick(row: Record<string, any>, keys: string[]) {
  for (const k of keys) {
    if (row[k] !== undefined) return row[k];
  }
  return null;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: tsx server/scripts/import-xlsx.ts <path-to-xlsx>");
    process.exit(1);
  }

  const wb = XLSX.readFile(file);

  const rawStat = sheet(wb, "Raw_VN30_Statistic");
  const rawInf = sheet(wb, "Raw_VN30_Influence");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create a new snapshot
    const snap = await client.query<{ snapshot_id: string }>(
      `INSERT INTO dashboard_snapshot (source, note) VALUES ($1, $2) RETURNING snapshot_id`,
      ["xlsx_import", file]
    );
    const snapshotId = Number(snap.rows[0].snapshot_id);

    // Insert raw_vn30_statistic
    for (const r of rawStat) {
      const symbol = String(
        pick(r, ["Symbol", "symbol", "Stock", "Ticker"])
      ).trim();
      if (!symbol || symbol === "null") continue;

      await client.query(
        `
        INSERT INTO raw_vn30_statistic (
          snapshot_id, symbol,
          basic, open, close, high, low, average,
          change_abs, change_pct,
          order_matching_vol, order_matching_val,
          put_through_vol, put_through_val,
          total_vol, total_val,
          market_cap
        ) VALUES (
          $1,$2,
          $3,$4,$5,$6,$7,$8,
          $9,$10,
          $11,$12,
          $13,$14,
          $15,$16,
          $17
        )
        ON CONFLICT (snapshot_id, symbol)
        DO UPDATE SET
          basic=EXCLUDED.basic,
          open=EXCLUDED.open,
          close=EXCLUDED.close,
          high=EXCLUDED.high,
          low=EXCLUDED.low,
          average=EXCLUDED.average,
          change_abs=EXCLUDED.change_abs,
          change_pct=EXCLUDED.change_pct,
          order_matching_vol=EXCLUDED.order_matching_vol,
          order_matching_val=EXCLUDED.order_matching_val,
          put_through_vol=EXCLUDED.put_through_vol,
          put_through_val=EXCLUDED.put_through_val,
          total_vol=EXCLUDED.total_vol,
          total_val=EXCLUDED.total_val,
          market_cap=EXCLUDED.market_cap
        `,
        [
          snapshotId,
          symbol,
          num(pick(r, ["Basic", "basic"])),
          num(pick(r, ["Open", "open"])),
          num(pick(r, ["Close", "close"])),
          num(pick(r, ["High", "high"])),
          num(pick(r, ["Low", "low"])),
          num(pick(r, ["Average", "average"])),
          num(pick(r, ["Change", "ChangeAbs", "change_abs"])),
          num(pick(r, ["%Change", "ChangePct", "change_pct"])),
          int(pick(r, ["OrderMatchingVol", "Order Matching Vol", "order_matching_vol"])),
          num(pick(r, ["OrderMatchingVal", "Order Matching Val", "order_matching_val"])),
          int(pick(r, ["PutThroughVol", "Put Through Vol", "put_through_vol"])),
          num(pick(r, ["PutThroughVal", "Put Through Val", "put_through_val"])),
          int(pick(r, ["TotalVol", "Total Vol", "total_vol"])),
          num(pick(r, ["TotalVal", "Total Val", "total_val"])),
          num(pick(r, ["MarketCap", "Market Cap", "market_cap"])),
        ]
      );
    }

    // Insert raw_vn30_influence
    for (const r of rawInf) {
      const stock = String(
        pick(r, ["Stock", "stock", "Symbol", "Ticker"])
      ).trim();
      if (!stock || stock === "null") continue;

      await client.query(
        `
        INSERT INTO raw_vn30_influence (
          snapshot_id, stock,
          price, change_text, outstanding_shares, market_cap,
          proportion_pct, influence_pct, influence_points
        ) VALUES (
          $1,$2,
          $3,$4,$5,$6,
          $7,$8,$9
        )
        ON CONFLICT (snapshot_id, stock)
        DO UPDATE SET
          price=EXCLUDED.price,
          change_text=EXCLUDED.change_text,
          outstanding_shares=EXCLUDED.outstanding_shares,
          market_cap=EXCLUDED.market_cap,
          proportion_pct=EXCLUDED.proportion_pct,
          influence_pct=EXCLUDED.influence_pct,
          influence_points=EXCLUDED.influence_points
        `,
        [
          snapshotId,
          stock,
          num(pick(r, ["Price", "price"])),
          pick(r, ["Change", "change"]) ?? null,
          int(pick(r, ["OutstandingShares", "Outstanding Shares", "outstanding_shares"])),
          //num(pick(r, ["MarketCap", "Market Cap", "market_cap"])),
          num(pick(r, ["Market Cap.", "Market Cap"])),
          num(pick(r, ["Proportion"])),
          num(pick(r, ["%influence", "%Influence"])),
          num(pick(r, ["Influence points", "Influence Points"]))
          // num(pick(r, ["Proportion", "proportion_pct"])),
          // num(pick(r, ["%Influence", "InfluencePct", "influence_pct"])),
          // num(pick(r, ["InfluencePoints", "Influence Points", "influence_points"])),
        ]
      );
    }

    await client.query("COMMIT");
    console.log(`✅ Imported raw sheets into snapshot_id=${snapshotId}`);
    console.log("Next: run compute step to fill autoscore + dashboard_metrics.");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("❌ Import failed:", e);
  process.exit(1);
});