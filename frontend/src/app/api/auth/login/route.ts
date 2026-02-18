// ============================================
// POST /api/auth/login
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken, verifyPassword, apiSuccess, apiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError('Email dan password wajib diisi');
    }

    // Find user in database
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return apiError('Email atau password salah', 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return apiError('Email atau password salah', 401);
    }

    // Generate JWT
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        is_vip: user.is_vip,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return apiError('Internal server error', 500);
  }
}
