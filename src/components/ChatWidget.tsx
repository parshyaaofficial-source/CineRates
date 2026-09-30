import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { realTitles } from '@/data/realTitles';
import { PosterImage } from './PosterImage';
import type { Title } from '@/types';

type Message = {
  id: number;
  role: 'user' | 'ai';
  text: string;
  suggestions?: string[];
  titles?: Title[];
};

const defaultSuggestions = [
  'What should I watch tonight?',
  'Best sci-fi series with mind-bending plots?',
  'Award-winning drama series to binge',
  'Hidden gems with high ratings',
];

function generateResponse(query: string): Message {
  const q = query.toLowerCase();
  let picked = realTitles;

  if (q.includes('sci-fi') || q.includes('space') || q.includes('future')) {
    picked = realTitles.filter((t) => t.genres.includes('Sci-Fi'));
  } else if (q.includes('drama') || q.includes('award') || q.includes('emmy')) {
    picked = realTitles.filter((t) => t.genres.includes('Drama'));
  } else if (q.includes('hidden') || q.includes('gem')) {
    picked = realTitles.filter((t) => t.hiddenGem || t.votes < 500000);
  } else if (q.includes('series') || q.includes('show') || q.includes('tv')) {
    picked = realTitles.filter((t) => t.type === 'series');
  } else if (q.includes('movie') || q.includes('film')) {
    picked = realTitles.filter((t) => t.type === 'movie');
  } else if (q.includes('action') || q.includes('thrill')) {
    picked = realTitles.filter((t) => t.genres.includes('Action') || t.genres.includes('Thriller'));
  }

  const top = [...picked].sort((a, b) => b.imdbLikeRating - a.imdbLikeRating).slice(0, 3);

  const responses: Record<string, string> = {
    'what should i watch tonight?':
      'Here are three sensational recommendations for tonight! Each is critically acclaimed with stellar audience sentiment across the WatchNext platform.',
    'best sci-fi series with mind-bending plots?':
      'If you love intricate, high-stakes science fiction with psychological depth, you cannot miss these standout series:',
    'award-winning drama series to binge':
      'These acclaimed productions swept critics and viewers with masterclass storytelling and powerhouse acting:',
    'hidden gems with high ratings':
      'Here are high-rated gems that deliver unforgettable experiences without the massive blockbuster marketing noise:',
  };

  const matched =
    responses[q] ||
    `Here are high-match titles curated for you based on "${query}". Selected using WatchNext AI score and verified ratings.`;

  return {
    id: Date.now(),
    role: 'ai',
    text: matched,
    titles: top,
    suggestions: top.length > 0 ? ['Tell me more about the first pick', 'Give me something different', 'Show top-rated movies'] : [],
  };
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'ai',
      text: "Hi! I'm WatchNext AI. Tell me what mood you're in, your favorite genres, or ask for specific movie and TV series recommendations. I'm here to find your next great watch.",
      suggestions: defaultSuggestions,
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
    }, 700);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-gradient shadow-glow flex items-center justify-center focus-ring"
        aria-label="Ask WatchNext AI"
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
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[530px] glass-strong rounded-2xl flex flex-col shadow-2xl border border-white/15 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-ink-900/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Ask WatchNext</p>
                  <p className="text-[10px] text-brand-cyan">AI Movie & TV Companion • Online</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-brand-gradient text-white shadow-glow'
                        : 'bg-white/10 text-white/90 border border-white/10'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.titles && msg.titles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.titles.map((t) => (
                          <Link
                            key={t.id}
                            to={`/title/${t.id}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 bg-black/40 border border-white/10 rounded-xl p-2 hover:bg-white/15 transition group"
                          >
                            <PosterImage title={t} className="w-10 h-14 rounded-lg shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-white group-hover:text-brand-cyan transition truncate">
                                {t.name}
                              </p>
                              <p className="text-[10px] text-white/50">
                                {t.year} • {t.type === 'series' ? 'TV' : 'Movie'} • ⭐ {t.imdbLikeRating}
                              </p>
                              <span className="text-[9px] bg-brand-cyan/20 text-brand-cyan font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                {t.aiMatch}% Match
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-white/10">
                        {msg.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => send(s)}
                            className="text-[11px] bg-white/10 hover:bg-white/20 text-white/80 rounded-full px-2.5 py-1 transition text-left"
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
                <div className="flex items-center gap-1.5 text-white/40 text-xs px-2 py-1">
                  <span className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-brand-violet rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">WatchNext AI is thinking...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="p-3 border-t border-white/10 bg-ink-900/60 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask WatchNext AI anything..."
                className="flex-1 bg-white/5 text-sm text-white placeholder-white/30 rounded-xl px-3 py-2 outline-none focus:bg-white/10 transition border border-white/10"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white disabled:opacity-40 hover:shadow-glow transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatWidget;
