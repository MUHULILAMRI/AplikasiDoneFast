'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Users, DollarSign, Gift,
  MessageCircle, Settings, Bell, Menu, X, LogOut, ChevronDown,
  TrendingUp, UserCheck, BarChart3
} from 'lucide-react';

const sidebarLinks = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Order', href: '/dashboard/admin/orders', icon: ShoppingBag },
  { label: 'Tim Joki', href: '/dashboard/admin/team', icon: Users },
  { label: 'Keuangan', href: '/dashboard/admin/finance', icon: DollarSign },
  { label: 'Promo', href: '/dashboard/admin/promo', icon: Gift },
  { label: 'Chat', href: '/dashboard/admin/chat', icon: MessageCircle },
  { label: 'Pelanggan', href: '/dashboard/admin/customers', icon: UserCheck },
  { label: 'Laporan', href: '/dashboard/admin/reports', icon: BarChart3 },
  { label: 'Pengaturan', href: '/dashboard/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-surface border-r border-border z-40 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-sm">
                DF
              </div>
              <span className="text-lg font-bold gradient-text">DoneFast</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
          >
            <Menu className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary-light font-medium'
                    : 'text-muted hover:text-foreground hover:bg-surface-2'
                }`}
              >
                <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-light' : ''}`} />
                {sidebarOpen && <span>{link.label}</span>}
                {isActive && sidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-light" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin DoneFast</p>
                <p className="text-xs text-muted truncate">admin@donefast.id</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Link>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-surface border-r border-border z-50"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-sm">
                    DF
                  </div>
                  <span className="text-lg font-bold gradient-text">DoneFast</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="py-4 px-3 space-y-1">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary-light font-medium'
                          : 'text-muted hover:text-foreground hover:bg-surface-2'
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="h-16 glass border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-2"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-muted">Admin Panel</h2>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-surface-2 transition-colors">
              <Bell className="w-5 h-5 text-muted" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="relative p-2 rounded-xl hover:bg-surface-2 transition-colors">
              <MessageCircle className="w-5 h-5 text-muted" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-green rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
