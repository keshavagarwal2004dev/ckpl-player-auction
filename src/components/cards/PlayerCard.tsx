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
      className={`group relative overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/50 w-full ${
        isSelected ? 'ring-1 ring-primary' : ''
      } ${player.status === 'auctioned' ? 'opacity-60' : ''}`}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-secondary w-full">
        {player.photoUrl ? (
          <img 
            src={player.photoUrl} 
            alt={player.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        
        <div className="absolute left-1 top-1 flex flex-col gap-0.5">
          <Badge variant={player.category as any} className="text-[8px] px-1 py-0">
            {categoryConfig.label}
          </Badge>
          <Badge variant={player.sport === 'basketball' ? 'basketball' : 'football'} className="text-[8px] px-1 py-0">
            {sportConfig.icon}
          </Badge>
        </div>

        {player.status === 'auctioned' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Badge variant="success" className="text-[10px]">SOLD</Badge>
          </div>
        )}

        {player.status === 'unsold' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Badge variant="destructive" className="text-[10px]">UNSOLD</Badge>
          </div>
        )}
      </div>

      <div className="p-2 sm:p-3 space-y-1.5 w-full">
        <div>
          <h3 className="font-display text-xs sm:text-sm tracking-wide text-foreground truncate line-clamp-2">
            {player.name.toUpperCase()}
          </h3>
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground">
            <span>{categoryConfig.startingBid}</span>
            <span>•</span>
            <span>+{categoryConfig.increment}</span>
          </div>
        </div>

        {player.soldPrice && (
          <div className="flex items-center justify-between rounded bg-success/10 px-2 py-1">
            <span className="text-[9px] text-muted-foreground">Sold</span>
            <span className="font-display text-xs text-success">{player.soldPrice}</span>
          </div>
        )}

        {showActions && player.status !== 'auctioned' && onSelect && (
          <Button 
            variant="bid" 
            size="sm"
            className="w-full gap-1 h-7 text-[10px]"
            onClick={() => onSelect(player)}
          >
            <Gavel className="h-3 w-3" />
            Auction
          </Button>
        )}
      </div>
    </Card>
  );
}
