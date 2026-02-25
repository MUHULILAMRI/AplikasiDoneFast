// ============================================
// DoneFast - Type Definitions
// ============================================

export type UserRole = 'customer' | 'admin' | 'joki';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'in_progress'
  | 'revision'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'qris' | 'dana' | 'ovo' | 'bank_transfer' | 'ewallet';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type ServiceCategory =
  | 'akademik'
  | 'arsitektur'
  | 'coding'
  | 'konsultasi'
  | 'ai_teknologi';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

// ============================================
// User Types
// ============================================
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  balance: number;
  is_vip: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Service Types
// ============================================
export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  base_price: number;
  rating: number;
  total_orders: number;
  estimated_days: number;
  image?: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
}

// ============================================
// Order Types
// ============================================
export interface Order {
  id: string;
  user_id: string;
  service_id: string;
  joki_id?: string;
  title: string;
  description: string;
  requirements: string;
  files: string[];
  deadline: string;
  price: number;
  status: OrderStatus;
  difficulty: DifficultyLevel;
  pages?: number;
  revisions_left: number;
  result_files: string[];
  created_at: string;
  updated_at: string;
  // Relations
  user?: User;
  service?: Service;
  joki?: JokiMember;
}

// ============================================
// Joki Types
// ============================================
export interface JokiMember {
  id: string;
  user_id: string;
  name: string;
  skills: string[];
  rating: number;
  total_completed: number;
  commission_rate: number;
  is_available: boolean;
  avatar?: string;
  user?: User;
}

// ============================================
// Chat Types
// ============================================
export interface ChatMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_role: UserRole;
  message: string;
  file_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  order_id: string;
  participants: string[];
  last_message?: ChatMessage;
  unread_count: number;
}

// ============================================
// Transaction Types
// ============================================
export interface Transaction {
  id: string;
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_url?: string;
  paid_at?: string;
  created_at: string;
}

// ============================================
// Dashboard Stats
// ============================================
export interface DashboardStats {
  total_orders_today: number;
  total_income_today: number;
  active_users: number;
  pending_orders: number;
  in_progress_orders: number;
  completed_orders: number;
  total_income_month: number;
  total_profit_month: number;
}

// ============================================
// AI Types
// ============================================
export interface PriceEstimation {
  base_price: number;
  difficulty_multiplier: number;
  deadline_multiplier: number;
  pages_cost: number;
  total_price: number;
  estimated_days: number;
}

export interface AIRecommendation {
  service: Service;
  confidence: number;
  reason: string;
}

// ============================================
// Promo Types
// ============================================
export interface Voucher {
  id: string;
  code: string;
  discount_percent: number;
  discount_amount: number;
  min_order: number;
  max_discount: number;
  valid_until: string;
  usage_count: number;
  max_usage: number;
  is_active: boolean;
}

// ============================================
// Notification Types
// ============================================
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_update' | 'file_ready' | 'revision' | 'deadline' | 'payment' | 'promo';
  is_read: boolean;
  created_at: string;
}
