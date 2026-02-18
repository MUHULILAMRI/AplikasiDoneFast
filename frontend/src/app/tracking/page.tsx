'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import {
  Package, CheckCircle, Clock, Truck, CreditCard,
  FileText, Star, MessageSquare, Download, Search,
  ArrowRight, User, Calendar, Shield
} from 'lucide-react';

const TRACKING_DATA = {
  id: 'ORD-20250113-001',
  service: 'Joki Skripsi - BAB 3 Metodologi',
  customer: 'Ahmad Rizki',
  joki: 'Alex Coder',
  price: 350000,
  orderDate: '2025-01-10',
  deadline: '2025-01-15',
  status: 'in_progress',
  progress: 70,
  timeline: [
    { step: 'Order Dibuat', desc: 'Order berhasil dibuat dan pembayaran diterima', time: '10 Jan 2025, 09:30', done: true, icon: CreditCard },
    { step: 'Dikonfirmasi', desc: 'Admin telah mengkonfirmasi dan meng-assign joki', time: '10 Jan 2025, 10:15', done: true, icon: Shield },
    { step: 'Pengerjaan Dimulai', desc: 'Joki Alex Coder mulai mengerjakan tugas', time: '10 Jan 2025, 14:00', done: true, icon: FileText },
    { step: 'Progress 50%', desc: 'Bagian metodologi selesai, mulai analisis', time: '12 Jan 2025, 16:00', done: true, icon: Package },
    { step: 'Progress 70%', desc: 'Bagian analisis data sedang dikerjakan', time: '13 Jan 2025, 10:00', done: true, icon: Package },
    { step: 'Review & QC', desc: 'Admin melakukan pengecekan kualitas', time: 'Estimasi 14 Jan 2025', done: false, icon: CheckCircle },
    { step: 'Selesai', desc: 'Hasil dikirim ke customer', time: 'Estimasi 15 Jan 2025', done: false, icon: Star },
  ],
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [showTracking, setShowTracking] = useState(!!searchParams.get('id'));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
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
              onClick={() => setShowTracking(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-medium hover:opacity-90 flex items-center gap-2"
            >
              Lacak
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {showTracking && (
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
                    <span className="font-mono text-sm text-muted">{TRACKING_DATA.id}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                      Sedang Dikerjakan
                    </span>
                  </div>
                  <h2 className="text-lg font-bold">{TRACKING_DATA.service}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-accent-green">{formatCurrency(TRACKING_DATA.price)}</p>
                  <p className="text-xs text-muted">Lunas</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-surface-2 rounded-xl">
                  <p className="text-xs text-muted flex items-center gap-1"><User className="w-3 h-3" /> Joki</p>
                  <p className="text-sm font-medium mt-1">{TRACKING_DATA.joki}</p>
                </div>
                <div className="p-3 bg-surface-2 rounded-xl">
                  <p className="text-xs text-muted flex items-center gap-1"><Calendar className="w-3 h-3" /> Order</p>
                  <p className="text-sm font-medium mt-1">{TRACKING_DATA.orderDate}</p>
                </div>
                <div className="p-3 bg-surface-2 rounded-xl">
                  <p className="text-xs text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> Deadline</p>
                  <p className="text-sm font-medium mt-1">{TRACKING_DATA.deadline}</p>
                </div>
                <div className="p-3 bg-surface-2 rounded-xl">
                  <p className="text-xs text-muted">Progress</p>
                  <p className="text-sm font-bold text-primary-light mt-1">{TRACKING_DATA.progress}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="h-3 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${TRACKING_DATA.progress}%` }}
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
                {TRACKING_DATA.timeline.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.done
                          ? 'bg-gradient-to-br from-primary to-accent'
                          : 'bg-surface-2 border border-border'
                      }`}>
                        <step.icon className={`w-5 h-5 ${step.done ? 'text-white' : 'text-muted'}`} />
                      </div>
                      {i < TRACKING_DATA.timeline.length - 1 && (
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
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button className="flex-1 py-3 glass rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:border-primary/30 border border-transparent transition-all">
                <MessageSquare className="w-4 h-4" />
                Chat dengan Joki
              </button>
              <button className="flex-1 py-3 glass rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:border-primary/30 border border-transparent transition-all">
                <Download className="w-4 h-4" />
                Download Hasil
              </button>
              <button className="flex-1 py-3 glass rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:border-primary/30 border border-transparent transition-all">
                <Star className="w-4 h-4" />
                Beri Rating
              </button>
            </motion.div>
          </>
        )}
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
