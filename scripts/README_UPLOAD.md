# CSV Upload to Supabase

This script uploads player registration data from a CSV file to your Supabase database.

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   
   Create a `.env` file in the project root with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Or set environment variables:
   ```bash
   $env:VITE_SUPABASE_URL = "your_url"
   $env:VITE_SUPABASE_ANON_KEY = "your_key"
   ```

## Usage

### Option 1: Automatic (uses Downloads folder)
If your CSV is at the default location (`C:\Users\YourUsername\Downloads\CKPL Registration Form (Responses) - Form Responses 1 (1).csv`):

```bash
python scripts/upload_csv_to_supabase.py
```

### Option 2: Specify custom CSV path
```bash
python scripts/upload_csv_to_supabase.py "path/to/your/file.csv"
```

## Features

- ✓ Automatically creates sports (Football/Basketball) if they don't exist
- ✓ Maps achievement levels to categories (National, State, District, School)
- ✓ Prevents duplicate player entries
- ✓ Extracts player positions from the CSV
- ✓ Detailed progress reporting
- ✓ Error handling and logging

## What Gets Uploaded

The script uploads the following from each registration:
- **Player Name**: From "Name" column
- **Sport**: From "Sport" column
- **Position**: From "Position" column
- **Category**: Mapped from "Achievement" column
- **Status**: Initially set to "unsold"
- **Photo URL**: Can be manually updated later

## Example Output

```
============================================================
CKPL Player Registration Uploader
============================================================
Supabase URL: https://your-project.supabase.co
CSV Path: C:\Users\kesh2\Downloads\CKPL Registration Form (Responses) - Form Responses 1 (1).csv
============================================================

[1] ✓ Rishit Negi (Football) - Category: SCHOOLS
[2] ✓ Subhankar Kumar Gupta (Basketball) - Category: SCHOOLS
...

============================================================
Upload Summary:
  Successful: 120
  Failed: 2
  Skipped: 5
  Total: 127
============================================================
```

## Troubleshooting

**"Missing Supabase credentials"**
- Make sure you've set the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables

**"CSV file not found"**
- Check the file path is correct
- Try providing the full path to the CSV file

**Permission errors**
- Make sure your Supabase API key has write access to the `players` table

## Notes

- The script is idempotent - running it multiple times won't create duplicates
- Players are matched by name and sport to check for duplicates
- Invalid sports or empty rows are skipped
- All dates are automatically set to current timestamp
