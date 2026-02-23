// ============================================
// POST /api/joki/orders/[id]/upload — joki uploads result files
// PATCH /api/joki/orders/[id]/upload — update progress
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, 'JOKI');
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await req.json();
    const { result_files, notes } = body;

    if (!result_files?.length) {
      return apiError('Minimal satu file hasil wajib diupload');
    }

    const joki = await prisma.jokiMember.findUnique({ where: { user_id: auth.user.userId } });
    if (!joki) return apiError('Profil joki tidak ditemukan', 404);

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { order_number: id }],
        joki_id: joki.id,
      },
    });
    if (!order) return apiError('Order tidak ditemukan atau bukan milik kamu', 404);

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        result_files,
        status: 'COMPLETED',
        progress: 100,
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        user_id: order.user_id,
        title: 'Hasil Siap! 🎉',
        message: `Hasil untuk order ${order.order_number} sudah tersedia. Silakan review dan download.${notes ? ` Catatan: ${notes}` : ''}`,
        type: 'FILE_READY',
      },
    });

    // Auto-chat: notify customer via chat
    await prisma.chatMessage.create({
      data: {
        order_id: order.id,
        sender_id: auth.user.userId,
        sender_role: 'JOKI',
        message: `✅ Hasil pekerjaan sudah selesai dan diupload! (${result_files.length} file)\n\nSilakan cek dan review hasilnya.${notes ? `\n\n📝 Catatan: ${notes}` : ''}`,
      },
    });

    // Update joki stats
    await prisma.jokiMember.update({
      where: { id: joki.id },
      data: { total_completed: { increment: 1 } },
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error('Upload result error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, 'JOKI');
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await req.json();
    const { status, progress, notes } = body;

    const joki = await prisma.jokiMember.findUnique({ where: { user_id: auth.user.userId } });
    if (!joki) return apiError('Profil joki tidak ditemukan', 404);

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { order_number: id }],
        joki_id: joki.id,
      },
    });
    if (!order) return apiError('Order tidak ditemukan atau bukan milik kamu', 404);

    const data: Record<string, unknown> = {};
    if (status) data.status = String(status).toUpperCase();
    if (typeof progress === 'number') data.progress = Math.min(100, Math.max(0, progress));

    // If status moves to COMPLETED without files, block
    if (data.status === 'COMPLETED' && (order.result_files?.length ?? 0) === 0) {
      return apiError('Upload hasil dulu sebelum menandai selesai');
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data,
    });

    // Build update message for chat
    const chatParts: string[] = [];
    if (data.progress) chatParts.push(`📊 Progress: ${data.progress}%`);
    if (data.status) chatParts.push(`📌 Status: ${String(data.status).replace(/_/g, ' ')}`);
    if (notes) chatParts.push(`📝 ${notes}`);

    if (chatParts.length > 0) {
      // Auto-chat: send progress update to customer
      await prisma.chatMessage.create({
        data: {
          order_id: order.id,
          sender_id: auth.user.userId,
          sender_role: 'JOKI',
          message: `🔄 Update Pesanan\n\n${chatParts.join('\n')}`,
        },
      });

      // Notification
      await prisma.notification.create({
        data: {
          user_id: order.user_id,
          title: 'Update Progress Order',
          message: `Order ${order.order_number}: ${chatParts.join(' | ')}`,
          type: 'ORDER_UPDATE',
        },
      });
    }

    return apiSuccess(updated);
  } catch (error) {
    console.error('Update progress error:', error);
    return apiError('Internal server error', 500);
  }
}

