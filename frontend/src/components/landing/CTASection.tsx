'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Gift } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
      <div className="absolute inset-0 bg-grid" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Promo badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm mb-8">
            <Gift className="w-4 h-4" />
            <span>Diskon 20% untuk order pertama — Kode: <strong>WELCOME20</strong></span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Siap Menyelesaikan{' '}
            <span className="gradient-text">Tugasmu?</span>
          </h2>
          <p className="text-lg text-muted mb-10 max-w-xl mx-auto">
            Jangan tunda lagi. Ribuan mahasiswa sudah mempercayakan tugas mereka 
            kepada DoneFast. Sekarang giliran kamu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/marketplace"
              className="group px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl font-semibold text-lg hover:opacity-90 transition-all glow-primary flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Order Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/marketplace"
              className="px-8 py-4 bg-surface-2 border border-border text-foreground rounded-2xl font-semibold text-lg hover:border-primary/50 transition-all"
            >
              Lihat Harga
            </Link>
          </div>

          {/* Benefits */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
            <span>✅ Garansi revisi</span>
            <span>✅ Privasi terjamin</span>
            <span>✅ Support 24/7</span>
            <span>✅ Pembayaran aman</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
