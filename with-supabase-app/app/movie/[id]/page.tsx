'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Star, Calendar, Clock, Heart, Play, Users, Eye, EyeOff } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { MovieCard } from '@/components/movie-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MovieDetails, CastMember, Video } from '@/lib/types';
import { tmdbClient } from '@/lib/tmdb';
import { MovieStorage } from '@/lib/storage';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = parseInt(params.id as string);

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(false);

  useEffect(() => {
    if (movieId) {
      loadMovieDetails();
      setIsFavorite(MovieStorage.isFavorite(movieId));
    }
  }, [movieId]);

  const loadMovieDetails = async () => {
    setLoading(true);
    try {
      // Load movie details, credits, videos, and similar movies in parallel
      const [movieData, creditsData, videosData, similarData] = await Promise.all([
        tmdbClient.getMovieDetails(movieId),
        tmdbClient.getMovieCredits(movieId),
        tmdbClient.getMovieVideos(movieId),
        tmdbClient.getSimilarMovies(movieId)
      ]);

      setMovie(movieData);
      setCast(creditsData.cast.slice(0, 12)); // Show first 12 cast members
      setVideos(videosData.results.filter(video => video.type === 'Trailer' || video.type === 'Teaser'));
      setSimilarMovies(similarData.results.slice(0, 12));
    } catch (error) {
      console.error('Failed to load movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    const newFavoriteState = MovieStorage.toggleFavorite(movieId);
    setIsFavorite(newFavoriteState);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTrailerVideo = () => {
    return videos.find(video => video.type === 'Trailer') || videos[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="aspect-[2/3] bg-muted rounded-lg" />
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="h-10 bg-muted rounded" />
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Hero Section with Backdrop */}
        <div className="relative mb-8 rounded-lg overflow-hidden">
          {movie.backdrop_path && (
            <div className="absolute inset-0">
              <Image
                src={tmdbClient.getBackdropUrl(movie.backdrop_path)}
                alt={movie.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
          )}
          
          <div className="relative z-10 p-8 text-white">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Movie Poster */}
              <div className="md:col-span-1">
                <div className="relative aspect-[2/3] max-w-sm mx-auto">
                  <Image
                    src={tmdbClient.getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    fill
                    className="object-cover rounded-lg shadow-lg"
                  />
                </div>
              </div>

              {/* Movie Info */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
                  {movie.tagline && (
                    <p className="text-xl text-gray-300 italic">"{movie.tagline}"</p>
                  )}
                </div>

                {/* Movie Stats */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{movie.vote_average.toFixed(1)}/10</span>
                    <span className="text-gray-300">({movie.vote_count} votes)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleFavoriteToggle}
                    variant={isFavorite ? "default" : "outline"}
                    className="flex items-center space-x-2"
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                    <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                  </Button>
                  
                  {getTrailerVideo() && (
                    <Button variant="outline" asChild>
                      <a
                        href={`https://www.youtube.com/watch?v=${getTrailerVideo()?.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>Watch Trailer</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overview</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSpoilers(!showSpoilers)}
                className="flex items-center space-x-2"
              >
                {showSpoilers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showSpoilers ? 'Hide Spoilers' : 'Show Spoilers'}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {showSpoilers && movie.spoiler_overview ? movie.spoiler_overview : movie.overview}
            </p>
            {!showSpoilers && movie.spoiler_overview && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                Click "Show Spoilers" for a more detailed synopsis.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cast Section */}
        {cast.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Cast</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {cast.map((member) => (
                  <div key={member.id} className="text-center">
                    <div className="relative aspect-[2/3] mb-2 rounded-lg overflow-hidden bg-muted">
                      {member.profile_path ? (
                        <Image
                          src={tmdbClient.getProfileUrl(member.profile_path)}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm">{member.name}</h4>
                    <p className="text-xs text-muted-foreground">{member.character}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Movie Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Production</h4>
              <div className="space-y-1 text-muted-foreground">
                <p><span className="font-medium">Status:</span> {movie.status}</p>
                <p><span className="font-medium">Original Language:</span> {movie.original_language.toUpperCase()}</p>
                {movie.budget > 0 && (
                  <p><span className="font-medium">Budget:</span> {formatCurrency(movie.budget)}</p>
                )}
                {movie.revenue > 0 && (
                  <p><span className="font-medium">Revenue:</span> {formatCurrency(movie.revenue)}</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">External Links</h4>
              <div className="space-y-1">
                {movie.homepage && (
                  <a
                    href={movie.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline"
                  >
                    Official Website
                  </a>
                )}
                {movie.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline"
                  >
                    IMDb Page
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Similar Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarMovies.map((similarMovie) => (
                <MovieCard key={similarMovie.id} movie={similarMovie} showGenres={false} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 