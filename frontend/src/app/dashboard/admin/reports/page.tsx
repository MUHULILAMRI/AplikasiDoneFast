'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart3, TrendingUp, TrendingDown, Calendar,
  Download, FileText, PieChart, ArrowUpRight,
  ArrowDownRight, DollarSign, ShoppingBag, Users,
  Star, Clock, CheckCircle, XCircle, Filter
} from 'lucide-react';

import { apiAdminReports } from '@/lib/api';
import { StatsSkeleton } from '@/components/ui/Skeleton';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    async function load() {
      const res = await apiAdminReports();
      if (res.success) {
        setData(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Laporan & Analitik</h1>
          <p className="text-muted text-sm mt-1">Performa bisnis secara realtime.</p>
        </div>
        <StatsSkeleton />
        <div className="glass h-64 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const monthlyData = data?.monthlyData || [];
  const topServices = data?.topServices || [];
  const topJoki = data?.topJoki || [];
  const statusSummary = data?.statusSummary || [];
  const stats = data?.stats || {};

  const maxRevenue = Math.max(...monthlyData.map((d: any) => d.revenue), 1000);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan & Analitik</h1>
          <p className="text-muted text-sm mt-1">Analisis performa bisnis secara mendalam.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue Bulan Ini', value: formatCurrency(stats.revenue || 0), icon: DollarSign, color: 'from-green-500 to-emerald-500', change: '+100%', up: true },
          { label: 'Orders Bulan Ini', value: String(stats.orders || 0), icon: ShoppingBag, color: 'from-blue-500 to-indigo-500', change: '+100%', up: true },
          { label: 'Customer Baru', value: String(stats.customers || 0), icon: Users, color: 'from-purple-500 to-pink-500', change: '+100%', up: true },
          { label: 'Tingkat Selesai', value: `${(stats.completionRate || 0).toFixed(1)}%`, icon: CheckCircle, color: 'from-orange-500 to-red-500', change: 'Live', up: true },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? 'text-accent-green' : 'text-red-400'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-light" />
            Trend Revenue (6 Bulan)
          </h3>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent" /> Profit</span>
          </div>
        </div>
        <div className="flex items-end gap-3 h-52">
          {monthlyData.map((d: any, i: number) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center gap-1" style={{ height: '180px' }}>
                <div className="w-full flex gap-1 items-end h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-primary to-primary-light rounded-t-md"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.profit / maxRevenue) * 100}%` }}
                    transition={{ delay: i * 0.1 + 0.1, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-accent/80 to-accent rounded-t-md"
                  />
                </div>
              </div>
              <span className="text-[10px] text-muted">{d.month}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-accent" />
            Layanan Terpopuler
          </h3>
          <div className="space-y-4">
            {topServices.map((service: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-muted">{service.orders} orders</span>
                  </div>
                  <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${service.pct}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-accent-green w-20 text-right">{formatCurrency(service.revenue)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Joki Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Top Joki Performer
          </h3>
          <div className="space-y-4">
            {topJoki.map((joki: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-surface-2 rounded-xl border border-border">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold text-primary-light">
                  #{i + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg">
                  {joki.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{joki.name}</p>
                  <p className="text-xs text-muted">{joki.orders} orders • ⭐ {joki.rating}</p>
                </div>
                <span className="text-sm font-bold text-accent-green">{formatCurrency(joki.revenue)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Order Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-light" />
          Ringkasan Status Order
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statusSummary.map((item: any, i: number) => {
            const Icon = item.status === 'Pending' ? Clock :
              item.status === 'Dikerjakan' ? TrendingUp :
                item.status === 'Selesai' ? CheckCircle :
                  item.status === 'Dibatalkan' ? XCircle : FileText;
            return (
              <div key={i} className={`p-4 rounded-xl ${item.color} text-center`}>
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-xs mt-1">{item.status}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
