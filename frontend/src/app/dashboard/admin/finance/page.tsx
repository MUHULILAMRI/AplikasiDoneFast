'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiAdminFinance } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, Download, Calendar, PieChart
} from 'lucide-react';

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([]);
  const [txSummary, setTxSummary] = useState<any>({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiAdminFinance();
        if (res.success) {
          const d = res.data as Record<string, any>;
          setStats(d.summary || {});
          setTxSummary(d.transaction_summary || {});
          if (d.transactions) {
            const raw = d.transactions as Record<string, unknown>[];
            setTransactions(raw.map(t => ({
              ...t,
              amount: Number(t.amount ?? 0),
              desc: (t.order as Record<string, unknown>)?.title ?? 'Transaction',
              date: t.created_at ? new Date(t.created_at as string).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
              user_name: (t.user as any)?.name ?? 'Customer',
            })));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const profitMargin = stats.total_revenue > 0 ? (stats.total_profit / stats.total_revenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Keuangan & Analitik</h1>
          <p className="text-muted text-sm mt-1">Pantau arus kas, distribusi profit, dan performa finansial platform secara realtime.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-2 border border-border rounded-xl text-sm font-bold hover:border-primary/50 transition-all">
            <Calendar className="w-4 h-4 text-primary-light" />
            Laporan Kustom
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Finance Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: stats.total_revenue || 0,
            icon: DollarSign,
            color: 'from-blue-600 to-cyan-500',
            trend: '+12.5%',
            isTrendUp: true,
            desc: 'Total seluruh transaksi dibayar'
          },
          {
            label: 'Net Profit',
            value: stats.total_profit || 0,
            icon: TrendingUp,
            color: 'from-emerald-600 to-green-500',
            trend: '+8.2%',
            isTrendUp: true,
            desc: 'Keuntungan bersih platform'
          },
          {
            label: 'Joki Commissions',
            value: stats.total_commission || 0,
            icon: Wallet,
            color: 'from-purple-600 to-pink-500',
            trend: '+15.3%',
            isTrendUp: true,
            desc: 'Total bagi hasil ke tim joki'
          },
          {
            label: 'Avg. Order Value',
            value: stats.avg_order_value || 0,
            icon: PieChart,
            color: 'from-orange-500 to-amber-500',
            trend: '-2.1%',
            isTrendUp: false,
            desc: 'Rata-rata nilai per transaksi'
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group glass rounded-2xl p-6 hover:border-primary/40 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${stat.isTrendUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                {stat.isTrendUp ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-2xl font-black tracking-tight">{formatCurrency(stat.value)}</p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1.5">{stat.label}</p>
            <p className="text-[10px] text-muted/60 mt-3 italic">{stat.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Distribution Visual */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 glass rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2">Distribusi Profit</h3>
            <p className="text-xs text-muted mb-8 text-balance">Rasio bagi hasil antara joki dan platform berdasarkan komisi saat ini.</p>

            <div className="space-y-6">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black inline-block py-1 px-2 uppercase rounded-full bg-primary/20 text-primary-light">
                      Profit Platform
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-primary-light">
                      {Math.round(profitMargin)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-surface-2 border border-border/50">
                  <div style={{ width: `${profitMargin}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary to-primary-light transition-all duration-1000"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Profit Month</p>
                  <p className="text-lg font-black text-primary-light">{formatCurrency(stats.monthly_profit || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Commission Month</p>
                  <p className="text-lg font-black text-foreground">{formatCurrency(stats.monthly_revenue - stats.monthly_profit || 0)}</p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 mt-6">
                <div className="flex items-start gap-3">
                  <PieChart className="w-5 h-5 text-primary-light shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-muted">
                    Margin profit platform bulan ini berada di angka <span className="text-foreground font-bold">{Math.round(profitMargin)}%</span>. Upayakan optimasi komisi joki untuk mencapai target profit yang diinginkan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BG Decoration */}
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mb-24 -mr-24 blur-3xl" />
        </motion.div>

        {/* Recent Transactions List - Advanced View */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass rounded-3xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Transaksi Terbaru</h3>
              <p className="text-xs text-muted mt-1">Status pembayaran realtime dari pelanggan.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right mr-3 hidden sm:block">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Paid Total</p>
                <p className="text-xs font-black text-green-400">{txSummary.paid || 0} Tx</p>
              </div>
              <button className="p-2 hover:bg-surface-2 rounded-xl border border-border transition-colors">
                <TrendingUp className="w-4 h-4 text-muted" />
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.map((tx, idx) => (
              <div key={tx.id as string} className="group flex items-center justify-between p-4 bg-surface-2/30 border border-border/50 rounded-2xl hover:border-primary/30 transition-all hover:bg-surface-2/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${(tx.payment_status as string) === 'PAID' ? 'bg-green-500/10' : 'bg-orange-500/10'
                    }`}>
                    {(tx.payment_status as string) === 'PAID' ? (
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-orange-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold group-hover:text-primary-light transition-colors line-clamp-1">{tx.desc as string}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium text-muted">{tx.user_name as string}</span>
                      <span className="text-[10px] text-muted/40">•</span>
                      <span className="text-[10px] font-medium text-muted" suppressHydrationWarning>{tx.date as string}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${(tx.payment_status as string) === 'PAID' ? 'text-green-400' : 'text-orange-400'}`}>
                    {(tx.payment_status as string) === 'PAID' ? '+' : ''}{formatCurrency(tx.amount as number)}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-tighter text-muted/60 mt-1">{tx.payment_status as string}</p>
                </div>
              </div>
            ))}

            {loading && transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-xs font-medium">Memuat data transaksi...</p>
              </div>
            )}

            {!loading && transactions.length === 0 && (
              <div className="text-center py-20 text-muted">
                <PieChart className="w-10 h-10 mx-auto mb-4 opacity-20" />
                <p className="text-xs font-medium">Belum ada transaksi terekam.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Analytics Breakdown Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-3xl p-8 overflow-hidden relative"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold">Laporan Performa Finansial</h3>
            <p className="text-xs text-muted mt-1">Rekapitulasi pendapatan dan margin profit bulanan.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[10px] text-muted font-black uppercase tracking-widest pb-4 pr-4">Periode</th>
                <th className="text-right text-[10px] text-muted font-black uppercase tracking-widest pb-4 pr-4">Volume</th>
                <th className="text-right text-[10px] text-muted font-black uppercase tracking-widest pb-4 pr-4">Gross Revenue</th>
                <th className="text-right text-[10px] text-muted font-black uppercase tracking-widest pb-4 pr-4">Net Profit</th>
                <th className="text-right text-[10px] text-muted font-black uppercase tracking-widest pb-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  month: 'Februari 2026',
                  orders: txSummary.paid || 0,
                  income: stats.monthly_revenue || 0,
                  profit: stats.monthly_profit || 0,
                  status: 'Active'
                },
                {
                  month: 'Januari 2026',
                  orders: 387,
                  income: 165000000,
                  profit: 66000000,
                  status: 'Completed'
                },
                {
                  month: 'Desember 2025',
                  orders: 356,
                  income: 148000000,
                  profit: 59200000,
                  status: 'Completed'
                },
                {
                  month: 'November 2025',
                  orders: 298,
                  income: 125000000,
                  profit: 50000000,
                  status: 'Completed'
                },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/10 group hover:bg-primary/5 transition-colors">
                  <td className="py-5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary shadow-glow shadow-primary" />
                      <span className="text-sm font-bold">{row.month}</span>
                    </div>
                  </td>
                  <td className="py-5 pr-4 text-sm text-right font-medium text-muted">{row.orders} Orders</td>
                  <td className="py-5 pr-4 text-sm text-right font-black text-foreground">{formatCurrency(row.income)}</td>
                  <td className="py-5 pr-4 text-sm text-right font-black text-primary-light">{formatCurrency(row.profit)}</td>
                  <td className="py-5 text-right">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${row.status === 'Active' ? 'bg-primary/10 border-primary/20 text-primary-light' : 'bg-surface-2 border-border/50 text-muted'
                      }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
