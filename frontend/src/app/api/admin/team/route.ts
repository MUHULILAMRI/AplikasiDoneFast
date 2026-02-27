// ============================================
// GET /api/admin/team — list joki members
// POST /api/admin/team — add joki member
// ============================================
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { requireRole, hashPassword, apiSuccess, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await headers(); // Force dynamic
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const jokiMembers = await prisma.jokiMember.findMany({
      include: {
        user: { select: { name: true, email: true, avatar: true, phone: true } },
        _count: {
          select: {
            orders: {
              where: {
                status: {
                  notIn: ['COMPLETED', 'CANCELLED']
                }
              }
            }
          }
        },
      },
      orderBy: { rating: 'desc' },
    });

    return apiSuccess(jokiMembers);
  } catch (error) {
    console.error('Get team error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const body = await req.json();
    const { name, email, phone, skills, commission_rate, password } = body;

    if (!name || !email || !skills?.length) {
      return apiError('Nama, email, dan skills wajib diisi');
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user with JOKI role
      const password_hash = await hashPassword(password || 'joki12345');
      user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          password_hash,
          role: 'JOKI',
        },
      });
    } else {
      // Update existing user role
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'JOKI' },
      });
    }

    // Create joki member profile
    const joki = await prisma.jokiMember.create({
      data: {
        user_id: user.id,
        name,
        skills,
        commission_rate: commission_rate || 70,
      },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
      },
    });

    return apiSuccess(joki, 201);
  } catch (error) {
    console.error('Add team member error:', error);
    return apiError('Internal server error', 500);
  }
}
