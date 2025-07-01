'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { MovieGrid } from '@/components/movie-grid';
import { Button } from '@/components/ui/button';
import { Movie } from '@/lib/types';
import { tmdbClient } from '@/lib/tmdb';
import { apiClient, Collection } from '@/lib/api-client';
import { ArrowLeft, Folder, Calendar, Edit2, Trash2 } from 'lucide-react';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (collectionId) {
      loadCollection();
    }
  }, [collectionId]);

  const loadCollection = async () => {
    setLoading(true);
    try {
      const collectionData = await apiClient.getCollection(collectionId);
      
      if (!collectionData) {
        router.push('/collections');
        return;
      }

      setCollection(collectionData);

      // Load movie details
      if (collectionData.movies.length > 0) {
        const moviePromises = collectionData.movies.map(id => tmdbClient.getMovieDetails(id));
        const movieData = await Promise.all(moviePromises);
        setMovies(movieData);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error('Failed to load collection:', error);
      router.push('/collections');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!collection) return;
    
    if (confirm(`Are you sure you want to delete "${collection.name}"? This action cannot be undone.`)) {
      const success = await apiClient.deleteCollection(collection.id);
      if (success) {
        router.push('/collections');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8" />
            <div className="h-12 bg-muted rounded w-64 mb-4" />
            <div className="h-4 bg-muted rounded w-48 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <h1 className="text-3xl font-bold mb-4">Collection Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The collection you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/collections')} size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collections
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
          className="mb-8 hover:bg-muted/80"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>

        {/* Collection Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Folder className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{collection.name}</h1>
              {collection.description && (
                <p className="text-muted-foreground mt-1">{collection.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(collection.createdAt)}</span>
                </div>
                <span>•</span>
                <span>{movies.length} movies</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              title="Edit collection"
              onClick={() => {
                // TODO: Implement edit functionality
                console.log('Edit collection');
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Delete collection"
              onClick={handleDeleteCollection}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Movies Grid */}
        <MovieGrid 
          movies={movies} 
          loading={false}
          emptyMessage="This collection is empty. Add movies to it from movie detail pages!"
        />
      </main>
    </div>
  );
} 