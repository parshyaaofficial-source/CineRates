import {
  createContext, useContext, useState, useCallback, useEffect,
  type ReactNode,
} from 'react';
import type { AppUser, BucketListItem, TasteProfile, Friend, Title } from '@/types';

// ── Default taste profile ────────────────────────────────────────────────────
const defaultTasteProfile: TasteProfile = {
  genres: {},
  languages: {},
  types: { movie: 0, series: 0 },
  recentSearches: [],
  viewedTitleIds: [],
};

// ── Default user (guest) ─────────────────────────────────────────────────────
const createGuestUser = (): AppUser => ({
  id: `guest-${Date.now()}`,
  name: 'Guest',
  email: '',
  avatarColors: ['#7C5CFF', '#22D3EE'],
  bio: '',
  joinedAt: new Date().toISOString(),
  isGuest: true,
  bucketList: [],
  watched: [],
  ratings: {},
  tasteProfile: { ...defaultTasteProfile },
  friends: [],
  privacySettings: {
    shareBucketList: false,
    shareWatchHistory: false,
    shareRatings: false,
  },
});

const createDemoUser = (): AppUser => ({
  id: 'u-alex',
  name: 'Alex Rivera',
  email: 'alex@example.com',
  avatarColors: ['#7C5CFF', '#22D3EE'],
  bio: 'Film lover, sci-fi enthusiast, and avid series binger. Member since 2024.',
  joinedAt: '2024-01-01T00:00:00.000Z',
  isGuest: false,
  bucketList: [
    { titleId: 'm-dune-2', addedAt: '2024-06-01T00:00:00.000Z', priority: 1 },
    { titleId: 's-shogun', addedAt: '2024-06-02T00:00:00.000Z', priority: 1 },
    { titleId: 'm-interstellar', addedAt: '2024-06-03T00:00:00.000Z', priority: 2 },
    { titleId: 's-severance', addedAt: '2024-06-04T00:00:00.000Z', priority: 2 },
    { titleId: 's-fallout', addedAt: '2024-06-05T00:00:00.000Z', priority: 3 },
  ],
  watched: ['m-oppenheimer', 's-breaking-bad', 'm-dark-knight', 's-the-bear'],
  ratings: {
    'm-dune-2': 10,
    'm-oppenheimer': 9,
    's-breaking-bad': 10,
    'm-dark-knight': 9,
    's-shogun': 10,
    's-severance': 9,
  },
  tasteProfile: {
    genres: { 'Sci-Fi': 95, 'Drama': 88, 'Thriller': 82, 'Action': 76, 'Comedy': 65, 'Crime': 70 },
    languages: { English: 12, German: 2, Hindi: 1 },
    types: { movie: 7, series: 5 },
    recentSearches: ['mind-bending thriller', 'sci-fi space', 'best crime series'],
    viewedTitleIds: ['m-dune-2', 's-shogun', 'm-interstellar', 's-dark', 's-breaking-bad'],
  },
  friends: [
    {
      id: 'f-1',
      name: 'Priya Sharma',
      avatarColors: ['#EC4899', '#9D174D'],
      status: 'connected',
      sharedGenres: ['Thriller', 'Drama', 'Crime'],
      publicBucketList: ['s-dark', 's-breaking-bad', 'm-dark-knight'],
      connectedAt: '2024-03-15T00:00:00.000Z',
    },
    {
      id: 'f-2',
      name: 'Rahul Verma',
      avatarColors: ['#3B82F6', '#1E3A8A'],
      status: 'connected',
      sharedGenres: ['Action', 'Sci-Fi'],
      publicBucketList: ['m-dune-2', 's-fallout', 'm-spider-verse'],
      connectedAt: '2024-04-01T00:00:00.000Z',
    },
    {
      id: 'f-3',
      name: 'Mei Lin',
      avatarColors: ['#10B981', '#065F46'],
      status: 'pending_received',
      sharedGenres: ['Animation', 'Fantasy'],
      connectedAt: undefined,
    },
  ],
  privacySettings: {
    shareBucketList: true,
    shareWatchHistory: false,
    shareRatings: true,
  },
});

// ── Persistence helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = 'wn_user_v2';

