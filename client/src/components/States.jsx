import { Loader2 } from 'lucide-react';

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="grid place-items-center py-20 text-slate-400">
      <Loader2 className="animate-spin text-safe-400" size={28} />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="card grid place-items-center px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-slate-400">
          <Icon size={26} />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-slate-400">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-white/5 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
