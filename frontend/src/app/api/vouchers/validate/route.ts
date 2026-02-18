// ============================================
// POST /api/vouchers/validate — validate a voucher code
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, order_amount } = body;

    if (!code) return apiError('Kode voucher wajib diisi');

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) return apiError('Kode voucher tidak ditemukan', 404);
    if (!voucher.is_active) return apiError('Voucher sudah tidak aktif');
    if (new Date(voucher.valid_until) < new Date()) return apiError('Voucher sudah expired');
    if (voucher.usage_count >= voucher.max_usage) return apiError('Voucher sudah habis digunakan');
    if (order_amount && Number(voucher.min_order) > order_amount) {
      return apiError(`Minimal order ${Number(voucher.min_order)} untuk menggunakan voucher ini`);
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discount_percent > 0 && order_amount) {
      discount = order_amount * (voucher.discount_percent / 100);
      if (Number(voucher.max_discount) > 0) {
        discount = Math.min(discount, Number(voucher.max_discount));
      }
    } else if (Number(voucher.discount_amount) > 0) {
      discount = Number(voucher.discount_amount);
    }

    return apiSuccess({
      valid: true,
      voucher: {
        code: voucher.code,
        discount_percent: voucher.discount_percent,
        discount_amount: voucher.discount_amount,
        max_discount: voucher.max_discount,
      },
      calculated_discount: Math.round(discount),
      remaining_usage: voucher.max_usage - voucher.usage_count,
    });
  } catch (error) {
    console.error('Validate voucher error:', error);
    return apiError('Internal server error', 500);
  }
}
