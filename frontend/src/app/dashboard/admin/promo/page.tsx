'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_VOUCHERS } from '@/lib/data';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Gift, Plus, Tag, Percent, Users, Copy, Edit,
  Trash2, ToggleLeft, ToggleRight, Link2
} from 'lucide-react';

export default function PromoPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Promo & Voucher</h1>
          <p className="text-muted text-sm mt-1">Kelola voucher, diskon, referral, dan sistem affiliate.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Buat Voucher
        </button>
      </div>

      {/* Promo Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Voucher Aktif', value: '5', icon: Tag, color: 'from-purple-500 to-pink-500' },
          { label: 'Total Penggunaan', value: '234', icon: Users, color: 'from-blue-500 to-indigo-500' },
          { label: 'Total Diskon', value: formatCurrency(12500000), icon: Percent, color: 'from-orange-500 to-red-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Voucher List */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-6">Daftar Voucher</h3>
        <div className="space-y-4">
          {MOCK_VOUCHERS.map((voucher, i) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-surface-2 rounded-xl border border-border hover:border-primary/20 transition-all gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                  <Gift className="w-6 h-6 text-primary-light" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-primary-light">{voucher.code}</span>
                    <button className="p-1 hover:bg-surface rounded transition-colors">
                      <Copy className="w-3 h-3 text-muted" />
                    </button>
                  </div>
                  <p className="text-sm text-muted">
                    Diskon {voucher.discount_percent}% • Min. order {formatCurrency(voucher.min_order)} • Maks. {formatCurrency(voucher.max_discount)}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Digunakan {voucher.usage_count}/{voucher.max_usage} • Berlaku s/d {voucher.valid_until}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg transition-colors ${voucher.is_active ? 'text-green-400' : 'text-muted'}`}>
                  {voucher.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <button className="p-2 hover:bg-surface rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-muted" />
                </button>
                <button className="p-2 hover:bg-surface rounded-lg transition-colors hover:text-red-400">
                  <Trash2 className="w-4 h-4 text-muted" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Referral & Affiliate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-accent" />
            Sistem Referral
          </h3>
          <p className="text-sm text-muted mb-4">
            User dapat mengajak teman untuk mendapat reward. Setiap referral yang berhasil order mendapat bonus saldo.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-surface-2 rounded-xl border border-border">
              <span className="text-sm">Bonus Referrer</span>
              <span className="font-medium text-accent-green">{formatCurrency(25000)}</span>
            </div>
            <div className="flex justify-between p-3 bg-surface-2 rounded-xl border border-border">
              <span className="text-sm">Bonus Referee</span>
              <span className="font-medium text-accent-green">{formatCurrency(15000)}</span>
            </div>
            <div className="flex justify-between p-3 bg-surface-2 rounded-xl border border-border">
              <span className="text-sm">Total Referral</span>
              <span className="font-bold">156</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-light" />
            Sistem Affiliate
          </h3>
          <p className="text-sm text-muted mb-4">
            Reseller kampus dan affiliate mendapat komisi dari setiap order yang dibawa.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-surface-2 rounded-xl border border-border">
              <span className="text-sm">Total Affiliate</span>
              <span className="font-bold">23</span>
            </div>
            <div className="flex justify-between p-3 bg-surface-2 rounded-xl border border-border">
              <span className="text-sm">Komisi Rate</span>
              <span className="font-medium text-primary-light">10%</span>
            </div>
            <div className="flex justify-between p-3 bg-surface-2 rounded-xl border border-border">
              <span className="text-sm">Total Komisi Dibayar</span>
              <span className="font-medium text-accent-green">{formatCurrency(8500000)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Voucher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-8 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-6">Buat Voucher Baru</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kode Voucher</label>
                <input type="text" placeholder="PROMO2026" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Diskon (%)</label>
                  <input type="number" placeholder="20" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Maks. Diskon</label>
                  <input type="number" placeholder="50000" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Min. Order</label>
                  <input type="number" placeholder="100000" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Maks. Penggunaan</label>
                  <input type="number" placeholder="500" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Berlaku Sampai</label>
                <input type="date" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-surface-2 border border-border rounded-xl hover:border-primary/30">
                  Batal
                </button>
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-medium hover:opacity-90">
                  Buat Voucher
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
