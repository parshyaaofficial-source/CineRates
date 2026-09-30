export type TitleType = 'movie' | 'series';

export type CastMember = {
  id: string;
  name: string;
  role: string;
  avatarColors: [string, string];
};

export type CrewMember = {
  id: string;
  name: string;
  role: string;
};

export type Episode = {
  id: string;
  seriesId: string;
  season: number;
  number: number;
  title: string;
  rating: number;
  airDate: string;
  synopsis: string;
};

export type Review = {
  id: string;
  titleId: string;
  userName: string;
  userAvatarColors: [string, string];
  rating: number;
  text: string;
  spoiler: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
};

export type Title = {
  id: string;
  type: TitleType;
  name: string;
  year: number;
  runtime: number;
  seasons?: number;
  episodes?: number;
  genres: string[];
  synopsis: string;
  tagline?: string;
  posterColors: [string, string];
  backdropColors: [string, string, string];
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  cast: CastMember[];
  crew: CrewMember[];
  imdbLikeRating: number;
  criticScore: number;
  aiScore: number;
  votes: number;
  maturity: string;
  languages: string[];
  providers: string[];
  trending?: boolean;
  topRated?: boolean;
  criticallyAcclaimed?: boolean;
  hiddenGem?: boolean;
  aiMatch?: number;
  featured?: boolean;
};

export type Mood = 'Cozy' | 'Mind-bending' | 'Edge-of-seat' | 'Feel-good' | 'Dark & gritty';

// Bucket List item — extends title with metadata about when it was added
export type BucketListItem = {
  titleId: string;
  addedAt: string; // ISO timestamp
  priority?: number; // 1 = high, 2 = medium, 3 = low
  note?: string;
};

// Taste profile derived from user behavior
export type TasteProfile = {
  genres: Record<string, number>;     // genre → affinity score 0-100
  languages: Record<string, number>;  // language → count
  types: { movie: number; series: number };
  recentSearches: string[];           // last 20 searches
  viewedTitleIds: string[];           // titles user clicked on
  summary?: string;                   // AI-generated summary
};

// Friend relationship
export type FriendStatus = 'pending_sent' | 'pending_received' | 'connected' | 'declined';

export type Friend = {
  id: string;
  name: string;
  avatarColors: [string, string];
  status: FriendStatus;
  sharedGenres?: string[];
  publicBucketList?: string[]; // title IDs they chose to share
  connectedAt?: string;
};

// App User (demo/localStorage-based)
export type AppUser = {
  id: string;
  name: string;
  email: string;
  avatarColors: [string, string];
  bio: string;
  joinedAt: string;
  isGuest: boolean;
  bucketList: BucketListItem[];
  watched: string[];
  ratings: Record<string, number>;
  tasteProfile: TasteProfile;
  friends: Friend[];
  privacySettings: {
    shareBucketList: boolean;
    shareWatchHistory: boolean;
    shareRatings: boolean;
  };
};

export type User = {
  id: string;
  name: string;
  bio: string;
  avatarColors: [string, string];
  watchlist: string[];
  watched: string[];
  ratings: Record<string, number>;
  tasteProfile: Record<string, number>;
};

// AI recommendation result
export type AIRecommendation = {
  title: Title;
  score: number;
  reason: string;
  matchFactors: string[];
};

// Supported languages for filtering
export const SUPPORTED_LANGUAGES = [
  'English', 'Hindi', 'Marathi', 'Telugu', 'Tamil', 'Malayalam',
  'Kannada', 'Bengali', 'Punjabi', 'Gujarati', 'Korean', 'Japanese',
  'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Turkish', 'Arabic', 'Chinese', 'Thai',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
