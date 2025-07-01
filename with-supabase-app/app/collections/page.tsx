'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MovieCollection } from '@/lib/types';
import { SupabaseMovieStorage } from '@/lib/storage-supabase';
import { Plus, Folder, Calendar, Share, Trash2 } from 'lucide-react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<MovieCollection[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    const userCollections = await SupabaseMovieStorage.getCollections();
    setCollections(userCollections);
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      await SupabaseMovieStorage.createCollection(
        newCollectionName.trim(),
        newCollectionDescription.trim() || undefined
      );
      
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowCreateForm(false);
      loadCollections();
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      await SupabaseMovieStorage.deleteCollection(collectionId);
      loadCollections();
    }
  };

  const handleShareCollection = async (collectionId: string) => {
    const shareData = await SupabaseMovieStorage.exportCollection(collectionId);
    if (shareData) {
      const shareUrl = `${window.location.origin}/collections/shared?data=${shareData}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Collection link copied to clipboard!');
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Folder className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">My Collections</h1>
              <p className="text-muted-foreground">
                Create and manage your custom movie collections
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Collection</span>
          </Button>
        </div>

        {/* Create Collection Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div>
                  <Label htmlFor="collection-name">Collection Name</Label>
                  <Input
                    id="collection-name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g., My Favorite Sci-Fi Movies"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="collection-description">Description (Optional)</Label>
                  <Input
                    id="collection-description"
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    placeholder="A brief description of your collection"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Collection</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Folder className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Collections Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              Create your first collection to start organizing your favorite movies by theme, genre, or any criteria you like.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Collection
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Card key={collection.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                        <Link href={`/collections/${collection.id}`}>
                          {collection.name}
                        </Link>
                      </CardTitle>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleShareCollection(collection.id)}
                        title="Share collection"
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteCollection(collection.id)}
                        title="Delete collection"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(collection.createdAt)}</span>
                    </div>
                    <span>{collection.movies.length} movies</span>
                  </div>
                  
                  <Link href={`/collections/${collection.id}`}>
                    <Button variant="outline" className="w-full mt-4">
                      View Collection
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 