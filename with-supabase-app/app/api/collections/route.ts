import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        collection_movies(movie_id)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const collections = data.map(collection => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isPublic: collection.is_public,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at,
      movies: collection.collection_movies.map(cm => cm.movie_id),
      movieCount: collection.collection_movies.length
    }));

    return NextResponse.json({ collections });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, isPublic = false } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        is_public: isPublic
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const collection = {
      id: data.id,
      name: data.name,
      description: data.description,
      isPublic: data.is_public,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      movies: [],
      movieCount: 0
    };

    return NextResponse.json({ collection });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 