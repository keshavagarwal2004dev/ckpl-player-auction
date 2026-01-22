import { create } from 'zustand';
import { Player, Team, Sport, AuctionState, Bid } from '@/types/auction';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'ckpl-live-auction-state';

const defaultAuctionState: AuctionState = {
  isActive: false,
  currentPlayer: null,
  currentBid: 0,
  currentBidderId: null,
  currentBidderName: null,
  bids: [],
  countdown: null,
};

const loadAuctionState = (): AuctionState => {
  if (typeof window === 'undefined') return defaultAuctionState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAuctionState;
    const parsed = JSON.parse(raw) as AuctionState;
    
    // Validate and reconstruct bids array
    const bids = Array.isArray(parsed.bids) 
      ? parsed.bids.filter((bid: any) => bid && typeof bid.id === 'string')
      : [];
    
    // Validate and reconstruct currentPlayer
    const currentPlayer = parsed.currentPlayer && typeof parsed.currentPlayer === 'object'
      ? (parsed.currentPlayer as Player)
      : null;
    
    return {
      isActive: !!parsed.isActive,
      currentPlayer,
      currentBid: typeof parsed.currentBid === 'number' ? parsed.currentBid : 0,
      currentBidderId: typeof parsed.currentBidderId === 'string' ? parsed.currentBidderId : null,
      currentBidderName: typeof parsed.currentBidderName === 'string' ? parsed.currentBidderName : null,
      bids,
      countdown: typeof parsed.countdown === 'number' ? parsed.countdown : null,
    };
  } catch (error) {
    console.error('Failed to load auction state:', error);
    return defaultAuctionState;
  }
};

const persistAuctionState = (state: AuctionState) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log('💾 Persisted auction state to localStorage:', state);
  } catch {
    // ignore storage errors
  }
};

interface AuctionStore {
  // Data
  players: Player[];
  teams: Team[];
  setPlayers: (players: Player[]) => void;
  setTeams: (teams: Team[]) => void;
  
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
  startAuction: (player: Player, startingBid?: number) => void;
  placeBid: (teamId: string, teamName: string, amount: number) => void;
  soldPlayer: (teamId: string, amount: number) => void;
  unsoldPlayer: () => void;
  endAuction: () => void;
  resetAuction: (sport?: Sport) => void;
  setCountdown: (value: number | null | ((prev: number | null) => number | null)) => void;
  updateAuctionStateFromDatabase: (updates: Pick<AuctionState, 'currentPlayer' | 'currentBid' | 'currentBidderId' | 'currentBidderName' | 'bids'>) => void;
}

