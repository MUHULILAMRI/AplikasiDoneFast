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
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { useAppStore } from '@/store/useAppStore';

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
  const { user, logout } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Helper untuk mendapatkan nama panggilan
  const firstName = user?.name ? user.name.split(' ')[0] : 'Joki';
  const userRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Joki';

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-float-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-float-2" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-500/5 blur-[100px] rounded-full animate-float-1" />
      </div>

      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03] bg-noise" />

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
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 ${collapsed ? 'w-20' : 'w-64'} glass-morphism border-r border-white/5 flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive
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
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-sm border border-white/10">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  '👨‍💻'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Loading...'}</p>
                <p className="text-xs text-muted">{userRole}</p>
              </div>
              <button onClick={logout} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Logout">
                <LogOut className="w-4 h-4 text-muted" />
              </button>
            </div>
          ) : (
            <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-5 h-5 text-muted" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-30 transition-all bg-background/50 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-surface-2 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <Breadcrumbs />
              <h2 className="font-semibold text-sm tracking-tight text-shimmer">Selamat Datang, {firstName}! 👋</h2>
              <p className="text-xs text-muted font-medium">Mari selesaikan tugas hari ini</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/joki/notifications" className="relative p-2 hover:bg-surface-2 rounded-lg">
              <Bell className="w-5 h-5 text-muted" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </Link>
            <Link href="/dashboard/joki/chat" className="relative p-2 hover:bg-surface-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-muted" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
