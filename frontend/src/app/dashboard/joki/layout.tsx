'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, Upload, MessageSquare,
  DollarSign, Star, Settings, LogOut, Menu, X, Bell,
  ChevronLeft, ChevronRight, User, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/joki' },
  { label: 'Order Saya', icon: ClipboardList, href: '/dashboard/joki/orders' },
  { label: 'Upload Hasil', icon: Upload, href: '/dashboard/joki/upload' },
  { label: 'Chat', icon: MessageSquare, href: '/dashboard/joki/chat' },
  { label: 'Komisi', icon: DollarSign, href: '/dashboard/joki/commission' },
  { label: 'Rating & Review', icon: Star, href: '/dashboard/joki/reviews' },
  { label: 'Pengaturan', icon: Settings, href: '/dashboard/joki/settings' },
];

export default function JokiDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 ${collapsed ? 'w-20' : 'w-64'} glass border-r border-border flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className={`p-6 border-b border-border flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link href="/dashboard/joki" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Joki Panel
              </span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block p-1 hover:bg-surface-2 rounded-lg">
            {collapsed ? <ChevronRight className="w-4 h-4 text-muted" /> : <ChevronLeft className="w-4 h-4 text-muted" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-accent/20 to-primary/10 text-accent border border-accent/20'
                    : 'text-muted hover:text-foreground hover:bg-surface-2'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 border-t border-border ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-sm">
                👨‍💻
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Alex Coder</p>
                <p className="text-xs text-muted">Joki Senior</p>
              </div>
              <button className="p-1.5 hover:bg-surface rounded-lg">
                <LogOut className="w-4 h-4 text-muted" />
              </button>
            </div>
          ) : (
            <button className="p-2 hover:bg-surface-2 rounded-lg">
              <LogOut className="w-5 h-5 text-muted" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="glass border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-surface-2 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-semibold text-sm">Selamat Datang, Alex! 👋</h2>
              <p className="text-xs text-muted">Mari selesaikan tugas hari ini</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-surface-2 rounded-lg">
              <Bell className="w-5 h-5 text-muted" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>
            <button className="relative p-2 hover:bg-surface-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-muted" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
