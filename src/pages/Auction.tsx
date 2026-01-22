import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { LiveAuctionPanel } from "@/components/auction/LiveAuctionPanel";
import { useAuctionStore } from "@/stores/auctionStore";
import { Sport, Player, SPORT_CONFIG, CATEGORY_CONFIG } from "@/types/auction";
import { Play, Pause, RotateCcw, Filter, Users } from "lucide-react";
import { toast } from "sonner";

export default function Auction() {
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
    soldPlayer,
    unsoldPlayer,
  } = useAuctionStore();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('available');

  // Set initial sport
  useState(() => {
    if (!selectedSport) {
      setSelectedSport(initialSport);
    }
  });

  const currentSport = selectedSport || initialSport;
  const sportTeams = teams.filter(t => t.sport === currentSport);
  
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      if (p.sport !== currentSport) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      return true;
    });
  }, [players, currentSport, filterCategory, filterStatus]);

  const handleSelectPlayer = (player: Player) => {
    if (sportTeams.length < 2) {
      toast.error('Need at least 2 teams to start auction');
      return;
    }
    startAuction(player);
    toast.success(`${player.name} is now up for auction!`);
  };

  const handleBid = (teamId: string, amount: number) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      placeBid(teamId, team.name, amount);
    }
  };

  const handleSold = (teamId: string, amount: number) => {
    const team = teams.find(t => t.id === teamId);
    soldPlayer(teamId, amount);
    toast.success(`Sold to ${team?.name} for ${amount} points!`);
  };

  const handleUnsold = () => {
    unsoldPlayer();
    toast.info('Player marked as unsold');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-4xl tracking-wide text-foreground">LIVE AUCTION</h1>
              {auctionState.isActive && (
                <Badge variant="live" className="gap-1.5 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                  LIVE
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Select a player to start the bidding</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={currentSport} onValueChange={(v) => setSelectedSport(v as Sport)}>
              <SelectTrigger className="w-[160px] bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basketball">🏀 Basketball</SelectItem>
                <SelectItem value="football">⚽ Football</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredPlayers.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onSelect={handleSelectPlayer}
                  showActions={player.status === 'available'}
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
    </Layout>
  );
}
