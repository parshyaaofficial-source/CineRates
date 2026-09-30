import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SlidersHorizontal, RotateCcw, Film, Tv, Flame, Star, Sparkles } from 'lucide-react';
import { titleService } from '@/services/titleService';
import { TitleCard } from '@/components/TitleCard';
import { Footer } from '@/components/Footer';
import { genresList } from '@/data/realTitles';
import type { TitleType } from '@/types';

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values from URL params
  const typeParam = searchParams.get('type') as TitleType | 'all' | null;
  const sortParam = searchParams.get('sort');
  const genreParam = searchParams.get('genre');
  const moodParam = searchParams.get('mood');

  const [selectedType, setSelectedType] = useState<string>(typeParam || 'all');
  const [selectedGenre, setSelectedGenre] = useState<string>(genreParam || 'all');
  const [selectedSort, setSelectedSort] = useState<string>(sortParam || 'trending');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [filterQuery, setFilterQuery] = useState<string>('');

  useEffect(() => {
    if (typeParam) setSelectedType(typeParam);
    if (sortParam) setSelectedSort(sortParam);
    if (genreParam) setSelectedGenre(genreParam);
  }, [typeParam, sortParam, genreParam]);

  const allTitles = useMemo(() => titleService.getAllTitles(), []);
  const allProviders = useMemo(() => titleService.getProviderList(), []);

  // Filter & sort logic
  const filteredTitles = useMemo(() => {
    let list = [...allTitles];

    // Filter by type
    if (selectedType === 'movie') {
      list = list.filter((t) => t.type === 'movie');
    } else if (selectedType === 'series') {
      list = list.filter((t) => t.type === 'series');
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      list = list.filter((t) => t.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()));
    }

    // Filter by mood if present in URL
    if (moodParam) {
      const moodTitles = titleService.getByMood(moodParam as any);
      const moodIds = new Set(moodTitles.map((t) => t.id));
      list = list.filter((t) => moodIds.has(t.id));
    }

    // Filter by streaming provider
    if (selectedProvider !== 'all') {
      list = list.filter((t) => t.providers.includes(selectedProvider));
    }

    // Filter by search query within page
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.synopsis.toLowerCase().includes(q) ||
          t.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (selectedSort) {
      case 'topRated':
        list.sort((a, b) => b.imdbLikeRating - a.imdbLikeRating);
        break;
      case 'newest':
        list.sort((a, b) => b.year - a.year);
        break;
      case 'aiMatch':
        list.sort((a, b) => (b.aiMatch ?? 80) - (a.aiMatch ?? 80));
        break;
      case 'title':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'trending':
      default:
        list.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || b.votes - a.votes);
        break;
    }

    return list;
  }, [allTitles, selectedType, selectedGenre, selectedSort, selectedProvider, filterQuery, moodParam]);

  const handleResetFilters = () => {
    setSelectedType('all');
    setSelectedGenre('all');
    setSelectedSort('trending');
    setSelectedProvider('all');
    setFilterQuery('');
    setSearchParams({});
  };

  const getPageTitle = () => {
    if (selectedType === 'movie') return 'Browse Movies';
    if (selectedType === 'series') return 'Browse TV & Web Series';
    if (selectedSort === 'trending') return 'Trending & Popular';
    if (selectedSort === 'topRated') return 'Top Rated Titles';
    if (moodParam) return `Mood: ${moodParam}`;
    return 'Browse Catalog';
  };

  return (
    <div className="min-h-screen bg-ink-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-brand-gradient text-white shadow-glow">
                <SlidersHorizontal className="w-4 h-4" />
              </span>
              <h1 className="text-3xl sm:text-4xl font-hero text-white leading-none">
                {getPageTitle()}
              </h1>
            </div>
            <p className="text-sm text-white/50">
              Discover verified movies and television series with authentic ratings and rich streaming details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-cyan font-semibold px-3 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20">
              {filteredTitles.length} Titles Found
            </span>
          </div>
        </div>

        {/* Filter Bar Controls */}
        <div className="glass-strong rounded-2xl p-4 sm:p-5 mb-8 border border-white/10 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Type Switcher */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              {[
                { id: 'all', label: 'All Titles', icon: Filter },
                { id: 'movie', label: 'Movies', icon: Film },
                { id: 'series', label: 'TV Series', icon: Tv },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedType(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedType === id
                      ? 'bg-brand-gradient text-white shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Quick in-page filter search */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter current view..."
                className="w-full bg-white/5 text-xs text-white placeholder-white/30 rounded-xl px-3 py-2 border border-white/10 focus:border-brand-cyan outline-none transition"
              />
            </div>
          </div>

          {/* Secondary Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2 border-t border-white/8">
            {/* Genre Dropdown */}
            <div>
              <label className="text-[11px] font-medium text-white/50 mb-1 block">Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-ink-900 border border-white/10 text-white text-xs rounded-xl px-3 py-2 outline-none focus-ring"
              >
                <option value="all">All Genres</option>
                {genresList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="text-[11px] font-medium text-white/50 mb-1 block">Sort By</label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full bg-ink-900 border border-white/10 text-white text-xs rounded-xl px-3 py-2 outline-none focus-ring"
              >
                <option value="trending">Trending & Popular</option>
                <option value="topRated">Top Rated (Highest First)</option>
                <option value="newest">New Releases (2024 - 2023)</option>
                <option value="aiMatch">Highest AI Score Match</option>
                <option value="title">Title (A to Z)</option>
              </select>
            </div>

            {/* Streaming Provider */}
            <div>
              <label className="text-[11px] font-medium text-white/50 mb-1 block">Platform</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full bg-ink-900 border border-white/10 text-white text-xs rounded-xl px-3 py-2 outline-none focus-ring"
              >
                <option value="all">All Platforms</option>
                {allProviders.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Title Grid */}
        {filteredTitles.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
          >
            {filteredTitles.map((title) => (
              <div key={title.id} className="flex justify-center">
                <TitleCard title={title} />
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 glass rounded-2xl border border-white/10 max-w-lg mx-auto">
            <Filter className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <h3 className="font-display font-semibold text-white text-lg mb-1">
              No matching titles found
            </h3>
            <p className="text-sm text-white/50 mb-6">
              Try adjusting your genre, type, or platform filters to find what you're looking for.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold hover:shadow-glow transition"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default BrowsePage;
