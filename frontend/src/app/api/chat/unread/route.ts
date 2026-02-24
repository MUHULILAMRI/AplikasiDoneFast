// ============================================
// GET /api/chat/unread — get unread message counts per order
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticateRequest(req);
        if ('error' in auth) return auth.error;

        // Build where clause based on role
        const orderWhere: Record<string, unknown> = {};
        if (auth.user.role === 'CUSTOMER') {
            orderWhere.user_id = auth.user.userId;
        } else if (auth.user.role === 'JOKI') {
            const joki = await prisma.jokiMember.findUnique({ where: { user_id: auth.user.userId } });
            if (joki) orderWhere.joki_id = joki.id;
            else return apiSuccess({});
        }
        // ADMIN sees all orders — no filter

        const orders = await prisma.order.findMany({
            where: orderWhere,
            select: { id: true },
        });

        const orderIds = orders.map((o) => o.id);
        if (orderIds.length === 0) return apiSuccess({});

        // Count unread messages NOT sent by this user for each order
        const unreadCounts = await prisma.chatMessage.groupBy({
            by: ['order_id'],
            where: {
                order_id: { in: orderIds },
                sender_id: { not: auth.user.userId },
                is_read: false,
            },
            _count: { id: true },
        });

        const result: Record<string, number> = {};
        for (const row of unreadCounts) {
            result[row.order_id] = row._count.id;
        }

        return apiSuccess(result);
    } catch (error) {
        console.error('Get unread counts error:', error);
        return apiError('Internal server error', 500);
    }
}
