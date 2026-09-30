import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, Star, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Title } from '@/types';
import { titleService } from '@/services/titleService';
import { BackdropImage } from '@/components/PosterImage';
import { TrailerModal } from '@/components/TrailerModal';
import { useWatchlist } from '@/context/WatchlistContext';
import { useToast } from '@/context/ToastContext';

export function HeroCarousel() {
  const featured = titleService.getFeatured();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trailerTitle, setTrailerTitle] = useState<Title | null>(null);
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { showToast } = useToast();

  const next = useCallback(() => setIndex((i) => (i + 1) % featured.length), [featured.length]);
  const prev = () => setIndex((i) => (i - 1 + featured.length) % featured.length);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [paused, next]);

  if (featured.length === 0) return null;
  const title = featured[index];

  return (
    <>
      <div
        className="relative h-[85vh] min-h-[560px] w-full overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={title.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <BackdropImage title={title} className="w-full h-full animate-ken-burns" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-hero-fade" />
        <div className="absolute inset-0 bg-hero-fade-left" />

        <button
          onClick={prev}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center text-white/40 hover:text-white transition opacity-0 hover:opacity-100 focus:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center text-white/40 hover:text-white transition opacity-0 hover:opacity-100 focus:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 lg:px-12 pb-16 lg:pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={title.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                {title.aiMatch && (
                  <span className="bg-brand-gradient text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-glow">
                    {title.aiMatch}% AI Match
                  </span>
                )}
                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-gold text-sm font-bold px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-gold" />
                  {title.imdbLikeRating}
                </span>
                <span className="text-xs text-white/50">{title.votes.toLocaleString()} votes</span>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-hero text-5xl sm:text-6xl lg:text-7xl text-white leading-none mb-3"
              >
                {title.name}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-2 text-sm text-white/70 mb-4"
              >
                <span>{title.year}</span>
                <span className="text-white/30">•</span>
                <span>{title.type === 'series' ? `${title.seasons} Season${(title.seasons ?? 0) > 1 ? 's' : ''}` : `${title.runtime}m`}</span>
                <span className="text-white/30">•</span>
                <span className="border border-white/30 px-1.5 rounded text-xs">{title.maturity}</span>
                <span className="text-white/30">•</span>
                <span>{title.genres.join(' • ')}</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-base text-white/80 max-w-xl mb-6 line-clamp-2"
              >
                {title.synopsis}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-3"
              >
                <button
                  onClick={() => setTrailerTitle(title)}
                  className="flex items-center gap-2 bg-white text-ink-950 font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition shadow-lg focus-ring"
                >
                  <Play className="w-5 h-5 fill-ink-950" /> Watch Trailer
                </button>
                <button
                  onClick={() => {
                    const isAdded = isInWatchlist(title.id);
                    toggleWatchlist(title.id);
                    showToast(isAdded ? `Removed ${title.name} from My List` : `Added ${title.name} to My List`);
                  }}
                  className="flex items-center gap-2 glass text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition focus-ring"
                >
                  {isInWatchlist(title.id) ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  My List
                </button>
                <button
                  onClick={() => navigate(`/title/${title.id}`)}
                  className="flex items-center gap-2 glass text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition focus-ring"
                >
                  <Star className="w-5 h-5" /> Rate
                </button>
                <button
                  onClick={() => navigate(`/title/${title.id}`)}
                  className="flex items-center gap-2 glass text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition focus-ring"
                >
                  <Info className="w-5 h-5" /> More Info
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2 mt-8">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1 rounded-full transition-all ${i === index ? 'w-10 bg-brand-gradient' : 'w-6 bg-white/20 hover:bg-white/40'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <TrailerModal
        title={trailerTitle}
        isOpen={Boolean(trailerTitle)}
        onClose={() => setTrailerTitle(null)}
      />
    </>
  );
}
