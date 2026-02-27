'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { apiRegister, setToken } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Chrome } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAppStore();
  const searchParams = useSearchParams();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi tidak sama');
      return;
    }

    setIsLoading(true);

    const res = await apiRegister({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    if (res.success) {
      const { user, token } = res.data;
      setToken(token);
      setUser({
        id: user.id as string,
        name: user.name as string,
        email: user.email as string,
        role: (user.role as string).toLowerCase() as 'admin' | 'customer' | 'joki',
        balance: 0,
        is_vip: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      const redirect = searchParams.get('redirect');
      window.location.href = redirect || '/marketplace';
    } else {
      setError(res.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-grid relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-xl">
            DF
          </div>
          <span className="text-2xl font-bold gradient-text">DoneFast</span>
        </Link>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-2 text-center">Buat Akun Baru</h1>
          <p className="text-muted text-sm text-center mb-8">Daftar gratis dan mulai order sekarang</p>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama lengkap kamu"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" title="Wajib digunakan agar Joki atau Admin mudah menghubungi Anda">
                No. WhatsApp <span className="text-red-400">*</span> <span className="text-[10px] text-muted font-normal">(Wajib Aktif)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08123456789 (Akan digunakan untuk chat)"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
                  className="w-full pl-12 pr-12 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Ulangi password"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-primary"
              />
              <span className="text-xs text-muted">
                Dengan mendaftar, saya setuju dengan{' '}
                <Link href="/terms" className="text-primary-light hover:underline">Syarat & Ketentuan</Link>
                {' '}dan{' '}
                <Link href="/privacy" className="text-primary-light hover:underline">Kebijakan Privasi</Link>
                {' '}DoneFast.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading || !agreed}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Daftar Sekarang
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">atau</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button className="w-full py-3 bg-surface-2 border border-border rounded-xl font-medium hover:border-primary/30 transition-colors flex items-center justify-center gap-3">
            <Chrome className="w-5 h-5" />
            Daftar dengan Google
          </button>

          <p className="text-center text-sm text-muted mt-6">
            Sudah punya akun?{' '}
            <Link href="/login?force=1" className="text-primary-light hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
