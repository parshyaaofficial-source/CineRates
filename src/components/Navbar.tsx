import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sparkles, Home, Film, Tv, Star, Flame, Bookmark, ChevronDown, Menu, X } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import { titleService } from '@/services/titleService';
import { Avatar } from './PosterImage';

const navLinks = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Movies', path: '/browse?type=movie', icon: Film },
  { label: 'Series', path: '/browse?type=series', icon: Tv },
  { label: 'Top Rated', path: '/top-charts', icon: Star },
  { label: 'New & Popular', path: '/browse?sort=trending', icon: Flame },
  { label: 'My List', path: '/profile', icon: Bookmark },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof titleService.search>>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    if (aiMode) return;
    setResults(titleService.search(searchQuery).slice(0, 6));
  }, [searchQuery, aiMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiMode && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-strong shadow-card' : 'bg-gradient-to-b from-ink-950/90 to-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-4 lg:px-12 h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 focus-ring rounded-lg">
              <div className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
                <span className="font-hero text-xl text-white">C</span>
              </div>
              <span className="font-display font-bold text-lg text-white hidden sm:block">CineSense</span>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path.split('?')[0]));
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-ring ${
                      active ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.form
                    key="search-open"
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSearch}
                    className="flex items-center gap-2 glass rounded-full px-3 py-2"
                  >
                    <Search className="w-4 h-4 text-white/50 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={aiMode ? 'Ask AI anything...' : 'Search titles, people...'}
                      className="bg-transparent text-sm text-white placeholder-white/40 outline-none w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setAiMode(!aiMode)}
                      className={`shrink-0 p-1 rounded-full transition ${aiMode ? 'bg-brand-gradient text-white' : 'text-white/40 hover:text-white'}`}
                      title="Toggle AI search"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="text-white/40 hover:text-white shrink-0">
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
                    className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition focus-ring"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>

              {searchOpen && !aiMode && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full right-0 mt-2 w-80 glass-strong rounded-xl p-2 shadow-card-hover"
                >
                  {results.map((t) => (
                    <Link
                      key={t.id}
                      to={`/title/${t.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition"
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    >
                      <div className="w-10 h-14 rounded shrink-0" style={{ background: `linear-gradient(135deg, ${t.posterColors[0]}, ${t.posterColors[1]})` }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{t.name}</p>
                        <p className="text-xs text-white/40">{t.year} • {t.type} • {t.genres[0]}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>

            <button className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition focus-ring relative" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-cyan rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1 p-1 rounded-full hover:bg-white/10 transition focus-ring"
              >
                <Avatar colors={['#7C5CFF', '#22D3EE']} name="Alex Rivera" size={32} />
                <ChevronDown className="w-4 h-4 text-white/50 hidden sm:block" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full right-0 mt-2 w-56 glass-strong rounded-xl p-2 shadow-card-hover"
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <p className="text-sm font-semibold text-white">Alex Rivera</p>
                      <p className="text-xs text-white/40">Member since 2024</p>
                    </div>
                    {[
                      { label: 'My Profile', path: '/profile' },
                      { label: 'My List', path: '/profile' },
                      { label: 'AI For You', path: '/for-you' },
                      { label: 'Top Charts', path: '/top-charts' },
                    ].map((item) => (
                      <Link key={item.label} to={item.path} className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition">
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-white/10 mt-2 pt-2">
                      <Link to="/auth" className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition">
                        Sign Out
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition focus-ring"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

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
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                    {link.label === 'My List' && watchlist.length > 0 && (
                      <span className="ml-auto bg-brand-violet/30 text-brand-violet text-xs font-bold px-2 py-0.5 rounded-full">{watchlist.length}</span>
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
