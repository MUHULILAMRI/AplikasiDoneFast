// ============================================
// DoneFast - Database Seed Script
// ============================================
// Run: npx tsx prisma/seed.ts
// ============================================

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Simple password hash (matches auth.ts logic)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]); // deterministic for seed
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
  const hashHex = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.chatMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.jokiMember.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await hashPassword('Ulil');
  const joki1Hash = await hashPassword('ulil');
  const joki2Hash = await hashPassword('sari');
  const joki3Hash = await hashPassword('Apu');
  const joki4Hash = await hashPassword('Syahril');
  const joki5Hash = await hashPassword('Risal');

  // ── Users ──
  console.log('👤 Creating users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Ulil',
      email: 'muhulilamri@donefast.id',
      password_hash: adminHash,
      role: 'ADMIN',
      phone: '+6281234567890',
      avatar: '👨‍💼',
    },
  });

  const jokiUser1 = await prisma.user.create({
    data: {
      name: 'Muh Ulil Amri',
      email: 'ulil@donefast.id',
      password_hash: joki1Hash,
      role: 'JOKI',
      phone: '+6281234567891',
      avatar: '👨‍💻',
    },
  });

  const jokiUser2 = await prisma.user.create({
    data: {
      name: 'Reski Anugrah Sari',
      email: 'reski@donefast.id',
      password_hash: joki2Hash,
      role: 'JOKI',
      phone: '+6281234567892',
      avatar: '👩‍🎓',
    },
  });

  const jokiUser3 = await prisma.user.create({
    data: {
      name: 'Apu',
      email: 'apu@donefast.id',
      password_hash: joki3Hash,
      role: 'JOKI',
      phone: '+6281234567893',
      avatar: '🧑‍🎨',
    },
  });

  const jokiUser4 = await prisma.user.create({
    data: {
      name: 'Syahril Akbar',
      email: 'syahril@donefast.id',
      password_hash: joki4Hash,
      role: 'JOKI',
      phone: '+6281234567894',
      avatar: '👩‍💻',
    },
  });

  const jokiUser5 = await prisma.user.create({
    data: {
      name: 'Risal',
      email: 'risal@donefast.id',
      password_hash: joki5Hash,
      role: 'JOKI',
      phone: '+6281234567895',
      avatar: '🧑‍💼',
    },
  });

  // ── Joki Members ──
  console.log('🎮 Creating joki members...');
  const joki1 = await prisma.jokiMember.create({
    data: {
      user_id: jokiUser1.id,
      name: 'Muh Ulil Amri',
      skills: ['Python', 'JavaScript', 'React', 'Machine Learning', 'Web Development'],
      rating: 4.9,
      total_completed: 156,
      commission_rate: 70,
      is_available: true,
    },
  });

  const joki2 = await prisma.jokiMember.create({
    data: {
      user_id: jokiUser2.id,
      name: 'Reski Anugrah Sari',
      skills: ['Skripsi', 'Tesis', 'Makalah', 'Jurnal', 'Proposal'],
      rating: 4.8,
      total_completed: 203,
      commission_rate: 70,
      is_available: true,
    },
  });

  const joki3 = await prisma.jokiMember.create({
    data: {
      user_id: jokiUser3.id,
      name: 'Apu',
      skills: ['AutoCAD', 'SketchUp', '3D Rendering', 'Revit', 'Interior Design'],
      rating: 4.7,
      total_completed: 89,
      commission_rate: 65,
      is_available: true,
    },
  });

  const joki4 = await prisma.jokiMember.create({
    data: {
      user_id: jokiUser4.id,
      name: 'Syahril Akbar',
      skills: ['AI/ML', 'Data Science', 'Python', 'TensorFlow', 'NLP'],
      rating: 4.9,
      total_completed: 67,
      commission_rate: 75,
      is_available: true,
    },
  });

  const joki5 = await prisma.jokiMember.create({
    data: {
      user_id: jokiUser5.id,
      name: 'Risal',
      skills: ['Mobile Dev', 'Flutter', 'React Native', 'Kotlin', 'UI/UX'],
      rating: 4.6,
      total_completed: 45,
      commission_rate: 65,
      is_available: true,
    },
  });

  // ── Services (sequential to avoid connection pool limits) ──
  console.log('📦 Creating services...');
  const serviceData = [
    { name: 'Joki Skripsi & Tesis', description: 'Pengerjaan skripsi dan tesis lengkap dengan riset, penulisan, dan format sesuai standar universitas.', category: 'AKADEMIK' as const, base_price: 500000, rating: 4.8, total_orders: 1250, estimated_days: 7, features: ['Riset mendalam', 'Format APA/IEEE', 'Cek plagiarisme', '2x revisi gratis'], is_popular: true },
    { name: 'Tugas Makalah & Essay', description: 'Penulisan makalah, essay, dan paper akademik dengan referensi terpercaya.', category: 'AKADEMIK' as const, base_price: 150000, rating: 4.7, total_orders: 2340, estimated_days: 3, features: ['Referensi jurnal', 'Anti plagiat', 'Format sesuai kampus', 'Revisi gratis'], is_popular: true },
    { name: 'Laporan Praktikum', description: 'Pembuatan laporan praktikum lengkap dengan analisis data dan pembahasan.', category: 'AKADEMIK' as const, base_price: 100000, rating: 4.6, total_orders: 890, estimated_days: 2, features: ['Analisis data', 'Grafik & tabel', 'Format lab', 'Pembahasan detail'] },
    { name: 'Presentasi PowerPoint', description: 'Desain presentasi profesional dengan animasi dan infografis menarik.', category: 'AKADEMIK' as const, base_price: 80000, rating: 4.5, total_orders: 1560, estimated_days: 2, features: ['Desain modern', 'Animasi halus', 'Infografis', 'Template premium'] },
    { name: 'Tugas Coding & Programming', description: 'Pengerjaan tugas coding dalam berbagai bahasa pemrograman dan framework.', category: 'CODING' as const, base_price: 200000, rating: 4.9, total_orders: 980, estimated_days: 3, features: ['Multi bahasa', 'Clean code', 'Dokumentasi', 'Unit testing'], is_popular: true },
    { name: 'Website Development', description: 'Pembuatan website responsif dengan teknologi modern (React, Next.js, dll).', category: 'CODING' as const, base_price: 500000, rating: 4.8, total_orders: 456, estimated_days: 7, features: ['Responsive design', 'SEO friendly', 'Modern stack', 'Deploy gratis'], is_popular: true },
    { name: 'Mobile App Development', description: 'Pembuatan aplikasi mobile dengan React Native atau Flutter.', category: 'CODING' as const, base_price: 800000, rating: 4.7, total_orders: 234, estimated_days: 14, features: ['Cross-platform', 'UI/UX modern', 'API integration', 'Play Store ready'] },
    { name: 'Gambar Kerja AutoCAD', description: 'Pembuatan gambar kerja arsitektur lengkap menggunakan AutoCAD.', category: 'ARSITEKTUR' as const, base_price: 300000, rating: 4.7, total_orders: 567, estimated_days: 5, features: ['Denah lengkap', 'Tampak & potongan', 'Detail konstruksi', 'File DWG'], is_popular: true },
    { name: '3D Rendering & Visualisasi', description: 'Rendering 3D fotorealistik untuk proyek arsitektur dan interior.', category: 'ARSITEKTUR' as const, base_price: 400000, rating: 4.8, total_orders: 345, estimated_days: 5, features: ['Fotorealistik', 'Interior & eksterior', 'Material library', 'Resolusi 4K'] },
    { name: 'Konsultasi Akademik', description: 'Bimbingan dan konsultasi untuk tugas, skripsi, dan proyek akademik.', category: 'KONSULTASI' as const, base_price: 75000, rating: 4.6, total_orders: 780, estimated_days: 1, features: ['1-on-1 session', 'Video call', 'Review dokumen', 'Follow-up chat'] },
    { name: 'AI & Machine Learning Project', description: 'Implementasi proyek AI/ML termasuk data science, NLP, dan computer vision.', category: 'AI_TEKNOLOGI' as const, base_price: 600000, rating: 4.9, total_orders: 189, estimated_days: 7, features: ['Custom model', 'Data preprocessing', 'Training & tuning', 'Deployment ready'], is_popular: true },
    { name: 'Analisis Data & Statistik', description: 'Analisis data menggunakan SPSS, Python, R, atau Excel untuk riset dan tugas.', category: 'AI_TEKNOLOGI' as const, base_price: 250000, rating: 4.7, total_orders: 423, estimated_days: 3, features: ['SPSS/Python/R', 'Visualisasi data', 'Interpretasi hasil', 'Laporan lengkap'] },
  ];
  for (const sd of serviceData) {
    await prisma.service.create({ data: sd });
  }

  // ── Vouchers (sequential) ──
  console.log('🎟️ Creating vouchers...');
  const voucherData = [
    { code: 'WELCOME20', discount_percent: 20, min_order: 100000, max_discount: 50000, valid_until: new Date('2026-12-31'), max_usage: 1000, usage_count: 234, is_active: true },
    { code: 'MAHASISWA15', discount_percent: 15, min_order: 75000, max_discount: 30000, valid_until: new Date('2026-06-30'), max_usage: 500, usage_count: 156, is_active: true },
    { code: 'SKRIPSI25', discount_percent: 25, min_order: 300000, max_discount: 100000, valid_until: new Date('2026-03-31'), max_usage: 200, usage_count: 89, is_active: true },
    { code: 'CODING10', discount_percent: 10, min_order: 150000, max_discount: 50000, valid_until: new Date('2026-09-30'), max_usage: 300, usage_count: 45, is_active: true },
  ];
  for (const vd of voucherData) {
    await prisma.voucher.create({ data: vd });
  }

  // Orders, transactions, chat messages, notifications, and referrals
  // will be created naturally as customers register and place orders.
  console.log('📋 No sample orders created — customers will register themselves.');

  console.log('\n✅ Seed completed successfully!');
  console.log('─'.repeat(40));
  console.log(`   Users: 7 (1 admin, 5 joki, 1 sample customer)`);
  console.log(`   Joki Members: 5`);
  console.log(`   Services: 12`);
  console.log(`   Vouchers: 4`);
  console.log(`   Orders: 0`);
  console.log(`   Chat Messages: 0`);
  console.log(`   Notifications: 0`);
  console.log('─'.repeat(40));
  console.log('\n📧 Login credentials:');
  console.log('   Admin:    muhulilamri@donefast.id / Ulil');
  console.log('   Joki 1:   ulil@donefast.id / ulil');
  console.log('   Joki 2:   reski@donefast.id / sari');
  console.log('   Joki 3:   apu@donefast.id / Apu');
  console.log('   Joki 4:   syahril@donefast.id / Syahril');
  console.log('   Joki 5:   risal@donefast.id / Risal');
  console.log('   Customer: Register sendiri via /register');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e.message || e);
    if (e.code) console.error('   Code:', e.code);
    if (e.meta) console.error('   Meta:', JSON.stringify(e.meta));
    await prisma.$disconnect();
    process.exit(1);
  });
