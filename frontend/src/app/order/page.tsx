'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { apiGetService, apiGetServices, apiCreateOrder, apiEstimatePrice, apiGetSettings } from '@/lib/api';
import { formatCurrency, estimatePrice, getCategoryLabel } from '@/lib/utils';
import {
  Upload, Calendar, FileText, ArrowRight, ArrowLeft,
  Zap, Shield, Clock, Star, CheckCircle2, AlertCircle
} from 'lucide-react';
import type { DifficultyLevel, Service } from '@/types';

function OrderForm() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [siteSettings, setSiteSettings] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    async function load() {
      setLoadingService(true);
      let loaded = false;
      if (serviceId) {
        const res = await apiGetService(serviceId);
        if (res.success) {
          const s = res.data as Record<string, unknown>;
          setService({
            id: s.id as string,
            name: s.name as string,
            description: s.description as string,
            category: (s.category as string).toLowerCase() as Service['category'],
            base_price: Number(s.base_price),
            rating: s.rating as number,
            total_orders: s.total_orders as number,
            estimated_days: s.estimated_days as number,
            image: s.image as string | undefined,
            features: s.features as string[],
            is_popular: s.is_popular as boolean,
            is_active: s.is_active as boolean,
          });
          loaded = true;
        }
      }
      if (!loaded) {
        // Fallback: load first service only if no specific service was loaded
        const all = await apiGetServices();
        if (all.success && (all.data as any).services && (all.data as any).services.length > 0) {
          const s = (all.data as any).services[0];
          setService({
            id: s.id as string,
            name: s.name as string,
            description: s.description as string,
            category: (s.category as string).toLowerCase() as Service['category'],
            base_price: Number(s.base_price),
            rating: s.rating as number,
            total_orders: s.total_orders as number,
            estimated_days: s.estimated_days as number,
            image: s.image as string | undefined,
            features: s.features as string[],
            is_popular: s.is_popular as boolean,
            is_active: s.is_active as boolean,
          });
        }
      }
      setLoadingService(false);
    }
    load();
    // Load pricing settings
    apiGetSettings().then(res => {
      if (res.success) setSiteSettings(res.data as Record<string, string>);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    pages: 1,
    deadline_days: 7,
    deadline: '',
    files: [] as File[],
    voucher: '',
  });

  const priceEstimate = service ? estimatePrice({
    pages: formData.pages,
    deadline_days: formData.deadline_days,
    category: service.category,
    settings: siteSettings || undefined,
  }) : { base_price: 0, deadline_multiplier: 1, pages_cost: 0, tax_amount: 0, total: 0 };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.target.files!)],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmitOrder = async () => {
    if (!service) return;
    setSubmitting(true);

    try {
      // 1. Upload Files first
      const uploadedFileUrls: string[] = [];
      if (formData.files.length > 0) {
        for (const file of formData.files) {
          const uploadData = new FormData();
          uploadData.append('file', file);

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: uploadData,
          });
          const uploadJson = await uploadRes.json();
          if (uploadJson.success) {
            uploadedFileUrls.push(uploadJson.data.url);
          }
        }
      }

      // 2. Create Order
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + formData.deadline_days);

      const res = await apiCreateOrder({
        service_id: service.id,
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements || '-',
        pages: formData.pages,
        deadline: deadline.toISOString(),
        files: uploadedFileUrls, // Pass the array of URLs
        voucher_code: formData.voucher || undefined,
      });

      if (res.success) {
        const order = res.data as Record<string, unknown>;
        window.location.href = `/checkout?order_id=${order.id}`;
      } else {
        alert((res as { error: string }).error || 'Gagal membuat order');
      }
    } catch (err) {
      console.error('Order Submission Error:', err);
      alert('Terjadi kesalahan saat memproses order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingService || !service) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Link href="/marketplace" className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Marketplace
            </Link>
            <h1 className="text-3xl font-bold mb-2">
              Order <span className="gradient-text">{service.name}</span>
            </h1>
            <p className="text-muted">Isi detail tugas kamu dengan lengkap untuk hasil terbaik.</p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-10">
            {['Detail Tugas', 'Upload File', 'Review & Bayar'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i + 1 ? 'bg-accent-green text-white' :
                  step === i + 1 ? 'bg-gradient-to-r from-primary to-primary-light text-white glow-primary' :
                    'bg-surface-2 text-muted border border-border'
                  }`}>
                  {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:block ${step === i + 1 ? 'text-foreground font-medium' : 'text-muted'}`}>
                  {label}
                </span>
                {i < 2 && <div className="flex-1 h-px bg-border" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Area */}
            <div className="lg:col-span-2">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-2xl p-8"
              >
                {/* Step 1: Detail */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-6">Detail Tugas</h2>

                    <div>
                      <label className="block text-sm font-medium mb-2">Judul Tugas *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Contoh: Makalah Ekonomi Makro tentang Inflasi"
                        className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Deskripsi *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Jelaskan secara detail apa yang kamu butuhkan..."
                        rows={4}
                        className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Persyaratan Khusus</label>
                      <textarea
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        placeholder="Format tertentu, referensi, font, dll..."
                        rows={3}
                        className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Jumlah Halaman</label>
                        <input
                          type="number"
                          min={1}
                          max={200}
                          value={formData.pages}
                          onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Deadline (hari)</label>
                        <select
                          value={formData.deadline_days}
                          onChange={(e) => setFormData({ ...formData, deadline_days: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                        >
                          <option value={1}>1 hari (Express)</option>
                          <option value={3}>3 hari</option>
                          <option value={7}>7 hari</option>
                          <option value={14}>14 hari</option>
                          <option value={30}>30 hari</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Upload */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-6">Upload File Pendukung</h2>

                    <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.png,.zip,.rar"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-muted mx-auto mb-4" />
                        <p className="text-foreground font-medium mb-1">
                          Drag & drop atau klik untuk upload
                        </p>
                        <p className="text-sm text-muted">
                          PDF, DOC, PPT, XLS, JPG, PNG, ZIP (maks. 50MB per file)
                        </p>
                      </label>
                    </div>

                    {/* File list */}
                    {formData.files.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">File yang diupload:</h3>
                        {formData.files.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-primary-light" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(i)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-primary-light flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-primary-light mb-1">Tips upload:</p>
                          <ul className="text-muted space-y-1">
                            <li>• Upload brief/instruksi tugas dari dosen</li>
                            <li>• Sertakan contoh format jika ada</li>
                            <li>• File referensi akan mempercepat pengerjaan</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-6">Review Order</h2>

                    <div className="space-y-4">
                      <div className="p-4 bg-surface-2 rounded-xl border border-border">
                        <h3 className="text-sm text-muted mb-1">Layanan</h3>
                        <p className="font-medium">{service.name}</p>
                      </div>
                      <div className="p-4 bg-surface-2 rounded-xl border border-border">
                        <h3 className="text-sm text-muted mb-1">Judul Tugas</h3>
                        <p className="font-medium">{formData.title || '-'}</p>
                      </div>
                      <div className="p-4 bg-surface-2 rounded-xl border border-border">
                        <h3 className="text-sm text-muted mb-1">Deskripsi</h3>
                        <p className="text-sm">{formData.description || '-'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-2 rounded-xl border border-border">
                          <h3 className="text-sm text-muted mb-1">Halaman</h3>
                          <p className="font-medium">{formData.pages}</p>
                        </div>
                        <div className="p-4 bg-surface-2 rounded-xl border border-border">
                          <h3 className="text-sm text-muted mb-1">Deadline</h3>
                          <p className="font-medium">{formData.deadline_days} hari</p>
                        </div>
                      </div>
                      <div className="p-4 bg-surface-2 rounded-xl border border-border">
                        <h3 className="text-sm text-muted mb-1">File</h3>
                        <p className="font-medium">{formData.files.length} file diupload</p>
                      </div>

                      {/* Voucher */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Kode Voucher</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={formData.voucher}
                            onChange={(e) => setFormData({ ...formData, voucher: e.target.value.toUpperCase() })}
                            placeholder="Masukkan kode voucher"
                            className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                          />
                          <button className="px-6 py-3 bg-primary/10 border border-primary/30 text-primary-light rounded-xl hover:bg-primary/20 transition-colors font-medium">
                            Pakai
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  {step > 1 ? (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="flex items-center gap-2 px-6 py-3 bg-surface-2 border border-border rounded-xl text-foreground hover:border-primary/30 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Kembali
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 3 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                      Lanjut
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitOrder}
                      disabled={submitting}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent-green to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity glow-accent disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Bayar {formatCurrency(priceEstimate.total)}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Price Calculator */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 sticky top-28">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Estimasi Harga AI
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Harga dasar</span>
                    <span>{formatCurrency(priceEstimate.base_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Deadline (×{priceEstimate.deadline_multiplier})</span>
                    <span className={priceEstimate.deadline_multiplier > 1 ? 'text-orange-400' : ''}>
                      {priceEstimate.deadline_multiplier > 1 ? '+' : ''}{formatCurrency(priceEstimate.base_price * (priceEstimate.deadline_multiplier - 1))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Biaya halaman ({formData.pages} hal)</span>
                    <span>{formatCurrency(priceEstimate.pages_cost)}</span>
                  </div>
                  {priceEstimate.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Pajak/Admin Fee</span>
                      <span>{formatCurrency(priceEstimate.tax_amount)}</span>
                    </div>
                  )}
                  <hr className="border-border" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="gradient-text">{formatCurrency(priceEstimate.total)}</span>
                  </div>
                </div>

                {/* Service Info */}
                <div className="p-4 bg-surface-2 rounded-xl mb-4">
                  <p className="text-sm font-medium mb-1">{service.name}</p>
                  <p className="text-xs text-muted">{getCategoryLabel(service.category)}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {service.rating} • {service.total_orders}+ order
                  </div>
                </div>

                {/* Trust badges */}
                <div className="space-y-2 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent-green" />
                    <span>Garansi 100% uang kembali</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>Revisi gratis 2x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary-light" />
                    <span>Privasi & keamanan terjamin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderForm />
    </Suspense>
  );
}
