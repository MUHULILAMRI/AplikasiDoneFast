'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_JOKI } from '@/lib/data';
import {
  UserPlus, Search, Star, CheckCircle2, XCircle,
  MoreVertical, Edit, Trash2, Eye, TrendingUp
} from 'lucide-react';

export default function TeamManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tim Joki</h1>
          <p className="text-muted text-sm mt-1">Kelola tim joki, atur komisi, dan pantau performa.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Joki
        </button>
      </div>

      {/* Search */}
      <div className="glass rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Cari nama joki atau skill..."
            className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_JOKI.map((joki, i) => (
          <motion.div
            key={joki.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6 hover:border-primary/20 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
                  {joki.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{joki.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{joki.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${joki.is_available ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs text-muted">{joki.is_available ? 'Online' : 'Offline'}</span>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {joki.skills.map((skill, j) => (
                <span key={j} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary-light text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-surface-2 rounded-xl p-3 text-center border border-border">
                <p className="text-lg font-bold">{joki.total_completed}</p>
                <p className="text-xs text-muted">Selesai</p>
              </div>
              <div className="bg-surface-2 rounded-xl p-3 text-center border border-border">
                <p className="text-lg font-bold">{joki.commission_rate}%</p>
                <p className="text-xs text-muted">Komisi</p>
              </div>
              <div className="bg-surface-2 rounded-xl p-3 text-center border border-border">
                <p className="text-lg font-bold">3</p>
                <p className="text-xs text-muted">Active</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors">
                <Eye className="w-4 h-4" />
                Detail
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button className="py-2.5 px-3 bg-surface-2 border border-border rounded-xl text-sm hover:border-red-500/30 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-8 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-6">Tambah Joki Baru</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                <input type="text" placeholder="Nama joki" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input type="email" placeholder="email@example.com" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Skills (pisahkan dengan koma)</label>
                <input type="text" placeholder="React, Next.js, Python" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Komisi (%)</label>
                <input type="number" defaultValue={50} min={10} max={90} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-surface-2 border border-border rounded-xl hover:border-primary/30 transition-colors">
                  Batal
                </button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-medium hover:opacity-90">
                  Tambah Joki
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
