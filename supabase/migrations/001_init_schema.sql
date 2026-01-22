-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sports (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(50) NOT NULL UNIQUE,
  min_teams INT NOT NULL,
  min_players_per_team INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sports (name, min_teams, min_players_per_team) VALUES
  ('Basketball', 4, 8),
  ('Football', 8, 11)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(50) NOT NULL UNIQUE,
  starting_points INT NOT NULL,
  increment INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, starting_points, increment) VALUES
  ('National', 180, 25),
  ('State', 120, 15),
  ('District', 80, 10),
  ('School', 50, 5),
  ('Others', 10, 1)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEAMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS teams (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  sport_id BIGINT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  max_points INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sport_id, name)
);

CREATE INDEX idx_teams_sport_id ON teams(sport_id);

-- ============================================================================
-- PLAYERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS players (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(100) NOT NULL,
  sport_id BIGINT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
  photo_url TEXT,
  status VARCHAR(20) DEFAULT 'unsold' CHECK (status IN ('unsold', 'sold', 're-auctioned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_players_sport_id ON players(sport_id);
CREATE INDEX idx_players_category_id ON players(category_id);
CREATE INDEX idx_players_status ON players(status);

-- ============================================================================
-- AUCTIONS TABLE (Active/Historical Auction Sessions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS auctions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  sport_id BIGINT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  current_bid INT NOT NULL,
  highest_bidder_team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'paused', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auctions_player_id ON auctions(player_id);
CREATE INDEX idx_auctions_sport_id ON auctions(sport_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_highest_bidder_team_id ON auctions(highest_bidder_team_id);

-- ============================================================================
-- BIDS TABLE (Individual Bids)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bids (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  auction_id BIGINT NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  bid_amount INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_team_id ON bids(team_id);

-- ============================================================================
-- PLAYER ASSIGNMENTS TABLE (Players Assigned to Teams)
-- ============================================================================
CREATE TABLE IF NOT EXISTS player_assignments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  auction_id BIGINT NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  points_spent INT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, team_id)
);

CREATE INDEX idx_player_assignments_player_id ON player_assignments(player_id);
CREATE INDEX idx_player_assignments_team_id ON player_assignments(team_id);
CREATE INDEX idx_player_assignments_auction_id ON player_assignments(auction_id);

-- ============================================================================
-- TEAM BUDGETS TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_budgets (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  team_id BIGINT NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  max_points INT NOT NULL,
  spent_points INT DEFAULT 0,
  remaining_points INT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_team_budgets_team_id ON team_budgets(team_id);

-- ============================================================================
-- AUCTION LOGS TABLE (Audit Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS auction_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  auction_id BIGINT NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auction_logs_auction_id ON auction_logs(auction_id);

-- ============================================================================
-- AUCTION SESSIONS TABLE (Overall Auction Event)
-- ============================================================================
CREATE TABLE IF NOT EXISTS auction_sessions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  sport_id BIGINT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auction_sessions_sport_id ON auction_sessions(sport_id);
CREATE INDEX idx_auction_sessions_status ON auction_sessions(status);

-- ============================================================================
-- USER ROLES TABLE (Optional: For Admin/Team Access Control)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'team_bidder', 'viewer')),
  team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_team_id ON user_roles(team_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) - Optional
-- ============================================================================
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE HELPFUL VIEWS
-- ============================================================================

-- View: Team Summary with Remaining Points
CREATE OR REPLACE VIEW team_summary AS
SELECT 
  t.id,
  t.name,
  s.name as sport,
  t.max_points,
  COALESCE(SUM(pa.points_spent), 0) as spent_points,
  t.max_points - COALESCE(SUM(pa.points_spent), 0) as remaining_points,
  COUNT(pa.id) as players_acquired
FROM teams t
LEFT JOIN sports s ON t.sport_id = s.id
LEFT JOIN player_assignments pa ON t.id = pa.team_id
GROUP BY t.id, t.name, s.name, t.max_points;

-- View: Player Status Summary
CREATE OR REPLACE VIEW player_status_summary AS
SELECT 
  p.id,
  p.name,
  s.name as sport,
  c.name as category,
  p.status,
  CASE 
    WHEN p.status = 'sold' THEN t.name 
    ELSE NULL 
  END as assigned_team,
  CASE 
    WHEN p.status = 'sold' THEN pa.points_spent 
    ELSE NULL 
  END as sale_price
FROM players p
LEFT JOIN sports s ON p.sport_id = s.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN player_assignments pa ON p.id = pa.player_id
LEFT JOIN teams t ON pa.team_id = t.id;

-- View: Auction Status Summary
CREATE OR REPLACE VIEW auction_summary AS
SELECT 
  a.id,
  a.player_id,
  p.name as player_name,
  s.name as sport,
  c.name as category,
  a.current_bid,
  t.name as highest_bidder,
  a.status,
  a.started_at
FROM auctions a
LEFT JOIN players p ON a.player_id = p.id
LEFT JOIN sports s ON a.sport_id = s.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN teams t ON a.highest_bidder_team_id = t.id;
