import { Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-white/10">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 backdrop-blur-xl" />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/30">
                ⚡
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">CKPL</h3>
                <p className="text-xs text-muted-foreground">Premier League</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The ultimate auction platform for CHRIST Kengeri Premier League. Build your dream team through strategic bidding.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3">
              <a 
                href="https://github.com/keshavagarwal2004dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-card border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300"
              >
                <Github className="h-4 w-4" />
              </a>
              <a 
                href="https://www.linkedin.com/in/kesh2004ag/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-card border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="/auction" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                  Live Auction
                </a>
              </li>
              <li>
                <a href="/teams" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                  Teams
                </a>
              </li>
              <li>
                <a href="/view" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                  Players
                </a>
              </li>
              <li>
                <a href="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                  Admin Panel
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright & Credits */}
            <div className="text-center md:text-left space-y-1">
              <p className="text-[10px] text-muted-foreground/70">
                CHRIST Kengeri Premier League • Department of Physical Education • CHRIST (Deemed to be University)
              </p>
            </div>
            
            {/* Version */}
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-md bg-card border border-white/10">
                <span className="text-[10px] font-mono text-muted-foreground">v1.0.0</span>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <span className="text-[10px] font-semibold text-primary">January 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
