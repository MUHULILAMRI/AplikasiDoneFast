'use client';

import { motion } from 'framer-motion';
import { Search, FileText, CreditCard, Rocket } from 'lucide-react';

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Pilih Layanan',
    description: 'Browse katalog jasa kami dan pilih layanan yang sesuai kebutuhan kamu.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: FileText,
    step: '02',
    title: 'Isi Detail & Upload',
    description: 'Jelaskan kebutuhan, upload file pendukung, dan pilih deadline yang diinginkan.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Bayar & Konfirmasi',
    description: 'Bayar melalui QRIS, e-wallet, atau transfer bank. Verifikasi otomatis & instan.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Rocket,
    step: '04',
    title: 'Terima Hasil',
    description: 'Tim kami mengerjakan order kamu. Track progress realtime & download hasil selesai.',
    color: 'from-green-500 to-emerald-500',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-surface relative" id="cara-kerja">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary-light uppercase tracking-wider">Cara Kerja</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
            Semudah <span className="gradient-text">1-2-3-4</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Proses order yang simpel dan transparan. Tanpa ribet, langsung jadi.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="text-center">
                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} bg-opacity-10 flex items-center justify-center mx-auto mb-6 relative`}>
                  <step.icon className="w-8 h-8 text-white" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center text-xs font-bold text-primary-light">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
