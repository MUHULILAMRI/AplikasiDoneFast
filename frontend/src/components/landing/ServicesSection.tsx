'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Building2, Code2, MessageSquare, Bot, ArrowRight, Star } from 'lucide-react';

const categories = [
  {
    id: 'akademik',
    icon: BookOpen,
    title: 'Akademik',
    description: 'Makalah, skripsi, essay, jurnal, presentasi, dan tugas kuliah lainnya.',
    services: 2341,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'arsitektur',
    icon: Building2,
    title: 'Arsitek & Desain',
    description: 'Desain 3D, denah, rendering, interior, dan gambar teknis arsitektur.',
    services: 735,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'coding',
    icon: Code2,
    title: 'Coding & Web',
    description: 'Website, mobile app, tugas pemrograman, database, dan API development.',
    services: 1567,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'konsultasi',
    icon: MessageSquare,
    title: 'Konsultasi',
    description: 'Konsultasi akademik, bisnis, karir, dan mentoring 1-on-1.',
    services: 890,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'ai_teknologi',
    icon: Bot,
    title: 'AI & Teknologi',
    description: 'Machine learning, data science, automation, bot, dan implementasi AI.',
    services: 456,
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10',
  },
];

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

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/marketplace?category=${cat.id}`}
                className="group block glass rounded-2xl p-8 card-hover"
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <cat.icon className={`w-7 h-7 bg-gradient-to-r ${cat.color} bg-clip-text`} style={{ color: 'inherit' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-light transition-colors">
                  {cat.title}
                </h3>
                <p className="text-muted text-sm mb-4 leading-relaxed">
                  {cat.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">{cat.services.toLocaleString()} layanan</span>
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary-light group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
