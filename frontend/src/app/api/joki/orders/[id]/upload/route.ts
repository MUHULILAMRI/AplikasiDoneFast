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
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        user_id: order.user_id,
        title: 'Hasil Siap',
        message: `Hasil untuk order ${order.order_number} sudah tersedia. Silakan review dan download.${notes ? ` Catatan: ${notes}` : ''}`,
        type: 'FILE_READY',
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
