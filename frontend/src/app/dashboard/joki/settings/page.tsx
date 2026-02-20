'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiGetMe } from '@/lib/api';
import {
  Settings, User, Bell, Shield, CreditCard, Save,
  ToggleLeft, ToggleRight, Upload, Mail, Phone,
  MapPin, Briefcase
} from 'lucide-react';

export default function JokiSettingsPage() {
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const [notifications, setNotifications] = useState({
    newOrder: true,
    chat: true,
    deadline: true,
    commission: true,
  });

  useEffect(() => {
    async function load() {
      const res = await apiGetMe();
      if (res.success) setProfile(res.data as Record<string, unknown>);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted text-sm mt-1">Kelola profil dan preferensi akunmu.</p>
      </div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-accent" />
          Profil
        </h3>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-3xl">
            👨‍💻
          </div>
          <button className="px-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm hover:border-accent/30 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Ganti Foto
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
            <input type="text" defaultValue={(profile.name as string) ?? ''} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input type="text" defaultValue={(profile.username as string) ?? ''} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" defaultValue={(profile.email as string) ?? ''} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">No. Telepon</label>
            <input type="tel" defaultValue={(profile.phone as string) ?? ''} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            defaultValue={(profile.bio as string) ?? ''}
            rows={3}
            className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 resize-none"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Spesialisasi</label>
          <div className="flex flex-wrap gap-2">
            {['Python', 'Java', 'React', 'Skripsi', 'Machine Learning', 'Database'].map((skill) => (
              <span key={skill} className="px-3 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded-lg text-xs font-medium">
                {skill}
              </span>
            ))}
            <button className="px-3 py-1.5 bg-surface-2 border border-dashed border-border rounded-lg text-xs text-muted hover:border-accent/30">
              + Tambah
            </button>
          </div>
        </div>
        <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl text-sm font-medium hover:opacity-90">
          <Save className="w-4 h-4" />
          Simpan Profil
        </button>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" />
          Notifikasi
        </h3>
        <div className="space-y-3">
          {[
            { key: 'newOrder', label: 'Order Baru', desc: 'Notifikasi saat ada order baru di-assign' },
            { key: 'chat', label: 'Pesan Chat', desc: 'Notifikasi saat ada pesan baru dari customer' },
            { key: 'deadline', label: 'Pengingat Deadline', desc: 'Notifikasi saat deadline mendekat' },
            { key: 'commission', label: 'Komisi Masuk', desc: 'Notifikasi saat komisi diterima' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={notifications[item.key as keyof typeof notifications] ? 'text-green-400' : 'text-muted'}
              >
                {notifications[item.key as keyof typeof notifications] ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Payment Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-accent" />
          Informasi Pembayaran
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">DANA</label>
            <input type="text" defaultValue="081234567890" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bank BCA</label>
            <input type="text" defaultValue="1234567890" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nama Pemilik Rekening</label>
            <input type="text" defaultValue="Alex Coder" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
        </div>
        <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl text-sm font-medium hover:opacity-90">
          <Save className="w-4 h-4" />
          Simpan
        </button>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          Keamanan
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Password Lama</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password Baru</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
        </div>
        <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-surface-2 border border-border rounded-xl text-sm hover:border-accent/30">
          Update Password
        </button>
      </motion.div>
    </div>
  );
}
