import { create } from 'zustand';
import { Player, Team, Sport, AuctionState, Bid } from '@/types/auction';

interface AuctionStore {
  // Data
  players: Player[];
  teams: Team[];
  
  // Auction State
  auctionState: AuctionState;
  selectedSport: Sport | null;
  
  // Actions - Players
  addPlayer: (player: Omit<Player, 'id' | 'createdAt' | 'status'>) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  setPlayerStatus: (id: string, status: Player['status'], teamId?: string, price?: number) => void;
  
  // Actions - Teams
  addTeam: (team: Omit<Team, 'id' | 'createdAt' | 'players'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  
  // Actions - Auction
  setSelectedSport: (sport: Sport | null) => void;
  startAuction: (player: Player) => void;
  placeBid: (teamId: string, teamName: string, amount: number) => void;
  soldPlayer: (teamId: string, amount: number) => void;
  unsoldPlayer: () => void;
  resetAuction: (sport?: Sport) => void;
  setCountdown: (value: number | null) => void;
}

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  players: [],
  teams: [],
  auctionState: {
    isActive: false,
    currentPlayer: null,
    currentBid: 0,
    currentBidderId: null,
    currentBidderName: null,
    bids: [],
    countdown: null,
  },
  selectedSport: null,

  // Player Actions
  addPlayer: (playerData) => {
    const player: Player = {
      ...playerData,
      id: crypto.randomUUID(),
      status: 'available',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ players: [...state.players, player] }));
  },

  updatePlayer: (id, updates) => {
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  deletePlayer: (id) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    }));
  },

  setPlayerStatus: (id, status, teamId, price) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id
          ? { ...p, status, soldToTeamId: teamId, soldPrice: price }
          : p
      ),
    }));
  },

  // Team Actions
  addTeam: (teamData) => {
    const team: Team = {
      ...teamData,
      id: crypto.randomUUID(),
      players: [],
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ teams: [...state.teams, team] }));
  },

  updateTeam: (id, updates) => {
    set((state) => ({
      teams: state.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTeam: (id) => {
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== id),
    }));
  },

  // Auction Actions
  setSelectedSport: (sport) => {
    set({ selectedSport: sport });
  },

  startAuction: (player) => {
    set({
      auctionState: {
        isActive: true,
        currentPlayer: player,
        currentBid: 0,
        currentBidderId: null,
        currentBidderName: null,
        bids: [],
        countdown: null,
      },
    });
  },

  placeBid: (teamId, teamName, amount) => {
    const bid: Bid = {
      id: crypto.randomUUID(),
      playerId: get().auctionState.currentPlayer?.id || '',
      teamId,
      teamName,
      amount,
      timestamp: new Date().toISOString(),
    };
    
    set((state) => ({
      auctionState: {
        ...state.auctionState,
        currentBid: amount,
        currentBidderId: teamId,
        currentBidderName: teamName,
        bids: [...state.auctionState.bids, bid],
      },
    }));
  },

  soldPlayer: (teamId, amount) => {
    const { auctionState, teams, players } = get();
    const player = auctionState.currentPlayer;
    
    if (!player) return;

    // Update player status
    set((state) => ({
      players: state.players.map((p) =>
        p.id === player.id
          ? { ...p, status: 'auctioned' as const, soldToTeamId: teamId, soldPrice: amount }
          : p
      ),
      // Update team - add player and deduct budget
      teams: state.teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              remainingBudget: t.remainingBudget - amount,
              players: [...t.players, { ...player, status: 'auctioned' as const, soldToTeamId: teamId, soldPrice: amount }],
            }
          : t
      ),
      // Reset auction state
      auctionState: {
        isActive: false,
        currentPlayer: null,
        currentBid: 0,
        currentBidderId: null,
        currentBidderName: null,
        bids: [],
        countdown: null,
      },
    }));
  },

  unsoldPlayer: () => {
    const { auctionState } = get();
    const player = auctionState.currentPlayer;
    
    if (!player) return;

    set((state) => ({
      players: state.players.map((p) =>
        p.id === player.id ? { ...p, status: 'unsold' as const } : p
      ),
      auctionState: {
        isActive: false,
        currentPlayer: null,
        currentBid: 0,
        currentBidderId: null,
        currentBidderName: null,
        bids: [],
        countdown: null,
      },
    }));
  },

  resetAuction: (sport) => {
    set((state) => ({
      players: state.players.map((p) =>
        sport ? (p.sport === sport ? { ...p, status: 'available' as const, soldToTeamId: undefined, soldPrice: undefined } : p)
              : { ...p, status: 'available' as const, soldToTeamId: undefined, soldPrice: undefined }
      ),
      teams: state.teams.map((t) =>
        sport ? (t.sport === sport ? { ...t, players: [], remainingBudget: t.maxBudget } : t)
              : { ...t, players: [], remainingBudget: t.maxBudget }
      ),
      auctionState: {
        isActive: false,
        currentPlayer: null,
        currentBid: 0,
        currentBidderId: null,
        currentBidderName: null,
        bids: [],
        countdown: null,
      },
    }));
  },

  setCountdown: (value) => {
    set((state) => ({
      auctionState: {
        ...state.auctionState,
        countdown: value,
      },
    }));
  },
}));
