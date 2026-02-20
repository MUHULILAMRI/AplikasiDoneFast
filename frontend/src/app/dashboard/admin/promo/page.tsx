'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiGetVouchers, apiCreateVoucher, apiUpdateVoucher, apiDeleteVoucher } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Gift, Plus, Tag, Percent, Users, Copy, Edit,
  Trash2, ToggleLeft, ToggleRight, Link2
} from 'lucide-react';

export default function PromoPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [vouchers, setVouchers] = useState<Record<string, unknown>[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discount_percent: 0,
    max_discount: 0,
    min_order: 0,
    max_usage: 100,
    valid_until: '',
  });

  useEffect(() => {
    async function load() {
      const res = await apiGetVouchers({ includeInactive: true });
      if (res.success) setVouchers(res.data as Record<string, unknown>[]);
    }
    load();
  }, []);

  const stats = {
    active: vouchers.filter((v) => v.is_active).length,
    usage: vouchers.reduce((sum, v) => sum + Number(v.usage_count ?? 0), 0),
    totalDiscount: vouchers.reduce((sum, v) => sum + Number(v.max_discount ?? 0), 0),
  };

  async function handleCreate() {
    try {
      setIsSaving(true);
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount_percent: Number(form.discount_percent) || 0,
        max_discount: Number(form.max_discount) || 0,
        min_order: Number(form.min_order) || 0,
        max_usage: Number(form.max_usage) || 0,
        valid_until: form.valid_until,
      };

      if (!payload.code || !payload.valid_until) {
        alert('Kode dan tanggal berlaku wajib diisi');
        return;
      }

      const res = await apiCreateVoucher(payload);
      if (!res.success) {
        alert(res.error || 'Gagal membuat voucher');
        return;
      }

      setVouchers((prev) => [res.data as Record<string, unknown>, ...prev]);
      setShowCreateModal(false);
      setForm({ code: '', discount_percent: 0, max_discount: 0, min_order: 0, max_usage: 100, valid_until: '' });
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat membuat voucher');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    try {
      const res = await apiUpdateVoucher(id, { is_active: !isActive });
      if (!res.success) {
        alert(res.error || 'Gagal mengubah status voucher');
        return;
      }
      const data = res.data as Record<string, unknown>;
      setVouchers((prev) => prev.map((v) => (v.id === id ? data : v)));
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat mengubah status voucher');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Nonaktifkan voucher ini?')) return;
    try {
      const res = await apiDeleteVoucher(id);
      if (!res.success) {
        alert(res.error || 'Gagal menonaktifkan voucher');
        return;
      }
      setVouchers((prev) => prev.map((v) => (v.id === id ? { ...v, is_active: false } : v)));
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menonaktifkan voucher');
    }
  }

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
          { label: 'Voucher Aktif', value: String(stats.active), icon: Tag, color: 'from-purple-500 to-pink-500' },
          { label: 'Total Penggunaan', value: String(stats.usage), icon: Users, color: 'from-blue-500 to-indigo-500' },
          { label: 'Total Diskon Maks', value: formatCurrency(stats.totalDiscount), icon: Percent, color: 'from-orange-500 to-red-500' },
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
          {vouchers.map((voucher, i) => (
            <motion.div
              key={voucher.id as string}
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
                    <span className="font-mono font-bold text-primary-light">{voucher.code as string}</span>
                    <button className="p-1 hover:bg-surface rounded transition-colors">
                      <Copy className="w-3 h-3 text-muted" />
                    </button>
                  </div>
                  <p className="text-sm text-muted">
                    Diskon {voucher.discount_percent as number}% • Min. order {formatCurrency(voucher.min_order as number)} • Maks. {formatCurrency(voucher.max_discount as number)}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Digunakan {voucher.usage_count as number}/{voucher.max_usage as number} • Berlaku s/d {voucher.valid_until ? new Date(voucher.valid_until as string).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(voucher.id as string, Boolean(voucher.is_active))}
                  className={`p-2 rounded-lg transition-colors ${voucher.is_active ? 'text-green-400' : 'text-muted'}`}
                >
                  {voucher.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <button className="p-2 hover:bg-surface rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-muted" />
                </button>
                <button
                  onClick={() => handleDelete(voucher.id as string)}
                  className="p-2 hover:bg-surface rounded-lg transition-colors hover:text-red-400"
                >
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
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="PROMO2026"
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Diskon (%)</label>
                  <input
                    type="number"
                    value={form.discount_percent}
                    onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })}
                    placeholder="20"
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Maks. Diskon</label>
                  <input
                    type="number"
                    value={form.max_discount}
                    onChange={(e) => setForm({ ...form, max_discount: Number(e.target.value) })}
                    placeholder="50000"
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Min. Order</label>
                  <input
                    type="number"
                    value={form.min_order}
                    onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })}
                    placeholder="100000"
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Maks. Penggunaan</label>
                  <input
                    type="number"
                    value={form.max_usage}
                    onChange={(e) => setForm({ ...form, max_usage: Number(e.target.value) })}
                    placeholder="500"
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Berlaku Sampai</label>
                <input
                  type="date"
                  value={form.valid_until}
                  onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-surface-2 border border-border rounded-xl hover:border-primary/30">
                  Batal
                </button>
                <button
                  disabled={isSaving}
                  onClick={handleCreate}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-60"
                >
                  {isSaving ? 'Menyimpan...' : 'Buat Voucher'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
