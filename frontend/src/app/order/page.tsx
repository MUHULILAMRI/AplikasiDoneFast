'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { apiGetService, apiGetServices, apiCreateOrder, apiGetSettings } from '@/lib/api';
import { formatCurrency, estimatePrice, getCategoryLabel } from '@/lib/utils';
import {
  Upload, Calendar, FileText, ArrowRight, ArrowLeft,
  Zap, Shield, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import type { Service } from '@/types';

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
          const s = res.data as any;
          setService({
            id: s.id,
            name: s.name,
            description: s.description,
            category: s.category.toLowerCase() as Service['category'],
            base_price: Number(s.base_price),
            rating: s.rating,
            total_orders: s.total_orders,
            estimated_days: s.estimated_days,
            features: s.features,
            is_popular: s.is_popular,
            is_active: s.is_active,
          });
          loaded = true;
        }
      }
      if (!loaded) {
        const all = await apiGetServices();
        if (all.success && (all.data as any).services?.length > 0) {
          const s = (all.data as any).services[0];
          setService({
            id: s.id,
            name: s.name,
            description: s.description,
            category: s.category.toLowerCase() as Service['category'],
            base_price: Number(s.base_price),
            rating: s.rating,
            total_orders: s.total_orders,
            estimated_days: s.estimated_days,
            features: s.features,
            is_popular: s.is_popular,
            is_active: s.is_active,
          });
        }
      }
      setLoadingService(false);
    }
    load();
    apiGetSettings().then(res => {
      if (res.success) setSiteSettings(res.data as Record<string, string>);
    });
  }, [serviceId]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    urgency_level: 'STANDAR' as 'STANDAR' | 'KILAT' | 'SUPER_KILAT',
    deadline: '',
    has_journal: true,
    files: [] as File[],
    voucher: '',
  });

  const isSkripsi = service?.name?.toLowerCase().includes('skripsi');

  const priceEstimate = service ? estimatePrice({
    urgency_level: formData.urgency_level,
    has_journal: formData.has_journal,
    category: service.category,
    service_name: service.name,
    settings: siteSettings || undefined,
  }) : { base_price: 0, urgency_multiplier: 1, journal_surcharge: 0, tax_amount: 0, total: 0 };

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

      const res = await apiCreateOrder({
        service_id: service.id,
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements || '-',
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
        files: uploadedFileUrls,
        status: 'WAITING_FOR_QUOTE',
        has_journal: isSkripsi ? formData.has_journal : null,
        urgency_level: formData.urgency_level,
        price: priceEstimate.total,
      });

      if (res.success) {
        const order = res.data as any;
        window.location.href = `/checkout?order_id=${order.id}`;
      } else {
        alert((res as any).error || 'Gagal membuat order');
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <Link href="/marketplace" className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Marketplace
            </Link>
            <h1 className="text-3xl font-bold mb-2">
              Request Joki <span className="gradient-text">{service.name}</span>
            </h1>
            <p className="text-muted">Lengkapi detail tugas Anda agar Admin dapat memberikan harga terbaik.</p>
          </motion.div>

          <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2">
            {['Detail', 'Parameter', 'Deadline', 'Review'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i + 1 ? 'bg-accent-green text-white' : step === i + 1 ? 'bg-gradient-to-r from-primary to-primary-light text-white' : 'bg-surface-2 text-muted border border-border'}`}>
                  {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm ${step === i + 1 ? 'text-foreground font-medium' : 'text-muted'}`}>{label}</span>
                {i < 3 && <div className="w-8 sm:w-16 h-px bg-border" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 sm:p-8">
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-light" />
                      Detail Tugas
                    </h2>
                    <div>
                      <label className="block text-sm font-medium mb-2">Judul Tugas *</label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Masukkan judul tugas..." className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Deskripsi Lengkap *</label>
                      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Jelaskan instruksi tugas sejelas mungkin..." rows={6} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-6">Parameter & Dokumen</h2>
                    {isSkripsi && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                        <label className="block text-sm font-medium mb-3">Jurnal Referensi?</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setFormData({ ...formData, has_journal: true })} className={`py-3 rounded-xl border font-medium transition-all ${formData.has_journal ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface-2 border-border text-muted hover:border-primary/30'}`}>Sudah Ada</button>
                          <button onClick={() => setFormData({ ...formData, has_journal: false })} className={`py-3 rounded-xl border font-medium transition-all ${!formData.has_journal ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-surface-2 border-border text-muted hover:border-orange-500/30'}`}>Belum Ada</button>
                        </div>
                        <p className="text-[11px] text-muted mt-3">💡 Admin akan mencarikan referensi jurnal jika Anda belum memiliki.</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-3">Upload File Pendukung</label>
                      <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
                        <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.png,.zip,.rar" />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="w-10 h-10 text-muted mx-auto mb-3" />
                          <p className="text-sm font-medium">Klik atau geser file ke sini</p>
                        </label>
                      </div>
                      {formData.files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {formData.files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-surface-2 rounded-lg border border-border">
                              <span className="text-xs truncate max-w-[180px]">{file.name}</span>
                              <button onClick={() => removeFile(i)} className="text-red-400 text-xs font-bold">X</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-6">Urgensi & Deadline</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'STANDAR', label: 'Standar', icon: Clock, color: 'text-blue-400' },
                        { id: 'KILAT', label: 'Kilat', icon: Zap, color: 'text-yellow-400' },
                        { id: 'SUPER_KILAT', label: 'Super Kilat', icon: Zap, color: 'text-red-400' },
                      ].map((u) => (
                        <button key={u.id} onClick={() => setFormData({ ...formData, urgency_level: u.id as any })} className={`p-4 rounded-xl border transition-all ${formData.urgency_level === u.id ? 'bg-primary/10 border-primary' : 'bg-surface-2 border-border'}`}>
                          <u.icon className={`w-6 h-6 mx-auto mb-2 ${u.color}`} />
                          <p className="text-xs font-bold text-center">{u.label}</p>
                        </button>
                      ))}
                    </div>
                    <div className="pt-4">
                      <label className="block text-sm font-medium mb-2">Tentukan Deadline Selesai</label>
                      <input type="datetime-local" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50 transition-colors" />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6 text-center">
                    <CheckCircle2 className="w-16 h-16 text-accent-green mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">Tinjau Permintaan</h2>
                    <p className="text-sm text-muted">Admin DoneFast akan meninjau permintaan Anda dan memberikan harga final melalui Dashboard / WhatsApp Anda.</p>
                    <div className="p-4 bg-surface-2 rounded-xl border border-border text-left">
                      <p className="text-xs text-muted mb-2 uppercase font-bold tracking-widest">Ringkasan:</p>
                      <p className="text-sm"><strong>Judul:</strong> {formData.title}</p>
                      <p className="text-sm"><strong>Urgensi:</strong> {formData.urgency_level}</p>
                      {isSkripsi && <p className="text-sm"><strong>Jurnal:</strong> {formData.has_journal ? 'Ya' : 'Tidak'}</p>}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  {step > 1 ? (
                    <button onClick={() => setStep(step - 1)} className="px-6 py-2 bg-surface-2 border border-border rounded-xl text-foreground text-sm font-medium">Kembali</button>
                  ) : <div />}
                  {step < 4 ? (
                    <button onClick={() => setStep(step + 1)} className="px-8 py-2 bg-primary text-white rounded-xl font-bold text-sm">Lanjut</button>
                  ) : (
                    <button onClick={handleSubmitOrder} disabled={submitting} className="px-8 py-2 bg-accent-green text-white rounded-xl font-bold disabled:opacity-50 text-sm">
                      {submitting ? 'Mengirim...' : 'Ajukan Penawaran'}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 sticky top-28">
                <h3 className="text-lg font-semibold mb-4">Estimasi Harga AI</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Biaya Dasar</span>
                    <span>{formatCurrency(priceEstimate.base_price)}</span>
                  </div>
                  {priceEstimate.urgency_multiplier > 1 && (
                    <div className="flex justify-between text-sm text-yellow-500">
                      <span>Multiplier Urgensi</span>
                      <span>×{priceEstimate.urgency_multiplier}</span>
                    </div>
                  )}
                  {priceEstimate.journal_surcharge > 0 && (
                    <div className="flex justify-between text-sm text-orange-400">
                      <span>Cari Jurnal</span>
                      <span>+{formatCurrency(priceEstimate.journal_surcharge)}</span>
                    </div>
                  )}
                  <hr className="border-border" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Est. Total</span>
                    <span className="text-primary-light">{formatCurrency(priceEstimate.total)}</span>
                  </div>
                </div>
                <div className="p-3 bg-surface-2 rounded-xl border border-border text-[10px] text-muted flex gap-2">
                  <AlertCircle className="w-4 h-4 text-accent flex-shrink-0" />
                  Ini adalah estimasi awal. Harga final akan dikirimkan oleh Admin.
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <OrderForm />
    </Suspense>
  );
}
