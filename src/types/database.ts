// Database Types for CKPL Auction System

export interface Sport {
  id: number
  name: string // 'Basketball' | 'Football'
  min_teams: number
  min_players_per_team: number
  created_at: string
}

export interface Category {
  id: number
  name: 'National' | 'State' | 'District' | 'School' | 'Others'
  starting_points: number
  increment: number
  created_at: string
}

export interface Team {
  id: number
  sport_id: number
  name: string
  max_points: number
  created_at: string
  updated_at: string
}

export interface Player {
  id: number
  name: string
  sport_id: number
  category_id: number
  photo_url: string | null
  status: 'unsold' | 'sold' | 're-auctioned'
  created_at: string
  updated_at: string
}

export interface Auction {
  id: number
  sport_id: number
  player_id: number
  current_bid: number
  highest_bidder_team_id: number | null
  status: 'active' | 'closed' | 'paused' | 'cancelled'
  started_at: string
  ended_at: string | null
  created_at: string
  updated_at: string
}

export interface Bid {
  id: number
  auction_id: number
  team_id: number
  bid_amount: number
  created_at: string
}

export interface PlayerAssignment {
  id: number
  player_id: number
  team_id: number
  auction_id: number
  points_spent: number
  assigned_at: string
}

export interface TeamBudget {
  id: number
  team_id: number
  max_points: number
  spent_points: number
  remaining_points: number
  updated_at: string
}

export interface AuctionLog {
  id: number
  auction_id: number
  action: string
  details: Record<string, any> | null
  created_at: string
}

export interface AuctionSession {
  id: number
  sport_id: number
  name: string
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled'
  started_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: number
  user_id: string // UUID
  role: 'admin' | 'team_bidder' | 'viewer'
  team_id: number | null
  created_at: string
  updated_at: string
}

// View Types
export interface TeamSummary {
  id: number
  name: string
  sport: string
  max_points: number
  spent_points: number
  remaining_points: number
  players_acquired: number
}

export interface PlayerStatusSummary {
  id: number
  name: string
  sport: string
  category: string
  status: string
  assigned_team: string | null
  sale_price: number | null
}

export interface AuctionSummary {
  id: number
  player_id: number
  player_name: string
  sport: string
  category: string
  current_bid: number
  highest_bidder: string | null
  status: string
  started_at: string
}
