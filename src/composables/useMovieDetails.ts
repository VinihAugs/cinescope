import { ref } from 'vue';
import { tmdbFetch, tmdbImg } from '../lib/tmdb';
import type { MediaType, MovieDetails } from '../types/movies';

type TmdbDetails = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genres?: { id: number; name: string }[];
  runtime?: number;
  episode_run_time?: number[];
  tagline?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
};

type TmdbCredits = {
  cast?: { name: string }[];
  crew?: { job: string; name: string }[];
};

type TmdbVideos = {
  results?: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official?: boolean;
  }[];
};

function pickBestTrailer(v: TmdbVideos): { key: string; name: string } | null {
  const items = (v.results ?? []).filter((x) => x.site === 'YouTube' && x.key);
  if (items.length === 0) return null;

  const score = (x: (typeof items)[number]) => {
    const type = (x.type ?? '').toLowerCase();
    const official = x.official ? 1 : 0;
    const isTrailer = type.includes('trailer') ? 3 : 0;
    const isTeaser = type.includes('teaser') ? 2 : 0;
    const isClip = type.includes('clip') ? 1 : 0;
    return official * 10 + isTrailer * 3 + isTeaser * 2 + isClip;
  };

  const best = [...items].sort((a, b) => score(b) - score(a))[0];
  return best ? { key: best.key, name: best.name } : null;
}

export function useMovieDetails() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const details = ref<MovieDetails | null>(null);
  const trailer = ref<{ url: string; name: string } | null>(null);

  let abort: AbortController | null = null;

  async function fetchDetails(mediaType: MediaType, id: number) {
    loading.value = true;
    error.value = null;
    abort?.abort();
    abort = new AbortController();
    try {
      const [d, c, vPt] = await Promise.all([
        tmdbFetch<TmdbDetails>(`/${mediaType}/${id}`, {}, abort.signal),
        tmdbFetch<TmdbCredits>(`/${mediaType}/${id}/credits`, {}, abort.signal),
        tmdbFetch<TmdbVideos>(`/${mediaType}/${id}/videos`, {}, abort.signal),
      ]);

      const title = mediaType === 'tv' ? (d.name ?? 'Sem título') : (d.title ?? 'Sem título');
      const date = mediaType === 'tv' ? d.first_air_date : d.release_date;
      const director = c.crew?.find((x) => x.job === 'Director')?.name;
      const cast = (c.cast ?? []).slice(0, 8).map((x) => x.name);
      const runtimeMinutes = mediaType === 'tv' ? d.episode_run_time?.[0] : d.runtime;

      let picked = pickBestTrailer(vPt);
      if (!picked) {
        const vEn = await tmdbFetch<TmdbVideos>(`/${mediaType}/${id}/videos`, { language: 'en-US' }, abort.signal);
        picked = pickBestTrailer(vEn);
      }
      trailer.value = picked
        ? {
            name: picked.name,
            url: `https://www.youtube-nocookie.com/embed/${picked.key}?autoplay=1&rel=0`,
          }
        : null;

      details.value = {
        id: d.id,
        title,
        year: date ? date.slice(0, 4) : undefined,
        rating: d.vote_average ?? undefined,
        genreIds: (d.genres ?? []).map((g) => g.id),
        genres: d.genres ?? [],
        runtimeMinutes: runtimeMinutes ?? undefined,
        tagline: d.tagline ?? undefined,
        overview: d.overview ?? undefined,
        posterUrl: tmdbImg(d.poster_path, 'w500'),
        backdropUrl: tmdbImg(d.backdrop_path, 'w780'),
        cast,
        director,
        mediaType,
      };
    } catch (e: any) {
      error.value = e?.message ?? 'Falha ao carregar detalhes.';
    } finally {
      loading.value = false;
    }
  }

  function clear() {
    details.value = null;
    error.value = null;
    trailer.value = null;
  }

  return { loading, error, details, trailer, fetchDetails, clear };
}


