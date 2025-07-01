'use client';

import React from 'react';
import { Movie } from '@/lib/types';
import { MovieCard } from './movie-card';

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  className?: string;
  emptyMessage?: string;
}

function MovieCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
        <div className="flex gap-1">
          <div className="h-5 bg-muted rounded w-12 animate-pulse" />
          <div className="h-5 bg-muted rounded w-16 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-muted rounded w-4/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function MovieGrid({ 
  movies, 
  loading = false, 
  className = '', 
  emptyMessage = 'No movies found.' 
}: MovieGridProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${className}`}>
        {Array.from({ length: 12 }, (_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0l1 16h8l1-16"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Movies Found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${className}`}>
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className="opacity-0 animate-fade-in"
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'forwards',
          }}
        >
          <MovieCard movie={movie} />
        </div>
      ))}
    </div>
  );
} 