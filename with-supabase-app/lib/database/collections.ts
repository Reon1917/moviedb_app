import { createTypedClient } from '../supabase/typed-client';
import { Collection, CollectionInsert, CollectionUpdate, CollectionWithMovieCount } from './types';

/**
 * Collections Database Service
 * Handles all database operations for movie collections
 */
export class CollectionsService {
  private static supabase = createTypedClient();

  // =============================================================================
  // Collection CRUD Operations
  // =============================================================================

  /**
   * Get all collections for the authenticated user
   */
  static async getUserCollections(): Promise<CollectionWithMovieCount[]> {
    const { data, error } = await this.supabase
      .from('collections')
      .select(`
        *,
        collection_movies(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(collection => ({
      ...collection,
      movie_count: collection.collection_movies[0]?.count || 0
    }));
  }

  /**
   * Get a specific collection by ID
   */
  static async getCollection(collectionId: string): Promise<Collection | null> {
    const { data, error } = await this.supabase
      .from('collections')
      .select('*')
      .eq('id', collectionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  /**
   * Create a new collection
   */
  static async createCollection(collectionData: CollectionInsert): Promise<Collection> {
    const { data, error } = await this.supabase
      .from('collections')
      .insert(collectionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing collection
   */
  static async updateCollection(
    collectionId: string, 
    updates: CollectionUpdate
  ): Promise<Collection> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('collections')
      .update(updateData)
      .eq('id', collectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a collection
   */
  static async deleteCollection(collectionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('collections')
      .delete()
      .eq('id', collectionId);

    if (error) throw error;
  }

  // =============================================================================
  // Collection Movies Operations
  // =============================================================================

  /**
   * Get all movie IDs in a collection
   */
  static async getCollectionMovieIds(collectionId: string): Promise<number[]> {
    const { data, error } = await this.supabase.rpc(
      'get_collection_movie_ids',
      { target_collection_id: collectionId }
    );

    if (error) throw error;
    return data || [];
  }

  /**
   * Add a movie to a collection
   */
  static async addMovieToCollection(collectionId: string, movieId: number): Promise<void> {
    const { error } = await this.supabase
      .from('collection_movies')
      .insert({
        collection_id: collectionId,
        movie_id: movieId
      });

    if (error) {
      // Ignore duplicate key errors (movie already in collection)
      if (error.code !== '23505') throw error;
    }
  }

  /**
   * Remove a movie from a collection
   */
  static async removeMovieFromCollection(collectionId: string, movieId: number): Promise<void> {
    const { error } = await this.supabase
      .from('collection_movies')
      .delete()
      .eq('collection_id', collectionId)
      .eq('movie_id', movieId);

    if (error) throw error;
  }

  /**
   * Check if a movie is in a collection
   */
  static async isMovieInCollection(collectionId: string, movieId: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('collection_movies')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('movie_id', movieId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false; // Not found
      throw error;
    }

    return !!data;
  }

  // =============================================================================
  // Public Collections
  // =============================================================================

  /**
   * Get all public collections
   */
  static async getPublicCollections(): Promise<CollectionWithMovieCount[]> {
    const { data, error } = await this.supabase
      .from('collections')
      .select(`
        *,
        collection_movies(count)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(collection => ({
      ...collection,
      movie_count: collection.collection_movies[0]?.count || 0
    }));
  }

  /**
   * Toggle collection public status
   */
  static async toggleCollectionPublic(collectionId: string): Promise<Collection> {
    // First get current status
    const collection = await this.getCollection(collectionId);
    if (!collection) throw new Error('Collection not found');

    // Toggle the status
    return this.updateCollection(collectionId, {
      is_public: !collection.is_public
    });
  }
} 