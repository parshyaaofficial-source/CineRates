import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { titleService } from '@/services/titleService';
import { HeroCarousel } from '@/components/HeroCarousel';
import { RowSection } from '@/components/Carousel';
import { MoodPicker } from '@/components/MoodPicker';
import { Footer } from '@/components/Footer';
import { genres } from '@/data/mockData';

export function HomePage() {
  const rows = useMemo(() => [
    { title: 'Top 10 Today', data: titleService.getTop10Today(), numbered: true },
    { title: 'Recommended For You (AI)', data: titleService.getAllTitles().filter((t) => t.aiMatch && t.aiMatch >= 85).slice(0, 12) },
    { title: 'Trending Now', data: titleService.getTrending() },
    { title: 'Top Rated of All Time', data: titleService.getTopRated() },
    { title: 'Critically Acclaimed', data: titleService.getCriticallyAcclaimed() },
    { title: 'Binge-Worthy Series', data: titleService.getBingeWorthySeries() },
    { title: 'Hidden Gems (AI picked)', data: titleService.getHiddenGems() },
    { title: 'Because you watched The Fracture', data: titleService.getSimilar('s1') },
  ], []);

  const genreRows = useMemo(() => {
    return genres.slice(0, 6).map((g) => ({
      title: g,
      data: titleService.getByGenre(g).slice(0, 12),
    }));
  }, []);

  return (
    <div className="min-h-screen bg-ink-950">
      <HeroCarousel />

      <div className="relative z-10 -mt-16 pb-8">
        <MoodPicker />

        {rows.map((row, i) => (
          <motion.div
            key={row.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <RowSection title={row.title} titles={row.data} numbered={row.numbered} />
          </motion.div>
        ))}

        {genreRows.map((row) => (
          <motion.div
            key={row.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
          >
            <RowSection title={row.title} titles={row.data} />
          </motion.div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
