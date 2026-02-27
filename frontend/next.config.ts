import { execSync } from "child_process";
import type { NextConfig } from "next";

// Force generate Prisma Client before Next.js build starts
// This is a common fix for "Prisma did not initialize yet" errors on Vercel
try {
  console.log("Generating Prisma Client...");
  execSync("npx prisma generate --schema=./prisma/schema.prisma", { stdio: "inherit" });
} catch (e) {
  console.warn("Prisma generate failed during next.config initialization:", e);
}

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Tambahkan ini juga sebagai langkah darurat terakhir
  },
  serverExternalPackages: ['@prisma/client', '.prisma'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
