// ============================================
// TEMPORARY - DELETE AFTER USE
// GET /api/reset-admin — Reset admin password
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

    const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const derived = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        256
    );
    const hashHex = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${saltHex}:${hashHex}`;
}

export async function GET(req: NextRequest) {
    // Safety check — remove or secure this in production
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (key !== 'donefast-reset-2026') {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const email = searchParams.get('email') || 'admin@donefast.id';
    const password = searchParams.get('password') || 'Admin123!';

    const hash = await hashPassword(password);

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        await prisma.user.update({
            where: { email },
            data: { password_hash: hash, role: 'ADMIN' },
        });
        return Response.json({
            success: true,
            message: 'Password berhasil di-reset',
            email,
            password,
            warning: 'HAPUS FILE /src/app/api/reset-admin/route.ts setelah berhasil login!'
        });
    } else {
        const user = await prisma.user.create({
            data: {
                name: 'Admin DoneFast',
                email,
                password_hash: hash,
                role: 'ADMIN',
            },
        });
        return Response.json({
            success: true,
            message: 'Akun admin berhasil dibuat',
            email,
            password,
            id: user.id,
            warning: 'HAPUS FILE /src/app/api/reset-admin/route.ts setelah berhasil login!'
        });
    }
}
