'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { MovieGrid } from '@/components/movie-grid';
import { Movie } from '@/lib/types';
import { tmdbClient } from '@/lib/tmdb';
import { apiClient } from '@/lib/api-client';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteMovies();
  }, []);

  const loadFavoriteMovies = async () => {
    setLoading(true);
    try {
      const favoriteIds = await apiClient.getFavorites();
      
      if (favoriteIds.length === 0) {
        setFavoriteMovies([]);
        setLoading(false);
        return;
      }

      // Load movie details for each favorite
      const moviePromises = favoriteIds.map(id => tmdbClient.getMovieDetails(id));
      const movies = await Promise.all(moviePromises);
      
      setFavoriteMovies(movies);
    } catch (error) {
      console.error('Failed to load favorite movies:', error);
      setFavoriteMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          <div>
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="text-muted-foreground">
              {favoriteMovies.length} movie{favoriteMovies.length !== 1 ? 's' : ''} in your favorites
            </p>
          </div>
        </div>

        {/* Movies Grid */}
        <MovieGrid 
          movies={favoriteMovies} 
          loading={loading}
          emptyMessage="You haven't added any movies to your favorites yet. Browse movies and click the heart icon to add them here!"
        />
      </main>
    </div>
  );
} 