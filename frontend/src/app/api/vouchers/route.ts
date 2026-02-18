// ============================================
// GET /api/vouchers — list active vouchers
// POST /api/vouchers — create voucher (admin)
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const vouchers = await prisma.voucher.findMany({
      where: { is_active: true, valid_until: { gt: new Date() } },
      orderBy: { created_at: 'desc' },
    });

    return apiSuccess(vouchers);
  } catch (error) {
    console.error('Get vouchers error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const body = await req.json();
    const { code, discount_percent, discount_amount, min_order, max_discount, valid_until, max_usage } = body;

    if (!code || !valid_until) {
      return apiError('Kode dan tanggal berlaku wajib diisi');
    }

    // Check duplicate code
    const existing = await prisma.voucher.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) return apiError('Kode voucher sudah digunakan', 409);

    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(),
        discount_percent: discount_percent || 0,
        discount_amount: discount_amount || 0,
        min_order: min_order || 0,
        max_discount: max_discount || 0,
        valid_until: new Date(valid_until),
        max_usage: max_usage || 100,
      },
    });

    return apiSuccess(voucher, 201);
  } catch (error) {
    console.error('Create voucher error:', error);
    return apiError('Internal server error', 500);
  }
}
