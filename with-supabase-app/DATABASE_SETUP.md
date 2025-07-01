# Database Setup Guide

## Quick Setup

The app is designed to work both with and without a database connection. It will:

- ✅ **With Database**: Full sync across devices, collections, real-time features
- ✅ **Without Database**: Works offline using localStorage (yellow banner will show)

## Option 1: Test Locally (No Setup Required)

Just run the app - it will automatically fall back to localStorage and show a yellow banner indicating offline mode. All functionality works locally.

## Option 2: Enable Full Database Features

### Step 1: Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (usually 2-3 minutes)

### Step 2: Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `scripts/setup-database.sql`
3. Click **Run** to execute the script
4. You should see success messages in the Results panel

### Step 3: Environment Variables

Create a `.env.local` file in the `with-supabase-app` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
```

Get these values from:
- **Supabase values**: Project Settings > API in your Supabase dashboard  
- **TMDB API key**: [The Movie Database API](https://www.themoviedb.org/settings/api)

### Step 4: Test the Connection

1. Restart your dev server: `npm run dev`
2. Sign up for a new account or log in
3. The yellow banner should disappear
4. Try adding movies to favorites and collections
5. Check your Supabase dashboard > Table Editor to see the data

## Troubleshooting

### Yellow Banner Still Shows
- Check your `.env.local` file has correct values
- Verify your Supabase project is active (not paused)
- Check browser console for authentication errors

### "Failed to toggle favorite" Error
- Make sure you're logged in (see user icon in navbar)
- Verify the database schema was applied correctly
- Check Supabase > Authentication > Users to see if your user exists

### Tables Don't Exist
- Re-run the SQL script from `scripts/setup-database.sql`
- Check for any error messages in the SQL Editor results

## Features

### ✅ Working Without Database
- Movie browsing and search
- Local favorites and collections
- All UI/UX features
- Local data persistence

### ✅ Additional Features With Database  
- Cross-device sync
- Account-based data storage
- Public collections (future feature)
- Real-time updates (future feature)
- Collaboration features (future feature)

## Architecture

The app uses a **graceful degradation** approach:

1. **Tries database first** - if user is authenticated and DB is available
2. **Falls back to localStorage** - if database is unavailable or user not authenticated
3. **Shows status banner** - to inform user of current mode
4. **Retry mechanism** - user can attempt to reconnect

This means your app works perfectly even if the database is down or not configured yet. 