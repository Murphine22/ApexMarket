import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { DollarSign, TrendingUp, Percent, Boxes } from 'lucide-react';
import { Page } from '../components/Motion';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { Loading } from '../components/States';
import { useProducts, useTransactions } from '../hooks/useData';
import { currency, formatDateTime } from '../lib/utils';

export default function Reports() {
  const { data: products = [], isLoading: pL } = useProducts();
  const { data: transactions = [], isLoading: tL } = useTransactions();

  const report = useMemo(() => {
    const revenue = transactions.reduce((s, t) => s + t.total, 0);
    const orders = transactions.length;
    const avgOrder = orders ? revenue / orders : 0;

    // Estimate gross margin using product cost where available.
    const costBySku = Object.fromEntries(products.map((p) => [p.sku, p.cost || 0]));
    let cogs = 0;
    transactions.forEach((t) =>
      t.items.forEach((it) => {
        cogs += (costBySku[it.sku] || 0) * it.quantity;
      })
    );
    const margin = revenue ? ((revenue - cogs) / revenue) * 100 : 0;
    const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

    // Monthly revenue trend
    const byMonth = {};
    transactions.forEach((t) => {
      const key = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      byMonth[key] = (byMonth[key] || 0) + t.total;
    });
    const trend = Object.entries(byMonth)
      .map(([date, value]) => ({ date, value: Math.round(value) }))
      .slice(-20);

    // Payment method breakdown
    const byMethod = {};
    transactions.forEach((t) => {
      byMethod[t.paymentMethod] = (byMethod[t.paymentMethod] || 0) + t.total;
    });
    const methods = Object.entries(byMethod).map(([name, value]) => ({ name, value: Math.round(value) }));

    return { revenue, orders, avgOrder, margin, inventoryValue, trend, methods };
  }, [products, transactions]);

  if (pL || tL) return <Loading label="Compiling reports…" />;

  return (
    <Page>
      <PageHeader title="Financial Reports" subtitle="Admin-only insights into revenue, margin, and inventory." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={DollarSign} label="Total revenue" value={currency(report.revenue)} accent="safe" />
        <StatCard icon={TrendingUp} label="Avg. order value" value={currency(report.avgOrder)} accent="sky" />
        <StatCard icon={Percent} label="Gross margin" value={`${report.margin.toFixed(1)}%`} accent="amber" />
        <StatCard icon={Boxes} label="Inventory value" value={currency(report.inventoryValue)} accent="safe" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 font-semibold">Revenue trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={report.trend} margin={{ left: -18, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(11,18,32,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                formatter={(v) => [currency(v), 'Revenue']}
              />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-semibold">Revenue by payment</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={report.methods} margin={{ left: -18, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ background: 'rgba(11,18,32,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                formatter={(v) => [currency(v), 'Revenue']}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 card overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="font-semibold">Recent transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Transaction</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Cashier</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">When</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 12).map((t) => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-5 py-3 font-medium">{t.id}</td>
                  <td className="px-5 py-3 text-slate-400">{t.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                  <td className="px-5 py-3 text-slate-400">{t.cashier}</td>
                  <td className="px-5 py-3 capitalize text-slate-400">{t.paymentMethod}</td>
                  <td className="px-5 py-3 text-right font-semibold text-safe-400">{currency(t.total)}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{formatDateTime(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}
