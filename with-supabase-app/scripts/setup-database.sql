-- =============================================================================
-- Movie Database Setup Script
-- =============================================================================
-- Run this script in your Supabase SQL Editor to set up the database schema
-- This creates all the necessary tables, policies, and functions

-- =============================================================================
-- User Collections Table
-- =============================================================================
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

comment on table public.collections is 'User-created movie collections that can contain multiple movies and be shared publicly';

-- =============================================================================
-- User Favorites Table  
-- =============================================================================
create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  movie_id integer not null,
  created_at timestamp with time zone default now() not null,
  constraint unique_user_movie_favorite unique (user_id, movie_id)
);

comment on table public.user_favorites is 'Individual movies marked as favorites by users';

-- =============================================================================
-- Collection Movies Junction Table
-- =============================================================================
create table if not exists public.collection_movies (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections (id) on delete cascade not null,
  movie_id integer not null,
  added_at timestamp with time zone default now() not null,
  constraint unique_collection_movie unique (collection_id, movie_id)
);

comment on table public.collection_movies is 'Junction table linking movies to collections';

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================

-- Enable RLS on all tables
alter table public.collections enable row level security;
alter table public.user_favorites enable row level security;
alter table public.collection_movies enable row level security;

-- Drop existing policies if they exist
drop policy if exists "users_can_manage_own_collections" on public.collections;
drop policy if exists "public_collections_viewable_by_all" on public.collections;
drop policy if exists "users_can_manage_own_favorites" on public.user_favorites;
drop policy if exists "users_can_manage_own_collection_movies" on public.collection_movies;
drop policy if exists "public_collection_movies_viewable_by_all" on public.collection_movies;

-- Collections policies
create policy "users_can_manage_own_collections" on public.collections
  for all 
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "public_collections_viewable_by_all" on public.collections
  for select
  to authenticated
  using (is_public = true);

-- User favorites policies
create policy "users_can_manage_own_favorites" on public.user_favorites
  for all
  to authenticated  
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Collection movies policies
create policy "users_can_manage_own_collection_movies" on public.collection_movies
  for all
  to authenticated
  using (
    collection_id in (
      select id 
      from public.collections 
      where user_id = (select auth.uid())
    )
  )
  with check (
    collection_id in (
      select id 
      from public.collections 
      where user_id = (select auth.uid())
    )
  );

create policy "public_collection_movies_viewable_by_all" on public.collection_movies
  for select
  to authenticated
  using (
    collection_id in (
      select id 
      from public.collections 
      where is_public = true
    )
  );

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Drop existing indexes if they exist
drop index if exists idx_collections_user_id;
drop index if exists idx_user_favorites_user_id;
drop index if exists idx_user_favorites_movie_id;
drop index if exists idx_collection_movies_movie_id;
drop index if exists idx_collection_movies_collection_id;
drop index if exists idx_collections_public;

-- Create indexes
create index idx_collections_user_id on public.collections (user_id);
create index idx_user_favorites_user_id on public.user_favorites (user_id);
create index idx_user_favorites_movie_id on public.user_favorites (movie_id);
create index idx_collection_movies_movie_id on public.collection_movies (movie_id);
create index idx_collection_movies_collection_id on public.collection_movies (collection_id);
create index idx_collections_public on public.collections (is_public) where is_public = true;

-- =============================================================================
-- Functions for Common Operations
-- =============================================================================

-- Drop existing functions if they exist
drop function if exists public.get_user_favorite_movie_ids(uuid);
drop function if exists public.get_collection_movie_ids(uuid);

-- Function to get user's favorite movie IDs
create or replace function public.get_user_favorite_movie_ids(target_user_id uuid default auth.uid())
returns integer[]
language sql
security definer
stable
as $$
  select array_agg(movie_id order by created_at desc)
  from public.user_favorites
  where user_id = target_user_id;
$$;

-- Function to get movies in a collection
create or replace function public.get_collection_movie_ids(target_collection_id uuid)
returns integer[]
language sql
security definer
stable
as $$
  select array_agg(movie_id order by added_at desc)
  from public.collection_movies
  where collection_id = target_collection_id;
$$;

-- =============================================================================
-- Success Message
-- =============================================================================
do $$
begin
  raise notice 'MovieDB database schema setup completed successfully!';
  raise notice 'Tables created: collections, user_favorites, collection_movies';
  raise notice 'RLS policies enabled and configured';
  raise notice 'Indexes created for performance';
  raise notice 'Helper functions created';
end $$; 