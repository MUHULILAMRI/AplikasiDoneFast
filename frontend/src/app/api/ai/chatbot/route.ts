// ============================================
// POST /api/ai/chatbot — Smart AI chatbot for DoneFast
// Hanya menjawab seputar DoneFast: layanan, harga, cara
// order, pembayaran, garansi, dan info platform.
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/auth';

// ── Knowledge Base ──
const KNOWLEDGE_BASE: { keywords: string[]; response: string; topic: string }[] = [
  {
    topic: 'harga',
    keywords: ['harga', 'berapa', 'biaya', 'tarif', 'cost', 'mahal', 'murah', 'estimasi', 'total', 'bayar berapa', 'price'],
    response: `Harga layanan DoneFast bervariasi tergantung jenis tugas, tingkat kesulitan, dan deadline. Berikut kisaran harga:

📚 **Akademik**: mulai Rp 50.000 - Rp 500.000
🏗️ **Arsitektur & Desain**: mulai Rp 100.000 - Rp 2.000.000
💻 **Coding & Web**: mulai Rp 150.000 - Rp 3.000.000
💬 **Konsultasi**: mulai Rp 75.000 - Rp 300.000/jam
🤖 **AI & Teknologi**: mulai Rp 200.000 - Rp 5.000.000

Kamu bisa cek estimasi harga langsung di halaman order. Harga sudah termasuk revisi gratis! 💰`,
  },
  {
    topic: 'pembayaran',
    keywords: ['bayar', 'payment', 'transfer', 'qris', 'dana', 'ovo', 'gopay', 'shopeepay', 'bank', 'bri', 'seabank', 'ewallet', 'rekening'],
    response: `Kami menerima berbagai metode pembayaran:

💳 **E-Wallet**: DANA, OVO, GoPay, ShopeePay
🏦 **Transfer Bank**: BRI, SeaBank

Semua ke nomor/rekening: **082291220759** a.n. DoneFast

Langkah pembayaran:
1️⃣ Pilih metode pembayaran saat checkout
2️⃣ Transfer sesuai total yang tertera
3️⃣ Upload bukti transfer
4️⃣ Admin akan konfirmasi dalam 5-30 menit

Pembayaran aman dan terverifikasi! 🔒`,
  },
  {
    topic: 'revisi',
    keywords: ['revisi', 'ubah', 'perbaiki', 'salah', 'kurang', 'ganti', 'edit', 'koreksi', 'perubahan'],
    response: `Kebijakan revisi DoneFast:

✅ **2x revisi gratis** untuk setiap order
✏️ Revisi tambahan bisa diajukan dengan biaya mulai Rp 25.000
📅 Revisi harus diajukan dalam **7 hari** setelah hasil dikirim
📝 Revisi sesuai brief awal (perubahan di luar brief dihitung sebagai order baru)

Kami pastikan kamu puas dengan hasilnya! 💪`,
  },
  {
    topic: 'deadline',
    keywords: ['kapan', 'waktu', 'lama', 'selesai', 'cepat', 'deadline', 'durasi', 'express', 'estimasi waktu', 'berapa hari', 'berapa lama'],
    response: `Estimasi pengerjaan DoneFast:

⚡ **Express (24 jam)**: tersedia untuk tugas sederhana (tambahan biaya urgency)
🕐 **Normal (3-7 hari)**: standar pengerjaan
📅 **Panjang (7-30 hari)**: untuk proyek kompleks

Kami menjamin pengerjaan selesai **sebelum deadline**! Timer deadline berjalan setelah pembayaran dikonfirmasi. Kamu bisa pantau progress di dashboard. ⏱️`,
  },
  {
    topic: 'garansi',
    keywords: ['garansi', 'jamin', 'refund', 'uang kembali', 'kualitas', 'hasil', 'puas', 'kecewa', 'plagiarisme', 'plagiat'],
    response: `Garansi DoneFast:

💯 **100% Uang Kembali** jika hasil tidak sesuai brief
🔍 **Cek Plagiarisme** untuk semua tugas akademik
⭐ **Rating Joki 4.8/5** rata-rata
🛡️ **Garansi Keamanan** data dan privasi terjaga

Jika tidak puas, ajukan klaim dalam 7 hari dan kami akan proses refund. Kepuasan kamu adalah prioritas kami! 🎯`,
  },
  {
    topic: 'privasi',
    keywords: ['aman', 'data', 'rahasia', 'privasi', 'privacy', 'keamanan', 'bocor', 'rahasia'],
    response: `Keamanan di DoneFast:

🔒 Data dan tugas kamu dijaga 100% kerahasiaannya
🚫 Kami tidak membagikan info pelanggan ke pihak ketiga
🔐 Komunikasi terenkripsi end-to-end
📋 Joki menandatangani NDA (Non-Disclosure Agreement)
🗑️ File tugas dihapus otomatis 30 hari setelah selesai

Data kamu aman bersama kami! 🛡️`,
  },
  {
    topic: 'cara_order',
    keywords: ['gimana', 'bagaimana', 'cara', 'langkah', 'step', 'order', 'pesan', 'buat pesanan', 'mulai', 'daftar', 'alur', 'panduan', 'tutorial'],
    response: `Panduan Lengkap Cara Order di DoneFast (Sampai Selesai):

1️⃣ **Temukan Layanan** — Buka halaman Marketplace dan cari layanan akademik, coding, atau desain yang kamu butuhkan.
2️⃣ **Isi Detail Order** — Masukkan deskripsi tugas, unggah file referensi, lalu tentukan *deadline* penyelesaiannya.
3️⃣ **Checkout & Bayar** — Halaman checkout akan menjumlahkan tarif. Pilih metode pembayaran (BCA, BRI, SeaBank, e-Wallet) lalu **unggah bukti transfer**.
4️⃣ **Tunggu Konfirmasi** — Status akan 'Menunggu Bayar' hingga Admin memverifikasi dana (max 30 menit). Status pun berubah 'Dikerjakan'.
5️⃣ **Chat & Pantau** — Kami akan meng-assign Joki profesional. Kamu bisa chat interaktif dengan Joki atau Admin dari menu 'Pesanan Saya'.
6️⃣ **Terima Hasil** — Saat Joki mengunggah hasil, status menjadi 'Selesai'. Kamu bisa mereview file dan meminta Revisi gratis maksimal 2x.

Jika semuanya beres, jangan lupa berikan rating Bintang 5! ⭐ Semudah itu. Mau cek layanan sekarang? 🛒`,
  },
  {
    topic: 'joki',
    keywords: ['joki', 'siapa yang kerjakan', 'siapa joki', 'pengerjaa', 'freelancer', 'tim joki', 'profesional donefast', 'ahli donefast', 'expert donefast', 'mengerjakan tugas'],
    response: `Tim joki DoneFast:

👨‍💻 **500+ Profesional Terverifikasi** di berbagai bidang
📋 Setiap joki melewati **seleksi ketat** (tes skill + portfolio review)
⭐ Rating rata-rata **4.8/5** dari 10.000+ order selesai
💬 Kamu bisa **chat langsung** dengan joki yang mengerjakan tugasmu
🎓 Mayoritas berlatar belakang universitas ternama & pengalaman industri

Tim kami siap mengerjakan tugas kamu dengan kualitas terbaik! 💪`,
  },
  {
    topic: 'kontak',
    keywords: ['kontak', 'hubungi', 'cs', 'customer service', 'support', 'admin', 'telepon', 'whatsapp', 'wa', 'email'],
    response: `Hubungi DoneFast:

📱 **WhatsApp**: +62 859-9800-6060 (fast response!)
💬 **Chat AI**: kamu sedang menggunakannya sekarang! 😄
🕐 **Jam Operasional**: 24/7 — kami selalu online!

Untuk konfirmasi pembayaran atau pertanyaan urgensyilakan langsung chat via WhatsApp ya! 🙏`,
  },
  {
    topic: 'promo',
    keywords: ['promo', 'diskon', 'voucher', 'kupon', 'potongan', 'gratis', 'bonus', 'referral', 'cashback'],
    response: `Promo DoneFast saat ini:

🎉 **WELCOME20** — Diskon 20% untuk order pertama kamu!
👫 **Referral Program** — Ajak teman, dapat bonus saldo Rp 25.000 per teman
🔥 **Promo Reguler** — Cek halaman marketplace untuk promo terbaru

Jangan lupa masukkan kode voucher saat checkout ya! 🎁`,
  },
  {
    topic: 'layanan',
    keywords: ['layanan', 'jasa', 'service', 'apa saja', 'kategori', 'macam', 'jenis', 'tersedia', 'bisa apa'],
    response: `Layanan yang tersedia di DoneFast:

📚 **Akademik** — Makalah, skripsi, essay, jurnal, presentasi, tugas kuliah
🏗️ **Arsitektur & Desain** — Desain 3D, denah, rendering, interior, gambar teknis
💻 **Coding & Web** — Website, mobile app, tugas pemrograman, database, API
💬 **Konsultasi** — Konsultasi akademik, bisnis, karir, mentoring 1-on-1
🤖 **AI & Teknologi** — Machine learning, data science, automation, bot

Kunjungi halaman Marketplace untuk melihat semua layanan lengkap! 🛒`,
  },
  {
    topic: 'akun',
    keywords: ['akun', 'daftar', 'register', 'login', 'masuk', 'password', 'lupa password', 'profil', 'setting'],
    response: `Info akun DoneFast:

📝 **Daftar**: gratis dan cepat — cukup isi nama, email, dan password
🔑 **Login**: masuk dengan email & password, atau Google
👤 **Profil**: atur nama, foto, dan nomor HP di menu Pengaturan
🔒 **Lupa Password**: klik "Lupa Password" di halaman login

Belum punya akun? Daftar gratis sekarang di halaman Register! 🚀`,
  },
  {
    topic: 'status_order',
    keywords: ['status', 'tracking', 'order saya', 'pesanan saya', 'cek order', 'progress', 'sampai mana', 'udah selesai'],
    response: `Cek status order kamu:

📋 Login → klik **"Pesanan Saya"** di navbar atau dashboard
🔍 Kamu bisa lihat status real-time: Pending → Dikerjakan → Selesai
💬 Chat langsung dengan joki untuk tanya progress
📬 Kamu akan dapat notifikasi saat ada update

Status order selalu bisa dipantau kapan saja! 📊`,
  },
  {
    topic: 'tentang',
    keywords: ['tentang', 'about', 'apa itu', 'donefast', 'platform', 'penjelasan'],
    response: `**DoneFast** adalah Platform Jasa Digital #1 Indonesia! 🇮🇩

🎯 **Misi**: membantu mahasiswa & profesional menyelesaikan tugas dengan lebih cepat dan berkualitas
📊 **Statistik**: 10.000+ order selesai, 500+ joki profesional, rating 4.9/5
🏆 **Keunggulan**: harga terjangkau, garansi kualitas, support 24/7

Tugas selesai lebih cepat dari yang kamu bayangkan! ⚡`,
  },
];

