import { useState, useMemo } from "react";
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
import { useSupabaseData, useSupabaseMutations } from "@/hooks/useSupabaseData";
import { Sport, PlayerCategory, SPORT_CONFIG, CATEGORY_CONFIG, Player } from "@/types/auction";
import { Plus, Trash2, Edit, Users, User, RefreshCw, Upload, Filter, RotateCcw } from "lucide-react";
import { uploadPlayerPhoto } from "@/lib/storage";
import { toast } from "sonner";

export default function Admin() {
  useSupabaseData();
  const { players, teams } = useAuctionStore();
  
  const { addPlayerMutation, editPlayerMutation, addTeamMutation, deletePlayerMutation, deleteTeamMutation, markUnsoldMutation, resetMutation } = useSupabaseMutations();
  
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    sport: 'basketball' as Sport,
    category: 'district' as PlayerCategory,
    photoUrl: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newTeam, setNewTeam] = useState({
    name: '',
    sport: 'basketball' as Sport,
    maxBudget: 1000,
  });

  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  
  // Filter states
  const [filterSport, setFilterSport] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleAddPlayer = async () => {
    if (!newPlayer.name.trim()) {
      toast.error('Player name is required');
      return;
    }
    if (!photoFile && !newPlayer.photoUrl.trim()) {
      toast.error('Player photo is required');
      return;
    }

    try {
      let photoUrl = newPlayer.photoUrl;
      if (photoFile) {
        photoUrl = await uploadPlayerPhoto(photoFile);
      }

      await addPlayerMutation.mutateAsync({ ...newPlayer, photoUrl });
      setNewPlayer({ name: '', sport: 'basketball', category: 'district', photoUrl: '' });
      setPhotoFile(null);
      setIsPlayerDialogOpen(false);
      toast.success('Player added successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add player');
    }
  };

  const handleAddTeam = async () => {
    if (!newTeam.name.trim()) {
      toast.error('Team name is required');
      return;
    }
    try {
      await addTeamMutation.mutateAsync(newTeam);
      setNewTeam({ name: '', sport: 'basketball', maxBudget: 1000 });
      setIsTeamDialogOpen(false);
      toast.success('Team added successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add team');
    }
  };

  const handleResetAuction = async (sport?: Sport) => {
    try {
      await resetMutation.mutateAsync(sport);
      toast.success(sport ? `${SPORT_CONFIG[sport].label} auction reset!` : 'All auctions reset!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reset auction');
    }
  };

  const handleEditPlayer = async () => {
    if (!editingPlayer) return;
    if (!editingPlayer.name.trim()) {
      toast.error('Player name is required');
      return;
    }

    try {
      let photoUrl = editingPlayer.photoUrl;
      if (photoFile) {
        photoUrl = await uploadPlayerPhoto(photoFile);
      }

      await editPlayerMutation.mutateAsync({
        id: editingPlayer.id,
        name: editingPlayer.name,
        sport: editingPlayer.sport,
        category: editingPlayer.category,
        photoUrl,
      });
      setEditingPlayer(null);
      setPhotoFile(null);
      setIsEditDialogOpen(false);
      toast.success('Player updated successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update player');
    }
  };

  // Filtered players based on sport, category, and status
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      if (filterSport !== 'all' && p.sport !== filterSport) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      return true;
    });
  }, [players, filterSport, filterCategory, filterStatus]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-wide text-foreground">ADMIN PANEL</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage players, teams, and auction settings</p>
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
                    <div className="space-y-2">
                      <Label>Player Photo</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setPhotoFile(file);
                        }}
                        className="bg-secondary border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload an image. This will be stored in Supabase Storage.
                      </p>
                      {(photoFile || newPlayer.photoUrl) && (
                        <div className="rounded-lg overflow-hidden bg-secondary h-32 w-24">
                          <img
                            src={photoFile ? URL.createObjectURL(photoFile) : newPlayer.photoUrl}
                            alt="Preview"
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      )}
                    </div>
                    <Button onClick={handleAddPlayer} className="w-full" variant="hero">
                      Add Player
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filters:</span>
              </div>
              <Select value={filterSport} onValueChange={setFilterSport}>
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="basketball">🏀 Basketball</SelectItem>
                  <SelectItem value="football">⚽ Football</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="auctioned">Auctioned</SelectItem>
                  <SelectItem value="unsold">Unsold</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="ml-2">
                {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="grid gap-2 grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {filteredPlayers.length === 0 ? (
                <Card className="col-span-full p-8 text-center bg-card border-border/50">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{players.length === 0 ? 'No Players Yet' : 'No Players Match Filters'}</h3>
                  <p className="text-muted-foreground mb-4">{players.length === 0 ? 'Add your first player to get started' : 'Try adjusting your filters'}</p>
                  {players.length === 0 && (
                    <Button onClick={() => setIsPlayerDialogOpen(true)} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Player
                    </Button>
                  )}
                </Card>
              ) : (
                filteredPlayers.map((player) => (
                  <Card key={player.id} className="overflow-hidden bg-card border-border/50 group hover:border-primary/50 transition-all">
                    <div className="relative bg-secondary aspect-[3/4]">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt={player.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <User className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute top-1 left-1 flex flex-col gap-0.5">
                        <Badge variant={player.sport === 'basketball' ? 'basketball' : 'football'} className="text-[8px] px-1 py-0">
                          {SPORT_CONFIG[player.sport].icon}
                        </Badge>
                        <Badge variant={player.category as any} className="text-[8px] px-1 py-0">
                          {CATEGORY_CONFIG[player.category].label}
                        </Badge>
                      </div>
                      <Badge 
                        variant={player.status === 'auctioned' ? 'success' : player.status === 'unsold' ? 'destructive' : 'secondary'}
                        className="absolute top-1 right-1 text-[8px] px-1 py-0"
                      >
                        {player.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="p-2 space-y-1">
                      <h3 className="font-display text-xs text-foreground truncate">{player.name.toUpperCase()}</h3>
                      <div className="flex justify-between items-center gap-1">
                        <span className="text-[9px] text-muted-foreground">
                          {CATEGORY_CONFIG[player.category].startingBid}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setEditingPlayer(player);
                              setPhotoFile(null);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={async () => {
                              try {
                                await deletePlayerMutation.mutateAsync(player.id);
                                toast.success('Player deleted');
                              } catch (err: any) {
                                toast.error(err?.message || 'Failed to delete player');
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          {player.status === 'auctioned' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              title="Mark as unsold - reverts points to team"
                              onClick={async () => {
                                try {
                                  await markUnsoldMutation.mutateAsync(player.id);
                                  toast.success('Player marked as unsold - points reverted');
                                } catch (err: any) {
                                  toast.error(err?.message || 'Failed to mark player as unsold');
                                }
                              }}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
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
                          onClick={async () => {
                            try {
                              await deleteTeamMutation.mutateAsync(team.id);
                              toast.success('Team deleted');
                            } catch (err: any) {
                              toast.error(err?.message || 'Failed to delete team');
                            }
                          }}
                        >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-center">
                      <div className="rounded-lg bg-secondary/50 p-2 sm:p-3">
                        <div className="text-[10px] sm:text-xs text-muted-foreground">Budget</div>
                        <div className="font-display text-base sm:text-lg text-foreground">{team.maxBudget}</div>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-2 sm:p-3">
                        <div className="text-[10px] sm:text-xs text-muted-foreground">Remaining</div>
                        <div className="font-display text-base sm:text-lg text-success">{team.remainingBudget}</div>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-2 sm:p-3">
                        <div className="text-[10px] sm:text-xs text-muted-foreground">Players</div>
                        <div className="font-display text-base sm:text-lg text-foreground">{team.players.length}</div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Player Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">EDIT PLAYER</DialogTitle>
            </DialogHeader>
            {editingPlayer && (
              <div className="space-y-4">
                <div>
                  <Label>Player Name</Label>
                  <Input
                    value={editingPlayer.name}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                    placeholder="Enter player name"
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label>Sport</Label>
                  <Select
                    value={editingPlayer.sport}
                    onValueChange={(v) => setEditingPlayer({ ...editingPlayer, sport: v as Sport })}
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
                    value={editingPlayer.category}
                    onValueChange={(v) => setEditingPlayer({ ...editingPlayer, category: v as PlayerCategory })}
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
                <div className="space-y-2">
                  <Label>Player Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setPhotoFile(file);
                    }}
                    className="bg-secondary border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a new image to replace the current photo.
                  </p>
                  {(photoFile || editingPlayer.photoUrl) && (
                    <div className="rounded-lg overflow-hidden bg-secondary h-32 w-24">
                      <img
                        src={photoFile ? URL.createObjectURL(photoFile) : editingPlayer.photoUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditPlayer} className="flex-1" variant="hero">
                    Save Changes
                  </Button>
                  <Button onClick={() => setIsEditDialogOpen(false)} className="flex-1" variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Developer Footer */}
        <div className="border-t border-border/50 pt-6 pb-4 mt-8">
          <div className="text-center space-y-3">
            {/* Organization Info */}
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">CHRIST Kengeri Premier League</p>
              <p className="text-xs text-muted-foreground">Department of Physical Education</p>
              <p className="text-xs text-muted-foreground">CHRIST (Deemed to be University), Kengeri Campus</p>
            </div>
            
            {/* Developer Info */}
            <div className="space-y-2 pt-2">
              <p className="text-xs text-muted-foreground">Developed by <span className="font-semibold text-foreground">Keshav Agarwal</span></p>
              <div className="flex items-center justify-center gap-4">
                <a 
                  href="https://www.linkedin.com/in/kesh2004ag/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a 
                  href="https://github.com/keshavagarwal2004dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
            
            {/* Version & Copyright */}
            <div className="pt-2 border-t border-border/30 space-y-1">
              <p className="text-[10px] text-muted-foreground/70">Version 1.0.0 • January 2026</p>
              <p className="text-[10px] text-muted-foreground/70">© 2026 Keshav Agarwal. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
