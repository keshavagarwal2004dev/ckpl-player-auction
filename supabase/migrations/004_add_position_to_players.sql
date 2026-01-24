-- Add Position column to players
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS position VARCHAR(50);

-- Optional: backfill or set defaults here if needed
-- UPDATE players SET position = '' WHERE position IS NULL;