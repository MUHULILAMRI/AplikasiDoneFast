'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { apiGetOrder, apiGetOrderTracking } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import {
  Package, CheckCircle, Clock, CreditCard,
  FileText, Star, MessageSquare, Download, Search,
  ArrowRight, User, Calendar, Shield, ArrowLeft
} from 'lucide-react';

const STEP_ICONS: Record<string, React.ElementType> = {
  'Order Dibuat': CreditCard,
  'Pembayaran': CreditCard,
  'Dikonfirmasi': Shield,
  'Dikerjakan': FileText,
  'Pengerjaan': FileText,
  'Progress': Package,
  'Revisi': Package,
  'Review': CheckCircle,
  'Selesai': Star,
  'Dibatalkan': Package,
};

function getIconForStep(label: string | undefined | null) {
  if (!label || typeof label !== 'string') return Package;
  for (const key of Object.keys(STEP_ICONS)) {
    if (label.includes(key)) return STEP_ICONS[key];
  }
  return Package;
}

interface TimelineStep {
  step: string;
  desc: string;
  time: string;
  done: boolean;
}

interface OrderInfo {
  id: string;
  order_number: string;
  title: string;
  price: number;
  status: string;
  deadline: string;
  created_at: string;
  joki?: { name: string };
  service?: { name: string };
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [showTracking, setShowTracking] = useState(false);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadTracking = async (id: string) => {
    if (!id) return;
    setLoading(true);
    const [orderRes, trackRes] = await Promise.all([
      apiGetOrder(id),
      apiGetOrderTracking(id),
    ]);
    if (orderRes.success) {
      const d = orderRes.data as Record<string, unknown>;
      setOrder({
        id: d.id as string,
        order_number: d.order_number as string,
        title: d.title as string,
        price: Number(d.price),
        status: d.status as string,
        deadline: d.deadline as string,
        created_at: d.created_at as string,
        joki: d.joki as { name: string } | undefined,
        service: d.service as { name: string } | undefined,
      });
    }
    if (trackRes.success) {
      const td = trackRes.data as Record<string, unknown>;
      const steps = (td.timeline as Record<string, unknown>[]) || [];
      const mapped = steps.map((s) => ({
        step: (s.title as string) || (s.label as string) || String(s.step ?? ''),
        desc: (s.description as string) || (s.desc as string) || '',
        time: s.timestamp ? new Date(s.timestamp as string).toLocaleString('id-ID') : (s.time as string) || '',
        done: s.status === 'completed' || (s.done as boolean) || false,
      }));
      setTimeline(mapped);
      const doneCount = mapped.filter(s => s.done).length;
      setProgress(mapped.length > 0 ? Math.round((doneCount / mapped.length) * 100) : 0);
    }
    setShowTracking(true);
    setLoading(false);
  };

  useEffect(() => {
    if (searchParams.get('id')) {
      loadTracking(searchParams.get('id')!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12">
        {/* Header */}
        <div className="glass border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-3 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Pesanan
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              Lacak Order
            </h1>
            <p className="text-sm text-muted mt-1">Pantau progress pengerjaan tugas kamu secara real-time</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4">Cari Order</h3>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="Masukkan Order ID (contoh: ORD-20250113-001)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50"
                />
              </div>
              <button
                onClick={() => loadTracking(orderId)}
                disabled={loading}
                className="px-6 py-3.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
              >
                Lacak
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {showTracking && order && (
            <>
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm text-muted">{order.order_number}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold">{order.title}</h2>
                    {order.service && <p className="text-sm text-muted">{order.service.name}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-accent-green">{formatCurrency(order.price)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-surface-2 rounded-xl">
                    <p className="text-xs text-muted flex items-center gap-1"><User className="w-3 h-3" /> Joki</p>
                    <p className="text-sm font-medium mt-1">{order.joki?.name || 'Belum di-assign'}</p>
                  </div>
                  <div className="p-3 bg-surface-2 rounded-xl">
                    <p className="text-xs text-muted flex items-center gap-1"><Calendar className="w-3 h-3" /> Order</p>
                    <p className="text-sm font-medium mt-1">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="p-3 bg-surface-2 rounded-xl">
                    <p className="text-xs text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> Deadline</p>
                    <p className="text-sm font-medium mt-1">{new Date(order.deadline).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="p-3 bg-surface-2 rounded-xl">
                    <p className="text-xs text-muted">Progress</p>
                    <p className="text-sm font-bold text-primary-light mt-1">{progress}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="h-3 bg-surface-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-semibold mb-6">Timeline Pengerjaan</h3>
                <div className="space-y-0">
                  {timeline.map((step, i) => {
                    const Icon = getIconForStep(step.step);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${step.done
                              ? 'bg-gradient-to-br from-primary to-accent'
                              : 'bg-surface-2 border border-border'
                            }`}>
                            <Icon className={`w-5 h-5 ${step.done ? 'text-white' : 'text-muted'}`} />
                          </div>
                          {i < timeline.length - 1 && (
                            <div className={`w-0.5 h-16 ${step.done ? 'bg-primary/50' : 'bg-border'}`} />
                          )}
                        </div>
                        <div className="pb-8">
                          <p className={`font-medium text-sm ${step.done ? 'text-foreground' : 'text-muted'}`}>
                            {step.step}
                          </p>
                          <p className="text-xs text-muted mt-0.5">{step.desc}</p>
                          <p className={`text-xs mt-1 ${step.done ? 'text-accent' : 'text-muted'}`}>
                            {step.time}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                {order.joki && !['COMPLETED', 'CANCELLED', 'PENDING_PAYMENT'].includes(order.status) && (
                  <Link
                    href={`/orders/${order.id}/chat`}
                    className="flex-1 py-3 glass rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:border-primary/30 border border-transparent transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-primary-light" />
                    Chat dengan Joki
                  </Link>
                )}
                {order.status === 'COMPLETED' && (
                  <>
                    <button className="flex-1 py-3 glass rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:border-primary/30 border border-transparent transition-all">
                      <Download className="w-4 h-4" />
                      Download Hasil
                    </button>
                    <button className="flex-1 py-3 glass rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:border-primary/30 border border-transparent transition-all">
                      <Star className="w-4 h-4" />
                      Beri Rating
                    </button>
                  </>
                )}
                <Link
                  href="/orders"
                  className="flex-1 py-3 glass rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:border-primary/30 border border-transparent transition-all"
                >
                  <Package className="w-4 h-4" />
                  Semua Pesanan
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted">Loading...</div>}>
      <TrackingContent />
    </Suspense>
  );
}

