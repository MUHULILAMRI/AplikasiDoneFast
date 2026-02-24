'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { apiUpdateProfile } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import {
  User, Bell, Shield, CreditCard, Save,
  ToggleLeft, ToggleRight, CheckCircle, Loader2
} from 'lucide-react';

export default function JokiSettingsPage() {
  const { user, fetchUser } = useAppStore();

  // ── Profile state ──
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // ── Security state ──
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secSaving, setSecSaving] = useState(false);
  const [secSuccess, setSecSuccess] = useState(false);
  const [secError, setSecError] = useState('');

  // ── Notification toggles ──
  const [notifications, setNotifications] = useState({
    newOrder: true,
    chat: true,
    deadline: true,
    commission: true,
  });

  const avatarOptions = ['👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🔬', '🧑‍🎨', '🦊', '🐯', '⚡', '🚀', '🎯', '🎮', '💡', '🔥', '🌟', '💻'];

  // ── Load user profile ──
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileAvatar(user.avatar || '');
    }
  }, [user]);

  // ── Save profile via API ──
  const handleSaveProfile = useCallback(async () => {
    setProfileSaving(true);
    setProfileSuccess(false);
    setProfileError('');
    try {
      const res = await apiUpdateProfile({
        name: profileName,
        phone: profilePhone,
        avatar: profileAvatar,
      });
      if (res.success) {
        setProfileSuccess(true);
        fetchUser();
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setProfileError(res.error || 'Gagal menyimpan profil');
      }
    } catch {
      setProfileError('Terjadi kesalahan');
    } finally {
      setProfileSaving(false);
    }
  }, [profileName, profilePhone, profileAvatar, fetchUser]);

  // ── Change password ──
  const handleChangePassword = useCallback(async () => {
    if (!oldPassword || !newPassword) {
      setSecError('Password lama dan baru wajib diisi');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecError('Konfirmasi password tidak cocok');
      return;
    }
    setSecSaving(true);
    setSecSuccess(false);
    setSecError('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSecSuccess(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSecSuccess(false), 3000);
      } else {
        setSecError(data.error || 'Gagal mengubah password');
      }
    } catch {
      setSecError('Terjadi kesalahan');
    } finally {
      setSecSaving(false);
    }
  }, [oldPassword, newPassword, confirmPassword]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted text-sm mt-1">Kelola profil dan preferensi akunmu.</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-accent" />
          Profil
        </h3>

        {/* Avatar */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Avatar</label>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-3xl">
              {profileAvatar || '👤'}
            </div>
            <p className="text-sm text-muted">Pilih emoji avatar:</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {avatarOptions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setProfileAvatar(emoji)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${profileAvatar === emoji
                  ? 'bg-accent/20 border-2 border-accent scale-110'
                  : 'bg-surface-2 border border-border hover:border-accent/30'
                  }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-muted cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">No. Telepon</label>
            <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="+628xxxxxxxxxx" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
        </div>

        {profileError && <p className="mt-4 text-sm text-red-400">{profileError}</p>}
        {profileSuccess && <p className="mt-4 text-sm text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Profil berhasil diperbarui!</p>}
        <button onClick={handleSaveProfile} disabled={profileSaving} className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {profileSaving ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-accent" />
          Informasi Pembayaran
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">DANA / OVO / GoPay / ShopeePay</label>
            <input type="text" defaultValue="082291220759" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bank BRI</label>
            <input type="text" defaultValue="082291220759" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">SeaBank</label>
            <input type="text" defaultValue="082291220759" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nama Pemilik Rekening</label>
            <input type="text" defaultValue="DoneFast" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
        </div>
        <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl text-sm font-medium hover:opacity-90">
          <Save className="w-4 h-4" />
          Simpan
        </button>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          Keamanan
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Password Lama</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password Baru</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Konfirmasi Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
          </div>
        </div>
        {secError && <p className="mt-4 text-sm text-red-400">{secError}</p>}
        {secSuccess && <p className="mt-4 text-sm text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Password berhasil diubah!</p>}
        <button onClick={handleChangePassword} disabled={secSaving} className="mt-6 flex items-center gap-2 px-6 py-3 bg-surface-2 border border-border rounded-xl text-sm hover:border-accent/30 disabled:opacity-50">
          {secSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {secSaving ? 'Mengubah...' : 'Update Password'}
        </button>
      </motion.div>
    </div>
  );
}
