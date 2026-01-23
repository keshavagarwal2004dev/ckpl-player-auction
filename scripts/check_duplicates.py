import csv
from collections import Counter

csv_path = r"c:\Users\kesh2\Downloads\CKPL Registration Form (Responses) - Form Responses 1 (1).csv"

with open(csv_path, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Track duplicates
seen = {}
duplicates = []

for idx, row in enumerate(rows, start=2):  # start at 2 (header is row 1)
    name = (row.get("Name") or "").strip()
    sport = (row.get("Sport") or "").strip()
    
    if not name:
        print(f"Row {idx}: SKIPPED - Empty name")
        continue
    
    key = (name.lower(), sport.lower())
    
    if key in seen:
        duplicates.append({
            "row": idx,
            "name": name,
            "sport": sport,
            "first_occurrence": seen[key]
        })
    else:
        seen[key] = idx

print(f"\nTotal rows: {len(rows)}")
print(f"Unique players: {len(seen)}")
print(f"Duplicates found: {len(duplicates)}\n")

if duplicates:
    print("Duplicate registrations (kept first, skipped duplicates):")
    for dup in duplicates:
        print(f"  Row {dup['row']}: {dup['name']} ({dup['sport']}) — duplicate of row {dup['first_occurrence']}")
