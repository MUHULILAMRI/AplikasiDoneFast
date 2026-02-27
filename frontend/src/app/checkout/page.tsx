'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { apiGetOrder, apiCreatePayment, apiGetSettings } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import {
  QrCode, Wallet, Building, CheckCircle2,
  Shield, Clock, ArrowLeft, Copy, Upload,
  MessageCircle, Image as ImageIcon, X, CreditCard
} from 'lucide-react';

const PHONE_NUMBER = '082291220759';
const WA_ADMIN = '6285998006060'; // for WhatsApp link

const ICONS: Record<string, any> = {
  Wallet, Building, QrCode, CreditCard
};

interface Transaction {
  id: string;
  payment_status: string;
  payment_method: string;
  payment_url?: string;
}

interface OrderData {
  id: string;
  order_number: string;
  title: string;
  price: number;
  discount: number;
  status: string;
  service?: { name: string };
  transactions?: Transaction[];
}

function CheckoutForm() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!orderId) { setLoading(false); return; }

      const [orderRes, settingsRes] = await Promise.all([
        apiGetOrder(orderId),
        apiGetSettings()
      ]);

      if (orderRes.success) {
        const d = orderRes.data as any;
        setOrder({
          id: d.id as string,
          order_number: d.order_number as string,
          title: d.title as string,
          price: Number(d.price),
          discount: Number(d.discount ?? 0),
          status: d.status as string,
          service: d.service,
          transactions: d.transactions,
        });

        // Check if proof was already submitted (pending transaction exists)
        if (d.transactions && d.transactions.length > 0) {
          const hasPending = d.transactions.some((tx: any) => tx.payment_status === 'PENDING');
          if (hasPending) {
            setIsSubmitted(true);
          }
        }
      }

      if (settingsRes.success) {
        const data = settingsRes.data as Record<string, string>;
        if (data.payment_methods) {
          try {
            const parsed = JSON.parse(data.payment_methods);
            setPaymentMethods(parsed);
            if (parsed.length > 0) setSelectedMethod(parsed[0].id);
          } catch (e) { }
        }
      }

      setLoading(false);
    }
    loadData();
  }, [orderId]);

  const orderTotal = order ? order.price - order.discount : 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setProofPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setProofFile(null);
    setProofPreview(null);
  };

  const handleSubmitProof = async () => {
    if (!order || !proofFile) return;
    setIsSubmitting(true);

    try {
      // 1. Upload to Supabase Storage
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${order.order_number}-${Date.now()}.${fileExt}`;
      const filePath = `payments/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payments')
        .upload(filePath, proofFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payments')
        .getPublicUrl(filePath);

      // 3. Create payment record with proof_url
      const res = await apiCreatePayment({
        order_id: order.id,
        payment_method: selectedMethod.toUpperCase(),
        proof_url: publicUrl,
      });

      if (!res.success) throw new Error(res.error);

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Upload proof error:', err);
      alert('Gagal mengirim bukti: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const waLink = order
    ? `https://wa.me/${WA_ADMIN}?text=${encodeURIComponent(
      `Halo Admin DoneFast, saya ingin menanyakan status order saya:\n\nOrder: ${order.order_number}\nLayanan: ${order.service?.name || order.title}\nStatus: ${order.status}`
    )}`
    : '#';

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

  if (!order || order.status === 'CANCELLED') {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-3">{order?.status === 'CANCELLED' ? 'Order Dibatalkan' : 'Order tidak ditemukan'}</h1>
            <Link href="/marketplace" className="text-primary-light hover:underline">
              Kembali ke Marketplace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── NEW: Already Paid State ──
  if (['PAID', 'IN_PROGRESS', 'REVISION', 'COMPLETED'].includes(order.status)) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md mx-auto text-center px-4">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Pesanan Sudah Dibayar! 🎉</h1>
            <p className="text-muted mb-8">
              Pembayaran untuk order <span className="text-foreground font-mono">{order.order_number}</span> telah kami terima dan diverifikasi.
            </p>
            <div className="space-y-3">
              <Link href="/orders" className="block w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                Lihat Progress Pesanan
              </Link>
              <Link href="/" className="block w-full px-6 py-3 bg-surface-2 border border-border text-foreground rounded-xl hover:border-primary/30 transition-colors">
                Kembali ke Home
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // ── NEW: Waiting for Quote State ──
  if (order.status === 'WAITING_FOR_QUOTE') {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl mx-auto text-center px-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-primary-light animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Tugas Anda Sedang Ditinjau Admin 🧐</h1>
            <p className="text-muted mb-6">
              Admin sedang meninjau detail tugas <span className="text-foreground font-medium">{order.title}</span> untuk menentukan harga final yang paling kompetitif bagi Anda.
            </p>

            <div className="glass p-6 rounded-2xl mb-8 text-left border-primary/20 bg-primary/5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent-green" />
                Langkah Selanjutnya:
              </h3>
              <ul className="space-y-3 text-sm text-muted">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>Admin meninjau materi dan tingkat kesulitan tugas Anda.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>Anda akan menerima notifikasi / WhatsApp jika harga sudah ditentukan.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>Anda dapat kembali ke halaman ini untuk melakukan pembayaran.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat Admin Sekarang
              </a>
              <Link href="/dashboard/customer/orders" className="flex-1 px-6 py-3 bg-surface-2 border border-border text-foreground rounded-xl font-medium hover:border-primary/30 transition-all">
                Cek Status Order
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // ── Success: Waiting for admin confirmation ──
  if (isSubmitted) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto text-center px-4"
          >
            <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Bukti Pembayaran Terkirim! ⏳</h1>
            <p className="text-muted mb-2">Order ID: <span className="text-foreground font-mono">{order.order_number}</span></p>
            <p className="text-muted mb-6">
              Bukti pembayaran kamu sedang diperiksa oleh admin. Konfirmasi biasanya membutuhkan waktu <span className="text-foreground font-medium">5–30 menit</span>.
            </p>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
              <p className="text-sm text-muted">
                💬 Ingin konfirmasi lebih cepat? Hubungi admin langsung via WhatsApp!
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat Admin via WhatsApp
              </a>
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard/customer/orders"
                className="block w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Lihat Order Saya
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

  const selectedPayment = paymentMethods.find(m => m.id === selectedMethod);

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
            {/* Left: Payment Flow */}
            <div className="lg:col-span-3 space-y-6">

              {/* Step 1: Pilih Metode */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-primary-light text-white text-xs flex items-center justify-center font-bold">1</span>
                  Transfer ke Rekening
                </h2>
                <p className="text-sm text-muted mb-5 ml-9">Pilih metode lalu transfer sejumlah <span className="text-foreground font-bold">{formatCurrency(orderTotal)}</span></p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${selectedMethod === method.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border bg-surface-2 hover:border-primary/30'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${method.color || 'from-gray-500 to-gray-400'} flex items-center justify-center`}>
                        {(() => {
                          const IconComp = ICONS[method.icon] || Wallet;
                          return <IconComp className="w-5 h-5 text-white" />;
                        })()}
                      </div>
                      <span className="text-xs font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>

                {/* Payment details - Virtual Card Design */}
                <AnimatePresence mode="wait">
                  {selectedPayment && (
                    <motion.div
                      key={selectedMethod}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 relative overflow-hidden rounded-2xl"
                    >
                      {/* Card Background Glow & Gradient */}
                      <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${selectedPayment.color || 'from-primary to-accent'} blur-xl`} />
                      <div className="relative p-6 bg-surface-2/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl">

                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl" />

                        <div className="relative z-10 flex items-center justify-between mb-6">
                          <div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Penerima Dana</p>
                            <p className="font-semibold text-foreground flex items-center gap-2">
                              {(() => {
                                const IconComp = ICONS[selectedPayment.icon] || Wallet;
                                return <IconComp className="w-4 h-4 text-primary-light" />;
                              })()}
                              {selectedPayment.label}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${selectedPayment.color || 'from-gray-500 to-gray-400'} text-white shadow-sm`}>
                            Verified
                          </div>
                        </div>

                        <div className="relative z-10 space-y-1 mb-6">
                          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Nomor Rekening / Virtual Account</p>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="font-mono font-black text-2xl tracking-wider text-foreground drop-shadow-sm">
                              {selectedPayment.number.replace(/(\d{4})/g, '$1 ').trim()}
                            </p>
                            <button
                              onClick={() => handleCopy(selectedPayment.number)}
                              className="group flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:scale-95"
                            >
                              <Copy className="w-3.5 h-3.5 group-hover:animate-bounce" />
                              {copied ? 'Tersalin!' : 'Salin Nomor'}
                            </button>
                          </div>
                          <p className="text-xs font-medium text-muted mt-2 border-l-2 border-primary/30 pl-2">
                            a.n. <span className="text-foreground">
                              {selectedPayment.label.toLowerCase().includes('seabank')
                                ? 'RESKI ANUGRAH SARI'
                                : 'MUH. ULIL AMRI'}
                            </span>
                          </p>
                        </div>

                        <div className="relative z-10 mt-6 pt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Total Tagihan (Wajib Pas)</p>
                            <p className="font-black text-lg text-accent-green">{formatCurrency(orderTotal)}</p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-medium text-yellow-500/80 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                            <Clock className="w-3.5 h-3.5" />
                            Bayar sebelum 1x24 jam
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Step 2: Upload Bukti */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-primary-light text-white text-xs flex items-center justify-center font-bold">2</span>
                  Upload Bukti Pembayaran
                </h2>
                <p className="text-sm text-muted mb-5 ml-9">Screenshot bukti transfer kamu</p>

                {!proofFile ? (
                  <label
                    htmlFor="proof-upload"
                    className="group flex flex-col items-center gap-4 p-10 border-2 border-dashed border-primary/30 bg-primary/5 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/10 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Animated gradient pulse background */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="w-16 h-16 rounded-full bg-surface shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:shadow-primary/20 transition-all duration-300 z-10 relative">
                      <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-20" />
                      <Upload className="w-8 h-8 text-primary group-hover:-translate-y-1 transition-transform" />
                    </div>

                    <div className="text-center z-10 relative">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">Unggah Bukti Transfer</h3>
                      <p className="text-xs text-muted font-medium mt-1">Klik atau *drag-and-drop* file ke area ini</p>
                      <div className="flex items-center justify-center gap-2 mt-3 text-[10px] font-bold text-muted uppercase tracking-widest">
                        <span className="bg-surface-2 px-2 py-0.5 rounded border border-border/50">JPG</span>
                        <span className="bg-surface-2 px-2 py-0.5 rounded border border-border/50">PNG</span>
                        <span className="bg-surface-2 px-2 py-0.5 rounded border border-border/50">PDF</span>
                        <span>(Max: 5MB)</span>
                      </div>
                    </div>

                    <input
                      id="proof-upload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    {proofPreview && (
                      <div className="relative rounded-xl overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={proofPreview} alt="Bukti pembayaran" className="w-full max-h-64 object-contain bg-surface-2" />
                        <button
                          onClick={removeFile}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3 p-3 bg-surface-2 rounded-xl border border-border">
                      <ImageIcon className="w-5 h-5 text-primary-light" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{proofFile.name}</p>
                        <p className="text-xs text-muted">{(proofFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <span className="text-xs text-green-400 font-medium">✓ Siap</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmitProof}
                  disabled={!proofFile || isSubmitting}
                  className="w-full mt-5 px-6 py-4 bg-gradient-to-r from-accent-green to-emerald-500 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mengirim Bukti...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Kirim Bukti Pembayaran
                    </>
                  )}
                </button>
              </div>

              {/* Alternative: Chat Admin */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  Atau Konfirmasi via WhatsApp
                </h2>
                <p className="text-sm text-muted mb-4">
                  Sudah transfer? Kamu juga bisa langsung kirim bukti dan konfirmasi ke admin via WhatsApp.
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat Admin WhatsApp
                </a>
              </div>
            </div>

            {/* Right: Order Summary (Receipt Style) */}
            <div className="lg:col-span-2">
              <div className="sticky top-28">
                <div className="relative p-6 bg-surface-2/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden">
                  {/* Decorative Ticket Edges (Receipt Look) */}
                  <div className="absolute -left-4 top-1/2 w-8 h-8 bg-background rounded-full border-r border-border/50" />
                  <div className="absolute -right-4 top-1/2 w-8 h-8 bg-background rounded-full border-l border-border/50" />
                  <div className="absolute left-6 right-6 top-1/2 border-t-2 border-dashed border-border/40" />

                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Ringkasan</span> Order
                  </h3>

                  <div className="space-y-4 mb-8">
                    <div className="p-4 bg-background/50 rounded-2xl border border-border/50">
                      <p className="text-sm font-bold text-foreground mb-1">{order.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary-light text-[10px] font-bold rounded uppercase tracking-wider">
                          {order.service?.name || 'Layanan'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 px-1 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted font-medium">Subtotal</span>
                        <span className="font-semibold">{formatCurrency(order.price)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between items-center text-accent-green">
                          <span className="font-medium">Diskon</span>
                          <span className="font-bold">-{formatCurrency(order.discount)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spacer for dashed line */}
                  <div className="h-8" />

                  <div className="px-1 mb-8">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-bold text-muted">Total Pembayaran</span>
                    </div>
                    <div className="flex justify-end">
                      <div className="relative">
                        <span className="absolute -inset-2 bg-primary/20 blur-lg rounded-full animate-pulse" />
                        <span className="relative text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary-light">
                          {formatCurrency(orderTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-background/50 rounded-2xl border border-border/50 mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Order ID</p>
                      <p className="font-mono text-xs font-bold">{order.order_number}</p>
                    </div>
                    <QrCode className="w-8 h-8 text-muted/30" />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface hover:bg-surface-2 transition-colors border border-transparent hover:border-border/50 cursor-default">
                      <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                        <Shield className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Garansi 100% Aman</p>
                        <p className="text-[10px] text-muted">Dana ditahan hingga order selesai.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface hover:bg-surface-2 transition-colors border border-transparent hover:border-border/50 cursor-default">
                      <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
                        <Clock className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Verifikasi Cepat</p>
                        <p className="text-[10px] text-muted">Konfirmasi admin dalam 5–30 menit.</p>
                      </div>
                    </div>
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
