// ============================================
// GET /api/orders/[id]/tracking — order tracking timeline
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

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { order_number: id }] },
      include: {
        service: { select: { name: true, category: true, estimated_days: true } },
        joki: { select: { name: true, rating: true } },
        transactions: { orderBy: { created_at: 'desc' }, take: 1 },
      },
    });

    if (!order) return apiError('Order tidak ditemukan', 404);

    // Build timeline based on current status
    const statusOrder = ['PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'REVISION', 'COMPLETED'];
    const currentIdx = statusOrder.indexOf(order.status);

    const timeline = [
      {
        step: 1,
        title: 'Order Dibuat',
        description: 'Pesanan berhasil dibuat dan menunggu pembayaran',
        status: currentIdx >= 0 ? 'completed' : 'pending',
        timestamp: order.created_at,
      },
      {
        step: 2,
        title: 'Pembayaran',
        description: order.transactions[0]
          ? `Dibayar via ${order.transactions[0].payment_method}`
          : 'Menunggu pembayaran',
        status: currentIdx >= 1 ? 'completed' : currentIdx === 0 ? 'current' : 'pending',
        timestamp: order.transactions[0]?.paid_at || null,
      },
      {
        step: 3,
        title: 'Dikerjakan',
        description: order.joki
          ? `Dikerjakan oleh ${order.joki.name} (⭐ ${order.joki.rating})`
          : 'Menunggu assign joki',
        status: currentIdx >= 2 ? (currentIdx === 2 ? 'current' : 'completed') : 'pending',
        timestamp: null,
      },
      ...(order.status === 'REVISION' ? [{
        step: 4,
        title: 'Revisi',
        description: `Sisa revisi: ${order.revisions_left}`,
        status: 'current' as const,
        timestamp: null,
      }] : []),
      {
        step: order.status === 'REVISION' ? 5 : 4,
        title: 'Selesai',
        description: order.result_files.length > 0
          ? `${order.result_files.length} file hasil tersedia`
          : 'Menunggu penyelesaian',
        status: order.status === 'COMPLETED' ? 'completed' : 'pending',
        timestamp: order.status === 'COMPLETED' ? order.updated_at : null,
      },
    ];

    return apiSuccess({
      order: {
        id: order.id,
        order_number: order.order_number,
        title: order.title,
        status: order.status,
        deadline: order.deadline,
        price: order.price,
        service: order.service,
        joki: order.joki,
        result_files: order.result_files,
      },
      timeline,
    });
  } catch (error) {
    console.error('Get tracking error:', error);
    return apiError('Internal server error', 500);
  }
}
