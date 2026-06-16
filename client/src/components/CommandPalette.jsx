import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ScanLine,
  ClipboardList,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Sun,
  Moon,
  Volume2,
  LogOut,
  CornerDownLeft,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { cn } from '../lib/utils';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme, toggleSound } = useUiStore();

  const commands = useMemo(() => {
    const go = (to) => () => navigate(to);
    const list = [
      { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, run: go('/dashboard'), keywords: 'home overview' },
      { id: 'pos', label: 'Go to Point of Sale', icon: ScanLine, run: go('/pos'), keywords: 'sell checkout cart' },
      { id: 'products', label: 'Go to Products', icon: Package, run: go('/products'), keywords: 'catalog inventory items' },
      { id: 'inventory', label: 'Go to Inventory', icon: ClipboardList, run: go('/inventory'), keywords: 'stock logs movements' },
      ...(user?.role === 'admin'
        ? [{ id: 'reports', label: 'Go to Reports', icon: BarChart3, run: go('/reports'), keywords: 'analytics finance revenue' }]
        : []),
      { id: 'settings', label: 'Go to Settings', icon: SettingsIcon, run: go('/settings'), keywords: 'preferences account' },
      {
        id: 'theme',
        label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        icon: theme === 'dark' ? Sun : Moon,
        run: toggleTheme,
        keywords: 'dark light mode appearance',
      },
      { id: 'sound', label: 'Toggle sound cues', icon: Volume2, run: toggleSound, keywords: 'mute audio chime' },
      { id: 'logout', label: 'Sign out', icon: LogOut, run: () => { logout(); navigate('/login'); }, keywords: 'exit leave' },
    ];
    return list;
  }, [navigate, user, theme, toggleTheme, toggleSound, logout]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords.includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const runCommand = (cmd) => {
    setOpen(false);
    cmd.run();
  };

  const onListKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && filtered[active]) {
      e.preventDefault();
      runCommand(filtered[active]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-label="Command palette"
            className="card glass-strong relative w-full max-w-lg overflow-hidden p-0"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onListKey}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search size={18} className="text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands…"
                className="w-full bg-transparent py-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <kbd className="hidden sm:block rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">
                ESC
              </kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-slate-500">No commands found.</li>
              )}
              {filtered.map((cmd, i) => {
                const Icon = cmd.icon;
                return (
                  <li key={cmd.id}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => runCommand(cmd)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                        i === active ? 'bg-white/10 text-slate-100' : 'text-slate-300 hover:bg-white/5'
                      )}
                    >
                      <Icon size={16} className="text-safe-400" />
                      <span className="flex-1">{cmd.label}</span>
                      {i === active && <CornerDownLeft size={14} className="text-slate-500" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
