-- Create opportunity tracking table for lead lifecycle management
CREATE TABLE IF NOT EXISTS opportunity_tracking (
  opportunity_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'on-radar',
  notes TEXT DEFAULT '',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activity JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_tracking_status ON opportunity_tracking(status);
CREATE INDEX IF NOT EXISTS idx_tracking_updated ON opportunity_tracking(last_updated DESC);

-- Enable RLS (Row Level Security) - adjust based on your auth needs
ALTER TABLE opportunity_tracking ENABLE ROW LEVEL SECURITY;

-- For now, allow all access (adjust when you add auth)
CREATE POLICY "Allow all access to opportunity_tracking" ON opportunity_tracking
  FOR ALL USING (true) WITH CHECK (true);
