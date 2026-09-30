import type { Title, Episode, Review, Mood, TasteProfile, AIRecommendation } from '@/types';
import { realTitles, realEpisodes, realReviews, moodMapping } from '@/data/realTitles';
import { tmdbApi } from './tmdbApi';

// Dynamic in-memory review storage so user-submitted reviews persist during the session
const localReviews: Record<string, Review[]> = { ...realReviews };

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const titleService = {
  getAllTitles(): Title[] {
    return realTitles;
  },

  getTitleById(id: string): Title | undefined {
    return realTitles.find((t) => t.id === id);
  },

  getFeatured(): Title[] {
    const featured = realTitles.filter((t) => t.featured);
    return featured.length > 0 ? featured : realTitles.slice(0, 5);
  },

  getTrending(): Title[] {
    return realTitles.filter((t) => t.trending);
  },

  getPopular(): Title[] {
    return [...realTitles].sort((a, b) => b.votes - a.votes).slice(0, 15);
  },

  getTopRated(): Title[] {
    return [...realTitles].sort((a, b) => b.imdbLikeRating - a.imdbLikeRating).slice(0, 16);
  },

  getNewReleases(): Title[] {
    return [...realTitles].filter((t) => t.year >= 2023).sort((a, b) => b.year - a.year);
  },

  getCriticallyAcclaimed(): Title[] {
    return realTitles.filter((t) => t.criticallyAcclaimed);
  },

  getBingeWorthySeries(): Title[] {
    return realTitles.filter((t) => t.type === 'series' && t.imdbLikeRating >= 8.4);
  },

  getHiddenGems(): Title[] {
    const gems = realTitles.filter((t) => t.hiddenGem);
    return gems.length > 0 ? gems : realTitles.filter((t) => t.imdbLikeRating >= 8.5 && t.votes < 500000);
  },

  getTop10Today(): Title[] {
    return [...realTitles].sort((a, b) => b.votes - a.votes).slice(0, 10);
  },

  getByGenre(genre: string): Title[] {
    return realTitles.filter((t) => t.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
  },

  getByLanguage(language: string): Title[] {
    return realTitles.filter((t) =>
      t.languages.some((l) => l.toLowerCase() === language.toLowerCase())
    );
  },

  getByMood(mood: Mood): Title[] {
    const targetGenres = moodMapping[mood] || [];
    return realTitles
      .filter((t) => t.genres.some((g) => targetGenres.includes(g)))
      .sort((a, b) => (b.aiMatch ?? 80) - (a.aiMatch ?? 80));
  },

  getMoods(): Mood[] {
    return ['Cozy', 'Mind-bending', 'Edge-of-seat', 'Feel-good', 'Dark & gritty'];
  },

  search(query: string): Title[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return realTitles.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.genres.some((g) => g.toLowerCase().includes(q)) ||
        t.languages.some((l) => l.toLowerCase().includes(q)) ||
        t.cast.some((c) => c.name.toLowerCase().includes(q)) ||
        t.crew.some((c) => c.name.toLowerCase().includes(q)) ||
        t.synopsis.toLowerCase().includes(q)
    );
  },

  async searchWithApi(query: string): Promise<Title[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    if (tmdbApi.isConfigured()) {
      const liveResults = await tmdbApi.search(q);
      if (liveResults && liveResults.length > 0) {
        return liveResults;
      }
    }

    return this.search(q);
  },

  getReviews(titleId: string): Review[] {
    return localReviews[titleId] ?? [];
  },

  addReview(titleId: string, review: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'notHelpfulCount'>): Review {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      titleId,
      createdAt: 'Just now',
      helpfulCount: 0,
      notHelpfulCount: 0,
    };

    if (!localReviews[titleId]) {
      localReviews[titleId] = [];
    }
    localReviews[titleId] = [newReview, ...localReviews[titleId]];
    return newReview;
  },

  voteReview(titleId: string, reviewId: string, helpful: boolean): void {
    const list = localReviews[titleId];
    if (!list) return;
    const rev = list.find((r) => r.id === reviewId);
    if (!rev) return;
    if (helpful) {
      rev.helpfulCount += 1;
    } else {
      rev.notHelpfulCount += 1;
    }
  },

  getEpisodes(seriesId: string): Episode[] {
    return realEpisodes[seriesId] ?? [];
  },

  getSimilar(titleId: string): Title[] {
    const current = realTitles.find((t) => t.id === titleId);
    if (!current) return realTitles.slice(0, 8);

    return realTitles
      .filter((t) => t.id !== titleId)
      .map((t) => {
        const sharedGenres = t.genres.filter((g) => current.genres.includes(g)).length;
        const typeMatch = t.type === current.type ? 1.5 : 0;
        const langMatch = t.languages.some((l) => current.languages.includes(l)) ? 0.5 : 0;
        return {
          title: t,
          score: sharedGenres * 2 + typeMatch + langMatch,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.title);
  },

  getRatingDistribution(titleId: string): number[] {
    const title = realTitles.find((t) => t.id === titleId);
    if (!title) return Array(10).fill(10);
    const base = title.imdbLikeRating;
    return Array.from({ length: 10 }, (_, i) => {
      const bucket = i + 1;
      const distance = Math.abs(bucket - base);
      const peak = Math.max(3, 40 - distance * 7);
      return Math.round(peak + (title.votes % 13) - (i % 3) * 2);
    });
  },

  getProviderList(): string[] {
    return Array.from(new Set(realTitles.flatMap((t) => t.providers)));
  },
};

// ── Intent parsing ────────────────────────────────────────────────────────────

type ParsedIntent = {
  genres: string[];
  mood: string | null;
  language: string | null;
  type: 'movie' | 'series' | null;
  emotional: boolean;
  runtime: 'short' | 'long' | null;
  era: 'classic' | 'recent' | null;
  similarTo: string | null;
};

const GENRE_KEYWORDS: Record<string, string> = {
  'sci-fi': 'Sci-Fi', 'science fiction': 'Sci-Fi', 'space': 'Sci-Fi',
  'thriller': 'Thriller', 'suspense': 'Thriller', 'mystery': 'Mystery',
  'crime': 'Crime', 'detective': 'Crime', 'murder': 'Crime',
  'romance': 'Romance', 'love story': 'Romance', 'romantic': 'Romance',
  'comedy': 'Comedy', 'funny': 'Comedy', 'humor': 'Comedy', 'laugh': 'Comedy',
  'horror': 'Horror', 'scary': 'Horror', 'terror': 'Horror',
  'animation': 'Animation', 'anime': 'Animation', 'cartoon': 'Animation',
  'fantasy': 'Fantasy', 'magic': 'Fantasy',
  'drama': 'Drama',
  'action': 'Action', 'fight': 'Action', 'superhero': 'Action',
  'historical': 'History', 'period': 'History',
  'adventure': 'Adventure', 'journey': 'Adventure',
  'war': 'War',
};

const LANGUAGE_KEYWORDS: Record<string, string> = {
  'hindi': 'Hindi', 'bollywood': 'Hindi',
  'marathi': 'Marathi',
  'telugu': 'Telugu', 'tollywood': 'Telugu',
  'tamil': 'Tamil', 'kollywood': 'Tamil',
  'malayalam': 'Malayalam', 'mollywood': 'Malayalam',
  'kannada': 'Kannada',
  'bengali': 'Bengali',
  'punjabi': 'Punjabi',
  'korean': 'Korean', 'kdrama': 'Korean', 'k-drama': 'Korean',
  'japanese': 'Japanese',
  'spanish': 'Spanish',
  'french': 'French',
  'german': 'German',
  'english': 'English',
  'turkish': 'Turkish',
  'chinese': 'Chinese',
};

function parseIntent(query: string): ParsedIntent {
  const q = query.toLowerCase();
  const genres = new Set<string>();

  for (const [kw, genre] of Object.entries(GENRE_KEYWORDS)) {
    if (q.includes(kw)) genres.add(genre);
  }

  let language: string | null = null;
  for (const [kw, lang] of Object.entries(LANGUAGE_KEYWORDS)) {
    if (q.includes(kw)) { language = lang; break; }
  }

  let mood: string | null = null;
  if (q.includes('emotional') || q.includes('moving') || q.includes('heartbreaking')) mood = 'emotional';
  else if (q.includes('mind-bending') || q.includes('psychological') || q.includes('confusing')) mood = 'mind-bending';
  else if (q.includes('dark') || q.includes('gritty')) mood = 'dark';
  else if (q.includes('feel-good') || q.includes('uplifting') || q.includes('heartwarming')) mood = 'feel-good';
  else if (q.includes('intense') || q.includes('gripping') || q.includes('edge of seat')) mood = 'intense';

  let type: 'movie' | 'series' | null = null;
  const hasSeries = q.includes('series') || q.includes(' show') || q.includes('web series') || q.includes('tv show');
  const hasMovie = q.includes('movie') || q.includes('film');
  if (hasSeries && !hasMovie) type = 'series';
  if (hasMovie && !hasSeries) type = 'movie';

  const emotional = q.includes('emotional') || q.includes('cry') || q.includes('deep') || q.includes('moving');
  let runtime: 'short' | 'long' | null = null;
  if (q.includes('short') || q.includes('quick')) runtime = 'short';
  if (q.includes('long') || q.includes('binge')) runtime = 'long';

  let era: 'classic' | 'recent' | null = null;
  if (q.includes('classic') || q.includes('old')) era = 'classic';
  if (q.includes('new') || q.includes('latest') || q.includes('recent') || q.includes('2024') || q.includes('2023')) era = 'recent';

  const likeMatch = q.match(/(?:like|similar to)\s+([a-z0-9\s:]+?)(?:\s+but|\s+except|,|$)/);
  const similarTo = likeMatch ? likeMatch[1].trim() : null;

  return { genres: Array.from(genres), mood, language, type, emotional, runtime, era, similarTo };
}

function scoreTitle(title: Title, intent: ParsedIntent, tasteProfile?: TasteProfile): number {
  let score = title.imdbLikeRating * 4;

  const genreMatches = title.genres.filter((g) => intent.genres.includes(g)).length;
  score += genreMatches * 20;

  if (intent.language) {
    const langMatch = title.languages.some((l) => l.toLowerCase() === intent.language!.toLowerCase());
    score += langMatch ? 50 : -25;
  }

  if (intent.type && title.type !== intent.type) score -= 15;

  if (intent.emotional && (title.genres.includes('Drama') || title.genres.includes('Romance'))) score += 15;

  if (intent.mood === 'dark' && title.genres.some((g) => ['Crime', 'Horror', 'Thriller'].includes(g))) score += 12;
  if (intent.mood === 'mind-bending' && title.genres.some((g) => ['Sci-Fi', 'Mystery', 'Thriller'].includes(g))) score += 12;

  if (intent.era === 'recent' && title.year >= 2020) score += 10;
  if (intent.era === 'classic' && title.year < 2010) score += 10;
  if (intent.runtime === 'short' && title.type === 'movie' && title.runtime <= 105) score += 8;
  if (intent.runtime === 'long' && (title.type === 'series' || title.runtime > 140)) score += 8;

  if (intent.similarTo) {
    const refTitle = realTitles.find((t) => t.name.toLowerCase().includes(intent.similarTo!));
    if (refTitle) {
      const shared = title.genres.filter((g) => refTitle.genres.includes(g)).length;
      score += shared * 12;
      if (title.id === refTitle.id) score -= 50; // Don't recommend same title
    }
  }

  if (tasteProfile) {
    title.genres.forEach((g) => { if (tasteProfile.genres[g]) score += tasteProfile.genres[g] * 0.12; });
    title.languages.forEach((l) => { if (tasteProfile.languages[l]) score += tasteProfile.languages[l] * 2; });
  }

  return score;
}

function buildReason(title: Title, intent: ParsedIntent, query: string): string {
  const parts: string[] = [];
  if (intent.language && title.languages.some((l) => l.toLowerCase() === intent.language!.toLowerCase())) {
    parts.push(`${intent.language} content as requested`);
  }
  const genreMatches = title.genres.filter((g) => intent.genres.includes(g));
  if (genreMatches.length > 0) parts.push(`strong ${genreMatches.join(' + ')} match`);
  if (intent.emotional && (title.genres.includes('Drama') || title.genres.includes('Romance'))) parts.push('emotionally resonant story');
  if (intent.mood === 'mind-bending') parts.push('complex, layered narrative');
  if (intent.era === 'recent' && title.year >= 2020) parts.push(`recent release (${title.year})`);
  if (title.imdbLikeRating >= 8.5) parts.push(`outstanding rating ${title.imdbLikeRating}/10`);
  if (intent.similarTo) parts.push(`story elements similar to "${intent.similarTo}"`);
  if (parts.length === 0) return `Strong match for "${query}" based on genre, rating, and audience consensus.`;
  return parts.join(' · ');
}

export const aiService = {
  async aiSearch(
    query: string,
    tasteProfile?: TasteProfile
  ): Promise<{ parsed: { label: string; value: string }[]; results: Title[] }> {
    const intent = parseIntent(query);
    const parsed: { label: string; value: string }[] = [];

    intent.genres.forEach((g) => parsed.push({ label: 'Genre', value: g }));
    if (intent.language) parsed.push({ label: 'Language', value: intent.language });
    if (intent.type) parsed.push({ label: 'Type', value: intent.type === 'movie' ? 'Movie' : 'Series' });
    if (intent.mood) parsed.push({ label: 'Mood', value: intent.mood });
    if (intent.era) parsed.push({ label: 'Era', value: intent.era === 'recent' ? 'New releases' : 'Classics' });
    if (intent.similarTo) parsed.push({ label: 'Similar to', value: intent.similarTo });
    if (parsed.length === 0) parsed.push({ label: 'Keyword', value: query });

    let scored = realTitles.map((t) => ({ title: t, score: scoreTitle(t, intent, tasteProfile) }));

    // TMDB enhancement when configured
    if (tmdbApi.isConfigured()) {
      let liveTitles: Title[] = [];
      if (intent.language && intent.language !== 'English') {
        const movies = await tmdbApi.getByLanguage(intent.language, 'movie').catch(() => null);
        const series = await tmdbApi.getByLanguage(intent.language, 'tv').catch(() => null);
        liveTitles = [...(movies || []), ...(series || [])];
      } else {
        const searched = await tmdbApi.search(query).catch(() => null);
        liveTitles = searched || [];
      }
      const liveScored = liveTitles.map((t) => ({ title: t, score: scoreTitle(t, intent, tasteProfile) + 15 }));
      scored = [...scored, ...liveScored];
    }

    const results = scored.sort((a, b) => b.score - a.score).slice(0, 18).map((x) => x.title);
    return delay({ parsed, results });
  },

  async getRecommendations(_userId?: string, tasteProfile?: TasteProfile): Promise<{ title: Title; reason: string }[]> {
    let picks: Title[];
    if (tasteProfile && Object.keys(tasteProfile.genres).length > 0) {
      picks = realTitles
        .map((t) => {
          let score = t.imdbLikeRating * 5;
          t.genres.forEach((g) => { if (tasteProfile.genres[g]) score += tasteProfile.genres[g] * 0.2; });
          return { title: t, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map((x) => x.title);
    } else {
      picks = realTitles.filter((t) => (t.aiMatch ?? 80) >= 88).slice(0, 12);
    }
    const reasons = [
      'Top-rated match for your cinematic taste profile',
      'High critical consensus & storytelling praise',
      'Trending across WatchNext discovery charts',
      'Exceptional acting, directing, and world-building',
      'Because you enjoy deep atmosphere and tension',
      'Award-winning release with overwhelming viewer acclaim',
    ];
    return delay(picks.map((t, i) => ({ title: t, reason: reasons[i % reasons.length] })));
  },

  async analyzeBucketList(
    bucketListTitles: Title[],
    userRequest: string,
    tasteProfile?: TasteProfile
  ): Promise<{
    topPick: Title;
    reason: string;
    allRanked: { title: Title; score: number; reason: string }[];
  } | null> {
    if (bucketListTitles.length === 0) return null;

    const intent = parseIntent(userRequest || 'something great to watch');
    const ranked = bucketListTitles
      .map((title) => ({
        title,
        score: scoreTitle(title, intent, tasteProfile),
        reason: buildReason(title, intent, userRequest),
      }))
      .sort((a, b) => b.score - a.score);

    const topPick = ranked[0];
    let topReason = '';
    if (userRequest.trim()) {
      topReason = `Based on your request for "${userRequest}", **${topPick.title.name}** is the strongest match from your Bucket List. ${topPick.reason}.`;
    } else {
      topReason = `**${topPick.title.name}** ranks highest in your Bucket List — rated ${topPick.title.imdbLikeRating}/10 with genre alignment and popularity factors.`;
    }

    return delay({ topPick: topPick.title, reason: topReason, allRanked: ranked });
  },

  async discoverForMe(
    userRequest: string,
    tasteProfile?: TasteProfile,
    excludeIds: string[] = []
  ): Promise<AIRecommendation[]> {
    const intent = parseIntent(userRequest);
    let candidates = realTitles.filter((t) => !excludeIds.includes(t.id));

    if (tmdbApi.isConfigured()) {
      let liveTitles: Title[] = [];
      if (intent.language && intent.language !== 'English') {
        const movies = await tmdbApi.getByLanguage(intent.language, 'movie').catch(() => null);
        const series = await tmdbApi.getByLanguage(intent.language, 'tv').catch(() => null);
        liveTitles = [...(movies || []), ...(series || [])];
      } else {
        const searched = await tmdbApi.search(userRequest).catch(() => null);
        liveTitles = searched || [];
      }
      candidates = [...candidates, ...liveTitles.filter((t) => !excludeIds.includes(t.id))];
    }

    return delay(
      candidates
        .map((title) => ({
          title,
          score: scoreTitle(title, intent, tasteProfile),
          reason: buildReason(title, intent, userRequest),
          matchFactors: [
            ...title.genres.filter((g) => intent.genres.includes(g)).map((g) => `${g} genre`),
            ...(intent.language && title.languages.includes(intent.language) ? [`${intent.language} language`] : []),
            ...(title.imdbLikeRating >= 8.5 ? [`rated ${title.imdbLikeRating}/10`] : []),
          ],
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
    );
  },

  async summarizeReviews(titleId: string): Promise<{
    summary: string;
    pros: string[];
    cons: string[];
    themes: string[];
    sentiment: { positive: number; neutral: number; negative: number };
  }> {
    const title = titleService.getTitleById(titleId);
    const reviews = titleService.getReviews(titleId);
    const positive = reviews.filter((r) => r.rating >= 8).length || 85;
    const total = reviews.length || 100;

    return delay({
      summary: `${title?.name ?? 'This title'} is celebrated by audiences and critics alike for its compelling storytelling, exceptional direction, and nuanced performances.`,
      pros: [
        'Masterful direction and visual scale',
        'Commanding and award-worthy performances',
        'Immersive sound design and original score',
      ],
      cons: [
        'Deliberate pacing requires patient viewing',
        'Dense mythology for newcomers',
      ],
      themes: ['Ambition', 'Identity', 'Power & Duty', 'Survival'],
      sentiment: {
        positive: Math.min(95, Math.max(70, Math.round((positive / total) * 100))),
        neutral: 8,
        negative: 4,
      },
    });
  },

  computeAIScore(titleId: string): { score: number; breakdown: { label: string; weight: number; value: number }[] } {
    const title = titleService.getTitleById(titleId);
    if (!title) return { score: 85, breakdown: [] };
    const userWeight = 0.4;
    const criticWeight = 0.35;
    const sentimentWeight = 0.25;
    const userNorm = (title.imdbLikeRating / 10) * 100;
    const criticNorm = title.criticScore;
    const sentimentNorm = 88;
    const score = Math.round(userNorm * userWeight + criticNorm * criticWeight + sentimentNorm * sentimentWeight);
    return {
      score,
      breakdown: [
        { label: 'Audience Consensus', weight: userWeight, value: Math.round(userNorm) },
        { label: 'Critic Score', weight: criticWeight, value: criticNorm },
        { label: 'Sentiment Analysis', weight: sentimentWeight, value: Math.round(sentimentNorm) },
      ],
    };
  },
};
