import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Heart, X, Check, Shield, Lock, Eye,
  Star, ChevronRight, ArrowRight, Search, UserCheck, Film, Tv
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { titleService } from '@/services/titleService';
import { PosterImage, Avatar } from '@/components/PosterImage';
import { Footer } from '@/components/Footer';
import type { Friend } from '@/types';

export function FriendTastePage() {
  const {
    user, isLoggedIn, friends, sendFriendRequest,
    acceptFriendRequest, declineFriendRequest, removeFriend,
    loginAsDemo, updatePrivacy,
  } = useUser();
  const { showToast } = useToast();

  const [addName, setAddName] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'privacy'>('friends');

  const allTitles = useMemo(() => titleService.getAllTitles(), []);

  const connectedFriends = friends.filter((f) => f.status === 'connected');
  const pendingReceived = friends.filter((f) => f.status === 'pending_received');
  const pendingSent = friends.filter((f) => f.status === 'pending_sent');

  const handleSendRequest = () => {
    const name = addName.trim();
    if (!name) { showToast('Enter a name to send a friend request'); return; }
    sendFriendRequest(name);
    showToast(`Friend request sent to ${name}!`);
    setAddName('');
  };

  const handleAccept = (f: Friend) => {
    acceptFriendRequest(f.id);
    showToast(`You are now connected with ${f.name}!`);
  };

  const handleDecline = (f: Friend) => {
    declineFriendRequest(f.id);
    showToast(`Declined request from ${f.name}`);
  };

  const handleRemove = (f: Friend) => {
    removeFriend(f.id);
    showToast(`Removed ${f.name} from friends`);
  };

  // ── Login gate ───────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-ink-950 pt-20 flex flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-brand-gradient flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-hero text-white mb-3">Taste of Friends</h1>
          <p className="text-white/50 mb-6 text-sm leading-relaxed">
            Connect with friends on WatchNext, discover shared interests, and get recommendations based on what people you trust enjoy watching.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/auth" className="py-3 px-6 rounded-xl bg-brand-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-glow transition">
              <ArrowRight className="w-4 h-4" /> Sign In to WatchNext
            </Link>
            <button onClick={loginAsDemo} className="py-2.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition">
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-brand-gradient shadow-glow">
                <Users className="w-5 h-5 text-white" />
              </span>
              <h1 className="text-3xl font-hero text-white leading-none">Taste of Friends</h1>
            </div>
            <p className="text-sm text-white/50">
              Discover shared movie and series interests with people you know.
            </p>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="flex items-start gap-3 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl p-4 mb-6">
          <Shield className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
          <p className="text-xs text-white/70 leading-relaxed">
            <strong className="text-white">Your privacy is protected.</strong> Friends can only see information you choose to share. Private searches, watch history, and Bucket List items remain private unless you explicitly enable sharing in Privacy Settings.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'friends', label: `Friends (${connectedFriends.length})` },
            { id: 'pending', label: `Requests${pendingReceived.length > 0 ? ` (${pendingReceived.length})` : ''}` },
            { id: 'privacy', label: 'Privacy Settings' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                activeTab === id ? 'bg-brand-gradient text-white shadow-glow' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Add Friend ───────────────────────────────────────────────────── */}
        <div className="glass-strong rounded-2xl border border-white/10 p-5 mb-6">
          <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-brand-cyan" /> Add a Friend
          </p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-brand-cyan transition">
              <Search className="w-4 h-4 text-white/40 shrink-0" />
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                placeholder="Enter friend's name or WatchNext username…"
                className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
              />
            </div>
            <button
              onClick={handleSendRequest}
              className="px-4 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold hover:shadow-glow transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Send Request</span>
            </button>
          </div>
        </div>

        {/* ── FRIENDS TAB ──────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === 'friends' && (
            <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {connectedFriends.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-white/15 mx-auto mb-4" />
                  <p className="text-white/40 text-sm">No friends connected yet.</p>
                  <p className="text-white/30 text-xs mt-1">Send a friend request above to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectedFriends.map((friend) => (
                    <FriendCard
                      key={friend.id}
                      friend={friend}
                      allTitles={allTitles}
                      onRemove={() => handleRemove(friend)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── PENDING TAB ────────────────────────────────────────────────── */}
          {activeTab === 'pending' && (
            <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {pendingReceived.length === 0 && pendingSent.length === 0 ? (
                <div className="text-center py-16">
                  <Check className="w-12 h-12 text-white/15 mx-auto mb-4" />
                  <p className="text-white/40 text-sm">No pending requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReceived.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Incoming Requests</p>
                      <div className="space-y-3">
                        {pendingReceived.map((f) => (
                          <div key={f.id} className="glass-strong rounded-xl p-4 border border-brand-cyan/20 flex items-center gap-4">
                            <Avatar colors={f.avatarColors} name={f.name} size={40} />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white text-sm">{f.name}</p>
                              <p className="text-xs text-white/40">Wants to connect with you</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleAccept(f)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gradient text-white text-xs font-semibold rounded-lg hover:shadow-glow transition"
                              >
                                <Check className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => handleDecline(f)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition"
                              >
                                <X className="w-3.5 h-3.5" /> Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pendingSent.length > 0 && (
                    <div className="mt-6">
                      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Sent Requests</p>
                      <div className="space-y-3">
                        {pendingSent.map((f) => (
                          <div key={f.id} className="glass-strong rounded-xl p-4 border border-white/10 flex items-center gap-4">
                            <Avatar colors={f.avatarColors} name={f.name} size={40} />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white text-sm">{f.name}</p>
                              <p className="text-xs text-white/40">Request pending…</p>
                            </div>
                            <button
                              onClick={() => handleRemove(f)}
                              className="text-xs text-white/40 hover:text-red-400 transition px-3 py-1.5 rounded-lg bg-white/5"
                            >
                              Cancel
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── PRIVACY TAB ────────────────────────────────────────────────── */}
          {activeTab === 'privacy' && (
            <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-strong rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Lock className="w-4 h-4 text-brand-cyan" />
                  <h2 className="font-semibold text-white">Sharing & Privacy</h2>
                </div>
                <div className="space-y-5">
                  {[
                    {
                      key: 'shareBucketList' as const,
                      label: 'Share Bucket List',
                      desc: 'Allow connected friends to see titles on your Bucket List',
                      icon: <Eye className="w-4 h-4" />,
                    },
                    {
                      key: 'shareWatchHistory' as const,
                      label: 'Share Watch History',
                      desc: 'Allow friends to see titles you\'ve marked as watched',
                      icon: <Film className="w-4 h-4" />,
                    },
                    {
                      key: 'shareRatings' as const,
                      label: 'Share My Ratings',
                      desc: 'Allow friends to see your personal star ratings',
                      icon: <Star className="w-4 h-4" />,
                    },
                  ].map(({ key, label, desc, icon }) => (
                    <div key={key} className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-white/40 mt-0.5">{icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">{label}</p>
                          <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updatePrivacy(key, !user.privacySettings[key]);
                          showToast(`${label} ${!user.privacySettings[key] ? 'enabled' : 'disabled'}`);
                        }}
                        className={`relative w-11 h-6 rounded-full transition shrink-0 ${
                          user.privacySettings[key] ? 'bg-brand-violet' : 'bg-white/15'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            user.privacySettings[key] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/30 mt-6 leading-relaxed border-t border-white/10 pt-4">
                  Private search history, private notes, and account information are never shared regardless of these settings.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}

function FriendCard({ friend, allTitles, onRemove }: {
  friend: Friend;
  allTitles: ReturnType<typeof titleService.getAllTitles>;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const sharedTitles = useMemo(() => {
    if (!friend.publicBucketList?.length) return [];
    return friend.publicBucketList
      .map((id) => allTitles.find((t) => t.id === id))
      .filter(Boolean) as typeof allTitles;
  }, [friend.publicBucketList, allTitles]);

  return (
    <motion.div
      layout
      className="glass-strong rounded-2xl border border-white/10 overflow-hidden"
    >
      <div className="flex items-center gap-4 p-4">
        <Avatar colors={friend.avatarColors} name={friend.name} size={44} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white text-sm">{friend.name}</p>
            <span className="flex items-center gap-1 text-[10px] text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full">
              <UserCheck className="w-2.5 h-2.5" /> Connected
            </span>
          </div>
          {friend.sharedGenres && friend.sharedGenres.length > 0 && (
            <p className="text-xs text-white/40 mt-0.5">
              Shared interests: {friend.sharedGenres.join(', ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {sharedTitles.length > 0 && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xs text-brand-cyan hover:text-white flex items-center gap-1 transition"
            >
              <Film className="w-3.5 h-3.5" />
              {sharedTitles.length} shared
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition"
            title="Remove friend"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && sharedTitles.length > 0 && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-4">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                {friend.name}'s Shared Titles
              </p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {sharedTitles.map((t) => (
                  <Link
                    key={t.id}
                    to={`/title/${t.id}`}
                    className="shrink-0 group"
                  >
                    <PosterImage title={t} className="w-20 h-28 rounded-xl shadow-md group-hover:scale-105 transition" />
                    <p className="text-[10px] text-white/60 mt-1 text-center w-20 truncate">{t.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default FriendTastePage;
