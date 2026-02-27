'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  const containerRef = useRef<HTMLElement>(null);

  // Track scroll progress inside this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Grow width of the connecting line based on scroll
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="py-24 bg-surface relative" id="cara-kerja">
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
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-4 border border-primary/20 shadow-inner">
            Cara Kerja
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            Semudah <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">1-2-3-4</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto text-lg leading-relaxed">
            Proses order transparan & kilat. Tanpa ribet, order langsung dikerjakan oleh Expert.
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative mt-20">

          {/* Active Liquid Line (Desktop) */}
          <div className="hidden lg:block absolute top-[40px] left-[12%] right-[12%] h-1 bg-surface-2 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-primary via-accent to-primary-light rounded-full shadow-[0_0_15px_rgba(var(--primary),0.8)]"
              style={{ width: lineWidth }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, i) => {
              // Create staggered opacity sync with scroll, fallback to whileInView for mobile
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: [0, -8, 0] }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.2,
                    y: { repeat: Infinity, duration: 3 + (i % 2), ease: "easeInOut", delay: i * 0.2 }
                  }}
                  className="relative group text-center z-10"
                >
                  {/* Connecting line (Mobile) */}
                  {i < steps.length - 1 && (
                    <div className="block lg:hidden absolute top-20 left-1/2 bottom-[-40px] w-0.5 bg-gradient-to-b from-primary/30 to-transparent -translate-x-1/2" />
                  )}

                  {/* Icon & Bubble */}
                  <div className="relative inline-flex mb-8">
                    {/* Pulsing ring background */}
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-50 group-hover:scale-125 transition-transform duration-500" />

                    <div className={`w-24 h-24 rounded-3xl bg-surface border border-border flex items-center justify-center relative shadow-lg group-hover:border-primary/50 transition-colors duration-300`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-10 rounded-3xl group-hover:opacity-20 transition-opacity`} />
                      <step.icon className="w-10 h-10 text-foreground group-hover:text-primary transition-colors duration-300" />

                      {/* Step Number Badge */}
                      <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-2 border-2 border-border shadow-md flex items-center justify-center text-xs font-black text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        {step.step}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted leading-relaxed max-w-[250px] mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
