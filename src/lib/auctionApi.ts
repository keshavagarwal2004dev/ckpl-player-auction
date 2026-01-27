import { supabase } from './supabase'
import { Player, PlayerCategory, Sport, Team, AuctionState, Bid } from '@/types/auction'
import { getReferenceIds, mapCategoryName, mapSportName } from './referenceData'

const statusMapToUi: Record<string, Player['status']> = {
  unsold: 'unsold',
  sold: 'auctioned',
  're-auctioned': 'available',
}

export async function fetchPlayersForStore(): Promise<Player[]> {
  console.log('[fetchPlayersForStore] Starting fetch...')
  const { data, error } = await supabase
    .from('players')
    .select(`
      id,
      name,
      position,
      photo_url,
      status,
      created_at,
      category:categories(id,name,starting_points,increment),
      sport:sports(id,name),
      player_assignments(points_spent, team_id)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchPlayersForStore] Error:', error)
    throw error
  }
  console.log('[fetchPlayersForStore] Success! Got', data?.length || 0, 'players')

  return (data || []).map((row: any) => {
    const sport = mapSportName(row.sport?.name || '') || 'basketball'
    const category = mapCategoryName(row.category?.name || '') || 'others'
    const status = statusMapToUi[row.status] ?? 'available'
    const assignment = Array.isArray(row.player_assignments) ? row.player_assignments[0] : null

    return {
      id: String(row.id),
      name: row.name,
      sport,
      category,
      photoUrl: row.photo_url || '',
        position: row.position || '',
      status,
      soldToTeamId: assignment?.team_id ? String(assignment.team_id) : undefined,
      soldPrice: assignment?.points_spent ?? undefined,
      createdAt: row.created_at,
    }
  })
}

export async function fetchTeamsForStore(): Promise<Team[]> {
  console.log('[fetchTeamsForStore] Starting fetch...')
  const { data, error } = await supabase
    .from('teams')
    .select(`
      id,
      name,
      max_points,
      created_at,
      sports(id,name),
      team_budgets(remaining_points, spent_points),
      player_assignments(points_spent, player:players(id,name,position,photo_url,status,category:categories(name)))
    `)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[fetchTeamsForStore] Error:', error)
    throw error
  }
  console.log('[fetchTeamsForStore] Success! Got', data?.length || 0, 'teams')

  return (data || []).map((row: any) => {
    const sport = mapSportName(row.sports?.name || '') || 'basketball'
    const players = (row.player_assignments || []).map((pa: any) => {
      const category = mapCategoryName(pa.player?.category?.[0]?.name || '') || 'others'
      return {
        id: String(pa.player?.id ?? ''),
        name: pa.player?.name ?? 'Player',
        sport,
        category,
        photoUrl: pa.player?.photo_url || '',
        position: pa.player?.position || '',
        status: 'auctioned' as const,
        soldToTeamId: String(row.id),
        soldPrice: pa.points_spent ?? 0,
        createdAt: '',
      }
    })

    const spentFromAssignments = (row.player_assignments || []).reduce((sum: number, pa: any) => sum + (pa.points_spent ?? 0), 0)
    const budgetRow = row.team_budgets?.[0]
    const remainingBudget = budgetRow?.remaining_points ?? Math.max(0, row.max_points - spentFromAssignments)

    return {
      id: String(row.id),
      name: row.name,
      sport,
      maxBudget: row.max_points,
      remainingBudget,
      players,
      createdAt: row.created_at,
    }
  })
}

export async function createPlayer(payload: {
  name: string
  sport: Sport
  category: PlayerCategory
  photoUrl: string
  position?: string
}) {
  const refs = await getReferenceIds()
  const sportId = refs.sports[payload.sport]
  const categoryId = refs.categories[payload.category]

  const { error } = await supabase.from('players').insert({
    name: payload.name,
    sport_id: sportId,
    category_id: categoryId,
    photo_url: payload.photoUrl,
    position: payload.position ?? null,
    status: 'unsold',
  })
  if (error) throw error
}

export async function updatePlayer(
  id: string,
  payload: {
    name?: string
    sport?: Sport
    category?: PlayerCategory
    photoUrl?: string
    position?: string
  }
) {
  const refs = await getReferenceIds()
  const updates: any = {}

  if (payload.name !== undefined) updates.name = payload.name
  if (payload.sport !== undefined) updates.sport_id = refs.sports[payload.sport]
  if (payload.category !== undefined) updates.category_id = refs.categories[payload.category]
  if (payload.photoUrl !== undefined) updates.photo_url = payload.photoUrl
  if (payload.position !== undefined) updates.position = payload.position

  const { error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', Number(id))
  if (error) throw error
}

export async function deletePlayerById(id: string) {
  const { error } = await supabase.from('players').delete().eq('id', Number(id))
  if (error) throw error
}

export async function createTeam(payload: { name: string; sport: Sport; maxBudget: number }) {
  const refs = await getReferenceIds()
  const sportId = refs.sports[payload.sport]

  const { data, error } = await supabase
    .from('teams')
    .insert({
      name: payload.name,
      sport_id: sportId,
      max_points: payload.maxBudget,
    })
    .select('id')
    .single()
  if (error) throw error

  const teamId = data?.id
  if (teamId) {
    const { error: budgetError } = await supabase.from('team_budgets').insert({
      team_id: teamId,
      max_points: payload.maxBudget,
      spent_points: 0,
      remaining_points: payload.maxBudget,
    })
    if (budgetError) throw budgetError
  }
}

export async function deleteTeamById(id: string) {
  const teamId = Number(id)
  const { error } = await supabase.from('teams').delete().eq('id', teamId)
  if (error) throw error
}

export async function markPlayerSold(playerId: string, teamId: string, amount: number) {
  const numericPlayerId = Number(playerId)
  const numericTeamId = Number(teamId)

  // CRITICAL FIX: Close the active auction for this player
  const { error: auctionCloseError } = await supabase
    .from('auctions')
    .update({
      status: 'closed',
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('player_id', numericPlayerId)
    .eq('status', 'active')
  
  if (auctionCloseError) {
    console.error('Error closing auction:', auctionCloseError)
    // Don't throw - continue with rest of function even if this fails
  }

  const { error: assignmentError } = await supabase.from('player_assignments').upsert({
    player_id: numericPlayerId,
    team_id: numericTeamId,
    points_spent: amount,
  }, { onConflict: 'player_id,team_id' })
  if (assignmentError) throw assignmentError

  const { error: playerError } = await supabase
    .from('players')
    .update({ status: 'sold' })
    .eq('id', numericPlayerId)
  if (playerError) throw playerError

  const { data: budgetRow, error: budgetFetchError } = await supabase
    .from('team_budgets')
    .select('spent_points, remaining_points, max_points')
    .eq('team_id', numericTeamId)
    .single()

  if (budgetFetchError && budgetFetchError.code !== 'PGRST116') {
    throw budgetFetchError
  }

  const { data: teamRow, error: teamError } = await supabase
    .from('teams')
    .select('max_points')
    .eq('id', numericTeamId)
    .single()
  if (teamError) throw teamError

  const currentSpent = budgetRow?.spent_points ?? 0
  const currentRemaining = budgetRow?.remaining_points ?? budgetRow?.max_points ?? teamRow?.max_points ?? 0
  const maxPoints = budgetRow?.max_points ?? teamRow?.max_points ?? currentSpent + currentRemaining

  const newSpent = currentSpent + amount
  const newRemaining = Math.max(0, maxPoints - newSpent)

  const { error: budgetUpdateError } = await supabase.from('team_budgets').upsert({
    team_id: numericTeamId,
    max_points: maxPoints,
    spent_points: newSpent,
    remaining_points: newRemaining,
  }, { onConflict: 'team_id' })

  if (budgetUpdateError) throw budgetUpdateError
}

export async function markPlayerUnsold(playerId: string) {
  const numericPlayerId = Number(playerId)

  // Step 1: Get player assignment to find team and points spent
  const { data: assignmentData, error: assignmentFetchError } = await supabase
    .from('player_assignments')
    .select('team_id, points_spent')
    .eq('player_id', numericPlayerId)
    .single()

  if (assignmentFetchError && assignmentFetchError.code !== 'PGRST116') {
    console.error('Error fetching assignment:', assignmentFetchError)
  }

  // Step 2: Revert points back to the team
  if (assignmentData) {
    const teamId = assignmentData.team_id
    const pointsToRevert = assignmentData.points_spent

    // Get current team budget
    const { data: budgetData, error: budgetFetchError } = await supabase
      .from('team_budgets')
      .select('spent_points, remaining_points, max_points')
      .eq('team_id', teamId)
      .single()

    if (budgetFetchError && budgetFetchError.code !== 'PGRST116') {
      console.error('Error fetching budget:', budgetFetchError)
    }

    if (budgetData) {
      const newSpentPoints = Math.max(0, (budgetData.spent_points || 0) - pointsToRevert)
      const newRemainingPoints = (budgetData.max_points || 0) - newSpentPoints

      // Update team budget
      const { error: budgetUpdateError } = await supabase
        .from('team_budgets')
        .update({
          spent_points: newSpentPoints,
          remaining_points: newRemainingPoints,
        })
        .eq('team_id', teamId)

      if (budgetUpdateError) {
        console.error('Error updating budget:', budgetUpdateError)
      }
    }
  }

  // Step 3: Update player status to unsold
  const { error: playerError } = await supabase
    .from('players')
    .update({ status: 'unsold' })
    .eq('id', numericPlayerId)
  if (playerError) throw playerError

  // Step 4: Delete the assignment
  await supabase.from('player_assignments').delete().eq('player_id', numericPlayerId)

  // Step 5: Ensure no active auctions remain for this player
  // Cancel any active auctions to prevent auto-showing in live panel
  const { error: cancelActiveError } = await supabase
    .from('auctions')
    .update({
      status: 'cancelled',
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('player_id', numericPlayerId)
    .eq('status', 'active')

  if (cancelActiveError) {
    console.error('Error cancelling active auction:', cancelActiveError)
  }
}

export async function resetAuctionData(sport?: Sport) {
  if (!sport) {
    await supabase.from('player_assignments').delete()
    await supabase.from('players').update({ status: 'available' })

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id,max_points')

    if (teamsError) throw teamsError

    if (teams && teams.length > 0) {
      await supabase.from('team_budgets').upsert(
        teams.map((t) => ({
          team_id: t.id,
          max_points: t.max_points,
          spent_points: 0,
          remaining_points: t.max_points,
        })),
        { onConflict: 'team_id' }
      )
    }
    return
  }

  const refs = await getReferenceIds()
  const sportId = refs.sports[sport]

  const { data: playerRows, error: playerError } = await supabase
    .from('players')
    .select('id')
    .eq('sport_id', sportId)
  if (playerError) throw playerError

  const playerIds = (playerRows || []).map((p) => p.id)

  if (playerIds.length > 0) {
    await supabase.from('player_assignments').delete().in('player_id', playerIds)
  }

  await supabase.from('players').update({ status: 'available' }).eq('sport_id', sportId)

  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id,max_points')
    .eq('sport_id', sportId)

  if (teamsError) throw teamsError

  if (teams && teams.length > 0) {
    await supabase.from('team_budgets').upsert(
      teams.map((t) => ({
        team_id: t.id,
        max_points: t.max_points,
        spent_points: 0,
        remaining_points: t.max_points,
      })),
      { onConflict: 'team_id' }
    )
  }
}
export type AuctionStateSnapshot = {
  currentPlayer: Player | null
  currentBid: number
  currentBidderId: string | null
  currentBidderName: string | null
  bids: Bid[]
  updatedAt: string | null
  isActive: boolean
  changed: boolean
}

const emptyAuctionSnapshot: AuctionStateSnapshot = {
  currentPlayer: null,
  currentBid: 0,
  currentBidderId: null,
  currentBidderName: null,
  bids: [],
  updatedAt: null,
  isActive: false,
  changed: true,
}

export async function fetchAuctionState(options?: { since?: string }): Promise<AuctionStateSnapshot> {
  try {
    const since = options?.since
    console.log('🔵 [fetchAuctionState] POLLING: Fetching latest auction state from Supabase', since ? `(since ${since})` : '')

    // Step 1: Fetch up to 2 active auctions to detect duplicates
    const { data: auctionRows, error: auctionError } = await supabase
      .from('auctions')
      .select('id, player_id, current_bid, highest_bidder_team_id, status, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(2)

    if (auctionError) {
      if (auctionError.code === 'PGRST116') {
        console.log('🟡 [fetchAuctionState] No active auction found in database')
        return { ...emptyAuctionSnapshot }
      }

      console.error('🔴 [fetchAuctionState] SUPABASE ERROR (Code: ' + auctionError.code + '):', {
        message: auctionError.message,
        details: auctionError.details,
        hint: auctionError.hint,
        fullError: auctionError,
      })

      if (auctionError.message?.includes('406') || auctionError.code === '406') {
        console.error('🔴 [fetchAuctionState] HTTP 406 Error - Likely RLS Policy Issue. Check Supabase dashboard > Authentication > Policies')
      }

      return { ...emptyAuctionSnapshot }
    }

    if (!auctionRows || auctionRows.length === 0) {
      console.log('🟡 [fetchAuctionState] Auction query returned no data')
      return { ...emptyAuctionSnapshot }
    }

    // Defensive guard: If multiple active auctions are present, return empty
    if (auctionRows.length > 1) {
      console.warn('🟠 [fetchAuctionState] Multiple active auctions detected - returning empty snapshot to avoid ghosting')
      return { ...emptyAuctionSnapshot }
    }

    const auctionData = auctionRows[0]

    const updatedAt = auctionData.updated_at ? new Date(auctionData.updated_at).toISOString() : null
    const isActive = auctionData.status === 'active'
    const hasChanges = !since || !updatedAt || updatedAt > since

    // If nothing changed since last poll, return minimal payload to skip downstream work
    if (!hasChanges) {
      return {
        ...emptyAuctionSnapshot,
        currentBid: auctionData.current_bid || 0,
        currentBidderId: auctionData.highest_bidder_team_id ? String(auctionData.highest_bidder_team_id) : null,
        updatedAt,
        isActive,
        changed: false,
      }
    }

    console.log('🟢 [fetchAuctionState] Found active auction in DB:', {
      auctionId: auctionData.id,
      playerId: auctionData.player_id,
      currentBid: auctionData.current_bid,
      highestBidderId: auctionData.highest_bidder_team_id,
      status: auctionData.status,
      updatedAt: auctionData.updated_at,
    })

    // Step 2: Fetch player details with sport and category in a single request
    let currentPlayer: Player | null = null
    if (auctionData.player_id) {
      const { data: playerData } = await supabase
        .from('players')
        .select('id, name, position, photo_url, sport:sports(name), category:categories(name)')
        .eq('id', auctionData.player_id)
        .single()

      if (playerData) {
        const sportName = mapSportName(playerData.sport?.name || '') || 'basketball'
        const categoryName = mapCategoryName(playerData.category?.name || '') || 'others'

        currentPlayer = {
          id: String(playerData.id),
          name: playerData.name,
          photoUrl: playerData.photo_url || '',
          position: playerData.position || '',
          sport: sportName,
          category: categoryName,
          status: 'available',
          createdAt: new Date().toISOString(),
        }
      }
    }

    // Step 3: Fetch bids with team names in a single query
    const { data: bidsArray } = await supabase
      .from('bids')
      .select('id, team_id, bid_amount, created_at, team:teams(name)')
      .eq('auction_id', auctionData.id)
      .order('created_at', { ascending: true })

    const formattedBids = (bidsArray || []).map((bid: any) => ({
      id: String(bid.id),
      playerId: currentPlayer?.id || '',
      teamId: String(bid.team_id),
      teamName: bid.team?.name || 'Unknown Team',
      amount: bid.bid_amount,
      timestamp: bid.created_at || new Date().toISOString(),
    }))

    // Step 4: Highest bidder team name (reuse bids data when possible)
    let bidderName: string | null = null
    if (auctionData.highest_bidder_team_id) {
      bidderName = formattedBids.find((bid) => bid.teamId === String(auctionData.highest_bidder_team_id))?.teamName || null

      if (!bidderName) {
        const { data: bidderTeamData } = await supabase
          .from('teams')
          .select('name')
          .eq('id', auctionData.highest_bidder_team_id)
          .single()

        bidderName = bidderTeamData?.name || null
      }
    }

    const result: AuctionStateSnapshot = {
      currentPlayer,
      currentBid: auctionData.current_bid || 0,
      currentBidderId: auctionData.highest_bidder_team_id ? String(auctionData.highest_bidder_team_id) : null,
      currentBidderName: bidderName,
      bids: formattedBids,
      updatedAt,
      isActive,
      changed: true,
    }

    console.log('🟢 [fetchAuctionState] SUCCESS - Returning auction state:', {
      player: currentPlayer?.name,
      currentBid: auctionData.current_bid,
      bidderName,
      bidsCount: formattedBids.length,
      updatedAt,
    })

    return result
  } catch (error) {
    console.error('🔴 [fetchAuctionState] Unexpected error:', error)
    return { ...emptyAuctionSnapshot }
  }
}

/**
 * Start a new auction in the database
 * Called when admin starts auctioning a player
 */
export async function startAuctionInDatabase(player: Player, sportType: Sport, startingBid: number = 0) {
  try {
    console.log('🟢 [startAuctionInDatabase] SAVING: Starting auction for player:', {
      playerId: player.id,
      playerName: player.name,
      sport: sportType,
      startingBid: startingBid
    })

    // Get sport_id
    const refs = await getReferenceIds()
    const sportId = refs.sports[sportType]

    // Close ANY active auctions to prevent ghosting after refresh
    await supabase
      .from('auctions')
      .update({ status: 'closed', ended_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('status', 'active')

    // Create new auction
    const { data, error } = await supabase
      .from('auctions')
      .insert({
        player_id: Number(player.id),
        sport_id: sportId,
        // Start at 0 so first bid equals base category starting bid
        current_bid: 0,
        highest_bidder_team_id: null,
        status: 'active',
      })
      .select('id')
      .single()

    if (error) {
      console.error('🔴 [startAuctionInDatabase] Error creating auction in DB:', error)
      throw error
    }

    console.log('🟢 [startAuctionInDatabase] SUCCESS! Auction created in DB with ID:', data?.id)
    return data?.id
  } catch (error) {
    console.error('🔴 [startAuctionInDatabase] FAILED:', error)
    throw error
  }
}

/**
 * Place a bid in the database
 * Called when admin places a bid
 */
export async function placeBidInDatabase(playerId: string, teamId: string, bidAmount: number) {
  try {
    console.log('🟢 [placeBidInDatabase] SAVING: Placing bid:', { playerId, teamId, bidAmount })

    // Get the active auction for this player
    const { data: auctionData, error: auctionError } = await supabase
      .from('auctions')
      .select('id')
      .eq('player_id', Number(playerId))
      .eq('status', 'active')
      .single()

    if (auctionError) {
      console.error('🔴 [placeBidInDatabase] No active auction found:', auctionError)
      throw new Error('No active auction found')
    }

    if (!auctionData) {
      throw new Error('No active auction found')
    }

    const auctionId = auctionData.id
    console.log('🟢 [placeBidInDatabase] Found auction ID:', auctionId)

    // Insert the bid
    const { error: bidError } = await supabase
      .from('bids')
      .insert({
        auction_id: auctionId,
        team_id: Number(teamId),
        bid_amount: bidAmount,
      })

    if (bidError) {
      console.error('🔴 [placeBidInDatabase] Error inserting bid to DB:', bidError)
      throw bidError
    }

    console.log('🟢 [placeBidInDatabase] Bid inserted, now updating auction...')

    // Update the auction with the new current bid and highest bidder
    const { error: auctionUpdateError } = await supabase
      .from('auctions')
      .update({
        current_bid: bidAmount,
        highest_bidder_team_id: Number(teamId),
        updated_at: new Date().toISOString(),
      })
      .eq('id', auctionId)

    if (auctionUpdateError) {
      console.error('🔴 [placeBidInDatabase] Error updating auction in DB:', auctionUpdateError)
      throw auctionUpdateError
    }

    console.log('🟢 [placeBidInDatabase] SUCCESS! Bid placed and auction updated in DB')
  } catch (error) {
    console.error('🔴 [placeBidInDatabase] FAILED:', error)
    throw error
  }
}

/**
 * Undo the last bid in the database
 * Called when admin clicks undo button
 */
export async function undoLastBidInDatabase(playerId: string) {
  try {
    console.log('🟡 [undoLastBidInDatabase] UNDOING: Removing last bid for player:', playerId)

    // Get the active auction for this player
    const { data: auctionData, error: auctionError } = await supabase
      .from('auctions')
      .select('id')
      .eq('player_id', Number(playerId))
      .eq('status', 'active')
      .single()

    if (auctionError || !auctionData) {
      console.error('🔴 [undoLastBidInDatabase] No active auction found:', auctionError)
      throw new Error('No active auction found')
    }

    const auctionId = auctionData.id
    console.log('🟡 [undoLastBidInDatabase] Found auction ID:', auctionId)

    // Get all bids for this auction, ordered by creation time
    const { data: allBids, error: bidsError } = await supabase
      .from('bids')
      .select('id, team_id, bid_amount, created_at')
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: true })

    if (bidsError) {
      console.error('🔴 [undoLastBidInDatabase] Error fetching bids:', bidsError)
      throw bidsError
    }

    if (!allBids || allBids.length === 0) {
      console.log('🟡 [undoLastBidInDatabase] No bids to undo')
      return
    }

    // Get the last bid (most recent)
    const lastBid = allBids[allBids.length - 1]
    console.log('🟡 [undoLastBidInDatabase] Removing bid:', lastBid)

    // Delete the last bid
    const { error: deleteError } = await supabase
      .from('bids')
      .delete()
      .eq('id', lastBid.id)

    if (deleteError) {
      console.error('🔴 [undoLastBidInDatabase] Error deleting bid:', deleteError)
      throw deleteError
    }

    console.log('🟡 [undoLastBidInDatabase] Bid deleted, now updating auction...')

    // Get the previous bid (if any) to set as current
    const previousBid = allBids.length > 1 ? allBids[allBids.length - 2] : null

    // Update the auction to reflect the previous bid
    const { error: auctionUpdateError } = await supabase
      .from('auctions')
      .update({
        current_bid: previousBid?.bid_amount || 0,
        highest_bidder_team_id: previousBid?.team_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auctionId)

    if (auctionUpdateError) {
      console.error('🔴 [undoLastBidInDatabase] Error updating auction:', auctionUpdateError)
      throw auctionUpdateError
    }

    console.log('🟢 [undoLastBidInDatabase] SUCCESS! Last bid removed and auction reverted')
  } catch (error) {
    console.error('🔴 [undoLastBidInDatabase] FAILED:', error)
    throw error
  }
}

/**
 * End auction and mark player as sold
 */
export async function endAuctionInDatabase(playerId: string, teamId: string, finalBid: number) {
  try {
    console.log('[endAuctionInDatabase] Ending auction:', { playerId, teamId, finalBid })

    // Close the auction
    const { error: auctionError } = await supabase
      .from('auctions')
      .update({
        status: 'closed',
        ended_at: new Date().toISOString(),
      })
      .eq('player_id', Number(playerId))
      .eq('status', 'active')

    if (auctionError) {
      console.error('[endAuctionInDatabase] Error closing auction:', auctionError)
      throw auctionError
    }

    // Mark player as sold (if you have this logic)
    console.log('[endAuctionInDatabase] Success! Auction closed')
  } catch (error) {
    console.error('[endAuctionInDatabase] Failed:', error)
    throw error
  }
}

/**
 * Cancel active auction
 */
export async function cancelAuctionInDatabase(playerId: string) {
  try {
    console.log('[cancelAuctionInDatabase] Cancelling auction for player:', playerId)

    const { error } = await supabase
      .from('auctions')
      .update({
        status: 'cancelled',
        ended_at: new Date().toISOString(),
      })
      .eq('player_id', Number(playerId))
      .eq('status', 'active')

    if (error) {
      console.error('[cancelAuctionInDatabase] Error:', error)
      throw error
    }

    console.log('[cancelAuctionInDatabase] Success!')
  } catch (error) {
    console.error('[cancelAuctionInDatabase] Failed:', error)
    throw error
  }
}
