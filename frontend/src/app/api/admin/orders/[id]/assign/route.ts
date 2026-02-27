// ============================================
// POST /api/admin/orders/[id]/assign — assign joki to order
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await req.json();
    const { joki_id } = body;

    if (!joki_id) return apiError('ID Joki wajib diisi');

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { order_number: id }] },
    });
    if (!order) return apiError('Order tidak ditemukan', 404);

    const joki = await prisma.jokiMember.findUnique({ where: { id: joki_id } });
    if (!joki || !joki.is_available) return apiError('Joki tidak tersedia', 404);

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        joki_id: joki.id,
        status: order.status === 'PAID' ? 'IN_PROGRESS' : order.status,
      },
      include: {
        joki: { select: { id: true, name: true, rating: true } },
        service: { select: { name: true } },
      },
    });

    // Notify joki
    await prisma.notification.create({
      data: {
        user_id: joki.user_id,
        title: 'Order Baru',
        message: `Kamu ditugaskan untuk order ${order.order_number}: ${order.title}`,
        type: 'ORDER_UPDATE',
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        user_id: order.user_id,
        title: 'Joki Ditugaskan',
        message: `Order ${order.order_number} sedang dikerjakan oleh ${joki.name}.`,
        type: 'ORDER_UPDATE',
      },
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error('Assign joki error:', error);
    return apiError('Internal server error', 500);
  }
}
