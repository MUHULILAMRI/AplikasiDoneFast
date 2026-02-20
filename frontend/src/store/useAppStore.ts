// ============================================
// DoneFast - Global Store (Zustand)
// ============================================
import { create } from 'zustand';
import { User, Order, ChatMessage, Notification } from '@/types';
import {
  apiGetMe,
  apiGetOrders,
  apiGetMessages,
  apiGetNotifications,
  apiMarkNotificationRead,
  removeToken,
  setToken,
} from '@/lib/api';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;

  // Orders
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;
  fetchOrders: (params?: { status?: string; page?: number; limit?: number }) => Promise<void>;

  // Chat
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  fetchMessages: (orderId: string) => Promise<void>;

  // Notifications
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  fetchNotifications: () => Promise<void>;

  // UI
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isChatOpen: boolean;
  toggleChat: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    removeToken();
    set({ user: null, isAuthenticated: false });
  },
  fetchUser: async () => {
    const res = await apiGetMe();
    if (res.success) {
      const d = res.data as Record<string, unknown>;
      set({
        user: {
          id: d.id as string,
          name: d.name as string,
          email: d.email as string,
          role: (d.role as string).toLowerCase() as User['role'],
          avatar: d.avatar as string | undefined,
          phone: d.phone as string | undefined,
          balance: Number(d.balance ?? 0),
          is_vip: d.is_vip as boolean,
          created_at: d.created_at as string,
          updated_at: d.updated_at as string ?? new Date().toISOString(),
        },
        isAuthenticated: true,
      });
    } else {
      removeToken();
      set({ user: null, isAuthenticated: false });
    }
  },

  // Orders
  orders: [],
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (id, data) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
    })),
  fetchOrders: async (params) => {
    const res = await apiGetOrders(params);
    if (res.success) {
      const data = res.data as { data?: unknown[] } | unknown[];
      const orders = Array.isArray(data) ? data : (data.data ?? []);
      set({ orders: orders as Order[] });
    }
  },

  // Chat
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  fetchMessages: async (orderId) => {
    const res = await apiGetMessages(orderId);
    if (res.success) {
      set({ messages: res.data as ChatMessage[] });
    }
  },

  // Notifications
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  markNotificationRead: (id) => {
    apiMarkNotificationRead([id]);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    }));
  },
  fetchNotifications: async () => {
    const res = await apiGetNotifications();
    if (res.success) {
      set({ notifications: res.data as Notification[] });
    }
  },

  // UI
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
}));
