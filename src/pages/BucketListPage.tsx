import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListChecks, Sparkles, Trash2, Star, Play, ChevronDown, ChevronUp,
  Search, Filter, Wand2, ArrowRight, X, Check, Loader2, Globe
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { titleService, aiService } from '@/services/titleService';
import { PosterImage } from '@/components/PosterImage';
import { TrailerModal } from '@/components/TrailerModal';
import { Footer } from '@/components/Footer';
import type { Title } from '@/types';

type SortMode = 'ai-match' | 'rating' | 'newest' | 'oldest' | 'added';
type FilterMode = 'all' | 'movie' | 'series';

const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Must Watch', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  2: { label: 'High Priority', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  3: { label: 'Eventually', color: 'text-white/50 bg-white/5 border-white/10' },
};

export function BucketListPage() {
  const {
    bucketList, isLoggedIn, removeFromBucketList,
    updateBucketListPriority, tasteProfile, user, loginAsDemo,
  } = useUser();
  const { showToast } = useToast();

  const [sortMode, setSortMode] = useState<SortMode>('added');
  const [filterType, setFilterType] = useState<FilterMode>('all');
  const [searchQ, setSearchQ] = useState('');
  const [aiRequest, setAiRequest] = useState('');
  const [aiResult, setAiResult] = useState<{
    topPick: Title; reason: string;
    allRanked: { title: Title; score: number; reason: string }[];
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [trailerTitle, setTrailerTitle] = useState<Title | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Resolve bucket list title objects
  const allTitles = useMemo(() => titleService.getAllTitles(), []);

  const bucketListTitles = useMemo(() => {
    return bucketList
      .map((item) => {
        const title = allTitles.find((t) => t.id === item.titleId);
        return title ? { item, title } : null;
      })
      .filter(Boolean) as { item: typeof bucketList[0]; title: Title }[];
  }, [bucketList, allTitles]);

  // Filter + sort
  const displayedTitles = useMemo(() => {
    let list = [...bucketListTitles];

    if (filterType !== 'all') {
      list = list.filter((e) => e.title.type === filterType);
    }
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter((e) =>
        e.title.name.toLowerCase().includes(q) ||
        e.title.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    switch (sortMode) {
      case 'rating':
        list.sort((a, b) => b.title.imdbLikeRating - a.title.imdbLikeRating);
        break;
      case 'newest':
        list.sort((a, b) => b.title.year - a.title.year);
        break;
      case 'oldest':
        list.sort((a, b) => a.title.year - b.title.year);
        break;
      case 'ai-match':
        list.sort((a, b) => (b.title.aiMatch ?? 0) - (a.title.aiMatch ?? 0));
        break;
      case 'added':
      default:
        list.sort((a, b) => new Date(b.item.addedAt).getTime() - new Date(a.item.addedAt).getTime());
        break;
    }

    return list;
  }, [bucketListTitles, filterType, searchQ, sortMode]);

  const handleAskAI = useCallback(async () => {
    if (bucketListTitles.length === 0) {
      showToast('Add some titles to your Bucket List first!');
      return;
    }
    setAiLoading(true);
    setShowAiPanel(true);
    try {
      const result = await aiService.analyzeBucketList(
        bucketListTitles.map((e) => e.title),
        aiRequest,
        tasteProfile
      );
      setAiResult(result);
    } catch {
      showToast('AI analysis failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }, [bucketListTitles, aiRequest, tasteProfile, showToast]);

  const handleRemove = useCallback((titleId: string, titleName: string) => {
    removeFromBucketList(titleId);
    showToast(`Removed "${titleName}" from your Bucket List`);
    if (aiResult?.topPick?.id === titleId) setAiResult(null);
  }, [removeFromBucketList, showToast, aiResult]);

  // ── Login gate ───────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-ink-950 pt-20 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-3xl bg-brand-gradient flex items-center justify-center mx-auto mb-6 shadow-glow">
            <ListChecks className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-hero text-white mb-3">Your Bucket List</h1>
          <p className="text-white/50 mb-6 text-sm leading-relaxed">
            Sign in to save movies and series to your personal Bucket List, get AI-powered watch order recommendations, and track your cinema journey.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/auth"
              className="py-3 px-6 rounded-xl bg-brand-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-glow transition"
            >
              <ArrowRight className="w-4 h-4" /> Sign In to WatchNext
            </Link>
            <button
              onClick={loginAsDemo}
              className="py-2.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition"
            >
              Try with Demo Account
            </button>
          </div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-brand-gradient shadow-glow">
                <ListChecks className="w-5 h-5 text-white" />
              </span>
              <h1 className="text-3xl sm:text-4xl font-hero text-white leading-none">My Bucket List</h1>
              <span className="ml-1 bg-white/10 text-white/60 text-xs font-bold px-2.5 py-1 rounded-full border border-white/10">
                {bucketListTitles.length}
              </span>
            </div>
            <p className="text-sm text-white/50">
              {user.name}'s personal watchlist · Sorted by {sortMode === 'added' ? 'date added' : sortMode}
            </p>
          </div>
          <Link
            to="/browse"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition"
          >
            <Search className="w-4 h-4" /> Browse &amp; Add More
          </Link>
        </div>

        {/* ── AI PANEL ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl border border-brand-violet/30 mb-8 overflow-hidden shadow-xl"
        >
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="w-5 h-5 text-brand-violet" />
              <h2 className="font-semibold text-white text-base">What Should I Watch First?</h2>
              <span className="text-[10px] bg-brand-gradient text-white px-2 py-0.5 rounded-full font-bold shadow-glow">AI</span>
            </div>
            <p className="text-xs text-white/50 mb-4">
              Tell WatchNext AI your current mood or what you're looking for, and it will analyze your entire Bucket List to recommend the perfect watch.
            </p>

            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-brand-cyan transition">
                <Sparkles className="w-4 h-4 text-brand-violet shrink-0" />
                <input
                  type="text"
                  value={aiRequest}
                  onChange={(e) => setAiRequest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                  placeholder="e.g. I want something emotional and deep tonight…"
                  className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
                />
                {aiRequest && (
                  <button onClick={() => setAiRequest('')} className="text-white/30 hover:text-white transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={handleAskAI}
                disabled={aiLoading || bucketListTitles.length === 0}
                className="px-4 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold flex items-center gap-2 hover:shadow-glow transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span className="hidden sm:inline">Ask WatchNext AI</span>
                <span className="sm:hidden">Ask</span>
              </button>
            </div>

            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                'I want something emotional and deep',
                'Give me a quick movie for tonight',
                'I want a dark thriller',
                'I\'m in the mood for sci-fi',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setAiRequest(prompt); }}
                  className="text-xs bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-full border border-white/10 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* AI Result */}
          <AnimatePresence>
            {showAiPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/10 overflow-hidden"
              >
                <div className="p-5">
                  {aiLoading ? (
                    <div className="flex items-center gap-3 py-4">
                      <Loader2 className="w-5 h-5 text-brand-cyan animate-spin" />
                      <p className="text-sm text-white/60">WatchNext AI is analyzing your Bucket List…</p>
                    </div>
                  ) : aiResult ? (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Check className="w-4 h-4 text-brand-cyan" />
                        <p className="text-sm font-semibold text-white">AI Recommendation</p>
                      </div>

                      {/* Top pick */}
                      <div className="flex gap-4 bg-brand-violet/10 border border-brand-violet/20 rounded-xl p-4 mb-4">
                        <Link to={`/title/${aiResult.topPick.id}`} className="shrink-0">
                          <PosterImage title={aiResult.topPick} className="w-20 h-28 rounded-lg shadow-md" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2 mb-1.5">
                            <span className="text-[10px] bg-brand-gradient text-white px-2 py-0.5 rounded-full font-bold shadow-glow shrink-0">
                              #1 WATCH NEXT
                            </span>
                          </div>
                          <Link to={`/title/${aiResult.topPick.id}`}>
                            <h3 className="font-display font-bold text-white text-lg hover:text-brand-cyan transition leading-tight">
                              {aiResult.topPick.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-white/50 my-1.5">
                            <Star className="w-3 h-3 fill-gold text-gold" />
                            <span className="text-gold font-bold">{aiResult.topPick.imdbLikeRating}</span>
                            <span>·</span>
                            <span>{aiResult.topPick.year}</span>
                            <span>·</span>
                            <span>{aiResult.topPick.type === 'series' ? 'Series' : 'Movie'}</span>
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed">
                            {aiResult.reason.replace(/\*\*/g, '')}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => setTrailerTitle(aiResult.topPick)}
                              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition"
                            >
                              <Play className="w-3 h-3 fill-white" /> Trailer
                            </button>
                            <Link
                              to={`/title/${aiResult.topPick.id}`}
                              className="flex items-center gap-1.5 text-xs bg-brand-gradient text-white px-3 py-1.5 rounded-lg hover:shadow-glow transition"
                            >
                              View Details <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Rankings list */}
                      {aiResult.allRanked.length > 1 && (
                        <div>
                          <p className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Full Rankings</p>
                          <div className="space-y-1.5">
                            {aiResult.allRanked.slice(1).map(({ title, reason }, idx) => (
                              <div key={title.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
                                <span className="text-sm font-bold text-white/30 w-5 shrink-0">#{idx + 2}</span>
                                <PosterImage title={title} className="w-9 h-12 rounded shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <Link to={`/title/${title.id}`} className="text-sm font-semibold text-white hover:text-brand-cyan transition truncate block">
                                    {title.name}
                                  </Link>
                                  <p className="text-xs text-white/40 truncate">{reason}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gold shrink-0">
                                  <Star className="w-3 h-3 fill-gold" /> {title.imdbLikeRating}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Filters & Sort ────────────────────────────────────────────────── */}
        {bucketListTitles.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-brand-cyan transition flex-1 min-w-[180px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search your list…"
                className="bg-transparent text-xs text-white placeholder-white/30 outline-none w-full"
              />
            </div>

            {/* Type filter */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5">
              {(['all', 'movie', 'series'] as FilterMode[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${filterType === f ? 'bg-brand-gradient text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
                >
                  {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'Series'}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-white/40" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-ink-900 text-xs text-white/80 border border-white/10 rounded-xl px-3 py-2 focus-ring cursor-pointer"
              >
                <option value="added">Recently Added</option>
                <option value="ai-match">Best AI Match</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        )}

        {/* ── Empty State ───────────────────────────────────────────────────── */}
        {bucketListTitles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
              <ListChecks className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Your Bucket List is empty</h2>
            <p className="text-sm text-white/40 mb-6 max-w-sm mx-auto">
              Start adding movies and series you want to watch. WatchNext AI will help you decide what to watch first.
            </p>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-gradient text-white font-semibold text-sm hover:shadow-glow transition"
            >
              <Search className="w-4 h-4" /> Browse Titles
            </Link>
          </motion.div>
        ) : displayedTitles.length === 0 ? (
          <div className="text-center py-12 text-white/40 text-sm">
            No titles match your filter. <button onClick={() => { setSearchQ(''); setFilterType('all'); }} className="text-brand-cyan hover:underline ml-1">Clear filters</button>
          </div>
        ) : (
          /* ── Bucket List Grid ──────────────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {displayedTitles.map(({ item, title }, idx) => (
                <motion.div
                  key={title.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.22, delay: idx * 0.04 }}
                  className="glass-strong rounded-2xl border border-white/10 hover:border-white/20 transition overflow-hidden group"
                >
                  <div className="flex gap-4 p-4">
                    {/* Poster */}
                    <Link to={`/title/${title.id}`} className="shrink-0 focus-ring rounded-xl overflow-hidden">
                      <PosterImage
                        title={title}
                        className="w-24 h-36 sm:w-28 sm:h-40 rounded-xl shadow-md group-hover:scale-105 transition"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Priority Badge */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {item.priority && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${PRIORITY_LABELS[item.priority]?.color}`}>
                              {PRIORITY_LABELS[item.priority]?.label}
                            </span>
                          )}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-white/60`}>
                            {title.type === 'series' ? 'Series' : 'Movie'}
                          </span>
                        </div>

                        <Link to={`/title/${title.id}`}>
                          <h3 className="font-display font-bold text-white text-base leading-tight hover:text-brand-cyan transition line-clamp-1">
                            {title.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-white/50 mt-1 mb-2 flex-wrap">
                          <span className="flex items-center gap-1 text-gold font-bold">
                            <Star className="w-3 h-3 fill-gold" /> {title.imdbLikeRating}
                          </span>
                          <span>·</span>
                          <span>{title.year}</span>
                          <span>·</span>
                          <span>{title.languages[0]}</span>
                          {title.type === 'series' && title.seasons && (
                            <>
                              <span>·</span>
                              <span>{title.seasons}S</span>
                            </>
                          )}
                          {title.type === 'movie' && (
                            <>
                              <span>·</span>
                              <span>{title.runtime}m</span>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {title.genres.slice(0, 3).map((g) => (
                            <span key={g} className="text-[10px] bg-white/8 text-white/70 px-1.5 py-0.5 rounded">
                              {g}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-white/50 line-clamp-2">{title.synopsis}</p>
                      </div>

                      {/* Priority selector + actions */}
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <select
                          value={item.priority ?? 2}
                          onChange={(e) => updateBucketListPriority(title.id, Number(e.target.value))}
                          className="bg-white/5 text-[10px] text-white/60 border border-white/10 rounded-lg px-2 py-1 focus-ring cursor-pointer"
                        >
                          <option value={1}>Must Watch</option>
                          <option value={2}>High Priority</option>
                          <option value={3}>Eventually</option>
                        </select>

                        <button
                          onClick={() => setTrailerTitle(title)}
                          className="flex items-center gap-1 text-[10px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg transition font-semibold"
                        >
                          <Play className="w-3 h-3 fill-white" /> Trailer
                        </button>

                        <button
                          onClick={() => handleRemove(title.id, title.name)}
                          className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg transition font-semibold ml-auto"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Quick stats */}
        {bucketListTitles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: 'Total Titles', value: bucketListTitles.length },
              { label: 'Movies', value: bucketListTitles.filter((e) => e.title.type === 'movie').length },
              { label: 'Series', value: bucketListTitles.filter((e) => e.title.type === 'series').length },
              {
                label: 'Avg Rating',
                value: (
                  bucketListTitles.reduce((s, e) => s + e.title.imdbLikeRating, 0) / bucketListTitles.length
                ).toFixed(1),
              },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-xl p-4 border border-white/8 text-center">
                <p className="text-2xl font-hero text-white mb-1">{value}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <TrailerModal title={trailerTitle} isOpen={Boolean(trailerTitle)} onClose={() => setTrailerTitle(null)} />
      <Footer />
    </div>
  );
}

export default BucketListPage;
