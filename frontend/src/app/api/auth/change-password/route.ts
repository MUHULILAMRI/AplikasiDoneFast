// ============================================
// POST /api/auth/change-password
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, apiSuccess, apiError, hashPassword, verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const auth = await authenticateRequest(req);
        if ('error' in auth) return auth.error;

        const { oldPassword, newPassword } = await req.json();

        if (!oldPassword || !newPassword) {
            return apiError('Password lama dan baru wajib diisi', 400);
        }

        if (newPassword.length < 4) {
            return apiError('Password minimal 4 karakter', 400);
        }

        // Get user with current password hash
        const user = await prisma.user.findUnique({
            where: { id: auth.user.userId },
            select: { id: true, password_hash: true },
        });

        if (!user) return apiError('User tidak ditemukan', 404);

        // Verify old password
        const isValid = await verifyPassword(oldPassword, user.password_hash);
        if (!isValid) {
            return apiError('Password lama salah', 400);
        }

        // Hash and update new password
        const newHash = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: user.id },
            data: { password_hash: newHash },
        });

        return apiSuccess({ message: 'Password berhasil diubah' });
    } catch (error) {
        console.error('Change password error:', error);
        return apiError('Internal server error', 500);
    }
}
