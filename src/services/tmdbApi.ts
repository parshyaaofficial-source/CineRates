import type { Title } from '@/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_W500 = 'https://image.tmdb.org/t/p/w500';
const IMAGE_BASE_ORIGINAL = 'https://image.tmdb.org/t/p/original';

// Check for user-provided TMDB API key in environment variables
const TMDB_API_KEY = (import.meta.env.VITE_TMDB_API_KEY as string | undefined)?.trim();

export const isTmdbConfigured = Boolean(TMDB_API_KEY);

interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  media_type?: 'movie' | 'tv';
  original_language?: string;
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

// TMDB language code → display language
const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  te: 'Telugu',
  ta: 'Tamil',
  ml: 'Malayalam',
  kn: 'Kannada',
  bn: 'Bengali',
  pa: 'Punjabi',
  gu: 'Gujarati',
  ko: 'Korean',
  ja: 'Japanese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  tr: 'Turkish',
  ar: 'Arabic',
  zh: 'Chinese',
  th: 'Thai',
};

// Display language → TMDB language code
const LANG_CODE_MAP: Record<string, string> = {
  English: 'en',
  Hindi: 'hi',
  Marathi: 'mr',
  Telugu: 'te',
  Tamil: 'ta',
  Malayalam: 'ml',
  Kannada: 'kn',
  Bengali: 'bn',
  Punjabi: 'pa',
  Gujarati: 'gu',
  Korean: 'ko',
  Japanese: 'ja',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
  Italian: 'it',
  Portuguese: 'pt',
  Russian: 'ru',
  Turkish: 'tr',
  Arabic: 'ar',
  Chinese: 'zh',
  Thai: 'th',
};

export function getLangCode(language: string): string {
  return LANG_CODE_MAP[language] || 'en';
}

function detectLanguage(item: TmdbItem): string {
  const code = item.original_language || 'en';
  return LANGUAGE_MAP[code] || 'English';
}

