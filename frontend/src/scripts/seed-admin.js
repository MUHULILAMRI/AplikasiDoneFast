// Script untuk membuat/mereset akun admin DoneFast
// Jalankan dengan: node src/scripts/seed-admin.js
// HAPUS FILE INI setelah digunakan!

const crypto = require('crypto');
const { PrismaClient } = require('../../node_modules/.prisma/client/index.js');
const prisma = new PrismaClient();

async function hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const saltHex = salt.toString('hex');
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, derived) => {
            if (err) reject(err);
            resolve(`${saltHex}:${derived.toString('hex')}`);
        });
    });
}

async function main() {
    const email = 'admin@donefast.id';
    const password = 'Admin123!';

    const hash = await hashPassword(password);

    // Cek apakah user sudah ada
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        // Update password
        await prisma.user.update({
            where: { email },
            data: { password_hash: hash, role: 'ADMIN' },
        });
        console.log(`[✓] Password admin berhasil di-reset.`);
    } else {
        // Buat user baru
        await prisma.user.create({
            data: {
                name: 'Admin DoneFast',
                email,
                password_hash: hash,
                role: 'ADMIN',
            },
        });
        console.log(`[✓] Akun admin berhasil dibuat.`);
    }

    console.log(`\nEmail   : ${email}`);
    console.log(`Password: ${password}`);
    console.log('\n⚠️  Segera ubah password setelah login!\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
