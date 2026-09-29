import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WatchlistProvider } from '@/context/WatchlistContext';
import { ToastProvider } from '@/context/ToastContext';
import { Navbar } from '@/components/Navbar';
import { ChatWidget } from '@/components/ChatWidget';
import { HomePage } from '@/pages/HomePage';
import { TitleDetailPage } from '@/pages/TitleDetailPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { motion } from 'framer-motion';

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <WatchlistProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/title/:id" element={<PageWrapper><TitleDetailPage /></PageWrapper>} />
            <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
          </Routes>
          <ChatWidget />
        </WatchlistProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
