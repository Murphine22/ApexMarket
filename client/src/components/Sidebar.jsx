import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ScanLine,
  ClipboardList,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';
import Logo from './Logo';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pos', label: 'Point of Sale', icon: ScanLine },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: ClipboardList },
  { to: '/reports', label: 'Reports', icon: BarChart3, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-6 p-5">
      <div className="px-2 pt-2">
        <Logo />
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.filter((n) => !n.adminOnly || user?.role === 'admin').map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-safe-500/20 to-sky-500/10 border border-safe-500/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={18}
                    className={cn(
                      'relative z-10 transition-transform group-hover:scale-110',
                      isActive && 'text-safe-400'
                    )}
                  />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto card p-4">
        <p className="text-xs text-slate-400">Signed in as</p>
        <p className="mt-0.5 text-sm font-semibold truncate">{user?.name}</p>
        <span
          className={cn(
            'chip mt-2',
            user?.role === 'admin'
              ? 'bg-safe-500/15 text-safe-400'
              : 'bg-sky-500/15 text-sky-300'
          )}
        >
          {user?.role}
        </span>
      </div>
    </aside>
  );
}
