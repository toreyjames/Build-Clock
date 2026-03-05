-- Refresh run telemetry for scheduled ingestion monitoring
CREATE TABLE IF NOT EXISTS refresh_runs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  trigger TEXT NOT NULL DEFAULT 'cron',
  status TEXT NOT NULL CHECK (status IN ('ok', 'partial', 'error')),
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_runs_started_at
  ON refresh_runs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_refresh_runs_status_started
  ON refresh_runs(status, started_at DESC);

ALTER TABLE refresh_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to refresh_runs" ON refresh_runs
  FOR ALL USING (true) WITH CHECK (true);
