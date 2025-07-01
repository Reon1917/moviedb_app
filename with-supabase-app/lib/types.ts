export interface Movie {
  id: number;
  title: string;
  overview: string;
  spoiler_overview?: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  genre_ids: number[];
  genres?: Genre[];
  cast?: CastMember[];
  crew?: CrewMember[];
  videos?: Video[];
  similar?: Movie[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

// Legacy interface for backward compatibility - use database types instead
export interface MovieCollection {
  id: string;
  name: string;
  description?: string;
  movies: number[];
  createdAt: Date;
  isPublic?: boolean;
}

// Re-export database types for new usage
export type {
  Collection as DatabaseCollection,
  CollectionWithMovieCount,
  CollectionWithMovies,
  UserFavorite,
  CollectionMovie
} from './database/types';

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetails extends Movie {
  budget: number;
  revenue: number;
  tagline: string;
  homepage: string;
  imdb_id: string;
  original_language: string;
  original_title: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  status: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
} 