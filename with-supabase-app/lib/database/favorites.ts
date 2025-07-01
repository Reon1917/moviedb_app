import { createTypedClient } from '../supabase/typed-client';
import { UserFavorite } from './types';

/**
 * Favorites Database Service
 * Handles all database operations for user movie favorites
 */
export class FavoritesService {
  private static supabase = createTypedClient();

  // =============================================================================
  // Favorites CRUD Operations
  // =============================================================================

  /**
   * Get all favorite movie IDs for the authenticated user
   */
  static async getUserFavoriteIds(): Promise<number[]> {
    const { data, error } = await this.supabase.rpc('get_user_favorite_movie_ids');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all favorite records for the authenticated user
   */
  static async getUserFavorites(): Promise<UserFavorite[]> {
    const { data, error } = await this.supabase
      .from('user_favorites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Add a movie to user's favorites
   */
  static async addToFavorites(movieId: number): Promise<UserFavorite> {
    const { data, error } = await this.supabase
      .from('user_favorites')
      .insert({ movie_id: movieId })
      .select()
      .single();

    if (error) {
      // If duplicate, return existing record
      if (error.code === '23505') {
        const existing = await this.getFavorite(movieId);
        if (existing) return existing;
      }
      throw error;
    }

    return data;
  }

  /**
   * Remove a movie from user's favorites
   */
  static async removeFromFavorites(movieId: number): Promise<void> {
    const { error } = await this.supabase
      .from('user_favorites')
      .delete()
      .eq('movie_id', movieId);

    if (error) throw error;
  }

  /**
   * Check if a movie is in user's favorites
   */
  static async isFavorite(movieId: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_favorites')
      .select('id')
      .eq('movie_id', movieId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false; // Not found
      throw error;
    }

    return !!data;
  }

  /**
   * Get a specific favorite record
   */
  static async getFavorite(movieId: number): Promise<UserFavorite | null> {
    const { data, error } = await this.supabase
      .from('user_favorites')
      .select('*')
      .eq('movie_id', movieId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  /**
   * Toggle favorite status for a movie
   */
  static async toggleFavorite(movieId: number): Promise<boolean> {
    const isFav = await this.isFavorite(movieId);

    if (isFav) {
      await this.removeFromFavorites(movieId);
      return false;
    } else {
      await this.addToFavorites(movieId);
      return true;
    }
  }

  /**
   * Get count of user's favorites
   */
  static async getFavoritesCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }

  /**
   * Remove all favorites for the authenticated user
   */
  static async clearAllFavorites(): Promise<void> {
    const { error } = await this.supabase
      .from('user_favorites')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) throw error;
  }
} 