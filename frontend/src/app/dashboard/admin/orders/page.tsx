'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_ORDERS, MOCK_JOKI } from '@/lib/data';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { 
  Search, Filter, Eye, UserPlus, MessageCircle, 
  CheckCircle2, Clock, AlertCircle, MoreVertical,
  ChevronDown, Download, RefreshCw
} from 'lucide-react';

export default function OrderManagementPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignModal, setAssignModal] = useState<string | null>(null);

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    if (searchQuery && !order.title.toLowerCase().includes(searchQuery.toLowerCase()) && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-muted text-sm mt-1">Kelola semua order masuk, assign joki, dan pantau progress.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari order ID atau judul tugas..."
              className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'pending_payment', label: 'Pending' },
              { id: 'paid', label: 'Dibayar' },
              { id: 'in_progress', label: 'Diproses' },
              { id: 'revision', label: 'Revisi' },
              { id: 'completed', label: 'Selesai' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                  filterStatus === filter.id
                    ? 'bg-primary/10 text-primary-light border border-primary/30'
                    : 'bg-surface-2 text-muted hover:text-foreground border border-border'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {filteredOrders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-6 hover:border-primary/20 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Order Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-primary-light font-medium">{order.id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <h3 className="font-semibold">{order.title}</h3>
                <p className="text-sm text-muted mt-1">{order.description}</p>
              </div>

              {/* Price & Deadline */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-lg font-bold">{formatCurrency(order.price)}</p>
                  <p className="text-xs text-muted flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {order.deadline}
                  </p>
                </div>

                {/* Joki Assignment */}
                <div className="min-w-[140px]">
                  {order.joki_id ? (
                    <div className="flex items-center gap-2 p-2 bg-surface-2 rounded-xl border border-border">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                        {MOCK_JOKI.find((j) => j.id === order.joki_id)?.name.charAt(0)}
                      </div>
                      <span className="text-sm">
                        {MOCK_JOKI.find((j) => j.id === order.joki_id)?.name}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssignModal(order.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary-light rounded-xl text-sm hover:bg-primary/20 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Assign Joki
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-surface-2 rounded-lg transition-colors" title="Chat">
                    <MessageCircle className="w-4 h-4 text-muted" />
                  </button>
                  <button className="p-2 hover:bg-surface-2 rounded-lg transition-colors" title="Detail">
                    <Eye className="w-4 h-4 text-muted" />
                  </button>
                  <button className="p-2 hover:bg-surface-2 rounded-lg transition-colors" title="More">
                    <MoreVertical className="w-4 h-4 text-muted" />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress bar for in-progress orders */}
            {order.status === 'in_progress' && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted mb-2">
                  <span>Progress</span>
                  <span>65%</span>
                </div>
                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAssignModal(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">Assign Joki</h2>
            <p className="text-sm text-muted mb-6">Pilih joki untuk order {assignModal}</p>

            <div className="space-y-3">
              {MOCK_JOKI.filter((j) => j.is_available).map((joki) => (
                <button
                  key={joki.id}
                  onClick={() => setAssignModal(null)}
                  className="w-full flex items-center gap-4 p-4 bg-surface-2 rounded-xl border border-border hover:border-primary/30 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                    {joki.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{joki.name}</p>
                    <p className="text-xs text-muted">{joki.skills.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-yellow-400">★ {joki.rating}</p>
                    <p className="text-xs text-muted">{joki.total_completed} done</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setAssignModal(null)}
              className="w-full mt-4 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors"
            >
              Batal
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
