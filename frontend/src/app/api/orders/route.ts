// ============================================
// GET /api/orders — list orders (role-aware)
// POST /api/orders — create new order
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, apiSuccess, apiError, apiPaginated } from '@/lib/auth';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 5 });

const orderSchema = z.object({
  service_id: z.string().min(1, 'Service ID wajib diisi'),
  title: z.string().min(5, 'Judul minimal 5 karakter'),
  description: z.string().optional(),
  requirements: z.string().optional(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), 'Format tanggal tidak valid'),
  files: z.array(z.string()).optional(),
  has_journal: z.boolean().nullable().optional(),
  urgency_level: z.string().optional(),
  price: z.number().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};

    if (auth.user.role === 'CUSTOMER') {
      where.user_id = auth.user.userId;
    } else if (auth.user.role === 'JOKI') {
      const joki = await prisma.jokiMember.findUnique({ where: { user_id: auth.user.userId } });
      if (joki) where.joki_id = joki.id;
    }

    if (status) where.status = status.toUpperCase();
    if (category) {
      where.service = { category: category.toUpperCase() };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          service: { select: { name: true, category: true, base_price: true } },
          user: { select: { id: true, name: true, email: true, avatar: true } },
          joki: { select: { id: true, name: true, rating: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return apiPaginated(orders, total, page, limit);
  } catch (error) {
    console.error('Get orders error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ('error' in auth) return auth.error;

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitResult = await limiter.check(ip);
    if (limitResult.isRateLimited) {
      return apiError('Terlalu banyak permintaan. Silakan coba lagi nanti.', 429);
    }

    const json = await req.json();
    const validation = orderSchema.safeParse(json);

    if (!validation.success) {
      return apiError(validation.error.issues[0].message);
    }

    const {
      service_id, title, description, requirements,
      deadline, files, has_journal, urgency_level, price
    } = validation.data;

    const service = await prisma.service.findUnique({ where: { id: service_id } });
    if (!service) return apiError('Layanan tidak ditemukan', 404);

    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

    const order = await prisma.order.create({
      data: {
        order_number: orderNumber,
        user_id: auth.user.userId,
        service_id,
        title,
        description: description || '',
        requirements: requirements || '',
        deadline: new Date(deadline),
        price: price || service.base_price, // Initial base price estimate
        status: 'WAITING_FOR_QUOTE' as any,
        has_journal: has_journal,
        urgency_level: urgency_level || 'STANDAR',
        files: files || [],
        result_files: [],
      } as any,
      include: {
        service: { select: { name: true, category: true } },
      },
    });

    await prisma.notification.create({
      data: {
        user_id: auth.user.userId,
        title: 'Pesanan Diterima',
        message: `Pesanan ${orderNumber} telah diajukan. Admin akan segera memberikan harga final.`,
        type: 'ORDER_UPDATE',
      },
    });

    return apiSuccess(order, 201);
  } catch (error) {
    console.error('Create order error:', error);
    return apiError('Internal server error', 500);
  }
}
