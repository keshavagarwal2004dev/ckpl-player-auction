import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sport, SPORT_CONFIG } from "@/types/auction";
import { Users, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SportCardProps {
  sport: Sport;
  teamsCount: number;
  playersCount: number;
  auctionedCount: number;
}

export function SportCard({ sport, teamsCount, playersCount, auctionedCount }: SportCardProps) {
  const config = SPORT_CONFIG[sport];
  const progress = playersCount > 0 ? (auctionedCount / playersCount) * 100 : 0;

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-2rem] text-8xl opacity-10 transition-all duration-300 group-hover:opacity-20">
        {config.icon}
      </div>
      
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant={sport === 'basketball' ? 'basketball' : 'football'} className="mb-2">
              {config.icon} {config.label}
            </Badge>
            <h3 className="font-display text-3xl tracking-wide text-foreground">
              {config.label.toUpperCase()}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span className="text-xs">Teams</span>
            </div>
            <p className="font-display text-2xl text-foreground">{teamsCount}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Trophy className="h-3 w-3" />
              <span className="text-xs">Players</span>
            </div>
            <p className="font-display text-2xl text-foreground">{playersCount}</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Auctioned</div>
            <p className="font-display text-2xl text-success">{auctionedCount}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Auction Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Link to={`/auction?sport=${sport}`} className="flex-1">
            <Button variant="hero" className="w-full gap-2">
              Live Auction
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/teams?sport=${sport}`}>
            <Button variant="outline" size="icon">
              <Users className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
