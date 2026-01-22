# CKPL Player Auction Platform - Vercel Deployment Guide

This guide walks you through deploying your CKPL Player Auction Platform to Vercel for production hosting.

## Prerequisites

- GitHub account
- Vercel account (free at vercel.com)
- Supabase project set up with tables and authentication
- Environment variables from your `.env.local`

## Step 1: Prepare Your Repository ✅

Your project is already configured with:
- **vercel.json** - Configured for client-side routing (handles react-router-dom routes like /admin, /auction, /view)
- **.gitignore** - Already includes `*.local` to protect your `.env.local` file

## Step 2: Push Code to GitHub

1. Create a new repository on GitHub
   - Go to https://github.com/new
   - Name: `ckpl-player-auction`
   - Description: "CHRIST Kengeri Premier League - Player Auction Platform"
   - Make it Public or Private (recommended: Private for security)

2. In your project directory, initialize and push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CKPL Player Auction Platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ckpl-player-auction.git
   git push -u origin main
   ```

3. Verify `.env.local` is not pushed:
   ```bash
   git log --all --full-history -- .env.local
   # Should show nothing if properly gitignored
   ```

## Step 3: Deploy on Vercel

### 3.1 Connect GitHub Repository

1. Log in to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository `ckpl-player-auction`
5. Click **"Import"**

### 3.2 Configure Build Settings

Vercel should auto-detect these settings (verify they're correct):

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 3.3 Add Environment Variables

**This is critical for Supabase connectivity!**

1. In the Vercel deployment settings, go to **"Environment Variables"**
2. Add the following variables from your `.env.local`:

   | Variable | Value |
   |----------|-------|
   | `VITE_SUPABASE_URL` | `https://zwtvsmykvnsdohgzesgv.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your full key) |

3. For each variable, select which environments it applies to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Click **"Save"**

### 3.4 Deploy

Click **"Deploy"** button. Vercel will:
1. Clone your repository
2. Install dependencies
3. Run `npm run build`
4. Generate your production URL (e.g., `https://ckpl-player-auction.vercel.app`)

⏳ Deployment typically takes 2-5 minutes.

## Step 4: Configure Supabase for Production

Once Vercel deployment is complete and you have your production URL:

### 4.1 Update Authentication URLs

1. Log in to https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add your Vercel URL:
   ```
   https://your-project-name.vercel.app/login
   https://your-project-name.vercel.app/
   ```
5. Click **"Save"**

### 4.2 Enable CORS (if needed)

CORS is usually auto-configured for Vercel deployments, but to verify:

1. In Supabase, go to **Project Settings** → **API**
2. Look for CORS configuration
3. Ensure `https://your-project-name.vercel.app` is in the allowed origins

## Step 5: Verify Production Deployment

### 5.1 Test Public View
1. Visit: `https://your-project-name.vercel.app/view`
2. Verify the footer, navigation, and live auction features load correctly

### 5.2 Test Admin Login
1. Visit: `https://your-project-name.vercel.app/login`
2. Log in with your admin credentials (created in Supabase Auth)
3. Navigate to: `/admin`
4. Test adding/editing players and teams

### 5.3 Check Real-time Sync
1. Open the public view in one browser tab
2. Open admin in another tab
3. Make changes in admin and verify they reflect in public view within 5 seconds

## Step 6: Final Checklist

- [ ] Vercel deployment is live and accessible
- [ ] Environment variables are set in Vercel dashboard
- [ ] Supabase authentication redirect URLs include your Vercel URL
- [ ] Admin user is created in Supabase Auth dashboard
- [ ] All database tables exist (players, teams, auctions, player_assignments, team_budgets)
- [ ] Public view loads without errors
- [ ] Admin login works
- [ ] Players and teams can be added/edited
- [ ] Live auction functionality works
- [ ] Real-time updates sync correctly
- [ ] Footer displays correctly on both pages

## Troubleshooting

### Issue: 404 errors on page refresh
**Solution:** Verify `vercel.json` exists in root directory with rewrites configuration.

### Issue: "Cannot find module" errors
**Solution:** Ensure all environment variables are set in Vercel dashboard. Redeploy if changed.

### Issue: Admin login fails
**Solution:** 
1. Check Supabase Auth dashboard - create admin user if missing
2. Verify redirect URLs in Supabase include your Vercel domain
3. Check browser console for specific error messages

### Issue: Database connection fails
**Solution:**
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct in Vercel
2. Check Supabase project is active and not paused
3. Verify table names and permissions in Supabase

### Issue: Real-time updates not working
**Solution:** This uses polling, not WebSockets. If data doesn't update after 5 seconds:
1. Check browser console for errors
2. Verify Supabase tables have data
3. Clear browser cache and refresh

## Automatic Deployments

After this setup:
- Every push to `main` branch → automatic production deployment
- Pull requests → preview deployments (shareable links)
- Easy rollback to previous versions via Vercel dashboard

## Custom Domain (Optional)

1. In Vercel project settings → **Domains**
2. Add your custom domain (e.g., `auction.christ.edu`)
3. Follow DNS configuration steps provided by Vercel
4. Update Supabase redirect URLs with new domain

## Environment Variable Security

**Never:**
- ❌ Commit `.env.local` to git
- ❌ Paste secrets in code
- ❌ Share Supabase keys publicly

**Always:**
- ✅ Add secrets via Vercel dashboard
- ✅ Use environment variables for sensitive data
- ✅ Review git history to ensure no secrets were pushed

## Support & Next Steps

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- React Router Docs: https://reactrouter.com/

---

**Version:** 1.0.0  
**Last Updated:** January 23, 2026  
**Developed by:** Keshav Agarwal
