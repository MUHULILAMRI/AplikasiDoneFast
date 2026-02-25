'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGetOrders, apiAdminTeam, apiAdminAssignOrder, apiAdminCancelOrder, apiGetOrder, apiAdminConfirmPayment } from '@/lib/api';
import { formatCurrency, getStatusColor, getStatusLabel, formatDateTime } from '@/lib/utils';
import {
  Search, Eye, UserPlus, MessageCircle,
  Clock, MoreVertical, Download, RefreshCw,
  XCircle, AlertTriangle, CheckCircle2,
  Package, TrendingUp, Ban, ChevronRight,
  User, CalendarDays, FileText, Tag, X,
  Paperclip, ExternalLink, FileCheck,
  CheckCircle
} from 'lucide-react';

type OrderRecord = Record<string, unknown>;

export default function OrderManagementPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [jokiList, setJokiList] = useState<OrderRecord[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Detail modal
  const [detailModal, setDetailModal] = useState<OrderRecord | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Cancel modal
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  // Action menu
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const [ordRes, teamRes] = await Promise.all([apiGetOrders({ limit: 100 }), apiAdminTeam()]);
    if (ordRes.success) {
      const d = ordRes.data as OrderRecord;
      const rawOrders = (d.data ?? d) as OrderRecord[];
      setOrders(rawOrders.map(o => ({
        ...o,
        joki_id: (o.joki as OrderRecord)?.id ?? o.joki_id,
        title: o.title ?? (o.service as OrderRecord)?.name,
      })));
    }
    if (teamRes.success) {
      const raw = teamRes.data as OrderRecord[];
      setJokiList(raw.map(normalizeJoki));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function normalizeJoki(j: OrderRecord) {
    return {
      ...j,
      name: (j.user as OrderRecord)?.name ?? j.name,
      email: (j.user as OrderRecord)?.email ?? j.email,
      total_completed: (j._count as Record<string, number>)?.orders ?? 0,
      is_available: j.is_available ?? true,
      rating: (j.rating as number) ?? 0,
      skills: (j.skills as string[]) ?? [],
    };
  }

  async function handleAssign(orderId: string, jokiId: string) {
    try {
      setAssigning(orderId);
      const res = await apiAdminAssignOrder(orderId, jokiId);
      if (!res.success) {
        alert(res.error || 'Gagal assign joki');
        return;
      }

      const updated = res.data as OrderRecord;
      setOrders((prev) =>
        prev.map((o) =>
          (o.id === orderId || o.order_number === orderId)
            ? {
              ...o,
              joki_id: updated.joki_id ?? jokiId,
              joki: updated.joki ?? (jokiList.find((j) => j.id === jokiId) as OrderRecord),
              status: updated.status ?? o.status,
            }
            : o
        )
      );
      setAssignModal(null);
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat assign joki');
    } finally {
      setAssigning(null);
    }
  }

  async function handleViewDetail(orderId: string) {
    try {
      setLoadingDetail(true);
      const res = await apiGetOrder(orderId);
      if (res.success) {
        setDetailModal(res.data as OrderRecord);
      } else {
        alert('Gagal memuat detail order');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan');
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleCancelOrder() {
    if (!cancelModal) return;
    try {
      setCancelling(true);
      const res = await apiAdminCancelOrder(cancelModal, cancelReason);
      if (!res.success) {
        alert((res as { error?: string }).error || 'Gagal membatalkan order');
        return;
      }

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          (o.id === cancelModal || o.order_number === cancelModal)
            ? { ...o, status: 'CANCELLED' }
            : o
        )
      );
      setCancelModal(null);
      setCancelReason('');
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat membatalkan order');
    } finally {
      setCancelling(false);
    }
  }

  const handleConfirmPayment = async (orderId: string) => {
    if (!confirm(`Konfirmasi pembayaran untuk order ini?`)) return;
    setConfirming(orderId);
    try {
      const res = await apiAdminConfirmPayment(orderId);
      if (res.success) {
        alert('Pembayaran berhasil dikonfirmasi!');
        loadOrders();
        if (detailModal && (detailModal.id === orderId || detailModal.order_number === orderId)) {
          setDetailModal(res.data as OrderRecord);
        }
      } else {
        alert(res.error || 'Gagal mengkonfirmasi pembayaran');
      }
    } catch (error) {
      console.error('Confirm payment error:', error);
      alert('Terjadi kesalahan saat konfirmasi pembayaran');
    } finally {
      setConfirming(null);
    }
  };

  const filteredOrders = useMemo(() => orders.filter((order) => {
    if (filterStatus !== 'all' && order.status !== filterStatus.toUpperCase()) return false;
    if (searchQuery && !(order.title as string)?.toLowerCase().includes(searchQuery.toLowerCase()) && !(order.order_number as string)?.toLowerCase().includes(searchQuery.toLowerCase()) && !(order.id as string)?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }), [orders, filterStatus, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'PENDING_PAYMENT').length;
    const inProgress = orders.filter(o => ['PAID', 'IN_PROGRESS', 'REVISION'].includes(o.status as string)).length;
    const completed = orders.filter(o => o.status === 'COMPLETED').length;
    const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
    return { total, pending, inProgress, completed, cancelled };
  }, [orders]);

  const cancelReasons = [
    'Pelanggan meminta pembatalan',
    'Pembayaran tidak valid',
    'Layanan tidak tersedia saat ini',
    'Joki tidak tersedia',
    'Pelanggaran syarat & ketentuan',
    'Duplikat order',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-muted text-sm mt-1">Kelola semua order masuk, assign joki, lihat detail, dan batalkan order.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Order', value: stats.total, icon: Package, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Menunggu', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10' },
          { label: 'Diproses', value: stats.inProgress, icon: TrendingUp, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-500/10' },
          { label: 'Selesai', value: stats.completed, icon: CheckCircle2, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10' },
          { label: 'Dibatalkan', value: stats.cancelled, icon: Ban, color: 'from-red-500 to-rose-500', bg: 'bg-red-500/10' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('yellow') ? '#eab308' : stat.color.includes('purple') ? '#a855f7' : stat.color.includes('green') ? '#22c55e' : '#ef4444' }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
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
              placeholder="Cari order ID, nomor order, atau judul tugas..."
              className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'Semua', count: stats.total },
              { id: 'pending_payment', label: 'Pending', count: stats.pending },
              { id: 'paid', label: 'Dibayar', count: orders.filter(o => o.status === 'PAID').length },
              { id: 'in_progress', label: 'Diproses', count: orders.filter(o => o.status === 'IN_PROGRESS').length },
              { id: 'revision', label: 'Revisi', count: orders.filter(o => o.status === 'REVISION').length },
              { id: 'completed', label: 'Selesai', count: stats.completed },
              { id: 'cancelled', label: 'Dibatalkan', count: stats.cancelled },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${filterStatus === filter.id
                  ? 'bg-primary/10 text-primary-light border border-primary/30'
                  : 'bg-surface-2 text-muted hover:text-foreground border border-border'
                  }`}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === filter.id ? 'bg-primary/20' : 'bg-surface'
                    }`}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-4 pb-48">
        {loading ? (
          <div className="glass rounded-2xl p-12 text-center">
            <RefreshCw className="w-8 h-8 text-primary-light animate-spin mx-auto mb-3" />
            <p className="text-muted">Memuat data order...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Package className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
            <p className="text-muted text-lg">Tidak ada order ditemukan</p>
            <p className="text-muted text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          filteredOrders.map((order, i) => (
            <motion.div
              key={order.id as string}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass rounded-2xl p-6 hover:border-primary/20 transition-all ${(order.status as string) === 'CANCELLED' ? 'opacity-70' : ''
                }`}
              style={{ position: 'relative', zIndex: openMenu === order.id ? 50 : 0 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Order Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-mono text-sm text-primary-light font-medium">{(order.order_number as string) || (order.id as string)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status as string)}`}>
                      {getStatusLabel(order.status as string)}
                    </span>
                  </div>
                  <h3 className="font-semibold truncate">{order.title as string}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-muted flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {(order.user as OrderRecord)?.name as string || 'Pelanggan'}
                    </p>
                    <p className="text-sm text-muted flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {(order.service as OrderRecord)?.category as string || '-'}
                    </p>
                  </div>
                </div>

                {/* Price & Deadline */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(order.price as number)}</p>
                    <p className="text-xs text-muted flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {order.deadline ? new Date(order.deadline as string).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>

                  {/* Joki Assignment */}
                  <div className="min-w-[140px]">
                    {order.joki_id ? (
                      <div className="flex items-center gap-2 p-2 bg-surface-2 rounded-xl border border-border">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                          {((jokiList.find((j) => j.id === order.joki_id) as OrderRecord)?.name as string)?.charAt(0) || 'J'}
                        </div>
                        <span className="text-sm truncate">
                          {(jokiList.find((j) => j.id === order.joki_id) as OrderRecord)?.name as string || 'Joki'}
                        </span>
                      </div>
                    ) : (order.status as string) === 'PENDING_PAYMENT' ? (
                      <button
                        onClick={() => handleConfirmPayment(order.id as string)}
                        disabled={confirming === order.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      >
                        {confirming === order.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Konfirmasi Bayar
                      </button>
                    ) : (order.status as string) === 'PAID' ? (
                      <button
                        onClick={() => setAssignModal(order.id as string)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary-light rounded-xl text-sm hover:bg-primary/20 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Assign Joki
                      </button>
                    ) : (
                      <span className="text-xs text-muted italic">-</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 relative">
                    <button
                      onClick={() => handleViewDetail((order.id as string))}
                      className="p-2 hover:bg-surface-2 rounded-lg transition-colors group"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4 text-muted group-hover:text-primary-light transition-colors" />
                    </button>
                    <button className="p-2 hover:bg-surface-2 rounded-lg transition-colors group" title="Chat">
                      <MessageCircle className="w-4 h-4 text-muted group-hover:text-primary-light transition-colors" />
                    </button>

                    {/* More Actions Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === order.id as string ? null : order.id as string)}
                        className="p-2 hover:bg-surface-2 rounded-lg transition-colors group"
                        title="Aksi lainnya"
                      >
                        <MoreVertical className="w-4 h-4 text-muted group-hover:text-primary-light transition-colors" />
                      </button>
                      <AnimatePresence>
                        {openMenu === order.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            className="absolute right-0 top-full mt-1 w-48 bg-surface-2 border border-border rounded-xl shadow-2xl z-20 overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                handleViewDetail(order.id as string);
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-surface transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Lihat Detail
                            </button>
                            {!['COMPLETED', 'CANCELLED'].includes(order.status as string) && (
                              <button
                                onClick={() => {
                                  setCancelModal(order.id as string);
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                Batalkan Order
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar for in-progress orders */}
              {(order.status as string)?.toUpperCase() === 'IN_PROGRESS' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted mb-2">
                    <span>Progress</span>
                    <span>{(order.progress as number) || 0}%</span>
                  </div>
                  <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(order.progress as number) || 0}%` }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* =============================================
          ASSIGN JOKI MODAL
          ============================================= */}
      <AnimatePresence>
        {assignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setAssignModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Assign Joki</h2>
                  <p className="text-sm text-muted mt-1">Pilih joki untuk order {assignModal}</p>
                </div>
                <button onClick={() => setAssignModal(null)} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {jokiList.filter((j) => j.is_available).map((joki) => (
                  <button
                    key={joki.id as string}
                    onClick={() => handleAssign(assignModal!, joki.id as string)}
                    disabled={assigning === assignModal}
                    className="w-full flex items-center gap-4 p-4 bg-surface-2 rounded-xl border border-border hover:border-primary/30 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                      {(joki.name as string)?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{joki.name as string}</p>
                      <p className="text-xs text-muted">{((joki.skills as string[]) || []).join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-yellow-400">★ {joki.rating as number}</p>
                      <p className="text-xs text-muted">{joki.total_completed as number} done</p>
                    </div>
                  </button>
                ))}
                {jokiList.filter(j => j.is_available).length === 0 && (
                  <div className="text-center py-8 text-muted">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Tidak ada joki tersedia saat ini</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setAssignModal(null)}
                className="w-full mt-4 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors"
              >
                Batal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =============================================
          DETAIL ORDER MODAL
          ============================================= */}
      <AnimatePresence>
        {(detailModal || loadingDetail) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setDetailModal(null); setLoadingDetail(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {loadingDetail ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 text-primary-light animate-spin mx-auto mb-3" />
                  <p className="text-muted">Memuat detail order...</p>
                </div>
              ) : detailModal ? (
                <>
                  {/* Header */}
                  <div className="p-6 border-b border-border flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-bold">Detail Order</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(detailModal.status as string)}`}>
                          {getStatusLabel(detailModal.status as string)}
                        </span>
                      </div>
                      <p className="font-mono text-sm text-primary-light">
                        {detailModal.order_number as string}
                      </p>
                    </div>
                    <button onClick={() => setDetailModal(null)} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                      <X className="w-5 h-5 text-muted" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Order Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{detailModal.title as string}</h3>
                      <p className="text-sm text-muted">{String(detailModal.description || 'Tidak ada deskripsi')}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-2 rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-2 text-muted text-xs mb-2">
                          <User className="w-3.5 h-3.5" />
                          Pelanggan
                        </div>
                        <p className="font-medium text-sm">{String((detailModal.user as OrderRecord)?.name || '')}</p>
                        <p className="text-xs text-muted">{String((detailModal.user as OrderRecord)?.email || '')}</p>
                        {Boolean((detailModal.user as OrderRecord)?.phone) && (
                          <p className="text-xs text-muted">{String((detailModal.user as OrderRecord)?.phone || '')}</p>
                        )}
                      </div>

                      <div className="bg-surface-2 rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-2 text-muted text-xs mb-2">
                          <Tag className="w-3.5 h-3.5" />
                          Layanan
                        </div>
                        <p className="font-medium text-sm">{String((detailModal.service as OrderRecord)?.name || '')}</p>
                        <p className="text-xs text-muted">{String((detailModal.service as OrderRecord)?.category || '')}</p>
                      </div>

                      <div className="bg-surface-2 rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-2 text-muted text-xs mb-2">
                          <CalendarDays className="w-3.5 h-3.5" />
                          Deadline
                        </div>
                        <p className="font-medium text-sm">
                          {detailModal.deadline ? new Date(detailModal.deadline as string).toLocaleDateString('id-ID', {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                          }) : '-'}
                        </p>
                      </div>

                      <div className="bg-surface-2 rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-2 text-muted text-xs mb-2">
                          <FileText className="w-3.5 h-3.5" />
                          Detail
                        </div>
                        <p className="font-medium text-sm">Halaman: {detailModal.pages != null ? String(detailModal.pages) : '-'}</p>
                        <p className="text-xs text-muted">Difficulty: {String(detailModal.difficulty || '-')}</p>
                        <p className="text-xs text-muted">Revisi tersisa: {String(detailModal.revisions_left ?? '-')}</p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-surface-2 rounded-xl p-4 border border-border">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary-light" />
                        Rincian Harga
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Harga</span>
                          <span className="font-medium">{formatCurrency(detailModal.price as number)}</span>
                        </div>
                        {Number(detailModal.discount || 0) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted">Diskon</span>
                            <span className="font-medium text-green-400">-{formatCurrency(Number(detailModal.discount))}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-border flex justify-between text-sm">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-lg">{formatCurrency(detailModal.price as number)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Joki Info */}
                    {Boolean(detailModal.joki) && (
                      <div className="bg-surface-2 rounded-xl p-4 border border-border">
                        <h4 className="text-sm font-semibold mb-3">Joki yang Ditugaskan</h4>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                            {String((detailModal.joki as OrderRecord)?.name || 'J').charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{String((detailModal.joki as OrderRecord)?.name || '')}</p>
                            <p className="text-xs text-yellow-400">★ {String((detailModal.joki as OrderRecord)?.rating ?? 0)} rating</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attachments / Files from Customer */}
                    {(detailModal.files as string[])?.length > 0 && (
                      <div className="bg-surface-2 rounded-xl p-4 border border-border">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-primary-light" />
                          Lampiran Pelanggan
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(detailModal.files as string[]).map((file, i) => (
                            <a
                              key={i}
                              href={file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border hover:border-primary/30 transition-all group"
                            >
                              <FileText className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate">File {i + 1}</p>
                                <p className="text-[10px] text-muted">Klik untuk lihat</p>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 ml-auto text-muted opacity-0 group-hover:opacity-100 transition-all" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Result Files from Joki */}
                    {(detailModal.result_files as string[])?.length > 0 && (
                      <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/20">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-blue-400">
                          <CheckCircle className="w-4 h-4" />
                          Hasil Pekerjaan Joki
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(detailModal.result_files as string[]).map((file, i) => (
                            <a
                              key={i}
                              href={file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl border border-blue-500/20 hover:border-blue-500/50 transition-all group"
                            >
                              <FileCheck className="w-5 h-5 text-blue-400" />
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate text-blue-100">Hasil {i + 1}</p>
                                <p className="text-[10px] text-blue-400/70">Klik untuk download</p>
                              </div>
                              <Download className="w-3.5 h-3.5 ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transactions */}
                    {(detailModal.transactions as OrderRecord[])?.length > 0 && (
                      <div className="bg-surface-2 rounded-xl p-4 border border-border">
                        <h4 className="text-sm font-semibold mb-3">Riwayat Transaksi</h4>
                        <div className="space-y-2">
                          {(detailModal.transactions as OrderRecord[]).map((tx) => (
                            <div key={tx.id as string} className="flex items-center justify-between text-sm p-2 bg-surface rounded-lg">
                              <div>
                                <span className="font-medium">{String(tx.payment_method || '')}</span>
                                <span className="text-xs text-muted ml-2">
                                  {tx.created_at ? formatDateTime(tx.created_at as string) : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatCurrency(tx.amount as number)}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${String(tx.payment_status) === 'PAID' ? 'bg-green-500/20 text-green-400' :
                                  tx.payment_status === 'REFUNDED' ? 'bg-red-500/20 text-red-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                  }`}>
                                  {String(tx.payment_status || '')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="text-xs text-muted space-y-1">
                      <p>Dibuat: {detailModal.created_at ? formatDateTime(detailModal.created_at as string) : '-'}</p>
                      <p>Diupdate: {detailModal.updated_at ? formatDateTime(detailModal.updated_at as string) : '-'}</p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 border-t border-border flex gap-3">
                    {!['COMPLETED', 'CANCELLED'].includes(detailModal.status as string) && (
                      <button
                        onClick={() => {
                          setCancelModal(detailModal.id as string);
                          setDetailModal(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/20 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Batalkan Order
                      </button>
                    )}
                    {detailModal.status === 'PENDING_PAYMENT' && (
                      <button
                        onClick={() => handleConfirmPayment(detailModal.id as string)}
                        disabled={confirming === detailModal.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                      >
                        {confirming === detailModal.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Konfirmasi Pembayaran
                      </button>
                    )}
                    {detailModal.status === 'PAID' && !detailModal.joki_id && (
                      <button
                        onClick={() => {
                          setAssignModal(detailModal.id as string);
                          setDetailModal(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                      >
                        <UserPlus className="w-4 h-4" />
                        Assign Joki Ke Tim
                      </button>
                    )}
                    <button
                      onClick={() => setDetailModal(null)}
                      className="ml-auto px-6 py-2.5 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =============================================
          CANCEL ORDER MODAL
          ============================================= */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setCancelModal(null); setCancelReason(''); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-center mb-2">Batalkan Order?</h2>
              <p className="text-sm text-muted text-center mb-6">
                Tindakan ini tidak dapat dibatalkan. Pelanggan dan joki akan mendapat notifikasi tentang pembatalan ini.
              </p>

              {/* Quick Reasons */}
              <div className="mb-4">
                <label className="text-sm font-medium text-muted mb-2 block">Pilih alasan:</label>
                <div className="flex flex-wrap gap-2">
                  {cancelReasons.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setCancelReason(reason)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${cancelReason === reason
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-surface-2 border-border text-muted hover:text-foreground'
                        }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Reason */}
              <div className="mb-6">
                <label className="text-sm font-medium text-muted mb-2 block">Atau tulis alasan:</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tulis alasan pembatalan..."
                  rows={3}
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-red-500/50 transition-colors text-sm resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setCancelModal(null); setCancelReason(''); }}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling || !cancelReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Membatalkan...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Ya, Batalkan
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close menu */}
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
