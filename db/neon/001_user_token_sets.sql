CREATE TABLE IF NOT EXISTS studio_user_token_sets (
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  set_id TEXT NOT NULL,
  name TEXT NOT NULL,
  tokens JSONB NOT NULL,
  size_tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id, set_id)
);

CREATE INDEX IF NOT EXISTS studio_user_token_sets_user_idx
  ON studio_user_token_sets (project_id, user_id, updated_at DESC);