export const useAuctionStore = create<AuctionStore>((set, get) => {
  // Subscribe to storage changes from other tabs/windows
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const newState = loadAuctionState();
          console.log('🔄 Synced auction state from storage:', newState);
          set({ auctionState: newState });
        } catch (error) {
          console.error('Failed to sync auction state:', error);
        }
      }
    });

    // Also set up a polling mechanism to check for changes in the same tab/window
    console.log('✅ Polling mechanism started - checking localStorage every 200ms');
    const pollInterval = setInterval(() => {
      const currentState = get().auctionState;
      const storedState = loadAuctionState();
      
      // Check if isActive changed (main indicator of auction state change)
      if (currentState.isActive !== storedState.isActive) {
        console.log('📡 Detected isActive change, syncing auction state');
        console.log('  Previous isActive:', currentState.isActive);
        console.log('  New isActive:', storedState.isActive);
        set({ auctionState: storedState });
      }
      // Check if currentPlayer changed
      else if (currentState.currentPlayer?.id !== storedState.currentPlayer?.id) {
        console.log('📡 Detected currentPlayer change, syncing auction state');
        set({ auctionState: storedState });
      }
      // Check if currentBid changed
      else if (currentState.currentBid !== storedState.currentBid) {
        console.log('📡 Detected currentBid change, syncing auction state');
        console.log('  Previous bid:', currentState.currentBid);
        console.log('  New bid:', storedState.currentBid);
        console.log('  Previous bids count:', currentState.bids.length);
        console.log('  New bids count:', storedState.bids.length);
        set({ auctionState: storedState });
      }
      // Check if bids count changed (specifically for new bids)
      else if (currentState.bids.length !== storedState.bids.length) {
        console.log('📡 Detected bids count change, syncing auction state');
        console.log('  Previous bids count:', currentState.bids.length);
        console.log('  New bids count:', storedState.bids.length);
        console.log('  New bids:', storedState.bids);
        set({ auctionState: storedState });
      }
    }, 200); // Check every 200ms for faster sync
  }

  return {

  players: [],
  teams: [],
  setPlayers: (players) => set({ players }),
  setTeams: (teams) => set({ teams }),
  auctionState: loadAuctionState(),
  selectedSport: null,

  // Player Actions
  addPlayer: (playerData) => {
    const player: Player = {
      ...playerData,
      id: generateId(),
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
      id: generateId(),
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

  startAuction: (player, startingBid = 0) => {
    console.log('🟢 [startAuction] Starting auction locally:', { playerName: player.name, startingBid })
    const nextState: AuctionState = {
      isActive: true,
      currentPlayer: player,
      currentBid: startingBid,
      currentBidderId: null,
      currentBidderName: null,
      bids: [],
      countdown: null,
    };
    persistAuctionState(nextState);
    set({ auctionState: nextState });
    
    // Sync to database in the background
    if (typeof window !== 'undefined') {
      console.log('🔵 [startAuction] Importing and calling startAuctionInDatabase...')
      import('@/lib/auctionApi').then(({ startAuctionInDatabase }) => {
        console.log('🟢 [startAuction] Successfully imported startAuctionInDatabase, now calling it...')
        startAuctionInDatabase(player, player.sport, startingBid).then(() => {
          console.log('🟢 [startAuction] startAuctionInDatabase completed successfully')
        }).catch(err => {
          console.error('🔴 [startAuction] Failed to sync auction to database:', err)
        })
      }).catch(err => {
        console.error('🔴 [startAuction] Failed to import startAuctionInDatabase:', err)
      })
    }
  },

  placeBid: (teamId, teamName, amount) => {
    const bid: Bid = {
      id: generateId(),
      playerId: get().auctionState.currentPlayer?.id || '',
      teamId,
      teamName,
      amount,
      timestamp: new Date().toISOString(),
    };
    
    set((state) => {
      const nextState: AuctionState = {
        ...state.auctionState,
        currentBid: amount,
        currentBidderId: teamId,
        currentBidderName: teamName,
        bids: [...state.auctionState.bids, bid],
      };
      console.log('🎯 placeBid - Creating new bid:', {
        teamName,
        amount,
        totalBids: nextState.bids.length,
      });
      persistAuctionState(nextState);
      return { auctionState: nextState };
    });
    
    // Sync to database in the background
    if (typeof window !== 'undefined') {
      const currentPlayer = get().auctionState.currentPlayer
      if (currentPlayer) {
        import('@/lib/auctionApi').then(({ placeBidInDatabase }) => {
          placeBidInDatabase(currentPlayer.id, teamId, amount).catch(err => {
            console.error('Failed to sync bid to database:', err)
          })
        })
      }
    }
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
    persistAuctionState(defaultAuctionState);
    
    // Sync to database in the background
    if (typeof window !== 'undefined') {
      const currentState = get().auctionState
      if (currentState.currentPlayer && currentState.currentBidderId) {
        import('@/lib/auctionApi').then(({ endAuctionInDatabase }) => {
          endAuctionInDatabase(currentState.currentPlayer!.id, currentState.currentBidderId!, currentState.currentBid).catch(err => {
            console.error('Failed to sync auction end to database:', err)
          })
        })
      }
    }
  },

  unsoldPlayer: () => {
    const { auctionState } = get();
    const player = auctionState.currentPlayer;
    
    if (!player) return;

    set((state) => ({
      players: state.players.map((p) =>
        p.id === player.id ? { ...p, status: 'unsold' as const } : p
      ),
      auctionState: defaultAuctionState,
    }));
    persistAuctionState(defaultAuctionState);
    
    // Sync to database in the background
    if (typeof window !== 'undefined') {
      import('@/lib/auctionApi').then(({ cancelAuctionInDatabase }) => {
        cancelAuctionInDatabase(player.id).catch(err => {
          console.error('Failed to sync auction cancel to database:', err)
        })
      })
    }
  },

  endAuction: () => {
    set({
      auctionState: defaultAuctionState,
    });
    persistAuctionState(defaultAuctionState);
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
      auctionState: defaultAuctionState,
    }));
    persistAuctionState(defaultAuctionState);
  },

  setCountdown: (value) => {
    set((state) => {
      const next = typeof value === 'function' ? value(state.auctionState.countdown) : value;
      const nextState = {
        ...state.auctionState,
        countdown: next,
      };
      persistAuctionState(nextState);
      return {
        auctionState: nextState,
      };
    });
  },

  updateAuctionStateFromDatabase: (updates) => {
    set((state) => {
      const nextState: AuctionState = {
        ...state.auctionState,
        currentPlayer: updates.currentPlayer || null,
        currentBid: updates.currentBid ?? 0,
        currentBidderId: updates.currentBidderId || null,
        currentBidderName: updates.currentBidderName || null,
        bids: Array.isArray(updates.bids) ? updates.bids : [],
        isActive: !!updates.currentPlayer, // Auto-set isActive based on whether there's an active player
      };
      // Persist to localStorage so page refresh doesn't show stale data
      persistAuctionState(nextState);
      return { auctionState: nextState };
    });
  },
  };
});
