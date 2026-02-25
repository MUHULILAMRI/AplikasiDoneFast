// ============================================
// DoneFast - Utility Functions
// ============================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending_payment: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    paid: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    revision: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[status.toLowerCase()] || 'bg-gray-500/20 text-gray-400';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending_payment: 'Menunggu Pembayaran',
    paid: 'Sudah Dibayar',
    in_progress: 'Diproses',
    revision: 'Revisi',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  return labels[status.toLowerCase()] || status;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    akademik: 'Akademik',
    arsitektur: 'Arsitek & Desain',
    coding: 'Coding & Web',
    konsultasi: 'Konsultasi',
    ai_teknologi: 'AI & Teknologi',
  };
  return labels[category] || category;
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    akademik: '📚',
    arsitektur: '🏗️',
    coding: '💻',
    konsultasi: '💬',
    ai_teknologi: '🤖',
  };
  return icons[category] || '📦';
}

export function calculateDeadlineUrgency(deadline: string): 'normal' | 'soon' | 'urgent' {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) return 'urgent';
  if (diffHours < 72) return 'soon';
  return 'normal';
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DF-${timestamp}-${random}`;
}

// AI Price Estimation
export function estimatePrice(params: {
  pages?: number;
  deadline_days?: number;
  urgency_level?: 'STANDAR' | 'KILAT' | 'SUPER_KILAT';
  has_journal?: boolean;
  category: string;
  service_name?: string;
  settings?: Record<string, string>; // from /api/settings
}): {
  base_price: number;
  urgency_multiplier: number;
  journal_surcharge: number;
  tax_amount: number;
  total: number;
} {
  const s = params.settings;

  const basePrices: Record<string, number> = {
    akademik: s ? Number(s.price_akademik) : 50000,
    arsitektur: s ? Number(s.price_arsitektur) : 150000,
    coding: s ? Number(s.price_coding) : 200000,
    konsultasi: s ? Number(s.price_konsultasi) : 100000,
    ai_teknologi: s ? Number(s.price_ai_teknologi) : 250000,
  };

  const base = basePrices[params.category] || 100000;
  const taxPercent = s ? Number(s.tax_percent) : 0;

  // Urgency multiplier
  let urgencyMult = 1.0;
  if (params.urgency_level === 'KILAT') urgencyMult = 1.4;
  else if (params.urgency_level === 'SUPER_KILAT') urgencyMult = 2.0;

  // Journal surcharge (specific to Skripsi)
  let journalSurcharge = 0;
  const isSkripsi = params.service_name?.toLowerCase().includes('skripsi');
  if (isSkripsi && params.has_journal === false) {
    journalSurcharge = 150000;
  }

  const subtotal = (base * urgencyMult) + journalSurcharge;
  const taxAmount = Math.round(subtotal * (taxPercent / 100));
  const total = Math.round((subtotal + taxAmount) / 1000) * 1000;

  return {
    base_price: base,
    urgency_multiplier: urgencyMult,
    journal_surcharge: journalSurcharge,
    tax_amount: taxAmount,
    total,
  };
}
