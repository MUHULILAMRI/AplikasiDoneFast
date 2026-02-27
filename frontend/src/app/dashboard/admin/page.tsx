'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiAdminDashboard } from '@/lib/api';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import {
  ShoppingBag, DollarSign, Users, TrendingUp,
  Clock, CheckCircle2, AlertCircle, ArrowUpRight,
  ArrowDownRight, BarChart3, Activity
} from 'lucide-react';
import { StatsSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

const monthlyData = [
  { month: 'Sep', value: 45 },
  { month: 'Oct', value: 62 },
  { month: 'Nov', value: 55 },
  { month: 'Dec', value: 78 },
  { month: 'Jan', value: 92 },
  { month: 'Feb', value: 100 },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [recentOrders, setRecentOrders] = useState<Record<string, unknown>[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await apiAdminDashboard();
      if (res.success) {
        const d = res.data as Record<string, any>;
        const overview = d.overview || {};
        const orderSummary = d.order_summary || {};
        setStats({
          total_orders_month: overview.monthly_orders || 0,
          total_income_month: overview.monthly_revenue || 0,
          total_profit_month: overview.monthly_profit || 0,
          pending_orders: orderSummary.pending || 0,
          in_progress_orders: orderSummary.in_progress || 0,
          completed_orders: orderSummary.completed || 0,
          revision_orders: orderSummary.revision || 0,
          total_joki: overview.total_joki || 0,
          total_revenue: overview.total_revenue || 0,
        });
        if (d.recent_orders) {
          const rawOrders = d.recent_orders as Record<string, unknown>[];
          setRecentOrders(rawOrders.map(o => ({
            ...o,
            title: o.title ?? (o.service as Record<string, unknown>)?.name,
            joki_name: (o.joki as Record<string, unknown>)?.name || 'Unassigned',
          })));
        }
        if (d.top_joki) {
          const rawJoki = d.top_joki as Record<string, unknown>[];
          setTeamMembers(rawJoki.map(j => ({
            ...j,
            name: (j.user as Record<string, unknown>)?.name ?? j.name,
            phone: (j.user as any)?.phone || '',
            active_orders: (j._count as Record<string, number>)?.orders ?? 0,
          })));
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: 'Revenue Hari Ini', value: stats.total_income_month / 30, format: 'currency', trend: '+12%', icon: DollarSign, color: 'from-blue-500 to-indigo-600' },
    { label: 'Net Profit (Bulan)', value: stats.total_profit_month, format: 'currency', trend: '+18%', icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
    { label: 'Total Joki', value: stats.total_joki, format: 'number', trend: '+5', icon: Users, color: 'from-purple-500 to-pink-600' },
    { label: 'Order Diproses', value: stats.in_progress_orders, format: 'number', trend: 'High', icon: Activity, color: 'from-orange-500 to-red-600' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header Advanced */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Executive Dashboard</h1>
          <p className="text-muted text-xs mt-1 font-medium">Monitoring performa bisnis & tim joki secara menyeluruh.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-2 p-1 rounded-xl border border-border">
          <button className="px-4 py-1.5 text-xs font-bold rounded-lg bg-primary text-white shadow-lg shadow-primary/20">Real-time</button>
          <button className="px-4 py-1.5 text-xs font-bold rounded-lg text-muted hover:text-foreground transition-colors">History</button>
        </div>
      </div>

      {/* Modern Stat Cards */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group glass rounded-3xl p-6 hover:border-primary/40 transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:opacity-[0.08] transition-opacity`} />

              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">{stat.trend}</span>
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-2xl font-black tracking-tight" suppressHydrationWarning>
                  {stat.format === 'currency' ? formatCurrency(stat.value) : stat.value?.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-muted/80 mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Analytics & Orders Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analytics Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-lg font-bold">Revenue Projections</h3>
              <p className="text-xs text-muted">Statistik pendapatan 6 bulan terakhir.</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <BarChart3 className="w-5 h-5 text-primary-light" />
            </div>
          </div>

          <div className="flex items-end gap-5 h-56 relative z-10">
            {monthlyData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full flex flex-col items-center justify-end h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${data.value}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-primary/80 to-primary-light rounded-2xl relative group cursor-pointer shadow-glow-sm shadow-primary/20"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-surface-2 border border-border rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all shadow-2xl whitespace-nowrap scale-90 group-hover:scale-100">
                      {formatCurrency(data.value * 125000 * 15)}
                    </div>
                  </motion.div>
                </div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{data.month}</span>
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mb-32 -mr-32" />
        </motion.div>

        {/* Quick Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-8"
        >
          <h3 className="text-lg font-bold mb-6">Order Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending Payment', count: stats.pending_orders, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { label: 'In Execution', count: stats.in_progress_orders, icon: Activity, color: 'text-primary-light', bg: 'bg-primary/10' },
              { label: 'Completed', count: stats.completed_orders, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'Revision Requested', count: stats.revision_orders, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-surface-2/30 rounded-2xl border border-border/50 hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-sm font-bold opacity-80">{item.label}</span>
                </div>
                <span className="text-base font-black text-foreground">{item.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl border border-primary/20 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Current Month Profit</p>
              <p className="text-2xl font-black mt-1 text-white">
                {formatCurrency(stats.total_profit_month)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-400 shadow-glow shadow-green-400" />
                <span className="text-[10px] font-bold text-muted italic">Calculated in real-time</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders - Visual Upgrade */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-3xl p-8 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold">Recent Acquisitions</h3>
            <p className="text-xs text-muted mt-1">Daftar transaksi dan order masuk terbaru.</p>
          </div>
          <a href="/dashboard/admin/orders" className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary/50 transition-all">
            Full History
            <ArrowUpRight className="w-3.5 h-3.5 text-primary-light" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[10px] text-muted font-black uppercase tracking-widest pb-4 pr-4">Order Entity</th>
                <th className="text-left text-[10px] text-muted font-black uppercase tracking-widest pb-4 pr-4">Service Type</th>
                <th className="text-right text-[10px] text-muted font-black uppercase tracking-widest pb-4 pr-4">Valuation</th>
                <th className="text-center text-[10px] text-muted font-black uppercase tracking-widest pb-4 pr-4">Status</th>
                <th className="text-right text-[10px] text-muted font-black uppercase tracking-widest pb-4">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="border-b border-border/10 group hover:bg-primary/5 transition-all">
                  <td className="py-5 pr-4">
                    <div>
                      <p className="text-sm font-bold group-hover:text-primary-light transition-colors">{order.title}</p>
                      <p className="text-[10px] font-mono text-muted mt-1 uppercase">ID: {order.order_number || order.id?.substring(0, 8)}</p>
                    </div>
                  </td>
                  <td className="py-5 pr-4">
                    <span className="text-[10px] font-black uppercase bg-surface-2 px-2 py-1 rounded-md border border-border/50">
                      {order.service?.category || 'General'}
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <p className="text-sm font-black text-foreground">{formatCurrency(order.price)}</p>
                    <p className="text-[9px] text-muted font-bold uppercase tracking-tighter mt-0.5">Paid Full</p>
                  </td>
                  <td className="py-5 pr-4 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-[11px] font-bold ${order.joki_name === 'Unassigned' ? 'text-orange-400' : 'text-foreground'}`}>
                        {order.joki_name}
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full ${order.joki_name === 'Unassigned' ? 'bg-orange-500 shadow-glow shadow-orange-500' : 'bg-green-500 shadow-glow shadow-green-500'}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Advanced Team Performance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-3xl p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold">Elite Joki Network</h3>
            <p className="text-xs text-muted mt-1">Performa individu dan utilisasi tim saat ini.</p>
          </div>
          <a href="/dashboard/admin/team" className="text-xs font-bold text-primary-light hover:text-primary transition-colors flex items-center gap-1">
            Manage All Staff <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {teamMembers.map((joki: any, i) => (
            <motion.div
              key={joki.id}
              whileHover={{ y: -5 }}
              className="p-5 bg-surface-2/40 rounded-3xl border border-border/50 hover:border-primary/40 transition-all relative group"
            >
              <div className="absolute top-4 right-4">
                <div className={`w-2 h-2 rounded-full ${joki.is_available ? 'bg-green-400 shadow-glow shadow-green-400' : 'bg-red-400'} animate-pulse`} />
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent-green p-0.5 shadow-xl group-hover:rotate-6 transition-transform">
                    <div className="w-full h-full rounded-2xl bg-surface-1 flex items-center justify-center text-xl font-black text-foreground">
                      {joki.name?.charAt(0)}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-surface-2 border border-border px-1.5 py-0.5 rounded-lg text-[8px] font-black text-yellow-400 flex items-center gap-0.5 border-yellow-500/20">
                    ★ {joki.rating}
                  </div>
                </div>

                <h4 className="text-sm font-black tracking-tight line-clamp-1">{joki.name}</h4>
                <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-widest">{joki.skills?.[0] || 'Member'}</p>

                <div className="w-full grid grid-cols-2 gap-2 mt-6 pt-6 border-t border-border/10">
                  <div className="text-left">
                    <p className="text-[8px] font-black text-muted uppercase">Active</p>
                    <p className="text-xs font-black text-primary-light">{joki.active_orders} Orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-muted uppercase">Comm.</p>
                    <p className="text-xs font-black">{joki.commission_rate}%</p>
                  </div>
                </div>

                <div className="w-full mt-4 flex gap-2">
                  <a
                    href={`https://wa.me/${joki.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-black rounded-xl border border-green-500/20 transition-all text-center"
                  >
                    Contact
                  </a>
                  <button className="p-2 bg-surface-3 rounded-xl border border-border/50 hover:bg-primary/10 transition-colors group/btn">
                    <Activity className="w-3.5 h-3.5 text-muted group-hover/btn:text-primary-light" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
