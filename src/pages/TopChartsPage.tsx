import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Sparkles, Award, Play, Plus, Check } from 'lucide-react';
import { titleService } from '@/services/titleService';
import { PosterImage } from '@/components/PosterImage';
import { RatingRing } from '@/components/RatingRing';
import { TrailerModal } from '@/components/TrailerModal';
import { Footer } from '@/components/Footer';
import { useWatchlist } from '@/context/WatchlistContext';
import { useToast } from '@/context/ToastContext';
import type { Title } from '@/types';

type ChartTab = 'allTime' | 'top10' | 'critics' | 'aiScore';

export function TopChartsPage() {
  const [activeTab, setActiveTab] = useState<ChartTab>('allTime');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'series'>('all');
  const [trailerTitle, setTrailerTitle] = useState<Title | null>(null);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { showToast } = useToast();

  const chartList = useMemo(() => {
    let titles: Title[] = [];

    switch (activeTab) {
      case 'top10':
        titles = titleService.getTop10Today();
        break;
      case 'critics':
        titles = titleService.getCriticallyAcclaimed();
        break;
      case 'aiScore':
        titles = [...titleService.getAllTitles()].sort((a, b) => (b.aiMatch ?? 80) - (a.aiMatch ?? 80));
        break;
      case 'allTime':
      default:
        titles = titleService.getTopRated();
        break;
    }

    if (mediaFilter !== 'all') {
      titles = titles.filter((t) => t.type === mediaFilter);
    }

    return titles;
  }, [activeTab, mediaFilter]);

  return (
    <div className="min-h-screen bg-ink-950 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-brand-gradient text-white shadow-glow">
              <Trophy className="w-5 h-5" />
            </span>
            <h1 className="text-3xl sm:text-4xl font-hero text-white leading-none">
              WatchNext Top Charts
            </h1>
          </div>
          <p className="text-sm text-white/50">
            The highest-rated films and television series of all time, ranked by verified viewer ratings and critical consensus.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'allTime', label: 'All-Time Top Rated', icon: Star },
              { id: 'top10', label: 'Top 10 Today', icon: Trophy },
              { id: 'critics', label: 'Critically Acclaimed', icon: Award },
              { id: 'aiScore', label: 'Highest AI Match', icon: Sparkles },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as ChartTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-brand-gradient text-white shadow-glow'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Media Type Filter */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
            {(['all', 'movie', 'series'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMediaFilter(type)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                  mediaFilter === type ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Series'}
              </button>
            ))}
          </div>
        </div>

        {/* Ranking List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {chartList.map((title, index) => {
              const inList = isInWatchlist(title.id);

              return (
                <motion.div
                  key={title.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="glass-strong rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 hover:border-white/20 hover:bg-white/5 transition group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Rank Badge */}
                    <span className="font-hero text-2xl sm:text-3xl text-white/40 group-hover:text-brand-cyan transition w-8 text-center shrink-0">
                      {index + 1}
                    </span>

                    {/* Poster */}
                    <Link to={`/title/${title.id}`} className="shrink-0 focus-ring rounded-xl overflow-hidden">
                      <PosterImage
                        title={title}
                        className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl shadow-md group-hover:scale-105 transition"
                      />
                    </Link>

                    {/* Meta Details */}
                    <div className="min-w-0">
                      <Link to={`/title/${title.id}`}>
                        <h2 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-brand-cyan transition truncate">
                          {title.name}
                        </h2>
                      </Link>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 mt-1 mb-2">
                        <span>{title.year}</span>
                        <span>•</span>
                        <span>{title.type === 'series' ? `${title.seasons ?? 1} Seasons` : `${title.runtime}m`}</span>
                        <span>•</span>
                        <span className="border border-white/20 px-1.5 py-0.5 rounded text-[10px]">
                          {title.maturity}
                        </span>
                        <span>•</span>
                        <span className="text-white/70">{title.genres.slice(0, 2).join(', ')}</span>
                      </div>

                      <p className="text-xs text-white/60 line-clamp-2 max-w-xl">
                        {title.synopsis}
                      </p>
                    </div>
                  </div>

                  {/* Scores & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/8">
                    {/* Rating Rings */}
                    <div className="flex items-center gap-3">
                      <RatingRing
                        value={title.imdbLikeRating}
                        max={10}
                        size={52}
                        label="WatchNext"
                        sublabel={`${(title.votes / 1000).toFixed(0)}k`}
                        color="#F5C518"
                      />
                      <RatingRing
                        value={title.criticScore}
                        max={100}
                        size={52}
                        label="Critics"
                        color="#22D3EE"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTrailerTitle(title)}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Watch Trailer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span className="hidden md:inline">Trailer</span>
                      </button>

                      <button
                        onClick={() => {
                          toggleWatchlist(title.id);
                          showToast(inList ? `Removed ${title.name} from My List` : `Added ${title.name} to My List`);
                        }}
                        className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                          inList
                            ? 'bg-brand-violet text-white shadow-sm'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                        title={inList ? 'In Watchlist' : 'Add to Watchlist'}
                      >
                        {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span className="hidden md:inline">{inList ? 'Saved' : 'Watchlist'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <TrailerModal
        title={trailerTitle}
        isOpen={Boolean(trailerTitle)}
        onClose={() => setTrailerTitle(null)}
      />

      <Footer />
    </div>
  );
}

export default TopChartsPage;
