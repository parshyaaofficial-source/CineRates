import type { Title, Episode, Review, Mood } from '@/types';
import { titles, reviewsByTitle, episodesForSeries, moodMap, moods } from '@/data/mockData';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const titleService = {
  getAllTitles(): Title[] {
    return titles;
  },

  getTitleById(id: string): Title | undefined {
    return titles.find((t) => t.id === id);
  },

  getFeatured(): Title[] {
    return titles.filter((t) => t.featured);
  },

  getTrending(): Title[] {
    return titles.filter((t) => t.trending);
  },

  getTopRated(): Title[] {
    return [...titles].sort((a, b) => b.imdbLikeRating - a.imdbLikeRating).slice(0, 12);
  },

  getCriticallyAcclaimed(): Title[] {
    return titles.filter((t) => t.criticallyAcclaimed);
  },

  getBingeWorthySeries(): Title[] {
    return titles.filter((t) => t.type === 'series' && t.imdbLikeRating >= 7.8);
  },

  getHiddenGems(): Title[] {
    return titles.filter((t) => t.hiddenGem);
  },

  getTop10Today(): Title[] {
    return [...titles].sort((a, b) => b.votes - a.votes).slice(0, 10);
  },

  getByGenre(genre: string): Title[] {
    return titles.filter((t) => t.genres.includes(genre));
  },

  getByMood(mood: Mood): Title[] {
    const genres = moodMap[mood];
    return titles
      .filter((t) => t.genres.some((g) => genres.includes(g)))
      .sort((a, b) => b.aiMatch ?? b.aiScore - (a.aiMatch ?? a.aiScore));
  },

  getMoods(): Mood[] {
    return moods;
  },

  search(query: string): Title[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return titles.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.genres.some((g) => g.toLowerCase().includes(q)) ||
        t.cast.some((c) => c.name.toLowerCase().includes(q)) ||
        t.synopsis.toLowerCase().includes(q)
    );
  },

  getReviews(titleId: string): Review[] {
    return reviewsByTitle[titleId] ?? [];
  },

  getEpisodes(seriesId: string): Episode[] {
    return episodesForSeries(seriesId);
  },

  getSimilar(titleId: string): Title[] {
    const title = titles.find((t) => t.id === titleId);
    if (!title) return [];
    return titles
      .filter((t) => t.id !== titleId)
      .map((t) => ({
        title: t,
        score: t.genres.filter((g) => title.genres.includes(g)).length + (t.type === title.type ? 0.5 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.title);
  },

  getRatingDistribution(titleId: string): number[] {
    const title = titles.find((t) => t.id === titleId);
    if (!title) return Array(10).fill(0);
    const base = title.imdbLikeRating;
    return Array.from({ length: 10 }, (_, i) => {
      const bucket = i + 1;
      const distance = Math.abs(bucket - base);
      const peak = Math.max(2, 30 - distance * 4);
      return Math.round(peak + ((title.votes / 10000) % 15) - (i % 3) * 2);
    });
  },

  getProviderList(): string[] {
    return Array.from(new Set(titles.flatMap((t) => t.providers)));
  },
};

export const aiService = {
  async aiSearch(query: string): Promise<{ parsed: { label: string; value: string }[]; results: Title[] }> {
    const q = query.toLowerCase();
    const parsed: { label: string; value: string }[] = [];

    const moodKeywords: Record<string, string> = {
      'slow-burn': 'Drama',
      'edge-of-seat': 'Thriller',
      'feel-good': 'Comedy',
      'mind-bending': 'Sci-Fi',
      'dark': 'Crime',
      'gritty': 'Crime',
      'cozy': 'Romance',
    };

    const genreKeywords: Record<string, string> = {
      'sci-fi': 'Sci-Fi',
      'science fiction': 'Sci-Fi',
      'thriller': 'Thriller',
      'romance': 'Romance',
      'comedy': 'Comedy',
      'horror': 'Horror',
      'animation': 'Animation',
      'anime': 'Animation',
      'k-drama': 'K-Drama',
      'crime': 'Crime',
      'fantasy': 'Fantasy',
      'drama': 'Drama',
      'mystery': 'Mystery',
    };

    const matchedGenres = new Set<string>();
    for (const [kw, genre] of Object.entries(genreKeywords)) {
      if (q.includes(kw)) {
        matchedGenres.add(genre);
        parsed.push({ label: 'Genre', value: genre });
      }
    }
    for (const [kw, genre] of Object.entries(moodKeywords)) {
      if (q.includes(kw) && !matchedGenres.has(genre)) {
        matchedGenres.add(genre);
        parsed.push({ label: 'Mood', value: kw });
      }
    }

    if (q.includes('series') || q.includes('show')) {
      parsed.push({ label: 'Type', value: 'Series' });
    }
    if (q.includes('movie') || q.includes('film')) {
      parsed.push({ label: 'Type', value: 'Movie' });
    }

    if (q.includes('female lead') || q.includes('strong female')) {
      parsed.push({ label: 'Cast', value: 'Strong female lead' });
    }

    const underMatch = q.match(/under (\d+) episodes/);
    if (underMatch) {
      parsed.push({ label: 'Max episodes', value: underMatch[1] });
    }

    if (parsed.length === 0) {
      parsed.push({ label: 'Keyword', value: query });
    }

    let results = titles;
    if (q.includes('series') || q.includes('show')) {
      results = results.filter((t) => t.type === 'series');
    }
    if (q.includes('movie') || q.includes('film')) {
      results = results.filter((t) => t.type === 'movie');
    }
    if (matchedGenres.size > 0) {
      results = results.filter((t) => t.genres.some((g) => matchedGenres.has(g)));
    }
    if (underMatch) {
      const max = parseInt(underMatch[1]);
      results = results.filter((t) => t.type !== 'series' || (t.episodes ?? 99) <= max);
    }
    if (results.length === 0) {
      results = titleService.search(query);
    }

    return delay({ parsed, results: results.slice(0, 18) });
  },

  async getRecommendations(_userId: string): Promise<{ title: Title; reason: string }[]> {
    const picks = titles.filter((t) => t.aiMatch && t.aiMatch >= 85).slice(0, 12);
    const reasons = [
      'Because you rated Dark 9/10',
      'Matches your Sci-Fi affinity',
      'Trending among viewers like you',
      'Because you enjoyed The Fracture',
      'Aligned with your taste profile',
      'High AI score + your favorite genres',
    ];
    return delay(picks.map((t, i) => ({ title: t, reason: reasons[i % reasons.length] })));
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
    const positive = reviews.filter((r) => r.rating >= 8).length;
    const negative = reviews.filter((r) => r.rating <= 6).length;
    const neutral = reviews.length - positive - negative;
    const total = reviews.length || 1;

    return delay({
      summary: `${title?.name ?? 'This title'} resonates most with viewers who appreciate atmospheric storytelling and strong performances. The majority praise its pacing and visual craft, while a minority feel the second act loses momentum. Overall, audience sentiment is overwhelmingly positive.`,
      pros: ['Stunning visuals and atmosphere', 'Compelling lead performances', 'Memorable score and sound design'],
      cons: ['Second act pacing dips', 'Some plot threads left ambiguous'],
      themes: ['Identity', 'Loss', 'Redemption', 'Isolation'],
      sentiment: {
        positive: Math.round((positive / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        negative: Math.round((negative / total) * 100),
      },
    });
  },

  computeAIScore(titleId: string): { score: number; breakdown: { label: string; weight: number; value: number }[] } {
    const title = titleService.getTitleById(titleId);
    if (!title) return { score: 0, breakdown: [] };
    const userWeight = 0.4;
    const criticWeight = 0.35;
    const sentimentWeight = 0.25;
    const userNorm = (title.imdbLikeRating / 10) * 100;
    const criticNorm = title.criticScore;
    const sentimentNorm = 70 + ((title.aiScore % 30));
    const score = Math.round(userNorm * userWeight + criticNorm * criticWeight + sentimentNorm * sentimentWeight);
    return {
      score,
      breakdown: [
        { label: 'User Ratings', weight: userWeight, value: Math.round(userNorm) },
        { label: 'Critic Score', weight: criticWeight, value: criticNorm },
        { label: 'Sentiment Analysis', weight: sentimentWeight, value: Math.round(sentimentNorm) },
      ],
    };
  },

  detectSpoilers(text: string): boolean {
    const spoilers = ['dies', 'death', 'ending', 'twist', 'reveals', 'kills', 'murder', 'plot twist', 'finale', '结局', '死'];
    const lower = text.toLowerCase();
    return spoilers.some((s) => lower.includes(s));
  },
};
