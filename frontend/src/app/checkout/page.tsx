'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { apiGetOrder, apiCreatePayment, apiVerifyPayment } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { 
  CreditCard, QrCode, Wallet, Building, CheckCircle2, 
  Shield, Clock, ArrowLeft, Copy, Loader2 
} from 'lucide-react';

const paymentMethods = [
  { id: 'qris', label: 'QRIS', icon: QrCode, description: 'Scan QR untuk bayar', color: 'from-purple-500 to-pink-500' },
  { id: 'dana', label: 'DANA', icon: Wallet, description: 'Bayar via DANA', color: 'from-blue-500 to-cyan-500' },
  { id: 'ovo', label: 'OVO', icon: Wallet, description: 'Bayar via OVO', color: 'from-purple-600 to-purple-400' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building, description: 'BCA, BNI, Mandiri, BRI', color: 'from-blue-600 to-blue-400' },
  { id: 'ewallet', label: 'E-Wallet Lain', icon: CreditCard, description: 'GoPay, ShopeePay, dll', color: 'from-green-500 to-emerald-500' },
];

interface OrderData {
  id: string;
  order_number: string;
  title: string;
  price: number;
  discount: number;
  service?: { name: string };
}

function CheckoutForm() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) { setLoading(false); return; }
      const res = await apiGetOrder(orderId);
      if (res.success) {
        const d = res.data as Record<string, unknown>;
        setOrder({
          id: d.id as string,
          order_number: d.order_number as string,
          title: d.title as string,
          price: Number(d.price),
          discount: Number(d.discount ?? 0),
          service: d.service as { name: string } | undefined,
        });
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  const orderTotal = order ? order.price - order.discount : 0;

  const handlePayment = async () => {
    if (!order) return;
    setIsProcessing(true);
    const res = await apiCreatePayment({
      order_id: order.id,
      payment_method: selectedMethod.toUpperCase(),
    });
    if (res.success) {
      setTimeout(async () => {
        const txn = res.data as Record<string, unknown>;
        if (txn.id) {
          await apiVerifyPayment(txn.id as string);
        }
        setIsProcessing(false);
        setIsPaid(true);
      }, 2000);
    } else {
      setIsProcessing(false);
      alert('Gagal memproses pembayaran');
    }
  };

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-3">Order tidak ditemukan</h1>
            <Link href="/marketplace" className="text-primary-light hover:underline">
              Kembali ke Marketplace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (isPaid) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto text-center px-4"
          >
            <div className="w-24 h-24 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-accent-green" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Pembayaran Berhasil! 🎉</h1>
            <p className="text-muted mb-2">Order ID: <span className="text-foreground font-mono">{order.order_number}</span></p>
            <p className="text-muted mb-8">
              Tim kami akan segera mengerjakan order kamu. Kamu bisa tracking progress di dashboard.
            </p>
            <div className="space-y-3">
              <Link
                href={`/tracking?id=${order.id}`}
                className="block w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Tracking Order
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-surface-2 border border-border text-foreground rounded-xl hover:border-primary/30 transition-colors"
              >
                Kembali ke Home
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/order" className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <h1 className="text-3xl font-bold mb-8">
            <span className="gradient-text">Checkout</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-3">
              <div className="glass rounded-2xl p-8">
                <h2 className="text-xl font-semibold mb-6">Pilih Metode Pembayaran</h2>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        selectedMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-surface-2 hover:border-primary/30'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                        <method.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{method.label}</p>
                        <p className="text-xs text-muted">{method.description}</p>
                      </div>
                      <div className="ml-auto">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedMethod === method.id ? 'border-primary' : 'border-border'
                        }`}>
                          {selectedMethod === method.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedMethod === 'qris' && (
                  <div className="mt-6 p-6 bg-white rounded-xl text-center">
                    <div className="w-48 h-48 bg-gray-200 mx-auto mb-4 rounded-lg flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-gray-500" />
                    </div>
                    <p className="text-gray-700 text-sm font-medium">Scan QR Code untuk membayar</p>
                    <p className="text-gray-500 text-xs mt-1">Berlaku 15 menit</p>
                  </div>
                )}

                {selectedMethod === 'bank_transfer' && (
                  <div className="mt-6 space-y-3">
                    <div className="p-4 bg-surface-2 rounded-xl border border-border">
                      <p className="text-xs text-muted mb-1">Bank BCA</p>
                      <div className="flex items-center justify-between">
                        <p className="font-mono font-bold text-lg">8810 2345 6789</p>
                        <button className="p-2 hover:bg-surface rounded-lg transition-colors">
                          <Copy className="w-4 h-4 text-muted" />
                        </button>
                      </div>
                      <p className="text-xs text-muted mt-1">a.n. PT DoneFast Indonesia</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-accent-green to-emerald-500 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memproses Pembayaran...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Bayar {formatCurrency(orderTotal)}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="glass rounded-2xl p-6 sticky top-28">
                <h3 className="text-lg font-semibold mb-4">Ringkasan Order</h3>

                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-surface-2 rounded-xl border border-border">
                    <p className="text-sm font-medium">{order.title}</p>
                    <p className="text-xs text-muted mt-1">{order.service?.name || 'Layanan'}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Subtotal</span>
                      <span>{formatCurrency(order.price)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-accent-green">
                        <span>Diskon</span>
                        <span>-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <hr className="border-border" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="gradient-text">{formatCurrency(orderTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent-green" />
                    Pembayaran aman & terenkripsi
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    Verifikasi otomatis instan
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
