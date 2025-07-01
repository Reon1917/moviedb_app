'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, Calendar, Clock } from 'lucide-react';
import { Movie } from '@/lib/types';
import { TMDBClient } from '@/lib/tmdb';
import { MovieStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface MovieCardProps {
  movie: Movie;
  showGenres?: boolean;
  className?: string;
}

export function MovieCard({ movie, showGenres = true, className = '' }: MovieCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsFavorite(MovieStorage.isFavorite(movie.id));
  }, [movie.id]);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavoriteState = MovieStorage.toggleFavorite(movie.id);
    setIsFavorite(newFavoriteState);
  };

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  return (
    <Link href={`/movie/${movie.id}`} className={`block ${className}`}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={handleFavoriteToggle}
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-foreground'
            }`}
          />
        </Button>

        {/* Movie Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse w-full h-full bg-muted-foreground/10" />
            </div>
          )}
          <Image
            src={TMDBClient.getPosterUrl(movie.poster_path)}
            alt={movie.title}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-110 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsImageLoaded(true)}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          
          {/* Overlay with rating */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center space-x-1 text-white text-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Movie Title */}
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
            {movie.title}
          </h3>

          {/* Release Date and Runtime */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatReleaseDate(movie.release_date)}</span>
            </div>
            {movie.runtime && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {showGenres && movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {movie.genres.slice(0, 2).map((genre) => (
                <Badge
                  key={genre.id}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  {genre.name}
                </Badge>
              ))}
              {movie.genres.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{movie.genres.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Overview (truncated) */}
          <p className="text-xs text-muted-foreground line-clamp-3">
            {movie.overview}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
} 