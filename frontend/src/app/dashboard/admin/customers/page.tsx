'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import {
  Users, Search, Star,
  Eye, TrendingUp,
  UserPlus, Crown, MessageSquare,
  Mail, Phone, Calendar, ChevronRight
} from 'lucide-react';
import { apiAdminCustomers } from '@/lib/api';
import { TableSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

const TIER_COLORS = {
  bronze: 'bg-orange-500/10 text-orange-400',
  silver: 'bg-gray-400/10 text-gray-400',
  gold: 'bg-yellow-500/10 text-yellow-400',
  platinum: 'bg-purple-500/10 text-purple-400',
};

const TIER_LABELS = {
  bronze: 'Bronze Member',
  silver: 'Silver Member',
  gold: 'Gold Member',
  platinum: 'Platinum Member',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      const res = await apiAdminCustomers();
      if (res.success) {
        setCustomers(res.data.customers);
        setStats(res.data.stats);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || c.tier?.toLowerCase() === filterTier.toLowerCase();
    return matchesSearch && matchesTier;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Pelanggan</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="glass h-24 rounded-2xl animate-pulse" />)}
        </div>
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pelanggan</h1>
          <p className="text-muted text-sm mt-1">Kelola data pelanggan dan loyalitas.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pelanggan', value: stats?.total || 0, icon: Users, color: 'from-blue-500 to-indigo-500', change: 'Total' },
          { label: 'Pelanggan Baru', value: stats?.new || 0, icon: UserPlus, color: 'from-green-500 to-emerald-500', change: 'Bulan ini' },
          { label: 'Pelanggan Aktif', value: stats?.active || 0, icon: TrendingUp, color: 'from-purple-500 to-pink-500', change: 'Status' },
          { label: 'Pelanggan Premium', value: stats?.premium || 0, icon: Crown, color: 'from-yellow-500 to-amber-500', change: 'Top Tier' },
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
              <span className="text-[10px] text-muted font-medium uppercase">{stat.change}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Cari pelanggan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 text-foreground"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'bronze', 'silver', 'gold', 'platinum'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-4 py-2.5 rounded-xl text-sm transition-all ${filterTier === tier
                ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                : 'bg-surface-2 border border-border text-muted hover:border-primary/30'
                }`}
            >
              {tier === 'all' ? 'Semua' : (TIER_LABELS[tier as keyof typeof TIER_LABELS] || tier)}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase">Pelanggan</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase">Tier</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase">Orders</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase">Total Spent</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase">Terakhir Order</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, i) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-surface-2/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg font-bold">
                          {customer.avatar || '👤'}
                        </div>
                        <div>
                          <p className="font-medium text-sm group-hover:text-primary-light transition-colors">{customer.name}</p>
                          <p className="text-xs text-muted">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${TIER_COLORS[customer.tier?.toLowerCase() as keyof typeof TIER_COLORS] || 'bg-gray-500/10 text-gray-400'}`}>
                        {TIER_LABELS[customer.tier?.toLowerCase() as keyof typeof TIER_LABELS] || customer.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{customer.totalOrders}</td>
                    <td className="px-6 py-4 text-sm font-bold text-accent-green">{formatCurrency(customer.totalSpent)}</td>
                    <td className="px-6 py-4 text-sm text-muted">{customer.lastOrder}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 hover:bg-surface rounded-lg text-muted hover:text-foreground">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-surface rounded-lg text-muted hover:text-foreground">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <EmptyState
                      icon={Users}
                      title="Tidak ada pelanggan"
                      description={searchTerm ? `Pencarian "${searchTerm}" tidak menemukan hasil.` : "Belum ada pelanggan yang terdaftar."}
                      actionLabel={searchTerm ? "Reset Pencarian" : undefined}
                      onAction={() => setSearchTerm('')}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCustomer(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center text-3xl mx-auto mb-3">
                {selectedCustomer.avatar || '👤'}
              </div>
              <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
              <p className="text-sm text-muted">{selectedCustomer.university || 'Internal Member'}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${TIER_COLORS[selectedCustomer.tier?.toLowerCase() as keyof typeof TIER_COLORS] || 'bg-gray-500/10 text-gray-400'}`}>
                {TIER_LABELS[selectedCustomer.tier?.toLowerCase() as keyof typeof TIER_LABELS] || selectedCustomer.tier}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl">
                <Mail className="w-4 h-4 text-muted" />
                <span className="text-sm">{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl">
                <Phone className="w-4 h-4 text-muted" />
                <span className="text-sm">{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl">
                <Calendar className="w-4 h-4 text-muted" />
                <span className="text-sm">Bergabung {selectedCustomer.joinDate}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-3 bg-surface-2 rounded-xl">
                  <p className="text-lg font-bold">{selectedCustomer.totalOrders}</p>
                  <p className="text-[10px] text-muted">Orders</p>
                </div>
                <div className="text-center p-3 bg-surface-2 rounded-xl">
                  <p className="text-lg font-bold text-accent-green">{formatCurrency(selectedCustomer.totalSpent)}</p>
                  <p className="text-[10px] text-muted">Spent</p>
                </div>
                <div className="text-center p-3 bg-surface-2 rounded-xl">
                  <p className="text-lg font-bold flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {selectedCustomer.rating || '-'}
                  </p>
                  <p className="text-[10px] text-muted">Rating</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full mt-6 py-3 bg-surface-2 border border-border rounded-xl hover:border-primary/30 text-sm font-medium transition-colors"
            >
              Tutup
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
