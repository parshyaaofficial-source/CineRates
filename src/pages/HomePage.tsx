import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { titleService } from '@/services/titleService';
import { HeroCarousel } from '@/components/HeroCarousel';
import { RowSection } from '@/components/Carousel';
import { MoodPicker } from '@/components/MoodPicker';
import { Footer } from '@/components/Footer';
import { genresList } from '@/data/realTitles';

export function HomePage() {
  const rows = useMemo(() => [
    { title: 'Top 10 Today', data: titleService.getTop10Today(), numbered: true },
    { title: 'Trending Now', data: titleService.getTrending() },
    { title: 'New Releases', data: titleService.getNewReleases() },
    { title: 'Top Rated of All Time', data: titleService.getTopRated() },
    { title: 'Popular Movies & Series', data: titleService.getPopular() },
    { title: 'Recommended For You (AI)', data: titleService.getAllTitles().filter((t) => (t.aiMatch ?? 0) >= 88).slice(0, 12) },
    { title: 'Critically Acclaimed Masterpieces', data: titleService.getCriticallyAcclaimed() },
    { title: 'Binge-Worthy Series', data: titleService.getBingeWorthySeries() },
    { title: 'Hidden Gems (WatchNext Curated)', data: titleService.getHiddenGems() },
    { title: 'Because you loved Dune: Part Two', data: titleService.getSimilar('m-dune-2') },
  ], []);

  const genreRows = useMemo(() => {
    return genresList.slice(0, 6).map((g) => ({
      title: g,
      data: titleService.getByGenre(g).slice(0, 12),
    }));
  }, []);

  return (
    <div className="min-h-screen bg-ink-950">
      <HeroCarousel />

      <div className="relative z-10 -mt-16 pb-8">
        <MoodPicker />

        {rows.map((row) => (
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
