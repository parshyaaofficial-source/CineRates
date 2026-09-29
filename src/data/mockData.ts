import type { Title, Episode, Review, User, Mood } from '@/types';

const palettes: Record<string, [string, string, string]> = {
  sciFi: ['#0B1026', '#1E3A5F', '#22D3EE'],
  thriller: ['#1A0A0A', '#3D1212', '#7C2D2D'],
  romance: ['#2A0A1E', '#5B1B3D', '#C04B7A'],
  drama: ['#161210', '#3D2E1F', '#8B6B3F'],
  anime: ['#0A1A1E', '#1B3D45', '#2DD4BF'],
  kDrama: ['#1A0F1E', '#3D2552', '#9D6BC9'],
  comedy: ['#1E1A0A', '#3D3212', '#C9A534'],
  horror: ['#0A0A0A', '#1F1F1F', '#4D1515'],
  action: ['#0A1216', '#1F3D45', '#2D6B7C'],
  fantasy: ['#0F0A1E', '#2A1F52', '#7C5CFF'],
  doc: ['#0A1E12', '#1F3D2A', '#34D399'],
  crime: ['#121216', '#2A2A3D', '#5C6B9D'],
};

const castPool: { name: string; role: string }[] = [
  { name: 'Aria Voss', role: 'Lead' },
  { name: 'Marcus Reed', role: 'Detective' },
  { name: 'Lena Chen', role: 'Scientist' },
  { name: 'Diego Santos', role: 'Mentor' },
  { name: 'Yuki Tanaka', role: 'Rival' },
  { name: 'Nora Khalil', role: 'Ally' },
  { name: 'Eli Brooks', role: 'Antagonist' },
  { name: 'Priya Nair', role: 'Journalist' },
  { name: 'James Okafor', role: 'Commander' },
  { name: 'Sofia Lindqvist', role: 'Engineer' },
  { name: 'Tomás Reyes', role: 'Pilot' },
  { name: 'Hana Park', role: 'Strategist' },
];

function makeCast(seed: number, count = 6) {
  return Array.from({ length: count }, (_, i) => {
    const c = castPool[(seed + i) % castPool.length];
    const hue = (seed * 40 + i * 55) % 360;
    return {
      id: `c-${seed}-${i}`,
      name: c.name,
      role: c.role,
      avatarColors: [`hsl(${hue}, 55%, 25%)`, `hsl(${(hue + 40) % 360}, 60%, 45%)`] as [string, string],
    };
  });
}

function makeCrew(seed: number) {
  return [
    { id: `d-${seed}`, name: ['R. Vance', 'M. Okada', 'S. Berg', 'A. Kapoor', 'L. Moreau', 'K. Nakamura'][seed % 6], role: 'Director' },
    { id: `w-${seed}`, name: ['J. Harper', 'D. Cruz', 'P. Yates', 'F. Adebayo', 'C. Lind', 'T. Mori'][seed % 6], role: 'Writer' },
    { id: `p-${seed}`, name: ['V. Stone', 'E. Ramos', 'B. Frost', 'G. Patel', 'H. Webb', 'N. Cole'][seed % 6], role: 'Producer' },
  ];
}

