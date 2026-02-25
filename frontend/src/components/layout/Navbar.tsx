'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Bell, MessageCircle, ChevronDown, LogOut,
  LayoutDashboard, Settings, ShoppingBag, Check, BellOff,
  Package, FileCheck, AlertCircle, Clock, CreditCard, Tag,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiGetNotifications, apiMarkNotificationRead } from '@/lib/api';

const navLinks = [
  { label: 'Layanan', href: '/marketplace' },
  { label: 'Cara Kerja', href: '/#cara-kerja' },
  { label: 'Harga', href: '/marketplace#pricing' },
  { label: 'Testimoni', href: '/#testimoni' },
];

function getDashboardPath(role?: string) {
  switch (role) {
    case 'admin': return '/dashboard/admin';
    case 'joki': return '/dashboard/joki';
    default: return '/orders';
  }
}

// Notification type icon mapping
function getNotifIcon(type: string) {
  switch (type) {
    case 'order_update': return <Package className="w-4 h-4" />;
    case 'file_ready': return <FileCheck className="w-4 h-4" />;
    case 'revision': return <AlertCircle className="w-4 h-4" />;
    case 'deadline': return <Clock className="w-4 h-4" />;
    case 'payment': return <CreditCard className="w-4 h-4" />;
    case 'promo': return <Tag className="w-4 h-4" />;
    default: return <Bell className="w-4 h-4" />;
  }
}

