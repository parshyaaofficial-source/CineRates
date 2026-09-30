/**
 * WatchlistContext — now delegates to UserContext for persistence.
 * Kept for backward compatibility with existing components.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { useUser } from '@/context/UserContext';

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
  const {
    bucketList,
    isInBucketList,
    addToBucketList,
    removeFromBucketList,
    watched,
    ratings,
    toggleWatched,
    isWatched,
    rateTitle,
    getRating,
  } = useUser();

  const watchlist = bucketList.map((b) => b.titleId);

  const isInWatchlist = (id: string) => isInBucketList(id);
  const toggleWatchlist = (id: string) => {
    if (isInBucketList(id)) {
      removeFromBucketList(id);
    } else {
      addToBucketList(id);
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        watched,
        ratings,
        isInWatchlist,
        toggleWatchlist,
        isWatched,
        toggleWatched,
        rateTitle,
        getRating,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
}
