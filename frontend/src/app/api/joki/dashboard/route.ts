// ============================================
// GET /api/joki/dashboard — joki member dashboard
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, 'JOKI');
    if ('error' in auth) return auth.error;

    const joki = await prisma.jokiMember.findUnique({
      where: { user_id: auth.user.userId },
    });
    if (!joki) return apiError('Profil joki tidak ditemukan', 404);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      activeOrders,
      completedThisMonth,
      totalCompleted,
      monthlyCommission,
      recentOrders,
      recentReviews,
    ] = await Promise.all([
      prisma.order.count({ where: { joki_id: joki.id, status: 'IN_PROGRESS' } }),
      prisma.order.count({
        where: { joki_id: joki.id, status: 'COMPLETED', updated_at: { gte: startOfMonth } },
      }),
      prisma.order.count({ where: { joki_id: joki.id, status: 'COMPLETED' } }),
      prisma.order.aggregate({
        where: {
          joki_id: joki.id,
          status: 'COMPLETED',
          updated_at: { gte: startOfMonth },
        },
        _sum: { price: true },
      }),
      prisma.order.findMany({
        where: { joki_id: joki.id },
        orderBy: { created_at: 'desc' },
        take: 10,
        include: {
          service: { select: { name: true, category: true } },
          user: { select: { name: true } },
        },
      }),
      Promise.resolve([]), // Model Review belum ada di schema.prisma, kembalikan kosong sementara.
    ]);

    const formattedReviews = recentReviews.map((r: any) => ({
      id: r.id,
      customer: r.user.name,
      service: r.order.title,
      order: r.order.order_number,
      rating: r.rating,
      comment: r.comment,
      date: r.created_at.toISOString().split('T')[0],
      avatar: r.user.name.charAt(0).toUpperCase()
    }));

    const commission = Number(monthlyCommission._sum.price || 0) * (joki.commission_rate / 100);

    return apiSuccess({
      profile: {
        id: joki.id,
        name: joki.name,
        skills: joki.skills,
        rating: joki.rating,
        commission_rate: joki.commission_rate,
        is_available: joki.is_available,
      },
      stats: {
        active_orders: activeOrders,
        completed_this_month: completedThisMonth,
        total_completed: totalCompleted,
        monthly_commission: Math.round(commission),
        total_reviews: formattedReviews.length, // Placeholder for actual count
      },
      recent_orders: recentOrders,
      reviews: formattedReviews
    });
  } catch (error) {
    console.error('Joki dashboard error:', error);
    return apiError('Internal server error', 500);
  }
}
