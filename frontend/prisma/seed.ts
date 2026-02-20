 // ============================================
// DoneFast - Database Seed Script
// ============================================
// Run: npx tsx prisma/seed.ts
// ============================================

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Simple password hash (matches auth.ts logic)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = new Uint8Array([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]); // deterministic for seed
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

  const passwordHash = await hashPassword('password123');

  // ── Users ──
  console.log('👤 Creating users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin DoneFast',
      email: 'admin@donefast.id',
      password_hash: passwordHash,
      role: 'ADMIN',
      phone: '+6281234567890',
      avatar: '👨‍💼',
    },
  });

  const jokiUser1 = await prisma.user.create({
    data: {
      name: 'Alex Coder',
      email: 'alex@donefast.id',
      password_hash: passwordHash,
      role: 'JOKI',
      phone: '+6281234567891',
      avatar: '👨‍💻',
    },
  });

  const jokiUser2 = await prisma.user.create({
    data: {
      name: 'Sarah Writer',
      email: 'sarah@donefast.id',
      password_hash: passwordHash,
      role: 'JOKI',
      phone: '+6281234567892',
      avatar: '👩‍🎓',
    },
  });

  const jokiUser3 = await prisma.user.create({
    data: {
      name: 'Rizky Architect',
      email: 'rizky@donefast.id',
      password_hash: passwordHash,
      role: 'JOKI',
      phone: '+6281234567893',
      avatar: '🧑‍🎨',
    },
  });

  const jokiUser4 = await prisma.user.create({
    data: {
      name: 'Dina AI Expert',
      email: 'dina@donefast.id',
      password_hash: passwordHash,
      role: 'JOKI',
      phone: '+6281234567894',
      avatar: '👩‍💻',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'Ahmad Rizki',
      email: 'ahmad@gmail.com',
      password_hash: passwordHash,
      role: 'CUSTOMER',
      phone: '+6281345678901',
      avatar: '🧑‍🎓',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Siti Nurhaliza',
      email: 'siti@gmail.com',
      password_hash: passwordHash,
      role: 'CUSTOMER',
      phone: '+6281456789012',
      avatar: '👩‍💻',
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@gmail.com',
      password_hash: passwordHash,
      role: 'CUSTOMER',
      phone: '+6281567890123',
      avatar: '🧑‍🔬',
      is_vip: true,
    },
  });

  const customer4 = await prisma.user.create({
    data: {
      name: 'Dian Permata',
      email: 'dian@gmail.com',
      password_hash: passwordHash,
      role: 'CUSTOMER',
      phone: '+6281678901234',
      avatar: '👩‍🎓',
    },
  });

  const customer5 = await prisma.user.create({
    data: {
      name: 'Fajar Nugroho',
      email: 'fajar@gmail.com',
      password_hash: passwordHash,
      role: 'CUSTOMER',
      phone: '+6281789012345',
      avatar: '🧑‍💼',
    },
  });

  // ── Joki Members ──
  console.log('🎮 Creating joki members...');
  const joki1 = await prisma.jokiMember.create({
    data: {
      user_id: jokiUser1.id,
      name: 'Alex Coder',
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
      name: 'Sarah Writer',
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
      name: 'Rizky Architect',
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
      name: 'Dina AI Expert',
      skills: ['AI/ML', 'Data Science', 'Python', 'TensorFlow', 'NLP'],
      rating: 4.9,
      total_completed: 67,
      commission_rate: 75,
      is_available: true,
    },
  });

  // ── Services ──
  console.log('📦 Creating services...');
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Joki Skripsi & Tesis',
        description: 'Pengerjaan skripsi dan tesis lengkap dengan riset, penulisan, dan format sesuai standar universitas.',
        category: 'AKADEMIK',
        base_price: 500000,
        rating: 4.8,
        total_orders: 1250,
        estimated_days: 7,
        features: ['Riset mendalam', 'Format APA/IEEE', 'Cek plagiarisme', '2x revisi gratis'],
        is_popular: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Tugas Makalah & Essay',
        description: 'Penulisan makalah, essay, dan paper akademik dengan referensi terpercaya.',
        category: 'AKADEMIK',
        base_price: 150000,
        rating: 4.7,
        total_orders: 2340,
        estimated_days: 3,
        features: ['Referensi jurnal', 'Anti plagiat', 'Format sesuai kampus', 'Revisi gratis'],
        is_popular: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Laporan Praktikum',
        description: 'Pembuatan laporan praktikum lengkap dengan analisis data dan pembahasan.',
        category: 'AKADEMIK',
        base_price: 100000,
        rating: 4.6,
        total_orders: 890,
        estimated_days: 2,
        features: ['Analisis data', 'Grafik & tabel', 'Format lab', 'Pembahasan detail'],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Presentasi PowerPoint',
        description: 'Desain presentasi profesional dengan animasi dan infografis menarik.',
        category: 'AKADEMIK',
        base_price: 80000,
        rating: 4.5,
        total_orders: 1560,
        estimated_days: 2,
        features: ['Desain modern', 'Animasi halus', 'Infografis', 'Template premium'],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Tugas Coding & Programming',
        description: 'Pengerjaan tugas coding dalam berbagai bahasa pemrograman dan framework.',
        category: 'CODING',
        base_price: 200000,
        rating: 4.9,
        total_orders: 980,
        estimated_days: 3,
        features: ['Multi bahasa', 'Clean code', 'Dokumentasi', 'Unit testing'],
        is_popular: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Website Development',
        description: 'Pembuatan website responsif dengan teknologi modern (React, Next.js, dll).',
        category: 'CODING',
        base_price: 500000,
        rating: 4.8,
        total_orders: 456,
        estimated_days: 7,
        features: ['Responsive design', 'SEO friendly', 'Modern stack', 'Deploy gratis'],
        is_popular: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Mobile App Development',
        description: 'Pembuatan aplikasi mobile dengan React Native atau Flutter.',
        category: 'CODING',
        base_price: 800000,
        rating: 4.7,
        total_orders: 234,
        estimated_days: 14,
        features: ['Cross-platform', 'UI/UX modern', 'API integration', 'Play Store ready'],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Gambar Kerja AutoCAD',
        description: 'Pembuatan gambar kerja arsitektur lengkap menggunakan AutoCAD.',
        category: 'ARSITEKTUR',
        base_price: 300000,
        rating: 4.7,
        total_orders: 567,
        estimated_days: 5,
        features: ['Denah lengkap', 'Tampak & potongan', 'Detail konstruksi', 'File DWG'],
        is_popular: true,
      },
    }),
    prisma.service.create({
      data: {
        name: '3D Rendering & Visualisasi',
        description: 'Rendering 3D fotorealistik untuk proyek arsitektur dan interior.',
        category: 'ARSITEKTUR',
        base_price: 400000,
        rating: 4.8,
        total_orders: 345,
        estimated_days: 5,
        features: ['Fotorealistik', 'Interior & eksterior', 'Material library', 'Resolusi 4K'],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Konsultasi Akademik',
        description: 'Bimbingan dan konsultasi untuk tugas, skripsi, dan proyek akademik.',
        category: 'KONSULTASI',
        base_price: 75000,
        rating: 4.6,
        total_orders: 780,
        estimated_days: 1,
        features: ['1-on-1 session', 'Video call', 'Review dokumen', 'Follow-up chat'],
      },
    }),
    prisma.service.create({
      data: {
        name: 'AI & Machine Learning Project',
        description: 'Implementasi proyek AI/ML termasuk data science, NLP, dan computer vision.',
        category: 'AI_TEKNOLOGI',
        base_price: 600000,
        rating: 4.9,
        total_orders: 189,
        estimated_days: 7,
        features: ['Custom model', 'Data preprocessing', 'Training & tuning', 'Deployment ready'],
        is_popular: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Analisis Data & Statistik',
        description: 'Analisis data menggunakan SPSS, Python, R, atau Excel untuk riset dan tugas.',
        category: 'AI_TEKNOLOGI',
        base_price: 250000,
        rating: 4.7,
        total_orders: 423,
        estimated_days: 3,
        features: ['SPSS/Python/R', 'Visualisasi data', 'Interpretasi hasil', 'Laporan lengkap'],
      },
    }),
  ]);

  // ── Vouchers ──
  console.log('🎟️ Creating vouchers...');
  const vouchers = await Promise.all([
    prisma.voucher.create({
      data: {
        code: 'WELCOME20',
        discount_percent: 20,
        min_order: 100000,
        max_discount: 50000,
        valid_until: new Date('2026-12-31'),
        max_usage: 1000,
        usage_count: 234,
        is_active: true,
      },
    }),
    prisma.voucher.create({
      data: {
        code: 'MAHASISWA15',
        discount_percent: 15,
        min_order: 75000,
        max_discount: 30000,
        valid_until: new Date('2026-06-30'),
        max_usage: 500,
        usage_count: 156,
        is_active: true,
      },
    }),
    prisma.voucher.create({
      data: {
        code: 'SKRIPSI25',
        discount_percent: 25,
        min_order: 300000,
        max_discount: 100000,
        valid_until: new Date('2026-03-31'),
        max_usage: 200,
        usage_count: 89,
        is_active: true,
      },
    }),
    prisma.voucher.create({
      data: {
        code: 'CODING10',
        discount_percent: 10,
        min_order: 150000,
        max_discount: 50000,
        valid_until: new Date('2026-09-30'),
        max_usage: 300,
        usage_count: 45,
        is_active: true,
      },
    }),
  ]);

  // ── Orders ──
  console.log('📋 Creating orders...');
  const order1 = await prisma.order.create({
    data: {
      order_number: 'ORD-20260210-0001',
      user_id: customer1.id,
      service_id: services[0].id,
      joki_id: joki2.id,
      title: 'Skripsi BAB 3 - Metodologi Penelitian Kuantitatif',
      description: 'Menulis BAB 3 tentang metodologi penelitian kuantitatif. Framework: survey, populasi mahasiswa UI.',
      requirements: 'Format APA, dosen pembimbing sudah approve outline. Min 30 halaman.',
      files: ['brief.pdf', 'outline_bab3.docx'],
      deadline: new Date('2026-02-20'),
      price: 450000,
      status: 'IN_PROGRESS',
      difficulty: 'HARD',
      pages: 30,
      result_files: [],
    },
  });

  const order2 = await prisma.order.create({
    data: {
      order_number: 'ORD-20260211-0002',
      user_id: customer2.id,
      service_id: services[4].id,
      joki_id: joki1.id,
      title: 'Tugas Coding Python - Machine Learning Classification',
      description: 'Implementasi model klasifikasi menggunakan Random Forest dan SVM. Dataset sudah disediakan.',
      requirements: 'Python 3.10+, scikit-learn, accuracy min 85%',
      files: ['dataset.csv', 'tugas_ml.pdf'],
      deadline: new Date('2026-02-25'),
      price: 280000,
      status: 'IN_PROGRESS',
      difficulty: 'MEDIUM',
      result_files: [],
    },
  });

  const order3 = await prisma.order.create({
    data: {
      order_number: 'ORD-20260212-0003',
      user_id: customer3.id,
      service_id: services[1].id,
      title: 'Makalah Hukum Bisnis E-Commerce',
      description: 'Makalah tentang aspek hukum dalam bisnis e-commerce di Indonesia. 15-20 halaman.',
      requirements: 'Min 10 referensi jurnal, format Chicago Style',
      files: ['outline.pdf'],
      deadline: new Date('2026-02-28'),
      price: 180000,
      status: 'PAID',
      difficulty: 'MEDIUM',
      pages: 18,
      result_files: [],
    },
  });

  const order4 = await prisma.order.create({
    data: {
      order_number: 'ORD-20260205-0004',
      user_id: customer4.id,
      service_id: services[5].id,
      joki_id: joki1.id,
      title: 'Website Portfolio Personal React',
      description: 'Website portfolio responsive menggunakan React + Tailwind CSS dengan animasi smooth.',
      requirements: 'React 18, Tailwind CSS, Framer Motion, deploy ke Vercel',
      files: ['design_reference.fig'],
      deadline: new Date('2026-02-15'),
      price: 650000,
      status: 'COMPLETED',
      difficulty: 'MEDIUM',
      result_files: ['portfolio_final.zip', 'deployment_url.txt'],
    },
  });

  const order5 = await prisma.order.create({
    data: {
      order_number: 'ORD-20260213-0005',
      user_id: customer5.id,
      service_id: services[7].id,
      joki_id: joki3.id,
      title: 'Gambar Kerja Rumah 2 Lantai',
      description: 'Gambar kerja lengkap rumah tinggal 2 lantai di lahan 10x15m.',
      requirements: 'AutoCAD 2024, SNI terbaru, lengkap denah-tampak-potongan',
      files: ['site_plan.pdf', 'requirements.docx'],
      deadline: new Date('2026-02-22'),
      price: 400000,
      status: 'IN_PROGRESS',
      difficulty: 'HARD',
      result_files: [],
    },
  });

  const order6 = await prisma.order.create({
    data: {
      order_number: 'ORD-20260208-0006',
      user_id: customer1.id,
      service_id: services[10].id,
      joki_id: joki4.id,
      title: 'Proyek Sentiment Analysis Twitter',
      description: 'Analisis sentimen data Twitter tentang kebijakan pendidikan menggunakan NLP.',
      requirements: 'Python, NLTK/spaCy, dataset min 5000 tweet, visualisasi hasil',
      files: ['proposal.pdf'],
      deadline: new Date('2026-02-18'),
      price: 750000,
      status: 'REVISION',
      difficulty: 'EXPERT',
      result_files: ['sentiment_v1.zip'],
      revisions_left: 1,
    },
  });

  // ── Transactions ──
  console.log('💳 Creating transactions...');
  await Promise.all([
    prisma.transaction.create({
      data: {
        order_id: order1.id,
        user_id: customer1.id,
        amount: 450000,
        payment_method: 'QRIS',
        payment_status: 'PAID',
        external_id: 'PAY-1707580800-abc123',
        paid_at: new Date('2026-02-10T10:00:00Z'),
      },
    }),
    prisma.transaction.create({
      data: {
        order_id: order2.id,
        user_id: customer2.id,
        amount: 280000,
        payment_method: 'DANA',
        payment_status: 'PAID',
        external_id: 'PAY-1707667200-def456',
        paid_at: new Date('2026-02-11T14:30:00Z'),
      },
    }),
    prisma.transaction.create({
      data: {
        order_id: order3.id,
        user_id: customer3.id,
        amount: 180000,
        payment_method: 'BANK_TRANSFER',
        payment_status: 'PAID',
        external_id: 'PAY-1707753600-ghi789',
        paid_at: new Date('2026-02-12T09:00:00Z'),
      },
    }),
    prisma.transaction.create({
      data: {
        order_id: order4.id,
        user_id: customer4.id,
        amount: 650000,
        payment_method: 'OVO',
        payment_status: 'PAID',
        external_id: 'PAY-1707321600-jkl012',
        paid_at: new Date('2026-02-05T11:00:00Z'),
      },
    }),
    prisma.transaction.create({
      data: {
        order_id: order5.id,
        user_id: customer5.id,
        amount: 400000,
        payment_method: 'EWALLET',
        payment_status: 'PAID',
        external_id: 'PAY-1707840000-mno345',
        paid_at: new Date('2026-02-13T16:00:00Z'),
      },
    }),
    prisma.transaction.create({
      data: {
        order_id: order6.id,
        user_id: customer1.id,
        amount: 750000,
        payment_method: 'QRIS',
        payment_status: 'PAID',
        external_id: 'PAY-1707148800-pqr678',
        paid_at: new Date('2026-02-08T08:30:00Z'),
      },
    }),
  ]);

  // ── Chat Messages ──
  console.log('💬 Creating chat messages...');
  await Promise.all([
    prisma.chatMessage.create({
      data: {
        order_id: order1.id,
        sender_id: customer1.id,
        sender_role: 'CUSTOMER',
        message: 'Halo, saya sudah upload brief dan outline untuk BAB 3 skripsi.',
      },
    }),
    prisma.chatMessage.create({
      data: {
        order_id: order1.id,
        sender_id: jokiUser2.id,
        sender_role: 'JOKI',
        message: 'Terima kasih! Saya sudah review outline-nya. Akan mulai dikerjakan hari ini. Estimasi 5 hari kerja.',
      },
    }),
    prisma.chatMessage.create({
      data: {
        order_id: order1.id,
        sender_id: customer1.id,
        sender_role: 'CUSTOMER',
        message: 'Oke mantap, kalau ada pertanyaan tentang konten langsung chat saya ya.',
      },
    }),
    prisma.chatMessage.create({
      data: {
        order_id: order2.id,
        sender_id: jokiUser1.id,
        sender_role: 'JOKI',
        message: 'Dataset sudah saya terima. Model Random Forest accuracy 87%, SVM 89%. Lagi fine-tuning hyperparameter.',
      },
    }),
    prisma.chatMessage.create({
      data: {
        order_id: order2.id,
        sender_id: customer2.id,
        sender_role: 'CUSTOMER',
        message: 'Wah bagus! Tolong sertakan confusion matrix dan ROC curve juga ya.',
      },
    }),
  ]);

  // ── Notifications ──
  console.log('🔔 Creating notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        user_id: customer1.id,
        title: 'Order Dalam Pengerjaan',
        message: 'Order ORD-20260210-0001 (Skripsi BAB 3) sedang dikerjakan oleh Sarah Writer.',
        type: 'ORDER_UPDATE',
      },
    }),
    prisma.notification.create({
      data: {
        user_id: customer4.id,
        title: 'Order Selesai!',
        message: 'Order ORD-20260205-0004 (Website Portfolio) sudah selesai. Silakan download hasilnya.',
        type: 'FILE_READY',
        is_read: true,
      },
    }),
    prisma.notification.create({
      data: {
        user_id: customer1.id,
        title: 'Revisi Tersedia',
        message: 'Hasil revisi untuk order ORD-20260208-0006 (Sentiment Analysis) sudah diupload.',
        type: 'REVISION',
      },
    }),
    prisma.notification.create({
      data: {
        user_id: admin.id,
        title: 'Order Baru Perlu Assign',
        message: 'Order ORD-20260212-0003 (Makalah Hukum Bisnis) sudah dibayar. Silakan assign joki.',
        type: 'ORDER_UPDATE',
      },
    }),
    prisma.notification.create({
      data: {
        user_id: customer2.id,
        title: 'Promo Spesial!',
        message: 'Gunakan kode MAHASISWA15 untuk diskon 15% order berikutnya!',
        type: 'PROMO',
      },
    }),
  ]);

  // ── Referrals ──
  console.log('🔗 Creating referrals...');
  await prisma.referral.create({
    data: {
      referrer_id: customer1.id,
      referred_id: customer4.id,
      reward: 25000,
      is_claimed: true,
    },
  });

  console.log('\n✅ Seed completed successfully!');
  console.log('─'.repeat(40));
  console.log(`   Users: 10 (1 admin, 4 joki, 5 customers)`);
  console.log(`   Joki Members: 4`);
  console.log(`   Services: 12`);
  console.log(`   Vouchers: 4`);
  console.log(`   Orders: 6`);
  console.log(`   Transactions: 6`);
  console.log(`   Chat Messages: 5`);
  console.log(`   Notifications: 5`);
  console.log(`   Referrals: 1`);
  console.log('─'.repeat(40));
  console.log('\n📧 Login credentials (password: password123):');
  console.log('   Admin:    admin@donefast.id');
  console.log('   Joki:     alex@donefast.id / sarah@donefast.id');
  console.log('   Customer: ahmad@gmail.com / siti@gmail.com / budi@gmail.com');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
