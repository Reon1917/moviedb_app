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
import { Collection } from '@/lib/database/types';
import { CollectionsService } from '@/lib/database/collections';

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
      const userCollections = await CollectionsService.getUserCollections();
      setCollections(userCollections);
      
      // Check which collections already contain this movie
      const collectionPromises = userCollections.map(async (collection) => {
        const hasMovie = await CollectionsService.isMovieInCollection(collection.id, movieId);
        return { collectionId: collection.id, hasMovie };
      });
      
      const results = await Promise.all(collectionPromises);
      const existingCollections = new Set(
        results.filter(r => r.hasMovie).map(r => r.collectionId)
      );
      setSelectedCollections(existingCollections);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    setCreating(true);
    try {
      const newCollection = await CollectionsService.createCollection({
        name: newCollectionName.trim(),
        description: '',
        is_public: false
      });
      
      setCollections(prev => [newCollection, ...prev]);
      setNewCollectionName('');
      
      // Auto-select the new collection
      setSelectedCollections(prev => new Set([...prev, newCollection.id]));
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
        await CollectionsService.removeMovieFromCollection(collectionId, movieId);
      } catch (error) {
        console.error('Failed to remove movie from collection:', error);
        return;
      }
    } else {
      newSelected.add(collectionId);
      try {
        await CollectionsService.addMovieToCollection(collectionId, movieId);
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
                      onChange={() => handleToggleCollection(collection.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{collection.name}</h4>
                      {collection.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    {selectedCollections.has(collection.id) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 