'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate } from '@/lib/utils';
import { apiGetOrders, apiJokiUpdateProgress } from '@/lib/api';
import {
  ClipboardList, Clock, CheckCircle, Play, AlertCircle,
  Timer, Eye, MessageSquare, Upload, ChevronDown,
  Filter, Search, XCircle, RotateCcw
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Menunggu', color: 'bg-yellow-500/10 text-yellow-400', icon: Clock },
  PENDING: { label: 'Menunggu', color: 'bg-yellow-500/10 text-yellow-400', icon: Clock },
  paid: { label: 'Siap Dikerjakan', color: 'bg-cyan-500/10 text-cyan-400', icon: AlertCircle },
  PAID: { label: 'Siap Dikerjakan', color: 'bg-cyan-500/10 text-cyan-400', icon: AlertCircle },
  in_progress: { label: 'Dikerjakan', color: 'bg-blue-500/10 text-blue-400', icon: Play },
  IN_PROGRESS: { label: 'Dikerjakan', color: 'bg-blue-500/10 text-blue-400', icon: Play },
  completed: { label: 'Selesai', color: 'bg-green-500/10 text-green-400', icon: CheckCircle },
  COMPLETED: { label: 'Selesai', color: 'bg-green-500/10 text-green-400', icon: CheckCircle },
  revision: { label: 'Revisi', color: 'bg-orange-500/10 text-orange-400', icon: RotateCcw },
  REVISION: { label: 'Revisi', color: 'bg-orange-500/10 text-orange-400', icon: RotateCcw },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-500/10 text-red-400', icon: XCircle },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-red-500/10 text-red-400', icon: XCircle },
};

export default function JokiOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await apiGetOrders({ limit: 50 });
      if (res.success) {
        const d = res.data as Record<string, unknown>;
        setOrders((d.data ?? d) as Record<string, unknown>[]);
      }
    }
    load();
  }, []);
  const [selectedOrder, setSelectedOrder] = useState<Record<string, unknown> | null>(null);

  const filtered = useMemo(() => orders.filter(o => {
    const status = (o.status as string)?.toLowerCase();
    const matchStatus = statusFilter === 'all' || status === statusFilter;
    const matchSearch = (o.title as string)?.toLowerCase().includes(searchQuery.toLowerCase()) || (o.id as string)?.includes(searchQuery);
    return matchStatus && matchSearch;
  }), [orders, statusFilter, searchQuery]);

  async function handleStart(orderId: string) {
    try {
      setUpdating(orderId);
      const res = await apiJokiUpdateProgress(orderId, { status: 'IN_PROGRESS', notes: 'Joki mulai mengerjakan' });
      if (!res.success) {
        alert(res.error || 'Gagal memulai order');
        return;
      }
      const data = res.data as Record<string, unknown>;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: data.status ?? 'IN_PROGRESS' } : o)));
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat memulai order');
    } finally {
      setUpdating(null);
    }
  }

  function goToUpload(orderId: string) {
    router.push(`/dashboard/joki/upload?orderId=${orderId}`);
  }

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
          {['all', 'paid', 'in_progress', 'revision', 'completed'].map((status) => (
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
            const status = (order.status as string)?.toUpperCase();
            const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
            return (
              <motion.div
                key={order.id as string}
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
                      <span className="font-mono text-xs text-muted">{(order.order_number as string) || (order.id as string)}</span>
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
                    <h3 className="font-semibold mb-1">{order.title as string}</h3>
                    <p className="text-sm text-muted mb-3">{order.description as string}</p>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span>👤 {(order.customer ?? (order.user as Record<string, unknown>)?.name ?? '') as string}</span>
                      <span>📁 {(order.category ?? (order.service as Record<string, unknown>)?.category ?? '') as string}</span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {order.deadline ? formatDate(order.deadline as string) : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-accent-green">{formatCurrency((order.commission ?? order.price) as number)}</p>
                    <p className="text-xs text-muted">Komisi kamu</p>
                  </div>
                </div>

                {status !== 'COMPLETED' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted mb-1.5">
                      <span>Progress</span>
                      <span>{(order.progress as number) ?? 0}%</span>
                    </div>
                    <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (order.progress as number) >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                          (order.progress as number) >= 30 ? 'bg-gradient-to-r from-accent to-primary' :
                          'bg-gradient-to-r from-yellow-500 to-orange-400'
                        }`}
                        style={{ width: `${(order.progress as number) ?? 0}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {status === 'PAID' && (
                    <button
                      onClick={() => handleStart(order.id as string)}
                      disabled={updating === (order.id as string)}
                      className="px-4 py-2 bg-gradient-to-r from-accent to-primary text-white rounded-xl text-xs font-medium hover:opacity-90 disabled:opacity-60"
                    >
                      {updating === (order.id as string) ? 'Memulai...' : 'Mulai Kerjakan'}
                    </button>
                  )}
                  {status === 'IN_PROGRESS' && (
                    <>
                      <button
                        onClick={() => goToUpload(order.id as string)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-xs font-medium hover:opacity-90 flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Upload Hasil
                      </button>
                      <button className="px-4 py-2 bg-surface-2 border border-border rounded-xl text-xs hover:border-primary/30 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Chat Customer
                      </button>
                    </>
                  )}
                  {status === 'REVISION' && (
                    <button
                      onClick={() => goToUpload(order.id as string)}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-medium hover:opacity-90 flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      Upload Revisi
                    </button>
                  )}
                  {status === 'COMPLETED' && (
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
              <span className="font-mono text-sm text-muted">{(selectedOrder.order_number as string) || (selectedOrder.id as string)}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${(STATUS_CONFIG[selectedOrder.status as string] ?? STATUS_CONFIG.pending).color}`}>
                {(STATUS_CONFIG[selectedOrder.status as string] ?? STATUS_CONFIG.pending).label}
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2">{selectedOrder.title as string}</h2>
            <p className="text-sm text-muted mb-4">{selectedOrder.description as string}</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between p-3 bg-surface-2 rounded-xl">
                <span className="text-sm text-muted">Customer</span>
                <span className="text-sm font-medium">{(selectedOrder.customer ?? (selectedOrder.user as Record<string, unknown>)?.name ?? '') as string}</span>
              </div>
              <div className="flex justify-between p-3 bg-surface-2 rounded-xl">
                <span className="text-sm text-muted">Kategori</span>
                <span className="text-sm font-medium">{(selectedOrder.category ?? (selectedOrder.service as Record<string, unknown>)?.category ?? '') as string}</span>
              </div>
              <div className="flex justify-between p-3 bg-surface-2 rounded-xl">
                <span className="text-sm text-muted">Deadline</span>
                <span className="text-sm font-medium">{selectedOrder.deadline ? formatDate(selectedOrder.deadline as string) : '-'}</span>
              </div>
              <div className="flex justify-between p-3 bg-surface-2 rounded-xl">
                <span className="text-sm text-muted">Harga Order</span>
                <span className="text-sm font-medium">{formatCurrency(selectedOrder.price as number)}</span>
              </div>
              <div className="flex justify-between p-3 bg-surface-2 rounded-xl border border-accent/20">
                <span className="text-sm text-muted">Komisi Kamu</span>
                <span className="text-sm font-bold text-accent-green">{formatCurrency((selectedOrder.commission ?? selectedOrder.price) as number)}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">File Lampiran</h4>
              <div className="flex flex-wrap gap-2">
                {((selectedOrder.files as string[]) || []).map((file: string, i: number) => (
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
