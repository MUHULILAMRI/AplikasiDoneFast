// ============================================
// POST /api/payment/create — create payment transaction
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ('error' in auth) return auth.error;

    const body = await req.json();
    const { order_id, payment_method, proof_url } = body;

    if (!order_id || !payment_method) {
      return apiError('Order ID dan metode pembayaran wajib diisi');
    }

    // 1. Ambil list payment method dari Settings supaya validasi dinamis
    const settingRow = await prisma.siteSettings.findUnique({ where: { key: 'payment_methods' } });
    let validPaymentMethods: any[] = [];
    if (settingRow) {
      try { validPaymentMethods = JSON.parse(settingRow.value); } catch (e) { }
    } else {
      // fallback
      try {
        const jsonFallback = `[
          {"id":"dana","label":"DANA","icon":"Wallet","number":"082291220759","color":"from-blue-500 to-cyan-500"},
          {"id":"ovo","label":"OVO","icon":"Wallet","number":"082291220759","color":"from-purple-600 to-purple-400"},
          {"id":"gopay","label":"GoPay","icon":"Wallet","number":"082291220759","color":"from-green-500 to-emerald-500"},
          {"id":"shopeepay","label":"ShopeePay","icon":"Wallet","number":"082291220759","color":"from-orange-500 to-red-500"},
          {"id":"bank_bca","label":"Bank BCA","icon":"Building","number":"082291220759","color":"from-blue-800 to-blue-600"},
          {"id":"bank_bri","label":"Bank BRI","icon":"Building","number":"082291220759","color":"from-blue-600 to-blue-400"},
          {"id":"seabank","label":"SeaBank","icon":"Building","number":"082291220759","color":"from-teal-500 to-cyan-500"}
        ]`;
        validPaymentMethods = JSON.parse(jsonFallback);
      } catch (e) { }
    }

    const selectedMethod = validPaymentMethods.find(m => m.id.toUpperCase() === payment_method.toUpperCase() || m.id === payment_method);
    if (!selectedMethod) {
      return apiError('Metode pembayaran tidak valid');
    }

    // Map dynamic method to Prisma Enum ('QRIS' | 'DANA' | 'OVO' | 'BANK_TRANSFER' | 'EWALLET')
    let dbPaymentMethod: 'QRIS' | 'DANA' | 'OVO' | 'BANK_TRANSFER' | 'EWALLET' = 'EWALLET';
    const originalMethodId = selectedMethod.id.toUpperCase();
    if (originalMethodId === 'DANA' || originalMethodId === 'OVO' || originalMethodId === 'QRIS') {
      dbPaymentMethod = originalMethodId as 'QRIS' | 'DANA' | 'OVO';
    } else if (selectedMethod.icon === 'Building') {
      dbPaymentMethod = 'BANK_TRANSFER';
    } else {
      dbPaymentMethod = 'EWALLET';
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: order_id }, { order_number: order_id }],
        user_id: auth.user.userId,
        status: 'PENDING_PAYMENT',
      },
    });

    if (!order) {
      return apiError('Order tidak ditemukan atau sudah dibayar', 404);
    }

    // Check for existing pending transaction
    const existingTx = await prisma.transaction.findFirst({
      where: { order_id: order.id, payment_status: 'PENDING' },
    });
    if (existingTx) {
      return apiSuccess({
        transaction: existingTx,
        payment_info: generatePaymentInfo(payment_method, Number(order.price)),
      });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        order_id: order.id,
        user_id: auth.user.userId,
        amount: order.price,
        payment_method: dbPaymentMethod,
        payment_url: proof_url,
        external_id: `PAY-${Date.now()}-${selectedMethod.id}`,
      },
    });

    return apiSuccess(
      {
        transaction,
        payment_info: generatePaymentInfo(payment_method, Number(order.price)),
      },
      201
    );
  } catch (error) {
    console.error('Create payment error:', error);
    return apiError('Internal server error', 500);
  }
}

function generatePaymentInfo(method: string, amount: number) {
  switch (method) {
    case 'QRIS':
      return {
        type: 'qris',
        qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=DONEFAST-${amount}`,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
    case 'BANK_TRANSFER':
      return {
        type: 'bank_transfer',
        banks: [
          { bank: 'BRI', account_number: '082291220759', account_name: 'DoneFast' },
          { bank: 'SeaBank', account_number: '082291220759', account_name: 'DoneFast' },
        ],
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    case 'DANA':
    case 'OVO':
    case 'GOPAY':
    case 'SHOPEEPAY':
    case 'EWALLET':
      return {
        type: 'ewallet',
        phone_number: '082291220759',
        redirect_url: `https://simulator.sandbox.midtrans.com/v2/pay`,
        deeplink: `${method.toLowerCase()}://pay?amount=${amount}`,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
    default:
      return { type: 'unknown' };
  }
}
