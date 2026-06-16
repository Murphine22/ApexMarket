import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Eye, EyeOff, Volume2, VolumeX, Sparkles, Sun, Moon, Command } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { dataService } from '../lib/dataService';
import { cn, haptic } from '../lib/utils';

export default function Topbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { focusMode, toggleFocusMode, soundEnabled, toggleSound, theme, toggleTheme } = useUiStore();

  const openPalette = () =>
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
    );

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-8 py-4 glass-strong border-x-0 border-t-0">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <span className="text-base font-extrabold">
            Apex<span className="text-safe-400">Market</span>
          </span>
        </div>
        <span
          className={cn(
            'chip',
            dataService.mode === 'api'
              ? 'bg-safe-500/15 text-safe-400'
              : 'bg-amber-500/15 text-amber-400'
          )}
          title={
            dataService.mode === 'api'
              ? 'Connected to the live Express/Mongo backend'
              : 'Running in standalone demo mode (no backend required)'
          }
        >
          <Sparkles size={12} />
          {dataService.mode === 'api' ? 'Live API' : 'Demo mode'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="btn-ghost hidden md:inline-flex px-3 text-slate-400"
          onClick={openPalette}
          title="Open command palette (Ctrl+K)"
        >
          <Command size={14} />
          <span className="text-xs">Ctrl K</span>
        </button>
        <button
          className="btn-ghost px-2.5"
          onClick={() => {
            haptic();
            toggleTheme();
          }}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          className="btn-ghost px-2.5"
          onClick={() => {
            haptic();
            toggleSound();
          }}
          title={soundEnabled ? 'Mute sound cues' : 'Enable sound cues'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <button
          className={cn('btn-ghost px-2.5', focusMode && 'text-safe-400 border-safe-500/40')}
          onClick={() => {
            haptic();
            toggleFocusMode();
          }}
          title="Focus mode (cognitive narrowing)"
        >
          {focusMode ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>

        <div className="mx-1 h-6 w-px bg-white/10" />

        <div className="hidden sm:flex items-center gap-2 pr-1">
          <motion.div
            whileHover={{ scale: 1.06 }}
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-safe-500 to-sky-500 text-sm font-bold text-white"
          >
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </motion.div>
        </div>

        <button
          className="btn-ghost"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
