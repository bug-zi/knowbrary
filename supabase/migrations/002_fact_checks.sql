-- ============================================
-- 事实核查记录表
-- ============================================

CREATE TABLE fact_checks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  claim TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('reliable', 'unreliable', 'partially-reliable', 'unverifiable')),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  summary TEXT NOT NULL,
  report JSONB NOT NULL,
  search_results JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fact_checks_created ON fact_checks(created_at DESC);

-- Allow public read/write (no auth required)
ALTER TABLE fact_checks DISABLE ROW LEVEL SECURITY;
