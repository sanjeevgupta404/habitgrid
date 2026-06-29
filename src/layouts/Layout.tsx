import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout = () => {
  const location = useLocation();

  return (
    <div className='relative min-h-screen flex flex-col'>
      <Navbar />
      <main className='flex-1'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={location.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};
