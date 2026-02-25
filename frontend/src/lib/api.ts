// ============================================
// DoneFast - API Client Helper
// ============================================

const API_BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('donefast_token');
}

export function setToken(token: string) {
  localStorage.setItem('donefast_token', token);
  // Also set cookie so Next.js middleware can read it during SSR/navigation
  if (typeof document !== 'undefined') {
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
  }
}

export function removeToken() {
  localStorage.removeItem('donefast_token');
  if (typeof document !== 'undefined') {
    document.cookie = 'token=; path=/; max-age=0';
  }
}

const MAX_RETRIES = 2;
const REQUEST_TIMEOUT = 10000; // 10 seconds

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = MAX_RETRIES
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const json = await res.json();
    return json;
  } catch (err) {
    // Retry on network errors (not on user abort)
    if (retries > 0 && !(err instanceof DOMException && err.name === 'AbortError' && options.signal?.aborted)) {
      // Small delay before retry
      await new Promise(r => setTimeout(r, 500));
      return request<T>(endpoint, options, retries - 1);
    }

    if (err instanceof DOMException && err.name === 'AbortError') {
      return { success: false, error: 'Koneksi timeout. Periksa koneksi internet kamu.' };
    }

    return { success: false, error: 'Terjadi kesalahan jaringan. Silakan coba lagi.' };
  }
}

// ============================================
// Auth APIs
// ============================================
export async function apiLogin(email: string, password: string) {
  return request<{ user: Record<string, unknown>; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  return request<{ user: Record<string, unknown>; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetMe() {
  return request<Record<string, unknown>>('/auth/me');
}

export async function apiUpdateProfile(data: { name?: string; phone?: string; avatar?: string }) {
  return request<Record<string, unknown>>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ============================================
// Services APIs
// ============================================
export async function apiGetServices(params?: {
  category?: string;
  search?: string;
  sort?: string;
}) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.sort) query.set('sort', params.sort);
  const qs = query.toString();
  return request<unknown[]>(`/services${qs ? `?${qs}` : ''}`);
}

export async function apiGetService(id: string) {
  return request<unknown>(`/services/${id}`);
}

export async function apiCreateService(data: Record<string, unknown>) {
  return request<unknown>('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateService(id: string, data: Record<string, unknown>) {
  return request<unknown>(`/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteService(id: string) {
  return request<unknown>(`/services/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// Orders APIs
// ============================================
export async function apiGetOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return request<unknown>(`/orders${qs ? `?${qs}` : ''}`);
}

export async function apiCreateOrder(data: Record<string, unknown>) {
  return request<unknown>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetOrder(id: string) {
  return request<unknown>(`/orders/${id}`);
}

export async function apiUpdateOrder(id: string, data: Record<string, unknown>) {
  return request<unknown>(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiGetOrderTracking(id: string) {
  return request<unknown>(`/orders/${id}/tracking`);
}

// ============================================
// Payment APIs
// ============================================
export async function apiCreatePayment(data: {
  order_id: string;
  payment_method: string;
  proof_url?: string;
}) {
  return request<unknown>('/payment/create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiVerifyPayment(id: string) {
  return request<unknown>(`/payment/verify/${id}`);
}

// ============================================
// Chat APIs
// ============================================
export async function apiGetMessages(orderId: string) {
  return request<unknown[]>(`/chat/${orderId}`);
}

export async function apiSendMessage(orderId: string, message: string, fileUrl?: string) {
  return request<unknown>(`/chat/${orderId}`, {
    method: 'POST',
    body: JSON.stringify({ message, file_url: fileUrl }),
  });
}

export async function apiGetUnreadCounts() {
  return request<Record<string, number>>('/chat/unread');
}

// ============================================
// Notification APIs
// ============================================
export async function apiGetNotifications() {
  return request<unknown>('/notifications');
}

export async function apiMarkNotificationRead(ids: string[]) {
  return request<unknown>('/notifications', {
    method: 'PATCH',
    body: JSON.stringify({ notification_ids: ids }),
  });
}

// ============================================
// Voucher APIs
// ============================================
export async function apiGetVouchers(options?: { includeInactive?: boolean }) {
  const qs = options?.includeInactive ? '?all=1' : '';
  return request<unknown[]>(`/vouchers${qs}`);
}

export async function apiCreateVoucher(data: Record<string, unknown>) {
  return request<unknown>('/vouchers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateVoucher(id: string, data: Record<string, unknown>) {
  return request<unknown>(`/vouchers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteVoucher(id: string) {
  return request<unknown>(`/vouchers/${id}`, {
    method: 'DELETE',
  });
}

export async function apiValidateVoucher(code: string, orderAmount: number) {
  return request<unknown>('/vouchers/validate', {
    method: 'POST',
    body: JSON.stringify({ code, order_amount: orderAmount }),
  });
}

// ============================================
// AI APIs
// ============================================
export async function apiEstimatePrice(data: Record<string, unknown>) {
  return request<unknown>('/ai/estimate-price', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiAIRecommend(data: Record<string, unknown>) {
  return request<unknown[]>('/ai/recommend', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiAIChatbot(message: string) {
  return request<unknown>('/ai/chatbot', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

// ============================================
// Admin APIs
// ============================================
export async function apiAdminDashboard() {
  return request<unknown>('/admin/dashboard');
}

export async function apiAdminFinance() {
  return request<unknown>('/admin/finance');
}

export async function apiAdminTeam() {
  return request<unknown[]>('/admin/team');
}

export async function apiAdminCustomers() {
  return request<{ customers: any[]; stats: any }>('/admin/customers');
}

export async function apiAdminReports() {
  return request<any>('/admin/reports');
}

export async function apiAdminCreateTeam(data: Record<string, unknown>) {
  return request<unknown>('/admin/team', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiAdminUpdateTeam(id: string, data: Record<string, unknown>) {
  return request<unknown>(`/admin/team/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiAdminDeleteTeam(id: string) {
  return request<unknown>(`/admin/team/${id}`, {
    method: 'DELETE',
  });
}

export async function apiAdminAssignOrder(orderId: string, jokiId: string) {
  return request<unknown>(`/admin/orders/${orderId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ joki_id: jokiId }),
  });
}

export async function apiAdminCancelOrder(orderId: string, reason?: string) {
  return request<unknown>(`/admin/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason || 'Dibatalkan oleh admin' }),
  });
}

export async function apiAdminConfirmPayment(orderId: string) {
  return request<unknown>(`/admin/orders/${orderId}/confirm-payment`, {
    method: 'POST',
  });
}

// ============================================
// Joki APIs
// ============================================
export async function apiJokiDashboard() {
  return request<unknown>('/joki/dashboard');
}

export async function apiJokiCommission() {
  return request<unknown>('/joki/commission');
}

export async function apiJokiUpload(orderId: string, data: Record<string, unknown>) {
  return request<unknown>(`/joki/orders/${orderId}/upload`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiJokiUpdateProgress(orderId: string, data: Record<string, unknown>) {
  return request<unknown>(`/joki/orders/${orderId}/upload`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ============================================
// Site Settings APIs
// ============================================
export async function apiGetSettings() {
  return request<Record<string, string>>('/settings');
}

export async function apiUpdateSettings(data: Record<string, string>) {
  return request<unknown>('/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
