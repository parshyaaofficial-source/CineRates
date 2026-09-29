import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Plus, Check, Star, Share2, ListPlus, Eye, EyeOff, ChevronDown,
  ThumbsUp, ThumbsDown, Sparkles, Info, X, Lightbulb, TrendingUp, Clock, Calendar
} from 'lucide-react';
import { titleService, aiService } from '@/services/titleService';
import { BackdropImage, PosterImage, Avatar } from '@/components/PosterImage';
import { RatingRing } from '@/components/RatingRing';
import { StarInput } from '@/components/StarInput';
import { Carousel } from '@/components/Carousel';
import { Footer } from '@/components/Footer';
import { SkeletonDetail } from '@/components/Skeletons';
import { useWatchlist } from '@/context/WatchlistContext';
import { useToast } from '@/context/ToastContext';
import type { Review } from '@/types';

type Tab = 'overview' | 'cast' | 'episodes' | 'reviews' | 'similar' | 'details';

const tabs: { id: Tab; label: string; seriesOnly?: boolean }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'cast', label: 'Cast & Crew' },
  { id: 'episodes', label: 'Episodes', seriesOnly: true },
  { id: 'reviews', label: 'Reviews' },
  { id: 'similar', label: 'Similar Titles' },
  { id: 'details', label: 'Trivia & Details' },
];

