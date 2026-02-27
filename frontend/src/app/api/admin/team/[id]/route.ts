// ============================================
// PATCH /api/admin/team/[id] — update joki member
// DELETE /api/admin/team/[id] — deactivate joki
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await req.json();

    const joki = await prisma.jokiMember.update({
      where: { id },
      data: {
        ...(body.skills && { skills: body.skills }),
        ...(body.commission_rate !== undefined && { commission_rate: body.commission_rate }),
        ...(body.is_available !== undefined && { is_available: body.is_available }),
        ...(body.name && { name: body.name }),
      },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
      },
    });

    return apiSuccess(joki);
  } catch (error) {
    console.error('Update team member error:', error);
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

    await prisma.jokiMember.update({
      where: { id },
      data: { is_available: false },
    });

    return apiSuccess({ message: 'Joki dinonaktifkan' });
  } catch (error) {
    console.error('Delete team member error:', error);
    return apiError('Internal server error', 500);
  }
}
