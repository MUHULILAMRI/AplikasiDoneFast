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
  const [stats, setStats] = useState<Record<string, number>>({
    total_orders_today: 0, total_income_today: 0, active_users: 0, total_income_month: 0,
    pending_orders: 0, in_progress_orders: 0, completed_orders: 0, revision_orders: 0, total_profit_month: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Record<string, unknown>[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await apiAdminDashboard();
      if (res.success) {
        const d = res.data as Record<string, unknown>;
        const overview = (d.overview ?? {}) as Record<string, number>;
        const orderSummary = (d.order_summary ?? {}) as Record<string, number>;
        setStats({
          total_orders_today: overview.monthly_orders ?? overview.total_orders ?? 0,
          total_income_today: overview.monthly_revenue ?? overview.total_revenue ?? 0,
          active_users: overview.total_customers ?? overview.new_customers ?? 0,
          total_income_month: overview.monthly_revenue ?? 0,
          pending_orders: orderSummary.pending ?? 0,
          in_progress_orders: orderSummary.in_progress ?? 0,
          completed_orders: orderSummary.completed ?? 0,
          revision_orders: orderSummary.revision ?? 0,
          total_profit_month: overview.monthly_revenue ?? 0,
        });
        if (d.recent_orders) {
          const rawOrders = d.recent_orders as Record<string, unknown>[];
          setRecentOrders(rawOrders.map(o => ({
            ...o,
            title: o.title ?? (o.service as Record<string, unknown>)?.name,
            joki_id: (o.joki as Record<string, unknown>)?.id ?? o.joki_id,
          })));
        }
        if (d.top_joki) {
          const rawJoki = d.top_joki as Record<string, unknown>[];
          setTeamMembers(rawJoki.map(j => ({
            ...j,
            name: (j.user as Record<string, unknown>)?.name ?? j.name,
            total_completed: (j._count as Record<string, number>)?.orders ?? j.total_completed ?? 0,
          })));
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: 'Order Hari Ini', value: stats.total_orders_today, format: 'number', change: '+12%', positive: true, icon: ShoppingBag, gradient: 'from-blue-500 to-indigo-500' },
    { label: 'Income Hari Ini', value: stats.total_income_today, format: 'currency', change: '+23%', positive: true, icon: DollarSign, gradient: 'from-green-500 to-emerald-500' },
    { label: 'User Aktif', value: stats.active_users, format: 'number', change: '+8%', positive: true, icon: Users, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Income Bulan Ini', value: stats.total_income_month, format: 'currency', change: '+45%', positive: true, icon: TrendingUp, gradient: 'from-cyan-500 to-blue-500' },
  ];
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted text-sm mt-1">Selamat datang kembali, Admin! Berikut ringkasan bisnis hari ini.</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                  {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {stat.format === 'currency'
                  ? formatCurrency(stat.value)
                  : stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-muted mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts & Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Grafik Income Bulanan</h3>
              <p className="text-sm text-muted">6 bulan terakhir</p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-green" />
              <span className="text-sm text-accent-green font-medium">Live</span>
            </div>
          </div>

          {/* Simple bar chart */}
          <div className="flex items-end gap-4 h-48">
            {monthlyData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${data.value}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-primary to-primary-light rounded-t-lg relative group cursor-pointer"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface-2 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(data.value * 1875000)}
                  </div>
                </motion.div>
                <span className="text-xs text-muted">{data.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Status Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-6">Status Order</h3>
          <div className="space-y-4">
            {[
              { label: 'Menunggu Bayar', count: stats.pending_orders, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { label: 'Diproses', count: stats.in_progress_orders, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Selesai', count: stats.completed_orders, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'Perlu Revisi', count: stats.revision_orders, icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
            <p className="text-sm font-medium">Profit Bulan Ini</p>
            <p className="text-2xl font-bold gradient-text mt-1">
              {formatCurrency(stats.total_profit_month)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Order Terbaru</h3>
          <a href="/dashboard/admin/orders" className="text-sm text-primary-light hover:underline">
            Lihat Semua →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted font-medium pb-3 pr-4">Order ID</th>
                <th className="text-left text-xs text-muted font-medium pb-3 pr-4">Tugas</th>
                <th className="text-left text-xs text-muted font-medium pb-3 pr-4">Harga</th>
                <th className="text-left text-xs text-muted font-medium pb-3 pr-4">Status</th>
                <th className="text-left text-xs text-muted font-medium pb-3 pr-4">Deadline</th>
                <th className="text-left text-xs text-muted font-medium pb-3">Joki</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: Record<string, unknown>) => (
                <tr key={order.id as string} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                  <td className="py-4 pr-4">
                    <span className="font-mono text-sm text-primary-light">{(order.order_number as string) || (order.id as string)}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <p className="text-sm font-medium">{order.title as string}</p>
                    <p className="text-xs text-muted mt-0.5">{(order.description as string)?.substring(0, 40)}...</p>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm font-medium">{formatCurrency(order.price as number)}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status as string)}`}>
                      {getStatusLabel(order.status as string)}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm text-muted">{order.deadline ? new Date(order.deadline as string).toLocaleDateString('id-ID') : '-'}</span>
                  </td>
                  <td className="py-4">
                    {order.joki_id ? (
                      <span className="text-sm">
                        {(teamMembers.find((j) => j.id === order.joki_id) as Record<string, unknown>)?.name as string || 'Unassigned'}
                      </span>
                    ) : (
                      <span className="text-xs text-orange-400 font-medium">Belum assign</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Team Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Performa Tim Joki</h3>
          <a href="/dashboard/admin/team" className="text-sm text-primary-light hover:underline">
            Kelola Tim →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamMembers.map((joki) => (
            <div key={joki.id as string} className="p-4 bg-surface-2 rounded-xl border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                  {(joki.name as string)?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{joki.name as string}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-yellow-400">★</span>
                    <span className="text-xs text-muted">{joki.rating as number}</span>
                  </div>
                </div>
                <div className={`ml-auto w-2.5 h-2.5 rounded-full ${joki.is_available ? 'bg-green-400' : 'bg-red-400'}`} />
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>{joki.total_completed as number} selesai</span>
                <span>Komisi: {joki.commission_rate as number}%</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {((joki.skills as string[]) || []).slice(0, 2).map((skill: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-primary/10 text-primary-light text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