function makeReviews(titleId: string, seed: number): Review[] {
  const samples = [
    { text: 'A masterclass in tension and atmosphere. The pacing pulls you in and never lets go.', rating: 9 },
    { text: 'Stunning visuals, though the second act drags slightly. Still, absolutely worth your time.', rating: 8 },
    { text: 'Expected more given the hype, but the performances elevate a thin story.', rating: 6 },
    { text: 'One of the best things I have seen this year. The score alone deserves an award.', rating: 10 },
    { text: 'A slow burn that rewards patience. Not for everyone, but those who click with it will love it.', rating: 7 },
    { text: 'The finale redeems a messy middle. Bold choices, mostly they pay off.', rating: 7 },
  ];
  return samples.slice(0, 3 + (seed % 3)).map((s, i) => ({
    id: `r-${titleId}-${i}`,
    titleId,
    userName: ['Cinephile_42', 'ReelTalk', 'FrameByFrame', 'NightOwl', 'ScreenSage', 'PopcornPundit'][(seed + i) % 6],
    userAvatarColors: [
      `hsl(${(seed * 30 + i * 60) % 360}, 50%, 30%)`,
      `hsl(${(seed * 30 + i * 60 + 50) % 360}, 55%, 50%)`,
    ] as [string, string],
    rating: s.rating,
    text: s.text,
    spoiler: i === 1 && seed % 2 === 0,
    helpfulCount: 20 + ((seed * 7 + i * 13) % 180),
    notHelpfulCount: 2 + ((seed * 3 + i * 5) % 25),
    createdAt: `2024-${String(1 + ((seed + i) % 12)).padStart(2, '0')}-${String(1 + ((seed * 3 + i * 7) % 27)).padStart(2, '0')}`,
  }));
}

type RawTitle = Omit<Title, 'cast' | 'crew' | 'posterColors' | 'backdropColors'> & { palette: keyof typeof palettes };

