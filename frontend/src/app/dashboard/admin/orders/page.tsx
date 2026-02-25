'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Eye, UserPlus, MessageCircle,
  Clock, MoreVertical, Download, RefreshCw,
  XCircle, AlertTriangle, CheckCircle2,
  Package, TrendingUp, Ban, ChevronRight,
  User, CalendarDays, FileText, Tag, X,
  Paperclip, ExternalLink, FileCheck,
  CheckCircle, Landmark, Zap
} from 'lucide-react';
import { apiGetOrders, apiAdminTeam, apiAdminAssignOrder, apiAdminCancelOrder, apiGetOrder, apiAdminConfirmPayment, apiAdminQuoteOrder } from '@/lib/api';
import { formatCurrency, getStatusColor, getStatusLabel, formatDateTime } from '@/lib/utils';

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

  // Quote modal
  const [quoteModal, setQuoteModal] = useState<OrderRecord | null>(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteDifficulty, setQuoteDifficulty] = useState('MEDIUM');
  const [submittingQuote, setSubmittingQuote] = useState(false);

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

  const handleSetQuote = async () => {
    if (!quoteModal || !quotePrice) return;
    setSubmittingQuote(true);
    try {
      const res = await apiAdminQuoteOrder(quoteModal.id as string, {
        price: Number(quotePrice),
        difficulty: quoteDifficulty,
      });
      if (res.success) {
        alert('Harga berhasil ditetapkan!');
        setQuoteModal(null);
        setQuotePrice('');
        loadOrders();
      } else {
        alert(res.error || 'Gagal menetapkan harga');
      }
    } catch (error) {
      console.error('Set quote error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setSubmittingQuote(false);
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
    const waitingQuote = orders.filter(o => o.status === 'WAITING_FOR_QUOTE').length;
    const pending = orders.filter(o => o.status === 'PENDING_PAYMENT').length;
    const inProgress = orders.filter(o => ['PAID', 'IN_PROGRESS', 'REVISION'].includes(o.status as string)).length;
    const completed = orders.filter(o => o.status === 'COMPLETED').length;
    const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
    return { total, waitingQuote, pending, inProgress, completed, cancelled };
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
          { label: 'Butuh Harga', value: stats.waitingQuote, icon: Tag, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10' },
          { label: 'Menunggu Bayar', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10' },
          { label: 'Diproses', value: stats.inProgress, icon: TrendingUp, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-500/10' },
          { label: 'Selesai', value: stats.completed, icon: CheckCircle2, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10' },
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
              { id: 'waiting_for_quote', label: 'Butuh Harga', count: stats.waitingQuote },
              { id: 'pending_payment', label: 'Belum Bayar', count: stats.pending },
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
          <div className="glass rounded-3xl p-20 text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
            <p className="text-muted text-sm font-bold animate-pulse">Sinkronisasi data order...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="glass rounded-3xl p-20 text-center">
            <Package className="w-16 h-16 text-muted mx-auto mb-4 opacity-20" />
            <p className="text-foreground text-lg font-black">Void Repository</p>
            <p className="text-muted text-xs mt-1">Tidak ada data order yang sesuai dengan kriteria filter.</p>
          </div>
        ) : (
          filteredOrders.map((order, i) => (
            <motion.div
              key={order.id as string}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`group glass rounded-3xl p-6 hover:border-primary/40 hover:bg-surface-2/40 transition-all duration-300 ${(order.status as string) === 'CANCELLED' ? 'opacity-50 grayscale' : ''
                }`}
              style={{ position: 'relative', zIndex: openMenu === order.id ? 50 : 0 }}
            >
              <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                {/* Visual ID & Category */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden ${(order.status as string) === 'COMPLETED' ? 'bg-green-500/10' : 'bg-primary/5'
                    }`}>
                    <Package className={`w-7 h-7 ${(order.status as string) === 'COMPLETED' ? 'text-green-400' : 'text-primary-light'}`} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  </div>
                  <div className="min-w-[120px]">
                    <p className="text-[10px] font-black font-mono text-primary-light uppercase tracking-widest">{order.order_number as string}</p>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-surface-2 px-2 py-0.5 rounded border border-border/50 mt-1 inline-block">
                      {String((order.service as OrderRecord)?.category || 'GENERAL')}
                    </span>
                  </div>
                </div>

                {/* Core Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black tracking-tight group-hover:text-primary-light transition-colors truncate">{order.title as string}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center border border-border">
                        <User className="w-3 h-3 text-muted" />
                      </div>
                      <span className="text-[11px] font-bold text-muted group-hover:text-foreground transition-colors">{String((order.user as OrderRecord)?.name || 'User')}</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-border/50 pl-4">
                      <CalendarDays className="w-3.5 h-3.5 text-muted" />
                      <span className="text-[11px] font-bold text-muted" suppressHydrationWarning>{order.deadline ? new Date(order.deadline as string).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Valuation */}
                <div className="flex items-center gap-8 xl:justify-end min-w-max">
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">{formatCurrency(order.price as number)}</p>
                    <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">Valuation</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(order.status as string)}`}>
                      {getStatusLabel(order.status as string)}
                    </span>
                    {order.status === 'PAID' && !order.joki_id && (
                      <span className="text-[8px] font-bold text-orange-400 mt-1.5 animate-pulse uppercase tracking-widest">Wait Assign</span>
                    )}
                  </div>

                  {/* Representative Component for Assignment */}
                  <div className="min-w-[150px]">
                    {order.joki_id ? (
                      <div className="flex items-center gap-3 p-2 bg-surface-2/50 rounded-2xl border border-primary/20">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                          {((jokiList.find((j) => j.id === order.joki_id) as OrderRecord)?.name as string)?.charAt(0) || 'J'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black truncate max-w-[80px]">
                            {(jokiList.find((j) => j.id === order.joki_id) as OrderRecord)?.name as string || 'Joki'}
                          </span>
                          <span className="text-[8px] font-bold text-green-400 uppercase tracking-tighter">Active Agent</span>
                        </div>
                      </div>
                    ) : (order.status as string) === 'WAITING_FOR_QUOTE' ? (
                      <button
                        onClick={() => {
                          setQuoteModal(order);
                          setQuotePrice(String(order.price));
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500/20 transition-all"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        Tentukan Harga
                      </button>
                    ) : (order.status as string) === 'PENDING_PAYMENT' ? (
                      <button
                        onClick={() => handleConfirmPayment(order.id as string)}
                        disabled={confirming === order.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all disabled:opacity-50"
                      >
                        {confirming === order.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Confirm Payment
                      </button>
                    ) : (order.status as string) === 'PAID' ? (
                      <button
                        onClick={() => setAssignModal(order.id as string)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/30 text-primary-light rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Assign Talent
                      </button>
                    ) : (
                      <div className="h-10 border border-dashed border-border rounded-2xl flex items-center justify-center">
                        <span className="text-[9px] text-muted font-bold uppercase py-2">System Restricted</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Matrix */}
                  <div className="flex gap-2 relative">
                    <button
                      onClick={() => handleViewDetail((order.id as string))}
                      className="w-10 h-10 flex items-center justify-center bg-surface-2 border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all"
                      title="Inspect"
                    >
                      <Eye className="w-4 h-4 text-muted group-hover:text-primary-light" />
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === order.id as string ? null : order.id as string)}
                        className={`w-10 h-10 flex items-center justify-center border rounded-xl transition-all ${openMenu === order.id ? 'bg-primary border-primary text-white' : 'bg-surface-2 border-border hover:border-primary/50'
                          }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {openMenu === order.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10, x: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10, x: 20 }}
                            className="absolute right-0 bottom-full mb-3 w-56 bg-surface-2/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl z-[100] overflow-hidden"
                          >
                            <div className="p-2 space-y-1">
                              <button
                                onClick={() => { handleViewDetail(order.id as string); setOpenMenu(null); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-foreground hover:bg-primary/10 rounded-xl transition-colors"
                              >
                                <FileText className="w-4 h-4 text-primary-light" />
                                Inspect Entity
                              </button>
                              <button
                                className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-foreground hover:bg-primary/10 rounded-xl transition-colors"
                              >
                                <MessageCircle className="w-4 h-4 text-primary-light" />
                                Secure Channel
                              </button>
                              <div className="h-px bg-border/50 my-1" />
                              {!['COMPLETED', 'CANCELLED'].includes(order.status as string) && (
                                <button
                                  onClick={() => { setCancelModal(order.id as string); setOpenMenu(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Terminate
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Analysis */}
              {(order.status as string)?.toUpperCase() === 'IN_PROGRESS' && (
                <div className="mt-6 pt-6 border-t border-border/10">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                    <span className="text-muted">Execution Progress</span>
                    <span className="text-primary-light">{(order.progress as number) || 0}% Complete</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden border border-border/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(order.progress as number) || 0}%` }}
                      transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary via-primary-light to-accent rounded-full shadow-glow-sm shadow-primary/40"
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
            onClick={() => setAssignModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass rounded-[32px] p-8 max-w-lg w-full relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl" />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Assign Elite Talent</h2>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Select the best joki for Order Entity</p>
                </div>
                <button onClick={() => setAssignModal(null)} className="w-10 h-10 flex items-center justify-center bg-surface-2 border border-border rounded-xl hover:bg-surface-3 transition-colors">
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {jokiList.filter((j) => j.is_available).map((joki) => (
                  <button
                    key={joki.id as string}
                    onClick={() => handleAssign(assignModal!, joki.id as string)}
                    disabled={assigning === assignModal}
                    className="w-full flex items-center gap-4 p-4 bg-surface-2 border border-border/50 rounded-[20px] hover:border-primary/50 hover:bg-primary/5 transition-all group disabled:opacity-50"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-green p-0.5 shadow-lg group-hover:rotate-3 transition-transform">
                        <div className="w-full h-full rounded-xl bg-surface-1 flex items-center justify-center text-base font-black text-foreground uppercase">
                          {(joki.name as string)?.charAt(0)}
                        </div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-2 shadow-glow shadow-green-500" />
                    </div>

                    <div className="flex-1 text-left">
                      <p className="text-sm font-black group-hover:text-primary-light transition-colors">{joki.name as string}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {((joki.skills as string[]) || []).slice(0, 2).map((s, idx) => (
                          <span key={idx} className="text-[8px] font-black uppercase text-muted bg-surface-1 px-1.5 py-0.5 rounded border border-border/50">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-yellow-400">
                        <span className="text-[10px] font-black">★</span>
                        <span className="text-[10px] font-black">{joki.rating as number}</span>
                      </div>
                      <p className="text-[9px] font-bold text-muted uppercase mt-0.5">{joki.total_completed as number} Done</p>
                    </div>
                  </button>
                ))}

                {jokiList.filter(j => j.is_available).length === 0 && (
                  <div className="text-center py-12 glass rounded-3xl border-dashed border-2 border-border/50">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-xs font-black uppercase tracking-widest text-muted">No Agents Available</p>
                    <p className="text-[10px] text-muted/60 mt-1">Check joki status or add a new joki to the network.</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3 relative z-10">
                <button
                  onClick={() => setAssignModal(null)}
                  className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-3 transition-all"
                >
                  Cancel Operation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =============================================
          SET QUOTE MODAL (NEW)
          ============================================= */}
      <AnimatePresence>
        {quoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
            onClick={() => setQuoteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass rounded-[32px] p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Tentukan Harga Final</h2>
                <button onClick={() => setQuoteModal(null)} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <p className="text-xs text-muted uppercase font-bold mb-1">Estimasi Awal</p>
                  <p className="text-xl font-bold">{formatCurrency(Number(quoteModal.price))}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Harga Final (IDR)</label>
                  <input
                    type="number"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    placeholder="Masukkan harga deal..."
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground font-bold text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tingkat Kesulitan</label>
                  <select
                    value={quoteDifficulty}
                    onChange={(e) => setQuoteDifficulty(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground"
                  >
                    <option value="EASY">Mudah</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="HARD">Sulit</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setQuoteModal(null)}
                    className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm font-bold"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSetQuote}
                    disabled={submittingQuote || !quotePrice}
                    className="flex-[2] px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {submittingQuote ? 'Menyimpan...' : 'Kirim Penawaran'}
                  </button>
                </div>
              </div>
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
                          <Zap className="w-3.5 h-3.5" />
                          Urgensi & Jurnal
                        </div>
                        <p className="font-medium text-sm">{String(detailModal.urgency_level || 'STANDAR')}</p>
                        <p className="text-xs text-muted">Jurnal: {detailModal.has_journal === true ? 'Ada' : detailModal.has_journal === false ? 'Tidak Ada' : '-'}</p>
                        <p className="text-xs text-muted">Difficulty: {String(detailModal.difficulty || '-')}</p>
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