function loadUser(): AppUser {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppUser;
      // Merge defaults in case new fields were added
      return {
        ...createGuestUser(),
        ...parsed,
        tasteProfile: { ...defaultTasteProfile, ...parsed.tasteProfile },
        privacySettings: { shareBucketList: false, shareWatchHistory: false, shareRatings: false, ...parsed.privacySettings },
      };
    }
  } catch {
    // Corrupt storage — reset
  }
  return createGuestUser();
}

function saveUser(user: AppUser) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Storage full — ignore
  }
}

// ── Context type ─────────────────────────────────────────────────────────────
type UserContextType = {
  user: AppUser;
  isLoggedIn: boolean;

  // Auth
  login: (name: string, email: string) => void;
  loginAsDemo: () => void;
  logout: () => void;

  // Bucket List
  bucketList: BucketListItem[];
  isInBucketList: (titleId: string) => boolean;
  addToBucketList: (titleId: string, priority?: number) => void;
  removeFromBucketList: (titleId: string) => void;
  updateBucketListPriority: (titleId: string, priority: number) => void;

  // Watched + Ratings
  watched: string[];
  ratings: Record<string, number>;
  toggleWatched: (titleId: string) => void;
  isWatched: (titleId: string) => boolean;
  rateTitle: (titleId: string, rating: number) => void;
  getRating: (titleId: string) => number | undefined;

  // Taste profile
  tasteProfile: TasteProfile;
  recordSearch: (query: string) => void;
  recordTitleView: (title: Title) => void;
  updateGenreAffinity: (genre: string, delta: number) => void;
  getTasteGenreTop: (n?: number) => { genre: string; score: number }[];

  // Friends
  friends: Friend[];
  sendFriendRequest: (name: string) => void;
  acceptFriendRequest: (friendId: string) => void;
  declineFriendRequest: (friendId: string) => void;
  removeFriend: (friendId: string) => void;

  // Privacy
  updatePrivacy: (setting: keyof AppUser['privacySettings'], value: boolean) => void;
};

