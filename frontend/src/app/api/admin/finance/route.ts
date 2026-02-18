// ============================================
// GET /api/admin/finance — finance & transaction report
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'monthly';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalRevenue,
      monthlyRevenue,
      totalTransactions,
      recentTransactions,
      paidCount,
      pendingCount,
      failedCount,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: { payment_status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { payment_status: 'PAID', paid_at: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.count(),
      prisma.transaction.findMany({
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: { select: { order_number: true, title: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.transaction.count({ where: { payment_status: 'PAID' } }),
      prisma.transaction.count({ where: { payment_status: 'PENDING' } }),
      prisma.transaction.count({ where: { payment_status: 'FAILED' } }),
    ]);

    // Calculate profit (assuming 30% platform fee)
    const revenue = Number(totalRevenue._sum.amount || 0);
    const monthlyRev = Number(monthlyRevenue._sum.amount || 0);

    return apiSuccess({
      summary: {
        total_revenue: revenue,
        monthly_revenue: monthlyRev,
        total_profit: Math.round(revenue * 0.3),
        monthly_profit: Math.round(monthlyRev * 0.3),
        total_commission: Math.round(revenue * 0.7),
        total_transactions: totalTransactions,
        avg_order_value: paidCount > 0 ? Math.round(revenue / paidCount) : 0,
      },
      transaction_summary: {
        paid: paidCount,
        pending: pendingCount,
        failed: failedCount,
      },
      transactions: recentTransactions,
    });
  } catch (error) {
    console.error('Admin finance error:', error);
    return apiError('Internal server error', 500);
  }
}
