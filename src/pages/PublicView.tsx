import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuctionStore } from '@/stores/auctionStore';
import { useSupabaseData, useRealtimeAuctionState } from '@/hooks/useSupabaseData';
import { Sport, SPORT_CONFIG, CATEGORY_CONFIG } from '@/types/auction';
import { Users, Zap, TrendingUp, User, Trophy, Filter, Gavel, Timer, History, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export default function PublicView() {
  const { playersQuery, teamsQuery } = useSupabaseData();
  useRealtimeAuctionState(); // Enable real-time polling for auction state
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { players, teams, auctionState } = useAuctionStore();
  
  // Filter states
  const [filterSport, setFilterSport] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [teamFilterSport, setTeamFilterSport] = useState<string>('all');
  const [tabValue, setTabValue] = useState<'players' | 'teams' | 'live'>(auctionState.isActive ? 'live' : 'players');

  // Auto-refresh players and teams every 5 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      queryClient.refetchQueries({ queryKey: ['players'] });
      queryClient.refetchQueries({ queryKey: ['teams'] });
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(refreshInterval);
  }, [queryClient]);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (filterSport !== 'all' && p.sport !== filterSport) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      return true;
    });
  }, [players, filterSport, filterCategory, filterStatus]);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (teamFilterSport !== 'all' && t.sport !== teamFilterSport) return false;
      return true;
    });
  }, [teams, teamFilterSport]);

  const stats = [
    {
      icon: User,
      label: 'Total Players',
      value: players.length,
      color: 'text-blue-500',
      bg: 'bg-blue-100'
    },
    {
      icon: Users,
      label: 'Teams',
      value: teams.length,
      color: 'text-green-500',
      bg: 'bg-green-100'
    },
    {
      icon: TrendingUp,
      label: 'Auctioned',
      value: players.filter(p => p.status === 'auctioned').length,
      color: 'text-purple-500',
      bg: 'bg-purple-100'
    },
    {
      icon: Zap,
      label: 'Available',
      value: players.filter(p => p.status === 'available').length,
      color: 'text-yellow-500',
      bg: 'bg-yellow-100'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center py-4 sm:py-8">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">Auction: 27 Jan</Badge>
            <Badge variant="outline" className="text-xs">League: 2-5 Feb</Badge>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl tracking-wider text-foreground mb-1 sm:mb-2">
            CKPL AUCTION
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-1">CHRIST Kengeri Premier League</p>
          <p className="text-xs text-muted-foreground/70">Basketball & Football • Auction-based Team Selection</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-card border-border p-3 sm:p-4 text-center">
                <div className={`${stat.bg} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Tabs Section */}
        <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as any)} className="space-y-4 sm:space-y-6">
          {/* Live Auction Notification */}
          {auctionState.isActive && auctionState.currentPlayer && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-primary/10 border border-primary/30 items-start sm:items-center">
              <div className="flex items-center gap-2 flex-1">
                <Badge variant="live" className="gap-1">
                  <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                  LIVE
                </Badge>
                <span className="text-sm sm:text-base font-semibold text-foreground">
                  Live auction: <span className="text-primary">{auctionState.currentPlayer.name}</span>
                </span>
              </div>
              <Button 
                variant="hero" 
                size="sm" 
                onClick={() => setTabValue('live')}
                className="w-full sm:w-auto"
              >
                <Radio className="h-3 w-3" />
                <span className="hidden sm:inline">Watch Live</span>
                <span className="sm:hidden">Watch</span>
              </Button>
            </div>
          )}

          <TabsList className="bg-secondary w-full overflow-x-auto">
            <TabsTrigger value="players" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Players</span>
              <span className="sm:hidden">P</span>
              ({players.length})
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Teams</span>
              <span className="sm:hidden">T</span>
              ({teams.length})
            </TabsTrigger>
            {auctionState.isActive && auctionState.currentPlayer && (
              <TabsTrigger value="live" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 ml-auto">
                <Radio className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Live</span>
                <Badge variant="live" className="h-2 w-2 p-0 ml-1" />
              </TabsTrigger>
            )}
          </TabsList>

          {/* Live Tab */}
          <TabsContent value="live">
            {auctionState.isActive && auctionState.currentPlayer ? (
              <Card className="border-primary/50 bg-card/80 backdrop-blur">
                <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.4fr,1fr] p-3 sm:p-4">
                  {/* Player & bid */}
                  <div className="grid gap-3 md:grid-cols-[120px,1fr] lg:grid-cols-[140px,1fr] items-start md:items-center">
                    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-secondary w-full">
                      {auctionState.currentPlayer.photoUrl ? (
                        <img
                          src={auctionState.currentPlayer.photoUrl}
                          alt={auctionState.currentPlayer.name}
                          className="h-full w-full object-cover"
                          loading="eager"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <User className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={auctionState.currentPlayer.sport === 'basketball' ? 'basketball' : 'football'} className="text-xs sm:text-sm">
                          {SPORT_CONFIG[auctionState.currentPlayer.sport].icon}
                        </Badge>
                        <Badge variant={auctionState.currentPlayer.category as any}>
                          {CATEGORY_CONFIG[auctionState.currentPlayer.category].label}
                        </Badge>
                        {auctionState.countdown !== null && (
                          <Badge variant="warning" className="gap-1">
                            <Timer className="h-3 w-3" /> {auctionState.countdown}s
                          </Badge>
                        )}
                      </div>
                      <h2 className="font-display text-2xl text-foreground tracking-wide">
                        {auctionState.currentPlayer.name.toUpperCase()}
                      </h2>
                      <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
                        <div className="text-xs text-muted-foreground">Current Bid</div>
                        <div className="flex items-end gap-2">
                          <span className="font-display text-3xl text-primary">{auctionState.currentBid}</span>
                          <span className="text-sm text-muted-foreground">pts</span>
                        </div>
                        {auctionState.currentBidderName && (
                          <div className="mt-2 flex items-center gap-2 text-success text-sm">
                            <Gavel className="h-4 w-4" />
                            <span>{auctionState.currentBidderName}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Base: {CATEGORY_CONFIG[auctionState.currentPlayer.category].startingBid} pts · Increment: {CATEGORY_CONFIG[auctionState.currentPlayer.category].increment} pts
                      </div>
                    </div>
                  </div>

                  {/* Teams & bids */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Team bids</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 max-h-[260px] overflow-y-auto pr-1">
                      {teams
                        .filter((t) => t.sport === auctionState.currentPlayer?.sport)
                        .map((team) => {
                          const lastBid = [...auctionState.bids].reverse().find((b) => b.teamId === team.id);
                          const isLeader = auctionState.currentBidderId === team.id;
                          return (
                            <Card
                              key={team.id}
                              className={`p-3 ${isLeader ? 'border-success bg-success/10' : 'border-border/60 bg-card/80'}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-sm truncate">{team.name}</span>
                                <Badge variant="outline" className="text-[11px] px-2 py-1">
                                  {team.remainingBudget} pts left
                                </Badge>
                              </div>
                              <div className="text-[11px] text-muted-foreground mb-1">Last bid</div>
                              <div className="font-display text-lg text-foreground">
                                {lastBid ? `${lastBid.amount} pts` : '—'}
                              </div>
                              {isLeader && <Badge variant="success" className="mt-1 text-[10px]">Leading</Badge>}
                            </Card>
                          );
                        })}
                    </div>

                    {/* Bid history */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <History className="h-4 w-4" /> Recent bids
                      </div>
                      {auctionState.bids.length === 0 ? (
                        <Card className="p-3 text-sm text-muted-foreground bg-card/70 border-border/50">No bids yet</Card>
                      ) : (
                        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                          {[...auctionState.bids]
                            .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
                            .map((bid) => (
                              <Card key={bid.id} className="p-2 bg-card/80 border-border/50 flex justify-between text-xs">
                                <span className="font-semibold text-foreground">{bid.teamName}</span>
                                <span className="text-primary font-semibold">{bid.amount} pts</span>
                              </Card>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center bg-card border-border/60">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Radio className="h-6 w-6" />
                  <p className="text-sm">No live auction is running right now.</p>
                  <p className="text-xs">Check back when the next player is up for bidding.</p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filters:</span>
              </div>
              <Select value={filterSport} onValueChange={setFilterSport}>
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="basketball">🏀 Basketball</SelectItem>
                  <SelectItem value="football">⚽ Football</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="auctioned">Auctioned</SelectItem>
                  <SelectItem value="unsold">Unsold</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="ml-2">
                {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="grid gap-2 grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {filteredPlayers.length === 0 ? (
                <Card className="col-span-full p-8 text-center bg-card border-border/50">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{players.length === 0 ? 'No Players Yet' : 'No Players Match Filters'}</h3>
                  <p className="text-muted-foreground">{players.length === 0 ? 'Players will appear here soon' : 'Try adjusting your filters'}</p>
                </Card>
              ) : (
                filteredPlayers.map((player) => (
                  <Card key={player.id} className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all">
                    <div className="relative aspect-[3/4] bg-secondary">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt={player.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <User className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute top-1 left-1 flex flex-col gap-0.5">
                        <Badge variant={player.sport === 'basketball' ? 'basketball' : 'football'} className="text-[8px] px-1 py-0">
                          {SPORT_CONFIG[player.sport].icon}
                        </Badge>
                        <Badge variant={player.category as any} className="text-[8px] px-1 py-0">
                          {CATEGORY_CONFIG[player.category].label}
                        </Badge>
                      </div>
                      <Badge 
                        variant={player.status === 'auctioned' ? 'success' : player.status === 'unsold' ? 'destructive' : 'secondary'}
                        className="absolute top-1 right-1 text-[8px] px-1 py-0"
                      >
                        {player.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="p-2">
                      <h3 className="font-display text-xs text-foreground truncate">{player.name.toUpperCase()}</h3>
                      <div className="text-[9px] text-muted-foreground">
                        {CATEGORY_CONFIG[player.category].startingBid} pts
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            {/* Team Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filters:</span>
              </div>
              <Select value={teamFilterSport} onValueChange={setTeamFilterSport}>
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="basketball">🏀 Basketball</SelectItem>
                  <SelectItem value="football">⚽ Football</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="ml-2">
                {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredTeams.length === 0 ? (
                <Card className="col-span-full p-8 text-center bg-card border-border/50">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{teams.length === 0 ? 'No Teams Yet' : 'No Teams Match Filters'}</h3>
                  <p className="text-muted-foreground">{teams.length === 0 ? 'Teams will appear here soon' : 'Try adjusting your filters'}</p>
                </Card>
              ) : (
                filteredTeams.map((team) => {
                  const teamPlayers = players.filter(p => p.soldToTeamId === team.id);
                  const spentBudget = teamPlayers.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
                  const remainingBudget = team.maxBudget - spentBudget;

                  return (
                    <Card key={team.id} className="bg-card border-border p-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-display text-xl text-foreground">{team.name.toUpperCase()}</h3>
                            <Badge variant={team.sport === 'basketball' ? 'basketball' : 'football'}>
                              {SPORT_CONFIG[team.sport].icon}
                            </Badge>
                          </div>
                        </div>

                        {/* Budget Info */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Budget:</span>
                            <span className="font-semibold text-foreground">{team.maxBudget} pts</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Spent:</span>
                            <span className="font-semibold text-destructive">{spentBudget} pts</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remaining:</span>
                            <span className={`font-semibold ${remainingBudget > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {remainingBudget} pts
                            </span>
                          </div>
                        </div>

                        {/* Players List */}
                        {teamPlayers.length > 0 && (
                          <div className="border-t border-border pt-4">
                            <h4 className="font-semibold text-sm text-foreground mb-2">Players ({teamPlayers.length})</h4>
                            <div className="space-y-1">
                              {teamPlayers.map((p) => (
                                <div key={p.id} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{p.name}</span>
                                  <span className="font-semibold text-primary">{p.soldPrice} pts</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {teamPlayers.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">No players assigned yet</p>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
