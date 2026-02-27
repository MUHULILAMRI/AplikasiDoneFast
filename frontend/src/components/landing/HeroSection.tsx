'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

const TYPING_WORDS = ["Lebih Cepat", "Lebih Estetik", "Lebih Premium", "Lebih Murah"];

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);

  // For 3D Tilt Logo
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    // -1 to 1 based on center
    pointerX.set((x / width) * 2 - 1);
    pointerY.set((y / height) * 2 - 1);
  }

  function handleMouseLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  // Tilt intensity
  const rotateX = useTransform(pointerY, [-1, 1], [15, -15]);
  const rotateY = useTransform(pointerX, [-1, 1], [-15, 15]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
      {/* Background effects - animated floating orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-float-1" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-float-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-green/5 rounded-full blur-[100px] animate-float-1" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* 2-Column Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center pt-24 pb-16">

          {/* Left Column: Text & CTA */}
          <div className="text-left z-10 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm"
            >
              <Sparkles className="w-4 h-4 text-primary-light" />
              <span className="text-shimmer font-medium">Platform Jasa Digital #1 Indonesia</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tugas Selesai, <br />
              <div className="h-[1.2em] relative overflow-hidden inline-flex items-center w-full">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={wordIndex}
                    initial={{ y: 50, opacity: 0, filter: 'blur(8px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -50, opacity: 0, filter: 'blur(8px)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary-light"
                  >
                    {TYPING_WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted max-w-xl"
            >
              Marketplace jasa akademik & teknologi premium. Percayakan pada tim profesional kami dengan garansi 100% uang kembali.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link
                href="/marketplace"
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <Zap className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Mulai Order</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="https://wa.me/6281234567890"
                className="w-full sm:w-auto px-8 py-4 bg-surface-2 border border-border text-foreground rounded-2xl font-bold text-lg hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircleIcon />
                Tanya Dulu
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-6 text-sm text-muted font-medium"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent-green" />
                <span>100% Aman</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                <span>Express 1 Hari</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-400">★★★★★</span>
                <span>(2K+ review)</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Premium 3D Card Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
            className="relative h-[400px] sm:h-[500px] w-full hidden lg:flex items-center justify-center perspective-1000 z-10 group"
          >
            {/* Ambient Base Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/40 transition-colors duration-700" />
              <div className="absolute w-56 h-56 bg-accent/20 blur-[80px] rounded-full translate-x-12 -translate-y-12" />
            </div>

            {/* Premium Glass Card Container */}
            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-[340px] h-[440px] rounded-[2rem] border border-white/10 bg-gradient-to-br from-surface/80 to-surface-2/90 backdrop-blur-2xl shadow-[0_30px_100px_rgba(99,102,241,0.15)] flex flex-col items-center justify-between p-8 cursor-pointer transition-all duration-500 hover:shadow-[0_40px_120px_rgba(99,102,241,0.3)] hover:border-white/20 group/card"
            >
              {/* Inner Glow Elements */}
              <div className="absolute inset-0 rounded-[2rem] pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[60px] translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 blur-[50px] -translate-x-1/2 translate-y-1/2" />
                {/* Tech Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 mask-image-linear-gradient(to_bottom,black_50%,transparent_100%)" />
              </div>

              {/* Card Header */}
              <div
                className="w-full flex justify-between items-center z-10"
                style={{ transform: "translateZ(30px)" }}
              >
                <div className="px-3 py-1.5 bg-surface-3/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold tracking-widest text-accent-green uppercase flex items-center gap-2 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
                  </span>
                  System Online
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-3/50 border border-white/10 flex items-center justify-center p-1.5 backdrop-blur-md">
                  <Shield className="w-full h-full text-muted" />
                </div>
              </div>

              {/* Central Logo & Branding */}
              <div
                className="relative z-10 w-full flex-1 flex flex-col items-center justify-center mt-2 transition-transform duration-500 group-hover/card:scale-105"
                style={{ transform: "translateZ(70px)" }}
              >
                <div className="relative mb-6">
                  {/* Glowing Orbit Ring */}
                  <div className="absolute inset-0 border border-primary/30 rounded-full animate-spin opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" style={{ animationDuration: '8s' }} />
                  <div className="absolute inset-2 border border-accent/20 rounded-full animate-spin opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />

                  {/* Logo Image */}
                  <img
                    src="/logo.png"
                    alt="DoneFast Logo"
                    className="w-36 h-36 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative z-20"
                  />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tight">
                    DONEFAST PRO
                  </h3>
                  <p className="text-[10px] text-primary-light font-mono tracking-widest opacity-80">
                    PLATFORM DIGITAL #1
                  </p>
                </div>
              </div>

              {/* Card Footer Features */}
              <div
                className="w-full grid grid-cols-2 gap-3 z-10 mt-6"
                style={{ transform: "translateZ(40px)" }}
              >
                <div className="bg-surface-3/30 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-surface-3/60 transition-colors">
                  <Zap className="w-4 h-4 text-accent drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                  <span className="text-[10px] font-bold text-muted tracking-wider">EXPRESS</span>
                </div>
                <div className="bg-surface-3/30 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-surface-3/60 transition-colors">
                  <Sparkles className="w-4 h-4 text-primary-light drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                  <span className="text-[10px] font-bold text-muted tracking-wider">PREMIUM</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

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
              className="glass rounded-2xl p-6 card-hover"
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
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
