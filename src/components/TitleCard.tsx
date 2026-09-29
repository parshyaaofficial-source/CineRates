import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Play, Star, Info } from 'lucide-react';
import type { Title } from '@/types';
import { PosterImage } from './PosterImage';
import { useWatchlist } from '@/context/WatchlistContext';

export function TitleCard({ title, index, numbered = false }: { title: Title; index?: number; numbered?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inList = isInWatchlist(title.id);

  const handleMouseEnter = () => {
    setHovered(true);
    hoverTimer.current = setTimeout(() => setShowPreview(true), 300);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setShowPreview(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  if (numbered && index !== undefined) {
    return (
      <Link
        to={`/title/${title.id}`}
        className="snap-start shrink-0 flex items-end group focus-ring rounded-xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span
          className="font-hero text-[120px] leading-none text-transparent select-none -mr-4 transition-all duration-300"
          style={{
            WebkitTextStroke: '2px rgba(255,255,255,0.25)',
            ...(hovered ? { WebkitTextStroke: '2px rgba(124,92,255,0.6)' } : {}),
          }}
        >
          {index + 1}
        </span>
        <PosterImage
          title={title}
          className={`w-32 h-48 sm:w-36 sm:h-52 rounded-lg transition-transform duration-300 ${hovered ? 'scale-105 shadow-card-hover' : 'shadow-card'}`}
        />
      </Link>
    );
  }

  return (
    <Link
      to={`/title/${title.id}`}
      className="snap-start shrink-0 relative group focus-ring rounded-xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{ scale: hovered ? 1.08 : 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative"
      >
        <PosterImage
          title={title}
          className="w-36 h-52 sm:w-40 sm:h-60 rounded-xl shadow-card transition-shadow duration-300"
        />
        {title.aiMatch && (
          <div className="absolute top-2 left-2 bg-brand-gradient text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-glow">
            {title.aiMatch}% Match
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-gold text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
          <Star className="w-3 h-3 fill-gold" />
          {title.imdbLikeRating}
        </div>
      </motion.div>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 -translate-x-1/2 z-50 w-64 mt-2 glass-strong rounded-xl p-3 shadow-card-hover"
          >
            <h4 className="font-display font-semibold text-sm text-white truncate">{title.name}</h4>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-white/50">
              <span>{title.year}</span>
              <span>•</span>
              <span>{title.type === 'series' ? `${title.seasons} seasons` : `${title.runtime}m`}</span>
              <span>•</span>
              <span className="border border-white/20 px-1 rounded">{title.maturity}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {title.genres.slice(0, 3).map((g) => (
                <span key={g} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">{g}</span>
              ))}
            </div>
            <p className="text-[11px] text-white/60 mt-2 line-clamp-2">{title.synopsis}</p>
            <div className="flex items-center gap-2 mt-3">
              <button
                className="flex items-center gap-1 bg-white text-ink-950 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/90 transition"
                onClick={(e) => { e.preventDefault(); }}
              >
                <Play className="w-3 h-3 fill-ink-950" /> Trailer
              </button>
              <button
                className="flex items-center gap-1 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/20 transition"
                onClick={(e) => { e.preventDefault(); toggleWatchlist(title.id); }}
              >
                {inList ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {inList ? 'Added' : 'My List'}
              </button>
              <Link
                to={`/title/${title.id}`}
                className="flex items-center gap-1 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/20 transition"
              >
                <Info className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}
