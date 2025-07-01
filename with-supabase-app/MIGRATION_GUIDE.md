# Supabase Database Migration Guide

## Overview

This guide walks through migrating from localStorage-based storage to Supabase database persistence for the movie app.

## Database Schema Setup

### 1. Execute the Schema Migration

Run the SQL schema in your Supabase dashboard:

```bash
# Copy the contents of lib/database/schema.sql
# Paste and execute in Supabase SQL editor
```

This creates:
- `collections` table for user movie collections
- `user_favorites` table for favorited movies  
- `collection_movies` junction table linking movies to collections
- Row Level Security (RLS) policies for data isolation
- Performance indexes
- Helper functions for common operations

### 2. Verify Tables Created

Check in Supabase dashboard that these tables exist:
- ✅ `public.collections`
- ✅ `public.user_favorites` 
- ✅ `public.collection_movies`

## Code Migration

### 1. Storage Service Changes

**Before (localStorage):**
```typescript
import { MovieStorage } from '@/lib/storage';

const favorites = MovieStorage.getFavorites(); // number[]
const collections = MovieStorage.getCollections(); // MovieCollection[]
```

**After (Supabase):**
```typescript
import { SupabaseMovieStorage } from '@/lib/storage-supabase';

const favorites = await SupabaseMovieStorage.getFavorites(); // Promise<number[]>
const collections = await SupabaseMovieStorage.getCollections(); // Promise<MovieCollection[]>
```

### 2. Key Changes Required

1. **All storage operations are now async** - add `await` and `async`
2. **Authentication required** - users must be logged in to access data
3. **Error handling** - network errors possible, wrap in try/catch
4. **Real-time capabilities** - can subscribe to live updates

### 3. Component Updates

**Collections Page:**
- ✅ Updated to use `SupabaseMovieStorage`
- ✅ Made all handlers async
- ✅ Added proper error handling

**Favorites Page:**
- ✅ Updated to use `SupabaseMovieStorage`
- ✅ Made loading async
- ✅ Maintained existing UI patterns

## Data Migration

### Option 1: Fresh Start (Recommended)
- Users start with empty collections/favorites
- Clean slate with proper database structure

### Option 2: Data Import
- Export existing localStorage data
- Create import utility to migrate to database
- Run one-time migration for existing users

## Benefits of Migration

### ✅ Cross-Device Sync
- Data persists across all user devices
- Login from anywhere to access collections

### ✅ Data Persistence  
- No more lost data from browser clearing
- Reliable cloud storage

### ✅ Collaboration Features
- Share collections publicly
- Real-time updates between users

### ✅ Performance
- Database indexes for fast queries
- Server-side filtering and pagination

### ✅ Security
- Row Level Security isolates user data
- PostgreSQL-level data validation

## Testing Checklist

- [ ] User can create collections
- [ ] User can add/remove movies from collections
- [ ] User can delete collections
- [ ] User can favorite/unfavorite movies
- [ ] Collections persist after logout/login
- [ ] Favorites persist after logout/login
- [ ] RLS prevents accessing other users' data
- [ ] Public collections are viewable by others

## Rollback Plan

If issues arise, revert by:

1. Change imports back to `@/lib/storage`
2. Remove `await` keywords
3. Comment out database tables (keep for later)

The original localStorage implementation remains in `lib/storage.ts` for fallback.

## Next Steps

1. **Real-time Features**: Add live collection updates
2. **Public Collections**: Browse community collections
3. **Collaborative Features**: Multi-user collection editing
4. **Advanced Queries**: Search collections by genre, rating, etc.
5. **Analytics**: Track popular movies, user behavior 