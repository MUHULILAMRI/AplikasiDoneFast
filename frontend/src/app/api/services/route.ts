// ============================================
// GET /api/services — list all services
// POST /api/services — create service (admin only)
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiSuccess, apiError, apiPaginated } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: Record<string, unknown> = { is_active: true };
    if (category) where.category = category.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, string> = {};
    switch (sort) {
      case 'price_asc': orderBy.base_price = 'asc'; break;
      case 'price_desc': orderBy.base_price = 'desc'; break;
      case 'rating': orderBy.rating = 'desc'; break;
      case 'newest': orderBy.created_at = 'desc'; break;
      default: orderBy.total_orders = 'desc'; // popular
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    return apiPaginated(services, total, page, limit);
  } catch (error) {
    console.error('Get services error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const body = await req.json();
    const { name, description, category, base_price, estimated_days, features, image } = body;

    if (!name || !description || !category || !base_price) {
      return apiError('Nama, deskripsi, kategori, dan harga dasar wajib diisi');
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        category,
        base_price,
        estimated_days: estimated_days || 3,
        features: features || [],
        image,
      },
    });

    return apiSuccess(service, 201);
  } catch (error) {
    console.error('Create service error:', error);
    return apiError('Internal server error', 500);
  }
}
