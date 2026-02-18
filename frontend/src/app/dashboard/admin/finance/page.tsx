'use client';

import { motion } from 'framer-motion';
import { MOCK_STATS } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, Download, Calendar, PieChart
} from 'lucide-react';

const transactions = [
  { id: 1, type: 'income', desc: 'Order DF-ABC123 - Makalah', amount: 150000, date: '18 Feb 2026' },
  { id: 2, type: 'income', desc: 'Order DF-DEF456 - Website', amount: 1500000, date: '18 Feb 2026' },
  { id: 3, type: 'expense', desc: 'Komisi Ahmad Rizky', amount: 90000, date: '17 Feb 2026' },
  { id: 4, type: 'expense', desc: 'Komisi Dina Pratiwi', amount: 825000, date: '17 Feb 2026' },
  { id: 5, type: 'income', desc: 'Order DF-JKL012 - PPT', amount: 85000, date: '17 Feb 2026' },
  { id: 6, type: 'income', desc: 'Order DF-MNO345 - Skripsi', amount: 750000, date: '16 Feb 2026' },
];

export default function FinancePage() {
  const stats = MOCK_STATS;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Keuangan</h1>
          <p className="text-muted text-sm mt-1">Pantau income, profit, dan komisi tim secara realtime.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors">
            <Calendar className="w-4 h-4" />
            Februari 2026
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Finance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: stats.total_income_month, icon: DollarSign, color: 'from-green-500 to-emerald-500', change: '+45%' },
          { label: 'Profit Bersih', value: stats.total_profit_month, icon: TrendingUp, color: 'from-blue-500 to-indigo-500', change: '+38%' },
          { label: 'Total Komisi', value: stats.total_income_month - stats.total_profit_month, icon: Wallet, color: 'from-purple-500 to-pink-500', change: '+52%' },
          { label: 'Rata-rata/Order', value: Math.round(stats.total_income_month / stats.completed_orders), icon: PieChart, color: 'from-cyan-500 to-blue-500', change: '+12%' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(stat.value)}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-6">Riwayat Transaksi</h3>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {tx.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.desc}</p>
                  <p className="text-xs text-muted">{tx.date}</p>
                </div>
              </div>
              <span className={`font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Monthly Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-6">Laporan Bulanan</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted font-medium pb-3 pr-4">Bulan</th>
                <th className="text-right text-xs text-muted font-medium pb-3 pr-4">Order</th>
                <th className="text-right text-xs text-muted font-medium pb-3 pr-4">Income</th>
                <th className="text-right text-xs text-muted font-medium pb-3 pr-4">Komisi</th>
                <th className="text-right text-xs text-muted font-medium pb-3">Profit</th>
              </tr>
            </thead>
            <tbody>
              {[
                { month: 'Februari 2026', orders: 423, income: 187500000, commission: 112500000, profit: 75000000 },
                { month: 'Januari 2026', orders: 387, income: 165000000, commission: 99000000, profit: 66000000 },
                { month: 'Desember 2025', orders: 356, income: 148000000, commission: 88800000, profit: 59200000 },
                { month: 'November 2025', orders: 298, income: 125000000, commission: 75000000, profit: 50000000 },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-4 pr-4 text-sm font-medium">{row.month}</td>
                  <td className="py-4 pr-4 text-sm text-right">{row.orders}</td>
                  <td className="py-4 pr-4 text-sm text-right text-green-400">{formatCurrency(row.income)}</td>
                  <td className="py-4 pr-4 text-sm text-right text-orange-400">{formatCurrency(row.commission)}</td>
                  <td className="py-4 text-sm text-right font-bold text-accent-green">{formatCurrency(row.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
