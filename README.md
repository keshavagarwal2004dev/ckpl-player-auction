# CKPL Player Auction Platform

Real-time auction platform for CHRIST Kengeri Premier League (basketball and football) with live bidding, team budgets, and admin controls.

## Overview
- Live auction UI with bid increments by player category
- Admin dashboard for players, teams, and auction control
- Public view for live auctions and team rosters
- Supabase backend (PostgreSQL, Storage, Auth)

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL, Storage, Auth)
- Zustand for state

## Prerequisites
- Node.js 18+
- npm
- Supabase project (URL + anon key)

## Setup
1) Clone & install
```bash
git clone <repo-url>
cd ckpl-player-auction
npm install
```

2) Environment variables (create `.env.local`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3) Database (run once)
- In Supabase SQL Editor, run the migration at [supabase/migrations/001_init_schema.sql](supabase/migrations/001_init_schema.sql).
- This sets up tables, views, storage bucket `player-photos`, and permissive starter policies.

4) Run dev server
```bash
npm run dev
```
Default Vite port: 5173 (shown in terminal).

## Deploy (Vercel quick path)
1) Push main to GitHub.
2) Import repo in Vercel.
3) Set env vars in Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4) Build command: `npm run build` ; Output: `dist`.

## Admin
- Create an admin user in Supabase Auth.
- Login at `/login`, manage auctions at `/admin`.
- For demo sharing, create a temporary admin and rotate/delete after review. Do not publish real credentials.

## Demo & visuals
- Live demo URL: _(add your deployed URL here)_
- Screens/GIFs (drop files in `docs/diagrams/` and reference):
	- Data flow: [docs/diagrams/data-flow.png](docs/diagrams/data-flow.png)
	- DB schema: [docs/diagrams/db-schema.png](docs/diagrams/db-schema.png)

## Architecture
- Frontend: React + TypeScript + Vite; UI: Tailwind + shadcn/ui.
- State: Zustand; server sync via Supabase REST calls (polling) + local store persistence.
- Backend: Supabase (PostgreSQL, Storage, Auth). Storage bucket `player-photos` for player images.
- Flow (admin/bidder): POST/UPDATE to Supabase → auctions table → React Query detects change → Zustand store updates → components re-render.
- See diagrams in `docs/diagrams/` for data flow and schema.

## Useful scripts
- `npm run dev` – local dev
- `npm run build` – production build
- `npm run lint` – lint
- Tests are not included in this repo (manual QA only).

## Sample data (optional)
- Import `scripts/sample_teams.csv` then `scripts/sample_players.csv` via Supabase UI or your CSV uploader to get a quick demo set (4 teams, 8 players across basketball/football).

## Notes
- Player photos use Supabase Storage bucket `player-photos` (public read, authenticated write).
- Bid increments and starting bids are defined by category; defaults are in the DB migration.

## Support
Common issues:
- Missing env: confirm `.env.local` values
- DB missing: rerun [supabase/migrations/001_init_schema.sql](supabase/migrations/001_init_schema.sql)
- Storage access: ensure bucket `player-photos` exists and policies ran with the migration.
