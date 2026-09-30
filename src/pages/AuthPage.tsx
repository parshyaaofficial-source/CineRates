import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { WatchNextLogo } from '@/components/WatchNextLogo';
import { useToast } from '@/context/ToastContext';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast(isSignUp ? 'Account created successfully! Welcome to WatchNext.' : 'Signed in successfully! Welcome back.');
      navigate('/');
    }, 600);
  };

  const handleDemoLogin = (userName: string) => {
    showToast(`Logged in as ${userName}. Enjoy WatchNext!`);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-gradient opacity-15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3 focus-ring rounded-xl">
            <WatchNextLogo size={48} showText={true} textClassName="text-2xl" />
          </Link>
          <p className="text-sm text-white/50">
            {isSignUp ? 'Join millions discovering movies & TV series' : 'Sign in to access your Watchlist & AI recommendations'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
                !isSignUp ? 'bg-brand-gradient text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
                isSignUp ? 'bg-brand-gradient text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs font-medium text-white/70 mb-1.5 block">Full Name</label>
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-brand-cyan transition">
                  <User className="w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Alex Rivera"
                    className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-white/70 mb-1.5 block">Email Address</label>
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-brand-cyan transition">
                <Mail className="w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-white/70 mb-1.5 block">Password</label>
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-brand-cyan transition">
                <Lock className="w-4 h-4 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-gradient text-white font-semibold text-sm hover:shadow-glow transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create WatchNext Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
            <p className="text-xs text-center text-white/40">Or test with demo access:</p>
            <button
              type="button"
              onClick={() => handleDemoLogin('Alex Rivera')}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" /> Continue as Alex Rivera (VIP Member)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('Guest')}
              className="w-full py-2 rounded-xl text-white/50 hover:text-white text-xs transition"
            >
              Continue as Guest
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-white/50 hover:text-white transition">
            ← Return to WatchNext Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthPage;
