# Database Layer Documentation

## Architecture Overview

This database layer provides a clean, typed interface to Supabase for movie collection and favorites management.

## File Structure

```
lib/database/
├── schema.sql          # Complete database schema with RLS policies
├── types.ts           # TypeScript interface definitions
├── collections.ts     # Collections service layer
├── favorites.ts       # Favorites service layer
├── index.ts          # Barrel exports
└── README.md         # This documentation
```

## Core Tables

### `collections`
User-created movie collections that can be private or public.

```sql
id          uuid primary key
user_id     uuid references auth.users
name        text not null
description text
is_public   boolean default false
created_at  timestamp with time zone
updated_at  timestamp with time zone
```

### `user_favorites`
Individual movies marked as favorites by users.

```sql
id         uuid primary key  
user_id    uuid references auth.users
movie_id   integer not null (TMDB ID)
created_at timestamp with time zone
```

### `collection_movies`
Junction table linking movies to collections.

```sql
id            uuid primary key
collection_id uuid references collections
movie_id      integer not null (TMDB ID)
added_at      timestamp with time zone
```

## Service Layer

### CollectionsService

High-level operations for managing collections:

```typescript
// CRUD operations
await CollectionsService.getUserCollections()
await CollectionsService.createCollection({ name, description })
await CollectionsService.updateCollection(id, updates)
await CollectionsService.deleteCollection(id)

// Movie management
await CollectionsService.addMovieToCollection(collectionId, movieId)
await CollectionsService.removeMovieFromCollection(collectionId, movieId)
await CollectionsService.getCollectionMovieIds(collectionId)

// Public collections
await CollectionsService.getPublicCollections()
await CollectionsService.toggleCollectionPublic(collectionId)
```

### FavoritesService

Operations for user favorites:

```typescript
// Favorites management
await FavoritesService.getUserFavoriteIds()
await FavoritesService.addToFavorites(movieId)
await FavoritesService.removeFromFavorites(movieId)
await FavoritesService.toggleFavorite(movieId)

// Status checking
await FavoritesService.isFavorite(movieId)
await FavoritesService.getFavoritesCount()
```

## Row Level Security (RLS)

All tables use PostgreSQL RLS for data isolation:

- **Users can only access their own data**
- **Public collections are viewable by all authenticated users**
- **Anonymous users have no access**
- **Database-level security enforcement**

## Performance Features

### Indexes
- User lookups: `idx_collections_user_id`, `idx_user_favorites_user_id`
- Movie lookups: `idx_user_favorites_movie_id`, `idx_collection_movies_movie_id`
- Collection lookups: `idx_collection_movies_collection_id`
- Public collections: `idx_collections_public`

### Database Functions
- `get_user_favorite_movie_ids()`: Efficient favorite IDs retrieval
- `get_collection_movie_ids()`: Efficient collection movie retrieval

## Usage Examples

### Creating a Collection
```typescript
import { CollectionsService } from '@/lib/database';

const collection = await CollectionsService.createCollection({
  name: "My Sci-Fi Favorites",
  description: "The best science fiction movies",
  is_public: false
});
```

### Adding Movies to Collection
```typescript
await CollectionsService.addMovieToCollection(collection.id, 550); // Fight Club
await CollectionsService.addMovieToCollection(collection.id, 13); // Forrest Gump
```

### Managing Favorites
```typescript
import { FavoritesService } from '@/lib/database';

// Add to favorites
await FavoritesService.addToFavorites(550);

// Check if favorited
const isFav = await FavoritesService.isFavorite(550);

// Get all favorites
const favoriteIds = await FavoritesService.getUserFavoriteIds();
```

## Error Handling

Services throw errors for:
- Network/connection issues
- Authentication failures  
- Database constraint violations
- Not found errors (404)

Always wrap in try/catch:

```typescript
try {
  const collections = await CollectionsService.getUserCollections();
} catch (error) {
  console.error('Failed to load collections:', error);
  // Handle error appropriately
}
```

## TypeScript Integration

Full type safety with generated database types:

```typescript
import type { Collection, UserFavorite, Database } from '@/lib/database/types';

// Strongly typed throughout
const collection: Collection = await CollectionsService.getCollection(id);
```

## Migration from localStorage

See `MIGRATION_GUIDE.md` for complete migration instructions from localStorage to Supabase database. 