const rawTitles: RawTitle[] = [
  // Movies
  { id: 'm1', type: 'movie', name: 'Echoes of Tomorrow', year: 2024, runtime: 148, genres: ['Sci-Fi', 'Drama'], synopsis: 'When a physicist discovers a signal from her own future, she must race against time to prevent a catastrophe she may have already caused.', tagline: 'The future is calling. She already answered.', palette: 'sciFi', imdbLikeRating: 8.7, criticScore: 84, aiScore: 89, votes: 542000, maturity: 'PG-13', languages: ['English'], providers: ['CineSense+', 'Prime'], trending: true, topRated: true, criticallyAcclaimed: true, featured: true, aiMatch: 94 },
  { id: 'm2', type: 'movie', name: 'Midnight Protocol', year: 2023, runtime: 122, genres: ['Thriller', 'Action'], synopsis: 'A cybersecurity agent uncovers a conspiracy that reaches the highest levels of government.', tagline: 'Trust no one. Trace everything.', palette: 'thriller', imdbLikeRating: 7.9, criticScore: 71, aiScore: 81, votes: 312000, maturity: 'R', languages: ['English'], providers: ['CineSense+'], trending: true, aiMatch: 87 },
  { id: 'm3', type: 'movie', name: 'The Last Letter', year: 2024, runtime: 110, genres: ['Romance', 'Drama'], synopsis: 'Two strangers find a collection of unsent letters that rewrites everything they thought they knew about love.', tagline: 'Some words are worth waiting a lifetime for.', palette: 'romance', imdbLikeRating: 8.2, criticScore: 78, aiScore: 85, votes: 198000, maturity: 'PG-13', languages: ['English', 'French'], providers: ['CineSense+', 'Netflix'], topRated: true, aiMatch: 88 },
  { id: 'm4', type: 'movie', name: 'Neon Shadows', year: 2023, runtime: 135, genres: ['Sci-Fi', 'Action'], synopsis: 'In a neon-soaked megacity, a rogue android hunts for the missing memories that could topple a corporate empire.', tagline: 'In a world of light, truth lives in the shadows.', palette: 'sciFi', imdbLikeRating: 7.6, criticScore: 68, aiScore: 79, votes: 421000, maturity: 'PG-13', languages: ['English', 'Japanese'], providers: ['CineSense+'], trending: true, aiMatch: 83 },
  { id: 'm5', type: 'movie', name: 'Whispers in the Dark', year: 2024, runtime: 98, genres: ['Horror', 'Thriller'], synopsis: 'A family inherits a remote estate where the walls record every secret ever spoken within them.', tagline: 'The house remembers everything.', palette: 'horror', imdbLikeRating: 7.1, criticScore: 63, aiScore: 74, votes: 89000, maturity: 'R', languages: ['English'], providers: ['Netflix'], hiddenGem: true, aiMatch: 78 },
  { id: 'm6', type: 'movie', name: 'The Cartographer', year: 2023, runtime: 140, genres: ['Drama', 'Adventure'], synopsis: 'An aging mapmaker embarks on one final journey to chart a valley that has never appeared on any map.', tagline: 'Every journey ends where it begins.', palette: 'drama', imdbLikeRating: 8.4, criticScore: 86, aiScore: 87, votes: 156000, maturity: 'PG', languages: ['English'], providers: ['CineSense+'], criticallyAcclaimed: true, hiddenGem: true, aiMatch: 86 },
  { id: 'm7', type: 'movie', name: 'Velocity Point', year: 2024, runtime: 128, genres: ['Action', 'Thriller'], synopsis: 'A street racer is recruited by a covert agency to infiltrate a luxury heist ring operating across three continents.', tagline: 'Speed is the only weapon that matters.', palette: 'action', imdbLikeRating: 7.3, criticScore: 62, aiScore: 76, votes: 287000, maturity: 'PG-13', languages: ['English'], providers: ['CineSense+', 'Prime'], trending: true, aiMatch: 82 },
  { id: 'm8', type: 'movie', name: 'Solitude', year: 2023, runtime: 115, genres: ['Drama'], synopsis: 'A lighthouse keeper on a remote island confronts the ghosts of a life she left behind.', tagline: 'Some lights guide you home. Others keep you away.', palette: 'drama', imdbLikeRating: 8.0, criticScore: 81, aiScore: 83, votes: 64000, maturity: 'PG-13', languages: ['English'], providers: ['CineSense+'], criticallyAcclaimed: true, hiddenGem: true, aiMatch: 84 },
  { id: 'm9', type: 'movie', name: 'Crimson Pact', year: 2024, runtime: 130, genres: ['Crime', 'Thriller'], synopsis: 'Two rival crime families broker a fragile peace that hinges on a secret neither side fully controls.', tagline: 'Every deal has a price. This one pays in blood.', palette: 'crime', imdbLikeRating: 7.8, criticScore: 74, aiScore: 80, votes: 175000, maturity: 'R', languages: ['English', 'Spanish'], providers: ['CineSense+'], aiMatch: 85 },
  { id: 'm10', type: 'movie', name: 'Paper Cranes', year: 2023, runtime: 105, genres: ['Animation', 'Drama'], synopsis: 'A young girl folds a thousand paper cranes, each one carrying a wish for her ailing grandfather.', tagline: 'A thousand folds. One wish.', palette: 'anime', imdbLikeRating: 8.6, criticScore: 88, aiScore: 88, votes: 92000, maturity: 'PG', languages: ['Japanese', 'English'], providers: ['CineSense+'], criticallyAcclaimed: true, topRated: true, aiMatch: 90 },
  { id: 'm11', type: 'movie', name: 'The Glass Garden', year: 2024, runtime: 118, genres: ['Fantasy', 'Drama'], synopsis: 'A botanist discovers a greenhouse where every plant grows from a memory.', tagline: 'Every flower is a forgotten moment.', palette: 'fantasy', imdbLikeRating: 7.5, criticScore: 70, aiScore: 78, votes: 51000, maturity: 'PG', languages: ['English'], providers: ['CineSense+'], hiddenGem: true, aiMatch: 81 },
  { id: 'm12', type: 'movie', name: 'Aftermath', year: 2023, runtime: 142, genres: ['War', 'Drama'], synopsis: 'A field medic returns home to find the war never truly ended for those she left behind.', tagline: 'The battle ends. The war does not.', palette: 'drama', imdbLikeRating: 8.3, criticScore: 85, aiScore: 86, votes: 134000, maturity: 'R', languages: ['English'], providers: ['CineSense+'], criticallyAcclaimed: true, topRated: true, aiMatch: 87 },
  { id: 'm13', type: 'movie', name: 'Lucky Town', year: 2024, runtime: 100, genres: ['Comedy', 'Drama'], synopsis: 'A down-on-his-luck gambler discovers a town where everyone wins — until they do not.', tagline: 'Everyone wins. Nobody leaves.', palette: 'comedy', imdbLikeRating: 7.2, criticScore: 65, aiScore: 75, votes: 42000, maturity: 'PG-13', languages: ['English'], providers: ['Netflix'], aiMatch: 79 },
  { id: 'm14', type: 'movie', name: 'Deep Currents', year: 2023, runtime: 112, genres: ['Documentary'], synopsis: 'An unprecedented look at the hidden ecosystems thriving beneath the ocean floor.', tagline: 'Beneath the surface, a world breathes.', palette: 'doc', imdbLikeRating: 8.5, criticScore: 90, aiScore: 87, votes: 28000, maturity: 'PG', languages: ['English'], providers: ['CineSense+'], criticallyAcclaimed: true, hiddenGem: true, aiMatch: 88 },
  { id: 'm15', type: 'movie', name: 'Static', year: 2024, runtime: 95, genres: ['Horror', 'Sci-Fi'], synopsis: 'A radio astronomer begins receiving transmissions from a station that was destroyed decades ago.', tagline: 'Some signals refuse to die.', palette: 'horror', imdbLikeRating: 6.9, criticScore: 60, aiScore: 72, votes: 37000, maturity: 'R', languages: ['English'], providers: ['Netflix'], aiMatch: 76 },
  { id: 'm16', type: 'movie', name: 'The Golden Hour', year: 2023, runtime: 120, genres: ['Romance', 'Comedy'], synopsis: 'Two rival wedding photographers fall in love during the most chaotic season of their careers.', tagline: 'Love develops in the perfect light.', palette: 'romance', imdbLikeRating: 7.7, criticScore: 72, aiScore: 80, votes: 88000, maturity: 'PG-13', languages: ['English'], providers: ['CineSense+'], aiMatch: 83 },
  { id: 'm17', type: 'movie', name: 'Iron Bloom', year: 2024, runtime: 138, genres: ['Action', 'Sci-Fi'], synopsis: 'In a world where metal grows like plants, a blacksmith forges the weapon that could end an empire.', tagline: 'From iron, a revolution blooms.', palette: 'fantasy', imdbLikeRating: 7.4, criticScore: 67, aiScore: 77, votes: 203000, maturity: 'PG-13', languages: ['English'], providers: ['CineSense+', 'Prime'], trending: true, aiMatch: 81 },
  { id: 'm18', type: 'movie', name: 'The Quiet Child', year: 2023, runtime: 108, genres: ['Drama', 'Mystery'], synopsis: 'A child who has never spoken begins drawing pictures of places she has never been.', tagline: 'Her silence speaks volumes.', palette: 'drama', imdbLikeRating: 8.1, criticScore: 82, aiScore: 84, votes: 47000, maturity: 'PG-13', languages: ['English'], providers: ['CineSense+'], criticallyAcclaimed: true, hiddenGem: true, aiMatch: 86 },
  { id: 'm19', type: 'movie', name: 'Breakpoint', year: 2024, runtime: 125, genres: ['Thriller', 'Crime'], synopsis: 'A hostage negotiator faces the one suspect she failed to save years ago.', tagline: 'Every negotiation has a breaking point.', palette: 'thriller', imdbLikeRating: 7.6, criticScore: 71, aiScore: 79, votes: 112000, maturity: 'R', languages: ['English'], providers: ['CineSense+'], aiMatch: 82 },
  { id: 'm20', type: 'movie', name: 'Spectrum', year: 2023, runtime: 132, genres: ['Sci-Fi', 'Drama'], synopsis: 'A woman who perceives time nonlinearly tries to piece together the day her sister disappeared.', tagline: 'Time is not a line. It is a spectrum.', palette: 'sciFi', imdbLikeRating: 8.8, criticScore: 89, aiScore: 91, votes: 267000, maturity: 'PG-13', languages: ['English'], providers: ['CineSense+'], criticallyAcclaimed: true, topRated: true, featured: true, aiMatch: 93 },
  // Series
  { id: 's1', type: 'series', name: 'The Fracture', year: 2024, runtime: 55, seasons: 2, episodes: 16, genres: ['Sci-Fi', 'Thriller'], synopsis: 'After a quantum experiment tears a small town into two parallel timelines, residents must choose which reality to save.', tagline: 'Two worlds. One truth.', palette: 'sciFi', imdbLikeRating: 9.1, criticScore: 91, aiScore: 93, votes: 489000, maturity: 'TV-MA', languages: ['English'], providers: ['CineSense+'], trending: true, topRated: true, criticallyAcclaimed: true, featured: true, aiMatch: 95 },
  { id: 's2', type: 'series', name: 'Kintsugi', year: 2023, runtime: 50, seasons: 1, episodes: 8, genres: ['Drama', 'K-Drama'], synopsis: 'A master ceramicist and a troubled architect rebuild their shattered lives in a Kyoto workshop.', tagline: 'Beauty in the broken.', palette: 'kDrama', imdbLikeRating: 8.9, criticScore: 87, aiScore: 90, votes: 124000, maturity: 'TV-14', languages: ['Korean', 'Japanese'], providers: ['CineSense+', 'Netflix'], criticallyAcclaimed: true, topRated: true, aiMatch: 92 },
  { id: 's3', type: 'series', name: 'Cold Harbor', year: 2024, runtime: 48, seasons: 3, episodes: 24, genres: ['Crime', 'Drama'], synopsis: 'A coastal town detective uncovers a web of corruption spanning three decades.', tagline: 'Every tide washes up a secret.', palette: 'crime', imdbLikeRating: 8.5, criticScore: 83, aiScore: 87, votes: 298000, maturity: 'TV-MA', languages: ['English'], providers: ['CineSense+'], trending: true, topRated: true, aiMatch: 88 },
  { id: 's4', type: 'series', name: 'Starfall Academy', year: 2023, runtime: 25, seasons: 2, episodes: 24, genres: ['Animation', 'Fantasy'], synopsis: 'At an academy floating among the stars, students train to become the guardians of dying constellations.', tagline: 'Catch a falling star. Become one.', palette: 'anime', imdbLikeRating: 8.3, criticScore: 80, aiScore: 85, votes: 156000, maturity: 'TV-PG', languages: ['Japanese', 'English'], providers: ['CineSense+', 'Crunchyroll'], trending: true, aiMatch: 87 },
  { id: 's5', type: 'series', name: 'The Weight of Water', year: 2024, runtime: 52, seasons: 1, episodes: 6, genres: ['Drama', 'Mystery'], synopsis: 'A marine biologist returns to her hometown to investigate a series of disappearances linked to a local legend.', tagline: 'The sea keeps its secrets close.', palette: 'drama', imdbLikeRating: 8.0, criticScore: 79, aiScore: 83, votes: 41000, maturity: 'TV-14', languages: ['English'], providers: ['CineSense+'], hiddenGem: true, aiMatch: 85 },
  { id: 's6', type: 'series', name: 'Protocol Zero', year: 2023, runtime: 45, seasons: 2, episodes: 20, genres: ['Action', 'Thriller'], synopsis: 'An elite extraction team operates in the gray zone between diplomacy and war.', tagline: 'They go where governments cannot.', palette: 'action', imdbLikeRating: 7.8, criticScore: 70, aiScore: 80, votes: 234000, maturity: 'TV-MA', languages: ['English'], providers: ['CineSense+'], trending: true, aiMatch: 83 },
  { id: 's7', type: 'series', name: 'Lantern District', year: 2024, runtime: 50, seasons: 1, episodes: 10, genres: ['Drama', 'K-Drama'], synopsis: 'In a neon-lit Seoul neighborhood, four strangers lives intertwine over a single fateful night.', tagline: 'One night. Four lives. Infinite outcomes.', palette: 'kDrama', imdbLikeRating: 8.7, criticScore: 85, aiScore: 89, votes: 102000, maturity: 'TV-14', languages: ['Korean'], providers: ['Netflix'], topRated: true, aiMatch: 90 },
  { id: 's8', type: 'series', name: 'Deep Space Nine Lives', year: 2023, runtime: 30, seasons: 3, episodes: 36, genres: ['Comedy', 'Sci-Fi'], synopsis: 'A salvage crew aboard a derelict space station discovers their ships cat may be the most intelligent being aboard.', tagline: 'In space, everyone hears you purr.', palette: 'comedy', imdbLikeRating: 7.9, criticScore: 73, aiScore: 81, votes: 67000, maturity: 'TV-PG', languages: ['English'], providers: ['CineSense+'], aiMatch: 84 },
  { id: 's9', type: 'series', name: 'The Final Audit', year: 2024, runtime: 48, seasons: 1, episodes: 8, genres: ['Thriller', 'Crime'], synopsis: 'A forensic accountant stumbles into a conspiracy that redefines the meaning of wealth.', tagline: 'Follow the money. Find the truth.', palette: 'thriller', imdbLikeRating: 8.2, criticScore: 80, aiScore: 85, votes: 89000, maturity: 'TV-MA', languages: ['English'], providers: ['CineSense+'], hiddenGem: true, aiMatch: 86 },
  { id: 's10', type: 'series', name: 'Ember', year: 2023, runtime: 55, seasons: 2, episodes: 18, genres: ['Fantasy', 'Drama'], synopsis: 'In a world where fire holds memory, a young flamekeeper guards the last embers of a dying civilization.', tagline: 'Every spark remembers.', palette: 'fantasy', imdbLikeRating: 8.6, criticScore: 84, aiScore: 88, votes: 178000, maturity: 'TV-14', languages: ['English'], providers: ['CineSense+'], criticallyAcclaimed: true, aiMatch: 89 },
  { id: 's11', type: 'series', name: 'Night Shift', year: 2024, runtime: 40, seasons: 1, episodes: 12, genres: ['Comedy', 'Drama'], synopsis: 'The staff of a 24-hour diner navigate love, ambition, and the absurdity of the 3 AM crowd.', tagline: 'The best stories happen after midnight.', palette: 'comedy', imdbLikeRating: 7.5, criticScore: 68, aiScore: 78, votes: 34000, maturity: 'TV-14', languages: ['English'], providers: ['Netflix'], hiddenGem: true, aiMatch: 81 },
  { id: 's12', type: 'series', name: 'Glasshouse', year: 2023, runtime: 58, seasons: 2, episodes: 16, genres: ['Drama', 'Mystery'], synopsis: 'Residents of a glass-walled apartment building discover their lives are being broadcast to an unknown audience.', tagline: 'You are always being watched.', palette: 'thriller', imdbLikeRating: 8.4, criticScore: 82, aiScore: 86, votes: 145000, maturity: 'TV-MA', languages: ['English'], providers: ['CineSense+'], topRated: true, aiMatch: 87 },
  { id: 's13', type: 'series', name: 'Tidewalkers', year: 2024, runtime: 45, seasons: 1, episodes: 8, genres: ['Documentary'], synopsis: 'A breathtaking series following coastal communities adapting to rising seas.', tagline: 'The land remembers what the sea has taken.', palette: 'doc', imdbLikeRating: 8.8, criticScore: 92, aiScore: 90, votes: 22000, maturity: 'TV-G', languages: ['English'], providers: ['CineSense+'], criticallyAcclaimed: true, hiddenGem: true, aiMatch: 89 },
  { id: 's14', type: 'series', name: 'Hollow Crown Heights', year: 2023, runtime: 50, seasons: 3, episodes: 30, genres: ['Drama', 'Crime'], synopsis: 'A Brooklyn block. Three families. Decades of choices that culminate in a single explosive summer.', tagline: 'Every street has a story. This one has a reckoning.', palette: 'crime', imdbLikeRating: 8.3, criticScore: 81, aiScore: 86, votes: 201000, maturity: 'TV-MA', languages: ['English'], providers: ['CineSense+'], topRated: true, aiMatch: 87 },
  { id: 's15', type: 'series', name: 'Aether Born', year: 2024, runtime: 52, seasons: 1, episodes: 10, genres: ['Sci-Fi', 'Fantasy'], synopsis: 'In a city powered by dream-energy, a young architect discovers her blueprints are altering reality.', tagline: 'Build the world you dream of.', palette: 'fantasy', imdbLikeRating: 8.0, criticScore: 77, aiScore: 83, votes: 76000, maturity: 'TV-14', languages: ['English'], providers: ['CineSense+'], trending: true, aiMatch: 85 },
  { id: 's16', type: 'series', name: 'The Queue', year: 2023, runtime: 35, seasons: 2, episodes: 16, genres: ['Comedy', 'Drama'], synopsis: 'A satire about the employees of the worlds most absurd government office, where nothing ever gets processed.', tagline: 'Your request is important to us. Please hold.', palette: 'comedy', imdbLikeRating: 7.6, criticScore: 71, aiScore: 79, votes: 52000, maturity: 'TV-14', languages: ['English'], providers: ['Netflix'], aiMatch: 82 },
  { id: 's17', type: 'series', name: 'Vantablack', year: 2024, runtime: 50, seasons: 1, episodes: 8, genres: ['Horror', 'Mystery'], synopsis: 'An art restorer uncovers a painting that absorbs light — and anyone who looks too long.', tagline: 'Some darkness looks back.', palette: 'horror', imdbLikeRating: 7.3, criticScore: 66, aiScore: 76, votes: 38000, maturity: 'TV-MA', languages: ['English'], providers: ['CineSense+'], hiddenGem: true, aiMatch: 80 },
  { id: 's18', type: 'series', name: 'Northbound', year: 2023, runtime: 48, seasons: 2, episodes: 18, genres: ['Drama', 'Adventure'], synopsis: 'A widowed father and his estranged daughter attempt a 2,000-mile trek across the Arctic tundra.', tagline: 'The coldest journey. The warmest return.', palette: 'drama', imdbLikeRating: 8.5, criticScore: 86, aiScore: 88, votes: 91000, maturity: 'TV-14', languages: ['English'], providers: ['CineSense+'], criticallyAcclaimed: true, topRated: true, aiMatch: 89 },
  { id: 's19', type: 'series', name: 'Sweetwater', year: 2024, runtime: 42, seasons: 1, episodes: 12, genres: ['Romance', 'Drama'], synopsis: 'A small-town baker and a traveling musician keep meeting in the same roadside diner, one season at a time.', tagline: 'Some recipes take a lifetime.', palette: 'romance', imdbLikeRating: 7.8, criticScore: 74, aiScore: 81, votes: 46000, maturity: 'TV-PG', languages: ['English'], providers: ['Netflix'], aiMatch: 84 },
  { id: 's20', type: 'series', name: 'Ironclad', year: 2023, runtime: 55, seasons: 2, episodes: 20, genres: ['Action', 'Drama'], synopsis: 'A female blacksmith in 19th-century London builds an underground empire of armor and influence.', tagline: 'Forged in fire. Crowned in iron.', palette: 'crime', imdbLikeRating: 8.1, criticScore: 78, aiScore: 84, votes: 167000, maturity: 'TV-MA', languages: ['English'], providers: ['CineSense+'], aiMatch: 86 },
  { id: 's21', type: 'series', name: 'Pixel Dreams', year: 2024, runtime: 24, seasons: 1, episodes: 12, genres: ['Animation', 'Comedy'], synopsis: 'A team of indie game developers races to finish their magnum opus before funding runs out.', tagline: 'One more patch. We promise.', palette: 'anime', imdbLikeRating: 7.7, criticScore: 72, aiScore: 80, votes: 29000, maturity: 'TV-PG', languages: ['Japanese', 'English'], providers: ['Crunchyroll'], hiddenGem: true, aiMatch: 83 },
  { id: 's22', type: 'series', name: 'The Silent Frequency', year: 2023, runtime: 50, seasons: 1, episodes: 8, genres: ['Sci-Fi', 'Mystery'], synopsis: 'A deaf radio engineer discovers a frequency that only she can feel — and it is getting louder.', tagline: 'Silence has a sound. She can hear it.', palette: 'sciFi', imdbLikeRating: 8.2, criticScore: 81, aiScore: 85, votes: 58000, maturity: 'TV-14', languages: ['English'], providers: ['CineSense+'], criticallyAcclaimed: true, hiddenGem: true, aiMatch: 87 },
];

