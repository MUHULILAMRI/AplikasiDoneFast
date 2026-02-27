// ============================================
// POST /api/admin/orders/[id]/confirm-payment — admin confirm payment
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

        const order = await prisma.order.findFirst({
            where: { OR: [{ id }, { order_number: id }] },
        });

        if (!order) return apiError('Order tidak ditemukan', 404);

        if (order.status !== 'PENDING_PAYMENT') {
            return apiError(`Status order saat ini adalah ${order.status}. Konfirmasi hanya untuk status PENDING_PAYMENT.`, 400);
        }

        // Update order status and transaction status in a transaction
        const [updatedOrder] = await prisma.$transaction([
            prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'PAID',
                    updated_at: new Date()
                },
                include: {
                    service: { select: { name: true } },
                    user: { select: { id: true, name: true, email: true } },
                },
            }),
            prisma.transaction.updateMany({
                where: {
                    order_id: order.id,
                    payment_status: 'PENDING',
                },
                data: {
                    payment_status: 'PAID',
                    paid_at: new Date(),
                },
            }),
        ]);

        // Notify customer
        await prisma.notification.create({
            data: {
                user_id: order.user_id,
                title: 'Pembayaran Dikonfirmasi! ✅',
                message: `Pembayaran untuk order ${order.order_number} (${order.title}) telah dikonfirmasi secara manual oleh admin. Kami akan segera memproses order Anda.`,
                type: 'ORDER_UPDATE',
            },
        });

        return apiSuccess(updatedOrder);
    } catch (error) {
        console.error('Confirm payment error:', error);
        return apiError('Internal server error', 500);
    }
}
