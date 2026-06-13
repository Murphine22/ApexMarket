import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  PartyPopper,
} from 'lucide-react';
import { Page } from '../components/Motion';
import PageHeader from '../components/PageHeader';
import { Loading } from '../components/States';
import { useProducts, useCreateTransaction } from '../hooks/useData';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { currency, cn, isOutOfStock, playChime, haptic } from '../lib/utils';

const PAYMENTS = [
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
];

export default function POS() {
  const { data: products = [], isLoading } = useProducts();
  const createTransaction = useCreateTransaction();
  const user = useAuthStore((s) => s.user);
  const soundEnabled = useUiStore((s) => s.soundEnabled);
  const { items, addItem, setQuantity, removeItem, clear, total, count } = useCartStore();

  const [query, setQuery] = useState('');
  const [payment, setPayment] = useState('card');
  const [celebrate, setCelebrate] = useState(null);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          !query ||
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      ),
    [products, query]
  );

  const checkout = async () => {
    if (items.length === 0) return toast.error('Cart is empty');
    try {
      const txn = await createTransaction.mutateAsync({
        items: items.map(({ sku, name, price, quantity }) => ({ sku, name, price, quantity })),
        paymentMethod: payment,
        cashier: user?.name || 'Unknown',
      });
      // Dopamine-driven achievement: celebration + harmonic chime + haptic.
      playChime(soundEnabled);
      haptic([18, 40, 18]);
      setCelebrate(txn);
      clear();
    } catch (err) {
      toast.error(err.message || 'Checkout failed');
    }
  };

  if (isLoading) return <Loading label="Opening register…" />;

  return (
    <Page>
      <PageHeader title="Point of Sale" subtitle="Scan, ring up, and complete sales in seconds." />

      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        {/* Product catalog */}
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-3 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products to add…"
              className="input pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => {
              const out = isOutOfStock(p);
              return (
                <motion.button
                  key={p._id}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ y: -3 }}
                  disabled={out}
                  onClick={() => {
                    addItem(p);
                    haptic();
                  }}
                  className={cn(
                    'card p-3 text-left transition disabled:opacity-40 disabled:cursor-not-allowed',
                    'hover:shadow-glow'
                  )}
                >
                  <div className="mb-2 h-16 overflow-hidden rounded-lg bg-navy-800">
                    {p.image && (
                      <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    )}
                  </div>
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-safe-400 font-bold">{currency(p.price)}</span>
                    <span className={cn('text-xs', out ? 'text-rose-400' : 'text-slate-500')}>
                      {out ? 'Out' : `${p.stock} left`}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:sticky lg:top-24 h-fit card glass-strong p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <ShoppingCart size={18} className="text-safe-400" /> Cart
              <span className="chip bg-white/10 text-slate-300">{count()}</span>
            </h3>
            {items.length > 0 && (
              <button className="text-xs text-slate-400 hover:text-rose-400" onClick={clear}>
                Clear
              </button>
            )}
          </div>

          <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {items.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  No items yet. Tap a product to add it.
                </p>
              ) : (
                items.map((it) => (
                  <motion.div
                    key={it.sku}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{it.name}</p>
                      <p className="text-xs text-slate-500">{currency(it.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="btn-ghost px-1.5 py-1.5" onClick={() => setQuantity(it.sku, it.quantity - 1)}>
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{it.quantity}</span>
                      <button className="btn-ghost px-1.5 py-1.5" onClick={() => setQuantity(it.sku, it.quantity + 1)}>
                        <Plus size={13} />
                      </button>
                    </div>
                    <p className="w-16 text-right text-sm font-semibold">{currency(it.price * it.quantity)}</p>
                    <button className="text-slate-500 hover:text-rose-400" onClick={() => removeItem(it.sku)}>
                      <Trash2 size={15} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
              <span>Subtotal</span>
              <span>{currency(total())}</span>
            </div>
            <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
              <span>Tax (8%)</span>
              <span>{currency(total() * 0.08)}</span>
            </div>
            <div className="mb-4 flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-safe-400">{currency(total() * 1.08)}</span>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {PAYMENTS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPayment(p.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition',
                      payment === p.id
                        ? 'border-safe-500/50 bg-safe-500/15 text-safe-400'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                    )}
                  >
                    <Icon size={16} />
                    {p.label}
                  </button>
                );
              })}
            </div>

            <button
              className="btn-primary w-full py-3 text-base"
              onClick={checkout}
              disabled={items.length === 0 || createTransaction.isPending}
            >
              {createTransaction.isPending ? 'Processing…' : `Charge ${currency(total() * 1.08)}`}
            </button>
          </div>
        </div>
      </div>

      <SuccessOverlay txn={celebrate} onClose={() => setCelebrate(null)} />
    </Page>
  );
}

function SuccessOverlay({ txn, onClose }) {
  return (
    <AnimatePresence>
      {txn && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-md" />
          {/* Confetti-like burst */}
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{ background: ['#10b981', '#0ea5e9', '#f59e0b', '#a78bfa'][i % 4] }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 480,
                y: (Math.random() - 0.5) * 480,
                opacity: 0,
                scale: [1, 1.4, 0.5],
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          ))}
          <motion.div
            className="relative z-10 card glass-strong w-full max-w-sm p-7 text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <motion.div
              className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-safe-500/20 text-safe-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.1 }}
            >
              <CheckCircle2 size={34} />
            </motion.div>
            <h3 className="flex items-center justify-center gap-2 text-xl font-bold">
              Sale complete <PartyPopper size={18} className="text-amber-400" />
            </h3>
            <p className="mt-1 text-sm text-slate-400">Transaction {txn.id}</p>
            <p className="mt-4 text-3xl font-extrabold text-safe-400">{currency(txn.total * 1.08)}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
              Paid via {txn.paymentMethod}
            </p>
            <button className="btn-primary mt-6 w-full" onClick={onClose}>
              New sale
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
