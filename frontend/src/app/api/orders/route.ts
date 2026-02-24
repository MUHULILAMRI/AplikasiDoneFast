// ============================================
// GET /api/orders — list orders (role-aware)
// POST /api/orders — create new order
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, apiSuccess, apiError, apiPaginated } from '@/lib/auth';

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

    // Customers see own orders; Joki see assigned; Admin see all
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
          service: { select: { name: true, category: true } },
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

    const body = await req.json();
    const { service_id, title, description, requirements, deadline, pages, voucher_code } = body;

    if (!service_id || !title || !deadline) {
      return apiError('Service, title, dan deadline wajib diisi');
    }

    const service = await prisma.service.findUnique({ where: { id: service_id } });
    if (!service) return apiError('Layanan tidak ditemukan', 404);

    // Load pricing settings from DB
    const settingsRows = await prisma.siteSettings.findMany();
    const cfg: Record<string, string> = {};
    for (const r of settingsRows) cfg[r.key] = r.value;

    const perPage = Number(cfg.price_per_page || '15000');
    const taxPercent = Number(cfg.tax_percent || '0');
    const mult1d = Number(cfg.deadline_1day_multiplier || '1.5');
    const mult3d = Number(cfg.deadline_3day_multiplier || '1.3');

    // Calculate price (without difficulty — joki determines extra charges)
    let price = Number(service.base_price);
    if (pages) price += pages * perPage;

    // Deadline urgency (only for 3 days or less)
    const deadlineDate = new Date(deadline);
    const daysUntil = Math.ceil((deadlineDate.getTime() - Date.now()) / 86400000);
    if (daysUntil <= 1) price *= mult1d;
    else if (daysUntil <= 3) price *= mult3d;

    // Tax / admin fee
    if (taxPercent > 0) {
      price += price * (taxPercent / 100);
    }

    // Voucher
    let discount = 0;
    let voucherId: string | undefined;
    if (voucher_code) {
      const voucher = await prisma.voucher.findUnique({ where: { code: voucher_code } });
      if (voucher && voucher.is_active && voucher.usage_count < voucher.max_usage && new Date(voucher.valid_until) > new Date()) {
        discount = Math.min(price * (voucher.discount_percent / 100), Number(voucher.max_discount));
        voucherId = voucher.id;
        await prisma.voucher.update({ where: { id: voucher.id }, data: { usage_count: { increment: 1 } } });
      }
    }

    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

    const order = await prisma.order.create({
      data: {
        order_number: orderNumber,
        user_id: auth.user.userId,
        service_id,
        title,
        description: description || '',
        requirements: requirements || '',
        deadline: deadlineDate,
        price: Math.round(price - discount),
        difficulty: 'MEDIUM',
        pages,
        discount,
        voucher_id: voucherId,
        files: [],
        result_files: [],
      },
      include: {
        service: { select: { name: true, category: true } },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        user_id: auth.user.userId,
        title: 'Order Dibuat',
        message: `Order ${orderNumber} berhasil dibuat. Silakan lanjutkan pembayaran.`,
        type: 'ORDER_UPDATE',
      },
    });

    return apiSuccess(order, 201);
  } catch (error) {
    console.error('Create order error:', error);
    return apiError('Internal server error', 500);
  }
}
