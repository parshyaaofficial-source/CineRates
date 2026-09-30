import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Sparkles,
  Home,
  Film,
  Tv,
  Star,
  Flame,
  ListChecks,
  Users,
  ChevronDown,
  Menu,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import { useUser } from '@/context/UserContext';
import { titleService } from '@/services/titleService';
import { Avatar, PosterImage } from './PosterImage';
import { WatchNextLogo } from './WatchNextLogo';

const navLinks = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Movies', path: '/browse?type=movie', icon: Film },
  { label: 'Series', path: '/browse?type=series', icon: Tv },
  { label: 'Top Rated', path: '/top-charts', icon: Star },
  { label: 'New & Popular', path: '/browse?sort=trending', icon: Flame },
  { label: 'Bucket List', path: '/bucket-list', icon: ListChecks },
  { label: 'Friends', path: '/friends', icon: Users },
];

const initialNotifications = [
  {
    id: 1,
    title: 'Dune: Part Two now available',
    time: '2h ago',
    read: false,
    path: '/title/m-dune-2',
  },
  {
    id: 2,
    title: 'Shōgun sweeps awards season',
    time: '1d ago',
    read: false,
    path: '/title/s-shogun',
  },
  {
    id: 3,
    title: 'Severance Season 2 added to charts',
    time: '2d ago',
    read: true,
    path: '/title/s-severance',
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof titleService.search>>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const { watchlist } = useWatchlist();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setResults(titleService.search(searchQuery).slice(0, 5));
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const modeParam = aiMode ? '&ai=true' : '';
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}${modeParam}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-strong shadow-card' : 'bg-gradient-to-b from-ink-950/95 via-ink-950/70 to-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-4 lg:px-12 h-16 max-w-7xl mx-auto w-full">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/" className="flex items-center focus-ring rounded-lg group">
              <WatchNextLogo size={36} showText={true} />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname + location.search === link.path ||
                      location.pathname === link.path.split('?')[0];

                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all focus-ring ${
                      isActive
                        ? 'text-white bg-white/10 shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Controls */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.form
                    key="search-open"
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleSearch}
                    className="flex items-center gap-2 glass rounded-full px-3 py-1.5 border border-white/15"
                  >
                    <Search className="w-4 h-4 text-white/50 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={aiMode ? 'Ask AI for titles...' : 'Search movies, series...'}
                      className="bg-transparent text-sm text-white placeholder-white/40 outline-none w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setAiMode(!aiMode)}
                      className={`shrink-0 p-1 rounded-full transition ${
                        aiMode ? 'bg-brand-gradient text-white shadow-glow' : 'text-white/40 hover:text-white'
                      }`}
                      title="Toggle AI Search"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="text-white/40 hover:text-white shrink-0 p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.button
                    key="search-closed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSearchOpen(true)}
                    className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition focus-ring"
                    aria-label="Open search"
                  >
                    <Search className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Instant Search Suggestions Dropdown */}
              {searchOpen && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full right-0 mt-2 w-80 glass-strong rounded-xl p-2 shadow-card-hover border border-white/10 z-50 overflow-hidden"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-2 py-1">
                    Matching Titles
                  </p>
                  {results.map((t) => (
                    <Link
                      key={t.id}
                      to={`/title/${t.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition group"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <PosterImage title={t} className="w-9 h-12 rounded shrink-0 shadow-sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate group-hover:text-brand-cyan transition">
                          {t.name}
                        </p>
                        <p className="text-xs text-white/40">
                          {t.year} • {t.type === 'series' ? 'TV Series' : 'Movie'} • ⭐ {t.imdbLikeRating}
                        </p>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearch}
                    className="w-full text-center text-xs font-semibold text-brand-cyan hover:text-brand-violet py-2 border-t border-white/10 mt-1 transition"
                  >
                    See all results for "{searchQuery}" →
                  </button>
                </motion.div>
              )}
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition focus-ring relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-cyan rounded-full ring-2 ring-ink-950" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-80 glass-strong rounded-2xl p-3 shadow-card-hover border border-white/10 z-50"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                      <span className="text-sm font-semibold text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-brand-cyan hover:text-white flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {notifications.map((n) => (
                        <Link
                          key={n.id}
                          to={n.path}
                          onClick={() => setNotifOpen(false)}
                          className={`block p-2.5 rounded-xl transition ${
                            n.read ? 'hover:bg-white/5 opacity-70' : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium text-white">{n.title}</p>
                            {!n.read && <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full mt-1 shrink-0" />}
                          </div>
                          <span className="text-[10px] text-white/40 mt-1 block">{n.time}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-1 p-1 rounded-full hover:bg-white/10 transition focus-ring"
                aria-label="User menu"
              >
                <Avatar colors={['#7C5CFF', '#22D3EE']} name="Alex Rivera" size={32} />
                <ChevronDown className="w-4 h-4 text-white/50 hidden sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-60 glass-strong rounded-2xl p-2 shadow-card-hover border border-white/10 z-50"
                  >
                    <div className="px-3 py-2.5 border-b border-white/10 mb-2">
                      <p className="text-sm font-semibold text-white">Alex Rivera</p>
                      <p className="text-xs text-brand-cyan">WatchNext VIP Member</p>
                    </div>

                    {[
                      { label: 'My Profile & History', path: '/profile' },
                      { label: `My List (${watchlist.length})`, path: '/profile?tab=watchlist' },
                      { label: 'AI Recommendations', path: '/for-you' },
                      { label: 'Top Rated Charts', path: '/top-charts' },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition"
                      >
                        {item.label}
                      </Link>
                    ))}

                    <div className="border-t border-white/10 mt-2 pt-2">
                      <Link
                        to="/auth"
                        className="block px-3 py-2 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-white/5 transition"
                      >
                        Sign Out / Switch User
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition focus-ring"
              aria-label="Navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden glass-strong border-t border-white/10"
            >
              <div className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition"
                  >
                    <link.icon className="w-4 h-4 text-brand-cyan" />
                    <span>{link.label}</span>
                    {link.label === 'My List' && watchlist.length > 0 && (
                      <span className="ml-auto bg-brand-violet/30 text-brand-cyan text-xs font-bold px-2 py-0.5 rounded-full">
                        {watchlist.length}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

export default Navbar;
