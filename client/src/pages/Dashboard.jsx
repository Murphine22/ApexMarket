import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Page } from '../components/Motion';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { Loading } from '../components/States';
import { useProducts, useTransactions } from '../hooks/useData';
import { useAuthStore } from '../store/useAuthStore';
import { currency, formatNumber, isLowStock } from '../lib/utils';

const PIE_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#a78bfa', '#f43f5e', '#34d399', '#38bdf8', '#fbbf24'];

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: products = [], isLoading: pL } = useProducts();
  const { data: transactions = [], isLoading: tL } = useTransactions();

  const stats = useMemo(() => {
    const now = new Date();
    const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
    const todayKey = dayKey(now);

    const todayTxns = transactions.filter((t) => dayKey(t.createdAt) === todayKey);
    const revenueToday = todayTxns.reduce((s, t) => s + t.total, 0);
    const revenueTotal = transactions.reduce((s, t) => s + t.total, 0);

    // Revenue over the last 14 days
    const series = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = dayKey(d);
      const total = transactions
        .filter((t) => dayKey(t.createdAt) === key)
        .reduce((s, t) => s + t.total, 0);
      series.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(total * 100) / 100,
      });
    }

    // Category distribution by stock value
    const byCat = {};
    products.forEach((p) => {
      byCat[p.category] = (byCat[p.category] || 0) + p.price * p.stock;
    });
    const categoryData = Object.entries(byCat).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    // Top sellers by units
    const unitsBySku = {};
    transactions.forEach((t) =>
      t.items.forEach((it) => {
        unitsBySku[it.name] = (unitsBySku[it.name] || 0) + it.quantity;
      })
    );
    const topSellers = Object.entries(unitsBySku)
      .map(([name, units]) => ({ name, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    const lowStock = products.filter(isLowStock);

    return {
      revenueToday,
      revenueTotal,
      ordersToday: todayTxns.length,
      totalProducts: products.length,
      series,
      categoryData,
      topSellers,
      lowStock,
    };
  }, [products, transactions]);

  if (pL || tL) return <Loading label="Crunching your store metrics…" />;

  return (
    <Page>
      <PageHeader
        title={`Good ${greeting()}, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="Here's how ApexMarket is performing today."
      >
        <Link to="/pos" className="btn-primary">
          <ShoppingCart size={16} /> New Sale
        </Link>
      </PageHeader>

      {/* Low-stock proactive urgency banner with pulsating amber */}
      {stats.lowStock.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400 animate-pulse-ring">
              <AlertTriangle size={18} />
            </span>
            <div>
              <p className="font-semibold text-amber-300">
                {stats.lowStock.length} product{stats.lowStock.length > 1 ? 's' : ''} running low
              </p>
              <p className="text-xs text-amber-200/70">
                Restock soon to avoid lost sales: {stats.lowStock.slice(0, 3).map((p) => p.name).join(', ')}
                {stats.lowStock.length > 3 ? '…' : ''}
              </p>
            </div>
          </div>
          <Link to="/products" className="btn-amber whitespace-nowrap">
            Review stock
          </Link>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={DollarSign} label="Revenue today" value={currency(stats.revenueToday)} accent="safe" hint={`${currency(stats.revenueTotal)} all-time`} delay={0} />
        <StatCard icon={ShoppingCart} label="Orders today" value={formatNumber(stats.ordersToday)} accent="sky" delay={0.05} />
        <StatCard icon={Package} label="Active products" value={formatNumber(stats.totalProducts)} accent="amber" delay={0.1} />
        <StatCard icon={AlertTriangle} label="Low stock" value={formatNumber(stats.lowStock.length)} accent={stats.lowStock.length ? 'rose' : 'safe'} delay={0.15} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Revenue — last 14 days</h3>
            <span className="chip bg-safe-500/15 text-safe-400">
              <TrendingUp size={13} /> Trend
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.series} margin={{ left: -18, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(11,18,32,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                formatter={(v) => [currency(v), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-semibold">Stock value by category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats.categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {stats.categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'rgba(11,18,32,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                formatter={(v, n) => [currency(v), n]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h3 className="mb-4 font-semibold">Top sellers (units sold)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.topSellers} margin={{ left: -18, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{ background: 'rgba(11,18,32,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
            />
            <Bar dataKey="units" radius={[8, 8, 0, 0]} fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Page>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
