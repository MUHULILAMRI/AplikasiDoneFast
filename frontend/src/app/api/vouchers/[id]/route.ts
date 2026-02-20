// ============================================
// PATCH /api/vouchers/[id] — update/toggle voucher (admin)
// DELETE /api/vouchers/[id] — deactivate voucher (admin)
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.code) data.code = String(body.code).toUpperCase();
    if (body.discount_percent !== undefined) data.discount_percent = Number(body.discount_percent);
    if (body.discount_amount !== undefined) data.discount_amount = Number(body.discount_amount);
    if (body.min_order !== undefined) data.min_order = Number(body.min_order);
    if (body.max_discount !== undefined) data.max_discount = Number(body.max_discount);
    if (body.max_usage !== undefined) data.max_usage = Number(body.max_usage);
    if (body.valid_until) data.valid_until = new Date(body.valid_until);
    if (body.is_active !== undefined) data.is_active = Boolean(body.is_active);

    const updated = await prisma.voucher.update({ where: { id }, data });
    return apiSuccess(updated);
  } catch (error) {
    console.error('Update voucher error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const { id } = await params;

    const updated = await prisma.voucher.update({
      where: { id },
      data: { is_active: false },
    });

    return apiSuccess({ message: 'Voucher dinonaktifkan', voucher: updated });
  } catch (error) {
    console.error('Delete voucher error:', error);
    return apiError('Internal server error', 500);
  }
}
