import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Player, Team, CATEGORY_CONFIG, AuctionState, SPORT_CONFIG } from "@/types/auction";
import { Gavel, Timer, TrendingUp, User, Check, X, History } from "lucide-react";

interface LiveAuctionPanelProps {
  player: Player;
  teams: Team[];
  onBid: (teamId: string, amount: number) => void;
  onSold: (teamId: string, amount: number) => void;
  onUnsold: () => void;
  auctionState: AuctionState;
}

export function LiveAuctionPanel({ 
  player, 
  teams, 
  onBid, 
  onSold, 
  onUnsold,
  auctionState 
}: LiveAuctionPanelProps) {
  const categoryConfig = CATEGORY_CONFIG[player.category];
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const handleBid = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const nextBid = auctionState.currentBid === 0 
      ? categoryConfig.startingBid 
      : auctionState.currentBid + categoryConfig.increment;

    if (team.remainingBudget >= nextBid) {
      onBid(teamId, nextBid);
      setSelectedTeam(teamId);
    }
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,340px]">
      {/* Main Player Display */}
      <Card className="relative overflow-hidden border-primary/30 bg-card">
        <div className="absolute inset-0 gradient-bid opacity-40" />

        <div className="relative p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <Badge variant="live" className="gap-1 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
              LIVE AUCTION
            </Badge>
            {auctionState.countdown !== null && (
              <Badge variant="warning" className="gap-1 px-3 py-1.5 text-sm sm:text-base">
                <Timer className="h-4 w-4" />
                {auctionState.countdown}s
              </Badge>
            )}
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-[200px,1fr] lg:grid-cols-[220px,1fr]">
            {/* Player Photo */}
            <div className="aspect-[3/4] overflow-hidden rounded-lg md:rounded-xl bg-secondary w-full md:w-auto">
              {player.photoUrl ? (
                <img 
                  src={player.photoUrl} 
                  alt={player.name}
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-20 w-20 sm:h-24 sm:w-24 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Player Info & Bidding */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant={player.category as any}>
                    {categoryConfig.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    Base: {categoryConfig.startingBid} pts
                  </Badge>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wide text-foreground line-clamp-2">
                  {player.name.toUpperCase()}
                </h2>
                {player.position && (
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {player.position}
                  </div>
                )}
              </div>

              {/* Current Bid Display */}
              <div className="rounded-lg sm:rounded-xl gradient-bid border border-warning/30 p-3 sm:p-4">
                <div className="text-xs text-muted-foreground mb-1">Current Bid</div>
                <div className="flex items-end gap-2 sm:gap-3">
                  <span className="font-display text-3xl sm:text-4xl md:text-5xl text-warning bid-bounce">
                    {auctionState.currentBid || categoryConfig.startingBid}
                  </span>
                  <span className="text-lg sm:text-xl text-muted-foreground mb-1">PTS</span>
                </div>
                {auctionState.currentBidderName && (
                  <div className="mt-2 sm:mt-3 flex items-center gap-2 text-success text-sm">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium truncate">{auctionState.currentBidderName}</span>
                  </div>
                )}
                {auctionState.countdown !== null && (
                  <div className="mt-2 sm:mt-3 flex items-center gap-2 text-warning text-sm">
                    <Timer className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-semibold">{auctionState.countdown}s left</span>
                  </div>
                )}
              </div>

              {/* Bid Increment Info */}
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                <span>Increment: +{categoryConfig.increment} pts</span>
                <span className="hidden sm:inline">•</span>
                <span>Next: {(auctionState.currentBid || categoryConfig.startingBid) + categoryConfig.increment} pts</span>
              </div>

              {/* Admin Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="success" 
                  size="sm" 
                  className="flex-1 gap-2 text-xs sm:text-sm"
                  onClick={() => auctionState.currentBidderId && onSold(auctionState.currentBidderId, auctionState.currentBid)}
                  disabled={!auctionState.currentBidderId}
                >
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">SOLD</span>
                  <span className="sm:hidden">Sold</span>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1 gap-2 text-xs sm:text-sm"
                  onClick={onUnsold}
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">UNSOLD</span>
                  <span className="sm:hidden">Unsold</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Team Bidding Panel */}
      <div className="space-y-3 lg:max-h-[600px] lg:overflow-y-auto">
        <h3 className="font-display text-lg sm:text-xl tracking-wide">TEAM BIDS</h3>
        <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          {teams.map(team => {
            const nextBid = auctionState.currentBid === 0 
              ? categoryConfig.startingBid 
              : auctionState.currentBid + categoryConfig.increment;
            const canBid = team.remainingBudget >= nextBid;
            const isHighestBidder = auctionState.currentBidderId === team.id;
            const playersNeeded = Math.max(0, SPORT_CONFIG[team.sport].minPlayers - team.players.length);

            return (
              <Card 
                key={team.id}
                className={`p-2 sm:p-3 transition-all ${
                  isHighestBidder 
                    ? 'border-success bg-success/10 card-glow-success' 
                    : 'border-border/50 bg-card hover:border-primary/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm truncate">{team.name}</h4>
                    {isHighestBidder && (
                      <Badge variant="success" className="text-[9px] sm:text-[10px] flex-shrink-0">HIGHEST</Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] sm:text-[11px] px-1.5 py-0.5 flex-shrink-0">
                    {team.remainingBudget} pts
                  </Badge>
                </div>
                <div className="flex justify-between text-[10px] sm:text-[11px] text-muted-foreground mb-1">
                  <span>Roster</span>
                  <span className="font-semibold text-foreground">{team.players.length}/{SPORT_CONFIG[team.sport].minPlayers}</span>
                </div>
                {playersNeeded > 0 && (
                  <div className="text-[10px] sm:text-[11px] text-warning mb-2">Needs {playersNeeded} more</div>
                )}
                
                <Button 
                  variant={isHighestBidder ? "success" : "bid"}
                  size="sm"
                  className="w-full gap-1 sm:gap-2 text-[11px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2"
                  disabled={!canBid || isHighestBidder}
                  onClick={() => handleBid(team.id)}
                >
                  <Gavel className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">
                    {isHighestBidder 
                      ? 'Leading' 
                      : canBid 
                        ? `Bid ${nextBid}` 
                        : 'No Budget'
                    }
                  </span>
                  <span className="sm:hidden">
                    {isHighestBidder 
                      ? '👑' 
                      : canBid 
                        ? '🔨' 
                        : '❌'
                    }
                  </span>
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Bid History */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2">
            <History className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Bid History</h4>
          </div>
          {auctionState.bids.length === 0 ? (
            <Card className="p-2 sm:p-3 text-xs sm:text-sm text-muted-foreground bg-card border-border/50">
              No bids yet
            </Card>
          ) : (
            <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto pr-1">
              {[...auctionState.bids].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).map((bid) => (
                <Card key={bid.id} className="p-2 sm:p-3 bg-card border-border/50 flex justify-between items-center gap-2">
                  <div className="flex flex-col text-xs sm:text-sm min-w-0">
                    <span className="font-semibold text-foreground truncate">{bid.teamName}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{new Date(bid.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <Badge variant="outline" className="text-xs sm:text-sm flex-shrink-0">{bid.amount} pts</Badge>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
