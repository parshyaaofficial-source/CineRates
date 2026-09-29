import { createContext, useContext, useState, type ReactNode } from 'react';
import { currentUser } from '@/data/mockData';

type WatchlistContextType = {
  watchlist: string[];
  watched: string[];
  ratings: Record<string, number>;
  isInWatchlist: (id: string) => boolean;
  toggleWatchlist: (id: string) => void;
  isWatched: (id: string) => boolean;
  toggleWatched: (id: string) => void;
  rateTitle: (id: string, rating: number) => void;
  getRating: (id: string) => number | undefined;
};

const WatchlistContext = createContext<WatchlistContextType | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>(currentUser.watchlist);
  const [watched, setWatched] = useState<string[]>(currentUser.watched);
  const [ratings, setRatings] = useState<Record<string, number>>(currentUser.ratings);

  const isInWatchlist = (id: string) => watchlist.includes(id);
  const toggleWatchlist = (id: string) => {
    setWatchlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const isWatched = (id: string) => watched.includes(id);
  const toggleWatched = (id: string) => {
    setWatched((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const rateTitle = (id: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [id]: rating }));
  };
  const getRating = (id: string) => ratings[id];

  return (
    <WatchlistContext.Provider value={{ watchlist, watched, ratings, isInWatchlist, toggleWatchlist, isWatched, toggleWatched, rateTitle, getRating }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
}
