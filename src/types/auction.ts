export type Sport = 'basketball' | 'football';

export type PlayerCategory = 'national' | 'state' | 'district' | 'school' | 'others';

export type PlayerStatus = 'available' | 'auctioned' | 'unsold';

export interface Player {
  id: string;
  name: string;
  sport: Sport;
  category: PlayerCategory;
  photoUrl: string;
  position?: string;
  status: PlayerStatus;
  soldToTeamId?: string;
  soldPrice?: number;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  sport: Sport;
  maxBudget: number;
  remainingBudget: number;
  players: Player[];
  createdAt: string;
}

export interface Bid {
  id: string;
  playerId: string;
  teamId: string;
  teamName: string;
  amount: number;
  timestamp: string;
}

export interface AuctionState {
  isActive: boolean;
  currentPlayer: Player | null;
  currentBid: number;
  currentBidderId: string | null;
  currentBidderName: string | null;
  bids: Bid[];
  countdown: number | null;
}

export const CATEGORY_CONFIG: Record<PlayerCategory, { startingBid: number; increment: number; label: string }> = {
  national: { startingBid: 180, increment: 25, label: 'National' },
  state: { startingBid: 120, increment: 15, label: 'State' },
  district: { startingBid: 80, increment: 10, label: 'District' },
  school: { startingBid: 50, increment: 5, label: 'School' },
  others: { startingBid: 10, increment: 1, label: 'Others' },
};

export const SPORT_CONFIG: Record<Sport, { minPlayers: number; defaultTeams: number; label: string; icon: string }> = {
  basketball: { minPlayers: 8, defaultTeams: 4, label: 'Basketball', icon: '🏀' },
  football: { minPlayers: 11, defaultTeams: 8, label: 'Football', icon: '⚽' },
};
