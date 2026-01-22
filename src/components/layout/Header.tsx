import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Users, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl tracking-wider text-foreground">
              CKPL
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Live Auction
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/">
            <Button
              variant={isActive("/") ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Trophy className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/auction">
            <Button
              variant={isActive("/auction") ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Badge variant="live" className="h-2 w-2 p-0" />
              Live Auction
            </Button>
          </Link>
          <Link to="/teams">
            <Button
              variant={isActive("/teams") ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Teams
            </Button>
          </Link>
          <Link to="/admin">
            <Button
              variant={isActive("/admin") ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Admin
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex">
            Season 2025
          </Badge>
        </div>
      </div>
    </header>
  );
}