// ── Greeting & closing patterns ──
const GREETINGS: { keywords: string[]; response: string }[] = [
  {
    keywords: ['halo', 'hai', 'hi', 'hello', 'hey', 'assalamualaikum', 'selamat pagi', 'selamat siang', 'selamat malam', 'pagi', 'siang', 'malam'],
    response: 'Halo! 👋 Selamat datang di DoneFast AI Assistant. Saya bisa bantu kamu tentang:\n\n📚 Layanan yang tersedia\n💰 Harga & estimasi biaya\n🛒 Cara order\n💳 Metode pembayaran\n🔄 Kebijakan revisi & garansi\n📦 Status pesanan\n\nMau tanya apa? 😊',
  },
  {
    keywords: ['terima kasih', 'makasih', 'thanks', 'thx', 'thank', 'tq', 'tengkyu'],
    response: 'Sama-sama! 😊 Senang bisa membantu. Kalau ada pertanyaan lain seputar DoneFast, jangan ragu untuk bertanya ya! 🙌',
  },
  {
    keywords: ['bye', 'dadah', 'sampai jumpa', 'selamat tinggal'],
    response: 'Sampai jumpa! 👋 Jangan lupa cek marketplace kami kalau butuh bantuan. Semoga sukses! 🚀',
  },
];

