// ============================================
// GET /api/joki/commission — joki commission history
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, 'JOKI');
    if ('error' in auth) return auth.error;

    const joki = await prisma.jokiMember.findUnique({ where: { user_id: auth.user.userId } });
    if (!joki) return apiError('Profil joki tidak ditemukan', 404);

    const now = new Date();

    // Get completed orders grouped by month (last 6 months)
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const result = await prisma.order.aggregate({
        where: {
          joki_id: joki.id,
          status: 'COMPLETED',
          updated_at: { gte: start, lt: end },
        },
        _sum: { price: true },
        _count: true,
      });

      const orderRevenue = Number(result._sum.price || 0);

      monthlyData.push({
        month: start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        orders: result._count,
        revenue: orderRevenue,
        commission: Math.round(orderRevenue * (joki.commission_rate / 100)),
      });
    }

    // Total earnings
    const totalResult = await prisma.order.aggregate({
      where: { joki_id: joki.id, status: 'COMPLETED' },
      _sum: { price: true },
      _count: true,
    });

    const totalRevenue = Number(totalResult._sum.price || 0);

    return apiSuccess({
      commission_rate: joki.commission_rate,
      total_orders: totalResult._count,
      total_revenue: totalRevenue,
      total_commission: Math.round(totalRevenue * (joki.commission_rate / 100)),
      monthly: monthlyData,
    });
  } catch (error) {
    console.error('Get commission error:', error);
    return apiError('Internal server error', 500);
  }
}
