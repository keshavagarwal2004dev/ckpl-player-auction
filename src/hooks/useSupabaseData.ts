import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createPlayer, updatePlayer, createTeam, deletePlayerById, deleteTeamById, fetchPlayersForStore, fetchTeamsForStore, markPlayerSold, markPlayerUnsold, resetAuctionData, fetchAuctionState } from '@/lib/auctionApi'
import { useAuctionStore } from '@/stores/auctionStore'
import { PlayerCategory, Sport, Player, Team } from '@/types/auction'
import { toast } from 'sonner'
import { useEffect } from 'react'

export function useSupabaseData() {
  const setPlayers = useAuctionStore((s) => s.setPlayers)
  const setTeams = useAuctionStore((s) => s.setTeams)

  const playersQuery = useQuery<Player[]>({
    queryKey: ['players'],
    queryFn: fetchPlayersForStore,
  })

  const teamsQuery = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: fetchTeamsForStore,
  })

  // Use effect to sync query data to store whenever it changes
  useEffect(() => {
    if (playersQuery.data) {
      console.log('[useSupabaseData] useEffect syncing players:', playersQuery.data.length)
      setPlayers(playersQuery.data)
    }
  }, [playersQuery.data, setPlayers])

  useEffect(() => {
    if (teamsQuery.data) {
      console.log('[useSupabaseData] useEffect syncing teams:', teamsQuery.data.length)
      setTeams(teamsQuery.data)
    }
  }, [teamsQuery.data, setTeams])

  return {
    playersQuery,
    teamsQuery,
    isLoading: playersQuery.isLoading || teamsQuery.isLoading,
    refetchAll: () => Promise.all([playersQuery.refetch(), teamsQuery.refetch()]),
  }
}

export function useRealtimeAuctionState() {
  const auctionStore = useAuctionStore()

  // Real-time polling of auction state every 500ms
  // This works across profiles/devices by fetching from the database
  const auctionStateQuery = useQuery({
    queryKey: ['auctionState-realtime'],
    queryFn: fetchAuctionState,
    refetchInterval: 500, // Poll every 500ms
    refetchIntervalInBackground: true, // Continue polling even when tab is not focused
    staleTime: 0, // Always consider data stale to trigger immediate refetch
  })

  // Sync fetched auction state to Zustand store
  useEffect(() => {
    if (auctionStateQuery.data !== undefined) {
      const { currentPlayer, currentBid, currentBidderId, currentBidderName, bids } = auctionStateQuery.data

      // Only update store if data actually changed to avoid unnecessary re-renders
      const currentState = auctionStore.auctionState
      if (
        currentState.currentPlayer?.id !== currentPlayer?.id ||
        currentState.currentBid !== currentBid ||
        currentState.currentBidderId !== currentBidderId ||
        currentState.bids.length !== bids.length
      ) {

        auctionStore.updateAuctionStateFromDatabase({
          currentPlayer,
          currentBid,
          currentBidderId,
          currentBidderName,
          bids,
        })
      }
    }
  }, [auctionStateQuery.data, auctionStore])

  return {
    auctionStateQuery,
    isLoading: auctionStateQuery.isLoading,
  }
}

export function useSupabaseMutations() {
  const queryClient = useQueryClient()

  const addPlayerMutation = useMutation({
    mutationFn: (payload: { name: string; sport: Sport; category: PlayerCategory; photoUrl: string }) => createPlayer(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] }),
  })

  const editPlayerMutation = useMutation({
    mutationFn: (payload: { id: string; name?: string; sport?: Sport; category?: PlayerCategory; photoUrl?: string }) =>
      updatePlayer(payload.id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] }),
  })

  const deletePlayerMutation = useMutation({
    mutationFn: (id: string) => deletePlayerById(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] }),
  })

  const addTeamMutation = useMutation({
    mutationFn: (payload: { name: string; sport: Sport; maxBudget: number }) => createTeam(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })

  const deleteTeamMutation = useMutation({
    mutationFn: (id: string) => deleteTeamById(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })

  const markSoldMutation = useMutation({
    mutationFn: (payload: { playerId: string; teamId: string; amount: number }) =>
      markPlayerSold(payload.playerId, payload.teamId, payload.amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  const markUnsoldMutation = useMutation({
    mutationFn: (playerId: string) => markPlayerUnsold(playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  const resetMutation = useMutation({
    mutationFn: (sport?: Sport) => resetAuctionData(sport),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  return {
    addPlayerMutation,
    editPlayerMutation,
    deletePlayerMutation,
    addTeamMutation,
    deleteTeamMutation,
    markSoldMutation,
    markUnsoldMutation,
    resetMutation,
  }
}
