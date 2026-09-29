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
