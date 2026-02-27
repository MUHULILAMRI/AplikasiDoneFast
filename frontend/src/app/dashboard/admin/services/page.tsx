'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGetServices, apiDeleteService } from '@/lib/api';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';
import {
    Search, Plus, Edit2, Trash2,
    RefreshCw, Package, Star, Clock,
    CheckCircle2, XCircle, MoreVertical,
    LayoutGrid, List
} from 'lucide-react';
import type { Service, ServiceCategory } from '@/types';
import ServiceModal from './ServiceModal';

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<ServiceCategory | 'all'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

    const loadServices = useCallback(async () => {
        setLoading(true);
        const res = await apiGetServices();
        if (res.success) {
            const data = res.data as any[];
            setServices(data.map(s => ({
                ...s,
                category: s.category.toLowerCase() as ServiceCategory,
                base_price: Number(s.base_price)
            })));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    const handleAdd = () => {
        setSelectedServiceId(null);
        setIsModalOpen(true);
    };

    const handleEdit = (id: string) => {
        setSelectedServiceId(id);
        setIsModalOpen(true);
        setOpenMenu(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menonaktifkan/mengubah status layanan ini?')) return;

        try {
            const res = await apiDeleteService(id);
            if (res.success) {
                loadServices();
            } else {
                alert('Gagal mengubah status layanan');
            }
        } catch (err) {
            console.error(err);
        }
        setOpenMenu(null);
    };

    const filteredServices = useMemo(() => {
        return services.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [services, searchQuery, filterCategory]);

    const stats = useMemo(() => {
        return {
            total: services.length,
            active: services.filter(s => s.is_active).length,
            popular: services.filter(s => s.is_popular).length,
        };
    }, [services]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Service Management</h1>
                    <p className="text-muted text-sm mt-1">Kelola daftar layanan, harga, dan kategori di marketplace.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadServices}
                        className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Layanan
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Layanan', value: stats.total, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Layanan Aktif', value: stats.active, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
                    { label: 'Layanan Populer', value: stats.popular, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                ].map((stat) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl p-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted font-medium">{stat.label}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="glass rounded-2xl p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama layanan atau deskripsi..."
                            className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <div className="flex bg-surface-2 border border-border rounded-xl overflow-hidden p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value as any)}
                            className="px-4 py-2 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
                        >
                            <option value="all">Semua Kategori</option>
                            <option value="akademik">Akademik</option>
                            <option value="arsitektur">Arsitektur</option>
                            <option value="coding">Coding</option>
                            <option value="konsultasi">Konsultasi</option>
                            <option value="ai_teknologi">AI & Teknologi</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Service List */}
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <RefreshCw className="w-10 h-10 text-primary-light animate-spin mx-auto mb-4" />
                        <p className="text-muted">Memuat data layanan...</p>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="col-span-full py-20 text-center glass rounded-2xl">
                        <Package className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                        <p className="text-muted text-lg font-medium">Tidak ada layanan ditemukan</p>
                        <p className="text-muted text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
                    </div>
                ) : filteredServices.map((service, i) => (
                    <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`glass rounded-2xl p-5 hover:border-primary/30 transition-all ${!service.is_active ? 'opacity-60 grayscale shadow-none border-dashed' : ''}`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary-light font-bold text-xl uppercase">
                                    {service.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg leading-tight">{service.name}</h3>
                                        {service.is_popular && (
                                            <span className="px-2 py-0.5 rounded-lg bg-yellow-400/10 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                                                Populer
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs px-2 py-0.5 rounded-md bg-surface-2 text-muted border border-border">
                                            {getCategoryLabel(service.category)}
                                        </span>
                                        <span className="text-xs text-muted flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            {service.rating}
                                        </span>
                                        <span className="text-xs text-muted flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {service.estimated_days}h
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setOpenMenu(openMenu === service.id ? null : service.id)}
                                    className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-muted hover:text-foreground"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                                <AnimatePresence>
                                    {openMenu === service.id && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-surface-2 border border-border rounded-xl shadow-2xl z-30 overflow-hidden"
                                        >
                                            <button
                                                onClick={() => handleEdit(service.id)}
                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-surface transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit Layanan
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {service.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <p className="text-sm text-muted mt-4 line-clamp-2 leading-relaxed h-[40px]">
                            {service.description}
                        </p>

                        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Base Price</p>
                                <p className="font-bold text-primary-light">{formatCurrency(service.base_price)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Total Orders</p>
                                <p className="font-bold italic">{service.total_orders.toLocaleString('id-ID')}+</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <ServiceModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        serviceId={selectedServiceId}
                        onSuccess={loadServices}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