export const titles: Title[] = rawTitles.map((r, i) => {
  const { palette, ...rest } = r;
  const pc = palettes[palette];
  const seed = i + 1;
  return {
    ...rest,
    posterColors: [pc[0], pc[2]] as [string, string],
    backdropColors: pc as [string, string, string],
    cast: makeCast(seed),
    crew: makeCrew(seed),
  };
});

export const reviewsByTitle: Record<string, Review[]> = Object.fromEntries(
  titles.map((t, i) => [t.id, makeReviews(t.id, i + 1)])
);

export function episodesForSeries(seriesId: string): Episode[] {
  const title = titles.find((t) => t.id === seriesId);
  if (!title || title.type !== 'series' || !title.seasons) return [];
  const eps: Episode[] = [];
  let epNum = 1;
  for (let s = 1; s <= Math.min(title.seasons, 2); s++) {
    const perSeason = Math.ceil((title.episodes ?? 8) / title.seasons);
    for (let e = 1; e <= perSeason; e++) {
      eps.push({
        id: `${seriesId}-s${s}e${e}`,
        seriesId,
        season: s,
        number: e,
        title: `Episode ${e}`,
        rating: Math.round((title.imdbLikeRating - 1.5 + Math.sin(s * e * seed(seriesId)) * 1.2) * 10) / 10,
        airDate: `${2023 + s - 1}-${String(((e * 3) % 12) + 1).padStart(2, '0')}-${String(((e * 5) % 27) + 1).padStart(2, '0')}`,
        synopsis: 'A pivotal moment that tests loyalties and reveals a truth long buried beneath the surface.',
      });
      epNum++;
    }
  }
  return eps;
}

