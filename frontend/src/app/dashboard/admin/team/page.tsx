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
  const [editJoki, setEditJoki] = useState<any>(null);
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
      phone: (j.user as Record<string, unknown>)?.phone ?? '',
      total_completed: j.total_completed ?? 0,
      active_orders: (j._count as any)?.orders ?? 0,
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

  async function handleUpdate() {
    if (!editJoki) return;
    try {
      setIsSubmitting(true);
      const payload = {
        name: form.name.trim(),
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        commission_rate: Number(form.commission_rate) || 70,
      };

      const res = await apiAdminUpdateTeam(editJoki.id, payload);
      if (!res.success) {
        alert(res.error || 'Gagal memperbarui joki');
        return;
      }

      setJokiList((prev) =>
        prev.map((j) => (j.id === editJoki.id ? normalizeJoki(res.data as Record<string, unknown>) : j))
      );
      setEditJoki(null);
      setForm({ name: '', email: '', phone: '', skills: '', commission_rate: 70 });
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat memperbarui joki');
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
          <p className="text-muted text-sm mt-1">Kelola tim joki, atur komisi, dan pantau performa secara detail.</p>
        </div>
        <button
          onClick={() => {
            setForm({ name: '', email: '', phone: '', skills: '', commission_rate: 70 });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity glow-primary"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Joki
        </button>
      </div>

      {/* Search & Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 glass rounded-2xl p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Cari nama joki atau skill spesifik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center justify-between">
          <div className="text-sm font-bold">{jokiList.length} Total Joki</div>
          <div className="text-xs text-green-400 font-medium">{jokiList.filter(j => j.is_available).length} Online</div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJoki.map((joki: Record<string, any>, i: number) => (
          <motion.div
            key={joki.id as string}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group glass rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

            {/* Header */}
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold glow-primary">
                  {(joki.name as string)?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{joki.name as string}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold">{joki.rating as number || '5.0'}</span>
                    <span className="text-[10px] text-muted uppercase font-bold ml-2">Verified</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleAvailability(joki.id as string, Boolean(joki.is_available))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${joki.is_available
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${joki.is_available ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{joki.is_available ? 'Online' : 'Offline'}</span>
              </button>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 mb-5 relative z-10">
              {((joki.skills as string[]) || []).map((skill: string, j: number) => (
                <span key={j} className="px-2 py-0.5 rounded-md bg-surface-2 text-muted text-[10px] font-bold border border-border/50 uppercase tracking-tighter group-hover:text-primary-light group-hover:border-primary/30 transition-colors">
                  {skill}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-6 relative z-10">
              <div className="bg-surface-2/50 rounded-xl p-2.5 text-center border border-border/50 group-hover:bg-primary/5 transition-colors">
                <p className="text-lg font-black text-foreground">{joki.total_completed as number}</p>
                <p className="text-[9px] text-muted font-bold uppercase tracking-widest">Selesai</p>
              </div>
              <div className="bg-surface-2/50 rounded-xl p-2.5 text-center border border-border/50 group-hover:bg-primary/5 transition-colors">
                <p className="text-lg font-black text-primary-light">{joki.commission_rate as number}%</p>
                <p className="text-[9px] text-muted font-bold uppercase tracking-widest">Komisi</p>
              </div>
              <div className={`rounded-xl p-2.5 text-center border transition-all ${joki.active_orders > 0 ? 'bg-accent/10 border-accent/20' : 'bg-surface-2/50 border-border/50'
                }`}>
                <p className={`text-lg font-black ${joki.active_orders > 0 ? 'text-accent' : 'text-foreground'}`}>
                  {joki.active_orders as number}
                </p>
                <p className="text-[9px] text-muted font-bold uppercase tracking-widest">Aktif</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 relative z-10">
              <button
                onClick={() => {
                  setForm({
                    name: joki.name,
                    email: joki.email || '',
                    phone: joki.phone || '',
                    skills: (joki.skills as string[]).join(', '),
                    commission_rate: joki.commission_rate,
                  });
                  setEditJoki(joki);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-2 border border-border rounded-xl text-xs font-bold hover:border-primary/50 hover:bg-primary/5 transition-all text-muted hover:text-primary-light"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </button>
              <button
                onClick={() => handleDelete(joki.id as string)}
                className="py-3 px-4 bg-surface-2 border border-border rounded-xl text-muted hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editJoki) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          setShowAddModal(false);
          setEditJoki(null);
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 max-w-lg w-full border border-primary/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                {editJoki ? <Edit className="w-5 h-5 text-primary-light" /> : <UserPlus className="w-5 h-5 text-primary-light" />}
              </div>
              <h2 className="text-xl font-bold">{editJoki ? 'Edit Profil Joki' : 'Tambah Joki Baru'}</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Contoh: Ahmad Rizky"
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1.5 ml-1">Komisi (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.commission_rate}
                      onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })}
                      min={1}
                      max={100}
                      className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50 transition-all font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-bold">%</span>
                  </div>
                </div>
              </div>

              {!editJoki && (
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1.5 ml-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1.5 ml-1">No. WhatsApp</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1.5 ml-1">Skills (Pisahkan dengan koma)</label>
                <textarea
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="Contoh: Skripsi, Makalah, Python, React"
                  rows={3}
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all resize-none font-medium"
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditJoki(null);
                  }}
                  className="flex-1 py-3.5 bg-surface-2 border border-border rounded-xl text-sm font-bold text-muted hover:border-primary/30 transition-all"
                >
                  Batal
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={editJoki ? handleUpdate : handleCreate}
                  className="flex-2 py-3.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-bold hover:opacity-95 disabled:opacity-60 transition-all glow-primary px-8"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </div>
                  ) : editJoki ? (
                    'Simpan Perubahan'
                  ) : (
                    'Daftarkan Joki'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
