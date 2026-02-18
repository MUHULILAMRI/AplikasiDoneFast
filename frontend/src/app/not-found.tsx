'use client';

import { motion } from 'framer-motion';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          404
        </div>
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8 text-primary-light" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-muted text-sm mb-6">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2.5 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </motion.div>
    </div>
  );
}
