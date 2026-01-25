#!/usr/bin/env python3
"""
Check positions in the database for both sports.
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

def check_positions():
    """Check positions for all players."""
    
    # Get all sports
    sports_response = supabase.table("sports").select("id, name").execute()
    
    for sport in sports_response.data:
        print(f"\n{'='*60}")
        print(f"Sport: {sport['name']}")
        print(f"{'='*60}")
        
        # Get players for this sport
        players_response = supabase.table("players").select("id, name, position").eq("sport_id", sport["id"]).execute()
        
        total = len(players_response.data)
        with_position = sum(1 for p in players_response.data if p.get("position"))
        without_position = total - with_position
        
        print(f"Total players: {total}")
        print(f"With position: {with_position}")
        print(f"Without position: {without_position}")
        
        if without_position > 0:
            print(f"\nPlayers without position:")
            for player in players_response.data:
                if not player.get("position"):
                    print(f"  - {player['name']}")

if __name__ == "__main__":
    check_positions()
