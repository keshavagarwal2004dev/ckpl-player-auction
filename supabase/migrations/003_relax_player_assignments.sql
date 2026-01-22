-- Make auction_id optional for player_assignments to avoid NOT NULL constraint errors
ALTER TABLE player_assignments
  ALTER COLUMN auction_id DROP NOT NULL;
