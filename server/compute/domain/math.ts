export function clamp01(x: number) {
  if (Number.isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

/**
 * Excel-like percentile (PERCENTILE.INC).
 * p=0.8 means 80th percentile inclusive.
 */
export function percentileInc(values: number[], p: number) {
  const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (xs.length === 0) return 0;
  if (p <= 0) return xs[0];
  if (p >= 1) return xs[xs.length - 1];

  const n = xs.length;
  const rank = (n - 1) * p;
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return xs[lo];
  const w = rank - lo;
  return xs[lo] * (1 - w) + xs[hi] * w;
}

export function toBilVndMixed(totalVal: number | null): number | null {
  if (totalVal == null) return null;
  const v = totalVal;

  // If it's huge (e.g., 91252), it's likely "million VND" -> /1000 => bil.
  // If it's already in bil (e.g., 1788.467), keep.
  const abs = Math.abs(v);
  if (abs >= 10_000) return v / 1_000;

  return v;
}

export function labelRegime(score: number) {
  if (score >= 80) return "STRONG BULL";
  if (score >= 70) return "BULL";
  if (score >= 60) return "WEAK BULL";
  if (score >= 45) return "NEUTRAL";
  if (score >= 30) return "DISTRIBUTION";
  return "BEAR";
}
