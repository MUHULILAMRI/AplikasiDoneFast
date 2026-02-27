// ============================================
// DoneFast - Prisma Client Singleton
// ============================================
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy-load Prisma Client using a Proxy to prevent initialization errors during Next.js build
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
    }
    return (globalForPrisma.prisma as any)[prop];
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma as any;

export default prisma;
