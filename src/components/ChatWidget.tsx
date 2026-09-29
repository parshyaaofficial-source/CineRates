import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { titles } from '@/data/mockData';
import { PosterImage } from './PosterImage';

type Message = {
  id: number;
  role: 'user' | 'ai';
  text: string;
  suggestions?: string[];
  titles?: typeof titles;
};

const suggestions = [
  'What should I watch tonight?',
  'Best sci-fi series under 8 episodes?',
  'Something cozy for a rainy day',
  'Hidden gems I might have missed',
];

function generateResponse(query: string): Message {
  const q = query.toLowerCase();
  let picked = titles;

  if (q.includes('sci-fi')) picked = titles.filter((t) => t.genres.includes('Sci-Fi'));
  else if (q.includes('cozy') || q.includes('rainy')) picked = titles.filter((t) => ['Romance', 'Comedy', 'Drama'].some((g) => t.genres.includes(g)));
  else if (q.includes('hidden') || q.includes('gem')) picked = titles.filter((t) => t.hiddenGem);
  else if (q.includes('series')) picked = titles.filter((t) => t.type === 'series');
  else if (q.includes('movie')) picked = titles.filter((t) => t.type === 'movie');

  const top = [...picked].sort((a, b) => b.aiScore - a.aiScore).slice(0, 3);
  const responses: Record<string, string> = {
    'what should i watch tonight': `Based on your taste profile, here are three picks I think you will love tonight. Each blends your affinity for sci-fi and drama with high audience sentiment.`,
    'best sci-fi series under 8 episodes': `Great question! Here are tight, bingeable sci-fi series — all under 8 episodes per season — that pack a punch without overstaying.`,
    'something cozy for a rainy day': `Rainy day? I have got just the thing. These warm, character-driven stories are perfect for curling up with.`,
    'hidden gems i might have missed': `Oh, you are in for a treat. These are critically adored but flew under the radar — pure hidden gold.`,
  };

  const matched = responses[q] ?? `Here are some titles I think you will enjoy based on "${query}". I picked these using your taste profile and audience sentiment data.`;

  return {
    id: Date.now(),
    role: 'ai',
    text: matched,
    titles: top,
    suggestions: top.length > 0 ? ['Tell me more about one of these', 'Something different', 'Show me more like this'] : [],
  };
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'ai',
      text: "Hi! I'm CineSense AI. Ask me what to watch, describe a mood, or request a specific type of title. I'm here to help you find your next favorite.",
      suggestions,
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, generateResponse(text)]);
    }, 1200);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-gradient shadow-glow flex items-center justify-center focus-ring"
        aria-label="Ask CineSense"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[520px] glass-strong rounded-2xl flex flex-col shadow-card-hover overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Ask CineSense</p>
                <p className="text-[10px] text-brand-cyan">AI Assistant • Online</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-brand-gradient text-white' : 'bg-white/10 text-white/90'} rounded-2xl px-3 py-2 text-sm`}>
                    <p>{msg.text}</p>
                    {msg.titles && msg.titles.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {msg.titles.map((t) => (
                          <Link
                            key={t.id}
                            to={`/title/${t.id}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 bg-black/30 rounded-lg p-1.5 hover:bg-black/50 transition"
                          >
                            <PosterImage title={t} className="w-8 h-12 rounded shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{t.name}</p>
                              <p className="text-[10px] text-white/50">{t.year} • ★ {t.imdbLikeRating}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => send(s)}
                            className="text-[11px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full transition"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 bg-white/60 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 px-3 py-3 border-t border-white/10"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 bg-white/5 text-sm text-white placeholder-white/40 rounded-full px-4 py-2 outline-none focus:bg-white/10 transition"
              />
              <button type="submit" className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center shrink-0 hover:shadow-glow transition" aria-label="Send">
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
