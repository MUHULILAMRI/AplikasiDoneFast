// ============================================
// POST /api/ai/estimate-price — AI-powered price estimation
// POST /api/ai/recommend — service recommendations
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/auth';

// POST /api/ai/estimate-price
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { service_id, difficulty, pages, deadline, description } = body;

    if (!service_id) {
      return apiError('Service ID wajib diisi');
    }

    const service = await prisma.service.findUnique({ where: { id: service_id } });
    if (!service) return apiError('Layanan tidak ditemukan', 404);

    const basePrice = Number(service.base_price);

    // Difficulty multiplier
    const diffMultipliers: Record<string, number> = {
      EASY: 0.8,
      MEDIUM: 1.0,
      HARD: 1.3,
      EXPERT: 1.5,
    };
    const diffMultiplier = diffMultipliers[difficulty || 'MEDIUM'] || 1.0;

    // Deadline urgency multiplier
    let deadlineMultiplier = 1.0;
    if (deadline) {
      const daysUntil = Math.ceil(
        (new Date(deadline).getTime() - Date.now()) / 86400000
      );
      if (daysUntil <= 1) deadlineMultiplier = 1.5;
      else if (daysUntil <= 3) deadlineMultiplier = 1.3;
      else if (daysUntil <= 7) deadlineMultiplier = 1.1;
    }

    // Pages cost
    const pagesCost = (pages || 0) * 15000;

    // Complexity score from description (simple keyword analysis)
    let complexityBonus = 0;
    if (description) {
      const complexWords = [
        'machine learning', 'deep learning', 'neural network', 'statistical analysis',
        'API integration', 'full stack', 'database design', 'microservices',
        'skripsi', 'disertasi', 'jurnal internasional',
        'autocad', '3d modeling', 'rendering', 'animasi',
      ];
      const matchCount = complexWords.filter(w =>
        description.toLowerCase().includes(w.toLowerCase())
      ).length;
      complexityBonus = matchCount * 25000;
    }

    const subtotal = basePrice * diffMultiplier * deadlineMultiplier + pagesCost + complexityBonus;
    const total = Math.round(subtotal);

    return apiSuccess({
      base_price: basePrice,
      difficulty_multiplier: diffMultiplier,
      deadline_multiplier: deadlineMultiplier,
      pages_cost: pagesCost,
      complexity_bonus: complexityBonus,
      estimated_price: total,
      breakdown: [
        { label: 'Harga dasar', amount: basePrice },
        { label: `Tingkat kesulitan (×${diffMultiplier})`, amount: Math.round(basePrice * (diffMultiplier - 1)) },
        { label: `Urgensi deadline (×${deadlineMultiplier})`, amount: Math.round(basePrice * diffMultiplier * (deadlineMultiplier - 1)) },
        ...(pagesCost > 0 ? [{ label: `Halaman (${pages} × Rp15.000)`, amount: pagesCost }] : []),
        ...(complexityBonus > 0 ? [{ label: 'Bonus kompleksitas', amount: complexityBonus }] : []),
      ],
      confidence: 0.85,
      estimated_days: service.estimated_days,
    });
  } catch (error) {
    console.error('Price estimation error:', error);
    return apiError('Internal server error', 500);
  }
}
