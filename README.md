# CKPL Player Auction Platform

**CHRIST Kengeri Premier League (CKPL)** - A real-time auction platform for basketball and football player selection.

📅 **Auction Date**: 27th January  
🏟️ **League Dates**: 2nd February - 5th February  
🏀⚽ **Sports**: Basketball & Football (Auction-based team selection)

Organized by the Department of Physical Education, CHRIST University - Kengeri Campus.

A real-time bidding platform with admin controls, live auction tracking, team management, and budget tracking.

## 🎯 Features

### Live Auction System
- **Real-time Bidding**: Watch live auctions with instant bid updates
- **Multiple Teams**: Support for basketball and football teams competing simultaneously
- **Smart Bidding**: Automatic increment management based on player category
- **Bid History**: Complete tracking of all bids during an auction
- **Countdown Timer**: Customizable auction timers (30s, 60s, or manual clear)

### Admin Panel
- **Player Management**: Add, edit, and manage players with photos
- **Team Management**: Create teams, set budgets, and track spending
- **Auction Control**: Start/pause auctions, mark players as sold/unsold
- **Real-time Dashboard**: Monitor auction progress with live updates

### Public Dashboard
- **Live View**: Toggle between live auction and team details
- **Player Browsing**: Filter players by sport, category, and status
- **Team Rosters**: View team compositions and spending details
- **Statistics**: Real-time auction statistics and player availability

### Mobile Responsive
- Fully optimized for mobile and tablet devices
- Touch-friendly interface with responsive layouts
- Mobile-optimized images with lazy loading
- Adaptive grid layouts for all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account with a project configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ckpl-player-auction
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and public API key
   - Set up the database tables (see Database Schema below)

4. **Set environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_public_api_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:8081`

## 📋 Database Setup

### Required Tables

The application requires the following Supabase tables:

#### Players
- `id` (UUID, primary key)
- `name` (text)
- `sport` (text: 'basketball' or 'football')
- `category` (text: 'district', 'state', 'national')
- `photoUrl` (text, nullable)
- `status` (text: 'available', 'auctioned', 'unsold')
- `soldToTeamId` (UUID, nullable)
- `soldPrice` (integer, nullable)
- `created_at` (timestamp)

#### Teams
- `id` (UUID, primary key)
- `name` (text)
- `sport` (text: 'basketball' or 'football')
- `maxBudget` (integer)
- `created_at` (timestamp)

#### AuctionState
- `id` (UUID, primary key)
- `isActive` (boolean)
- `currentPlayerId` (UUID, nullable)
- `currentBid` (integer)
- `currentBidderId` (UUID, nullable)
- `countdown` (integer, nullable)
- `bids` (jsonb array)
- `updated_at` (timestamp)

## 🏀 Player Categories

Players are categorized by skill level:

| Category | Starting Bid | Increment |
|----------|-------------|-----------|
| District | 100 pts | 50 pts |
| State | 200 pts | 100 pts |
| National | 500 pts | 250 pts |

## 👤 Admin Access

### Login
- Navigate to the application and click "Admin Login"
- Enter your Supabase admin email and password
- Admin credentials must be created in Supabase Auth

### Admin Features
- **Players Tab**: Add, edit, delete players; upload photos
- **Teams Tab**: Create and manage teams; view spending
- **Auction Control**: Start live auctions, manage bids, finalize sales

## 🎮 User Flows

### Admin Workflow
1. Set up players in Admin Panel
2. Create teams and set budgets
3. Start auction for selected sport
4. Monitor live bids from all teams
5. Mark players as sold or unsold
6. View final results and team rosters

### Public User Workflow
1. View live auction (when active)
2. Switch between live auction and team details
3. Browse all players by sport/category
4. View team rosters and spending

## 🛠 Build & Deployment

### Build for Production
```bash
npm run build
```
Output will be in the `dist/` directory.

### Run Tests
```bash
npm run test
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Technology Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time Updates**: Polling-based updates
- **Build Tool**: Vite
- **Package Manager**: npm

## 📂 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── auction/        # Auction-specific components
│   ├── cards/          # Card components (Player, Team, Sport)
│   ├── layout/         # Layout components (Header, Layout)
│   └── ui/             # shadcn/ui components
├── pages/              # Page components
│   ├── Admin.tsx       # Admin panel
│   ├── Auction.tsx     # Live auction page
│   ├── Index.tsx       # Dashboard home
│   ├── PublicView.tsx  # Public auction view
│   ├── Teams.tsx       # Team rosters
│   └── NotFound.tsx    # 404 page
├── hooks/              # Custom React hooks
├── stores/             # Zustand state management
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── test/               # Test files
```

## 🔒 Security

- Admin routes are protected with Supabase authentication
- Row-level security (RLS) policies enforce data access control
- All sensitive operations require admin authorization
- Photo uploads are stored securely in Supabase Storage

## 📞 Support & Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Change port in vite.config.ts or kill process using port 8080/8081
```

**Supabase Connection Error**
- Verify `.env.local` has correct Supabase URL and keys
- Check Supabase project is active
- Ensure RLS policies are properly configured

**Images Not Loading**
- Verify Supabase Storage bucket is configured correctly
- Check storage URL in environment variables
- Ensure bucket permissions allow public read access

## 📝 License

This project is proprietary. All rights reserved.

## 🤝 Contributing

For development improvements and bug fixes, follow standard Git workflow:

1. Create a feature branch
2. Make changes and test
3. Commit with clear messages
4. Push and create pull request

---

**Version**: 1.0.0  
**Last Updated**: January 2026

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
