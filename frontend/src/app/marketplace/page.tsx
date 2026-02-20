'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { apiGetServices } from '@/lib/api';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';
import { Star, Clock, ArrowRight, Search, SlidersHorizontal, BookOpen, Building2, Code2, MessageSquare, Bot } from 'lucide-react';
import type { ServiceCategory, Service } from '@/types';

const categories: { id: ServiceCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Semua', icon: SlidersHorizontal },
  { id: 'akademik', label: 'Akademik', icon: BookOpen },
  { id: 'arsitektur', label: 'Arsitek & Desain', icon: Building2 },
  { id: 'coding', label: 'Coding & Web', icon: Code2 },
  { id: 'konsultasi', label: 'Konsultasi', icon: MessageSquare },
  { id: 'ai_teknologi', label: 'AI & Teknologi', icon: Bot },
];

export default function MarketplacePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'rating'>('popular');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      setLoading(true);
      const res = await apiGetServices();
      if (res.success) {
        const data = res.data as Record<string, unknown>[];
        setServices(data.map(s => ({
          id: s.id as string,
          name: s.name as string,
          description: s.description as string,
          category: (s.category as string).toLowerCase() as ServiceCategory,
          base_price: Number(s.base_price),
          rating: s.rating as number,
          total_orders: s.total_orders as number,
          estimated_days: s.estimated_days as number,
          image: s.image as string | undefined,
          features: s.features as string[],
          is_popular: s.is_popular as boolean,
        })));
      }
      setLoading(false);
    }
    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    let filtered = services;

    if (activeCategory !== 'all') {
      filtered = filtered.filter((s) => s.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'popular':
        filtered = [...filtered].sort((a, b) => b.total_orders - a.total_orders);
        break;
      case 'price_low':
        filtered = [...filtered].sort((a, b) => a.base_price - b.base_price);
        break;
      case 'price_high':
        filtered = [...filtered].sort((a, b) => b.base_price - a.base_price);
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [services, activeCategory, searchQuery, sortBy]);

  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Marketplace <span className="gradient-text">Jasa Digital</span>
            </h1>
            <p className="text-muted">
              Temukan layanan yang kamu butuhkan dari tim profesional kami.
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-4 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari layanan... (contoh: makalah, website, skripsi)"
                  className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
              >
                <option value="popular">Terpopuler</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="price_low">Harga Terendah</option>
                <option value="price_high">Harga Tertinggi</option>
              </select>
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 mb-10"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white glow-primary'
                    : 'bg-surface-2 border border-border text-muted hover:text-foreground hover:border-primary/30'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* Results count */}
          <p className="text-sm text-muted mb-6">
            Menampilkan {filteredServices.length} layanan
            {activeCategory !== 'all' && ` di kategori ${getCategoryLabel(activeCategory)}`}
          </p>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/order?service=${service.id}`}
                    className="group block glass rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Card Header */}
                    <div className="h-3 bg-gradient-to-r from-primary to-accent" />

                    <div className="p-6">
                      {/* Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary-light text-xs font-medium">
                          {getCategoryLabel(service.category)}
                        </span>
                        {service.is_popular && (
                          <span className="px-3 py-1 rounded-lg bg-accent-green/10 text-accent-green text-xs font-medium">
                            🔥 Populer
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-light transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted mb-4 line-clamp-2">
                        {service.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.features.slice(0, 3).map((f, j) => (
                          <span key={j} className="px-2 py-1 rounded-md bg-surface-2 text-xs text-muted">
                            {f}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-muted">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          {service.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.estimated_days} hari
                        </span>
                        <span>{service.total_orders.toLocaleString()} order</span>
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          <span className="text-xs text-muted">Mulai dari</span>
                          <p className="text-lg font-bold text-primary-light">
                            {formatCurrency(service.base_price)}
                          </p>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-primary-light group-hover:gap-2 transition-all">
                          Order
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {filteredServices.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-lg font-medium mb-2">Tidak ada layanan ditemukan</p>
              <p className="text-muted text-sm">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
