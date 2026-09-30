import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Play } from 'lucide-react';
import type { Title } from '@/types';

interface TrailerModalProps {
  title: Title | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TrailerModal({ title, isOpen, onClose }: TrailerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !title) return null;

  const ytUrl = title.trailerUrl
    ? `${title.trailerUrl}?autoplay=1&rel=0`
    : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(`${title.name} ${title.year} official trailer`)}&autoplay=1`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl bg-ink-950/95 border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-ink-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
                <Play className="w-4 h-4 fill-white text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-white text-base leading-tight">
                  {title.name}
                </h3>
                <p className="text-xs text-white/50">
                  {title.year} • Official Trailer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `${title.name} official trailer`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 hover:text-white glass px-3 py-1.5 rounded-lg transition"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition focus-ring"
                aria-label="Close trailer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={ytUrl}
              title={`${title.name} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>

          {/* Footer Info */}
          <div className="px-5 py-3 bg-ink-900/40 border-t border-white/8 flex items-center justify-between text-xs text-white/60">
            <span>Streaming on {title.providers?.join(', ') || 'WatchNext'}</span>
            <span>⭐ {title.imdbLikeRating}/10</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default TrailerModal;
