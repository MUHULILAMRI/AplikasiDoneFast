// ============================================
// GET /api/auth/me — get current user profile
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ('error' in auth) return auth.error;

    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        balance: true,
        is_vip: true,
        created_at: true,
        _count: {
          select: {
            orders: true,
            notifications: { where: { is_read: false } },
          },
        },
      },
    });

    if (!user) return apiError('User tidak ditemukan', 404);

    return apiSuccess(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return apiError('Internal server error', 500);
  }
}