function transformTmdbItem(item: TmdbItem, defaultType: 'movie' | 'series' = 'movie'): Title {
  const isTv = item.media_type === 'tv' || defaultType === 'series' || Boolean(item.first_air_date);
  const name = item.title || item.name || 'Untitled';
  const releaseDate = item.release_date || item.first_air_date || '2024';
  const year = parseInt(releaseDate.split('-')[0]) || 2024;
  const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : 7.5;
  const votes = item.vote_count || 50000;
  const genres = (item.genre_ids || [])
    .map((gid) => GENRE_MAP[gid])
    .filter(Boolean)
    .slice(0, 3);

  const finalGenres = genres.length > 0 ? genres : ['Drama'];
  const detectedLang = detectLanguage(item);

  return {
    id: `tmdb-${isTv ? 'tv' : 'movie'}-${item.id}`,
    type: isTv ? 'series' : 'movie',
    name,
    year,
    runtime: isTv ? 50 : 120,
    seasons: isTv ? 1 : undefined,
    episodes: isTv ? 10 : undefined,
    genres: finalGenres,
    synopsis: item.overview || 'Synopsis not available for this title.',
    posterColors: ['#3B82F6', '#1E1B4B'],
    backdropColors: ['#0A1329', '#15244C', '#03060D'],
    posterUrl: item.poster_path ? `${IMAGE_BASE_W500}${item.poster_path}` : undefined,
    backdropUrl: item.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${item.backdrop_path}` : undefined,
    trailerUrl: undefined,
    imdbLikeRating: rating,
    criticScore: Math.min(100, Math.round(rating * 10) + 4),
    aiScore: Math.min(99, Math.round(rating * 10) + 6),
    votes,
    maturity: isTv ? 'TV-MA' : 'PG-13',
    languages: [detectedLang],
    providers: ['Streaming'],
    trending: votes > 200000,
    topRated: rating >= 8.0,
    criticallyAcclaimed: rating >= 8.2,
    aiMatch: Math.min(98, Math.round(rating * 10) + 8),
    cast: [],
    crew: [],
  };
}

async function safeFetch<T>(endpoint: string): Promise<T | null> {
  if (!TMDB_API_KEY) return null;
  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${TMDB_BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const tmdbApi = {
  isConfigured(): boolean {
    return isTmdbConfigured;
  },

  async getTrending(): Promise<Title[] | null> {
    const data = await safeFetch<{ results: TmdbItem[] }>('/trending/all/day');
    if (!data?.results?.length) return null;
    return data.results.slice(0, 20).map((item) => transformTmdbItem(item));
  },

  async getPopularMovies(): Promise<Title[] | null> {
    const data = await safeFetch<{ results: TmdbItem[] }>('/movie/popular');
    if (!data?.results?.length) return null;
    return data.results.slice(0, 20).map((item) => transformTmdbItem(item, 'movie'));
  },

  async getPopularSeries(): Promise<Title[] | null> {
    const data = await safeFetch<{ results: TmdbItem[] }>('/tv/popular');
    if (!data?.results?.length) return null;
    return data.results.slice(0, 20).map((item) => transformTmdbItem(item, 'series'));
  },

  async getTopRated(): Promise<Title[] | null> {
    const data = await safeFetch<{ results: TmdbItem[] }>('/movie/top_rated');
    if (!data?.results?.length) return null;
    return data.results.slice(0, 20).map((item) => transformTmdbItem(item, 'movie'));
  },

  async getNewReleases(): Promise<Title[] | null> {
    const data = await safeFetch<{ results: TmdbItem[] }>('/movie/now_playing');
    if (!data?.results?.length) return null;
    return data.results.slice(0, 20).map((item) => transformTmdbItem(item, 'movie'));
  },

  async search(query: string): Promise<Title[] | null> {
    if (!query.trim()) return [];
    const data = await safeFetch<{ results: TmdbItem[] }>(
      `/search/multi?query=${encodeURIComponent(query.trim())}&include_adult=false`
    );
    if (!data?.results?.length) return null;
    return data.results
      .filter((i) => i.media_type === 'movie' || i.media_type === 'tv')
      .slice(0, 20)
      .map((item) => transformTmdbItem(item));
  },

  // Search by language using TMDB discover endpoint
  async getByLanguage(language: string, type: 'movie' | 'tv' = 'movie', page = 1): Promise<Title[] | null> {
    const langCode = getLangCode(language);
    const endpoint = type === 'movie'
      ? `/discover/movie?with_original_language=${langCode}&sort_by=popularity.desc&page=${page}`
      : `/discover/tv?with_original_language=${langCode}&sort_by=popularity.desc&page=${page}`;
    const data = await safeFetch<{ results: TmdbItem[] }>(endpoint);
    if (!data?.results?.length) return null;
    return data.results
      .filter((i) => i.poster_path) // Only items with posters
      .slice(0, 20)
      .map((item) => transformTmdbItem(item, type === 'tv' ? 'series' : 'movie'));
  },

  // Top rated by language
  async getTopRatedByLanguage(language: string, type: 'movie' | 'tv' = 'movie'): Promise<Title[] | null> {
    const langCode = getLangCode(language);
    const endpoint = type === 'movie'
      ? `/discover/movie?with_original_language=${langCode}&sort_by=vote_average.desc&vote_count.gte=500`
      : `/discover/tv?with_original_language=${langCode}&sort_by=vote_average.desc&vote_count.gte=200`;
    const data = await safeFetch<{ results: TmdbItem[] }>(endpoint);
    if (!data?.results?.length) return null;
    return data.results
      .filter((i) => i.poster_path)
      .slice(0, 20)
      .map((item) => transformTmdbItem(item, type === 'tv' ? 'series' : 'movie'));
  },

  // Genre + language combined
  async getByGenreAndLanguage(genreId: number, language: string, type: 'movie' | 'tv' = 'movie'): Promise<Title[] | null> {
    const langCode = getLangCode(language);
    const endpoint = type === 'movie'
      ? `/discover/movie?with_genres=${genreId}&with_original_language=${langCode}&sort_by=popularity.desc`
      : `/discover/tv?with_genres=${genreId}&with_original_language=${langCode}&sort_by=popularity.desc`;
    const data = await safeFetch<{ results: TmdbItem[] }>(endpoint);
    if (!data?.results?.length) return null;
    return data.results
      .filter((i) => i.poster_path)
      .slice(0, 20)
      .map((item) => transformTmdbItem(item, type === 'tv' ? 'series' : 'movie'));
  },

  // Get details for a specific TMDB id to fill in cast/runtime etc.
  async getTitleDetails(tmdbId: string): Promise<Partial<Title> | null> {
    // tmdbId format: tmdb-movie-123 or tmdb-tv-456
    const parts = tmdbId.split('-');
    if (parts.length < 3 || parts[0] !== 'tmdb') return null;
    const mediaType = parts[1] === 'tv' ? 'tv' : 'movie';
    const id = parts[2];
    const data = await safeFetch<{
      runtime?: number;
      episode_run_time?: number[];
      number_of_seasons?: number;
      number_of_episodes?: number;
      vote_average?: number;
      genres?: { id: number; name: string }[];
    }>(`/${mediaType}/${id}`);
    if (!data) return null;
    return {
      runtime: data.runtime || (data.episode_run_time?.[0]) || undefined,
      seasons: data.number_of_seasons,
      episodes: data.number_of_episodes,
      imdbLikeRating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : undefined,
      genres: data.genres?.map((g) => g.name).slice(0, 3),
    };
  },
};
