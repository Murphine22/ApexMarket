import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ClipboardList,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash,
  SlidersHorizontal,
  Crosshair,
  PackagePlus,
} from 'lucide-react';
import { Page } from '../components/Motion';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { Loading, EmptyState } from '../components/States';
import { useLogs, useProducts, useRecordMovement } from '../hooks/useData';
import { useUiStore } from '../store/useUiStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatDateTime, cn, haptic } from '../lib/utils';
import usePageTitle from '../hooks/usePageTitle';

const TYPE_META = {
  restock: { icon: ArrowUpCircle, color: 'text-safe-400', bg: 'bg-safe-500/15', label: 'Restock' },
  sale: { icon: ArrowDownCircle, color: 'text-sky-300', bg: 'bg-sky-500/15', label: 'Sale' },
  wastage: { icon: Trash, color: 'text-rose-300', bg: 'bg-rose-500/15', label: 'Wastage' },
  adjustment: { icon: SlidersHorizontal, color: 'text-amber-400', bg: 'bg-amber-500/15', label: 'Adjustment' },
};

const blankMovement = { productId: '', movementType: 'restock', quantity: 1, note: '' };

export default function Inventory() {
  usePageTitle('Inventory');
  const { data: logs = [], isLoading } = useLogs();
  const { data: products = [] } = useProducts();
  const recordMovement = useRecordMovement();
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === 'admin';
  const { focusMode, setFocusMode } = useUiStore();
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState({ open: false, origin: null });
  const [form, setForm] = useState(blankMovement);

  const filtered = useMemo(
    () => (filter === 'all' ? logs : logs.filter((l) => l.movementType === filter)),
    [logs, filter]
  );

  const openMovement = (e) => {
    setForm({ ...blankMovement, productId: products[0]?._id || '' });
    setModal({ open: true, origin: { x: e.clientX, y: e.clientY } });
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submitMovement = async (e) => {
    e.preventDefault();
    if (!form.productId) return toast.error('Select a product');
    try {
      await recordMovement.mutateAsync({
        productId: form.productId,
        movementType: form.movementType,
        quantity: Number(form.quantity),
        note: form.note,
      });
      haptic();
      toast.success('Movement recorded');
      setModal({ open: false, origin: null });
    } catch (err) {
      toast.error(err.message || 'Failed to record movement');
    }
  };

  if (isLoading) return <Loading label="Loading audit trail…" />;

  return (
    <Page>
      <PageHeader title="Inventory Log" subtitle="A full audit trail of every stock movement.">
        {canManage && (
          <button onClick={openMovement} className="btn-primary">
            <PackagePlus size={16} /> Record movement
          </button>
        )}
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

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, origin: null })}
        origin={modal.origin}
        title="Record stock movement"
      >
        <form onSubmit={submitMovement} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Product</label>
            <select name="productId" value={form.productId} onChange={onChange} className="input" required>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku}) — {p.stock} in stock
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Type</label>
              <select name="movementType" value={form.movementType} onChange={onChange} className="input">
                <option value="restock">Restock (+)</option>
                <option value="adjustment">Adjustment (+/-)</option>
                <option value="wastage">Wastage (-)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Quantity</label>
              <input name="quantity" type="number" value={form.quantity} onChange={onChange} className="input" required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Note (optional)</label>
            <input name="note" value={form.note} onChange={onChange} className="input" placeholder="e.g. Supplier delivery" />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={recordMovement.isPending}>
            {recordMovement.isPending ? 'Saving…' : 'Record movement'}
          </button>
        </form>
      </Modal>
    </Page>
  );
}
