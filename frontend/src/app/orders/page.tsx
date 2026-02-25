'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { apiGetOrders, apiGetUnreadCounts } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import {
    Package, Clock, CheckCircle, AlertCircle, CreditCard,
    Search, Filter, MapPin, MessageSquare, ChevronRight,
    FileText, ArrowLeft, Loader2
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    PENDING_PAYMENT: { label: 'Menunggu Pembayaran', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: CreditCard },
    PAID: { label: 'Dibayar', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: CheckCircle },
    IN_PROGRESS: { label: 'Dikerjakan', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Loader2 },
    REVISION: { label: 'Revisi', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: AlertCircle },
    COMPLETED: { label: 'Selesai', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle },
    CANCELLED: { label: 'Dibatalkan', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle },
};

const FILTER_TABS = [
    { label: 'Semua', value: '' },
    { label: 'Menunggu', value: 'PENDING_PAYMENT' },
    { label: 'Dikerjakan', value: 'IN_PROGRESS' },
    { label: 'Revisi', value: 'REVISION' },
    { label: 'Selesai', value: 'COMPLETED' },
];

interface OrderItem {
    id: string;
    order_number: string;
    title: string;
    price: number;
    status: string;
    deadline: string;
    created_at: string;
    service?: { name: string; category: string };
    joki?: { name: string; rating: number };
}

function timeUntilDeadline(deadline: string) {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff < 0) return 'Sudah lewat';
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days} hari lagi`;
    const hours = Math.floor(diff / 3600000);
    return `${hours} jam lagi`;
}

export default function OrdersPage() {
    const { isAuthenticated } = useAppStore();
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    const loadOrders = async (status: string) => {
        setLoading(true);
        const params: Record<string, unknown> = { limit: 50 };
        if (status) params.status = status;
        const [res, unreadRes] = await Promise.all([
            apiGetOrders(params as { status?: string; page?: number; limit?: number }),
            apiGetUnreadCounts(),
        ]);
        if (res.success) {
            const d = res.data as { data?: OrderItem[] } | OrderItem[];
            setOrders(Array.isArray(d) ? d : (d.data ?? []));
        }
        if (unreadRes.success) {
            setUnreadCounts(unreadRes.data as Record<string, number>);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isAuthenticated) loadOrders(statusFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, statusFilter]);

    const filtered = orders.filter(o => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            o.order_number.toLowerCase().includes(q) ||
            o.title.toLowerCase().includes(q) ||
            o.service?.name?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="pt-24 pb-12 max-w-5xl mx-auto px-4">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                        Pesanan Saya
                    </h1>
                    <p className="text-muted text-sm mt-1">Kelola dan pantau semua pesanan kamu</p>
                </motion.div>

                {/* Search + Filter */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                        <input
                            type="text"
                            placeholder="Cari order ID, judul, atau layanan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {FILTER_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setStatusFilter(tab.value)}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === tab.value
                                    ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                                    : 'bg-surface-2 text-muted hover:text-foreground border border-border'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                        <Package className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted">Belum ada pesanan</h3>
                        <p className="text-sm text-muted/60 mt-1">Mulai pesan layanan di marketplace</p>
                        <Link href="/marketplace" className="inline-block mt-4 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                            Lihat Layanan
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((order, i) => {
                            const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING_PAYMENT;
                            const StatusIcon = statusConf.icon;
                            const deadlineUrgent = new Date(order.deadline).getTime() - Date.now() < 86400000 * 2 && !['COMPLETED', 'CANCELLED'].includes(order.status);

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass rounded-2xl p-5 hover:border-primary/20 border border-transparent transition-all group"
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Left: Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className="font-mono text-xs text-muted">{order.order_number}</span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusConf.color} ${statusConf.bg}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusConf.label}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-sm truncate">{order.title}</h3>
                                            {order.service && (
                                                <p className="text-xs text-muted mt-0.5">{order.service.name}</p>
                                            )}

                                            <div className="flex items-center gap-4 mt-3 text-xs text-muted flex-wrap">
                                                {order.joki && (
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> Joki: {order.joki.name}
                                                    </span>
                                                )}
                                                <span className={`flex items-center gap-1 ${deadlineUrgent ? 'text-red-400 font-medium' : ''}`}>
                                                    <Clock className="w-3 h-3" /> {timeUntilDeadline(order.deadline)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right: Price + Actions */}
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                                            <p className="text-sm font-bold text-accent-green">{formatCurrency(order.price)}</p>
                                            <div className="flex gap-2">
                                                {!['CANCELLED'].includes(order.status) && (
                                                    <Link
                                                        href={`/orders/${order.id}/chat`}
                                                        className="relative p-2 rounded-lg bg-surface-2 border border-border hover:border-primary/30 transition-colors"
                                                        title="Chat Admin/Joki"
                                                    >
                                                        <MessageSquare className="w-4 h-4 text-primary-light" />
                                                        {(unreadCounts[order.id] || 0) > 0 && (
                                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center font-bold">
                                                                {unreadCounts[order.id]}
                                                            </span>
                                                        )}
                                                    </Link>
                                                )}
                                                <Link
                                                    href={`/tracking?id=${order.order_number}`}
                                                    className="p-2 rounded-lg bg-surface-2 border border-border hover:border-primary/30 transition-colors"
                                                    title="Lacak Order"
                                                >
                                                    <MapPin className="w-4 h-4 text-muted" />
                                                </Link>
                                                <Link
                                                    href={`/orders/${order.id}/chat`}
                                                    className="p-2 rounded-lg bg-surface-2 border border-border hover:border-primary/30 transition-colors sm:hidden"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-muted" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
