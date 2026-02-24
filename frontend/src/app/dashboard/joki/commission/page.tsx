'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { apiJokiCommission } from '@/lib/api';
import {
  DollarSign, TrendingUp, Calendar, Download,
  ArrowUpRight, Clock, CheckCircle, Wallet, CreditCard,
  ArrowDownLeft
} from 'lucide-react';

export default function CommissionPage() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [commissionHistory, setCommissionHistory] = useState<Record<string, unknown>[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawn, setWithdrawn] = useState(0);
  const [rate, setRate] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgPerOrder, setAvgPerOrder] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await apiJokiCommission();
      if (res.success) {
        const d = res.data as Record<string, unknown>;
        const totalCommission = Number(d.total_commission ?? 0);
        const totalRevenue = Number(d.total_revenue ?? 0);
        const orders = Number(d.total_orders ?? 0);
        const commissionRate = Number(d.commission_rate ?? 0);

        setTotalEarned(totalCommission);
        setPendingAmount(0);
        setAvailableBalance(totalCommission);
        setWithdrawn(0);
        setRate(commissionRate);
        setTotalOrders(orders);
        setAvgPerOrder(orders > 0 ? Math.round(totalRevenue / orders) : 0);

        if (d.monthly) {
          setCommissionHistory((d.monthly as Record<string, unknown>[]).map((m, i) => ({
            id: i,
            orderId: '',
            title: `Komisi ${m.month}`,
            amount: Number(m.commission ?? 0),
            status: 'paid',
            date: String(m.month ?? ''),
            type: 'commission',
          })));
        }
      }
    }
    load();
  }, []);

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
            <p className="text-3xl font-bold text-accent">{rate}%</p>
            <p className="text-xs text-muted mt-1">Rate Komisi Kamu</p>
          </div>
          <div className="p-4 bg-surface-2 rounded-xl border border-border text-center">
            <p className="text-3xl font-bold text-primary-light">{totalOrders}</p>
            <p className="text-xs text-muted mt-1">Total Order Selesai</p>
          </div>
          <div className="p-4 bg-surface-2 rounded-xl border border-border text-center">
            <p className="text-3xl font-bold text-accent-green">{formatCurrency(avgPerOrder)}</p>
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
          {commissionHistory.map((tx, i) => (
            <motion.div
              key={tx.id as string}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'withdrawal' ? 'bg-red-500/10' :
                    tx.type === 'bonus' ? 'bg-yellow-500/10' :
                      'bg-green-500/10'
                  }`}>
                  {tx.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5 text-red-400" /> :
                    tx.type === 'bonus' ? <DollarSign className="w-5 h-5 text-yellow-400" /> :
                      <ArrowDownLeft className="w-5 h-5 text-green-400" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.title as string}</p>
                  <p className="text-xs text-muted">
                    {tx.orderId ? <span className="font-mono">{tx.orderId as string} • </span> : null}
                    {tx.date as string}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${(tx.amount as number) > 0 ? 'text-accent-green' : 'text-red-400'}`}>
                  {(tx.amount as number) > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount as number))}
                </p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${tx.status === 'paid' || tx.status === 'completed' ? 'bg-green-500/10 text-green-400' :
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
                  <option>DANA - 082291220759</option>
                  <option>OVO - 082291220759</option>
                  <option>GoPay - 082291220759</option>
                  <option>ShopeePay - 082291220759</option>
                  <option>Bank BRI - 082291220759</option>
                  <option>SeaBank - 082291220759</option>
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
