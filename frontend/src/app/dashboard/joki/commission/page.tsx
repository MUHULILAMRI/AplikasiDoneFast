'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign, TrendingUp, Calendar, Download,
  ArrowUpRight, Clock, CheckCircle, Wallet, CreditCard,
  ArrowDownLeft
} from 'lucide-react';

const COMMISSION_HISTORY = [
  { id: 1, orderId: 'ORD-098', title: 'Website Portfolio React', amount: 350000, status: 'paid', date: '2025-01-10', type: 'commission' },
  { id: 2, orderId: 'ORD-097', title: 'Skripsi BAB 2', amount: 280000, status: 'paid', date: '2025-01-08', type: 'commission' },
  { id: 3, orderId: 'ORD-096', title: 'Tugas Database SQL', amount: 140000, status: 'paid', date: '2025-01-05', type: 'commission' },
  { id: 4, orderId: 'ORD-095', title: 'Revisi Proposal Tesis', amount: 175000, status: 'pending', date: '2025-01-12', type: 'commission' },
  { id: 5, orderId: 'ORD-001', title: 'Skripsi BAB 3', amount: 245000, status: 'pending', date: '2025-01-15', type: 'commission' },
  { id: 6, orderId: '', title: 'Withdrawal ke DANA', amount: -500000, status: 'completed', date: '2025-01-07', type: 'withdrawal' },
  { id: 7, orderId: '', title: 'Bonus Top Performer', amount: 100000, status: 'paid', date: '2025-01-01', type: 'bonus' },
];

export default function CommissionPage() {
  const [showWithdraw, setShowWithdraw] = useState(false);

  const totalEarned = 4200000;
  const pendingAmount = 420000;
  const availableBalance = 1250000;
  const withdrawn = 2530000;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Komisi Saya</h1>
          <p className="text-muted text-sm mt-1">Pantau pendapatan dan kelola penarikan.</p>
        </div>
        <button
          onClick={() => setShowWithdraw(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent to-primary text-white rounded-xl text-sm font-medium hover:opacity-90"
        >
          <Wallet className="w-4 h-4" />
          Tarik Saldo
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pendapatan', value: formatCurrency(totalEarned), icon: DollarSign, color: 'from-green-500 to-emerald-500' },
          { label: 'Saldo Tersedia', value: formatCurrency(availableBalance), icon: Wallet, color: 'from-purple-500 to-pink-500' },
          { label: 'Menunggu Bayar', value: formatCurrency(pendingAmount), icon: Clock, color: 'from-yellow-500 to-amber-500' },
          { label: 'Sudah Ditarik', value: formatCurrency(withdrawn), icon: ArrowUpRight, color: 'from-blue-500 to-indigo-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Commission Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          Informasi Komisi
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-surface-2 rounded-xl border border-border text-center">
            <p className="text-3xl font-bold text-accent">70%</p>
            <p className="text-xs text-muted mt-1">Rate Komisi Kamu</p>
          </div>
          <div className="p-4 bg-surface-2 rounded-xl border border-border text-center">
            <p className="text-3xl font-bold text-primary-light">52</p>
            <p className="text-xs text-muted mt-1">Total Order Selesai</p>
          </div>
          <div className="p-4 bg-surface-2 rounded-xl border border-border text-center">
            <p className="text-3xl font-bold text-accent-green">{formatCurrency(80769)}</p>
            <p className="text-xs text-muted mt-1">Rata-rata per Order</p>
          </div>
        </div>
        <p className="text-xs text-muted mt-3 p-3 bg-primary/5 border border-primary/10 rounded-xl">
          💡 Tip: Selesaikan 10 order lagi untuk naik ke tier Platinum dengan komisi 75%!
        </p>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Riwayat Transaksi</h3>
          <button className="flex items-center gap-1 text-xs text-muted hover:text-foreground">
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
        <div className="space-y-3">
          {COMMISSION_HISTORY.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'withdrawal' ? 'bg-red-500/10' :
                  tx.type === 'bonus' ? 'bg-yellow-500/10' :
                  'bg-green-500/10'
                }`}>
                  {tx.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5 text-red-400" /> :
                   tx.type === 'bonus' ? <DollarSign className="w-5 h-5 text-yellow-400" /> :
                   <ArrowDownLeft className="w-5 h-5 text-green-400" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.title}</p>
                  <p className="text-xs text-muted">
                    {tx.orderId && <span className="font-mono">{tx.orderId} • </span>}
                    {tx.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${tx.amount > 0 ? 'text-accent-green' : 'text-red-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                </p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  tx.status === 'paid' || tx.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {tx.status === 'paid' ? 'Dibayar' : tx.status === 'completed' ? 'Selesai' : 'Pending'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowWithdraw(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">Tarik Saldo</h2>
            <p className="text-sm text-muted mb-6">Saldo tersedia: <span className="text-accent-green font-bold">{formatCurrency(availableBalance)}</span></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Jumlah Penarikan</label>
                <input type="number" placeholder="Masukkan jumlah" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Metode Penarikan</label>
                <select className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50">
                  <option>DANA - 081234567890</option>
                  <option>OVO - 081234567890</option>
                  <option>Bank BCA - 1234567890</option>
                  <option>GoPay - 081234567890</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowWithdraw(false)} className="flex-1 py-3 bg-surface-2 border border-border rounded-xl hover:border-primary/30 text-sm">
                  Batal
                </button>
                <button onClick={() => setShowWithdraw(false)} className="flex-1 py-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl font-medium hover:opacity-90">
                  Tarik Saldo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
