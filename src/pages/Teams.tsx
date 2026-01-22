import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamCard } from "@/components/cards/TeamCard";
import { useAuctionStore } from "@/stores/auctionStore";
import { Sport, SPORT_CONFIG, CATEGORY_CONFIG } from "@/types/auction";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Users, User, Coins, Trophy } from "lucide-react";

export default function Teams() {
  useSupabaseData();
  const [searchParams] = useSearchParams();
  const initialSport = (searchParams.get('sport') as Sport) || null;
  
  const { teams } = useAuctionStore();
  const [selectedSport, setSelectedSport] = useState<Sport | 'all'>(initialSport || 'all');

  const filteredTeams = useMemo(() => {
    if (selectedSport === 'all') return teams;
    return teams.filter(t => t.sport === selectedSport);
  }, [teams, selectedSport]);

  const totalBudgetUsed = filteredTeams.reduce((sum, t) => sum + (t.maxBudget - t.remainingBudget), 0);
  const totalPlayers = filteredTeams.reduce((sum, t) => sum + t.players.length, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-wide text-foreground">TEAM ROSTERS</h1>
            <p className="text-muted-foreground">View all teams and their acquired players</p>
          </div>

          <Select value={selectedSport} onValueChange={(v) => setSelectedSport(v as Sport | 'all')}>
            <SelectTrigger className="w-[160px] bg-secondary border-border">
              <SelectValue placeholder="Filter by sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              <SelectItem value="basketball">🏀 Basketball</SelectItem>
              <SelectItem value="football">⚽ Football</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Users className="h-4 w-4" />
              Teams
            </div>
            <p className="font-display text-3xl text-foreground">{filteredTeams.length}</p>
          </Card>
          <Card className="p-4 bg-card border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <User className="h-4 w-4" />
              Players Bought
            </div>
            <p className="font-display text-3xl text-foreground">{totalPlayers}</p>
          </Card>
          <Card className="p-4 bg-card border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Coins className="h-4 w-4" />
              Points Spent
            </div>
            <p className="font-display text-3xl text-warning">{totalBudgetUsed}</p>
          </Card>
          <Card className="p-4 bg-card border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Trophy className="h-4 w-4" />
              Avg per Player
            </div>
            <p className="font-display text-3xl text-primary">
              {totalPlayers > 0 ? Math.round(totalBudgetUsed / totalPlayers) : 0}
            </p>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map(team => (
            <div key={team.id} className="space-y-4">
              <TeamCard team={team} />
              
              {/* Team's Players */}
              {team.players.length > 0 && (
                <Card className="p-4 bg-card border-border/50">
                  <h4 className="font-semibold text-foreground mb-3">Squad ({team.players.length})</h4>
                  <div className="space-y-2">
                    {team.players.map(player => (
                      <div 
                        key={player.id} 
                        className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2"
                      >
                        <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                          {player.photoUrl ? (
                            <img src={player.photoUrl} alt={player.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{player.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={player.category as any} className="text-[10px] h-4 px-1.5">
                              {CATEGORY_CONFIG[player.category].label}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg text-success">{player.soldPrice}</p>
                          <p className="text-[10px] text-muted-foreground">pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ))}
          
          {filteredTeams.length === 0 && (
            <Card className="col-span-full p-8 text-center bg-card border-border/50">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Teams Found</h3>
              <p className="text-muted-foreground">
                {teams.length === 0 
                  ? 'Add teams in the Admin Panel to get started.'
                  : 'No teams match the selected filter.'}
              </p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
