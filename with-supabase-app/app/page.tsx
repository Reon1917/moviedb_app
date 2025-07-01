'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { MovieGrid } from '@/components/movie-grid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Movie, Genre } from '@/lib/types';
import { tmdbClient } from '@/lib/tmdb';
import { TrendingUp, Star, Clock, Calendar } from 'lucide-react';

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'popular' | 'top_rated' | 'now_playing' | 'upcoming'>('popular');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    if (genres.length > 0) {
      loadMovies('popular');
    }
  }, [genres]);

  useEffect(() => {
    if (genres.length === 0) return;
    
    if (searchQuery) {
      searchMovies();
    } else if (selectedGenre) {
      loadMoviesByGenre(selectedGenre);
    } else {
      loadMovies(activeSection);
    }
  }, [activeSection, selectedGenre, searchQuery, genres]);

  const loadGenres = async () => {
    try {
      const response = await tmdbClient.getGenres();
      setGenres(response.genres);
    } catch (error) {
      console.error('Failed to load genres:', error);
    }
  };

  const loadMovies = async (section: typeof activeSection) => {
    setLoading(true);
    try {
      let response;
      switch (section) {
        case 'popular':
          response = await tmdbClient.getPopularMovies();
          break;
        case 'top_rated':
          response = await tmdbClient.getTopRatedMovies();
          break;
        case 'now_playing':
          response = await tmdbClient.getNowPlayingMovies();
          break;
        case 'upcoming':
          response = await tmdbClient.getUpcomingMovies();
          break;
      }
      
      // Add genre information to movies
      const moviesWithGenres = response.results.map(movie => ({
        ...movie,
        genres: movie.genre_ids?.map(id => genres.find(g => g.id === id)).filter(Boolean) || []
      }));
      
      setMovies(moviesWithGenres);
    } catch (error) {
      console.error('Failed to load movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoviesByGenre = async (genreId: number) => {
    setLoading(true);
    try {
      const response = await tmdbClient.getMoviesByGenre(genreId);
      const moviesWithGenres = response.results.map(movie => ({
        ...movie,
        genres: movie.genre_ids?.map(id => genres.find(g => g.id === id)).filter(Boolean) || []
      }));
      setMovies(moviesWithGenres);
    } catch (error) {
      console.error('Failed to load movies by genre:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async () => {
    setLoading(true);
    
    try {
      const response = await tmdbClient.searchMovies(searchQuery);
      const moviesWithGenres = response.results.map(movie => ({
        ...movie,
        genres: movie.genre_ids?.map(id => genres.find(g => g.id === id)).filter(Boolean) || []
      }));
      setMovies(moviesWithGenres);
    } catch (error) {
      console.error('Failed to search movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSelectedGenre(null);
  };

  const handleSectionChange = (section: typeof activeSection) => {
    setActiveSection(section);
    setSelectedGenre(null);
    setSearchQuery('');
  };

  const handleGenreFilter = (genreId: number) => {
    setSelectedGenre(selectedGenre === genreId ? null : genreId);
    setSearchQuery('');
  };

  const getSectionTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (selectedGenre) {
      const genre = genres.find(g => g.id === selectedGenre);
      return `${genre?.name} Movies`;
    }
    
    switch (activeSection) {
      case 'popular': return 'Popular Movies';
      case 'top_rated': return 'Top Rated Movies';
      case 'now_playing': return 'Now Playing';
      case 'upcoming': return 'Upcoming Movies';
    }
  };

  const getSectionIcon = () => {
    switch (activeSection) {
      case 'popular': return TrendingUp;
      case 'top_rated': return Star;
      case 'now_playing': return Clock;
      case 'upcoming': return Calendar;
    }
  };

  const Icon = getSectionIcon();

  return (
    <div className="min-h-screen bg-background">
      <Navigation onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Discover Amazing Movies
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the latest blockbusters, timeless classics, and hidden gems. 
            Create your own movie collections and never miss a great film.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'popular', label: 'Popular', icon: TrendingUp },
            { key: 'top_rated', label: 'Top Rated', icon: Star },
            { key: 'now_playing', label: 'Now Playing', icon: Clock },
            { key: 'upcoming', label: 'Upcoming', icon: Calendar }
          ].map(({ key, label, icon: SectionIcon }) => (
            <Button
              key={key}
              variant={activeSection === key ? 'default' : 'outline'}
              onClick={() => handleSectionChange(key as typeof activeSection)}
              className="flex items-center space-x-2"
            >
              <SectionIcon className="h-4 w-4" />
              <span>{label}</span>
            </Button>
          ))}
        </div>

        {/* Genre Filter */}
        {!searchQuery && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Filter by Genre:</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Badge
                  key={genre.id}
                  variant={selectedGenre === genre.id ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => handleGenreFilter(genre.id)}
                >
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Section Title */}
        <div className="flex items-center space-x-2 mb-6">
          <Icon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">{getSectionTitle()}</h2>
        </div>

        {/* Movie Grid */}
        <MovieGrid 
          movies={movies} 
          loading={loading}
          emptyMessage={searchQuery ? 
            `No movies found for "${searchQuery}". Try a different search term.` :
            'No movies available in this section.'
          }
        />
      </main>
    </div>
  );
}
