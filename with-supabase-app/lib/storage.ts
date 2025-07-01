import { MovieCollection } from './types';

const FAVORITES_KEY = 'movie_favorites';
const COLLECTIONS_KEY = 'movie_collections';

export class MovieStorage {
  // Favorites management
  static getFavorites(): number[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static addToFavorites(movieId: number): void {
    if (typeof window === 'undefined') return;
    
    const favorites = this.getFavorites();
    if (!favorites.includes(movieId)) {
      favorites.push(movieId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }

  static removeFromFavorites(movieId: number): void {
    if (typeof window === 'undefined') return;
    
    const favorites = this.getFavorites();
    const updated = favorites.filter(id => id !== movieId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  }

  static isFavorite(movieId: number): boolean {
    return this.getFavorites().includes(movieId);
  }

  static toggleFavorite(movieId: number): boolean {
    const isFav = this.isFavorite(movieId);
    if (isFav) {
      this.removeFromFavorites(movieId);
    } else {
      this.addToFavorites(movieId);
    }
    return !isFav;
  }

  // Collections management
  static getCollections(): MovieCollection[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    if (!stored) return [];
    
    const collections = JSON.parse(stored);
    return collections.map((col: any) => ({
      ...col,
      createdAt: new Date(col.createdAt)
    }));
  }

  static createCollection(name: string, description?: string): MovieCollection {
    if (typeof window === 'undefined') throw new Error('Cannot create collection on server');
    
    const collection: MovieCollection = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      description,
      movies: [],
      createdAt: new Date(),
      isPublic: false
    };

    const collections = this.getCollections();
    collections.push(collection);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
    
    return collection;
  }

  static updateCollection(collectionId: string, updates: Partial<MovieCollection>): void {
    if (typeof window === 'undefined') return;
    
    const collections = this.getCollections();
    const index = collections.findIndex(col => col.id === collectionId);
    
    if (index !== -1) {
      collections[index] = { ...collections[index], ...updates };
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
    }
  }

  static deleteCollection(collectionId: string): void {
    if (typeof window === 'undefined') return;
    
    const collections = this.getCollections();
    const filtered = collections.filter(col => col.id !== collectionId);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(filtered));
  }

  static addMovieToCollection(collectionId: string, movieId: number): void {
    if (typeof window === 'undefined') return;
    
    const collections = this.getCollections();
    const collection = collections.find(col => col.id === collectionId);
    
    if (collection && !collection.movies.includes(movieId)) {
      collection.movies.push(movieId);
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
    }
  }

  static removeMovieFromCollection(collectionId: string, movieId: number): void {
    if (typeof window === 'undefined') return;
    
    const collections = this.getCollections();
    const collection = collections.find(col => col.id === collectionId);
    
    if (collection) {
      collection.movies = collection.movies.filter(id => id !== movieId);
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
    }
  }

  static getCollection(collectionId: string): MovieCollection | null {
    const collections = this.getCollections();
    return collections.find(col => col.id === collectionId) || null;
  }

  // Share collection (generate shareable URL data)
  static exportCollection(collectionId: string): string | null {
    const collection = this.getCollection(collectionId);
    if (!collection) return null;
    
    const exportData = {
      name: collection.name,
      description: collection.description,
      movies: collection.movies,
      createdAt: collection.createdAt.toISOString()
    };
    
    return btoa(JSON.stringify(exportData));
  }

  static importCollection(encodedData: string): MovieCollection | null {
    try {
      const data = JSON.parse(atob(encodedData));
      return this.createCollection(
        `${data.name} (Imported)`,
        data.description
      );
    } catch (error) {
      console.error('Failed to import collection:', error);
      return null;
    }
  }
} 