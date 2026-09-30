import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, CheckCircle2, Star, Film, Trash2, Eye, EyeOff, Play, Compass } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import { useToast } from '@/context/ToastContext';
import { titleService } from '@/services/titleService';
import { PosterImage, Avatar } from '@/components/PosterImage';
import { TrailerModal } from '@/components/TrailerModal';
import { Footer } from '@/components/Footer';
import type { Title } from '@/types';

type ProfileTab = 'watchlist' | 'watched' | 'ratings';

export function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = (searchParams.get('tab') as ProfileTab) || 'watchlist';

  const [activeTab, setActiveTab] = useState<ProfileTab>(tabParam);
  const [trailerTitle, setTrailerTitle] = useState<Title | null>(null);

  const { watchlist, watched, ratings, toggleWatchlist, toggleWatched, getRating } = useWatchlist();
  const { showToast } = useToast();

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  const allTitles = useMemo(() => titleService.getAllTitles(), []);

  const watchlistTitles = useMemo(() => {
    return allTitles.filter((t) => watchlist.includes(t.id));
  }, [allTitles, watchlist]);

  const watchedTitles = useMemo(() => {
    return allTitles.filter((t) => watched.includes(t.id));
  }, [allTitles, watched]);

  const ratedTitles = useMemo(() => {
    return allTitles.filter((t) => ratings[t.id] !== undefined);
  }, [allTitles, ratings]);

  const handleTabSwitch = (tab: ProfileTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-ink-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* User Profile Header Card */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8 mb-10 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gradient opacity-10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <Avatar colors={['#7C5CFF', '#22D3EE']} name="Alex Rivera" size={84} />

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-hero text-white">Alex Rivera</h1>
                <span className="bg-brand-gradient text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-glow self-center sm:self-auto">
                  WatchNext VIP Member
                </span>
              </div>
              <p className="text-sm text-white/50 max-w-lg mb-4">
                Film lover, sci-fi enthusiast, and avid series binger. Member since 2024.
              </p>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="font-bold text-white text-base block">{watchlistTitles.length}</span>
                  <span className="text-white/40">In Watchlist</span>
                </div>
                <div>
                  <span className="font-bold text-white text-base block">{watchedTitles.length}</span>
                  <span className="text-white/40">Titles Watched</span>
                </div>
                <div>
                  <span className="font-bold text-white text-base block">{ratedTitles.length}</span>
                  <span className="text-white/40">Ratings Given</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mb-8 pb-3 border-b border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: 'watchlist', label: `My List (${watchlistTitles.length})`, icon: Bookmark },
            { id: 'watched', label: `Watched (${watchedTitles.length})`, icon: CheckCircle2 },
            { id: 'ratings', label: `My Ratings (${ratedTitles.length})`, icon: Star },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabSwitch(id as ProfileTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
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

        {/* Tab 1: Watchlist (My List) */}
        {activeTab === 'watchlist' && (
          <div>
            {watchlistTitles.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {watchlistTitles.map((title) => {
                  const isItemWatched = watched.includes(title.id);
                  return (
                    <div
                      key={title.id}
                      className="glass-strong rounded-2xl p-4 border border-white/10 hover:border-white/20 transition flex gap-4 group"
                    >
                      <Link to={`/title/${title.id}`} className="shrink-0">
                        <PosterImage
                          title={title}
                          className="w-20 h-28 rounded-xl shadow-md group-hover:scale-105 transition"
                        />
                      </Link>

                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <Link to={`/title/${title.id}`}>
                            <h3 className="font-display font-semibold text-white text-base group-hover:text-brand-cyan transition truncate">
                              {title.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-white/50 mt-0.5">
                            {title.year} • {title.type === 'series' ? 'Series' : 'Movie'} • ⭐ {title.imdbLikeRating}
                          </p>
                          <p className="text-xs text-white/60 line-clamp-2 mt-1.5">{title.synopsis}</p>
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/8">
                          <button
                            onClick={() => setTrailerTitle(title)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs flex items-center gap-1 transition"
                            title="Trailer"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              toggleWatched(title.id);
                              showToast(isItemWatched ? 'Marked as unwatched' : 'Marked as watched');
                            }}
                            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                              isItemWatched ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-white/5 hover:bg-white/15 text-white/60'
                            }`}
                            title="Toggle Watched"
                          >
                            {isItemWatched ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => {
                              toggleWatchlist(title.id);
                              showToast(`Removed ${title.name} from My List`);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition ml-auto"
                            title="Remove from My List"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center py-20 glass rounded-2xl border border-white/10 max-w-md mx-auto">
                <Bookmark className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <h3 className="font-display font-semibold text-white text-lg mb-1">Your List is Empty</h3>
                <p className="text-sm text-white/50 mb-6">
                  Add movies and series to your Watchlist to keep track of what you want to watch.
                </p>
                <Link
                  to="/browse"
                  className="px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold hover:shadow-glow transition inline-flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" /> Browse Catalog
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Watched History */}
        {activeTab === 'watched' && (
          <div>
            {watchedTitles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {watchedTitles.map((title) => (
                  <div
                    key={title.id}
                    className="glass-strong rounded-2xl p-4 border border-white/10 hover:border-white/20 transition flex gap-4 group"
                  >
                    <Link to={`/title/${title.id}`} className="shrink-0">
                      <PosterImage
                        title={title}
                        className="w-20 h-28 rounded-xl shadow-md group-hover:scale-105 transition"
                      />
                    </Link>

                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Watched
                        </div>
                        <Link to={`/title/${title.id}`}>
                          <h3 className="font-display font-semibold text-white text-base group-hover:text-brand-cyan transition truncate">
                            {title.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-white/50 mt-0.5">{title.year} • {title.genres[0]}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/8">
                        <button
                          onClick={() => {
                            toggleWatched(title.id);
                            showToast('Marked as not watched');
                          }}
                          className="text-xs text-white/50 hover:text-white transition"
                        >
                          Mark as unwatched
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 glass rounded-2xl border border-white/10 max-w-md mx-auto">
                <CheckCircle2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <h3 className="font-display font-semibold text-white text-lg mb-1">No Watched Titles</h3>
                <p className="text-sm text-white/50 mb-6">
                  Mark titles as watched on any title detail page or from your watchlist.
                </p>
                <Link
                  to="/browse"
                  className="px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold hover:shadow-glow transition inline-block"
                >
                  Explore Titles
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Ratings Given */}
        {activeTab === 'ratings' && (
          <div>
            {ratedTitles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {ratedTitles.map((title) => {
                  const rating = getRating(title.id);
                  return (
                    <div
                      key={title.id}
                      className="glass-strong rounded-2xl p-4 border border-white/10 hover:border-white/20 transition flex gap-4 group"
                    >
                      <Link to={`/title/${title.id}`} className="shrink-0">
                        <PosterImage
                          title={title}
                          className="w-20 h-28 rounded-xl shadow-md group-hover:scale-105 transition"
                        />
                      </Link>

                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-gold text-xs font-bold mb-1">
                            <Star className="w-3.5 h-3.5 fill-gold" /> Your Rating: {rating}/10
                          </div>
                          <Link to={`/title/${title.id}`}>
                            <h3 className="font-display font-semibold text-white text-base group-hover:text-brand-cyan transition truncate">
                              {title.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-white/50 mt-0.5">{title.year} • Global: ⭐ {title.imdbLikeRating}</p>
                        </div>

                        <Link
                          to={`/title/${title.id}`}
                          className="text-xs text-brand-cyan hover:text-brand-violet transition mt-3 pt-2 border-t border-white/8 inline-block"
                        >
                          Change Rating →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 glass rounded-2xl border border-white/10 max-w-md mx-auto">
                <Star className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <h3 className="font-display font-semibold text-white text-lg mb-1">No Ratings Yet</h3>
                <p className="text-sm text-white/50 mb-6">
                  Rate your favorite movies and series to sharpen your WatchNext AI recommendations.
                </p>
                <Link
                  to="/top-charts"
                  className="px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold hover:shadow-glow transition inline-block"
                >
                  Rate Top Titles
                </Link>
              </div>
            )}
          </div>
        )}
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

export default ProfilePage;
