// Prisma config — load .env.local agar DATABASE_URL tersedia saat CLI dijalankan
import path from "path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prioritas: .env.local > .env
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    directUrl: process.env["DIRECT_URL"],
  },
});
