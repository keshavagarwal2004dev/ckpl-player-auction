#!/usr/bin/env python3
"""
Update positions for football players.
This script helps add positions to football players that don't have them.
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

# Common football positions
FOOTBALL_POSITIONS = [
    "Goalkeeper (GK)",
    "Defender (DF)",
    "Midfielder (MF)",
    "Forward (FW)",
    "Striker (ST)",
    "Winger (WG)",
    "Central Midfielder (CM)",
    "Defensive Midfielder (DM)",
    "Attacking Midfielder (AM)",
]

def update_all_football_positions_to_player():
    """
    Update all football players without positions to 'Player'.
    This is a quick fix to show something for all players.
    """
    # Get Football sport ID
    sports_response = supabase.table("sports").select("id").eq("name", "Football").execute()
    
    if not sports_response.data:
        print("Football sport not found")
        return
    
    football_sport_id = sports_response.data[0]["id"]
    
    # Get all football players without position
    players_response = supabase.table("players").select("id, name, position").eq("sport_id", football_sport_id).execute()
    
    # Filter out players that already have positions
    players_response.data = [p for p in players_response.data if not p.get("position")]
    
    if not players_response.data:
        print("No football players without positions found")
        return
    
    print(f"\nFound {len(players_response.data)} football players without positions")
    print("Updating all to 'Player'...")
    
    count = 0
    for player in players_response.data:
        try:
            supabase.table("players").update({"position": "Player"}).eq("id", player["id"]).execute()
            count += 1
            if count % 10 == 0:
                print(f"Updated {count}/{len(players_response.data)}...")
        except Exception as e:
            print(f"Error updating {player['name']}: {e}")
    
    print(f"\n✓ Successfully updated {count} players")

def interactive_update():
    """
    Interactive mode to update positions one by one.
    """
    # Get Football sport ID
    sports_response = supabase.table("sports").select("id").eq("name", "Football").execute()
    
    if not sports_response.data:
        print("Football sport not found")
        return
    
    football_sport_id = sports_response.data[0]["id"]
    
    # Get all football players without position
    players_response = supabase.table("players").select("id, name, position").eq("sport_id", football_sport_id).execute()
    
    # Filter out players that already have positions
    players_response.data = [p for p in players_response.data if not p.get("position")]
    
    if not players_response.data:
        print("No football players without positions found")
        return
    
    print(f"\nFound {len(players_response.data)} football players without positions")
    print("\nAvailable positions:")
    for i, pos in enumerate(FOOTBALL_POSITIONS, 1):
        print(f"{i}. {pos}")
    print("0. Skip this player")
    print("\nPress Ctrl+C to exit at any time\n")
    
    for idx, player in enumerate(players_response.data, 1):
        print(f"\n[{idx}/{len(players_response.data)}] Player: {player['name']}")
        choice = input("Enter position number (or type custom position): ").strip()
        
        if choice == "0":
            continue
        
        if choice.isdigit() and 1 <= int(choice) <= len(FOOTBALL_POSITIONS):
            position = FOOTBALL_POSITIONS[int(choice) - 1]
        else:
            position = choice
        
        if position:
            try:
                supabase.table("players").update({"position": position}).eq("id", player["id"]).execute()
                print(f"✓ Updated {player['name']} to {position}")
            except Exception as e:
                print(f"✗ Error: {e}")

def main():
    print("\n" + "="*60)
    print("Football Player Position Updater")
    print("="*60)
    
    print("\nChoose an option:")
    print("1. Update all football players to 'Player' (quick fix)")
    print("2. Interactive mode (update one by one)")
    print("3. Exit")
    
    choice = input("\nYour choice (1/2/3): ").strip()
    
    if choice == "1":
        confirm = input("\nThis will update all football players without positions to 'Player'. Continue? (yes/no): ")
        if confirm.lower() == "yes":
            update_all_football_positions_to_player()
    elif choice == "2":
        interactive_update()
    else:
        print("Exiting...")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user")
