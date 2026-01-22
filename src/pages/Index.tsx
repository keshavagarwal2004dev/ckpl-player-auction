import { Layout } from "@/components/layout/Layout";
import { SportCard } from "@/components/cards/SportCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuctionStore } from "@/stores/auctionStore";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { SPORT_CONFIG } from "@/types/auction";
import { Zap, TrendingUp, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PublicView from "./PublicView";

const Index = () => {
  useSupabaseData();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { players, teams } = useAuctionStore();

  // Show public view for non-admin users
  if (!user || !isAdmin) {
    return <PublicView />;
  }

  const getStats = (sport: 'basketball' | 'football') => {
    const sportPlayers = players.filter(p => p.sport === sport);
    const sportTeams = teams.filter(t => t.sport === sport);
    const auctionedCount = sportPlayers.filter(p => p.status === 'auctioned').length;
    return {
      teamsCount: sportTeams.length,
      playersCount: sportPlayers.length,
      auctionedCount,
    };
  };

  const totalPlayers = players.length;
  const totalAuctioned = players.filter(p => p.status === 'auctioned').length;
  const totalTeams = teams.length;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-xl sm:rounded-2xl gradient-hero border border-border/50 p-4 sm:p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Badge variant="live" className="gap-1.5 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-current" />
                LIVE
              </Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">Auction: 27 Jan</Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">League: 2-5 Feb</Badge>
            </div>
            
            <h1 className="font-display text-3xl sm:text-5xl md:text-7xl tracking-wide text-foreground mb-3 sm:mb-4">
              CKPL AUCTION
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mb-1 sm:mb-2">
              CHRIST Kengeri Premier League - Auction-based team selection for Basketball & Football
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/80 max-w-2xl mb-6 sm:mb-8">
              Department of Physical Education, CHRIST University - Kengeri Campus
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/auction" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="gap-2 w-full sm:w-auto">
                  <Zap className="h-4 w-4" />
                  Live Auction
                </Button>
              </Link>
              <Link to="/admin" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="rounded-lg sm:rounded-xl border border-border/50 bg-card p-3 sm:p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm mb-1.5 sm:mb-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Total Teams</span>
              <span className="sm:hidden">Teams</span>
            </div>
            <p className="font-display text-2xl sm:text-3xl text-foreground">{totalTeams}</p>
          </div>
          <div className="rounded-lg sm:rounded-xl border border-border/50 bg-card p-3 sm:p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm mb-1.5 sm:mb-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Total Players</span>
              <span className="sm:hidden">Players</span>
            </div>
            <p className="font-display text-2xl sm:text-3xl text-foreground">{totalPlayers}</p>
          </div>
          <div className="rounded-lg sm:rounded-xl border border-border/50 bg-card p-3 sm:p-4">
            <div className="text-muted-foreground text-xs sm:text-sm mb-1.5 sm:mb-2">Auctioned</div>
            <p className="font-display text-2xl sm:text-3xl text-success">{totalAuctioned}</p>
          </div>
          <div className="rounded-lg sm:rounded-xl border border-border/50 bg-card p-3 sm:p-4">
            <div className="text-muted-foreground text-xs sm:text-sm mb-1.5 sm:mb-2">Available</div>
            <p className="font-display text-3xl text-primary">{totalPlayers - totalAuctioned}</p>
          </div>
        </section>

        {/* Sports Selection */}
        <section>
          <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground mb-4 sm:mb-6">
            SELECT SPORT
          </h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <SportCard sport="basketball" {...getStats('basketball')} />
            <SportCard sport="football" {...getStats('football')} />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid gap-3 sm:gap-4 md:grid-cols-3">
          <Link to="/admin/players" className="group w-full">
            <div className="rounded-lg sm:rounded-xl border border-border/50 bg-card p-4 sm:p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">👤</div>
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Manage Players</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Add, edit, organize</p>
            </div>
          </Link>
          <Link to="/admin/teams" className="group w-full">
            <div className="rounded-lg sm:rounded-xl border border-border/50 bg-card p-4 sm:p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🏆</div>
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Manage Teams</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Configure & budgets</p>
            </div>
          </Link>
          <Link to="/teams" className="group w-full">
            <div className="rounded-lg sm:rounded-xl border border-border/50 bg-card p-4 sm:p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 h-full">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📊</div>
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">View Rosters</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Team compositions</p>
            </div>
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
