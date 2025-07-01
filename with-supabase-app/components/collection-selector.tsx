'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { apiClient, Collection } from '@/lib/api-client';

interface CollectionSelectorProps {
  movieId: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CollectionSelector({ movieId, trigger, onSuccess }: CollectionSelectorProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadCollections();
    }
  }, [open]);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const userCollections = await apiClient.getCollections();
      setCollections(userCollections);
      
      // Check which collections already contain this movie
      const existingCollections = new Set<string>();
      for (const collection of userCollections) {
        if (collection.movies.includes(movieId)) {
          existingCollections.add(collection.id);
        }
      }
      setSelectedCollections(existingCollections);
    } catch (error) {
      console.error('Failed to load collections:', error);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    setCreating(true);
    try {
      const newCollection = await apiClient.createCollection(newCollectionName.trim());
      
      if (newCollection) {
        setCollections(prev => [newCollection, ...prev]);
        setNewCollectionName('');
        
        // Auto-select the new collection
        setSelectedCollections(prev => new Set([...prev, newCollection.id]));
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleCollection = async (collectionId: string) => {
    const newSelected = new Set(selectedCollections);
    
    if (newSelected.has(collectionId)) {
      newSelected.delete(collectionId);
      try {
        await apiClient.removeMovieFromCollection(collectionId, movieId);
      } catch (error) {
        console.error('Failed to remove movie from collection:', error);
        return;
      }
    } else {
      newSelected.add(collectionId);
      try {
        await apiClient.addMovieToCollection(collectionId, movieId);
      } catch (error) {
        console.error('Failed to add movie to collection:', error);
        return;
      }
    }
    
    setSelectedCollections(newSelected);
  };

  const handleSave = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add to Collection
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Collections</DialogTitle>
          <DialogDescription>
            Choose which collections to add this movie to, or create a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Collection */}
          <div className="space-y-3">
            <Label htmlFor="new-collection">Create New Collection</Label>
            <div className="flex gap-2">
              <Input
                id="new-collection"
                placeholder="Enter collection name..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateCollection();
                  }
                }}
              />
              <Button 
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim() || creating}
                size="sm"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Existing Collections */}
          <div className="space-y-3">
            <Label>Your Collections</Label>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : collections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No collections yet. Create your first one above!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {collections.map((collection) => (
                  <div 
                    key={collection.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleToggleCollection(collection.id)}
                  >
                    <Checkbox
                      checked={selectedCollections.has(collection.id)}
                      onCheckedChange={() => handleToggleCollection(collection.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{collection.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {collection.movieCount} movies
                      </p>
                    </div>
                    {selectedCollections.has(collection.id) && (
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 