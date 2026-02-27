// ============================================
// POST /api/admin/orders/[id]/cancel — admin cancel order
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
        const body = await req.json().catch(() => ({}));
        const reason = (body as Record<string, string>).reason || 'Dibatalkan oleh admin';

        const order = await prisma.order.findFirst({
            where: { OR: [{ id }, { order_number: id }] },
            include: {
                joki: { select: { id: true, user_id: true, name: true } },
            },
        });

        if (!order) return apiError('Order tidak ditemukan', 404);

        // Cannot cancel already completed or already cancelled orders
        if (order.status === 'COMPLETED') {
            return apiError('Order yang sudah selesai tidak bisa dibatalkan', 400);
        }
        if (order.status === 'CANCELLED') {
            return apiError('Order sudah dibatalkan sebelumnya', 400);
        }

        const updated = await prisma.order.update({
            where: { id: order.id },
            data: { status: 'CANCELLED' },
            include: {
                service: { select: { name: true, category: true } },
                user: { select: { id: true, name: true, email: true } },
                joki: { select: { id: true, name: true, rating: true } },
            },
        });

        // Notify customer
        await prisma.notification.create({
            data: {
                user_id: order.user_id,
                title: 'Order Dibatalkan',
                message: `Order ${order.order_number} (${order.title}) telah dibatalkan. Alasan: ${reason}`,
                type: 'ORDER_UPDATE',
            },
        });

        // Notify joki if assigned
        if (order.joki?.user_id) {
            await prisma.notification.create({
                data: {
                    user_id: order.joki.user_id,
                    title: 'Order Dibatalkan',
                    message: `Order ${order.order_number} (${order.title}) yang ditugaskan kepada Anda telah dibatalkan. Alasan: ${reason}`,
                    type: 'ORDER_UPDATE',
                },
            });
        }

        // If order was paid, mark transaction for refund
        if (['PAID', 'IN_PROGRESS', 'REVISION'].includes(order.status)) {
            await prisma.transaction.updateMany({
                where: {
                    order_id: order.id,
                    payment_status: 'PAID',
                },
                data: {
                    payment_status: 'REFUNDED',
                },
            });
        }

        return apiSuccess(updated);
    } catch (error) {
        console.error('Cancel order error:', error);
        return apiError('Internal server error', 500);
    }
}
