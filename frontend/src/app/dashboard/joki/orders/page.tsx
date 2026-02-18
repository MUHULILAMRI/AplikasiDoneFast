'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import {
  ClipboardList, Clock, CheckCircle, Play, AlertCircle,
  Timer, Eye, MessageSquare, Upload, ChevronDown,
  Filter, Search, XCircle, RotateCcw
} from 'lucide-react';

const ORDERS = [
  {
    id: 'ORD-001', title: 'Skripsi BAB 3 - Metodologi Penelitian', customer: 'Ahmad Rizki',
    category: 'Akademik', deadline: '2025-01-15', price: 350000, commission: 245000,
    status: 'in_progress', progress: 70, priority: 'high',
    description: 'Menulis BAB 3 tentang metodologi penelitian kuantitatif. Framework: survey, populasi mahasiswa UI.',
    files: ['brief.pdf', 'referensi.docx']
  },
  {
    id: 'ORD-002', title: 'Tugas Coding Python - Machine Learning', customer: 'Siti Nurhaliza',
    category: 'Coding', deadline: '2025-01-18', price: 200000, commission: 140000,
    status: 'in_progress', progress: 30, priority: 'medium',
    description: 'Implementasi model klasifikasi menggunakan Random Forest dan SVM. Dataset sudah disediakan.',
    files: ['dataset.csv', 'tugas_ml.pdf']
  },
  {
    id: 'ORD-003', title: 'Makalah Hukum Bisnis', customer: 'Budi Santoso',
    category: 'Akademik', deadline: '2025-01-20', price: 150000, commission: 105000,
    status: 'pending', progress: 0, priority: 'low',
    description: 'Makalah tentang aspek hukum dalam bisnis e-commerce di Indonesia. 15-20 halaman.',
    files: ['outline.pdf']
  },
  {
    id: 'ORD-098', title: 'Website Portfolio React', customer: 'Dian Permata',
    category: 'Coding', deadline: '2025-01-10', price: 500000, commission: 350000,
    status: 'completed', progress: 100, priority: 'medium',
    description: 'Website portfolio responsive menggunakan React + Tailwind CSS.',
    files: ['design.fig']
  },
  {
    id: 'ORD-095', title: 'Revisi Proposal Tesis', customer: 'Fajar Nugroho',
    category: 'Akademik', deadline: '2025-01-12', price: 250000, commission: 175000,
    status: 'revision', progress: 85, priority: 'high',
    description: 'Revisi bagian latar belakang dan rumusan masalah sesuai feedback dosen.',
    files: ['proposal_v1.docx', 'feedback.pdf']
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Menunggu', color: 'bg-yellow-500/10 text-yellow-400', icon: Clock },
  in_progress: { label: 'Dikerjakan', color: 'bg-blue-500/10 text-blue-400', icon: Play },
  completed: { label: 'Selesai', color: 'bg-green-500/10 text-green-400', icon: CheckCircle },
  revision: { label: 'Revisi', color: 'bg-orange-500/10 text-orange-400', icon: RotateCcw },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-500/10 text-red-400', icon: XCircle },
};

export default function JokiOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<typeof ORDERS[0] | null>(null);

  const filtered = ORDERS.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch = o.title.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order Saya</h1>
        <p className="text-muted text-sm mt-1">Daftar tugas yang harus kamu kerjakan.</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Cari order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'in_progress', 'revision', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-accent to-primary text-white'
                  : 'bg-surface-2 border border-border text-muted hover:border-primary/30'
              }`}
            >
              {status === 'all' ? 'Semua' : STATUS_CONFIG[status]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((order, i) => {
            const statusCfg = STATUS_CONFIG[order.status];
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-6 hover:border-accent/20 border border-transparent transition-all cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-muted">{order.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        order.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                        order.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-green-500/10 text-green-400'
                      }`}>
                        {order.priority === 'high' ? '🔥 Mendesak' : order.priority === 'medium' ? '⚡ Normal' : '🌿 Santai'}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-1">{order.title}</h3>
                    <p className="text-sm text-muted mb-3">{order.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span>👤 {order.customer}</span>
                      <span>📁 {order.category}</span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {order.deadline}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-accent-green">{formatCurrency(order.commission)}</p>
                    <p className="text-xs text-muted">Komisi kamu</p>
                  </div>
                </div>

                {order.status !== 'completed' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted mb-1.5">
                      <span>Progress</span>
                      <span>{order.progress}%</span>
                    </div>
                    <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          order.progress >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                          order.progress >= 30 ? 'bg-gradient-to-r from-accent to-primary' :
                          'bg-gradient-to-r from-yellow-500 to-orange-400'
                        }`}
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {order.status === 'pending' && (
                    <button className="px-4 py-2 bg-gradient-to-r from-accent to-primary text-white rounded-xl text-xs font-medium hover:opacity-90">
                      Mulai Kerjakan
                    </button>
                  )}
                  {order.status === 'in_progress' && (
                    <>
                      <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-xs font-medium hover:opacity-90 flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        Upload Hasil
                      </button>
                      <button className="px-4 py-2 bg-surface-2 border border-border rounded-xl text-xs hover:border-primary/30 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Chat Customer
                      </button>
                    </>
                  )}
                  {order.status === 'revision' && (
                    <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-medium hover:opacity-90 flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      Upload Revisi
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <span className="px-4 py-2 bg-green-500/10 text-green-400 rounded-xl text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Selesai
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-sm text-muted">{selectedOrder.id}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedOrder.status].color}`}>
                {STATUS_CONFIG[selectedOrder.status].label}
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2">{selectedOrder.title}</h2>
            <p className="text-sm text-muted mb-4">{selectedOrder.description}</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between p-3 bg-surface-2 rounded-xl">
                <span className="text-sm text-muted">Customer</span>
                <span className="text-sm font-medium">{selectedOrder.customer}</span>
              </div>
              <div className="flex justify-between p-3 bg-surface-2 rounded-xl">
                <span className="text-sm text-muted">Kategori</span>
                <span className="text-sm font-medium">{selectedOrder.category}</span>
              </div>
              <div className="flex justify-between p-3 bg-surface-2 rounded-xl">
                <span className="text-sm text-muted">Deadline</span>
                <span className="text-sm font-medium">{selectedOrder.deadline}</span>
              </div>
              <div className="flex justify-between p-3 bg-surface-2 rounded-xl">
                <span className="text-sm text-muted">Harga Order</span>
                <span className="text-sm font-medium">{formatCurrency(selectedOrder.price)}</span>
              </div>
              <div className="flex justify-between p-3 bg-surface-2 rounded-xl border border-accent/20">
                <span className="text-sm text-muted">Komisi Kamu</span>
                <span className="text-sm font-bold text-accent-green">{formatCurrency(selectedOrder.commission)}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">File Lampiran</h4>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.files.map((file, i) => (
                  <span key={i} className="px-3 py-1.5 bg-surface-2 border border-border rounded-lg text-xs">
                    📎 {file}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={() => setSelectedOrder(null)} className="w-full py-3 bg-surface-2 border border-border rounded-xl hover:border-primary/30 text-sm">
              Tutup
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
