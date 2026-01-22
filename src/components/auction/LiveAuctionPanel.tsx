import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Player, Team, CATEGORY_CONFIG, AuctionState } from "@/types/auction";
import { Gavel, Timer, TrendingUp, User, Check, X } from "lucide-react";

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
    <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
      {/* Main Player Display */}
      <Card className="relative overflow-hidden border-primary/30 bg-card">
        <div className="absolute inset-0 gradient-bid opacity-50" />
        
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="live" className="gap-1 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
              LIVE AUCTION
            </Badge>
            {auctionState.countdown !== null && (
              <Badge variant="warning" className="gap-1 text-lg px-4 py-2">
                <Timer className="h-4 w-4" />
                {auctionState.countdown}s
              </Badge>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-[250px,1fr]">
            {/* Player Photo */}
            <div className="aspect-[3/4] overflow-hidden rounded-xl bg-secondary">
              {player.photoUrl ? (
                <img 
                  src={player.photoUrl} 
                  alt={player.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Player Info & Bidding */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={player.category as any}>
                    {categoryConfig.label}
                  </Badge>
                  <Badge variant="outline">
                    Base: {categoryConfig.startingBid} pts
                  </Badge>
                </div>
                <h2 className="font-display text-5xl tracking-wide text-foreground">
                  {player.name.toUpperCase()}
                </h2>
              </div>

              {/* Current Bid Display */}
              <div className="rounded-xl gradient-bid border border-warning/30 p-6">
                <div className="text-sm text-muted-foreground mb-1">Current Bid</div>
                <div className="flex items-end gap-4">
                  <span className="font-display text-6xl text-warning bid-bounce">
                    {auctionState.currentBid || categoryConfig.startingBid}
                  </span>
                  <span className="text-2xl text-muted-foreground mb-2">PTS</span>
                </div>
                {auctionState.currentBidderName && (
                  <div className="mt-3 flex items-center gap-2 text-success">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">{auctionState.currentBidderName}</span>
                  </div>
                )}
              </div>

              {/* Bid Increment Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Next bid: +{categoryConfig.increment} pts</span>
                <span>•</span>
                <span>
                  Next amount: {(auctionState.currentBid || categoryConfig.startingBid) + categoryConfig.increment} pts
                </span>
              </div>

              {/* Admin Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="success" 
                  size="lg" 
                  className="flex-1 gap-2"
                  onClick={() => auctionState.currentBidderId && onSold(auctionState.currentBidderId, auctionState.currentBid)}
                  disabled={!auctionState.currentBidderId}
                >
                  <Check className="h-5 w-5" />
                  SOLD
                </Button>
                <Button 
                  variant="destructive" 
                  size="lg" 
                  className="flex-1 gap-2"
                  onClick={onUnsold}
                >
                  <X className="h-5 w-5" />
                  UNSOLD
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Team Bidding Panel */}
      <div className="space-y-4">
        <h3 className="font-display text-2xl tracking-wide">TEAM BIDS</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {teams.map(team => {
            const nextBid = auctionState.currentBid === 0 
              ? categoryConfig.startingBid 
              : auctionState.currentBid + categoryConfig.increment;
            const canBid = team.remainingBudget >= nextBid;
            const isHighestBidder = auctionState.currentBidderId === team.id;

            return (
              <Card 
                key={team.id}
                className={`p-4 transition-all ${
                  isHighestBidder 
                    ? 'border-success bg-success/10 card-glow-success' 
                    : 'border-border/50 bg-card hover:border-primary/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{team.name}</h4>
                    {isHighestBidder && (
                      <Badge variant="success" className="text-[10px]">HIGHEST</Badge>
                    )}
                  </div>
                  <Badge variant="outline">
                    {team.remainingBudget} pts left
                  </Badge>
                </div>
                
                <Button 
                  variant={isHighestBidder ? "success" : "bid"}
                  className="w-full gap-2"
                  disabled={!canBid || isHighestBidder}
                  onClick={() => handleBid(team.id)}
                >
                  <Gavel className="h-4 w-4" />
                  {isHighestBidder 
                    ? 'Leading' 
                    : canBid 
                      ? `Bid ${nextBid} pts` 
                      : 'Insufficient Budget'
                  }
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
