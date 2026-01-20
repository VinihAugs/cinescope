const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export class TmdbError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

function getApiKey(): string {
  const key = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
  if (!key) {
    throw new TmdbError(
      'VITE_TMDB_API_KEY não está configurada. Crie um arquivo .env.local com sua chave do TMDB.',
    );
  }
  return key;
}

export async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  signal?: AbortSignal,
): Promise<T> {
  const apiKey = getApiKey();

  const url = new URL(TMDB_BASE_URL + path);
  url.searchParams.set('api_key', apiKey);
  if (params.language === undefined) {
    url.searchParams.set('language', 'pt-BR');
  }

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) {
    let msg = `TMDB error: HTTP ${res.status}`;
    try {
      const body = (await res.json()) as any;
      if (body?.status_message) msg = body.status_message;
    } catch {}
    throw new TmdbError(msg, res.status);
  }
  return (await res.json()) as T;
}

export function tmdbImg(path?: string | null, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500') {
  if (!path) return undefined;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}


