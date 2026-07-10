-- Site visitor analytics (pageviews + time on page), independent of the
-- in-app trading analytics (lib/analytics-engine.ts, which is per-user
-- trading performance, not site traffic). Powers the password-gated
-- /backstage traffic dashboard.
CREATE TABLE IF NOT EXISTS analytics_pageviews (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_pageviews_session_id ON analytics_pageviews(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_pageviews_entered_at ON analytics_pageviews(entered_at);
CREATE INDEX IF NOT EXISTS idx_analytics_pageviews_path ON analytics_pageviews(path);

-- Written only via the service-role key from server routes (POST /api/track,
-- GET /api/backstage/stats) - never read/written directly from the browser,
-- so RLS stays enabled with no public policies attached.
ALTER TABLE analytics_pageviews ENABLE ROW LEVEL SECURITY;
