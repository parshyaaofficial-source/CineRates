import { useRef, useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Title } from '@/types';
import { TitleCard } from './TitleCard';

export function Carousel({
  titles,
  numbered = false,
  children,
}: {
  titles?: Title[];
  numbered?: boolean;
  children?: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [showArrows, setShowArrows] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    updateArrows();
  }, [titles]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div
      className="relative group/row"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <div ref={scrollRef} className="row-scroll px-6 lg:px-12 py-4" onScroll={updateArrows}>
        {children}
        {titles?.map((t, i) => (
          <TitleCard key={t.id} title={t} index={i} numbered={numbered} />
        ))}
      </div>
      <AnimatePresence>
        {showArrows && canLeft && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-12 lg:w-12 flex items-center justify-center bg-gradient-to-r from-ink-950/90 to-transparent"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </motion.button>
        )}
        {showArrows && canRight && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 lg:w-12 flex items-center justify-center bg-gradient-to-l from-ink-950/90 to-transparent"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RowSection({ title, titles, numbered = false }: { title: string; titles: Title[]; numbered?: boolean }) {
  return (
    <section className="mt-2">
      <h2 className="px-6 lg:px-12 text-lg sm:text-xl font-display font-semibold text-white/90">{title}</h2>
      <Carousel titles={titles} numbered={numbered} />
    </section>
  );
}
