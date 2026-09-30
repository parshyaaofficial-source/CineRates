import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, Github, Twitter, Instagram, Youtube } from 'lucide-react';
import { WatchNextLogo } from './WatchNextLogo';
import { InfoModal, type ModalType } from './InfoModals';
import { useToast } from '@/context/ToastContext';

export function Footer() {
  const [modalType, setModalType] = useState<ModalType>(null);
  const { showToast } = useToast();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    showToast(`Language switched to ${e.target.value}`);
  };

  const navColumns = [
    {
      title: 'Browse',
      links: [
        { label: 'Home', path: '/' },
        { label: 'Movies', path: '/browse?type=movie' },
        { label: 'Series', path: '/browse?type=series' },
        { label: 'Top Rated', path: '/top-charts' },
        { label: 'New & Popular', path: '/browse?sort=trending' },
      ],
    },
    {
      title: 'AI Discovery',
      links: [
        { label: 'For You', path: '/for-you' },
        { label: 'AI Search', path: '/search?ai=true' },
        { label: 'Mood Picker', path: '/#mood-picker' },
        { label: 'Ask WatchNext', action: () => showToast('Click the purple AI chat bubble at bottom right!') },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'My Profile', path: '/profile' },
        { label: 'Watchlist', path: '/profile?tab=watchlist' },
        { label: 'My Ratings', path: '/profile?tab=ratings' },
        { label: 'Sign In / Register', path: '/auth' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About WatchNext', modal: 'about' as const },
        { label: 'Privacy Policy', modal: 'privacy' as const },
        { label: 'Terms of Service', modal: 'terms' as const },
        { label: 'Contact Support', modal: 'contact' as const },
      ],
    },
  ];

  return (
    <>
      <footer className="mt-20 border-t border-white/8 bg-ink-950/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2">
              <Link to="/" className="inline-block mb-4 focus-ring rounded-lg">
                <WatchNextLogo size={36} showText={true} />
              </Link>
              <p className="text-sm text-white/50 max-w-sm leading-relaxed">
                WatchNext is your premier movie and TV series discovery platform. Find your next favorite with verified ratings, authentic recommendations, and intelligent mood matching.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {[
                  { icon: Twitter, label: 'Twitter', url: 'https://twitter.com' },
                  { icon: Instagram, label: 'Instagram', url: 'https://instagram.com' },
                  { icon: Youtube, label: 'YouTube', url: 'https://youtube.com' },
                  { icon: Github, label: 'GitHub', url: 'https://github.com' },
                ].map(({ icon: Icon, label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/50 hover:text-brand-cyan hover:scale-105 transition"
                    aria-label={`WatchNext on ${label}`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {navColumns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white/80 mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.path ? (
                        <Link
                          to={link.path}
                          className="text-sm text-white/50 hover:text-white transition focus-ring rounded"
                        >
                          {link.label}
                        </Link>
                      ) : link.modal ? (
                        <button
                          type="button"
                          onClick={() => setModalType(link.modal)}
                          className="text-sm text-white/50 hover:text-white transition text-left focus-ring rounded"
                        >
                          {link.label}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={link.action}
                          className="text-sm text-white/50 hover:text-white transition text-left focus-ring rounded"
                        >
                          {link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-white/8">
            <p className="text-xs text-white/40">
              © 2026 WatchNext. All rights reserved. Designed for film & television discovery.
            </p>
            <div className="flex items-center gap-4">
              <select
                onChange={handleLanguageChange}
                className="bg-ink-900 text-xs text-white/60 border border-white/10 rounded-lg px-3 py-1.5 focus-ring cursor-pointer"
                aria-label="Language selector"
              >
                <option value="English">English</option>
                <option value="Español">Español</option>
                <option value="日本語">日本語</option>
                <option value="한국어">한국어</option>
              </select>
              <button
                onClick={() => setModalType('privacy')}
                className="text-xs text-white/40 hover:text-white/70 transition"
              >
                Privacy
              </button>
              <button
                onClick={() => setModalType('terms')}
                className="text-xs text-white/40 hover:text-white/70 transition"
              >
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>

      <InfoModal type={modalType} onClose={() => setModalType(null)} />
    </>
  );
}

export function FilmReelLogo({ className = '' }: { className?: string }) {
  return <Clapperboard className={className} />;
}
