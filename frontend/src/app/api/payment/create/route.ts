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
    const { order_id, payment_method } = body;

    if (!order_id || !payment_method) {
      return apiError('Order ID dan metode pembayaran wajib diisi');
    }

    const validMethods = ['QRIS', 'DANA', 'OVO', 'GOPAY', 'SHOPEEPAY', 'BANK_TRANSFER', 'EWALLET'];
    if (!validMethods.includes(payment_method)) {
      return apiError('Metode pembayaran tidak valid');
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
        payment_method,
        external_id: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
