'use client';

import { motion } from 'framer-motion';
import { Star, MessageSquare, ThumbsUp, TrendingUp } from 'lucide-react';

const REVIEWS = [
  { id: 1, customer: 'Ahmad Rizki', avatar: '🧑‍🎓', rating: 5, order: 'ORD-098', service: 'Website Portfolio React', comment: 'Hasil sangat memuaskan! Website-nya responsive dan desainnya keren. Terima kasih!', date: '2025-01-10' },
  { id: 2, customer: 'Siti Nurhaliza', avatar: '👩‍💻', rating: 5, order: 'ORD-097', service: 'Skripsi BAB 2', comment: 'Penulisan rapi, referensi lengkap, dan selesai sebelum deadline. Top!', date: '2025-01-08' },
  { id: 3, customer: 'Budi Santoso', avatar: '🧑‍🔬', rating: 4, order: 'ORD-096', service: 'Tugas Database SQL', comment: 'Secara keseluruhan bagus, cuma ada sedikit revisi di bagian normalisasi. Tapi respon cepat.', date: '2025-01-05' },
  { id: 4, customer: 'Dian Permata', avatar: '👩‍🎓', rating: 5, order: 'ORD-094', service: 'Makalah Ekonomi', comment: 'Perfect! Analisis mendalam dan bahasa akademis yang baik. Pasti order lagi.', date: '2025-01-02' },
  { id: 5, customer: 'Fajar Nugroho', avatar: '🧑‍💼', rating: 4, order: 'ORD-090', service: 'Coding Java OOP', comment: 'Kode bersih dan terstruktur. Dokumentasi juga lengkap. Recommended!', date: '2024-12-28' },
  { id: 6, customer: 'Rina Sari', avatar: '👩‍🔬', rating: 5, order: 'ORD-088', service: 'Skripsi Full', comment: 'Luar biasa! Dari BAB 1-5 semua dikerjakan dengan sangat baik. Dosen saya pun puas.', date: '2024-12-25' },
];

export default function ReviewsPage() {
  const avgRating = 4.9;
  const totalReviews = 45;
  const fiveStars = 38;
  const fourStars = 6;
  const threeStars = 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rating & Review</h1>
        <p className="text-muted text-sm mt-1">Feedback dari customer tentang pekerjaanmu.</p>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl font-bold text-yellow-400">{avgRating}</span>
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-5 h-5 ${star <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
            ))}
          </div>
          <p className="text-sm text-muted">{totalReviews} reviews total</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Distribusi Rating</h3>
          <div className="space-y-3">
            {[
              { stars: 5, count: fiveStars, pct: (fiveStars / totalReviews) * 100 },
              { stars: 4, count: fourStars, pct: (fourStars / totalReviews) * 100 },
              { stars: 3, count: threeStars, pct: (threeStars / totalReviews) * 100 },
              { stars: 2, count: 0, pct: 0 },
              { stars: 1, count: 0, pct: 0 },
            ].map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <span className="text-sm w-8 flex items-center gap-1">
                  {item.stars} <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </span>
                <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full"
                  />
                </div>
                <span className="text-xs text-muted w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Highlight
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-surface-2 rounded-xl">
              <p className="text-sm font-medium text-accent-green">98% Customer Puas</p>
              <p className="text-xs text-muted">Rating 4+ dari total reviews</p>
            </div>
            <div className="p-3 bg-surface-2 rounded-xl">
              <p className="text-sm font-medium text-primary-light">0 Komplain</p>
              <p className="text-xs text-muted">Tidak ada rating dibawah 3</p>
            </div>
            <div className="p-3 bg-surface-2 rounded-xl">
              <p className="text-sm font-medium text-yellow-400">Top 3 Joki 🏆</p>
              <p className="text-xs text-muted">Rating tertinggi bulan ini</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reviews List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-light" />
          Review Terbaru
        </h3>
        <div className="space-y-4">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="p-5 bg-surface-2 rounded-xl border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{review.customer}</p>
                    <p className="text-xs text-muted">{review.service} • <span className="font-mono">{review.order}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted">{review.date}</span>
                <button className="flex items-center gap-1 text-xs text-muted hover:text-primary-light transition-colors">
                  <ThumbsUp className="w-3 h-3" />
                  Terima Kasih
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
