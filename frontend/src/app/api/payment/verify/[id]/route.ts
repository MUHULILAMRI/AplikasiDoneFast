// ============================================
// GET /api/payment/verify/[id] — check payment status
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if ('error' in auth) return auth.error;

    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [{ id }, { external_id: id }],
        user_id: auth.user.userId,
      },
      include: {
        order: { select: { order_number: true, title: true, status: true } },
      },
    });

    if (!transaction) return apiError('Transaksi tidak ditemukan', 404);

    return apiSuccess({
      id: transaction.id,
      external_id: transaction.external_id,
      amount: transaction.amount,
      payment_method: transaction.payment_method,
      payment_status: transaction.payment_status,
      paid_at: transaction.paid_at,
      order: transaction.order,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return apiError('Internal server error', 500);
  }
}
