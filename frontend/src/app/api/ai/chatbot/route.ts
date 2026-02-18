// ============================================
// POST /api/ai/chatbot — AI customer service chatbot
// ============================================
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/auth';

const FAQ_RESPONSES: Record<string, string> = {
  harga: 'Harga layanan kami bervariasi tergantung jenis tugas, tingkat kesulitan, dan deadline. Kamu bisa cek estimasi harga di halaman order atau gunakan kalkulator harga otomatis kami. Harga mulai dari Rp 50.000 untuk tugas sederhana.',
  bayar: 'Kami menerima pembayaran via QRIS, DANA, OVO, Transfer Bank (BCA, BNI, BRI, Mandiri), dan E-Wallet lainnya. Semua pembayaran diproses secara aman melalui payment gateway Midtrans.',
  revisi: 'Setiap order mendapat 2x revisi gratis. Revisi tambahan bisa diajukan dengan biaya tambahan. Revisi harus diajukan dalam 7 hari setelah hasil dikirim.',
  deadline: 'Kami menerima deadline mulai dari 24 jam (express) hingga 30 hari. Semakin cepat deadline, ada tambahan biaya urgency. Kami menjamin pengerjaan selesai sebelum deadline.',
  garansi: 'Kami memberikan garansi 100% uang kembali jika hasil tidak sesuai brief. Setiap tugas juga dicek plagiarisme untuk memastikan originalitas. Rating joki kami rata-rata 4.8/5.',
  privasi: 'Data dan tugas kamu dijaga kerahasiaannya. Kami tidak pernah membagikan informasi pelanggan ke pihak ketiga. Semua komunikasi terenkripsi.',
  cara: 'Caranya mudah: 1) Pilih layanan di marketplace, 2) Isi detail tugas dan upload brief, 3) Bayar via metode favoritmu, 4) Tunggu joki mengerjakan, 5) Terima hasil dan review. Proses cepat dan transparan!',
  joki: 'Tim joki kami adalah profesional terverifikasi dengan keahlian di bidangnya. Setiap joki melewati proses seleksi ketat dan memiliki rating yang bisa kamu lihat. Kamu juga bisa chat langsung dengan joki yang mengerjakan tugasmu.',
  kontak: 'Kamu bisa menghubungi kami via: WhatsApp di +6281234567890, Email di support@donefast.id, atau langsung chat di aplikasi. Tim CS kami online 24/7!',
  promo: 'Gunakan kode WELCOME20 untuk diskon 20% order pertamamu! Cek halaman promo untuk voucher terbaru. Ajak teman pakai referral link untuk dapat bonus saldo Rp25.000.',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return apiError('Pesan wajib diisi');
    }

    const msgLower = message.toLowerCase();

    // Match against FAQ
    let response = '';
    let matchedTopic = '';

    for (const [topic, answer] of Object.entries(FAQ_RESPONSES)) {
      if (msgLower.includes(topic)) {
        response = answer;
        matchedTopic = topic;
        break;
      }
    }

    // Additional keyword matching
    if (!response) {
      if (msgLower.match(/berapa|harga|biaya|tarif|cost|mahal|murah/)) {
        response = FAQ_RESPONSES.harga;
        matchedTopic = 'harga';
      } else if (msgLower.match(/bayar|payment|transfer|qris|dana|ovo/)) {
        response = FAQ_RESPONSES.bayar;
        matchedTopic = 'pembayaran';
      } else if (msgLower.match(/ubah|revisi|perbaiki|salah|kurang/)) {
        response = FAQ_RESPONSES.revisi;
        matchedTopic = 'revisi';
      } else if (msgLower.match(/kapan|waktu|lama|selesai|cepat/)) {
        response = FAQ_RESPONSES.deadline;
        matchedTopic = 'deadline';
      } else if (msgLower.match(/aman|data|rahasia|privasi/)) {
        response = FAQ_RESPONSES.privasi;
        matchedTopic = 'privasi';
      } else if (msgLower.match(/gimana|bagaimana|cara|langkah|step/)) {
        response = FAQ_RESPONSES.cara;
        matchedTopic = 'cara order';
      } else if (msgLower.match(/halo|hai|hi|hello|hey/)) {
        response = 'Halo! 👋 Selamat datang di DoneFast. Ada yang bisa saya bantu? Kamu bisa tanya tentang layanan, harga, cara order, atau hal lainnya.';
        matchedTopic = 'greeting';
      } else if (msgLower.match(/terima kasih|makasih|thanks|thx/)) {
        response = 'Sama-sama! 😊 Jangan ragu untuk bertanya lagi ya. Kami siap membantu kapan saja!';
        matchedTopic = 'thanks';
      } else {
        response = 'Maaf, saya belum bisa menjawab pertanyaan itu secara otomatis. 🤔 Mau saya hubungkan dengan tim CS kami? Atau kamu bisa tanya tentang: harga, cara order, pembayaran, revisi, deadline, atau garansi.';
        matchedTopic = 'unknown';
      }
    }

    // Suggest related topics
    const suggestedTopics = Object.keys(FAQ_RESPONSES)
      .filter(t => t !== matchedTopic)
      .slice(0, 3)
      .map(t => {
        const labels: Record<string, string> = {
          harga: 'Berapa harga layanan?',
          bayar: 'Metode pembayaran apa saja?',
          revisi: 'Bagaimana kebijakan revisi?',
          deadline: 'Berapa lama pengerjaan?',
          garansi: 'Apakah ada garansi?',
          privasi: 'Apakah data saya aman?',
          cara: 'Bagaimana cara order?',
          joki: 'Siapa yang mengerjakan?',
          kontak: 'Bagaimana menghubungi CS?',
          promo: 'Ada promo apa saja?',
        };
        return labels[t] || t;
      });

    return apiSuccess({
      response,
      topic: matchedTopic,
      suggested_questions: suggestedTopics,
      is_ai: true,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return apiError('Internal server error', 500);
  }
}
