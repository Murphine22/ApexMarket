import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import { useUiStore } from '../store/useUiStore';
import { cn } from '../lib/utils';

export default function Layout() {
  const focusMode = useUiStore((s) => s.focusMode);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        {/* Cognitive narrowing: subtle blur of chrome when focus mode is on */}
        <motion.main
          className={cn(
            'flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-6 transition-[filter] duration-500',
            focusMode && 'before:fixed before:inset-0 before:-z-10'
          )}
        >
          <Outlet />
        </motion.main>
        <MobileNav />
      </div>
    </div>
  );
}
