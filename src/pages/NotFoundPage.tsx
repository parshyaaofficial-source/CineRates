import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clapperboard, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center overflow-hidden">
      <div className="text-center px-6 relative z-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="inline-block mb-8"
        >
          <Clapperboard className="w-24 h-24 text-brand-violet" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-hero text-7xl sm:text-8xl text-white mb-2"
        >
          404
        </motion.h1>
        <p className="text-white/60 text-lg mb-2">This scene didn't make the final cut.</p>
        <p className="text-white/40 text-sm mb-8">The page you're looking for has been left on the editing room floor.</p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-brand-gradient text-white font-semibold px-6 py-3 rounded-xl hover:shadow-glow transition"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>

      {/* Decorative film reel dots */}
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
