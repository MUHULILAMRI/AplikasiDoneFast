'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import {
  Users, Search, Filter, ChevronDown, Mail,
  Phone, MapPin, Calendar, ShoppingBag, Star,
  MoreVertical, Eye, Ban, MessageSquare, TrendingUp,
  UserPlus, Crown
} from 'lucide-react';

const CUSTOMERS = [
  {
    id: '1', name: 'Ahmad Rizki', email: 'ahmad@gmail.com', phone: '081234567890',
    university: 'Universitas Indonesia', avatar: '🧑‍🎓', joinDate: '2024-12-15',
    totalOrders: 12, totalSpent: 3450000, lastOrder: '2025-01-10', status: 'active', rating: 4.8, tier: 'gold'
  },
  {
    id: '2', name: 'Siti Nurhaliza', email: 'siti@gmail.com', phone: '081298765432',
    university: 'ITB', avatar: '👩‍💻', joinDate: '2025-01-02',
    totalOrders: 5, totalSpent: 1200000, lastOrder: '2025-01-12', status: 'active', rating: 4.5, tier: 'silver'
  },
  {
    id: '3', name: 'Budi Santoso', email: 'budi@gmail.com', phone: '081345678901',
    university: 'UGM', avatar: '🧑‍🔬', joinDate: '2024-10-20',
    totalOrders: 25, totalSpent: 8750000, lastOrder: '2025-01-08', status: 'active', rating: 4.9, tier: 'platinum'
  },
  {
    id: '4', name: 'Dian Permata', email: 'dian@gmail.com', phone: '081456789012',
    university: 'Unpad', avatar: '👩‍🎓', joinDate: '2025-01-05',
    totalOrders: 2, totalSpent: 450000, lastOrder: '2025-01-11', status: 'active', rating: 0, tier: 'bronze'
  },
  {
    id: '5', name: 'Fajar Nugroho', email: 'fajar@gmail.com', phone: '081567890123',
    university: 'Undip', avatar: '🧑‍💼', joinDate: '2024-08-15',
    totalOrders: 30, totalSpent: 12500000, lastOrder: '2024-12-20', status: 'inactive', rating: 4.7, tier: 'platinum'
  },
  {
    id: '6', name: 'Rina Sari', email: 'rina@gmail.com', phone: '081678901234',
    university: 'ITS', avatar: '👩‍🔬', joinDate: '2024-11-10',
    totalOrders: 8, totalSpent: 2800000, lastOrder: '2025-01-09', status: 'active', rating: 4.6, tier: 'gold'
  },
];

const TIER_COLORS: Record<string, string> = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-amber-300',
  platinum: 'from-indigo-400 to-purple-300',
};

const TIER_LABELS: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof CUSTOMERS[0] | null>(null);

  const filtered = CUSTOMERS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.includes(searchQuery);
    const matchTier = filterTier === 'all' || c.tier === filterTier;
    return matchSearch && matchTier;
  });

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
          { label: 'Total Pelanggan', value: '5,234', icon: Users, color: 'from-blue-500 to-indigo-500', change: '+12%' },
          { label: 'Pelanggan Baru (Bulan ini)', value: '128', icon: UserPlus, color: 'from-green-500 to-emerald-500', change: '+8%' },
          { label: 'Pelanggan Aktif', value: '3,456', icon: TrendingUp, color: 'from-purple-500 to-pink-500', change: '+5%' },
          { label: 'Pelanggan Premium', value: '234', icon: Crown, color: 'from-yellow-500 to-amber-500', change: '+15%' },
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
              <span className="text-xs text-accent-green font-medium">{stat.change}</span>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'bronze', 'silver', 'gold', 'platinum'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                filterTier === tier
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                  : 'bg-surface-2 border border-border text-muted hover:border-primary/30'
              }`}
            >
              {tier === 'all' ? 'Semua' : TIER_LABELS[tier]}
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
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase">Universitas</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase">Tier</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase">Orders</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase">Total Spent</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase">Rating</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, i) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg">
                        {customer.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-muted">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{customer.university}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gradient-to-r ${TIER_COLORS[customer.tier]} text-white`}>
                      {TIER_LABELS[customer.tier]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{customer.totalOrders}</td>
                  <td className="px-6 py-4 text-sm font-medium text-accent-green">{formatCurrency(customer.totalSpent)}</td>
                  <td className="px-6 py-4">
                    {customer.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{customer.rating}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                      customer.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {customer.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 hover:bg-surface rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-muted" />
                      </button>
                      <button className="p-2 hover:bg-surface rounded-lg transition-colors">
                        <MessageSquare className="w-4 h-4 text-muted" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
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
                {selectedCustomer.avatar}
              </div>
              <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
              <p className="text-sm text-muted">{selectedCustomer.university}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${TIER_COLORS[selectedCustomer.tier]} text-white`}>
                {TIER_LABELS[selectedCustomer.tier]} Member
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
                  <p className="text-[10px] text-muted">Total Spent</p>
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
              className="w-full mt-6 py-3 bg-surface-2 border border-border rounded-xl hover:border-primary/30 text-sm"
            >
              Tutup
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
