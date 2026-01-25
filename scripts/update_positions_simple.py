#!/usr/bin/env python3
"""
Update positions for all football players without positions.
Sets them all to "Player" as a default.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env.local in the project root
env_path = Path(__file__).parent.parent / ".env.local"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def update_positions():
    """Update all football players without positions to 'Player'."""
    
    # Get Football sport ID
    sports_response = supabase.table("sports").select("id").eq("name", "Football").execute()
    
    if not sports_response.data:
        print("Football sport not found")
        return
    
    football_sport_id = sports_response.data[0]["id"]
    
    # Get all football players
    players_response = supabase.table("players").select("id, name, position").eq("sport_id", football_sport_id).execute()
    
    # Filter out players that already have positions
    players_without_pos = [p for p in players_response.data if not p.get("position")]
    
    if not players_without_pos:
        print("No football players without positions found")
        return
    
    print(f"\nFound {len(players_without_pos)} football players without positions")
    print("Updating all to 'Player'...\n")
    
    count = 0
    for player in players_without_pos:
        try:
            supabase.table("players").update({"position": "Player"}).eq("id", player["id"]).execute()
            count += 1
            print(f"[{count}/{len(players_without_pos)}] ✓ {player['name']}")
        except Exception as e:
            print(f"[{count}/{len(players_without_pos)}] ✗ {player['name']}: {e}")
    
    print(f"\n{'='*60}")
    print(f"✓ Successfully updated {count} players")
    print(f"{'='*60}")

if __name__ == "__main__":
    update_positions()
