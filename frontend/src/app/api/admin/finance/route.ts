// ============================================
// GET /api/admin/finance — finance & transaction report
// ============================================
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await headers(); // Force dynamic
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'monthly';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      paidTransactions,
      monthlyTransactions,
      totalTransactions,
      recentTransactions,
      pendingCount,
      failedCount,
    ] = await Promise.all([
      prisma.transaction.findMany({
        where: { payment_status: 'PAID' },
        include: {
          order: {
            include: {
              joki: { select: { commission_rate: true } }
            }
          }
        }
      }),
      prisma.transaction.findMany({
        where: { payment_status: 'PAID', paid_at: { gte: startOfMonth } },
        include: {
          order: {
            include: {
              joki: { select: { commission_rate: true } }
            }
          }
        }
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
      prisma.transaction.count({ where: { payment_status: 'PENDING' } }),
      prisma.transaction.count({ where: { payment_status: 'FAILED' } }),
    ]);

    // Dynamic Logic: Calculate Profit & Commission
    // If order has no joki yet, assume platform takes 100% until assigned? 
    // Or assume default 50/50 for projections? Let's use 50% as default fallback.
    const DEFAULT_COMMISSION = 50;

    const calculateStats = (txs: any[]) => {
      let revenue = 0;
      let commission = 0;
      txs.forEach(tx => {
        const amount = Number(tx.amount || 0);
        revenue += amount;
        const rate = tx.order?.joki?.commission_rate ?? DEFAULT_COMMISSION;
        commission += (amount * rate) / 100;
      });
      return { revenue, commission, profit: revenue - commission };
    };

    const totalStats = calculateStats(paidTransactions);
    const monthlyStats = calculateStats(monthlyTransactions);

    return apiSuccess({
      summary: {
        total_revenue: totalStats.revenue,
        monthly_revenue: monthlyStats.revenue,
        total_profit: Math.round(totalStats.profit),
        monthly_profit: Math.round(monthlyStats.profit),
        total_commission: Math.round(totalStats.commission),
        total_transactions: totalTransactions,
        avg_order_value: paidTransactions.length > 0 ? Math.round(totalStats.revenue / paidTransactions.length) : 0,
      },
      transaction_summary: {
        paid: paidTransactions.length,
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
