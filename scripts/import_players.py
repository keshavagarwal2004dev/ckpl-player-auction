import argparse
import csv
import os
from typing import Dict, List, Tuple

from supabase import Client, create_client

# Minimal helper to map free-form achievement text to a category name used in DB
CATEGORY_MAP = {
    "national": "National",
    "state": "State",
    "district": "District",
    "school": "School",
    "schools": "School",
    "university": "Others",
    "none": "Others",
    "nil": "Others",
    "": "Others",
}

SPORT_MAP = {
    "football": "Football",
    "basketball": "Basketball",
}


def resolve_category(raw: str) -> str:
    key = (raw or "").strip().lower()
    return CATEGORY_MAP.get(key, "Others")


def resolve_sport(raw: str) -> str:
    key = (raw or "").strip().lower()
    if key not in SPORT_MAP:
        raise ValueError(f"Unknown sport: {raw!r}")
    return SPORT_MAP[key]


def load_reference_ids(supabase: Client) -> Tuple[Dict[str, int], Dict[str, int]]:
    sports_resp = supabase.table("sports").select("id,name").execute()
    categories_resp = supabase.table("categories").select("id,name").execute()
    sport_ids = {row["name"].strip(): row["id"] for row in sports_resp.data}
    category_ids = {row["name"].strip(): row["id"] for row in categories_resp.data}
    return sport_ids, category_ids


def read_rows(csv_path: str) -> List[dict]:
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def build_records(rows: List[dict], sport_ids: Dict[str, int], category_ids: Dict[str, int]) -> List[dict]:
    seen = set()
    records = []
    for row in rows:
        name = (row.get("Name") or "").strip()
        if not name:
            continue
        sport = resolve_sport(row.get("Sport"))
        category = resolve_category(row.get("Achievement") or row.get("Achievement "))

        sport_id = sport_ids.get(sport)
        category_id = category_ids.get(category)
        if sport_id is None:
            raise ValueError(f"Sport ID not found for {sport}")
        if category_id is None:
            raise ValueError(f"Category ID not found for {category}")

        dedupe_key = (name.lower(), sport)
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)

        position = (row.get("Position") or "").strip()

        records.append({
            "name": name,
            "sport_id": sport_id,
            "category_id": category_id,
            "photo_url": "",  # photos to be added later
            "position": position or None,
            "status": "unsold",
        })
    return records


def chunked(iterable: List[dict], size: int):
    for i in range(0, len(iterable), size):
        yield iterable[i:i + size]


def main():
    parser = argparse.ArgumentParser(
        description="Bulk import players from CSV into Supabase.",
        epilog="CSV columns expected: Name, Sport, Achievement (category), Position (optional)"
    )
    parser.add_argument("csv_path", help="Path to the CSV file")
    parser.add_argument("--dry-run", action="store_true", help="Do not insert, just show counts")
    args = parser.parse_args()

    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
    if not supabase_url or not supabase_key:
        raise SystemExit("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or fallback key) env vars")

    supabase = create_client(supabase_url, supabase_key)
    sport_ids, category_ids = load_reference_ids(supabase)

    rows = read_rows(args.csv_path)
    records = build_records(rows, sport_ids, category_ids)

    print(f"Prepared {len(records)} players from {len(rows)} rows")
    if args.dry_run:
        for sample in records[:5]:
            print(sample)
        return

    for batch in chunked(records, 100):
        try:
            resp = supabase.table("players").insert(batch).execute()
            print(f"Inserted {len(batch)} players")
        except Exception as e:
            print(f"Error inserting batch: {e}")
            raise

    print("Done.")


if __name__ == "__main__":
    main()
