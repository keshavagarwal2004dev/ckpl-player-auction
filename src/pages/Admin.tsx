import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuctionStore } from "@/stores/auctionStore";
import { Sport, PlayerCategory, SPORT_CONFIG, CATEGORY_CONFIG } from "@/types/auction";
import { Plus, Trash2, Edit, Users, User, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { players, teams, addPlayer, addTeam, deletePlayer, deleteTeam, updateTeam, resetAuction } = useAuctionStore();
  
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    sport: 'basketball' as Sport,
    category: 'district' as PlayerCategory,
    photoUrl: '',
  });

  const [newTeam, setNewTeam] = useState({
    name: '',
    sport: 'basketball' as Sport,
    maxBudget: 1000,
  });

  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);

  const handleAddPlayer = () => {
    if (!newPlayer.name.trim()) {
      toast.error('Player name is required');
      return;
    }
    if (!newPlayer.photoUrl.trim()) {
      toast.error('Player photo URL is required');
      return;
    }
    addPlayer(newPlayer);
    setNewPlayer({ name: '', sport: 'basketball', category: 'district', photoUrl: '' });
    setIsPlayerDialogOpen(false);
    toast.success('Player added successfully!');
  };

  const handleAddTeam = () => {
    if (!newTeam.name.trim()) {
      toast.error('Team name is required');
      return;
    }
    addTeam({
      ...newTeam,
      remainingBudget: newTeam.maxBudget,
    });
    setNewTeam({ name: '', sport: 'basketball', maxBudget: 1000 });
    setIsTeamDialogOpen(false);
    toast.success('Team added successfully!');
  };

  const handleResetAuction = (sport?: Sport) => {
    resetAuction(sport);
    toast.success(sport ? `${SPORT_CONFIG[sport].label} auction reset!` : 'All auctions reset!');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-wide text-foreground">ADMIN PANEL</h1>
            <p className="text-muted-foreground">Manage players, teams, and auction settings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleResetAuction()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </div>
        </div>

        <Tabs defaultValue="players" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="players" className="gap-2">
              <User className="h-4 w-4" />
              Players ({players.length})
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2">
              <Users className="h-4 w-4" />
              Teams ({teams.length})
            </TabsTrigger>
          </TabsList>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl">PLAYER MANAGEMENT</h2>
              <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Player
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">ADD NEW PLAYER</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Player Name</Label>
                      <Input
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                        placeholder="Enter player name"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <Label>Sport</Label>
                      <Select
                        value={newPlayer.sport}
                        onValueChange={(v) => setNewPlayer({ ...newPlayer, sport: v as Sport })}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basketball">🏀 Basketball</SelectItem>
                          <SelectItem value="football">⚽ Football</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={newPlayer.category}
                        onValueChange={(v) => setNewPlayer({ ...newPlayer, category: v as PlayerCategory })}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label} (Base: {config.startingBid} pts)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Photo URL</Label>
                      <Input
                        value={newPlayer.photoUrl}
                        onChange={(e) => setNewPlayer({ ...newPlayer, photoUrl: e.target.value })}
                        placeholder="https://example.com/photo.jpg"
                        className="bg-secondary border-border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter a URL for the player's photo (required)
                      </p>
                    </div>
                    {newPlayer.photoUrl && (
                      <div className="rounded-lg overflow-hidden bg-secondary h-32 w-24">
                        <img
                          src={newPlayer.photoUrl}
                          alt="Preview"
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      </div>
                    )}
                    <Button onClick={handleAddPlayer} className="w-full" variant="hero">
                      Add Player
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {players.length === 0 ? (
                <Card className="col-span-full p-8 text-center bg-card border-border/50">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No Players Yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first player to get started</p>
                  <Button onClick={() => setIsPlayerDialogOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Player
                  </Button>
                </Card>
              ) : (
                players.map((player) => (
                  <Card key={player.id} className="overflow-hidden bg-card border-border/50">
                    <div className="aspect-[4/3] relative bg-secondary">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt={player.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <User className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Badge variant={player.sport === 'basketball' ? 'basketball' : 'football'}>
                          {SPORT_CONFIG[player.sport].icon}
                        </Badge>
                        <Badge variant={player.category as any}>
                          {CATEGORY_CONFIG[player.category].label}
                        </Badge>
                      </div>
                      <Badge 
                        variant={player.status === 'auctioned' ? 'success' : player.status === 'unsold' ? 'destructive' : 'secondary'}
                        className="absolute top-2 right-2"
                      >
                        {player.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-xl text-foreground mb-2">{player.name.toUpperCase()}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Base: {CATEGORY_CONFIG[player.category].startingBid} pts
                        </span>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            deletePlayer(player.id);
                            toast.success('Player deleted');
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl">TEAM MANAGEMENT</h2>
              <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">ADD NEW TEAM</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Team Name</Label>
                      <Input
                        value={newTeam.name}
                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        placeholder="Enter team name"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <Label>Sport</Label>
                      <Select
                        value={newTeam.sport}
                        onValueChange={(v) => setNewTeam({ ...newTeam, sport: v as Sport })}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basketball">🏀 Basketball</SelectItem>
                          <SelectItem value="football">⚽ Football</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Maximum Budget (Points)</Label>
                      <Input
                        type="number"
                        value={newTeam.maxBudget}
                        onChange={(e) => setNewTeam({ ...newTeam, maxBudget: parseInt(e.target.value) || 0 })}
                        placeholder="1000"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <Button onClick={handleAddTeam} className="w-full" variant="hero">
                      Add Team
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {teams.length === 0 ? (
                <Card className="col-span-full p-8 text-center bg-card border-border/50">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No Teams Yet</h3>
                  <p className="text-muted-foreground mb-4">Add teams to start the auction</p>
                  <Button onClick={() => setIsTeamDialogOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team
                  </Button>
                </Card>
              ) : (
                teams.map((team) => (
                  <Card key={team.id} className="p-4 bg-card border-border/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl">
                          {SPORT_CONFIG[team.sport].icon}
                        </div>
                        <div>
                          <h3 className="font-display text-xl text-foreground">{team.name.toUpperCase()}</h3>
                          <Badge variant={team.sport === 'basketball' ? 'basketball' : 'football'}>
                            {SPORT_CONFIG[team.sport].label}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          deleteTeam(team.id);
                          toast.success('Team deleted');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="rounded-lg bg-secondary/50 p-3">
                        <div className="text-xs text-muted-foreground">Budget</div>
                        <div className="font-display text-lg text-foreground">{team.maxBudget}</div>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-3">
                        <div className="text-xs text-muted-foreground">Remaining</div>
                        <div className="font-display text-lg text-success">{team.remainingBudget}</div>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-3">
                        <div className="text-xs text-muted-foreground">Players</div>
                        <div className="font-display text-lg text-foreground">{team.players.length}</div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