function seed(s: string): number {
  return s.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

export const moods: Mood[] = ['Cozy', 'Mind-bending', 'Edge-of-seat', 'Feel-good', 'Dark & gritty'];

export const moodMap: Record<Mood, string[]> = {
  Cozy: ['Romance', 'Comedy', 'Drama'],
  'Mind-bending': ['Sci-Fi', 'Mystery', 'Fantasy'],
  'Edge-of-seat': ['Thriller', 'Crime', 'Horror'],
  'Feel-good': ['Comedy', 'Romance', 'Animation'],
  'Dark & gritty': ['Crime', 'Horror', 'Thriller'],
};

export const currentUser: User = {
  id: 'u1',
  name: 'Alex Rivera',
  bio: 'Cinephile, sci-fi nerd, and chronic binge-watcher. 1,200+ titles rated and counting.',
  avatarColors: ['#7C5CFF', '#22D3EE'],
  watchlist: ['m1', 's1', 'm20', 's10'],
  watched: ['m2', 'm4', 's3', 's6', 'm10'],
  ratings: { m2: 8, m4: 7, s3: 9, s6: 8, m10: 10 },
  tasteProfile: { 'Sci-Fi': 92, Drama: 85, Thriller: 78, 'K-Drama': 70, Animation: 65, Crime: 60, Romance: 55, Comedy: 50, Horror: 40, Fantasy: 68 },
};

export const genres = ['Sci-Fi', 'Drama', 'Thriller', 'Action', 'Romance', 'Comedy', 'Crime', 'Horror', 'Animation', 'Fantasy', 'K-Drama', 'Documentary', 'Mystery', 'Adventure', 'War'];
