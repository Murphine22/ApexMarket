import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash,
  SlidersHorizontal,
  Crosshair,
} from 'lucide-react';
import { Page } from '../components/Motion';
import PageHeader from '../components/PageHeader';
import { Loading, EmptyState } from '../components/States';
import { useLogs } from '../hooks/useData';
import { useUiStore } from '../store/useUiStore';
import { formatDateTime, cn } from '../lib/utils';

const TYPE_META = {
  restock: { icon: ArrowUpCircle, color: 'text-safe-400', bg: 'bg-safe-500/15', label: 'Restock' },
  sale: { icon: ArrowDownCircle, color: 'text-sky-300', bg: 'bg-sky-500/15', label: 'Sale' },
  wastage: { icon: Trash, color: 'text-rose-300', bg: 'bg-rose-500/15', label: 'Wastage' },
  adjustment: { icon: SlidersHorizontal, color: 'text-amber-400', bg: 'bg-amber-500/15', label: 'Adjustment' },
};

export default function Inventory() {
  const { data: logs = [], isLoading } = useLogs();
  const { focusMode, setFocusMode } = useUiStore();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () => (filter === 'all' ? logs : logs.filter((l) => l.movementType === filter)),
    [logs, filter]
  );

  if (isLoading) return <Loading label="Loading audit trail…" />;

  return (
    <Page>
      <PageHeader title="Inventory Log" subtitle="A full audit trail of every stock movement.">
        {/* Focus mode for audits → cognitive narrowing */}
        <button
          onClick={() => setFocusMode(!focusMode)}
          className={cn('btn-ghost', focusMode && 'text-safe-400 border-safe-500/40')}
        >
          <Crosshair size={16} /> {focusMode ? 'Exit audit focus' : 'Audit focus'}
        </button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-2">
        {['all', 'restock', 'sale', 'wastage', 'adjustment'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              'chip capitalize transition',
              filter === t ? 'bg-safe-500/20 text-safe-400' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Cognitive narrowing: blur everything but the table during audit focus */}
      <motion.div
        animate={{ filter: focusMode ? 'none' : 'none' }}
        className={cn('card overflow-hidden', focusMode && 'ring-1 ring-safe-500/30 shadow-glow')}
      >
        {filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No movements" subtitle="Stock changes will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3 text-right">Quantity</th>
                  <th className="px-5 py-3 text-right">When</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => {
                  const meta = TYPE_META[log.movementType] || TYPE_META.adjustment;
                  const Icon = meta.icon;
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.015, 0.4) }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="px-5 py-3">
                        <span className={cn('chip', meta.bg, meta.color)}>
                          <Icon size={13} /> {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium">{log.name}</td>
                      <td className="px-5 py-3 text-slate-500">{log.sku}</td>
                      <td className={cn('px-5 py-3 text-right font-semibold', log.quantity < 0 ? 'text-rose-300' : 'text-safe-400')}>
                        {log.quantity > 0 ? '+' : ''}
                        {log.quantity}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-500">{formatDateTime(log.createdAt)}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </Page>
  );
}
