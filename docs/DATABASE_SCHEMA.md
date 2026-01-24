# CKPL Live Auction - Database Schema Documentation

## Overview
This document describes the Supabase PostgreSQL database schema for the CKPL Live Auction system.

---

## Tables

### 1. **sports**
Stores available sports (Basketball, Football).

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique identifier |
| name | VARCHAR(50) | Sport name (unique) |
| min_teams | INT | Minimum teams required |
| min_players_per_team | INT | Minimum players per team |
| created_at | TIMESTAMP | Creation timestamp |

**Constraints:**
- `name` must be UNIQUE
- Default values: Basketball (4 teams, 8 players), Football (8 teams, 11 players)

---

### 2. **categories**
Defines player categories with starting points and bid increments.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique identifier |
| name | VARCHAR(50) | Category name (unique) |
| starting_points | INT | Starting bid amount |
| increment | INT | Bid increment step |
| created_at | TIMESTAMP | Creation timestamp |

**Constraints:**
- `name` must be UNIQUE
- Default categories: National (180/25), State (120/15), District (80/10), School (50/5), Others (10/1)

---

### 3. **teams**
Stores teams for each sport with their maximum points budget.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique identifier |
| sport_id | BIGINT (FK) | Reference to sports table |
| name | VARCHAR(100) | Team name |
| max_points | INT | Maximum points budget |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Constraints:**
- `sport_id` references `sports(id)` with CASCADE delete
- UNIQUE constraint on (sport_id, name)

---

### 4. **players**
Stores all players with their details.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique identifier |
| name | VARCHAR(100) | Player name |
| sport_id | BIGINT (FK) | Reference to sports table |
| category_id | BIGINT (FK) | Reference to categories table |
| photo_url | TEXT | URL to player photo (required) |
| position | VARCHAR(50) | Player position (optional) |
| status | VARCHAR(20) | 'unsold', 'sold', 're-auctioned' |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Constraints:**
- `sport_id` references `sports(id)` with CASCADE delete
- `category_id` references `categories(id)` with SET NULL on delete
- `status` CHECK constraint with allowed values

---

### 5. **auctions**
Tracks active/historical auction sessions for each player.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique identifier |
| sport_id | BIGINT (FK) | Reference to sports table |
| player_id | BIGINT (FK) | Reference to players table |
| current_bid | INT | Current highest bid amount |
| highest_bidder_team_id | BIGINT (FK) | Team with highest bid |
| status | VARCHAR(20) | 'active', 'closed', 'paused', 'cancelled' |
| started_at | TIMESTAMP | Auction start time |
| ended_at | TIMESTAMP | Auction end time |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Constraints:**
- `sport_id` references `sports(id)` with CASCADE delete
- `player_id` references `players(id)` with CASCADE delete
- `highest_bidder_team_id` references `teams(id)` with SET NULL on delete
- `status` CHECK constraint with allowed values

---

### 6. **bids**
Stores individual bids made during auctions.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique identifier |
| auction_id | BIGINT (FK) | Reference to auctions table |
| team_id | BIGINT (FK) | Reference to teams table |
| bid_amount | INT | Bid amount in points |
| created_at | TIMESTAMP | Bid timestamp |

**Constraints:**
- `auction_id` references `auctions(id)` with CASCADE delete
- `team_id` references `teams(id)` with CASCADE delete

---

### 7. **player_assignments**
Records player assignments to teams after winning auction.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique identifier |
| player_id | BIGINT (FK) | Reference to players table |
| team_id | BIGINT (FK) | Reference to teams table |
| auction_id | BIGINT (FK) | Reference to auctions table |
| points_spent | INT | Points spent on this player |
| assigned_at | TIMESTAMP | Assignment timestamp |

**Constraints:**
- All FKs reference with CASCADE delete
- UNIQUE constraint on (player_id, team_id)

---

### 8. **team_budgets**
Tracks team budget consumption (denormalized for performance).

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique identifier |
| team_id | BIGINT (FK) | Reference to teams table |
| max_points | INT | Maximum budget |
| spent_points | INT | Points spent so far |
| remaining_points | INT | Points available |
| updated_at | TIMESTAMP | Last update timestamp |

**Constraints:**
- `team_id` is UNIQUE and references `teams(id)` with CASCADE delete

---

### 9. **auction_logs**
Audit trail for auction events.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique identifier |
| auction_id | BIGINT (FK) | Reference to auctions table |
| action | VARCHAR(100) | Action description (e.g., 'bid_placed', 'auction_closed') |
| details | JSONB | Additional metadata |
| created_at | TIMESTAMP | Event timestamp |