const UserContext = createContext<UserContextType | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser>(loadUser);

  // Persist on every change
  useEffect(() => {
    saveUser(user);
  }, [user]);

  const updateUser = useCallback((updater: (prev: AppUser) => AppUser) => {
    setUser((prev) => {
      const next = updater(prev);
      saveUser(next);
      return next;
    });
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────
  const login = useCallback((name: string, email: string) => {
    updateUser((prev) => ({
      ...prev,
      name: name || 'User',
      email,
      isGuest: false,
      id: `u-${email.replace(/[^a-z0-9]/gi, '')}`,
    }));
  }, [updateUser]);

  const loginAsDemo = useCallback(() => {
    const demo = createDemoUser();
    setUser(demo);
    saveUser(demo);
  }, []);

  const logout = useCallback(() => {
    const guest = createGuestUser();
    setUser(guest);
    saveUser(guest);
  }, []);

  // ── Bucket List ─────────────────────────────────────────────────────────
  const isInBucketList = useCallback(
    (titleId: string) => user.bucketList.some((b) => b.titleId === titleId),
    [user.bucketList]
  );

  const addToBucketList = useCallback((titleId: string, priority = 2) => {
    updateUser((prev) => {
      if (prev.bucketList.some((b) => b.titleId === titleId)) return prev;
      return {
        ...prev,
        bucketList: [
          ...prev.bucketList,
          { titleId, addedAt: new Date().toISOString(), priority },
        ],
      };
    });
  }, [updateUser]);

  const removeFromBucketList = useCallback((titleId: string) => {
    updateUser((prev) => ({
      ...prev,
      bucketList: prev.bucketList.filter((b) => b.titleId !== titleId),
    }));
  }, [updateUser]);

  const updateBucketListPriority = useCallback((titleId: string, priority: number) => {
    updateUser((prev) => ({
      ...prev,
      bucketList: prev.bucketList.map((b) =>
        b.titleId === titleId ? { ...b, priority } : b
      ),
    }));
  }, [updateUser]);

  // ── Watched & Ratings ───────────────────────────────────────────────────
  const toggleWatched = useCallback((titleId: string) => {
    updateUser((prev) => ({
      ...prev,
      watched: prev.watched.includes(titleId)
        ? prev.watched.filter((id) => id !== titleId)
        : [...prev.watched, titleId],
    }));
  }, [updateUser]);

  const isWatched = useCallback((titleId: string) => user.watched.includes(titleId), [user.watched]);

  const rateTitle = useCallback((titleId: string, rating: number) => {
    updateUser((prev) => ({
      ...prev,
      ratings: { ...prev.ratings, [titleId]: rating },
    }));
  }, [updateUser]);

  const getRating = useCallback((titleId: string) => user.ratings[titleId], [user.ratings]);

  // ── Taste Profile ────────────────────────────────────────────────────────
  const recordSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    updateUser((prev) => {
      const searches = [query, ...prev.tasteProfile.recentSearches.filter((s) => s !== query)].slice(0, 20);
      return {
        ...prev,
        tasteProfile: { ...prev.tasteProfile, recentSearches: searches },
      };
    });
  }, [updateUser]);

  const recordTitleView = useCallback((title: Title) => {
    updateUser((prev) => {
      const tp = prev.tasteProfile;
      const newGenres = { ...tp.genres };
      title.genres.forEach((g) => {
        newGenres[g] = Math.min(100, (newGenres[g] || 50) + 3);
      });

      const newLanguages = { ...tp.languages };
      title.languages.forEach((l) => {
        newLanguages[l] = (newLanguages[l] || 0) + 1;
      });

      const newTypes = {
        movie: tp.types.movie + (title.type === 'movie' ? 1 : 0),
        series: tp.types.series + (title.type === 'series' ? 1 : 0),
      };

      const viewedIds = [title.id, ...tp.viewedTitleIds.filter((id) => id !== title.id)].slice(0, 50);

      return {
        ...prev,
        tasteProfile: {
          ...tp,
          genres: newGenres,
          languages: newLanguages,
          types: newTypes,
          viewedTitleIds: viewedIds,
        },
      };
    });
  }, [updateUser]);

  const updateGenreAffinity = useCallback((genre: string, delta: number) => {
    updateUser((prev) => ({
      ...prev,
      tasteProfile: {
        ...prev.tasteProfile,
        genres: {
          ...prev.tasteProfile.genres,
          [genre]: Math.max(0, Math.min(100, (prev.tasteProfile.genres[genre] || 50) + delta)),
        },
      },
    }));
  }, [updateUser]);

  const getTasteGenreTop = useCallback((n = 5) => {
    return Object.entries(user.tasteProfile.genres)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n)
      .map(([genre, score]) => ({ genre, score }));
  }, [user.tasteProfile.genres]);

  // ── Friends ─────────────────────────────────────────────────────────────
  const sendFriendRequest = useCallback((name: string) => {
    const newFriend: Friend = {
      id: `f-${Date.now()}`,
      name,
      avatarColors: ['#7C5CFF', '#22D3EE'],
      status: 'pending_sent',
    };
    updateUser((prev) => ({
      ...prev,
      friends: [...prev.friends, newFriend],
    }));
  }, [updateUser]);

  const acceptFriendRequest = useCallback((friendId: string) => {
    updateUser((prev) => ({
      ...prev,
      friends: prev.friends.map((f) =>
        f.id === friendId ? { ...f, status: 'connected' as const, connectedAt: new Date().toISOString() } : f
      ),
    }));
  }, [updateUser]);

  const declineFriendRequest = useCallback((friendId: string) => {
    updateUser((prev) => ({
      ...prev,
      friends: prev.friends.map((f) =>
        f.id === friendId ? { ...f, status: 'declined' as const } : f
      ),
    }));
  }, [updateUser]);

  const removeFriend = useCallback((friendId: string) => {
    updateUser((prev) => ({
      ...prev,
      friends: prev.friends.filter((f) => f.id !== friendId),
    }));
  }, [updateUser]);

  // ── Privacy ──────────────────────────────────────────────────────────────
  const updatePrivacy = useCallback((setting: keyof AppUser['privacySettings'], value: boolean) => {
    updateUser((prev) => ({
      ...prev,
      privacySettings: { ...prev.privacySettings, [setting]: value },
    }));
  }, [updateUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn: !user.isGuest,
        login,
        loginAsDemo,
        logout,
        bucketList: user.bucketList,
        isInBucketList,
        addToBucketList,
        removeFromBucketList,
        updateBucketListPriority,
        watched: user.watched,
        ratings: user.ratings,
        toggleWatched,
        isWatched,
        rateTitle,
        getRating,
        tasteProfile: user.tasteProfile,
        recordSearch,
        recordTitleView,
        updateGenreAffinity,
        getTasteGenreTop,
        friends: user.friends,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        removeFriend,
        updatePrivacy,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
