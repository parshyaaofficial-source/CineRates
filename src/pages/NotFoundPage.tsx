import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Home, Trophy, Search } from 'lucide-react';
import { WatchNextLogo } from '@/components/WatchNextLogo';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center overflow-hidden px-4">
      <div className="text-center px-6 relative z-10 max-w-lg">
        <div className="mb-6 flex justify-center">
          <WatchNextLogo size={52} showText={false} />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-hero text-7xl sm:text-8xl text-white mb-2"
        >
          404
        </motion.h1>
        <p className="text-white/80 text-lg mb-2 font-display font-semibold">
          This scene didn't make the final cut.
        </p>
        <p className="text-white/50 text-sm mb-8">
          The title or page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-brand-gradient text-white font-semibold px-5 py-2.5 rounded-xl hover:shadow-glow transition text-sm"
          >
            <Home className="w-4 h-4" />
            WatchNext Home
          </Link>

          <Link
            to="/browse"
            className="inline-flex items-center gap-2 glass text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/15 transition text-sm"
          >
            <Film className="w-4 h-4" />
            Browse Catalog
          </Link>

          <Link
            to="/top-charts"
            className="inline-flex items-center gap-2 glass text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/15 transition text-sm"
          >
            <Trophy className="w-4 h-4" />
            Top Charts
          </Link>
        </div>
      </div>

      {/* Ambient background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/5"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

export default NotFoundPage;
