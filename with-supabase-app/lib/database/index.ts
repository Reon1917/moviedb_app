/**
 * Database Module Exports
 * Central export point for all database services and types
 */

// Services
export { CollectionsService } from './collections';
export { FavoritesService } from './favorites';

// Types
export type {
  Collection,
  UserFavorite,
  CollectionMovie,
  CollectionInsert,
  UserFavoriteInsert,
  CollectionMovieInsert,
  CollectionUpdate,
  CollectionWithMovieCount,
  CollectionWithMovies,
  Database
} from './types';

// Typed client
export { createTypedClient } from '../supabase/typed-client'; 