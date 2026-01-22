import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Player, CATEGORY_CONFIG, SPORT_CONFIG } from "@/types/auction";
import { Gavel, User } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  onSelect?: (player: Player) => void;
  showActions?: boolean;
  isSelected?: boolean;
}

export function PlayerCard({ player, onSelect, showActions = true, isSelected }: PlayerCardProps) {
  const categoryConfig = CATEGORY_CONFIG[player.category];
  const sportConfig = SPORT_CONFIG[player.sport];

  return (
    <Card 
      className={`group relative overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/50 ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
      } ${player.status === 'auctioned' ? 'opacity-60' : ''}`}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-secondary">
        {player.photoUrl ? (
          <img 
            src={player.photoUrl} 
            alt={player.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-20 w-20 text-muted-foreground/30" />
          </div>
        )}
        
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <Badge variant={player.category as any} className="text-[10px]">
            {categoryConfig.label}
          </Badge>
          <Badge variant={player.sport === 'basketball' ? 'basketball' : 'football'} className="text-[10px]">
            {sportConfig.icon}
          </Badge>
        </div>

        {player.status === 'auctioned' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Badge variant="success" className="text-sm">SOLD</Badge>
          </div>
        )}

        {player.status === 'unsold' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Badge variant="destructive" className="text-sm">UNSOLD</Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display text-xl tracking-wide text-foreground truncate">
            {player.name.toUpperCase()}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Base: {categoryConfig.startingBid} pts</span>
            <span>•</span>
            <span>+{categoryConfig.increment}</span>
          </div>
        </div>

        {player.soldPrice && (
          <div className="flex items-center justify-between rounded-lg bg-success/10 px-3 py-2">
            <span className="text-xs text-muted-foreground">Sold for</span>
            <span className="font-display text-lg text-success">{player.soldPrice} PTS</span>
          </div>
        )}

        {showActions && player.status === 'available' && onSelect && (
          <Button 
            variant="bid" 
            className="w-full gap-2"
            onClick={() => onSelect(player)}
          >
            <Gavel className="h-4 w-4" />
            Select for Auction
          </Button>
        )}
      </div>
    </Card>
  );
}
