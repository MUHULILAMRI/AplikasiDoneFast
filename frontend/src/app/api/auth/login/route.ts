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

    // Check DATABASE_URL tersedia
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[your-project-ref]')) {
      console.error('[LOGIN] DATABASE_URL belum dikonfigurasi di .env.local');
      return apiError('Konfigurasi database belum selesai. Hubungi administrator.', 500);
    }

    // Find user in database
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return apiError('Email atau password salah', 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      console.warn(`[LOGIN] Password verification failed for user: ${email}`);
      return apiError('Email atau password salah', 401);
    }

    console.log(`[LOGIN] User ${email} authenticated successfully. Generating token...`);

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
    const err = error as Error;
    console.error('[LOGIN] Error:', err.message);
    console.error('[LOGIN] Stack:', err.stack);
    return apiError(`Internal server error: ${err.message}`, 500);
  }
}
