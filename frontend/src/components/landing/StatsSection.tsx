'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TrendingUp, Users, CheckCircle2, Clock } from 'lucide-react';

const stats = [
  { icon: CheckCircle2, value: 10847, label: 'Order Selesai', prefix: '', suffix: '+', color: 'text-accent-green' },
  { icon: Users, value: 5234, label: 'User Terdaftar', prefix: '', suffix: '+', color: 'text-accent' },
  { icon: TrendingUp, value: 99, label: 'Tingkat Kepuasan', prefix: '', suffix: '%', color: 'text-primary-light' },
  { icon: Clock, value: 24, label: 'Jam Rata-rata Selesai', prefix: '', suffix: ' jam', color: 'text-yellow-400' },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary-light uppercase tracking-wider">Statistik</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3">
            Angka yang <span className="gradient-text">Berbicara</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div className={`text-3xl sm:text-4xl font-bold ${stat.color} mb-2`}>
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