export function TitleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const title = id ? titleService.getTitleById(id) : undefined;
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<Awaited<ReturnType<typeof aiService.summarizeReviews>> | null>(null);
  const [loading, setLoading] = useState(true);
  const { isInWatchlist, toggleWatchlist, isWatched, toggleWatched, rateTitle, getRating } = useWatchlist();
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    setAiSummary(null);
    setActiveTab('overview');
    if (!id) return;
    aiService.summarizeReviews(id).then((data) => {
      setAiSummary(data);
      setLoading(false);
    });
  }, [id]);

  if (!title) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950 pt-16">
        <div className="text-center">
          <p className="text-xl text-white/60">Title not found</p>
          <Link to="/" className="text-brand-cyan hover:text-brand-violet transition mt-2 inline-block">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950">
        <SkeletonDetail />
      </div>
    );
  }

  const inList = isInWatchlist(title.id);
  const watched = isWatched(title.id);
  const userRating = getRating(title.id);
  const reviews = titleService.getReviews(title.id);
  const similar = titleService.getSimilar(title.id);
  const distribution = titleService.getRatingDistribution(title.id);
  const aiScoreData = aiService.computeAIScore(title.id);
  const episodes = title.type === 'series' ? titleService.getEpisodes(title.id) : [];
  const availableTabs = tabs.filter((t) => !t.seriesOnly || title.type === 'series');
  const maxDist = Math.max(...distribution);

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Backdrop Header */}
      <div className="relative h-[55vh] min-h-[400px] w-full overflow-hidden">
        <BackdropImage title={title} className="w-full h-full" />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/50 to-transparent" />
      </div>

      <div className="relative -mt-48 px-6 lg:px-12 pb-8 z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Poster */}
          <div className="shrink-0 mx-auto lg:mx-0">
            <PosterImage title={title} className="w-40 h-60 sm:w-48 sm:h-72 rounded-2xl shadow-card-hover" />
          </div>

          {/* Main Info */}
          <div className="flex-1 flex flex-col justify-end">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {title.tagline && <p className="text-brand-cyan text-sm font-medium italic mb-2">{title.tagline}</p>}
              <h1 className="font-hero text-4xl sm:text-5xl lg:text-6xl text-white leading-none mb-3">{title.name}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/60 mb-4">
                <span>{title.year}</span>
                <span className="text-white/30">•</span>
                <span>{title.type === 'series' ? `${title.seasons} Season${(title.seasons ?? 0) > 1 ? 's' : ''} • ${title.episodes} Episodes` : `${title.runtime}m`}</span>
                <span className="text-white/30">•</span>
                <span className="border border-white/25 px-1.5 rounded text-xs">{title.maturity}</span>
                <span className="text-white/30">•</span>
                <span>{title.genres.join(', ')}</span>
              </div>

              {/* Action Row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 bg-white text-ink-950 font-semibold px-5 py-2.5 rounded-xl hover:bg-white/90 transition"
                >
                  <Play className="w-5 h-5 fill-ink-950" /> Watch Trailer
                </button>
                <button
                  onClick={() => { toggleWatchlist(title.id); showToast(inList ? 'Removed from My List' : 'Added to My List'); }}
                  className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition border ${inList ? 'bg-brand-gradient text-white border-transparent' : 'glass text-white border-white/10 hover:bg-white/20'}`}
                >
                  {inList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {inList ? 'In My List' : 'My List'}
                </button>
                <button
                  onClick={() => { toggleWatched(title.id); showToast(watched ? 'Marked as not watched' : 'Marked as watched'); }}
                  className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition border ${watched ? 'bg-white/15 text-white border-white/20' : 'glass text-white border-white/10 hover:bg-white/20'}`}
                >
                  {watched ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  {watched ? 'Watched' : 'Mark Watched'}
                </button>
                <button onClick={() => showToast('Link copied to clipboard')} className="flex items-center gap-2 glass text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/20 transition border border-white/10">
                  <Share2 className="w-5 h-5" /> Share
                </button>
                <button onClick={() => showToast('Added to custom list')} className="flex items-center gap-2 glass text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/20 transition border border-white/10">
                  <ListPlus className="w-5 h-5" /> List
                </button>
              </div>
            </motion.div>
          </div>

          {/* Rating Panel */}
          <div className="glass rounded-2xl p-5 lg:w-72 shrink-0">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Ratings & Scores</h3>
            <div className="flex items-center justify-around gap-2 mb-4">
              <RatingRing value={title.imdbLikeRating} max={10} size={70} label="CineSense" sublabel={`${(title.votes / 1000).toFixed(0)}K votes`} color="#F5C518" />
              <RatingRing value={title.criticScore} max={100} size={70} label="Critic" color="#22D3EE" />
              <RatingRing value={aiScoreData.score} max={100} size={70} label="AI Score" color="#7C5CFF" />
            </div>

            <div className="relative group mb-4">
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Info className="w-3 h-3" />
                <span>How is the AI Score computed?</span>
              </div>
              <div className="absolute bottom-full left-0 mb-2 w-64 glass-strong rounded-xl p-3 text-xs text-white/70 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30">
                <p className="mb-2 font-semibold text-white">AI Score Breakdown</p>
                {aiScoreData.breakdown.map((b) => (
                  <div key={b.label} className="flex justify-between mb-1">
                    <span>{b.label}</span>
                    <span className="tabular-nums">{b.value}/100 (×{b.weight})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-white/50 mb-2">Your rating</p>
              <StarInput value={userRating ?? 0} onChange={(v) => { rateTitle(title.id, v); showToast(`Rated ${title.name} ${v}/10`); }} size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 lg:px-12 mt-4">
        <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto no-scrollbar">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gradient rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 lg:px-12 mt-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab
                title={title}
                synopsis={title.synopsis}
                distribution={distribution}
                maxDist={maxDist}
                aiSummary={aiSummary}
              />
            )}
            {activeTab === 'cast' && <CastTab title={title} />}
            {activeTab === 'episodes' && title.type === 'series' && <EpisodesTab episodes={episodes} />}
            {activeTab === 'reviews' && (
              <ReviewsTab reviews={reviews} onWriteReview={() => setReviewModalOpen(true)} />
            )}
            {activeTab === 'similar' && (
              <div className="-mx-6 lg:-mx-12">
                <Carousel titles={similar} />
              </div>
            )}
            {activeTab === 'details' && <DetailsTab title={title} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {trailerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTrailerOpen(false)}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden glass-strong relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setTrailerOpen(false)} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/20 transition">
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="w-full h-full flex items-center justify-center bg-ink-950">
                <div className="text-center">
                  <Play className="w-16 h-16 text-white/30 mx-auto mb-3 fill-white/20" />
                  <p className="text-white/60">Trailer for {title.name}</p>
                  <p className="text-white/30 text-sm mt-1">Video embed placeholder</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Write Review Modal */}
      <AnimatePresence>
        {reviewModalOpen && (
          <WriteReviewModal
            titleName={title.name}
            onClose={() => setReviewModalOpen(false)}
            onSubmit={(review) => {
              showToast('Review submitted!');
              setReviewModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

function OverviewTab({ title, synopsis, distribution, maxDist, aiSummary }: {
  title: ReturnType<typeof titleService.getTitleById>;
  synopsis: string;
  distribution: number[];
  maxDist: number;
  aiSummary: Awaited<ReturnType<typeof aiService.summarizeReviews>> | null;
}) {
  if (!title) return null;
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Synopsis */}
        <div>
          <h3 className="text-lg font-display font-semibold text-white/90 mb-2">Synopsis</h3>
          <p className="text-white/70 leading-relaxed">{synopsis}</p>
        </div>

        {/* AI Review Summary */}
        {aiSummary && (
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white">AI Review Summary</h3>
              <span className="text-xs text-white/40">— What viewers say</span>
            </div>

            <p className="text-sm text-white/70 leading-relaxed mb-4">{aiSummary.summary}</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Pros
                </p>
                <ul className="space-y-1">
                  {aiSummary.pros.map((p) => (
                    <li key={p} className="text-xs text-white/60 flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">+</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-400 mb-2 flex items-center gap-1">
                  <TrendingDown /> Cons
                </p>
                <ul className="space-y-1">
                  {aiSummary.cons.map((c) => (
                    <li key={c} className="text-xs text-white/60 flex items-start gap-1.5">
                      <span className="text-rose-400 mt-0.5">−</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Themes */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {aiSummary.themes.map((t) => (
                <span key={t} className="text-xs bg-brand-gradient-soft border border-white/10 px-2.5 py-1 rounded-full text-white/80">{t}</span>
              ))}
            </div>

            {/* Sentiment Gauge */}
            <div>
              <p className="text-xs text-white/50 mb-2">Audience Sentiment</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 rounded-full overflow-hidden flex bg-white/5">
                  <div className="bg-emerald-500" style={{ width: `${aiSummary.sentiment.positive}%` }} />
                  <div className="bg-white/20" style={{ width: `${aiSummary.sentiment.neutral}%` }} />
                  <div className="bg-rose-500" style={{ width: `${aiSummary.sentiment.negative}%` }} />
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-400">{aiSummary.sentiment.positive}%</span>
                  <span className="text-white/40">{aiSummary.sentiment.neutral}%</span>
                  <span className="text-rose-400">{aiSummary.sentiment.negative}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Where to Watch */}
        <div>
          <h3 className="text-lg font-display font-semibold text-white/90 mb-3">Where to Watch</h3>
          <div className="flex flex-wrap gap-2">
            {title.providers.map((p) => (
              <div key={p} className="glass rounded-xl px-4 py-3 flex items-center gap-2">
                <Play className="w-4 h-4 text-brand-cyan" />
                <span className="text-sm font-medium text-white">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar: Rating Distribution */}
      <div className="space-y-6">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4">Rating Distribution</h3>
          <div className="space-y-1.5">
            {distribution.map((count, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-white/40 w-6 text-right tabular-nums">{i + 1}</span>
                <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(count / maxDist) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="h-full rounded bg-gradient-to-r from-brand-violet to-brand-cyan"
                  />
                </div>
                <span className="text-xs text-white/40 w-8 tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Facts */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-3">Quick Facts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Type</span>
              <span className="text-white/70 capitalize">{title.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Year</span>
              <span className="text-white/70">{title.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 flex items-center gap-1"><Clock className="w-3 h-3" /> Runtime</span>
              <span className="text-white/70">{title.type === 'series' ? `${title.seasons} seasons` : `${title.runtime}m`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 flex items-center gap-1"><Calendar className="w-3 h-3" /> Maturity</span>
              <span className="text-white/70">{title.maturity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Languages</span>
              <span className="text-white/70">{title.languages.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Votes</span>
              <span className="text-white/70 tabular-nums">{title.votes.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CastTab({ title }: { title: NonNullable<ReturnType<typeof titleService.getTitleById>> }) {
  return (
    <div>
      <h3 className="text-lg font-display font-semibold text-white/90 mb-4">Cast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {title.cast.map((member) => (
          <div key={member.id} className="group glass rounded-xl p-4 text-center hover:bg-white/10 transition cursor-pointer">
            <Avatar colors={member.avatarColors} name={member.name} size={64} />
            <p className="text-sm font-medium text-white mt-2 truncate">{member.name}</p>
            <p className="text-xs text-white/40 truncate">{member.role}</p>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-display font-semibold text-white/90 mb-4">Crew</h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {title.crew.map((member) => (
          <div key={member.id} className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white/30" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{member.name}</p>
              <p className="text-xs text-white/40">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EpisodesTab({ episodes }: { episodes: ReturnType<typeof titleService.getEpisodes> }) {
  const seasons = Array.from(new Set(episodes.map((e) => e.season)));
  const [activeSeason, setActiveSeason] = useState(seasons[0] ?? 1);
  const seasonEps = episodes.filter((e) => e.season === activeSeason);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <select
            value={activeSeason}
            onChange={(e) => setActiveSeason(Number(e.target.value))}
            className="appearance-none bg-white/10 text-white text-sm font-medium px-4 py-2 pr-8 rounded-lg border border-white/10 focus-ring"
          >
            {seasons.map((s) => (
              <option key={s} value={s} className="bg-ink-900">Season {s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
        </div>
        <span className="text-sm text-white/40">{seasonEps.length} episodes</span>
      </div>

      {/* Heat map grid */}
      <div className="glass rounded-xl p-4 mb-4">
        <p className="text-xs text-white/50 mb-2">Episode Rating Heat Map</p>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-1">
          {seasonEps.map((ep) => {
            const intensity = Math.min(ep.rating / 10, 1);
            return (
              <div
                key={ep.id}
                className="aspect-square rounded text-[10px] flex items-center justify-center text-white/80 font-medium"
                style={{ background: `rgba(124, 92, 255, ${0.2 + intensity * 0.6})` }}
                title={`${ep.title}: ${ep.rating}`}
              >
                {ep.rating}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {seasonEps.map((ep) => (
          <div key={ep.id} className="glass rounded-xl p-4 flex items-start gap-4 hover:bg-white/10 transition">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center font-display font-bold text-lg text-white/60">
              {ep.number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-white truncate">{ep.title}</p>
                <span className="flex items-center gap-0.5 text-xs text-gold font-bold">
                  <Star className="w-3 h-3 fill-gold" /> {ep.rating}
                </span>
              </div>
              <p className="text-xs text-white/50 mb-1">{ep.airDate}</p>
              <p className="text-xs text-white/60 line-clamp-2">{ep.synopsis}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsTab({ reviews, onWriteReview }: { reviews: Review[]; onWriteReview: () => void }) {
  const [sortBy, setSortBy] = useState<'helpful' | 'newest' | 'highest' | 'lowest'>('helpful');
  const [spoilerRevealed, setSpoilerRevealed] = useState<Record<string, boolean>>({});

  const sorted = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest': return b.createdAt.localeCompare(a.createdAt);
      case 'highest': return b.rating - a.rating;
      case 'lowest': return a.rating - b.rating;
      default: return b.helpfulCount - a.helpfulCount;
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white/90">Reviews ({reviews.length})</h3>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="appearance-none bg-white/10 text-white text-xs font-medium px-3 py-2 pr-8 rounded-lg border border-white/10 focus-ring"
          >
            <option value="helpful" className="bg-ink-900">Most Helpful</option>
            <option value="newest" className="bg-ink-900">Newest</option>
            <option value="highest" className="bg-ink-900">Highest Rated</option>
            <option value="lowest" className="bg-ink-900">Lowest Rated</option>
          </select>
          <button onClick={onWriteReview} className="bg-brand-gradient text-white text-sm font-semibold px-4 py-2 rounded-lg hover:shadow-glow transition">
            Write a Review
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((review) => (
          <div key={review.id} className="glass rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Avatar colors={review.userAvatarColors} name={review.userName} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white">{review.userName}</p>
                  <span className="flex items-center gap-0.5 text-xs text-gold font-bold">
                    <Star className="w-3 h-3 fill-gold" /> {review.rating}/10
                  </span>
                  <span className="text-xs text-white/30 ml-auto">{review.createdAt}</span>
                </div>
                {review.spoiler && !spoilerRevealed[review.id] ? (
                  <button
                    onClick={() => setSpoilerRevealed((prev) => ({ ...prev, [review.id]: true }))}
                    className="w-full text-left text-sm text-white/40 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition"
                  >
                    ⚠ This review contains spoilers. Click to reveal.
                  </button>
                ) : (
                  <p className="text-sm text-white/70 leading-relaxed">{review.text}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <button className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition">
                    <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({review.helpfulCount})
                  </button>
                  <button className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition">
                    <ThumbsDown className="w-3.5 h-3.5" /> ({review.notHelpfulCount})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">No reviews yet. Be the first to write one!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailsTab({ title }: { title: NonNullable<ReturnType<typeof titleService.getTitleById>> }) {
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-3">Technical Details</h3>
        <div className="space-y-2 text-sm">
          {[
            ['Title', title.name],
            ['Type', title.type === 'series' ? 'TV Series' : 'Movie'],
            ['Year', String(title.year)],
            ['Runtime', title.type === 'series' ? `${title.seasons} seasons, ${title.episodes} episodes` : `${title.runtime} min`],
            ['Maturity Rating', title.maturity],
            ['Languages', title.languages.join(', ')],
            ['Streaming On', title.providers.join(', ')],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-white/40">{label}</span>
              <span className="text-white/70 text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-3">Trivia</h3>
        <ul className="space-y-3 text-sm text-white/60">
          <li className="flex gap-2"><Lightbulb className="w-4 h-4 text-brand-violet shrink-0 mt-0.5" /> The production used over 200 unique set pieces, making it one of the most detailed builds of the year.</li>
          <li className="flex gap-2"><Lightbulb className="w-4 h-4 text-brand-violet shrink-0 mt-0.5" /> The lead actor performed their own stunts in the climactic sequence.</li>
          <li className="flex gap-2"><Lightbulb className="w-4 h-4 text-brand-violet shrink-0 mt-0.5" /> The score was recorded with a 60-piece orchestra over three sessions.</li>
        </ul>
      </div>
    </div>
  );
}

function WriteReviewModal({ titleName, onClose, onSubmit }: { titleName: string; onClose: () => void; onSubmit: (review: { rating: number; text: string; spoiler: boolean }) => void }) {
  const [rating, setRating] = useState(7);
  const [text, setText] = useState('');
  const [spoiler, setSpoiler] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-strong rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-semibold text-white">Write a Review — {titleName}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-white/50 mb-2">Your Rating</p>
          <StarInput value={rating} onChange={setRating} size={26} />
        </div>

        <div className="mb-4">
          <p className="text-sm text-white/50 mb-2">Your Review</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Share your thoughts..."
            className="w-full bg-white/5 text-white text-sm rounded-xl p-3 outline-none focus:bg-white/10 transition resize-none placeholder-white/30"
          />
        </div>

        <label className="flex items-center gap-2 mb-4 text-sm text-white/60 cursor-pointer">
          <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} className="accent-brand-violet" />
          Contains spoilers
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-white/60 hover:text-white transition">Cancel</button>
          <button
            onClick={() => onSubmit({ rating, text, spoiler })}
            disabled={!text.trim()}
            className="bg-brand-gradient text-white text-sm font-semibold px-5 py-2 rounded-lg disabled:opacity-40 hover:shadow-glow transition"
          >
            Submit Review
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TrendingDown({ className = '' }: { className?: string }) {
  return <span className={className}>↓</span>;
}
