-- Create bucket for player photos
INSERT INTO storage.buckets (id, name, public) VALUES ('player-photos', 'player-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for player photos
CREATE POLICY "Public read player photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'player-photos');

-- Authenticated upload/update/delete for player photos
CREATE POLICY "Authenticated write player photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'player-photos');
CREATE POLICY "Authenticated update player photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'player-photos') WITH CHECK (bucket_id = 'player-photos');
CREATE POLICY "Authenticated delete player photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'player-photos');

-- Open policies for app tables (adjust later for stricter roles)
DO $$
BEGIN
  -- sports & categories: read-only
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sports' AND policyname = 'sports_select_all'
  ) THEN
    CREATE POLICY sports_select_all ON sports FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'categories_select_all'
  ) THEN
    CREATE POLICY categories_select_all ON categories FOR SELECT USING (true);
  END IF;

  -- players
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'players' AND policyname = 'players_all'
  ) THEN
    CREATE POLICY players_all ON players FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- teams
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'teams' AND policyname = 'teams_all'
  ) THEN
    CREATE POLICY teams_all ON teams FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- team_budgets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'team_budgets' AND policyname = 'team_budgets_all'
  ) THEN
    CREATE POLICY team_budgets_all ON team_budgets FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- player_assignments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'player_assignments' AND policyname = 'player_assignments_all'
  ) THEN
    CREATE POLICY player_assignments_all ON player_assignments FOR ALL USING (true) WITH CHECK (true);
  END IF;
END$$;
