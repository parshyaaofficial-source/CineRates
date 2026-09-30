import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Sliders, Play, Plus, Check, Star, RefreshCw } from 'lucide-react';
import { titleService } from '@/services/titleService';
import { PosterImage } from '@/components/PosterImage';
import { TrailerModal } from '@/components/TrailerModal';
import { Footer } from '@/components/Footer';
import { useWatchlist } from '@/context/WatchlistContext';
import { useToast } from '@/context/ToastContext';
import type { Title } from '@/types';

export function ForYouPage() {
  const [trailerTitle, setTrailerTitle] = useState<Title | null>(null);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { showToast } = useToast();

  // Interactive Taste Profile Sliders
  const [preferences, setPreferences] = useState<Record<string, number>>({
    'Sci-Fi': 95,
    Drama: 88,
    Thriller: 82,
    Action: 76,
    Comedy: 65,
  });

  const allTitles = useMemo(() => titleService.getAllTitles(), []);

  // Compute recommendation scores dynamically based on preferences
  const recommendations = useMemo(() => {
    return allTitles
      .map((t) => {
        let affinity = 0;
        t.genres.forEach((g) => {
          if (preferences[g]) {
            affinity += preferences[g];
          }
        });
        const matchPercent = Math.min(
          99,
          Math.round((t.imdbLikeRating * 7) + (affinity > 0 ? affinity / t.genres.length * 0.3 : 10))
        );

        let reason = 'High audience & critical consensus';
        if (t.genres.includes('Sci-Fi') && preferences['Sci-Fi'] > 80) {
          reason = 'Matches your high Sci-Fi affinity';
        } else if (t.genres.includes('Drama') && preferences['Drama'] > 80) {
          reason = 'Aligned with your drama preference';
        } else if (t.genres.includes('Thriller') && preferences['Thriller'] > 80) {
          reason = 'High suspense and edge-of-seat pacing';
        }

        return {
          title: t,
          match: matchPercent,
          reason,
        };
      })
      .sort((a, b) => b.match - a.match)
      .slice(0, 15);
  }, [allTitles, preferences]);

  const handleSliderChange = (genre: string, val: number) => {
    setPreferences((prev) => ({ ...prev, [genre]: val }));
  };

  const handleResetPreferences = () => {
    setPreferences({
      'Sci-Fi': 95,
      Drama: 88,
      Thriller: 82,
      Action: 76,
      Comedy: 65,
    });
    showToast('Taste profile reset to default');
  };

  return (
    <div className="min-h-screen bg-ink-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-brand-gradient text-white shadow-glow">
                <Sparkles className="w-5 h-5" />
              </span>
              <h1 className="text-3xl sm:text-4xl font-hero text-white leading-none">
                AI Recommendations For You
              </h1>
            </div>
            <p className="text-sm text-white/50">
              Personalized suggestions powered by WatchNext AI and tailored to your live cinematic taste profile.
            </p>
          </div>
        </div>

        {/* Taste Profile Tuning Widget */}
        <div className="glass-strong rounded-2xl p-5 mb-10 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-cyan" />
              <h3 className="text-sm font-semibold text-white">Fine-Tune Your Taste Profile</h3>
            </div>
            <button
              onClick={handleResetPreferences}
              className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" /> Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(preferences).map(([genre, value]) => (
              <div key={genre} className="bg-white/5 p-3 rounded-xl border border-white/8">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-white">{genre}</span>
                  <span className="text-brand-cyan font-bold">{value}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={value}
                  onChange={(e) => handleSliderChange(genre, Number(e.target.value))}
                  className="w-full accent-brand-violet cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(({ title, match, reason }, idx) => {
            const inList = isInWatchlist(title.id);

            return (
              <motion.div
                key={title.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className="glass-strong rounded-2xl p-4 border border-white/10 hover:border-white/20 transition flex flex-col justify-between group"
              >
                <div>
                  {/* Top Match Pill & Reason */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-brand-gradient text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-glow">
                      {match}% AI Match
                    </span>
                    <span className="text-[11px] text-brand-cyan truncate max-w-[180px]">
                      {reason}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    {/* Poster */}
                    <Link to={`/title/${title.id}`} className="shrink-0 focus-ring rounded-xl overflow-hidden">
                      <PosterImage
                        title={title}
                        className="w-24 h-36 rounded-xl shadow-md group-hover:scale-105 transition"
                      />
                    </Link>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <Link to={`/title/${title.id}`}>
                        <h3 className="font-display font-bold text-white text-base group-hover:text-brand-cyan transition truncate">
                          {title.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 text-xs text-white/50 mt-1 mb-1.5">
                        <span>{title.year}</span>
                        <span>•</span>
                        <span>{title.type === 'series' ? 'TV' : 'Film'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-gold font-bold">
                          <Star className="w-3 h-3 fill-gold" /> {title.imdbLikeRating}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {title.genres.slice(0, 2).map((g) => (
                          <span key={g} className="text-[10px] bg-white/10 text-white/80 px-1.5 py-0.5 rounded">
                            {g}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-white/60 line-clamp-2">
                        {title.synopsis}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-white/8">
                  <button
                    onClick={() => setTrailerTitle(title)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Trailer
                  </button>

                  <button
                    onClick={() => {
                      toggleWatchlist(title.id);
                      showToast(inList ? `Removed ${title.name} from My List` : `Added ${title.name} to My List`);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
                      inList ? 'bg-brand-violet text-white shadow-sm' : 'bg-white text-ink-950 hover:bg-white/90'
                    }`}
                  >
                    {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {inList ? 'Saved' : 'My List'}
                  </button>
                </div>
              </motion.div>
            );
          })}
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

export default ForYouPage;
