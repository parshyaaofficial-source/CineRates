import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, Clapperboard, Filter, ArrowRight } from 'lucide-react';
import { titleService, aiService } from '@/services/titleService';
import { TitleCard } from '@/components/TitleCard';
import { Footer } from '@/components/Footer';
import type { Title } from '@/types';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const aiParam = searchParams.get('ai') === 'true';

  const [query, setQuery] = useState(queryParam);
  const [aiMode, setAiMode] = useState(aiParam);
  const [results, setResults] = useState<Title[]>([]);
  const [aiTags, setAiTags] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'series'>('all');

  useEffect(() => {
    setQuery(queryParam);
    setAiMode(aiParam);
  }, [queryParam, aiParam]);

  useEffect(() => {
    if (!queryParam.trim()) {
      setResults([]);
      setAiTags([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (aiMode) {
      aiService.aiSearch(queryParam).then((res) => {
        setResults(res.results);
        setAiTags(res.parsed);
        setLoading(false);
      });
    } else {
      titleService.searchWithApi(queryParam).then((res) => {
        setResults(res);
        setAiTags([]);
        setLoading(false);
      });
    }
  }, [queryParam, aiMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim(), ...(aiMode ? { ai: 'true' } : {}) });
    }
  };

  const filteredResults = results.filter((item) => {
    if (typeFilter === 'all') return true;
    return item.type === typeFilter;
  });

  const popularSearches = ['Dune', 'Oppenheimer', 'Shōgun', 'Severance', 'Sci-Fi', 'Breaking Bad'];

  return (
    <div className="min-h-screen bg-ink-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Search Header Form */}
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-brand-gradient text-white shadow-glow">
              {aiMode ? <Sparkles className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </span>
            <h1 className="text-3xl sm:text-4xl font-hero text-white leading-none">
              {aiMode ? 'WatchNext AI Natural Search' : 'Search Movies & TV Series'}
            </h1>
          </div>
          <p className="text-sm text-white/50 mb-6">
            Search across our verified catalog by title, director, actors, moods, or themes.
          </p>

          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="glass-strong rounded-2xl p-2 flex items-center gap-3 border border-white/15 shadow-2xl focus-within:border-brand-cyan/60 transition">
              <Search className="w-5 h-5 text-white/40 ml-3 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  aiMode
                    ? 'E.g. "Slow-burn sci-fi series with mystery" or "Dark crime drama"...'
                    : 'Search titles, actors, genres (e.g. Dune, Shogun)...'
                }
                className="w-full bg-transparent text-white placeholder-white/40 text-sm sm:text-base outline-none py-2"
                autoFocus
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSearchParams({});
                  }}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white transition"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const newAi = !aiMode;
                  setAiMode(newAi);
                  if (query.trim()) {
                    setSearchParams({ q: query.trim(), ...(newAi ? { ai: 'true' } : {}) });
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                  aiMode
                    ? 'bg-brand-gradient text-white shadow-glow'
                    : 'bg-white/10 hover:bg-white/20 text-white/70'
                }`}
                title="Toggle AI query analysis"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Search</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-white text-ink-950 font-semibold text-sm hover:bg-white/90 transition shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Suggested Quick Queries */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-white/50">
            <span>Popular searches:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  setSearchParams({ q: term });
                }}
                className="bg-white/5 hover:bg-white/15 text-white/80 px-2.5 py-1 rounded-full border border-white/10 transition"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* AI Parsed Tag Breakdown */}
        {aiTags.length > 0 && (
          <div className="max-w-3xl mx-auto mb-8 p-3 rounded-2xl glass border border-brand-cyan/20 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-brand-cyan font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Analyzed:
            </span>
            {aiTags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-white/10 text-white px-2.5 py-1 rounded-lg border border-white/10"
              >
                <strong className="text-white/50 font-normal">{tag.label}:</strong> {tag.value}
              </span>
            ))}
          </div>
        )}

        {/* Results Bar */}
        {queryParam.trim() && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-display font-semibold text-white">
                Results for "{queryParam}"
              </h2>
              <p className="text-xs text-white/40">
                Found {filteredResults.length} matching {filteredResults.length === 1 ? 'title' : 'titles'}
              </p>
            </div>

            {/* Quick Type Filter */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
              {(['all', 'movie', 'series'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                    typeFilter === t ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'TV Series'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Display */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-white/60">Searching WatchNext catalog...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
          >
            {filteredResults.map((title) => (
              <div key={title.id} className="flex justify-center">
                <TitleCard title={title} />
              </div>
            ))}
          </motion.div>
        ) : queryParam.trim() ? (
          /* Empty Search Result State */
          <div className="text-center py-16 glass rounded-2xl border border-white/10 max-w-lg mx-auto">
            <Clapperboard className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <h3 className="font-display font-semibold text-white text-lg mb-1">
              No results found for "{queryParam}"
            </h3>
            <p className="text-sm text-white/50 mb-6 max-w-sm mx-auto">
              We couldn't find an exact match. Check spelling or try one of our trending titles below.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/browse"
                className="px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-xs font-semibold hover:shadow-glow transition"
              >
                Browse All Titles
              </Link>
              <Link
                to="/top-charts"
                className="px-5 py-2.5 rounded-xl glass hover:bg-white/10 text-white text-xs font-semibold transition"
              >
                View Top Rated
              </Link>
            </div>
          </div>
        ) : (
          /* Initial Default State */
          <div className="text-center py-16 max-w-lg mx-auto">
            <Search className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/60 mb-2">Type a query above to start searching</p>
            <p className="text-xs text-white/40 mb-6">
              Or explore our curated collections by genre, release year, or mood.
            </p>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-cyan hover:text-brand-violet transition"
            >
              Browse Complete Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default SearchPage;
