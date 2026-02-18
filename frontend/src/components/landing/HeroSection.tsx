'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-green/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>Platform Jasa Digital #1 Indonesia</span>
          <Sparkles className="w-4 h-4" />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
        >
          Tugas Selesai,{' '}
          <span className="gradient-text">Lebih Cepat</span>
          <br />
          dari yang Kamu Bayangkan
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10"
        >
          Marketplace jasa akademik & teknologi terpercaya. Dari makalah hingga 
          website, dikerjakan oleh tim profesional dengan garansi kualitas.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/marketplace"
            className="group px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl font-semibold text-lg hover:opacity-90 transition-all glow-primary flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Order Sekarang
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="https://wa.me/6281234567890"
            className="px-8 py-4 bg-surface-2 border border-border text-foreground rounded-2xl font-semibold text-lg hover:border-primary/50 transition-all flex items-center gap-2"
          >
            <MessageCircleIcon />
            Konsultasi Gratis
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent-green" />
            <span>100% Aman & Rahasia</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            <span>Express 1 Hari</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">★★★★★</span>
            <span>4.9/5 (2000+ review)</span>
          </div>
        </motion.div>

        {/* Floating stats cards */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { value: '10K+', label: 'Order Selesai', color: 'from-primary to-primary-light' },
            { value: '500+', label: 'Tim Profesional', color: 'from-accent to-blue-500' },
            { value: '4.9★', label: 'Rating Rata-rata', color: 'from-yellow-500 to-orange-500' },
            { value: '99%', label: 'Kepuasan Client', color: 'from-accent-green to-emerald-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="glass rounded-2xl p-6 hover:scale-105 transition-transform"
            >
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MessageCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
  );
}
