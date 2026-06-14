import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle, Filter } from 'lucide-react';
import { Page, stagger, fadeUp } from '../components/Motion';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { Loading, EmptyState } from '../components/States';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useData';
import { useAuthStore } from '../store/useAuthStore';
import { CATEGORIES } from '../lib/demoData';
import { currency, cn, isLowStock, isOutOfStock, haptic } from '../lib/utils';

const blank = { sku: '', name: '', category: CATEGORIES[0], price: '', cost: '', stock: '', lowStockThreshold: 10, image: '' };

export default function Products() {
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === 'admin';
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [modal, setModal] = useState({ open: false, editing: null, origin: null });
  const [form, setForm] = useState(blank);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase());
      const matchesCat = category === 'All' || p.category === category;
      return matchesQuery && matchesCat;
    });
  }, [products, query, category]);

  const openCreate = (e) => {
    if (!canManage) return toast.error('Only admins can add products');
    setForm(blank);
    setModal({ open: true, editing: null, origin: { x: e.clientX, y: e.clientY } });
  };

  const openEdit = (e, p) => {
    setForm({ ...p });
    setModal({ open: true, editing: p, origin: { x: e.clientX, y: e.clientY } });
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      cost: Number(form.cost) || 0,
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold) || 10,
    };
    try {
      if (modal.editing) {
        await updateProduct.mutateAsync({ id: modal.editing._id, payload });
        toast.success('Product updated');
      } else {
        await createProduct.mutateAsync(payload);
        toast.success('Product added');
      }
      haptic();
      setModal({ open: false, editing: null, origin: null });
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  const remove = async (p) => {
    if (!canManage) return toast.error('Only admins can delete products');
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await deleteProduct.mutateAsync(p._id);
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  if (isLoading) return <Loading label="Loading products…" />;

  return (
    <Page>
      <PageHeader title="Products" subtitle={`${products.length} items in catalog`}>
        {canManage && (
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add product
          </button>
        )}
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or SKU…"
            className="input pl-9"
          />
        </div>
        <div className="relative">
          <Filter size={15} className="absolute left-3 top-3 text-slate-500" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input pl-9 pr-8">
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products found" subtitle="Try a different search or add a new product." />
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((p) => {
            const low = isLowStock(p);
            const out = isOutOfStock(p);
            return (
              <motion.div
                key={p._id}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                className={cn(
                  'card group overflow-hidden',
                  low && !out && 'ring-1 ring-amber-500/40 animate-pulse-neon',
                  out && 'ring-1 ring-rose-500/50'
                )}
              >
                <div className="relative h-32 overflow-hidden bg-navy-800">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-slate-600">
                      <Package size={28} />
                    </div>
                  )}
                  <span className="absolute left-2 top-2 chip bg-navy-950/70 text-slate-300 backdrop-blur">
                    {p.category}
                  </span>
                  {out ? (
                    <span className="absolute right-2 top-2 chip bg-rose-500/90 text-white">Out of stock</span>
                  ) : low ? (
                    <span className="absolute right-2 top-2 chip bg-amber-500/90 text-navy-950">
                      <AlertTriangle size={12} /> Low
                    </span>
                  ) : null}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{p.name}</h3>
                      <p className="text-xs text-slate-500">{p.sku}</p>
                    </div>
                    <p className="shrink-0 font-bold text-safe-400">{currency(p.price)}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className={cn('text-slate-400', low && 'text-amber-400 font-medium')}>
                      {p.stock} in stock
                    </span>
                    {canManage && (
                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button className="btn-ghost px-2 py-1.5" onClick={(e) => openEdit(e, p)}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn-ghost px-2 py-1.5 hover:text-rose-400" onClick={() => remove(p)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <Modal
        open={modal.open}
        origin={modal.origin}
        onClose={() => setModal({ open: false, editing: null, origin: null })}
        title={modal.editing ? 'Edit product' : 'Add product'}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Name</label>
              <input name="name" required value={form.name} onChange={onChange} className="input" />
            </div>
            <div>
              <label className="label">SKU</label>
              <input name="sku" required value={form.sku} onChange={onChange} className="input" placeholder="PRD-XXXX" />
            </div>
            <div>
              <label className="label">Category</label>
              <select name="category" value={form.category} onChange={onChange} className="input">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Price (₦)</label>
              <input name="price" type="number" step="0.01" min="0" required value={form.price} onChange={onChange} className="input" />
            </div>
            <div>
              <label className="label">Cost (₦)</label>
              <input name="cost" type="number" step="0.01" min="0" value={form.cost} onChange={onChange} className="input" />
            </div>
            <div>
              <label className="label">Stock</label>
              <input name="stock" type="number" min="0" required value={form.stock} onChange={onChange} className="input" />
            </div>
            <div>
              <label className="label">Low-stock threshold</label>
              <input name="lowStockThreshold" type="number" min="0" value={form.lowStockThreshold} onChange={onChange} className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Image URL (optional)</label>
              <input name="image" value={form.image} onChange={onChange} className="input" placeholder="https://…" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setModal({ open: false, editing: null, origin: null })}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={createProduct.isPending || updateProduct.isPending}>
              {modal.editing ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </Modal>
    </Page>
  );
}
