/**
 * API Client - Uses Next.js API routes for all data operations
 * This replaces direct Supabase calls with clean HTTP requests
 */

interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  [key: string]: any;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  movies: number[];
  movieCount: number;
}

interface User {
  id: string;
  email: string;
  user_metadata?: any;
}

class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }

  // =============================================================================
  // Auth Operations
  // =============================================================================

  async getCurrentUser(): Promise<User | null> {
    try {
      const { user } = await this.request<{ user: User }>('/auth');
      return user;
    } catch (error) {
      return null;
    }
  }

  // =============================================================================
  // Favorites Operations
  // =============================================================================

  async getFavorites(): Promise<number[]> {
    try {
      const { favorites } = await this.request<{ favorites: number[] }>('/favorites');
      return favorites;
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  }

  async addToFavorites(movieId: number): Promise<boolean> {
    try {
      await this.request('/favorites', {
        method: 'POST',
        body: JSON.stringify({ movieId }),
      });
      return true;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      return false;
    }
  }

  async removeFromFavorites(movieId: number): Promise<boolean> {
    try {
      await this.request(`/favorites?movieId=${movieId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      return false;
    }
  }

  async isFavorite(movieId: number): Promise<boolean> {
    try {
      const { isFavorite } = await this.request<{ isFavorite: boolean }>(`/favorites/${movieId}`);
      return isFavorite;
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      return false;
    }
  }

  async toggleFavorite(movieId: number): Promise<boolean> {
    try {
      const isFav = await this.isFavorite(movieId);
      
      if (isFav) {
        await this.removeFromFavorites(movieId);
        return false;
      } else {
        await this.addToFavorites(movieId);
        return true;
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return false;
    }
  }

  // =============================================================================
  // Collections Operations
  // =============================================================================

  async getCollections(): Promise<Collection[]> {
    try {
      const { collections } = await this.request<{ collections: Collection[] }>('/collections');
      return collections;
    } catch (error) {
      console.error('Failed to get collections:', error);
      return [];
    }
  }

  async getCollection(id: string): Promise<Collection | null> {
    try {
      const { collection } = await this.request<{ collection: Collection }>(`/collections/${id}`);
      return collection;
    } catch (error) {
      console.error('Failed to get collection:', error);
      return null;
    }
  }

  async createCollection(
    name: string, 
    description?: string, 
    isPublic = false
  ): Promise<Collection | null> {
    try {
      const { collection } = await this.request<{ collection: Collection }>('/collections', {
        method: 'POST',
        body: JSON.stringify({ name, description, isPublic }),
      });
      return collection;
    } catch (error) {
      console.error('Failed to create collection:', error);
      return null;
    }
  }

  async updateCollection(
    id: string,
    updates: { name?: string; description?: string; isPublic?: boolean }
  ): Promise<Collection | null> {
    try {
      const { collection } = await this.request<{ collection: Collection }>(`/collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return collection;
    } catch (error) {
      console.error('Failed to update collection:', error);
      return null;
    }
  }

  async deleteCollection(id: string): Promise<boolean> {
    try {
      await this.request(`/collections/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Failed to delete collection:', error);
      return false;
    }
  }

  async addMovieToCollection(collectionId: string, movieId: number): Promise<boolean> {
    try {
      await this.request(`/collections/${collectionId}/movies`, {
        method: 'POST',
        body: JSON.stringify({ movieId }),
      });
      return true;
    } catch (error) {
      console.error('Failed to add movie to collection:', error);
      return false;
    }
  }

  async removeMovieFromCollection(collectionId: string, movieId: number): Promise<boolean> {
    try {
      await this.request(`/collections/${collectionId}/movies?movieId=${movieId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Failed to remove movie from collection:', error);
      return false;
    }
  }

  async isMovieInCollection(collectionId: string, movieId: number): Promise<boolean> {
    try {
      const collection = await this.getCollection(collectionId);
      return collection?.movies.includes(movieId) || false;
    } catch (error) {
      console.error('Failed to check movie in collection:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { Collection, User }; 