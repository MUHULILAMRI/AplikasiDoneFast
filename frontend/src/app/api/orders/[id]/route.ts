// ============================================
// GET /api/orders/[id] — get order detail
// PATCH /api/orders/[id] — update order status / assign joki
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, requireRole, apiSuccess, apiError } from '@/lib/auth';

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
        service: true,
        user: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
        joki: { select: { id: true, name: true, rating: true, skills: true } },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 50,
          select: {
            id: true,
            message: true,
            sender_role: true,
            file_url: true,
            is_read: true,
            created_at: true,
            sender: { select: { name: true, avatar: true } },
          },
        },
        transactions: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
        voucher: true,
      },
    });

    if (!order) return apiError('Order tidak ditemukan', 404);

    // Check access: customer can only see own, joki only assigned
    if (auth.user.role === 'CUSTOMER' && order.user_id !== auth.user.userId) {
      return apiError('Tidak memiliki akses', 403);
    }

    return apiSuccess(order);
  } catch (error) {
    console.error('Get order error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await req.json();

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { order_number: id }] },
    });
    if (!order) return apiError('Order tidak ditemukan', 404);

    const updateData: Record<string, unknown> = {};

    // Admin: can assign joki, change status
    if (auth.user.role === 'ADMIN') {
      if (body.joki_id) updateData.joki_id = body.joki_id;
      if (body.status) updateData.status = body.status;
    }

    // Joki: can update status to IN_PROGRESS, REVISION (submit), add result_files
    if (auth.user.role === 'JOKI') {
      if (body.status && ['IN_PROGRESS', 'COMPLETED'].includes(body.status)) {
        updateData.status = body.status;
      }
      if (body.result_files) updateData.result_files = body.result_files;
    }

    // Customer: can request revision or cancel
    if (auth.user.role === 'CUSTOMER') {
      if (body.status === 'REVISION' && order.revisions_left > 0) {
        updateData.status = 'REVISION';
        updateData.revisions_left = order.revisions_left - 1;
      }
      if (body.status === 'CANCELLED' && order.status === 'PENDING_PAYMENT') {
        updateData.status = 'CANCELLED';
      }
    }

    if (Object.keys(updateData).length === 0) {
      return apiError('Tidak ada data yang diupdate');
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: updateData,
      include: {
        service: { select: { name: true, category: true } },
        joki: { select: { id: true, name: true, user_id: true } },
      },
    });

    // Send notification on status change
    if (updateData.status) {
      await prisma.notification.create({
        data: {
          user_id: order.user_id,
          title: 'Status Order Diupdate',
          message: `Order ${order.order_number} status berubah menjadi ${updateData.status}.`,
          type: 'ORDER_UPDATE',
        },
      });
    }

    // Auto-create welcome chat message when joki is assigned
    if (updateData.joki_id && updated.joki) {
      const jokiUserId = (updated.joki as Record<string, unknown>).user_id as string;
      if (jokiUserId) {
        await prisma.chatMessage.create({
          data: {
            order_id: order.id,
            sender_id: jokiUserId,
            sender_role: 'JOKI',
            message: `Halo! Saya ${updated.joki.name} yang akan mengerjakan pesanan "${order.title}" (${order.order_number}). Silakan hubungi saya jika ada pertanyaan atau detail tambahan yang perlu disampaikan. 🚀`,
          },
        });

        // Notify customer about new joki assignment + chat
        await prisma.notification.create({
          data: {
            user_id: order.user_id,
            title: 'Joki Telah Di-assign!',
            message: `${updated.joki.name} akan mengerjakan order ${order.order_number}. Chat sudah tersedia!`,
            type: 'ORDER_UPDATE',
          },
        });
      }
    }

    // Auto-create chat message when joki starts working (IN_PROGRESS)
    if (updateData.status === 'IN_PROGRESS' && !updateData.joki_id) {
      // Get joki user_id from joki member
      if (order.joki_id) {
        const jokiMember = await prisma.jokiMember.findUnique({
          where: { id: order.joki_id },
          select: { user_id: true, name: true },
        });
        if (jokiMember) {
          await prisma.chatMessage.create({
            data: {
              order_id: order.id,
              sender_id: jokiMember.user_id,
              sender_role: 'JOKI',
              message: `Saya sudah mulai mengerjakan pesanan "${order.title}". Akan saya kabari progressnya di sini. 💪`,
            },
          });

          await prisma.notification.create({
            data: {
              user_id: order.user_id,
              title: 'Order Mulai Dikerjakan!',
              message: `${jokiMember.name} sudah mulai mengerjakan ${order.order_number}. Pantau progress via chat!`,
              type: 'ORDER_UPDATE',
            },
          });
        }
      }
    }

    return apiSuccess(updated);
  } catch (error) {
    console.error('Update order error:', error);
    return apiError('Internal server error', 500);
  }
}
