// ============================================
// GET /api/notifications — get user notifications
// PATCH /api/notifications — mark notifications as read
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = { user_id: auth.user.userId };
    if (unreadOnly) where.is_read = false;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: { user_id: auth.user.userId, is_read: false },
      }),
    ]);

    return apiSuccess({ notifications, unread_count: unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ('error' in auth) return auth.error;

    const body = await req.json();
    const { notification_ids, mark_all } = body;

    if (mark_all) {
      await prisma.notification.updateMany({
        where: { user_id: auth.user.userId, is_read: false },
        data: { is_read: true },
      });
    } else if (notification_ids?.length > 0) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notification_ids },
          user_id: auth.user.userId,
        },
        data: { is_read: true },
      });
    }

    return apiSuccess({ message: 'Notifikasi ditandai sudah dibaca' });
  } catch (error) {
    console.error('Mark notifications error:', error);
    return apiError('Internal server error', 500);
  }
}
