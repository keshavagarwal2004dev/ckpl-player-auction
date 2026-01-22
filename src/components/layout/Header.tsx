import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Users, Gavel, LogOut, LogIn, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/authApi";
import { toast } from "sonner";
import { useState } from "react";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to logout');
    }
  };

  const navItems = [
    { path: '/', icon: Gavel, label: 'Home', show: true },
    ...(user && isAdmin ? [
      { path: '/auction', icon: Gavel, label: 'Auction', show: true },
      { path: '/teams', icon: Users, label: 'Teams', show: true },
      { path: '/admin', icon: Settings, label: 'Admin', show: true },
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-gradient-to-b from-background/95 via-background/80 to-background/60 backdrop-blur-2xl">
      <div className="w-full px-3 sm:px-6 md:container md:mx-auto flex h-16 sm:h-20 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-accent font-bold text-white transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/50 group-hover:-translate-y-1">
            <span className="text-lg sm:text-xl font-space-grotesk">⚡</span>
          </div>
          <div className="flex flex-col gap-0">
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
              CKPL
            </span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Live Auction
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                className={`gap-2 transition-all duration-300 ${
                  isActive(item.path)
                    ? 'font-bold text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-semibold">{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="h-2 w-2 rounded-full bg-success/80 animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">{user.email}</span>
            </div>
          )}

          {!user ? (
            <Link to="/login">
              <Button
                variant="default"
                size="sm"
                className="gap-2 text-white font-bold hover:-translate-y-1 active:translate-y-0"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-destructive border-destructive/50 hover:border-destructive hover:bg-destructive/10 transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-background/80 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
              >
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={`w-full justify-start gap-3 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-semibold">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
