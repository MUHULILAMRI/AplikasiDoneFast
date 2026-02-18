'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, MessageCircle, Bell, User, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navLinks = [
  { label: 'Layanan', href: '/marketplace' },
  { label: 'Cara Kerja', href: '/#cara-kerja' },
  { label: 'Harga', href: '/marketplace' },
  { label: 'Testimoni', href: '/#testimoni' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAppStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-lg group-hover:scale-110 transition-transform">
              DF
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              DoneFast
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted hover:text-foreground transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button className="relative p-2 rounded-xl hover:bg-surface-2 transition-colors">
                  <Bell className="w-5 h-5 text-muted" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <button className="relative p-2 rounded-xl hover:bg-surface-2 transition-colors">
                  <MessageCircle className="w-5 h-5 text-muted" />
                </button>
                <Link href="/dashboard/admin" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-2 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm">{user?.name || 'User'}</span>
                  <ChevronDown className="w-4 h-4 text-muted" />
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/marketplace"
                  className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:opacity-90 transition-opacity glow-primary"
                >
                  Order Sekarang
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-surface-2 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-border"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-muted hover:text-foreground transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-border" />
              <Link
                href="/marketplace"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-5 py-3 text-sm font-medium bg-gradient-to-r from-primary to-primary-light text-white rounded-xl"
              >
                Order Sekarang
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
