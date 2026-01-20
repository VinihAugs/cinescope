import { computed, onMounted, ref, watch } from 'vue';
import { tmdbFetch, tmdbImg } from '../lib/tmdb';
import type { MediaType, MovieSummary } from '../types/movies';

type TmdbPaged<T> = { page: number; results: T[]; total_pages: number; total_results: number };

type TmdbMovie = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
};

type TmdbGenre = { id: number; name: string };

function mapToSummary(m: TmdbMovie, mediaType: MediaType): MovieSummary {
  const title = mediaType === 'tv' ? (m.name ?? 'Sem título') : (m.title ?? 'Sem título');
  const date = mediaType === 'tv' ? m.first_air_date : m.release_date;
  return {
    id: m.id,
    title,
    year: date ? date.slice(0, 4) : undefined,
    rating: m.vote_average ?? undefined,
    genreIds: m.genre_ids ?? [],
    posterUrl: tmdbImg(m.poster_path, 'w500'),
    backdropUrl: tmdbImg(m.backdrop_path, 'w780'),
    overview: m.overview ?? undefined,
    mediaType,
  };
}

export function useMovies() {
  const mediaType = ref<MediaType>('movie');
  const query = ref('');
  const selectedGenreId = ref<number | null>(null);

  const movies = ref<MovieSummary[]>([]);
  const genres = ref<TmdbGenre[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  let abort: AbortController | null = null;

  const hero = computed(() => {
    return movies.value.find((m) => !!m.backdropUrl) ?? movies.value[0] ?? null;
  });

  async function fetchGenres() {
    const data = await tmdbFetch<{ genres: TmdbGenre[] }>(
      `/genre/${mediaType.value}/list`,
      {},
      abort?.signal,
    );
    genres.value = data.genres ?? [];
  }

  async function fetchTrending() {
    loading.value = true;
    error.value = null;
    abort?.abort();
    abort = new AbortController();
    try {
      const data = await tmdbFetch<TmdbPaged<TmdbMovie>>(
        `/trending/${mediaType.value}/week`,
        {},
        abort.signal,
      );
      movies.value = (data.results ?? []).map((m) => mapToSummary(m, mediaType.value));
    } catch (e: any) {
      error.value = e?.message ?? 'Falha ao carregar filmes.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchDiscover() {
    loading.value = true;
    error.value = null;
    abort?.abort();
    abort = new AbortController();
    try {
      const data = await tmdbFetch<TmdbPaged<TmdbMovie>>(
        `/discover/${mediaType.value}`,
        {
          sort_by: 'popularity.desc',
          include_adult: false,
          with_genres: selectedGenreId.value ?? undefined,
        },
        abort.signal,
      );
      movies.value = (data.results ?? []).map((m) => mapToSummary(m, mediaType.value));
    } catch (e: any) {
      error.value = e?.message ?? 'Falha ao carregar lista.';
    } finally {
      loading.value = false;
    }
  }

  async function search() {
    const q = query.value.trim();
    if (!q) {
      await fetchDiscover();
      return;
    }

    loading.value = true;
    error.value = null;
    abort?.abort();
    abort = new AbortController();
    try {
      const data = await tmdbFetch<TmdbPaged<TmdbMovie>>(
        `/search/${mediaType.value}`,
        { query: q, include_adult: false },
        abort.signal,
      );
      movies.value = (data.results ?? []).map((m) => mapToSummary(m, mediaType.value));
    } catch (e: any) {
      error.value = e?.message ?? 'Falha na busca.';
    } finally {
      loading.value = false;
    }
  }

  function setGenre(id: number | null) {
    selectedGenreId.value = id;
  }

  function setMediaType(next: MediaType) {
    mediaType.value = next;
    selectedGenreId.value = null;
    query.value = '';
  }

  watch(mediaType, async () => {
    await fetchGenres();
    await fetchTrending();
  });

  onMounted(async () => {
    await fetchGenres();
    await fetchTrending();
  });

  return {
    mediaType,
    query,
    selectedGenreId,
    movies,
    genres,
    hero,
    loading,
    error,
    fetchTrending,
    fetchDiscover,
    search,
    setGenre,
    setMediaType,
  };
}


