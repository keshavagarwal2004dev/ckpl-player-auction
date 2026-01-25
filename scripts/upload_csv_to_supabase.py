#!/usr/bin/env python3
"""
Upload CKPL Registration CSV data to Supabase database.
This script reads the registration CSV and populates the players table.
"""

import os
import sys
import csv
from pathlib import Path
from typing import Optional, Dict, List
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Missing Supabase credentials in environment variables")
    print("Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY")
    sys.exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_or_create_sport(sport_name: str) -> Optional[int]:
    """Get sport ID or create if doesn't exist."""
    if not sport_name:
        return None
    
    try:
        # Check if sport exists
        response = supabase.table("sports").select("id").eq("name", sport_name).execute()
        
        if response.data:
            return response.data[0]["id"]
        
        # Create sport if it doesn't exist
        sport_defaults = {
            "Basketball": {"min_teams": 4, "min_players_per_team": 8},
            "Football": {"min_teams": 8, "min_players_per_team": 11},
        }
        
        defaults = sport_defaults.get(sport_name, {"min_teams": 4, "min_players_per_team": 8})
        
        result = supabase.table("sports").insert({
            "name": sport_name,
            "min_teams": defaults["min_teams"],
            "min_players_per_team": defaults["min_players_per_team"],
        }).execute()
        
        if result.data:
            return result.data[0]["id"]
    
    except Exception as e:
        print(f"Error creating/getting sport '{sport_name}': {e}")
    
    return None


def get_category_id(achievement: str) -> Optional[int]:
    """Map achievement string to category ID."""
    category_mapping = {
        "national": "National",
        "state": "State",
        "district": "District",
        "schools": "School",
        "school": "School",
    }
    
    achievement_lower = achievement.lower().strip()
    
    # Try to match specific categories
    if achievement_lower and achievement_lower not in ["", "none", "nil"]:
        for key, category in category_mapping.items():
            if key in achievement_lower:
                try:
                    response = supabase.table("categories").select("id").eq("name", category).execute()
                    if response.data:
                        return response.data[0]["id"]
                except Exception as e:
                    print(f"Error getting category '{category}': {e}")
    
    # Default to "Others" if no match or empty
    try:
        response = supabase.table("categories").select("id").eq("name", "Others").execute()
        if response.data:
            return response.data[0]["id"]
    except Exception as e:
        print(f"Error getting default category: {e}")
    
    return None


def parse_csv(csv_path: str) -> List[Dict]:
    """Parse the registration CSV file."""
    players = []
    
    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                # Skip empty rows
                if not row.get("Name"):
                    continue
                
                player = {
                    "name": row.get("Name", "").strip(),
                    "register_number": row.get("Register Number", "").strip(),
                    "class_section": row.get("Class and Section", "").strip(),
                    "email": row.get("Email Id", "").strip(),
                    "contact": row.get("Contact Number", "").strip(),
                    "sport": row.get("Sport", "").strip(),
                    "position": row.get("Position", "").strip(),
                    "achievement": row.get("Achievement", "").strip(),
                    "university_team": row.get("Are you part of University Sports Team? (Specify)", "").strip(),
                }
                
                # Only include if sport is specified
                if player["sport"]:
                    players.append(player)
    
    except FileNotFoundError:
        print(f"ERROR: CSV file not found at {csv_path}")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: Failed to parse CSV: {e}")
        sys.exit(1)
    
    return players


def upload_players(csv_path: str) -> None:
    """Upload players from CSV to Supabase."""
    print(f"Reading CSV from: {csv_path}")
    players = parse_csv(csv_path)
    
    if not players:
        print("No players found in CSV")
        return
    
    print(f"Found {len(players)} players to upload")
    
    successful = 0
    failed = 0
    skipped = 0
    
    for idx, player in enumerate(players, 1):
        try:
            sport_id = get_or_create_sport(player["sport"])
            
            if not sport_id:
                print(f"[{idx}] SKIP: {player['name']} - Invalid sport '{player['sport']}'")
                skipped += 1
                continue
            
            category_id = get_category_id(player["achievement"])
            
            # Check if player already exists
            existing = supabase.table("players").select("id").eq("name", player["name"]).eq("sport_id", sport_id).execute()
            
            if existing.data:
                print(f"[{idx}] EXISTS: {player['name']} ({player['sport']})")
                skipped += 1
                continue
            
            # Prepare player data
            player_data = {
                "name": player["name"],
                "sport_id": sport_id,
                "category_id": category_id,
                "photo_url": None,
                "position": player["position"] if player["position"] else None,
                "status": "unsold",
            }
            
            # Insert player
            result = supabase.table("players").insert(player_data).execute()
            
            if result.data:
                print(f"[{idx}] ✓ {player['name']} ({player['sport']}) - Category: {player['achievement']}")
                successful += 1
            else:
                print(f"[{idx}] ✗ {player['name']} - Upload failed")
                failed += 1
        
        except Exception as e:
            print(f"[{idx}] ✗ {player['name']} - Error: {e}")
            failed += 1
    
    print("\n" + "="*60)
    print(f"Upload Summary:")
    print(f"  Successful: {successful}")
    print(f"  Failed: {failed}")
    print(f"  Skipped: {skipped}")
    print(f"  Total: {len(players)}")
    print("="*60)


def main():
    """Main entry point."""
    # Determine CSV path
    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
    else:
        # Look for CSV in Downloads
        default_path = Path.home() / "Downloads" / "CKPL Registration Form (Responses) - Form Responses 1 (1).csv"
        if default_path.exists():
            csv_path = str(default_path)
        else:
            print("Usage: python upload_csv_to_supabase.py <csv_file_path>")
            print(f"Default path not found: {default_path}")
            sys.exit(1)
    
    print("\n" + "="*60)
    print("CKPL Player Registration Uploader")
    print("="*60)
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"CSV Path: {csv_path}")
    print("="*60 + "\n")
    
    upload_players(csv_path)


if __name__ == "__main__":
    main()