// ── Scoring function for best match ──
function scoreMatch(message: string, keywords: string[]): number {
  const msgLower = message.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (msgLower.includes(kw)) {
      // Longer keyword match = higher score
      score += kw.length;
      // Exact word match bonus
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(message)) score += 2;
    }
  }
  return score;
}

// ── Format service list for display ──
function formatServiceList(services: { name: string; base_price: number | null; category: string; rating: number | null }[]): string {
  if (services.length === 0) return '';

  const categoryEmoji: Record<string, string> = {
    'AKADEMIK': '📚',
    'ARSITEKTUR': '🏗️',
    'CODING': '💻',
    'KONSULTASI': '💬',
    'AI_TEKNOLOGI': '🤖',
  };

  return '\n\n📋 **Layanan yang tersedia:**\n' + services.slice(0, 5).map(s => {
    const emoji = categoryEmoji[s.category] || '📌';
    const price = s.base_price ? `Rp ${Number(s.base_price).toLocaleString('id-ID')}` : 'Hubungi admin';
    return `${emoji} **${s.name}** — mulai ${price} (⭐ ${s.rating || 'N/A'})`;
  }).join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return apiError('Pesan wajib diisi');
    }

    const msgLower = message.toLowerCase().trim();

    // 1. Check greetings first
    for (const greet of GREETINGS) {
      if (scoreMatch(msgLower, greet.keywords) > 0) {
        return apiSuccess({
          response: greet.response,
          topic: 'greeting',
          suggested_questions: [
            'Layanan apa saja yang tersedia?',
            'Berapa harga layanan?',
            'Bagaimana cara order?',
          ],
          is_ai: true,
        });
      }
    }

    // 2. Score all knowledge base entries
    const scored = KNOWLEDGE_BASE.map(entry => ({
      ...entry,
      score: scoreMatch(msgLower, entry.keywords),
    })).filter(e => e.score > 0).sort((a, b) => b.score - a.score);

    let response = '';
    let topic = 'unknown';
    let appendServices = false;

    if (scored.length > 0) {
      response = scored[0].response;
      topic = scored[0].topic;

      // If asking about layanan/harga, append real services from DB
      if (['layanan', 'harga'].includes(topic)) {
        appendServices = true;
      }
    }

    // 3. Check for specific service name queries from DB
    if (!response || appendServices) {
      try {
        const searchTerms = msgLower
          .replace(/[?!.,]/g, '')
          .split(/\s+/)
          .filter((w: string) => w.length > 2 && !['apa', 'ada', 'yang', 'untuk', 'dari', 'cara', 'mau', 'bisa', 'saya', 'kamu', 'ini', 'itu', 'dan', 'atau'].includes(w));

        if (searchTerms.length > 0) {
          const services = await prisma.service.findMany({
            where: {
              is_active: true,
              OR: searchTerms.map((term: string) => ({
                OR: [
                  { name: { contains: term, mode: 'insensitive' as const } },
                  { description: { contains: term, mode: 'insensitive' as const } },
                ],
              })),
            },
            select: { name: true, base_price: true, category: true, rating: true },
            take: 5,
            orderBy: { total_orders: 'desc' },
          });

          if (services.length > 0) {
            const formattedList = formatServiceList(services.map(s => ({
              ...s,
              base_price: s.base_price ? Number(s.base_price) : null,
              rating: s.rating ? Number(s.rating) : null,
            })));

            if (!response) {
              response = `Berikut layanan yang cocok dengan pencarian kamu:${formattedList}\n\nMau order salah satunya? Kunjungi halaman **Marketplace** untuk detail lengkap! 🛒`;
              topic = 'layanan_search';
            } else {
              response += formattedList;
            }
          }
        }
      } catch {
        // DB query failed, continue with FAQ response
      }
    }

    // 4. Fallback — redirect to relevant topics
    if (!response) {
      response = `Maaf, saya hanya bisa menjawab pertanyaan seputar **DoneFast** ya! 😊

Berikut topik yang bisa saya bantu:
📚 Layanan yang tersedia
💰 Harga & biaya
🛒 Cara order
💳 Pembayaran
🔄 Revisi & garansi
📦 Status pesanan
👤 Akun & registrasi
📞 Kontak admin

Silakan tanya seputar topik di atas, atau langsung hubungi admin via WhatsApp untuk pertanyaan lain! 💬`;
      topic = 'out_of_scope';
    }

    // 5. Generate suggested questions based on topic
    const topicSuggestions: Record<string, string[]> = {
      harga: ['Bagaimana cara order?', 'Metode pembayaran apa saja?', 'Ada promo diskon?'],
      pembayaran: ['Berapa lama konfirmasi?', 'Ada promo apa?', 'Bagaimana cara order?'],
      revisi: ['Apakah ada garansi?', 'Berapa harga layanan?', 'Hubungi admin'],
      deadline: ['Berapa harga layanan?', 'Ada layanan express?', 'Bagaimana cara order?'],
      garansi: ['Kebijakan revisi seperti apa?', 'Apakah data saya aman?', 'Berapa harga layanan?'],
      privasi: ['Apakah ada garansi?', 'Siapa yang mengerjakan tugas?', 'Hubungi admin'],
      cara_order: ['Berapa harga layanan?', 'Metode pembayaran apa saja?', 'Ada promo diskon?'],
      joki: ['Apakah ada garansi?', 'Berapa lama pengerjaan?', 'Berapa harga layanan?'],
      kontak: ['Bagaimana cara order?', 'Berapa harga layanan?', 'Layanan apa saja?'],
      promo: ['Berapa harga layanan?', 'Bagaimana cara order?', 'Metode pembayaran?'],
      layanan: ['Berapa harga layanan?', 'Bagaimana cara order?', 'Ada promo diskon?'],
      layanan_search: ['Bagaimana cara order?', 'Berapa harga layanan?', 'Metode pembayaran?'],
      akun: ['Bagaimana cara order?', 'Layanan apa saja?', 'Hubungi admin'],
      status_order: ['Hubungi admin', 'Kebijakan revisi?', 'Apakah ada garansi?'],
      tentang: ['Layanan apa saja?', 'Berapa harga layanan?', 'Bagaimana cara order?'],
      out_of_scope: ['Layanan apa saja yang tersedia?', 'Berapa harga layanan?', 'Bagaimana cara order?'],
    };

    return apiSuccess({
      response,
      topic,
      suggested_questions: topicSuggestions[topic] || ['Layanan apa saja?', 'Berapa harga layanan?', 'Cara order?'],
      is_ai: true,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return apiError('Internal server error', 500);
  }
}
