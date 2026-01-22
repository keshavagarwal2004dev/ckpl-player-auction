import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { LiveAuctionPanel } from "@/components/auction/LiveAuctionPanel";
import { useAuctionStore } from "@/stores/auctionStore";
import { Sport, Player, SPORT_CONFIG, CATEGORY_CONFIG } from "@/types/auction";
import { useSupabaseData, useSupabaseMutations } from "@/hooks/useSupabaseData";
import { Play, Pause, RotateCcw, Filter, Users, Plus } from "lucide-react";
import { toast } from "sonner";

export default function Auction() {
  useSupabaseData();
  const [searchParams] = useSearchParams();
  const initialSport = (searchParams.get('sport') as Sport) || 'basketball';
  
  const { 
    players, 
    teams, 
    auctionState,
    selectedSport,
    setSelectedSport,
    startAuction,
    placeBid,
    endAuction,
    setCountdown,
  } = useAuctionStore();
  const { markSoldMutation, markUnsoldMutation, addTeamMutation } = useSupabaseMutations();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('available');
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', sport: initialSport, maxBudget: 1000 });
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Set initial sport after mount to avoid setState during render
  useEffect(() => {
    if (!selectedSport) {
      setSelectedSport(initialSport);
    }
  }, [initialSport, selectedSport, setSelectedSport]);

  const currentSport = selectedSport || initialSport;
  const sportTeams = teams.filter(t => t.sport === currentSport);

  // Keep quick-add team form in sync with selected sport
  useEffect(() => {
    setNewTeam((prev) => ({ ...prev, sport: currentSport }));
  }, [currentSport]);

  // Countdown timer effect
  useEffect(() => {
    if (!auctionState.isActive || auctionState.countdown === null) {
      setIsTimerRunning(false);
      return;
    }

    setIsTimerRunning(true);
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [auctionState.isActive, auctionState.countdown, setCountdown]);

  // Auto-resolve when countdown hits zero
  useEffect(() => {
    if (!auctionState.isActive) return;
    if (auctionState.countdown !== 0) return;

    if (auctionState.currentBidderId) {
      handleSold(auctionState.currentBidderId, auctionState.currentBid);
    } else {
      handleUnsold();
    }
    setCountdown(null);
    setIsTimerRunning(false);
  }, [auctionState.countdown, auctionState.isActive]);
  
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      if (p.sport !== currentSport) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (filterStatus === 'available' && !['available', 'unsold'].includes(p.status)) return false;
      if (filterStatus === 'unsold' && p.status !== 'unsold') return false;
      if (filterStatus === 'auctioned' && p.status !== 'auctioned') return false;
      return true;
    });
  }, [players, currentSport, filterCategory, filterStatus]);

  const handleAddTeam = async () => {
    if (!newTeam.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    if (newTeam.maxBudget <= 0) {
      toast.error('Budget must be greater than 0');
      return;
    }

    try {
      await addTeamMutation.mutateAsync({
        name: newTeam.name.trim(),
        sport: newTeam.sport as Sport,
        maxBudget: newTeam.maxBudget,
      });
      toast.success('Team created');
      setIsTeamDialogOpen(false);
      setNewTeam({ name: '', sport: currentSport, maxBudget: 1000 });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create team');
    }
  };

  const handleSelectPlayer = (player: Player) => {
    if (sportTeams.length < 2) {
      toast.error('Need at least 2 teams to start auction');
      return;
    }
    const startingBid = CATEGORY_CONFIG[player.category].startingBid;
    startAuction(player, startingBid);
    toast.success(`${player.name} is now up for auction!`);
  };

  const handleBid = (teamId: string, amount: number) => {
    const team = teams.find(t => t.id === teamId);
    const player = auctionState.currentPlayer;
    if (!team || !player) return;

    if (amount > team.remainingBudget) {
      toast.error('Bid exceeds team remaining points');
      return;
    }

    const increment = CATEGORY_CONFIG[player.category].increment;
    if (amount < auctionState.currentBid + increment) {
      toast.error(`Next bid must be at least ${auctionState.currentBid + increment}`);
      return;
    }

    placeBid(teamId, team.name, amount);
  };

  const startTimer = (seconds: number) => {
    setCountdown(seconds);
    setIsTimerRunning(true);
  };

  const clearTimer = () => {
    setCountdown(null);
    setIsTimerRunning(false);
  };

  const handleSold = async (teamId: string, amount: number) => {
    const team = teams.find(t => t.id === teamId);
    const player = auctionState.currentPlayer;
    if (!player || !team) return;

    try {
      await markSoldMutation.mutateAsync({ playerId: player.id, teamId, amount });
      endAuction();
      toast.success(`Sold to ${team?.name} for ${amount} points!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to mark as sold');
    }
  };

  const handleUnsold = async () => {
    const player = auctionState.currentPlayer;
    if (!player) return;
    try {
      await markUnsoldMutation.mutateAsync(player.id);
      endAuction();
      toast.info('Player marked as unsold');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to mark unsold');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wide text-foreground">LIVE AUCTION</h1>
              {auctionState.isActive && (
                <Badge variant="live" className="gap-1.5 px-3 py-1 w-fit">
                  <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                  LIVE
                </Badge>
              )}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">Select a player to start the bidding</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Select value={currentSport} onValueChange={(v) => setSelectedSport(v as Sport)}>
              <SelectTrigger className="w-full sm:w-[160px] bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basketball">🏀 Basketball</SelectItem>
                <SelectItem value="football">⚽ Football</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="gap-2 w-full sm:w-auto"
              onClick={() => setIsTeamDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Team</span>
              <span className="sm:hidden">Add</span>
            </Button>
            {auctionState.isActive && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={() => startTimer(30)} disabled={isTimerRunning} className="flex-1 sm:flex-none">
                  30s
                </Button>
                <Button variant="outline" size="sm" onClick={() => startTimer(60)} disabled={isTimerRunning} className="flex-1 sm:flex-none">
                  60s
                </Button>
                <Button variant="ghost" size="sm" onClick={clearTimer} className="flex-1 sm:flex-none">
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Teams Summary */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {sportTeams.map(team => (
            <Card key={team.id} className="flex-shrink-0 p-3 bg-card border-border/50 min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{SPORT_CONFIG[team.sport].icon}</span>
                <span className="font-semibold text-sm truncate">{team.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Budget:</span>
                <span className="text-success font-medium">{team.remainingBudget} pts</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Players:</span>
                <span>{team.players.length}/{SPORT_CONFIG[team.sport].minPlayers}</span>
              </div>
              {team.players.length < SPORT_CONFIG[team.sport].minPlayers && (
                <div className="mt-1 text-[11px] text-warning font-semibold">Needs {SPORT_CONFIG[team.sport].minPlayers - team.players.length} more</div>
              )}
            </Card>
          ))}
          {sportTeams.length === 0 && (
            <Card className="flex-1 p-6 text-center bg-card border-border/50">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No teams for {SPORT_CONFIG[currentSport].label}. Add teams in Admin Panel.</p>
            </Card>
          )}
        </div>

        {/* Active Auction */}
        {auctionState.isActive && auctionState.currentPlayer && (
          <LiveAuctionPanel
            player={auctionState.currentPlayer}
            teams={sportTeams}
            auctionState={auctionState}
            onBid={handleBid}
            onSold={handleSold}
            onUnsold={handleUnsold}
          />
        )}

        {/* Player Selection */}
        {!auctionState.isActive && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filters:</span>
              </div>
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
            </div>

            {/* Players Grid */}
            <div className="grid gap-2 grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {filteredPlayers.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onSelect={handleSelectPlayer}
                  showActions={player.status !== 'auctioned'}
                />
              ))}
              {filteredPlayers.length === 0 && (
                <Card className="col-span-full p-8 text-center bg-card border-border/50">
                  <p className="text-muted-foreground">
                    No players found. {players.filter(p => p.sport === currentSport).length === 0 
                      ? 'Add players in Admin Panel.' 
                      : 'Try adjusting filters.'}
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Team Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">ADD TEAM ({SPORT_CONFIG[currentSport].label})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Team Name</Label>
              <Input
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Enter team name"
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label>Sport</Label>
              <Input value={SPORT_CONFIG[currentSport].label} disabled className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Maximum Budget (Points)</Label>
              <Input
                type="number"
                value={newTeam.maxBudget}
                onChange={(e) => setNewTeam({ ...newTeam, maxBudget: parseInt(e.target.value) || 0 })}
                placeholder="1000"
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" variant="hero" onClick={handleAddTeam} disabled={addTeamMutation.isPending}>
                {addTeamMutation.isPending ? 'Saving...' : 'Create Team'}
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
