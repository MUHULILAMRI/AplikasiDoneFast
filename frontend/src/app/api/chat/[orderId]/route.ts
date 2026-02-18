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

    // Verify order access
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { order_number: orderId }] },
    });
    if (!order) return apiError('Order tidak ditemukan', 404);

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
    });
    if (!order) return apiError('Order tidak ditemukan', 404);

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

    // Notify relevant parties
    const notifyUserId = auth.user.role === 'CUSTOMER' ? null : order.user_id;
    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          user_id: notifyUserId,
          title: 'Pesan Baru',
          message: `Pesan baru di order ${order.order_number}`,
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
