// Script untuk mereset/membuat password user menggunakan PBKDF2
// yang sama dengan implementasi di auth.ts
// Jalankan: node src/scripts/reset-password.js

const { createHash, randomBytes } = require('crypto');

async function hashPassword(password) {
    const salt = randomBytes(16);
    const saltHex = salt.toString('hex');

    // Simulasikan PBKDF2 Web Crypto API cara yang kompatibel
    return new Promise((resolve, reject) => {
        require('crypto').pbkdf2(password, salt, 100000, 32, 'sha256', (err, derived) => {
            if (err) reject(err);
            const hashHex = derived.toString('hex');
            resolve(`${saltHex}:${hashHex}`);
        });
    });
}

async function main() {
    const passwords = ['admin123', 'password123', 'donefast123'];
    console.log('=== Password Hash Generator ===\n');
    for (const pwd of passwords) {
        const hash = await hashPassword(pwd);
        console.log(`Password: ${pwd}`);
        console.log(`Hash:     ${hash}`);
        console.log('---');
    }
}

main().catch(console.error);
