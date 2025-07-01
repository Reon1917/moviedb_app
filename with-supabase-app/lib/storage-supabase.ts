import { CollectionsService, FavoritesService } from './database';
import { MovieCollection } from './types';

/**
 * Supabase-based Storage Service
 * Replaces localStorage with database persistence
 */
export class SupabaseMovieStorage {
  // =============================================================================
  // Favorites Management
  // =============================================================================

  static async getFavorites(): Promise<number[]> {
    try {
      return await FavoritesService.getUserFavoriteIds();
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  }

  static async addToFavorites(movieId: number): Promise<void> {
    await FavoritesService.addToFavorites(movieId);
  }

  static async removeFromFavorites(movieId: number): Promise<void> {
    await FavoritesService.removeFromFavorites(movieId);
  }

  static async isFavorite(movieId: number): Promise<boolean> {
    try {
      return await FavoritesService.isFavorite(movieId);
    } catch (error) {
      console.error('Failed to check favorite:', error);
      return false;
    }
  }

  static async toggleFavorite(movieId: number): Promise<boolean> {
    return await FavoritesService.toggleFavorite(movieId);
  }

  // =============================================================================
  // Collections Management
  // =============================================================================

  static async getCollections(): Promise<MovieCollection[]> {
    try {
      const collections = await CollectionsService.getUserCollections();
      
      const result: MovieCollection[] = [];
      for (const collection of collections) {
        const movieIds = await CollectionsService.getCollectionMovieIds(collection.id);
        result.push({
          id: collection.id,
          name: collection.name,
          description: collection.description || undefined,
          movies: movieIds,
          createdAt: new Date(collection.created_at),
          isPublic: collection.is_public
        });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get collections:', error);
      return [];
    }
  }

  static async createCollection(name: string, description?: string): Promise<MovieCollection> {
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
  }

  static async deleteCollection(collectionId: string): Promise<void> {
    await CollectionsService.deleteCollection(collectionId);
  }

  static async addMovieToCollection(collectionId: string, movieId: number): Promise<void> {
    await CollectionsService.addMovieToCollection(collectionId, movieId);
  }

  static async removeMovieFromCollection(collectionId: string, movieId: number): Promise<void> {
    await CollectionsService.removeMovieFromCollection(collectionId, movieId);
  }

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

  // Legacy methods for compatibility
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

  static async importCollection(encodedData: string): Promise<MovieCollection | null> {
    try {
      const data = JSON.parse(atob(encodedData));
      const collection = await this.createCollection(
        `${data.name} (Imported)`,
        data.description
      );

      for (const movieId of data.movies) {
        await this.addMovieToCollection(collection.id, movieId);
      }

      return collection;
    } catch (error) {
      console.error('Failed to import collection:', error);
      return null;
    }
  }
} 