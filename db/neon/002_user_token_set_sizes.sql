ALTER TABLE studio_user_token_sets
  ADD COLUMN IF NOT EXISTS size_tokens JSONB NOT NULL DEFAULT '{}'::jsonb;
