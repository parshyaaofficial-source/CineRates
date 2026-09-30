import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Info, Mail } from 'lucide-react';

export type ModalType = 'about' | 'privacy' | 'terms' | 'contact' | null;

interface InfoModalProps {
  type: ModalType;
  onClose: () => void;
}

export function InfoModal({ type, onClose }: InfoModalProps) {
  if (!type) return null;

  const contentMap = {
    about: {
      title: 'About WatchNext',
      icon: Info,
      content: (
        <div className="space-y-4 text-sm text-white/70">
          <p>
            <strong className="text-white">WatchNext</strong> is a modern cinematic discovery platform engineered to connect moviegoers and TV series enthusiasts with titles they truly love.
          </p>
          <p>
            Powered by intelligent recommendation scoring, audience sentiment analysis, and curated charts, WatchNext eliminates endless browsing paralysis so you always know what to watch next.
          </p>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="font-semibold text-white">Platform Features</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Verified authentic movie & TV series ratings and metadata</li>
              <li>Deep AI matching based on mood, pacing, and genre affinities</li>
              <li>Real-time Watchlist and watched progress tracking</li>
              <li>Comprehensive technical specs and official trailer streams</li>
            </ul>
          </div>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      icon: ShieldCheck,
      content: (
        <div className="space-y-3 text-sm text-white/70">
          <p>
            Your privacy is paramount. At WatchNext, we believe your viewing preferences and personal data belong to you.
          </p>
          <p>
            <strong>Data Storage:</strong> Your watchlist, custom ratings, and preferences are stored locally in your browser session for maximum speed and privacy.
          </p>
          <p>
            <strong>Third-Party APIs:</strong> When external metadata services (such as TMDB) are utilized, requests are strictly anonymous without attaching personal identifiers.
          </p>
          <p className="text-xs text-white/40">Last updated: September 2026</p>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      icon: FileText,
      content: (
        <div className="space-y-3 text-sm text-white/70">
          <p>
            By using WatchNext, you agree to discover and enjoy entertainment responsibly.
          </p>
          <p>
            <strong>Intellectual Property:</strong> All movie posters, trailers, and promotional stills remain the intellectual property of their respective studios, networks, and copyright holders.
          </p>
          <p>
            <strong>Non-Commercial Demonstration:</strong> WatchNext is intended for personal entertainment discovery, recommendation research, and portfolio evaluation.
          </p>
        </div>
      ),
    },
    contact: {
      title: 'Contact WatchNext Team',
      icon: Mail,
      content: (
        <div className="space-y-4 text-sm text-white/70">
          <p>
            Have feedback, title suggestions, or questions regarding WatchNext? We would love to hear from you.
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/40 block">Email Support</span>
              <span className="text-white font-medium">support@watchnext.app</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/40 block">Partnerships & Press</span>
              <span className="text-white font-medium">press@watchnext.app</span>
            </div>
          </div>
          <p className="text-xs text-brand-cyan">Our team responds within 24 hours.</p>
        </div>
      ),
    },
  };

  const item = contentMap[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md glass-strong rounded-2xl p-6 border border-white/15 shadow-2xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-display font-semibold text-white text-lg">{item.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">{item.content}</div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default InfoModal;
