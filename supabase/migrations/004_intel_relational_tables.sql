-- Intel relational storage for event evidence, status transitions, and live streams

CREATE TABLE IF NOT EXISTS intel_events (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('positive', 'neutral', 'negative')),
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  url TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intel_events_project_time
  ON intel_events(project_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS intel_status_history (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  from_status TEXT NULL,
  to_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_url TEXT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intel_status_history_project_time
  ON intel_status_history(project_id, changed_at DESC);

CREATE TABLE IF NOT EXISTS intel_live_streams (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  stream_url TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  coverage_scope TEXT NOT NULL DEFAULT 'project-area',
  last_verified_at TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intel_live_streams_project
  ON intel_live_streams(project_id, verified DESC, updated_at DESC);

ALTER TABLE intel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to intel_events" ON intel_events
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to intel_status_history" ON intel_status_history
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to intel_live_streams" ON intel_live_streams
  FOR ALL USING (true) WITH CHECK (true);
