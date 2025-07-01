-- =============================================================================
-- Movie Database Schema
-- =============================================================================
-- This schema defines the core tables for movie collections and user favorites
-- following Supabase best practices with Row Level Security (RLS)

-- =============================================================================
-- User Collections Table
-- =============================================================================
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

comment on table public.collections is 'User-created movie collections that can contain multiple movies and be shared publicly';
comment on column public.collections.user_id is 'References the authenticated user who owns this collection';
comment on column public.collections.name is 'Display name for the collection, e.g. "My Favorite Sci-Fi Movies"';
comment on column public.collections.description is 'Optional description explaining the collection theme or criteria';
comment on column public.collections.is_public is 'Whether the collection can be viewed by other users';

-- =============================================================================
-- User Favorites Table  
-- =============================================================================
create table public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  movie_id integer not null,
  created_at timestamp with time zone default now() not null,
  constraint unique_user_movie_favorite unique (user_id, movie_id)
);

comment on table public.user_favorites is 'Individual movies marked as favorites by users';
comment on column public.user_favorites.user_id is 'References the authenticated user who favorited this movie';
comment on column public.user_favorites.movie_id is 'TMDB movie ID for the favorited movie';
comment on constraint unique_user_movie_favorite on public.user_favorites is 'Prevents duplicate favorites for the same user and movie';

-- =============================================================================
-- Collection Movies Junction Table
-- =============================================================================
create table public.collection_movies (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections (id) on delete cascade not null,
  movie_id integer not null,
  added_at timestamp with time zone default now() not null,
  constraint unique_collection_movie unique (collection_id, movie_id)
);

comment on table public.collection_movies is 'Junction table linking movies to collections, allowing movies to be in multiple collections';
comment on column public.collection_movies.collection_id is 'References the collection this movie belongs to';
comment on column public.collection_movies.movie_id is 'TMDB movie ID for the movie in this collection';
comment on constraint unique_collection_movie on public.collection_movies is 'Prevents duplicate movies within the same collection';

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================

-- Enable RLS on all tables
alter table public.collections enable row level security;
alter table public.user_favorites enable row level security;
alter table public.collection_movies enable row level security;

-- Collections policies: Users can manage their own collections
create policy "users_can_manage_own_collections" on public.collections
  for all 
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Public collections are viewable by everyone
create policy "public_collections_viewable_by_all" on public.collections
  for select
  to authenticated
  using (is_public = true);

-- User favorites policies: Users can manage their own favorites
create policy "users_can_manage_own_favorites" on public.user_favorites
  for all
  to authenticated  
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Collection movies policies: Users can manage movies in their own collections
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

-- Public collection movies are viewable by everyone
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

-- Index for user lookups
create index idx_collections_user_id on public.collections (user_id);
create index idx_user_favorites_user_id on public.user_favorites (user_id);

-- Index for movie lookups
create index idx_user_favorites_movie_id on public.user_favorites (movie_id);
create index idx_collection_movies_movie_id on public.collection_movies (movie_id);

-- Index for collection lookups
create index idx_collection_movies_collection_id on public.collection_movies (collection_id);

-- Index for public collections
create index idx_collections_public on public.collections (is_public) where is_public = true;

-- =============================================================================
-- Functions for Common Operations
-- =============================================================================

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

comment on function public.get_user_favorite_movie_ids is 'Returns array of movie IDs favorited by the specified user, ordered by most recently added';

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

comment on function public.get_collection_movie_ids is 'Returns array of movie IDs in the specified collection, ordered by most recently added'; 