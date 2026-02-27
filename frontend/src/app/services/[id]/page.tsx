'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { apiGetService, apiGetServices } from '@/lib/api';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';
import {
    Star, Clock, Shield, CheckCircle2, ArrowLeft, ArrowRight,
    MessageSquare, Share2, Heart, Zap, Globe,
    Users, Award, PlayCircle
} from 'lucide-react';
import type { Service } from '@/types';

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'description' | 'features' | 'reviews'>('description');

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await apiGetService(id);
            if (res.success) {
                const s = res.data as any;
                setService({
                    ...s,
                    category: s.category.toLowerCase() as any,
                    base_price: Number(s.base_price)
                });
            }
            setLoading(false);
        }
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold mb-4">Layanan tidak ditemukan</h1>
                    <Link href="/marketplace" className="text-primary-light hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Top Navigation / Breadcrumb */}
            <div className="pt-24 pb-6 bg-surface/50 border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <Link href="/marketplace" className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Marketplace
                        </Link>
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-muted hover:text-red-400">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-muted hover:text-primary-light">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Hero Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary-light text-xs font-bold uppercase tracking-wider">
                                    {getCategoryLabel(service.category)}
                                </span>
                                {service.is_popular && (
                                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Zap className="w-3 h-3" /> Terpopuler
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black leading-tight text-foreground">
                                {service.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    <span className="text-foreground">{service.rating}</span>
                                    <span className="text-muted">(120+ ulasan)</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted">
                                    <Clock className="w-5 h-5" />
                                    <span>Estimasi {service.estimated_days} Hari</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted">
                                    <Users className="w-5 h-5" />
                                    <span>{service.total_orders}+ Pesanan Selesai</span>
                                </div>
                            </div>
                        </div>

                        {/* Media/Gallery Placeholder */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-video w-full glass rounded-3xl overflow-hidden relative group cursor-pointer"
                        >
                            <img
                                src={service.image || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop`}
                                alt={service.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PlayCircle className="w-16 h-16 text-white/80" />
                            </div>
                        </motion.div>

                        {/* Tabs */}
                        <div className="space-y-6">
                            <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
                                {[
                                    { id: 'description', label: 'Deskripsi', icon: MessageSquare },
                                    { id: 'features', label: 'Fitur & Benefit', icon: Zap },
                                    { id: 'reviews', label: 'Ulasan (120)', icon: Star },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'border-primary text-primary-light bg-primary/5'
                                            : 'border-transparent text-muted hover:text-foreground hover:bg-surface-2'
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="min-h-[200px]">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'description' && (
                                        <motion.div
                                            key="desc"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="prose prose-invert max-w-none"
                                        >
                                            <p className="text-muted leading-relaxed text-lg">
                                                {service.description}
                                            </p>
                                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl border border-border bg-surface-2/30">
                                                    <h4 className="font-bold flex items-center gap-2 text-primary-light mb-2">
                                                        <Shield className="w-4 h-4" /> Jaminan Kualitas
                                                    </h4>
                                                    <p className="text-sm text-muted">Dikerjakan oleh tim ahli dengan melewati tahap pengecekan (Quality Control) yang ketat.</p>
                                                </div>
                                                <div className="p-4 rounded-2xl border border-border bg-surface-2/30">
                                                    <h4 className="font-bold flex items-center gap-2 text-primary-light mb-2">
                                                        <Clock className="w-4 h-4" /> Tepat Waktu
                                                    </h4>
                                                    <p className="text-sm text-muted">Kami menjamin pengerjaan selesai sesuai deadline atau garansi uang kembali 100%.</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'features' && (
                                        <motion.div
                                            key="feat"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {service.features.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3 p-4 glass rounded-2xl">
                                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <CheckCircle2 className="w-4 h-4 text-primary-light" />
                                                    </div>
                                                    <span className="text-foreground font-medium">{feature}</span>
                                                </div>
                                            ))}
                                            <div className="flex items-start gap-3 p-4 glass rounded-2xl border-dashed border-primary/30">
                                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <MessageSquare className="w-4 h-4 text-primary-light" />
                                                </div>
                                                <span className="text-foreground font-medium">Bebas Konsultasi 24/7 Selama Pengerjaan</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'reviews' && (
                                        <motion.div
                                            key="rev"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-6"
                                        >
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="p-6 glass rounded-2xl border-border/50">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent-green" />
                                                            <div>
                                                                <p className="font-bold">Mahasiswa UI</p>
                                                                <p className="text-xs text-muted">2 hari yang lalu</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex text-yellow-400 gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, j) => (
                                                                <Star key={j} className="w-4 h-4 fill-yellow-400" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted italic leading-relaxed">
                                                        "Layanan yang sangat luar biasa! Pengerjaan {service.name} saya selesai lebih cepat dari estimasi dan hasilnya sangat memuaskan. Sangat merekomendasikan DoneFast!"
                                                    </p>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Checkout Card */}
                    <div className="lg:col-span-4 lg:sticky lg:top-28 h-fit">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass rounded-3xl p-8 border-primary/20 shadow-2xl shadow-primary/5 space-y-8"
                        >
                            <div className="space-y-1">
                                <span className="text-xs text-muted font-bold uppercase tracking-widest">Harga Mulai Dari</span>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-black text-primary-light">{formatCurrency(service.base_price)}</h2>
                                    {/* <span className="text-muted text-sm line-through">Rp 150.000</span> */}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-surface-2 rounded-2xl border border-border">
                                    <Clock className="w-5 h-5 text-primary-light" />
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Pengiriman Cepat</p>
                                        <p className="text-xs text-muted">{service.estimated_days} Hari Kerja</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-surface-2 rounded-2xl border border-border">
                                    <Shield className="w-5 h-5 text-green-400" />
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Proteksi DoneFast</p>
                                        <p className="text-xs text-muted">2x Revisi Gratis & Refund</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    href={`/order?service=${service.id}`}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:opacity-95 transition-all group"
                                >
                                    Pesan Sekarang
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button className="w-full py-4 bg-surface-2 border border-border text-foreground rounded-2xl font-bold text-sm hover:border-primary/50 transition-colors">
                                    Tanya Dulu via Chat
                                </button>
                            </div>

                            <div className="pt-6 border-t border-border/50 text-center">
                                <p className="text-xs text-muted font-medium mb-4 flex items-center justify-center gap-2">
                                    <Shield className="w-3.5 h-3.5" /> Transaksi Terjamin 100% Aman
                                </p>
                                <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                                    <div className="w-8 h-5 bg-muted rounded animate-pulse" />
                                    <div className="w-8 h-5 bg-muted rounded animate-pulse" />
                                    <div className="w-8 h-5 bg-muted rounded animate-pulse" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Seller Info Placeholder */}
                        <div className="mt-8 p-6 glass rounded-2xl flex items-center gap-4 border-border/50">
                            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center font-bold text-primary">DF</div>
                            <div>
                                <p className="font-bold flex items-center gap-1.5">
                                    DoneFast Team <Award className="w-4 h-4 text-primary-light" />
                                </p>
                                <p className="text-xs text-muted">Verified Professional Team</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
