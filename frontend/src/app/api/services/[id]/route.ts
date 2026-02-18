// ============================================
// GET /api/services/[id] — get service detail
// PATCH /api/services/[id] — update service (admin)
// DELETE /api/services/[id] — delete service (admin)
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: { select: { orders: true } },
      },
    });

    if (!service) return apiError('Layanan tidak ditemukan', 404);
    return apiSuccess(service);
  } catch (error) {
    console.error('Get service error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await req.json();

    const service = await prisma.service.update({
      where: { id },
      data: body,
    });

    return apiSuccess(service);
  } catch (error) {
    console.error('Update service error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const { id } = await params;
    await prisma.service.update({
      where: { id },
      data: { is_active: false },
    });

    return apiSuccess({ message: 'Layanan berhasil dihapus' });
  } catch (error) {
    console.error('Delete service error:', error);
    return apiError('Internal server error', 500);
  }
}
