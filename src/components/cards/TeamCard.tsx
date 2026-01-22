import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Team, SPORT_CONFIG } from "@/types/auction";
import { Users, Coins, AlertCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface TeamCardProps {
  team: Team;
  compact?: boolean;
}

export function TeamCard({ team, compact = false }: TeamCardProps) {
  const sportConfig = SPORT_CONFIG[team.sport];
  const playersNeeded = Math.max(0, sportConfig.minPlayers - team.players.length);
  const budgetPercent = (team.remainingBudget / team.maxBudget) * 100;

  if (compact) {
    return (
      <Card className="flex items-center justify-between border-border/50 bg-card p-4 transition-all hover:border-primary/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-xl">
            {sportConfig.icon}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{team.name}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{team.players.length} players</span>
              <span>•</span>
              <span>{team.remainingBudget} pts left</span>
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30">
      <div className="border-b border-border/50 bg-gradient-to-r from-secondary to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background text-2xl shadow-inner">
              {sportConfig.icon}
            </div>
            <div>
              <h3 className="font-display text-2xl tracking-wide text-foreground">
                {team.name.toUpperCase()}
              </h3>
              <Badge variant={team.sport === 'basketball' ? 'basketball' : 'football'} className="mt-1">
                {sportConfig.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Coins className="h-3 w-3" />
              Budget Remaining
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl text-foreground">{team.remainingBudget}</span>
              <span className="text-xs text-muted-foreground">/ {team.maxBudget} pts</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
              <div 
                className={`h-full rounded-full transition-all ${
                  budgetPercent > 50 ? 'bg-success' : budgetPercent > 20 ? 'bg-warning' : 'bg-destructive'
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Users className="h-3 w-3" />
              Squad Size
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl text-foreground">{team.players.length}</span>
              <span className="text-xs text-muted-foreground">/ {sportConfig.minPlayers} min</span>
            </div>
            {playersNeeded > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-warning">
                <AlertCircle className="h-3 w-3" />
                Need {playersNeeded} more
              </div>
            )}
          </div>
        </div>

        {team.players.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Recent Signings</div>
            <div className="flex -space-x-2">
              {team.players.slice(0, 5).map((player, i) => (
                <div 
                  key={player.id}
                  className="h-8 w-8 rounded-full border-2 border-card bg-secondary flex items-center justify-center text-xs font-bold overflow-hidden"
                  title={player.name}
                >
                  {player.photoUrl ? (
                    <img src={player.photoUrl} alt={player.name} className="h-full w-full object-cover" />
                  ) : (
                    player.name.charAt(0)
                  )}
                </div>
              ))}
              {team.players.length > 5 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-xs font-bold text-primary-foreground">
                  +{team.players.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        <Link to={`/teams/${team.id}`}>
          <Button variant="outline" className="w-full">
            View Full Squad
          </Button>
        </Link>
      </div>
    </Card>
  );
}
