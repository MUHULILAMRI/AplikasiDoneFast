'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '@/lib/utils';
import { apiJokiDashboard } from '@/lib/api';
import Link from 'next/link';
import {
  ClipboardList, Clock, CheckCircle, DollarSign,
  Star, TrendingUp, AlertCircle, ArrowUpRight,
  Timer, Target, Zap, Award, MessageSquare
} from 'lucide-react';
import { StatsSkeleton } from '@/components/ui/Skeleton';

export default function JokiDashboardPage() {
  const [activeOrders, setActiveOrders] = useState<Record<string, unknown>[]>([]);
  const [dashStats, setDashStats] = useState({ active: 0, completed: 0, commission: 0, rating: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await apiJokiDashboard();
      if (res.success) {
        const d = res.data as Record<string, unknown>;
        const s = (d.stats ?? {}) as Record<string, number>;
        const profile = (d.profile ?? {}) as Record<string, unknown>;
        setActiveOrders((d.recent_orders ?? []) as Record<string, unknown>[]);
        setDashStats({
          active: s.active_orders ?? 0,
          completed: s.completed_this_month ?? s.total_completed ?? 0,
          commission: s.monthly_commission ?? 0,
          rating: Number(profile.rating ?? 0),
          reviews: 0,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Order Aktif', value: String(dashStats.active), icon: ClipboardList, color: 'from-blue-500/20 to-indigo-500/20', iconColor: 'text-indigo-400', sub: '' },
            { label: 'Selesai Bulan Ini', value: String(dashStats.completed), icon: CheckCircle, color: 'from-green-500/20 to-emerald-500/20', iconColor: 'text-emerald-400', sub: '' },
            { label: 'Komisi Bulan Ini', value: formatCurrency(dashStats.commission), icon: DollarSign, color: 'from-purple-500/20 to-pink-500/20', iconColor: 'text-pink-400', sub: '' },
            { label: 'Rating', value: String(dashStats.rating || '-'), icon: Star, color: 'from-yellow-500/20 to-amber-500/20', iconColor: 'text-amber-400', sub: `${dashStats.reviews} reviews` },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, ease: 'easeOut' }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass border-white/5 rounded-2xl p-5 relative overflow-hidden group shadow-lg shadow-black/20"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[100px] pointer-events-none" />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <p className="text-xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted font-medium mt-1">{stat.label}</p>
              <p className="text-[10px] text-accent/80 mt-0.5">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Performance Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Performa Minggu Ini
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 rounded-full border-4 border-accent/30 border-t-accent flex items-center justify-center mx-auto mb-2 relative group-hover:rotate-12 transition-transform">
                <span className="text-lg font-bold text-accent">96%</span>
              </div>
              <p className="text-xs text-muted font-medium">On-Time Rate</p>
            </div>
            <div className="text-center p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary flex items-center justify-center mx-auto mb-2 relative group-hover:-rotate-12 transition-transform">
                <span className="text-lg font-bold text-primary-light">98%</span>
              </div>
              <p className="text-xs text-muted font-medium">Quality Score</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-xl">
            <p className="text-xs text-accent flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Kamu termasuk Top 3 Joki bulan ini! 🎉
            </p>
          </div>
        </motion.div>

        {/* Active Orders */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass border-white/5 rounded-2xl p-6 shadow-xl shadow-black/40"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-light" />
            Order Aktif
          </h3>
          <div className="space-y-3">
            {activeOrders.map((order: Record<string, unknown>, i: number) => (
              <motion.div
                key={order.id as string}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-4 bg-surface-2 rounded-xl border border-border hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted">{(order.order_number as string) || (order.id as string)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${order.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                        order.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-green-500/10 text-green-400'
                        }`}>
                        {order.priority === 'high' ? 'Mendesak' : order.priority === 'medium' ? 'Normal' : 'Santai'}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{order.title as string}</p>
                  </div>
                  <span className="text-sm font-bold text-accent-green">{formatCurrency(order.price as number)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted mb-2">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    Deadline: {order.deadline ? formatDate(order.deadline as string) : '-'}
                  </span>
                  <span>{order.progress as number ?? 0}%</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${order.progress as number ?? 0}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${(order.progress as number) >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                      (order.progress as number) >= 30 ? 'bg-gradient-to-r from-primary to-primary-light' :
                        'bg-gradient-to-r from-yellow-500 to-orange-400'
                      }`}
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Link
                    href={`/orders/${order.id as string}/chat`}
                    className="px-3 py-1.5 bg-surface border border-border rounded-lg text-[11px] hover:border-primary/30 flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Chat Customer
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Aktivitas Terakhir</h3>
          <div className="space-y-3">
            {[
              { text: 'Upload hasil ORD-098', time: '2 jam lalu', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
              { text: 'Chat baru dari Ahmad Rizki', time: '3 jam lalu', icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { text: 'Order baru di-assign: ORD-003', time: '5 jam lalu', icon: ClipboardList, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { text: 'Revisi diminta untuk ORD-095', time: '1 hari lalu', icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { text: 'Komisi Rp 350.000 masuk', time: '2 hari lalu', icon: DollarSign, color: 'text-accent-green', bg: 'bg-emerald-500/10' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-default">
                <div className={`w-8 h-8 rounded-lg ${activity.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate font-medium">{activity.text}</p>
                  <p className="text-xs text-muted/80">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Pendapatan 6 Bulan</h3>
          <div className="space-y-3">
            {[
              { month: 'Januari', amount: 4200000, orders: 12 },
              { month: 'Desember', amount: 3800000, orders: 10 },
              { month: 'November', amount: 3500000, orders: 9 },
              { month: 'Oktober', amount: 3200000, orders: 8 },
              { month: 'September', amount: 2800000, orders: 7 },
              { month: 'Agustus', amount: 2500000, orders: 6 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-xl">
                <div>
                  <p className="text-sm font-medium">{item.month}</p>
                  <p className="text-xs text-muted">{item.orders} orders</p>
                </div>
                <span className="text-sm font-bold text-accent-green">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
