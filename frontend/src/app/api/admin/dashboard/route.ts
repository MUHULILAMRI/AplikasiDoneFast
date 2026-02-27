// ============================================
// GET /api/admin/dashboard — admin dashboard stats
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
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
      lastMonthOrders,
      totalCustomers,
      totalTransactions,
      monthlyTransactions,
      orderSummary,
      totalJoki,
      recentOrders,
      topJoki,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { created_at: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.transaction.findMany({
        where: { payment_status: 'PAID' },
        include: { order: { include: { joki: { select: { commission_rate: true } } } } }
      }),
      prisma.transaction.findMany({
        where: { payment_status: 'PAID', paid_at: { gte: startOfMonth } },
        include: { order: { include: { joki: { select: { commission_rate: true } } } } }
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
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
        include: {
          user: { select: { name: true, avatar: true, phone: true } },
          _count: { select: { orders: { where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } } } } }
        },
      }),
    ]);

    const calculateStats = (txs: any[]) => {
      let revenue = 0;
      let commission = 0;
      txs.forEach(tx => {
        const amount = Number(tx.amount || 0);
        revenue += amount;
        const rate = tx.order?.joki?.commission_rate ?? 50;
        commission += (amount * rate) / 100;
      });
      return { revenue, profit: revenue - commission };
    };

    const totalStats = calculateStats(totalTransactions);
    const monthlyStats = calculateStats(monthlyTransactions);

    // Filter statuses
    const findStatusCount = (s: string) => orderSummary.find(os => os.status === s)?._count ?? 0;

    return apiSuccess({
      overview: {
        total_orders: totalOrders,
        monthly_orders: monthlyTransactions.length,
        total_customers: totalCustomers,
        total_revenue: totalStats.revenue,
        monthly_revenue: monthlyStats.revenue,
        total_profit: totalStats.profit,
        monthly_profit: monthlyStats.profit,
        total_joki: totalJoki,
      },
      order_summary: {
        pending: findStatusCount('PENDING_PAYMENT') + findStatusCount('PAID'),
        in_progress: findStatusCount('IN_PROGRESS'),
        completed: findStatusCount('COMPLETED'),
        revision: findStatusCount('REVISION'),
        cancelled: findStatusCount('CANCELLED'),
      },
      recent_orders: recentOrders,
      top_joki: topJoki,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return apiError('Internal server error', 500);
  }
}
