'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Star, 
  Calendar, 
  Clock, 
  Heart, 
  Play, 
  Plus,
  ExternalLink,
  DollarSign,
  Globe,
  BookmarkPlus
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { MovieCard } from '@/components/movie-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MovieDetails, CastMember, Video, Movie } from '@/lib/types';
import { tmdbClient, TMDBClient } from '@/lib/tmdb';
import { apiClient } from '@/lib/api-client';
import { CollectionSelector } from '@/components/collection-selector';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = parseInt(params.id as string);

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    checkAuth();
    if (movieId) {
      loadMovieDetails();
    }
  }, [movieId]);

  const checkAuth = async () => {
    const user = await apiClient.getCurrentUser();
    setIsAuthenticated(!!user);
    
    if (movieId && user) {
      const favoriteStatus = await apiClient.isFavorite(movieId);
      setIsFavorite(favoriteStatus);
    }
  };

  const loadMovieDetails = async () => {
    setLoading(true);
    try {
      const [movieData, creditsData, videosData, similarData] = await Promise.all([
        tmdbClient.getMovieDetails(movieId),
        tmdbClient.getMovieCredits(movieId),
        tmdbClient.getMovieVideos(movieId),
        tmdbClient.getSimilarMovies(movieId)
      ]);

      setMovie(movieData);
      setCast(creditsData.cast.slice(0, 8));
      setVideos(videosData.results.filter(video => 
        video.type === 'Trailer' || video.type === 'Teaser'
      ));
      setSimilarMovies(similarData.results.slice(0, 8));
    } catch (error) {
      console.error('Failed to load movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const newFavoriteState = await apiClient.toggleFavorite(movieId);
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
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const getMainTrailer = () => {
    return videos.find(video => video.type === 'Trailer') || videos[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8" />
            <div className="relative h-[600px] bg-muted rounded-xl mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-6 bg-muted rounded w-20" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-24" />
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-muted rounded" />
                  ))}
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
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <h1 className="text-3xl font-bold mb-4">Movie Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The movie you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.back()} size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const mainTrailer = getMainTrailer();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 hover:bg-muted/80"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Movies
        </Button>

        {/* Hero Section */}
        <div className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {/* Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={movie.backdrop_path 
                ? TMDBClient.getBackdropUrl(movie.backdrop_path)
                : '/placeholder-movie.jpg'
              }
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
              {/* Movie Poster */}
              <div className="lg:col-span-1">
                <div className="aspect-[2/3] relative max-w-sm mx-auto lg:mx-0 rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={movie.poster_path 
                      ? TMDBClient.getPosterUrl(movie.poster_path)
                      : '/placeholder-movie.jpg'
                    }
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Movie Info */}
              <div className="lg:col-span-2 text-white space-y-6">
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
                    {movie.title}
                  </h1>
                  
                  {movie.tagline && (
                    <p className="text-xl text-white/90 italic mb-4">
                      "{movie.tagline}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
                      <span className="text-white/70">({movie.vote_count.toLocaleString()} votes)</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                    </div>
                    
                    {movie.runtime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatRuntime(movie.runtime)}</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {movie.genres?.map(genre => (
                      <Badge key={genre.id} variant="secondary" className="bg-white/20 text-white border-white/30">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  {mainTrailer && (
                    <Button 
                      size="lg" 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => setShowTrailer(true)}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Watch Trailer
                    </Button>
                  )}
                  
                  <Button
                    size="lg"
                    variant={isFavorite ? "default" : "outline"}
                    onClick={handleFavoriteToggle}
                    className={isFavorite 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "border-white/50 text-white hover:bg-white/10"
                    }
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Favorited' : 'Add to Favorites'}
                  </Button>

                  {isAuthenticated && (
                    <CollectionSelector
                      movieId={movieId}
                      trigger={
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-white/50 text-white hover:bg-white/10"
                        >
                          <BookmarkPlus className="h-5 w-5 mr-2" />
                          Add to Collection
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {movie.overview}
              </p>
            </section>

            {/* Cast */}
            {cast.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {cast.map((member) => (
                    <Card key={member.id} className="group hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-[2/3] relative mb-3 overflow-hidden rounded-lg">
                          <Image
                            src={member.profile_path 
                              ? TMDBClient.getProfileUrl(member.profile_path)
                              : '/placeholder-movie.jpg'
                            }
                            alt={member.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h3 className="font-semibold text-sm truncate">{member.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{member.character}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Similar Movies */}
            {similarMovies.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Similar Movies</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {similarMovies.map((similarMovie) => (
                    <MovieCard 
                      key={similarMovie.id} 
                      movie={similarMovie}
                      className="hover:scale-105 transition-transform"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Movie Facts */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Movie Facts</h3>
                <div className="space-y-4">
                  {movie.budget > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Budget
                      </span>
                      <span className="font-medium">{formatCurrency(movie.budget)}</span>
                    </div>
                  )}
                  
                  {movie.revenue > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Revenue
                      </span>
                      <span className="font-medium">{formatCurrency(movie.revenue)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Language
                    </span>
                    <span className="font-medium uppercase">{movie.original_language}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">{movie.status}</span>
                  </div>
                </div>

                {movie.homepage && (
                  <>
                    <Separator className="my-4" />
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(movie.homepage, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Official Website
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Production Companies */}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Production</h3>
                  <div className="space-y-3">
                    {movie.production_companies.slice(0, 5).map((company) => (
                      <div key={company.id} className="flex items-center space-x-3">
                        {company.logo_path && (
                          <div className="relative w-8 h-8 flex-shrink-0">
                            <Image
                              src={TMDBClient.getImageUrl(company.logo_path, 'w92')}
                              alt={company.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span className="text-sm">{company.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Trailer Modal */}
        {showTrailer && mainTrailer && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTrailer(false)}
          >
            <div className="relative w-full max-w-4xl aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${mainTrailer.key}?autoplay=1`}
                title={mainTrailer.name}
                className="w-full h-full rounded-lg"
                allowFullScreen
                allow="autoplay"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 