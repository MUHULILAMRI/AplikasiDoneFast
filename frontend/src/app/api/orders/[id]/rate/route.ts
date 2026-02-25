// ============================================
// POST /api/orders/[id]/rate — customer rates a completed order
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireRole(req, 'CUSTOMER');
        if ('error' in auth) return auth.error;

        const { id } = await params;
        const body = await req.json();
        const { rating, review } = body;

        if (!rating || rating < 1 || rating > 5) {
            return apiError('Rating harus antara 1–5');
        }

        const order = await prisma.order.findFirst({
            where: {
                OR: [{ id }, { order_number: id }],
                user_id: auth.user.userId,
                status: 'COMPLETED',
            },
        });

        if (!order) {
            return apiError('Order tidak ditemukan atau belum selesai', 404);
        }

        // Check if already rated
        if ((order as any).customer_rating) {
            return apiError('Anda sudah memberikan rating untuk order ini');
        }

        // Update order with rating
        const updated = await prisma.order.update({
            where: { id: order.id },
            data: {
                customer_rating: rating,
                customer_review: review || null,
            } as any,
        });

        // Update joki average rating if joki assigned
        if (order.joki_id) {
            const allRatedOrders = await prisma.order.findMany({
                where: {
                    joki_id: order.joki_id,
                    status: 'COMPLETED',
                    NOT: { customer_rating: null } as any,
                },
                select: { customer_rating: true } as any,
            });

            const total = (allRatedOrders as any[]).reduce(
                (sum: number, o: any) => sum + (o.customer_rating || 0), 0
            );
            const avgRating = allRatedOrders.length > 0 ? total / allRatedOrders.length : rating;

            await prisma.jokiMember.update({
                where: { id: order.joki_id },
                data: { rating: parseFloat(avgRating.toFixed(1)) },
            });
        }

        // Notify joki
        if (order.joki_id) {
            const joki = await prisma.jokiMember.findUnique({
                where: { id: order.joki_id },
                select: { user_id: true },
            });
            if (joki) {
                await prisma.notification.create({
                    data: {
                        user_id: joki.user_id,
                        title: 'Rating Baru! ⭐',
                        message: `Customer memberikan rating ${rating}/5 untuk order ${order.order_number}.${review ? ` Review: "${review}"` : ''}`,
                        type: 'ORDER_UPDATE',
                    },
                });
            }
        }

        return apiSuccess({ order: updated, rating, review });
    } catch (error) {
        console.error('Rate order error:', error);
        return apiError('Internal server error', 500);
    }
}
