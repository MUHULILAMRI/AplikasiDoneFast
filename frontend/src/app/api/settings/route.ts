// ============================================
// GET/PUT /api/settings — site-wide pricing & config
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/auth';

// Default pricing config
const DEFAULTS: Record<string, string> = {
    'price_akademik': '50000',
    'price_arsitektur': '150000',
    'price_coding': '200000',
    'price_konsultasi': '100000',
    'price_ai_teknologi': '250000',
    'price_per_page': '15000',
    'tax_percent': '0',
    'deadline_1day_multiplier': '2.5',
    'deadline_3day_multiplier': '1.8',
};

export async function GET() {
    try {
        const rows = await prisma.siteSettings.findMany();
        const settings: Record<string, string> = { ...DEFAULTS };
        for (const row of rows) {
            settings[row.key] = row.value;
        }
        return apiSuccess(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        return apiError('Internal server error', 500);
    }
}

export async function PUT(req: NextRequest) {
    try {
        const auth = await authenticateRequest(req);
        if ('error' in auth) return auth.error;
        if (auth.user.role !== 'ADMIN') return apiError('Forbidden', 403);

        const body = await req.json() as Record<string, string>;

        // Upsert each setting
        const promises = Object.entries(body).map(([key, value]) =>
            prisma.siteSettings.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) },
            })
        );

        await Promise.all(promises);
        return apiSuccess({ message: 'Settings saved' });
    } catch (error) {
        console.error('Update settings error:', error);
        return apiError('Internal server error', 500);
    }
}