**Constraints:**
- `auction_id` references `auctions(id)` with CASCADE delete

---

### 10. **auction_sessions**
Overall auction event management (spans multiple player auctions).

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique identifier |
| sport_id | BIGINT (FK) | Reference to sports table |
| name | VARCHAR(100) | Session name |
| status | VARCHAR(20) | 'pending', 'active', 'paused', 'completed', 'cancelled' |
| started_at | TIMESTAMP | Session start time |
| ended_at | TIMESTAMP | Session end time |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Constraints:**
- `sport_id` references `sports(id)` with CASCADE delete
- `status` CHECK constraint with allowed values

---

### 11. **user_roles**
Role-based access control (optional).

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique identifier |
| user_id | UUID (FK) | Supabase auth user ID |
| role | VARCHAR(20) | 'admin', 'team_bidder', 'viewer' |
| team_id | BIGINT (FK) | Assigned team (for bidders) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Constraints:**
- `team_id` references `teams(id)` with SET NULL on delete
- `role` CHECK constraint with allowed values

---

## Views

### 1. **team_summary**
Shows team details with remaining budget and player count.

**Columns:**
- id, name, sport, max_points, spent_points, remaining_points, players_acquired

---

### 2. **player_status_summary**
Shows player details with assignment status.

**Columns:**
- id, name, sport, category, status, assigned_team, sale_price

---

### 3. **auction_summary**
Shows active/completed auctions with all relevant details.

**Columns:**
- id, player_id, player_name, sport, category, current_bid, highest_bidder, status, started_at

---

## Indexes

Indexes are created on:
- `teams(sport_id)`
- `players(sport_id)`, `players(category_id)`, `players(status)`
- `auctions(player_id)`, `auctions(sport_id)`, `auctions(status)`, `auctions(highest_bidder_team_id)`
- `bids(auction_id)`, `bids(team_id)`
- `player_assignments(player_id)`, `player_assignments(team_id)`, `player_assignments(auction_id)`
- `team_budgets(team_id)`
- `auction_logs(auction_id)`
- `auction_sessions(sport_id)`, `auction_sessions(status)`
- `user_roles(user_id)`, `user_roles(team_id)`

---

## Row Level Security (RLS)

RLS is enabled on all tables. You can configure policies based on user roles:

**Example Admin Policy:**
```sql
CREATE POLICY admin_access ON players
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

**Example Team Bidder Policy:**
```sql
CREATE POLICY team_bidder_access ON bids
  USING (
    team_id IN (
      SELECT team_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );
```

---

## Setup Instructions

1. **Create Supabase Project**
   - Go to supabase.com and create a new project
   - Copy your project URL and anon key

2. **Run Migration**
   - Open Supabase SQL Editor
   - Copy contents from `supabase/migrations/001_init_schema.sql`
   - Execute the SQL

3. **Verify Tables**
   - Check Tables in Supabase dashboard
   - All 11 tables should be created with proper relationships

4. **Enable RLS (Optional)**
   - Create policies as needed for your auth requirements
   - Test with different user roles

---

## Key Design Decisions

✅ **Relationships:**
- CASCADE delete on sport/auction references (clean-up dependent data)
- SET NULL for team references in optional fields

✅ **Constraints:**
- CHECK constraints on status fields (prevent invalid values)
- UNIQUE constraints prevent duplicates
- NOT NULL constraints on required fields

✅ **Performance:**
- Indexes on frequently queried columns
- Denormalized `team_budgets` for quick budget queries
- JSONB `details` column for flexible audit logging

✅ **Scalability:**
- No hardcoded values (all configurable via tables)
- Sports/categories easily extendable
- Audit trail via `auction_logs` table

---

## Sample Queries

### Get team remaining points
```sql
SELECT remaining_points FROM team_budgets WHERE team_id = 1;
```

### Get current auction
```sql
SELECT * FROM auction_summary WHERE status = 'active' ORDER BY started_at DESC LIMIT 1;
```

### Get team roster
```sql
SELECT p.*, t.name as team_name, pa.points_spent
FROM players p
JOIN player_assignments pa ON p.id = pa.player_id
JOIN teams t ON pa.team_id = t.id
WHERE t.id = 1;
```

### Get auction bid history
```sql
SELECT b.*, t.name as bidder_team
FROM bids b
JOIN teams t ON b.team_id = t.id
WHERE b.auction_id = 1
ORDER BY created_at;
```
