import { Movie, MovieDetails, Genre, TMDBResponse, CastMember, Video } from './types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// This would be set via environment variable in production
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || 'demo_key';

// Debug: Log API key status (remove in production)
console.log('TMDB API Key status:', API_KEY === 'demo_key' ? 'Using demo mode' : 'Using real API');

export class TMDBClient {
  private async fetchFromTMDB<T>(endpoint: string): Promise<T> {
    if (API_KEY === 'demo_key') {
      console.log('🎬 Using demo data - Add TMDB API key to .env.local to see real movies');
      // Return mock data when no API key is provided
      return this.getMockData<T>(endpoint);
    }

    const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid TMDB API key. Please check your .env.local file.');
        }
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Successfully fetched from TMDB API');
      return data;
    } catch (error) {
      console.error('❌ TMDB API Error:', error);
      // Fallback to demo data if API fails
      console.log('🎬 Falling back to demo data');
      return this.getMockData<T>(endpoint);
    }
  }

  private getMockData<T>(endpoint: string): Promise<T> {
    // Return mock data for demo purposes
    const mockMovie = {
      id: 1,
      title: "Demo Movie",
      overview: "This is a demo movie. Please add your TMDB API key to see real data.",
      poster_path: null,
      backdrop_path: null,
      release_date: "2024-01-01",
      vote_average: 8.5,
      vote_count: 1000,
      runtime: 120,
      genre_ids: [28, 12],
      genres: [
        { id: 28, name: "Action" },
        { id: 12, name: "Adventure" }
      ]
    };

    if (endpoint.includes('/genre/movie/list')) {
      return Promise.resolve({
        genres: [
          { id: 28, name: "Action" },
          { id: 12, name: "Adventure" },
          { id: 16, name: "Animation" },
          { id: 35, name: "Comedy" },
          { id: 80, name: "Crime" },
          { id: 99, name: "Documentary" },
          { id: 18, name: "Drama" },
          { id: 10751, name: "Family" },
          { id: 14, name: "Fantasy" },
          { id: 36, name: "History" },
          { id: 27, name: "Horror" },
          { id: 10402, name: "Music" },
          { id: 9648, name: "Mystery" },
          { id: 10749, name: "Romance" },
          { id: 878, name: "Science Fiction" },
          { id: 10770, name: "TV Movie" },
          { id: 53, name: "Thriller" },
          { id: 10752, name: "War" },
          { id: 37, name: "Western" }
        ]
      } as T);
    }

    return Promise.resolve({
      page: 1,
      results: Array(20).fill(null).map((_, index) => ({
        ...mockMovie,
        id: index + 1,
        title: `Demo Movie ${index + 1}`
      })),
      total_pages: 1,
      total_results: 20
    } as T);
  }

  async getPopularMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/movie/popular?page=${page}`);
  }

  async getTopRatedMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/movie/top_rated?page=${page}`);
  }

  async getNowPlayingMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/movie/now_playing?page=${page}`);
  }

  async getUpcomingMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/movie/upcoming?page=${page}`);
  }

  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    return this.fetchFromTMDB<MovieDetails>(`/movie/${movieId}`);
  }

  async getMovieCredits(movieId: number): Promise<{ cast: CastMember[]; crew: any[] }> {
    return this.fetchFromTMDB<{ cast: CastMember[]; crew: any[] }>(`/movie/${movieId}/credits`);
  }

  async getMovieVideos(movieId: number): Promise<{ results: Video[] }> {
    return this.fetchFromTMDB<{ results: Video[] }>(`/movie/${movieId}/videos`);
  }

  async getSimilarMovies(movieId: number): Promise<TMDBResponse<Movie>> {
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/movie/${movieId}/similar`);
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse<Movie>> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/search/movie?query=${encodedQuery}&page=${page}`);
  }

  async getGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchFromTMDB<{ genres: Genre[] }>('/genre/movie/list');
  }

  async getMoviesByGenre(genreId: number, page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchFromTMDB<TMDBResponse<Movie>>(`/discover/movie?with_genres=${genreId}&page=${page}`);
  }

  // Helper methods for image URLs
  static getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgdmlld0JveD0iMCAwIDUwMCA3NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNzUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMjUgMzAwQzIyNSAyOTAuNTkgMjMyLjU5IDI4MyAyNDIgMjgzSDI1OEMyNjcuNDEgMjgzIDI3NSAyOTAuNTkgMjc1IDMwMFYzNTBDMjc1IDM1OS40MSAyNjcuNDEgMzY3IDI1OCAzNjdIMjQyQzIzMi41OSAzNjcgMjI1IDM1OS40MSAyMjUgMzUwVjMwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSIyMDAiIHk9IjM4MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI4MCI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iODAiIHJ4PSI4IiBmaWxsPSIjOUNBM0FGIi8+CjwvdGV4dD4KPC9zdmc+';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  static getPosterUrl(path: string | null): string {
    return this.getImageUrl(path, 'w500');
  }

  static getBackdropUrl(path: string | null): string {
    return this.getImageUrl(path, 'w1280');
  }

  static getProfileUrl(path: string | null): string {
    return this.getImageUrl(path, 'w185');
  }
}

export const tmdbClient = new TMDBClient(); 