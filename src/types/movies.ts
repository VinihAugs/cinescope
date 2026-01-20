export type MediaType = 'movie' | 'tv';

export interface MovieSummary {
  id: number;
  title: string;
  year?: string;
  rating?: number;
  genreIds: number[];
  posterUrl?: string;
  backdropUrl?: string;
  overview?: string;
  mediaType: MediaType;
}

export interface MovieDetails extends MovieSummary {
  runtimeMinutes?: number;
  genres?: { id: number; name: string }[];
  tagline?: string;
  cast?: string[];
  director?: string;
}


