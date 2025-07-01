import { CollectionsService, FavoritesService } from './database';
import { MovieCollection } from './types';
import { tmdbClient } from './tmdb';
import { Movie } from './types';

/**
 * Modern Storage Service using Supabase Database
 * Replaces localStorage-based MovieStorage with database persistence
 */
export class MovieStorageV2 {
  // =============================================================================
  // Favorites Management
  // =============================================================================

  /**
   * Get user's favorite movie IDs
   */
  static async getFavorites(): Promise<number[]> {
    try {
      return await FavoritesService.getUserFavoriteIds();
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  }

  /**
   * Add a movie to favorites
   */
  static async addToFavorites(movieId: number): Promise<void> {
    try {
      await FavoritesService.addToFavorites(movieId);
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove a movie from favorites
   */
  static async removeFromFavorites(movieId: number): Promise<void> {
    try {
      await FavoritesService.removeFromFavorites(movieId);
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      throw error;
    }
  }

  /**
   * Check if a movie is favorited
   */
  static async isFavorite(movieId: number): Promise<boolean> {
    try {
      return await FavoritesService.isFavorite(movieId);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      return false;
    }
  }

  /**
   * Toggle favorite status of a movie
   */
  static async toggleFavorite(movieId: number): Promise<boolean> {
    try {
      return await FavoritesService.toggleFavorite(movieId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }

  // =============================================================================
  // Collections Management  
  // =============================================================================

  /**
   * Get all user collections (converted to legacy format)
   */
  static async getCollections(): Promise<MovieCollection[]> {
    try {
      const collections = await CollectionsService.getUserCollections();
      
      // Convert to legacy format for backward compatibility
      const legacyCollections: MovieCollection[] = [];
      
      for (const collection of collections) {
        const movieIds = await CollectionsService.getCollectionMovieIds(collection.id);
        
        legacyCollections.push({
          id: collection.id,
          name: collection.name,
          description: collection.description || undefined,
          movies: movieIds,
          createdAt: new Date(collection.created_at),
          isPublic: collection.is_public
        });
      }
      
      return legacyCollections;
    } catch (error) {
      console.error('Failed to get collections:', error);
      return [];
    }
  }

  /**
   * Create a new collection
   */
  static async createCollection(
    name: string, 
    description?: string
  ): Promise<MovieCollection> {
    try {
      const collection = await CollectionsService.createCollection({
        name,
        description,
        is_public: false
      });

      return {
        id: collection.id,
        name: collection.name,
        description: collection.description || undefined,
        movies: [],
        createdAt: new Date(collection.created_at),
        isPublic: collection.is_public
      };
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  }

  /**
   * Update an existing collection
   */
  static async updateCollection(
    collectionId: string, 
    updates: Partial<MovieCollection>
  ): Promise<void> {
    try {
      await CollectionsService.updateCollection(collectionId, {
        name: updates.name,
        description: updates.description,
        is_public: updates.isPublic
      });
    } catch (error) {
      console.error('Failed to update collection:', error);
      throw error;
    }
  }

  /**
   * Delete a collection
   */
  static async deleteCollection(collectionId: string): Promise<void> {
    try {
      await CollectionsService.deleteCollection(collectionId);
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  }

  /**
   * Add a movie to a collection
   */
  static async addMovieToCollection(collectionId: string, movieId: number): Promise<void> {
    try {
      await CollectionsService.addMovieToCollection(collectionId, movieId);
    } catch (error) {
      console.error('Failed to add movie to collection:', error);
      throw error;
    }
  }

  /**
   * Remove a movie from a collection
   */
  static async removeMovieFromCollection(collectionId: string, movieId: number): Promise<void> {
    try {
      await CollectionsService.removeMovieFromCollection(collectionId, movieId);
    } catch (error) {
      console.error('Failed to remove movie from collection:', error);
      throw error;
    }
  }

  /**
   * Get a specific collection by ID
   */
  static async getCollection(collectionId: string): Promise<MovieCollection | null> {
    try {
      const collection = await CollectionsService.getCollection(collectionId);
      if (!collection) return null;

      const movieIds = await CollectionsService.getCollectionMovieIds(collectionId);

      return {
        id: collection.id,
        name: collection.name,
        description: collection.description || undefined,
        movies: movieIds,
        createdAt: new Date(collection.created_at),
        isPublic: collection.is_public
      };
    } catch (error) {
      console.error('Failed to get collection:', error);
      return null;
    }
  }

  // =============================================================================
  // Share/Export Collection (Enhanced)
  // =============================================================================

  /**
   * Make a collection public and return shareable URL
   */
  static async shareCollection(collectionId: string): Promise<string | null> {
    try {
      // Make collection public
      await CollectionsService.updateCollection(collectionId, { is_public: true });
      
      // Return shareable URL
      const shareUrl = `${window.location.origin}/collections/public/${collectionId}`;
      return shareUrl;
    } catch (error) {
      console.error('Failed to share collection:', error);
      return null;
    }
  }

  /**
   * Export collection data (legacy format for backward compatibility)
   */
  static async exportCollection(collectionId: string): Promise<string | null> {
    try {
      const collection = await this.getCollection(collectionId);
      if (!collection) return null;

      const exportData = {
        name: collection.name,
        description: collection.description,
        movies: collection.movies,
        createdAt: collection.createdAt.toISOString()
      };

      return btoa(JSON.stringify(exportData));
    } catch (error) {
      console.error('Failed to export collection:', error);
      return null;
    }
  }

  /**
   * Import collection from encoded data
   */
  static async importCollection(encodedData: string): Promise<MovieCollection | null> {
    try {
      const data = JSON.parse(atob(encodedData));
      
      const collection = await this.createCollection(
        `${data.name} (Imported)`,
        data.description
      );

      // Add movies to the collection
      for (const movieId of data.movies) {
        await this.addMovieToCollection(collection.id, movieId);
      }

      return collection;
    } catch (error) {
      console.error('Failed to import collection:', error);
      return null;
    }
  }

  // =============================================================================
  // Utility Functions
  // =============================================================================

  /**
   * Get detailed movie objects from IDs
   */
  static async getMoviesFromIds(movieIds: number[]): Promise<Movie[]> {
    try {
      const moviePromises = movieIds.map(id => tmdbClient.getMovieDetails(id));
      return await Promise.all(moviePromises);
    } catch (error) {
      console.error('Failed to get movies from IDs:', error);
      return [];
    }
  }

  /**
   * Get user's favorite movies with full details
   */
  static async getFavoriteMovies(): Promise<Movie[]> {
    try {
      const favoriteIds = await this.getFavorites();
      return this.getMoviesFromIds(favoriteIds);
    } catch (error) {
      console.error('Failed to get favorite movies:', error);
      return [];
    }
  }

  /**
   * Get collection movies with full details
   */
  static async getCollectionMovies(collectionId: string): Promise<Movie[]> {
    try {
      const movieIds = await CollectionsService.getCollectionMovieIds(collectionId);
      return this.getMoviesFromIds(movieIds);
    } catch (error) {
      console.error('Failed to get collection movies:', error);
      return [];
    }
  }
} 