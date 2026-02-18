'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart3, TrendingUp, TrendingDown, Calendar,
  Download, FileText, PieChart, ArrowUpRight,
  ArrowDownRight, DollarSign, ShoppingBag, Users,
  Star, Clock, CheckCircle, XCircle, Filter
} from 'lucide-react';

const MONTHLY_DATA = [
  { month: 'Aug', orders: 180, revenue: 45000000, profit: 18000000, customers: 89 },
  { month: 'Sep', orders: 210, revenue: 52000000, profit: 21000000, customers: 102 },
  { month: 'Oct', orders: 245, revenue: 61000000, profit: 25000000, customers: 118 },
  { month: 'Nov', orders: 280, revenue: 70000000, profit: 29000000, customers: 135 },
  { month: 'Des', orders: 320, revenue: 82000000, profit: 34000000, customers: 156 },
  { month: 'Jan', orders: 356, revenue: 89000000, profit: 37000000, customers: 178 },
];

const TOP_SERVICES = [
  { name: 'Joki Skripsi', orders: 89, revenue: 35600000, pct: 40 },
  { name: 'Tugas Coding', orders: 67, revenue: 20100000, pct: 23 },
  { name: 'Joki Arsitektur', orders: 45, revenue: 13500000, pct: 15 },
  { name: 'Konsultasi Akademik', orders: 34, revenue: 5100000, pct: 6 },
  { name: 'Lainnya', orders: 121, revenue: 14700000, pct: 16 },
];

const TOP_JOKI = [
  { name: 'Alex Coder', avatar: '👨‍💻', orders: 45, rating: 4.9, revenue: 22500000 },
  { name: 'Sarah Writer', avatar: '👩‍🎓', orders: 38, rating: 4.8, revenue: 19000000 },
  { name: 'Rizky Arch', avatar: '🧑‍🎨', orders: 32, rating: 4.7, revenue: 16000000 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState('monthly');
  const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue));

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
          { label: 'Revenue Bulan Ini', value: formatCurrency(89000000), icon: DollarSign, color: 'from-green-500 to-emerald-500', change: '+8.5%', up: true },
          { label: 'Total Orders', value: '356', icon: ShoppingBag, color: 'from-blue-500 to-indigo-500', change: '+11.2%', up: true },
          { label: 'Customer Baru', value: '178', icon: Users, color: 'from-purple-500 to-pink-500', change: '+14.1%', up: true },
          { label: 'Tingkat Selesai', value: '96.4%', icon: CheckCircle, color: 'from-orange-500 to-red-500', change: '-0.3%', up: false },
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
          {MONTHLY_DATA.map((d, i) => (
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
            {TOP_SERVICES.map((service, i) => (
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
            {TOP_JOKI.map((joki, i) => (
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
          {[
            { status: 'Pending', count: 23, color: 'bg-yellow-500/10 text-yellow-400', icon: Clock },
            { status: 'Dikerjakan', count: 45, color: 'bg-blue-500/10 text-blue-400', icon: TrendingUp },
            { status: 'Review', count: 12, color: 'bg-purple-500/10 text-purple-400', icon: FileText },
            { status: 'Selesai', count: 256, color: 'bg-green-500/10 text-green-400', icon: CheckCircle },
            { status: 'Revisi', count: 8, color: 'bg-orange-500/10 text-orange-400', icon: ArrowUpRight },
            { status: 'Dibatalkan', count: 12, color: 'bg-red-500/10 text-red-400', icon: XCircle },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-xl ${item.color} text-center`}>
              <item.icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">{item.count}</p>
              <p className="text-xs mt-1">{item.status}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
