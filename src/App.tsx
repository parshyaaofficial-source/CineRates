import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from '@/context/UserContext';
import { WatchlistProvider } from '@/context/WatchlistContext';
import { ToastProvider } from '@/context/ToastContext';
import { Navbar } from '@/components/Navbar';
import { ChatWidget } from '@/components/ChatWidget';
import { HomePage } from '@/pages/HomePage';
import { BrowsePage } from '@/pages/BrowsePage';
import { TopChartsPage } from '@/pages/TopChartsPage';
import { SearchPage } from '@/pages/SearchPage';
import { ForYouPage } from '@/pages/ForYouPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AuthPage } from '@/pages/AuthPage';
import { TitleDetailPage } from '@/pages/TitleDetailPage';
import { BucketListPage } from '@/pages/BucketListPage';
import { FriendTastePage } from '@/pages/FriendTastePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { motion, AnimatePresence } from 'framer-motion';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);

  return null;
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <UserProvider>
          <WatchlistProvider>
            <ScrollToTop />
            <Navbar />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
                <Route path="/browse" element={<PageWrapper><BrowsePage /></PageWrapper>} />
                <Route path="/top-charts" element={<PageWrapper><TopChartsPage /></PageWrapper>} />
                <Route path="/search" element={<PageWrapper><SearchPage /></PageWrapper>} />
                <Route path="/for-you" element={<PageWrapper><ForYouPage /></PageWrapper>} />
                <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
                <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
                <Route path="/title/:id" element={<PageWrapper><TitleDetailPage /></PageWrapper>} />
                <Route path="/bucket-list" element={<PageWrapper><BucketListPage /></PageWrapper>} />
                <Route path="/friends" element={<PageWrapper><FriendTastePage /></PageWrapper>} />
                <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
              </Routes>
            </AnimatePresence>
            <ChatWidget />
          </WatchlistProvider>
        </UserProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
