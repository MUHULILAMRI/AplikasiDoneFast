'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  apiAdminTeam,
  apiAdminCreateTeam,
  apiAdminUpdateTeam,
  apiAdminDeleteTeam,
} from '@/lib/api';
import {
  UserPlus,
  Search,
  Star,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';

export default function TeamManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [jokiList, setJokiList] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    commission_rate: 70,
  });

  useEffect(() => {
    async function load() {
      const res = await apiAdminTeam();
      if (res.success) {
        const raw = res.data as Record<string, unknown>[];
        setJokiList(raw.map(normalizeJoki));
      }
    }
    load();
  }, []);

  const filteredJoki = jokiList.filter((j) => {
    const term = search.toLowerCase();
    const skillsText = ((j.skills as string[]) ?? []).join(',').toLowerCase();
    return (
      (j.name as string)?.toLowerCase().includes(term) ||
      skillsText.includes(term)
    );
  });

  function normalizeJoki(j: Record<string, unknown>) {
    return {
      ...j,
      name: (j.user as Record<string, unknown>)?.name ?? j.name,
      email: (j.user as Record<string, unknown>)?.email ?? j.email,
      total_completed: (j._count as Record<string, number>)?.orders ?? j.total_completed ?? 0,
      skills: (j.skills as string[]) ?? [],
      commission_rate: (j.commission_rate as number) ?? 70,
      is_available: j.is_available ?? true,
    };
  }

  async function handleCreate() {
    try {
      setIsSubmitting(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        commission_rate: Number(form.commission_rate) || 70,
      };

      if (!payload.name || !payload.email || payload.skills.length === 0) {
        alert('Nama, email, dan minimal satu skill wajib diisi');
        return;
      }

      const res = await apiAdminCreateTeam(payload);
      if (!res.success) {
        alert(res.error || 'Gagal menambah joki');
        return;
      }

      setJokiList((prev) => [normalizeJoki(res.data as Record<string, unknown>), ...prev]);
      setShowAddModal(false);
      setForm({ name: '', email: '', phone: '', skills: '', commission_rate: 70 });
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menambah joki');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleAvailability(id: string, isAvailable: boolean) {
    try {
      const res = await apiAdminUpdateTeam(id, { is_available: !isAvailable });
      if (!res.success) {
        alert(res.error || 'Gagal memperbarui status');
        return;
      }

      setJokiList((prev) =>
        prev.map((j) => (j.id === id ? normalizeJoki(res.data as Record<string, unknown>) : j))
      );
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat memperbarui status');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Nonaktifkan joki ini?')) return;
    try {
      const res = await apiAdminDeleteTeam(id);
      if (!res.success) {
        alert(res.error || 'Gagal menonaktifkan joki');
        return;
      }
      setJokiList((prev) => prev.filter((j) => j.id !== id));
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menonaktifkan joki');
    }
  }

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJoki.map((joki: Record<string, unknown>, i: number) => (
          <motion.div
            key={joki.id as string}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6 hover:border-primary/20 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
                  {(joki.name as string)?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{joki.name as string}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{joki.rating as number}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleAvailability(joki.id as string, Boolean(joki.is_available))}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-2 transition-colors"
              >
                <span className={`w-3 h-3 rounded-full ${joki.is_available ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs text-muted">{joki.is_available ? 'Online' : 'Offline'}</span>
              </button>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {((joki.skills as string[]) || []).map((skill: string, j: number) => (
                <span key={j} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary-light text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-surface-2 rounded-xl p-3 text-center border border-border">
                <p className="text-lg font-bold">{joki.total_completed as number}</p>
                <p className="text-xs text-muted">Selesai</p>
              </div>
              <div className="bg-surface-2 rounded-xl p-3 text-center border border-border">
                <p className="text-lg font-bold">{joki.commission_rate as number}%</p>
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
              <button
                onClick={() => handleToggleAvailability(joki.id as string, Boolean(joki.is_available))}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors"
              >
                <Edit className="w-4 h-4" />
                {joki.is_available ? 'Set Offline' : 'Set Online'}
              </button>
              <button
                onClick={() => handleDelete(joki.id as string)}
                className="py-2.5 px-3 bg-surface-2 border border-border rounded-xl text-sm hover:border-red-500/30 hover:text-red-400 transition-colors"
              >
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
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama joki"
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">No. HP (opsional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08xxx"
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Skills (pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="React, Next.js, Python"
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Komisi (%)</label>
                <input
                  type="number"
                  value={form.commission_rate}
                  onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })}
                  min={10}
                  max={90}
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-surface-2 border border-border rounded-xl hover:border-primary/30 transition-colors">
                  Batal
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleCreate}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Tambah Joki'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
