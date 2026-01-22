import { Layout } from "@/components/layout/Layout";
import { SportCard } from "@/components/cards/SportCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuctionStore } from "@/stores/auctionStore";
import { SPORT_CONFIG } from "@/types/auction";
import { Zap, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { players, teams } = useAuctionStore();

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
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl gradient-hero border border-border/50 p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="live" className="gap-1.5 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-current" />
                LIVE PLATFORM
              </Badge>
              <Badge variant="outline">Season 2025</Badge>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground mb-4">
              CKPL LIVE AUCTION
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8">
              Real-time points-based bidding system for Basketball and Football player auctions. 
              Dynamic admin controls, live updates, and complete team management.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/auction">
                <Button variant="hero" size="xl" className="gap-2">
                  <Zap className="h-5 w-5" />
                  Start Live Auction
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="outline" size="xl">
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Users className="h-4 w-4" />
              Total Teams
            </div>
            <p className="font-display text-3xl text-foreground">{totalTeams}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Total Players
            </div>
            <p className="font-display text-3xl text-foreground">{totalPlayers}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-muted-foreground text-sm mb-1">Auctioned</div>
            <p className="font-display text-3xl text-success">{totalAuctioned}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-muted-foreground text-sm mb-1">Available</div>
            <p className="font-display text-3xl text-primary">{totalPlayers - totalAuctioned}</p>
          </div>
        </section>

        {/* Sports Selection */}
        <section>
          <h2 className="font-display text-3xl tracking-wide text-foreground mb-6">
            SELECT SPORT
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <SportCard sport="basketball" {...getStats('basketball')} />
            <SportCard sport="football" {...getStats('football')} />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid gap-4 md:grid-cols-3">
          <Link to="/admin/players" className="group">
            <div className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="font-semibold text-foreground mb-1">Manage Players</h3>
              <p className="text-sm text-muted-foreground">Add, edit, and organize players</p>
            </div>
          </Link>
          <Link to="/admin/teams" className="group">
            <div className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold text-foreground mb-1">Manage Teams</h3>
              <p className="text-sm text-muted-foreground">Configure teams and budgets</p>
            </div>
          </Link>
          <Link to="/teams" className="group">
            <div className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-foreground mb-1">View Rosters</h3>
              <p className="text-sm text-muted-foreground">See team compositions</p>
            </div>
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
