import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/auth';

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        const auth = await authenticateRequest(req);
        if ('error' in auth) return auth.error;

        if (auth.user.role !== 'ADMIN' && auth.user.role !== 'JOKI') {
            return apiError('Unauthorized', 403);
        }

        const { price, difficulty } = await req.json();

        if (!price || isNaN(Number(price))) {
            return apiError('Harga tidak valid');
        }

        const order = await prisma.order.findUnique({
            where: { id },
        });

        if (!order) return apiError('Order tidak ditemukan', 404);

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                price: Number(price),
                difficulty: difficulty || order.difficulty,
                status: 'PENDING_PAYMENT',
            },
            include: {
                user: { select: { name: true, email: true } },
            },
        });

        // Create notification for customer
        await prisma.notification.create({
            data: {
                user_id: order.user_id,
                title: 'Penawaran Harga Baru',
                message: `Admin telah memberikan penawaran harga untuk pesanan ${order.order_number}. Silakan cek dan lakukan pembayaran.`,
                type: 'ORDER_UPDATE',
            },
        });

        return apiSuccess(updatedOrder);
    } catch (error) {
        console.error('Set quote error:', error);
        return apiError('Internal server error', 500);
    }
}
