// ============================================
// POST /api/payment/webhook — Midtrans webhook callback
// ============================================
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, payment_type, gross_amount, signature_key } = body;

    // In production: verify signature_key with Midtrans server key
    // const hash = crypto.createHash('sha512')
    //   .update(order_id + status_code + gross_amount + serverKey)
    //   .digest('hex');
    // if (hash !== signature_key) return apiError('Invalid signature', 403);

    if (!order_id || !transaction_status) {
      return apiError('Missing required fields');
    }

    // Find transaction
    const transaction = await prisma.transaction.findFirst({
      where: { external_id: order_id },
      include: { order: true },
    });

    if (!transaction) {
      return apiError('Transaction not found', 404);
    }

    let paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' = 'PENDING';
    let orderStatus = transaction.order.status;

    switch (transaction_status) {
      case 'capture':
      case 'settlement':
        paymentStatus = 'PAID';
        orderStatus = 'PAID';
        break;
      case 'pending':
        paymentStatus = 'PENDING';
        break;
      case 'deny':
      case 'cancel':
      case 'expire':
        paymentStatus = 'FAILED';
        break;
      case 'refund':
      case 'partial_refund':
        paymentStatus = 'REFUNDED';
        break;
    }

    // Update transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        payment_status: paymentStatus,
        paid_at: paymentStatus === 'PAID' ? new Date() : undefined,
      },
    });

    // Update order status if payment is confirmed
    if (paymentStatus === 'PAID' && transaction.order.status === 'PENDING_PAYMENT') {
      await prisma.order.update({
        where: { id: transaction.order.id },
        data: { status: 'PAID' },
      });

      // Notify customer
      await prisma.notification.create({
        data: {
          user_id: transaction.user_id,
          title: 'Pembayaran Berhasil',
          message: `Pembayaran untuk order ${transaction.order.order_number} telah dikonfirmasi.`,
          type: 'PAYMENT',
        },
      });

      // Notify admins
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            user_id: admin.id,
            title: 'Order Baru Dibayar',
            message: `Order ${transaction.order.order_number} telah dibayar. Silakan assign joki.`,
            type: 'PAYMENT',
          },
        });
      }
    }

    return apiSuccess({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return apiError('Internal server error', 500);
  }
}
