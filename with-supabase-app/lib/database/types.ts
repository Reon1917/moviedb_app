/**
 * Database Types
 * Generated types for Supabase database schema
 */

// =============================================================================
// Database Table Types
// =============================================================================

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  movie_id: number;
  created_at: string;
}

export interface CollectionMovie {
  id: string;
  collection_id: string;
  movie_id: number;
  added_at: string;
}

// =============================================================================
// Database Insert Types (for creating new records)
// =============================================================================

export interface CollectionInsert {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface UserFavoriteInsert {
  movie_id: number;
}

export interface CollectionMovieInsert {
  collection_id: string;
  movie_id: number;
}

// =============================================================================
// Database Update Types (for updating existing records)
// =============================================================================

export interface CollectionUpdate {
  name?: string;
  description?: string;
  is_public?: boolean;
  updated_at?: string;
}

// =============================================================================
// Extended Types with Relations
// =============================================================================

export interface CollectionWithMovieCount extends Collection {
  movie_count: number;
}

export interface CollectionWithMovies extends Collection {
  movies: number[];
}

// =============================================================================
// Supabase Database Schema Type
// =============================================================================

export interface Database {
  public: {
    Tables: {
      collections: {
        Row: Collection;
        Insert: CollectionInsert;
        Update: CollectionUpdate;
      };
      user_favorites: {
        Row: UserFavorite;
        Insert: UserFavoriteInsert;
        Update: never; // Favorites don't get updated, only added/removed
      };
      collection_movies: {
        Row: CollectionMovie;
        Insert: CollectionMovieInsert;
        Update: never; // Collection movies don't get updated, only added/removed
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_favorite_movie_ids: {
        Args: { target_user_id?: string };
        Returns: number[];
      };
      get_collection_movie_ids: {
        Args: { target_collection_id: string };
        Returns: number[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 