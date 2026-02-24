'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Shield, Palette, Globe, CreditCard,
  Mail, Smartphone, Database, Key, Save, Upload,
  ToggleLeft, ToggleRight, Lock, User, CheckCircle, Loader2
} from 'lucide-react';
import { apiGetMe, apiUpdateProfile, apiGetSettings, apiUpdateSettings } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { user, fetchUser } = useAppStore();

  // Pricing settings state
  const [pricing, setPricing] = useState<Record<string, string>>({
    price_akademik: '50000',
    price_arsitektur: '150000',
    price_coding: '200000',
    price_konsultasi: '100000',
    price_ai_teknologi: '250000',
    price_per_page: '15000',
    tax_percent: '0',
    deadline_1day_multiplier: '2.5',
    deadline_3day_multiplier: '1.8',
  });
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingSaved, setPricingSaved] = useState(false);

  // Load pricing from API
  useEffect(() => {
    async function loadPricing() {
      const res = await apiGetSettings();
      if (res.success) {
        setPricing(prev => ({ ...prev, ...(res.data as Record<string, string>) }));
      }
    }
    loadPricing();
  }, []);

  const handleSavePricing = async () => {
    setPricingSaving(true);
    const res = await apiUpdateSettings(pricing);
    setPricingSaving(false);
    if (res.success) {
      setPricingSaved(true);
      setTimeout(() => setPricingSaved(false), 3000);
    } else {
      alert('Gagal menyimpan pengaturan harga');
    }
  };

  // ── General settings state ──
  const [appName, setAppName] = useState('DoneFast');
  const [tagline, setTagline] = useState('Tugas Selesai, Lebih Cepat dari yang Kamu Bayangkan');
  const [emailSupport, setEmailSupport] = useState('support@donefast.id');
  const [whatsapp, setWhatsapp] = useState('+6281234567890');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

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
    email: true,
    push: true,
    orderUpdate: true,
    newCustomer: false,
    marketing: false,
  });

  // ── Load user profile ──
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileAvatar(user.avatar || '');
    }
  }, [user]);

  // ── Save general settings (stored locally for now) ──
  const handleSaveGeneral = useCallback(async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    try {
      // Save app settings to localStorage (no backend table for app settings yet)
      localStorage.setItem('app_settings', JSON.stringify({
        appName, tagline, emailSupport, whatsapp,
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  }, [appName, tagline, emailSupport, whatsapp]);

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
        // Refresh global user state
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
    if (newPassword.length < 4) {
      setSecError('Password minimal 4 karakter');
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

  // ── Load saved settings from localStorage ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_settings');
      if (saved) {
        const s = JSON.parse(saved);
        if (s.appName) setAppName(s.appName);
        if (s.tagline) setTagline(s.tagline);
        if (s.emailSupport) setEmailSupport(s.emailSupport);
        if (s.whatsapp) setWhatsapp(s.whatsapp);
      }
    } catch { /* ignore */ }
  }, []);

  const tabs = [
    { id: 'general', label: 'Umum', icon: Settings },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'payment', label: 'Pembayaran', icon: CreditCard },
    { id: 'appearance', label: 'Tampilan', icon: Palette },
  ];

  // Emoji picker list for avatar
  const avatarOptions = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '🧑‍🎓', '👩‍🎓', '🧑‍🎨', '🧑‍💼', '👨‍🔬', '👩‍🔬', '🦊', '🐯', '🎯', '⚡', '🚀'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted text-sm mt-1">Kelola pengaturan aplikasi dan akun.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Tabs */}
        <div className="glass rounded-2xl p-4 lg:w-64 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary/20 to-primary-light/10 text-primary-light border border-primary/20'
                  : 'text-muted hover:text-foreground hover:bg-surface-2'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {/* ── General Tab ── */}
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-light" />
                Pengaturan Umum
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Aplikasi</label>
                  <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tagline</label>
                  <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Support</label>
                  <input type="email" value={emailSupport} onChange={(e) => setEmailSupport(e.target.value)} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">WhatsApp</label>
                  <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>

                <div className="pt-4">
                  <h4 className="font-medium text-sm mb-3">Pengaturan Operasional</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
                      <div>
                        <p className="text-sm font-medium">Mode Maintenance</p>
                        <p className="text-xs text-muted">Nonaktifkan website sementara</p>
                      </div>
                      <button className="text-muted"><ToggleLeft className="w-6 h-6" /></button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
                      <div>
                        <p className="text-sm font-medium">Terima Order Baru</p>
                        <p className="text-xs text-muted">Izinkan pelanggan membuat order baru</p>
                      </div>
                      <button className="text-green-400"><ToggleRight className="w-6 h-6" /></button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
                      <div>
                        <p className="text-sm font-medium">Auto Assign Joki</p>
                        <p className="text-xs text-muted">Otomatis assign joki berdasarkan spesialisasi</p>
                      </div>
                      <button className="text-green-400"><ToggleRight className="w-6 h-6" /></button>
                    </div>
                  </div>
                </div>
              </div>

              {saveError && <p className="text-sm text-red-400">{saveError}</p>}
              {saveSuccess && <p className="text-sm text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Pengaturan berhasil disimpan!</p>}
              <button onClick={handleSaveGeneral} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </motion.div>
          )}

          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary-light" />
                Profil Saya
              </h3>
              <div className="space-y-4">
                {/* Avatar / Logo */}
                <div>
                  <label className="block text-sm font-medium mb-2">Avatar / Logo</label>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl">
                      {profileAvatar || '👤'}
                    </div>
                    <div>
                      <p className="text-sm text-muted">Pilih emoji avatar:</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {avatarOptions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setProfileAvatar(emoji)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${profileAvatar === emoji
                          ? 'bg-primary/20 border-2 border-primary scale-110'
                          : 'bg-surface-2 border border-border hover:border-primary/30'
                          }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nama</label>
                  <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-muted cursor-not-allowed" />
                  <p className="text-xs text-muted mt-1">Email tidak dapat diubah</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">No. Telepon</label>
                  <input type="text" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="+628xxxxxxxxxx" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
              </div>

              {profileError && <p className="text-sm text-red-400">{profileError}</p>}
              {profileSuccess && <p className="text-sm text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Profil berhasil diperbarui!</p>}
              <button onClick={handleSaveProfile} disabled={profileSaving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {profileSaving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </motion.div>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-light" />
                Pengaturan Notifikasi
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Notifikasi Email', desc: 'Kirim notifikasi via email', icon: Mail },
                  { key: 'push', label: 'Push Notification', desc: 'Notifikasi di browser/app', icon: Smartphone },
                  { key: 'orderUpdate', label: 'Update Order', desc: 'Notifikasi saat status order berubah', icon: Database },
                  { key: 'newCustomer', label: 'Pelanggan Baru', desc: 'Notifikasi saat ada pelanggan baru', icon: User },
                  { key: 'marketing', label: 'Email Marketing', desc: 'Kirim promo dan update ke pelanggan', icon: Mail },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary-light" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted">{item.desc}</p>
                      </div>
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
          )}

          {/* ── Security Tab ── */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-light" />
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
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-primary-light" />
                      <div>
                        <p className="text-sm font-medium">Two-Factor Authentication</p>
                        <p className="text-xs text-muted">Keamanan tambahan untuk akun admin</p>
                      </div>
                    </div>
                    <button className="text-muted"><ToggleLeft className="w-6 h-6" /></button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-primary-light" />
                      <div>
                        <p className="text-sm font-medium">Auto Logout</p>
                        <p className="text-xs text-muted">Logout otomatis setelah 30 menit tidak aktif</p>
                      </div>
                    </div>
                    <button className="text-green-400"><ToggleRight className="w-6 h-6" /></button>
                  </div>
                </div>
              </div>
              {secError && <p className="text-sm text-red-400">{secError}</p>}
              {secSuccess && <p className="text-sm text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Password berhasil diubah!</p>}
              <button onClick={handleChangePassword} disabled={secSaving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {secSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {secSaving ? 'Mengubah...' : 'Update Password'}
              </button>
            </motion.div>
          )}

          {/* ── Payment Tab ── */}
          {activeTab === 'payment' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Harga Dasar per Kategori */}
              <div className="glass rounded-2xl p-6 space-y-5">
                <h3 className="font-semibold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-light" />
                  Harga Dasar per Kategori
                </h3>
                <p className="text-sm text-muted">Atur harga base untuk setiap kategori layanan (dalam Rupiah).</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'price_akademik', label: '📚 Akademik' },
                    { key: 'price_arsitektur', label: '🏗️ Arsitektur & Desain' },
                    { key: 'price_coding', label: '💻 Coding & Web' },
                    { key: 'price_konsultasi', label: '💬 Konsultasi' },
                    { key: 'price_ai_teknologi', label: '🤖 AI & Teknologi' },
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-sm font-medium mb-2">{item.label}</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted">Rp</span>
                        <input
                          type="number"
                          value={pricing[item.key]}
                          onChange={(e) => setPricing(prev => ({ ...prev, [item.key]: e.target.value }))}
                          className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Biaya Halaman & Pajak */}
              <div className="glass rounded-2xl p-6 space-y-5">
                <h3 className="font-semibold flex items-center gap-2">
                  <Database className="w-5 h-5 text-accent" />
                  Biaya Tambahan & Pajak
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Biaya per Halaman</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted">Rp</span>
                      <input
                        type="number"
                        value={pricing.price_per_page}
                        onChange={(e) => setPricing(prev => ({ ...prev, price_per_page: e.target.value }))}
                        className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <p className="text-xs text-muted mt-1">Biaya tambahan per halaman tugas</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pajak / Admin Fee (%)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={pricing.tax_percent}
                        onChange={(e) => setPricing(prev => ({ ...prev, tax_percent: e.target.value }))}
                        className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                      />
                      <span className="text-sm text-muted">%</span>
                    </div>
                    <p className="text-xs text-muted mt-1">Pajak/biaya admin yang ditambahkan ke total harga</p>
                  </div>
                </div>
              </div>

              {/* Multiplier Deadline */}
              <div className="glass rounded-2xl p-6 space-y-5">
                <h3 className="font-semibold flex items-center gap-2">
                  <Key className="w-5 h-5 text-orange-400" />
                  Multiplier Deadline Express
                </h3>
                <p className="text-sm text-muted">Pengganda harga untuk deadline mendesak (contoh: 2.5 = +150% dari harga base).</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Deadline ≤ 1 Hari</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted">×</span>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        value={pricing.deadline_1day_multiplier}
                        onChange={(e) => setPricing(prev => ({ ...prev, deadline_1day_multiplier: e.target.value }))}
                        className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deadline ≤ 3 Hari</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted">×</span>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        value={pricing.deadline_3day_multiplier}
                        onChange={(e) => setPricing(prev => ({ ...prev, deadline_3day_multiplier: e.target.value }))}
                        className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSavePricing}
                disabled={pricingSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {pricingSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : pricingSaved ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {pricingSaved ? 'Tersimpan!' : 'Simpan Pengaturan Harga'}
              </button>
            </motion.div>
          )}

          {/* ── Appearance Tab ── */}
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary-light" />
                Tampilan
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">Tema</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Dark', bg: 'bg-[#0a0a0f]', active: true },
                      { name: 'Light', bg: 'bg-white', active: false },
                      { name: 'System', bg: 'bg-gradient-to-r from-[#0a0a0f] to-white', active: false },
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        className={`p-4 rounded-xl border ${theme.active ? 'border-primary bg-primary/5' : 'border-border bg-surface-2'
                          } transition-colors`}
                      >
                        <div className={`w-full h-12 rounded-lg ${theme.bg} border border-border mb-2`} />
                        <p className="text-sm font-medium">{theme.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Warna Utama</label>
                  <div className="flex gap-3">
                    {[
                      { color: '#6366f1', name: 'Indigo' },
                      { color: '#8b5cf6', name: 'Violet' },
                      { color: '#3b82f6', name: 'Blue' },
                      { color: '#10b981', name: 'Emerald' },
                      { color: '#f59e0b', name: 'Amber' },
                      { color: '#ef4444', name: 'Red' },
                    ].map((c) => (
                      <button
                        key={c.name}
                        className={`w-10 h-10 rounded-full border-2 ${c.color === '#6366f1' ? 'border-white scale-110' : 'border-transparent'} transition-all hover:scale-110`}
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Font Size</label>
                  <select defaultValue="Medium" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50">
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
