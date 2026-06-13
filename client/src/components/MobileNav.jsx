import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ScanLine, ClipboardList, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

const NAV = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/pos', label: 'POS', icon: ScanLine },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/inventory', label: 'Logs', icon: ClipboardList },
  { to: '/reports', label: 'Reports', icon: BarChart3, adminOnly: true },
];

export default function MobileNav() {
  const user = useAuthStore((s) => s.user);
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass-strong border-x-0 border-b-0 px-2 py-2">
      <div className="flex items-center justify-around">
        {NAV.filter((n) => !n.adminOnly || user?.role === 'admin').map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium',
                  isActive ? 'text-safe-400' : 'text-slate-400'
                )
              }
            >
              <Icon size={20} />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
