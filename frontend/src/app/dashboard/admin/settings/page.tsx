'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Shield, Palette, Globe, CreditCard,
  Mail, Smartphone, Database, Key, Save, Upload,
  ChevronRight, ToggleLeft, ToggleRight, Lock, User
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    orderUpdate: true,
    newCustomer: false,
    marketing: false,
  });

  const tabs = [
    { id: 'general', label: 'Umum', icon: Settings },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'payment', label: 'Pembayaran', icon: CreditCard },
    { id: 'appearance', label: 'Tampilan', icon: Palette },
  ];

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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
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
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 space-y-6"
            >
              <h3 className="font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-light" />
                Pengaturan Umum
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Aplikasi</label>
                  <input type="text" defaultValue="DoneFast" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tagline</label>
                  <input type="text" defaultValue="Tugas Selesai, Lebih Cepat dari yang Kamu Bayangkan" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Support</label>
                  <input type="email" defaultValue="support@donefast.id" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">WhatsApp</label>
                  <input type="text" defaultValue="+6281234567890" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                      DF
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm hover:border-primary/30 transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </button>
                  </div>
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

              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90">
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 space-y-6"
            >
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

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 space-y-6"
            >
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-light" />
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
                <div>
                  <label className="block text-sm font-medium mb-2">Konfirmasi Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
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
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90">
                <Save className="w-4 h-4" />
                Update Password
              </button>
            </motion.div>
          )}

          {activeTab === 'payment' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 space-y-6"
            >
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-light" />
                Pengaturan Pembayaran
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Midtrans Server Key</label>
                  <input type="password" defaultValue="SB-Mid-server-xxxxx" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Midtrans Client Key</label>
                  <input type="password" defaultValue="SB-Mid-client-xxxxx" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div className="pt-2 space-y-3">
                  <h4 className="font-medium text-sm">Metode Pembayaran Aktif</h4>
                  {['QRIS', 'DANA', 'OVO', 'Bank Transfer (BCA, BNI, BRI, Mandiri)', 'GoPay', 'ShopeePay'].map((method, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
                      <span className="text-sm">{method}</span>
                      <button className={i < 4 ? 'text-green-400' : 'text-muted'}>
                        {i < 4 ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Komisi Joki Default (%)</label>
                  <input type="number" defaultValue="70" className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" />
                  <p className="text-xs text-muted mt-1">Persentase dari harga order yang diterima joki</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90">
                <Save className="w-4 h-4" />
                Simpan Pengaturan
              </button>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 space-y-6"
            >
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
                        className={`p-4 rounded-xl border ${
                          theme.active ? 'border-primary bg-primary/5' : 'border-border bg-surface-2'
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
                  <select className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50">
                    <option>Small</option>
                    <option selected>Medium</option>
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
