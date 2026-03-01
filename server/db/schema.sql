CREATE TABLE IF NOT EXISTS dashboard_snapshot (
  snapshot_id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'dashboard_sheet',
  note TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings_bank_ticker (
  ticker TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS raw_vn30_statistic (
  snapshot_id BIGINT NOT NULL REFERENCES dashboard_snapshot(snapshot_id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  basic DOUBLE PRECISION,
  open DOUBLE PRECISION,
  close DOUBLE PRECISION,
  high DOUBLE PRECISION,
  low DOUBLE PRECISION,
  average DOUBLE PRECISION,
  change_abs DOUBLE PRECISION,
  change_pct DOUBLE PRECISION,
  order_matching_vol BIGINT,
  order_matching_val DOUBLE PRECISION,
  put_through_vol BIGINT,
  put_through_val DOUBLE PRECISION,
  total_vol BIGINT,
  total_val DOUBLE PRECISION,
  market_cap DOUBLE PRECISION,
  PRIMARY KEY (snapshot_id, symbol)
);

CREATE TABLE IF NOT EXISTS raw_vn30_influence (
  snapshot_id BIGINT NOT NULL REFERENCES dashboard_snapshot(snapshot_id) ON DELETE CASCADE,
  stock TEXT NOT NULL,
  price DOUBLE PRECISION,
  change_text TEXT,
  outstanding_shares BIGINT,
  market_cap DOUBLE PRECISION,
  proportion_pct DOUBLE PRECISION,
  influence_pct DOUBLE PRECISION,
  influence_points DOUBLE PRECISION,
  PRIMARY KEY (snapshot_id, stock)
);

CREATE TABLE IF NOT EXISTS autoscore (
  snapshot_id BIGINT NOT NULL REFERENCES dashboard_snapshot(snapshot_id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  ref_price DOUBLE PRECISION,
  price DOUBLE PRECISION,
  high DOUBLE PRECISION,
  low DOUBLE PRECISION,
  change_abs DOUBLE PRECISION,
  change_pct DOUBLE PRECISION,
  volume BIGINT,
  value_bil DOUBLE PRECISION,
  weight DOUBLE PRECISION,
  is_bank INTEGER,
  is_heavyweight INTEGER,
  range_pos DOUBLE PRECISION,
  near_high INTEGER,
  near_low INTEGER,
  up INTEGER,
  down INTEGER,
  up_gt_1 INTEGER,
  down_lt_minus_1 INTEGER,
  weighted_move DOUBLE PRECISION,
  weighted_range_pos DOUBLE PRECISION,
  influence_points DOUBLE PRECISION,
  influence_pct DOUBLE PRECISION,
  proportion_pct DOUBLE PRECISION,
  PRIMARY KEY (snapshot_id, ticker)
);

CREATE TABLE IF NOT EXISTS dashboard_metrics (
  snapshot_id BIGINT PRIMARY KEY REFERENCES dashboard_snapshot(snapshot_id) ON DELETE CASCADE,
  breadth_up DOUBLE PRECISION,
  breadth_down DOUBLE PRECISION,
  pct_up DOUBLE PRECISION,
  pct_down DOUBLE PRECISION,
  near_high_count DOUBLE PRECISION,
  near_low_count DOUBLE PRECISION,
  pct_near_high DOUBLE PRECISION,
  pct_near_low DOUBLE PRECISION,
  up_gt_1_count DOUBLE PRECISION,
  down_lt_minus_1_count DOUBLE PRECISION,
  weighted_move_sum DOUBLE PRECISION,
  heavyweights_weighted_move DOUBLE PRECISION,
  non_heavyweights_weighted_move DOUBLE PRECISION,
  weighted_up_share DOUBLE PRECISION,
  weighted_down_share DOUBLE PRECISION,
  influence_concentration DOUBLE PRECISION,
  top3_share DOUBLE PRECISION,
  top_heavyweight_influence_share DOUBLE PRECISION,
  bank_share DOUBLE PRECISION,
  top3_proportion_share DOUBLE PRECISION,
  top3_influence_share DOUBLE PRECISION,
  rotation_delta DOUBLE PRECISION,
  index_dependency_risk DOUBLE PRECISION,
  msi_simple TEXT,
  msi_score DOUBLE PRECISION,
  composite DOUBLE PRECISION,
  breadth_score DOUBLE PRECISION,
  distortion DOUBLE PRECISION,
  weighted_breadth DOUBLE PRECISION,
  bulltrap TEXT,
  washout TEXT,
  squeeze TEXT,
  regime TEXT,
  structure TEXT,
  risk_flag TEXT,
  final_verdict TEXT,
  action_bias TEXT,
  action_why TEXT,
  preferred_setup TEXT
);

CREATE TABLE IF NOT EXISTS metric_definition (
  metric_id TEXT PRIMARY KEY,
  section TEXT NOT NULL CHECK (section IN ('key_metrics', 'signals', 'market_health')),
  label TEXT NOT NULL,
  formula TEXT NOT NULL,
  value_type TEXT NOT NULL CHECK (value_type IN ('number', 'text')),
  unit TEXT
);

CREATE TABLE IF NOT EXISTS metric_value (
  snapshot_id BIGINT NOT NULL REFERENCES dashboard_snapshot(snapshot_id) ON DELETE CASCADE,
  metric_id TEXT NOT NULL REFERENCES metric_definition(metric_id) ON DELETE CASCADE,
  numeric_value DOUBLE PRECISION,
  text_value TEXT,
  PRIMARY KEY (snapshot_id, metric_id),
  CHECK (numeric_value IS NOT NULL OR text_value IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_metric_value_snapshot ON metric_value (snapshot_id);
