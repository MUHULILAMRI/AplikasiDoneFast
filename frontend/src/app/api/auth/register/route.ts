// ============================================
// POST /api/auth/register
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken, hashPassword, apiSuccess, apiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !phone || !password) {
      return apiError('Semua field wajib diisi');
    }

    if (password.length < 8) {
      return apiError('Password minimal 8 karakter');
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError('Email sudah terdaftar', 409);
    }

    // Hash password and create user
    const password_hash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password_hash,
        role: 'CUSTOMER',
      },
    });

    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return apiSuccess(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        token,
      },
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return apiError('Internal server error', 500);
  }
}
