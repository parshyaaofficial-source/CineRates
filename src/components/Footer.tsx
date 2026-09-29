import { Link } from 'react-router-dom';
import { Clapperboard, Github, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/8 bg-ink-900/50">
      <div className="px-6 lg:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
                <span className="font-hero text-xl text-white">C</span>
              </div>
              <span className="font-display font-bold text-lg text-white">CineSense</span>
            </Link>
            <p className="text-sm text-white/50 max-w-xs">
              AI-powered movie and series discovery. Find your next favorite with intelligent recommendations tailored to your taste.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/50 hover:text-brand-cyan transition" aria-label="Social link">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Browse', links: ['Home', 'Movies', 'Series', 'Top Rated', 'New & Popular'] },
            { title: 'AI', links: ['For You', 'AI Search', 'Mood Picker', 'Compare Titles', 'Ask CineSense'] },
            { title: 'Account', links: ['My Profile', 'Watchlist', 'My Ratings', 'My Reviews', 'Settings'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Contact'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white/80 mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/50 hover:text-white transition">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-white/8">
          <p className="text-xs text-white/40">© 2026 CineSense. All rights reserved. For demonstration purposes.</p>
          <div className="flex items-center gap-4">
            <select className="bg-transparent text-xs text-white/50 border border-white/10 rounded-lg px-3 py-1.5 focus-ring" aria-label="Language">
              <option className="bg-ink-900">English</option>
              <option className="bg-ink-900">Español</option>
              <option className="bg-ink-900">日本語</option>
              <option className="bg-ink-900">한국어</option>
            </select>
            <a href="#" className="text-xs text-white/40 hover:text-white/70 transition">Privacy</a>
            <a href="#" className="text-xs text-white/40 hover:text-white/70 transition">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FilmReelLogo({ className = '' }: { className?: string }) {
  return <Clapperboard className={className} />;
}
