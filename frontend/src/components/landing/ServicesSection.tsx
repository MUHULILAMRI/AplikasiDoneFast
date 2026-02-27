'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Building2, Code2, MessageSquare, Bot, ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'akademik',
    icon: BookOpen,
    title: 'Akademik',
    description: 'Makalah, skripsi, essay, jurnal, presentasi, dan tugas kuliah.',
    services: 2341,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-500/10',
    className: 'md:col-span-2 lg:col-span-2 row-span-2',
  },
  {
    id: 'arsitektur',
    icon: Building2,
    title: 'Arsitek & Desain',
    description: 'Desain 3D, denah, rendering, interior.',
    services: 735,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    className: 'md:col-span-1 lg:col-span-1',
  },
  {
    id: 'coding',
    icon: Code2,
    title: 'Coding & Web',
    description: 'Website, mobile app, API, database.',
    services: 1567,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    className: 'md:col-span-1 lg:col-span-1',
  },
  {
    id: 'konsultasi',
    icon: MessageSquare,
    title: 'Mentoring 1-on-1',
    description: 'Konsultasi akademik, bisnis, karir.',
    services: 890,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    className: 'md:col-span-2 lg:col-span-1',
  },
  {
    id: 'ai_teknologi',
    icon: Bot,
    title: 'AI & Automasi',
    description: 'Machine learning, data science, bot.',
    services: 456,
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10',
    className: 'md:col-span-1 lg:col-span-2',
  },
];

// Spotlight Card component
function ServiceCard({ cat, index }: { cat: any, index: number }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
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

    // For spotlight
    mouseX.set(x);
    mouseY.set(y);

    // For 3D Tilt (-1 to 1 based on center)
    pointerX.set((x / width) * 2 - 1);
    pointerY.set((y / height) * 2 - 1);
  }

  function handleMouseLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  // Smooth out the rotation
  const rotateX = useTransform(pointerY, [-1, 1], [7, -7]);
  const rotateY = useTransform(pointerX, [-1, 1], [-7, 7]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000
      }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-surface-2 border border-border p-8 card-hover shadow-xl ${cat.className} transition-shadow duration-300 hover:shadow-primary/20 hover:shadow-2xl`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/marketplace?category=${cat.id}`} className="absolute inset-0 z-20" />

      {/* Spotlight Hover Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(var(--primary), 0.15),
                transparent 80%
              )
            `,
        }}
      />
      {/* Background Glow */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] opacity-20 bg-gradient-to-r ${cat.color} transition-opacity duration-500 group-hover:opacity-50`} />

      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl ${cat.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
          <cat.icon className={`w-7 h-7 bg-gradient-to-r ${cat.color} bg-clip-text`} style={{ color: 'inherit' }} />
        </div>
        <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-light transition-colors">
          {cat.title}
        </h3>
        <p className="text-muted text-sm leading-relaxed mb-6 font-medium max-w-[85%]">
          {cat.description}
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-xs font-bold text-muted border border-border/50">
          {cat.services.toLocaleString('id-ID')} layanan
        </span>
        <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all transform group-hover:-rotate-45">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  return (
    <section className="py-24 relative" id="layanan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary-light uppercase tracking-wider">Layanan Kami</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
            Semua yang Kamu Butuhkan,{' '}
            <span className="gradient-text">Ada di Sini</span>
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            Dari tugas kuliah sampai proyek teknologi kompleks, tim profesional kami siap membantu.
          </p>
        </motion.div>

        {/* Category Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(240px,auto)]">
          {categories.map((cat, i) => (
            <ServiceCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
