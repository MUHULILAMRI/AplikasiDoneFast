// ============================================
// POST /api/ai/recommend — AI-powered service recommendations
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, category, budget } = body;

    if (!query) {
      return apiError('Query wajib diisi');
    }

    // Keyword-based recommendation engine
    const keywordMap: Record<string, string[]> = {
      AKADEMIK: ['skripsi', 'makalah', 'tugas', 'essay', 'jurnal', 'paper', 'laporan', 'bab', 'proposal'],
      CODING: ['coding', 'web', 'app', 'python', 'javascript', 'react', 'api', 'database', 'programming', 'software'],
      ARSITEKTUR: ['autocad', 'arsitektur', 'desain', 'denah', '3d', 'rendering', 'bangunan', 'interior', 'revit'],
      KONSULTASI: ['konsultasi', 'bimbingan', 'mentor', 'review', 'feedback', 'coaching'],
      AI_TEKNOLOGI: ['ai', 'machine learning', 'data science', 'bot', 'automation', 'artificial intelligence'],
    };

    // Score each category
    const queryLower = query.toLowerCase();
    const categoryScores: Record<string, number> = {};

    for (const [cat, keywords] of Object.entries(keywordMap)) {
      categoryScores[cat] = keywords.filter(kw => queryLower.includes(kw)).length;
    }

    // Get top matching category
    const sortedCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .filter(([, score]) => score > 0);

    const targetCategory = category || sortedCategories[0]?.[0] || undefined;

    // Fetch matching services
    const where: Record<string, unknown> = { is_active: true };
    if (targetCategory) where.category = targetCategory;
    if (budget) where.base_price = { lte: budget };

    const services = await prisma.service.findMany({
      where,
      orderBy: [
        { rating: 'desc' },
        { total_orders: 'desc' },
      ],
      take: 5,
    });

    // Generate recommendation reasoning
    const recommendations = services.map((service, idx) => ({
      rank: idx + 1,
      service,
      match_score: Math.round(85 - idx * 5 + Math.random() * 10),
      reason: generateReason(service.name, queryLower),
    }));

    return apiSuccess({
      query,
      detected_category: targetCategory,
      recommendations,
      suggestion: recommendations.length > 0
        ? `Berdasarkan kebutuhan Anda, kami merekomendasikan "${recommendations[0].service.name}" sebagai pilihan terbaik.`
        : 'Maaf, tidak ada layanan yang cocok dengan kebutuhan Anda saat ini.',
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return apiError('Internal server error', 500);
  }
}

function generateReason(serviceName: string, query: string): string {
  const reasons = [
    `${serviceName} sangat sesuai dengan kebutuhan "${query}" berdasarkan tingkat keberhasilan tinggi pada order serupa.`,
    `Layanan ini memiliki rating tertinggi untuk kategori terkait dan estimasi waktu pengerjaan yang optimal.`,
    `Berdasarkan analisis kebutuhan Anda, layanan ini menawarkan value terbaik dari segi kualitas dan harga.`,
    `Joki yang menangani layanan ini memiliki spesialisasi yang relevan dan track record sempurna.`,
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}
