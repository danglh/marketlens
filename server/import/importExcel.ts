// server/import/importExcel.ts
import * as XLSX from "xlsx";
import { pool } from "../db/pool";
import { computeSnapshot } from "../compute/computeSnapshot";

function toNumber(v: any): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  // handle "123,456" and "123.45%" etc
  const s = String(v).replaceAll(/,/g, "").trim();
  if (!s) return null;
  const pct = s.endsWith("%");
  const num = Number(pct ? s.slice(0, -1) : s);
  if (!Number.isFinite(num)) return null;
  return pct ? num / 100 : num;
}

function toBigInt(v: any): number | null {
  const n = toNumber(v);
  if (n == null) return null;
  return Math.trunc(n);
}

type SheetRow = Record<string, any>;

function readSheet(wb: XLSX.WorkBook, name: string): SheetRow[] {
  const ws = wb.Sheets[name];
  if (!ws) throw new Error(`Missing sheet: ${name}`);
  return XLSX.utils.sheet_to_json(ws, { defval: null });
}

export async function importExcelToSnapshot(filePath: string) {
  const wb = XLSX.readFile(filePath);

  const rawStat = readSheet(wb, "Raw_VN30_Statistic");
  const rawInf = readSheet(wb, "Raw_VN30_Influence");

  // Settings bank tickers (optional but recommended)
  const hasSettings = Boolean(wb.Sheets["Settings"]);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const snap = await client.query<{ snapshot_id: string }>(
      `INSERT INTO dashboard_snapshot (source, note) VALUES ($1, $2) RETURNING snapshot_id`,
      ["xlsx_import", filePath]
    );
    const snapshotId = Number(snap.rows[0].snapshot_id);

    // Insert bank tickers if sheet exists
    if (hasSettings) {
      const settingsRows = readSheet(wb, "Settings");
      // Expect a column like "Bank" / "Ticker". If unknown, we best-effort scan.
      const tickers: string[] = [];
      for (const r of settingsRows) {
        const vals = Object.values(r)
          .map((x) => (x == null ? "" : String(x).trim()))
          .filter(Boolean);
        for (const v of vals) {
          // simple ticker pattern (VN stocks)
          if (/^[A-Z]{3,4}$/.test(v)) tickers.push(v);
        }
      }

      // Dedup and upsert
      const unique = Array.from(new Set(tickers));
      for (const t of unique) {
        await client.query(
          `INSERT INTO settings_bank_ticker (ticker) VALUES ($1)
           ON CONFLICT (ticker) DO NOTHING`,
          [t]
        );
      }
    }

    // Insert raw_vn30_statistic
    // Column names in XLSX might not match exactly; adjust mapping here if needed.
    for (const r of rawStat) {
      const symbol = String(r["Symbol"] ?? r["symbol"] ?? r["Stock"] ?? r["Ticker"] ?? "").trim();
      if (!symbol) continue;

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
          toNumber(r["Basic"] ?? r["basic"]),
          toNumber(r["Open"] ?? r["open"]),
          toNumber(r["Close"] ?? r["close"]),
          toNumber(r["High"] ?? r["high"]),
          toNumber(r["Low"] ?? r["low"]),
          toNumber(r["Average"] ?? r["average"]),
          toNumber(r["Change"] ?? r["change_abs"] ?? r["ChangeAbs"]),
          toNumber(r["%Change"] ?? r["change_pct"] ?? r["ChangePct"]),
          toBigInt(r["OrderMatchingVol"] ?? r["Order Matching Vol"] ?? r["order_matching_vol"]),
          toNumber(r["OrderMatchingVal"] ?? r["Order Matching Val"] ?? r["order_matching_val"]),
          toBigInt(r["PutThroughVol"] ?? r["Put Through Vol"] ?? r["put_through_vol"]),
          toNumber(r["PutThroughVal"] ?? r["Put Through Val"] ?? r["put_through_val"]),
          toBigInt(r["TotalVol"] ?? r["Total Vol"] ?? r["total_vol"]),
          toNumber(r["TotalVal"] ?? r["Total Val"] ?? r["total_val"]),
          toNumber(r["MarketCap"] ?? r["Market Cap"] ?? r["market_cap"]),
        ]
      );
    }

    // Insert raw_vn30_influence
    for (const r of rawInf) {
      const stock = String(r["Stock"] ?? r["stock"] ?? r["Symbol"] ?? r["Ticker"] ?? "").trim();
      if (!stock) continue;

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
          toNumber(r["Price"] ?? r["price"]),
          r["Change"] ?? r["change"] ?? null,
          toBigInt(r["OutstandingShares"] ?? r["Outstanding Shares"] ?? r["outstanding_shares"]),
          toNumber(r["MarketCap"] ?? r["Market Cap"] ?? r["market_cap"]),
          toNumber(r["Proportion"] ?? r["proportion_pct"]),
          toNumber(r["%Influence"] ?? r["InfluencePct"] ?? r["influence_pct"]),
          toNumber(r["InfluencePoints"] ?? r["Influence Points"] ?? r["influence_points"]),
        ]
      );
    }

    await client.query("COMMIT");

    // compute autoscore + dashboard metrics
    await computeSnapshot(snapshotId);

    return { snapshotId };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}