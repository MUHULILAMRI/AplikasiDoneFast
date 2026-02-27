// ============================================
// GET /api/admin/reports — detailed business analytics
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

        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        // 1. Fetch orders from last 6 months
        const orders = await prisma.order.findMany({
            where: {
                created_at: { gte: sixMonthsAgo }
            },
            include: {
                service: true,
                joki: {
                    include: { user: true }
                }
            }
        });

        // 2. Generate MONTHLY_DATA
        const monthlyDataMap: Record<string, { month: string; orders: number; revenue: number; profit: number; customers: Set<string> }> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(now.getMonth() - i);
            const mLabel = months[d.getMonth()];
            monthlyDataMap[mLabel] = { month: mLabel, orders: 0, revenue: 0, profit: 0, customers: new Set() };
        }

        orders.forEach(o => {
            const mLabel = months[new Date(o.created_at).getMonth()];
            if (monthlyDataMap[mLabel]) {
                monthlyDataMap[mLabel].orders++;
                if (o.status !== 'CANCELLED') {
                    const rev = Number(o.price);
                    monthlyDataMap[mLabel].revenue += rev;
                    monthlyDataMap[mLabel].profit += rev * 0.3; // Estimating 30% profit
                }
                monthlyDataMap[mLabel].customers.add(o.user_id);
            }
        });

        const monthlyData = Object.values(monthlyDataMap).reverse().map(d => ({
            ...d,
            customers: d.customers.size
        }));

        // 3. Generate TOP_SERVICES
        const serviceMap: Record<string, { name: string; orders: number; revenue: number }> = {};
        orders.forEach(o => {
            const sName = o.service?.name || o.title;
            if (!serviceMap[sName]) serviceMap[sName] = { name: sName, orders: 0, revenue: 0 };
            serviceMap[sName].orders++;
            if (o.status !== 'CANCELLED') serviceMap[sName].revenue += Number(o.price);
        });

        const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0) || 1;
        const topServices = Object.values(serviceMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)
            .map(s => ({
                ...s,
                pct: Math.round((s.revenue / totalRevenue) * 100)
            }));

        // 4. Generate TOP_JOKI
        const jokiMap: Record<string, { name: string; avatar: string; orders: number; rating: number; revenue: number }> = {};
        orders.forEach(o => {
            if (o.joki) {
                const jName = o.joki.user.name;
                if (!jokiMap[jName]) jokiMap[jName] = { name: jName, avatar: '👤', orders: 0, rating: 4.8, revenue: 0 };
                jokiMap[jName].orders++;
                if (o.status === 'COMPLETED') jokiMap[jName].revenue += Number(o.price) * 0.7; // Joki gets 70%
            }
        });

        const topJoki = Object.values(jokiMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 3);

        // 5. STATUS_SUMMARY
        const statusSummaryMap: Record<string, number> = {
            PENDING_PAYMENT: 0,
            PAID: 0,
            IN_PROGRESS: 0,
            REVISION: 0,
            COMPLETED: 0,
            CANCELLED: 0
        };
        orders.forEach(o => {
            if (statusSummaryMap[o.status] !== undefined) {
                statusSummaryMap[o.status]++;
            }
        });

        const statusSummary = [
            { status: 'Pending', count: statusSummaryMap.PENDING_PAYMENT, color: 'bg-yellow-500/10 text-yellow-400', type: 'PENDING' },
            { status: 'Dikerjakan', count: statusSummaryMap.IN_PROGRESS, color: 'bg-blue-500/10 text-blue-400', type: 'PROGRESS' },
            { status: 'Review', count: statusSummaryMap.PAID, color: 'bg-purple-500/10 text-purple-400', type: 'REVIEW' },
            { status: 'Selesai', count: statusSummaryMap.COMPLETED, color: 'bg-green-500/10 text-green-400', type: 'DONE' },
            { status: 'Revisi', count: statusSummaryMap.REVISION, color: 'bg-orange-500/10 text-orange-400', type: 'REVISION' },
            { status: 'Dibatalkan', count: statusSummaryMap.CANCELLED, color: 'bg-red-500/10 text-red-400', type: 'CANCEL' },
        ];

        return apiSuccess({
            monthlyData,
            topServices,
            topJoki,
            statusSummary,
            stats: {
                revenue: monthlyData[monthlyData.length - 1]?.revenue || 0,
                orders: monthlyData[monthlyData.length - 1]?.orders || 0,
                customers: monthlyData[monthlyData.length - 1]?.customers || 0,
                completionRate: orders.length > 0 ? (statusSummaryMap.COMPLETED / orders.length) * 100 : 100
            }
        });
    } catch (error) {
        console.error('Fetch reports error:', error);
        return apiError('Internal server error', 500);
    }
}
