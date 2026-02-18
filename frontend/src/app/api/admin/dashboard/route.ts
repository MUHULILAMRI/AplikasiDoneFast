// ============================================
// GET /api/admin/dashboard — admin dashboard stats
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Parallel queries for dashboard stats
    const [
      totalOrders,
      monthlyOrders,
      lastMonthOrders,
      totalCustomers,
      monthlyCustomers,
      totalRevenue,
      monthlyRevenue,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
      totalJoki,
      recentOrders,
      topJoki,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { created_at: { gte: startOfMonth } } }),
      prisma.order.count({ where: { created_at: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', created_at: { gte: startOfMonth } } }),
      prisma.transaction.aggregate({ where: { payment_status: 'PAID' }, _sum: { amount: true } }),
      prisma.transaction.aggregate({
        where: { payment_status: 'PAID', paid_at: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.order.count({ where: { status: { in: ['PENDING_PAYMENT', 'PAID'] } } }),
      prisma.order.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.jokiMember.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { name: true, avatar: true } },
          service: { select: { name: true, category: true } },
          joki: { select: { name: true } },
        },
      }),
      prisma.jokiMember.findMany({
        take: 5,
        orderBy: { rating: 'desc' },
        include: { user: { select: { name: true, avatar: true } } },
      }),
    ]);

    // Monthly growth calculations
    const orderGrowth = lastMonthOrders > 0
      ? ((monthlyOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)
      : '0';

    return apiSuccess({
      overview: {
        total_orders: totalOrders,
        monthly_orders: monthlyOrders,
        order_growth: `${Number(orderGrowth) >= 0 ? '+' : ''}${orderGrowth}%`,
        total_customers: totalCustomers,
        new_customers: monthlyCustomers,
        total_revenue: Number(totalRevenue._sum.amount || 0),
        monthly_revenue: Number(monthlyRevenue._sum.amount || 0),
        total_joki: totalJoki,
      },
      order_summary: {
        pending: pendingOrders,
        in_progress: inProgressOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      recent_orders: recentOrders,
      top_joki: topJoki,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return apiError('Internal server error', 500);
  }
}