function getNotifColor(type: string) {
  switch (type) {
    case 'order_update': return 'text-blue-400 bg-blue-500/10';
    case 'file_ready': return 'text-green-400 bg-green-500/10';
    case 'revision': return 'text-orange-400 bg-orange-500/10';
    case 'deadline': return 'text-red-400 bg-red-500/10';
    case 'payment': return 'text-emerald-400 bg-emerald-500/10';
    case 'promo': return 'text-purple-400 bg-purple-500/10';
    default: return 'text-muted bg-surface-2';
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

interface NotifItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAppStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setNotifLoading(true);
    try {
      const res = await apiGetNotifications();
      if (res.success) {
        const d = res.data as { notifications?: NotifItem[]; unread_count?: number } | NotifItem[];
        if (Array.isArray(d)) {
          setNotifications(d);
          setUnreadCount(d.filter((n: NotifItem) => !n.is_read).length);
        } else {
          setNotifications(d.notifications ?? []);
          setUnreadCount(d.unread_count ?? 0);
        }
      }
    } catch { /* ignore */ }
    setNotifLoading(false);
  }, [isAuthenticated]);

  // Poll notifications every 30s — only when tab is visible
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();

    let interval: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (!interval) interval = setInterval(fetchNotifications, 30000);
    };
    const stopPolling = () => {
      if (interval) { clearInterval(interval); interval = null; }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchNotifications(); // refresh on tab focus
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isAuthenticated, fetchNotifications]);

  const handleMarkAllRead = async () => {
    // Optimistic update
    const prevNotifs = notifications;
    const prevCount = unreadCount;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    const res = await apiMarkNotificationRead(prevNotifs.filter(n => !n.is_read).map(n => n.id));
    if (!res.success) {
      // Revert on failure
      setNotifications(prevNotifs);
      setUnreadCount(prevCount);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    // Optimistic update
    const prevNotifs = notifications;
    const prevCount = unreadCount;
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    const res = await apiMarkNotificationRead([id]);
    if (!res.success) {
      setNotifications(prevNotifs);
      setUnreadCount(prevCount);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    router.push('/');
  };

  const dashboardPath = getDashboardPath(user?.role);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass shadow-lg shadow-black/20' : 'bg-transparent'
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

          {/* Right Actions — Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <Link href="/orders" className="relative p-2 rounded-xl hover:bg-surface-2 transition-colors" title="Pesanan Saya">
                  <ShoppingBag className="w-5 h-5 text-muted" />
                </Link>

                {/* ======= NOTIFIKASI ======= */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                    className="relative p-2 rounded-xl hover:bg-surface-2 transition-colors"
                    title="Notifikasi"
                  >
                    <Bell className="w-5 h-5 text-muted" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[480px] rounded-xl glass border border-border shadow-xl shadow-black/30 overflow-hidden flex flex-col"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                          <h3 className="font-semibold text-sm">Notifikasi</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="flex items-center gap-1 text-xs text-primary-light hover:underline"
                            >
                              <Check className="w-3 h-3" />
                              Tandai semua dibaca
                            </button>
                          )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto">
                          {notifLoading && notifications.length === 0 ? (
                            <div className="flex items-center justify-center py-12 text-muted text-sm">
                              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                              Memuat...
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted">
                              <BellOff className="w-10 h-10 mb-2 opacity-40" />
                              <p className="text-sm">Belum ada notifikasi</p>
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <button
                                key={notif.id}
                                onClick={() => {
                                  if (!notif.is_read) handleMarkOneRead(notif.id);
                                  setNotifOpen(false);
                                }}
                                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-2 transition-colors border-b border-border/50 last:border-0 ${!notif.is_read ? 'bg-primary/5' : ''
                                  }`}
                              >
                                <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${getNotifColor(notif.type)}`}>
                                  {getNotifIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm leading-tight ${!notif.is_read ? 'font-semibold' : 'font-medium text-muted'}`}>
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{notif.message}</p>
                                  <p className="text-[10px] text-muted/60 mt-1">{timeAgo(notif.created_at)}</p>
                                </div>
                                {!notif.is_read && (
                                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ======= CHAT ======= */}
                <Link
                  href="/chat"
                  className="relative p-2 rounded-xl hover:bg-surface-2 transition-colors"
                  title="Chat AI Assistant"
                >
                  <MessageCircle className="w-5 h-5 text-muted" />
                </Link>

                {/* ======= USER DROPDOWN ======= */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-medium leading-tight">{user.name || 'User'}</p>
                      <p className="text-xs text-muted leading-tight capitalize">{user.role}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl glass border border-border shadow-xl shadow-black/20 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-semibold truncate">{user.name}</p>
                          <p className="text-xs text-muted truncate">{user.email}</p>
                          {user.is_vip && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-black rounded-full">
                              ⭐ VIP
                            </span>
                          )}
                        </div>
                        <div className="py-1">
                          <Link href={dashboardPath} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link href="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
                            <ShoppingBag className="w-4 h-4" /> Pesanan Saya
                          </Link>
                          <Link href={`${dashboardPath}/settings`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
                            <Settings className="w-4 h-4" /> Pengaturan
                          </Link>
                        </div>
                        <div className="border-t border-border py-1">
                          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                            <LogOut className="w-4 h-4" /> Keluar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">
                  Masuk
                </Link>
                <Link href="/marketplace" className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:opacity-90 transition-opacity glow-primary">
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
            <div className="px-4 py-6 space-y-3">
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

              {isAuthenticated && user ? (
                <>
                  {/* User Profile Card */}
                  <div className="flex items-center gap-3 py-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </div>
                  </div>

                  {/* Mobile Quick Actions */}
                  <div className="flex gap-2">
                    <Link
                      href="/chat"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-2 border border-border rounded-xl text-sm text-muted hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" /> Chat
                    </Link>
                    <button
                      onClick={() => { setMobileOpen(false); router.push('/orders'); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-2 border border-border rounded-xl text-sm text-muted hover:text-foreground transition-colors relative"
                    >
                      <Bell className="w-4 h-4" /> Notifikasi
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <Link href={dashboardPath} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2.5 text-sm text-muted hover:text-foreground transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2.5 text-sm text-muted hover:text-foreground transition-colors">
                    <ShoppingBag className="w-4 h-4" /> Pesanan Saya
                  </Link>
                  <Link href={`${dashboardPath}/settings`} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2.5 text-sm text-muted hover:text-foreground transition-colors">
                    <Settings className="w-4 h-4" /> Pengaturan
                  </Link>

                  <hr className="border-border" />
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full py-2.5 text-sm text-red-400 hover:text-red-300 transition-colors">
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center px-5 py-3 text-sm text-muted hover:text-foreground border border-border rounded-xl transition-colors">
                    Masuk
                  </Link>
                  <Link href="/marketplace" onClick={() => setMobileOpen(false)} className="block w-full text-center px-5 py-3 text-sm font-medium bg-gradient-to-r from-primary to-primary-light text-white rounded-xl">
                    Order Sekarang
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
