// ============================================
// GET /api/chat/[orderId] — get messages for an order
// POST /api/chat/[orderId] — send message
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if ('error' in auth) return auth.error;

    const { orderId } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Find the order
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { order_number: orderId }] },
      include: {
        joki: { select: { id: true, user_id: true } },
      },
    });
    if (!order) return apiError('Order tidak ditemukan', 404);

    // Verify access: admin unrestricted, customer must own order, joki must be assigned
    if (auth.user.role === 'CUSTOMER' && order.user_id !== auth.user.userId) {
      return apiError('Tidak memiliki akses ke chat ini', 403);
    }
    if (auth.user.role === 'JOKI') {
      const joki = await prisma.jokiMember.findUnique({ where: { user_id: auth.user.userId } });
      if (!joki || order.joki_id !== joki.id) {
        return apiError('Tidak memiliki akses ke chat ini', 403);
      }
    }
    // ADMIN has unrestricted access — no additional check needed

    const messages = await prisma.chatMessage.findMany({
      where: { order_id: order.id },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { created_at: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Mark unread messages as read for this user
    await prisma.chatMessage.updateMany({
      where: {
        order_id: order.id,
        sender_id: { not: auth.user.userId },
        is_read: false,
      },
      data: { is_read: true },
    });

    return apiSuccess(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if ('error' in auth) return auth.error;

    const { orderId } = await params;
    const body = await req.json();
    const { message, file_url } = body;

    if (!message && !file_url) {
      return apiError('Pesan atau file wajib diisi');
    }

    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { order_number: orderId }] },
      include: {
        joki: { select: { id: true, user_id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });
    if (!order) return apiError('Order tidak ditemukan', 404);

    // Verify access: admin unrestricted
    if (auth.user.role === 'CUSTOMER' && order.user_id !== auth.user.userId) {
      return apiError('Tidak memiliki akses ke chat ini', 403);
    }
    if (auth.user.role === 'JOKI') {
      const joki = await prisma.jokiMember.findUnique({ where: { user_id: auth.user.userId } });
      if (!joki || order.joki_id !== joki.id) {
        return apiError('Tidak memiliki akses ke chat ini', 403);
      }
    }
    // ADMIN has unrestricted access — no additional check needed

    const chatMessage = await prisma.chatMessage.create({
      data: {
        order_id: order.id,
        sender_id: auth.user.userId,
        sender_role: auth.user.role,
        message: message || '',
        file_url,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // Bidirectional notification
    if (auth.user.role === 'CUSTOMER' || auth.user.role === 'ADMIN') {
      // Customer/admin sends — notify joki
      if (order.joki?.user_id) {
        await prisma.notification.create({
          data: {
            user_id: order.joki.user_id,
            title: 'Pesan Baru dari Customer',
            message: `${order.user?.name || 'Customer'} mengirim pesan di order ${order.order_number}`,
            type: 'ORDER_UPDATE',
          },
        });
      }
    } else {
      // Joki sends — notify customer
      await prisma.notification.create({
        data: {
          user_id: order.user_id,
          title: 'Pesan Baru dari Joki',
          message: `${order.joki?.name || 'Joki'} mengirim pesan di order ${order.order_number}`,
          type: 'ORDER_UPDATE',
        },
      });
    }

    return apiSuccess(chatMessage, 201);
  } catch (error) {
    console.error('Send message error:', error);
    return apiError('Internal server error', 500);
  }
}

