import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coffee, Brain, Zap, Smile, Skull } from 'lucide-react';
import type { Mood } from '@/types';
import { titleService } from '@/services/titleService';
import { TitleCard } from '@/components/TitleCard';
import { moods } from '@/data/mockData';

const moodIcons: Record<Mood, typeof Coffee> = {
  Cozy: Coffee,
  'Mind-bending': Brain,
  'Edge-of-seat': Zap,
  'Feel-good': Smile,
  'Dark & gritty': Skull,
};

const moodColors: Record<Mood, string> = {
  Cozy: 'from-amber-500/20 to-orange-500/10',
  'Mind-bending': 'from-brand-violet/20 to-blue-500/10',
  'Edge-of-seat': 'from-red-500/20 to-rose-500/10',
  'Feel-good': 'from-emerald-500/20 to-teal-500/10',
  'Dark & gritty': 'from-gray-600/20 to-slate-700/10',
};

export function MoodPicker() {
  const [active, setActive] = useState<Mood | null>(null);
  const navigate = useNavigate();

  const results = active ? titleService.getByMood(active).slice(0, 10) : [];

  return (
    <section className="mt-8 px-6 lg:px-12">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brand-violet" />
        <h2 className="text-lg sm:text-xl font-display font-semibold text-white/90">AI Mood Picker</h2>
        <span className="text-xs text-white/40">— Tell us how you feel, we'll find the right watch</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => {
          const Icon = moodIcons[mood];
          const isActive = active === mood;
          return (
            <button
              key={mood}
              onClick={() => setActive(isActive ? null : mood)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all border ${
                isActive
                  ? 'bg-brand-gradient text-white border-transparent shadow-glow scale-105'
                  : `bg-gradient-to-r ${moodColors[mood]} text-white/70 border-white/10 hover:text-white hover:border-white/20`
              }`}
            >
              <Icon className="w-4 h-4" />
              {mood}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {active && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-4"
          >
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
              {results.map((t, i) => (
                <TitleCard key={t.id} title={t} index={i} />
              ))}
            </div>
            <button
              onClick={() => navigate(`/browse?mood=${encodeURIComponent(active)}`)}
              className="text-sm text-brand-cyan hover:text-brand-violet transition font-medium"
            >
              See all "{active}" picks →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
