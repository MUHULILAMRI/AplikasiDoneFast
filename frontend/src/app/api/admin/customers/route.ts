// ============================================
// GET /api/admin/customers — fetch all customers with stats
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await requireRole(req, 'ADMIN');
        if ('error' in auth) return auth.error;

        // Get all users who have the role of CUSTOMER
        const customers = await prisma.user.findMany({
            where: {
                role: 'CUSTOMER',
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                created_at: true,
                _count: {
                    select: { orders: true }
                },
                orders: {
                    select: {
                        price: true,
                        status: true,
                        created_at: true,
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const formattedCustomers = customers.map(c => {
            const totalSpent = c.orders.reduce((sum, o) => sum + Number(o.price), 0);
            const lastOrder = c.orders.length > 0 ? c.orders[0].created_at : null;

            // Basic tier logic based on total spent
            let tier = 'bronze';
            if (totalSpent > 10000000) tier = 'platinum';
            else if (totalSpent > 5000000) tier = 'gold';
            else if (totalSpent > 2000000) tier = 'silver';

            return {
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone || '-',
                avatar: c.name.charAt(0).toUpperCase(), // Simple avatar
                joinDate: c.created_at.toISOString().split('T')[0],
                totalOrders: c._count.orders,
                totalSpent,
                lastOrder: lastOrder ? lastOrder.toISOString().split('T')[0] : '-',
                status: 'active', // Default as active for now
                university: 'Internal User', // Could be added to profile later
                tier,
                rating: 4.5, // Placeholder for aggregation logic
            };
        });

        // Aggregate stats for the cards
        const totalCount = formattedCustomers.length;
        const newThisMonth = formattedCustomers.filter(c => {
            const date = new Date(c.joinDate);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;
        const premiumCount = formattedCustomers.filter(c => ['gold', 'platinum'].includes(c.tier)).length;

        return apiSuccess({
            customers: formattedCustomers,
            stats: {
                total: totalCount,
                new: newThisMonth,
                active: totalCount, // Simple logic
                premium: premiumCount,
            }
        });
    } catch (error) {
        console.error('Fetch customers error:', error);
        return apiError('Internal server error', 500);
    }
}
