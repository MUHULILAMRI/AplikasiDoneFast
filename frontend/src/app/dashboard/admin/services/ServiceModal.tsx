'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { apiGetService, apiCreateService, apiUpdateService } from '@/lib/api';
import type { Service, ServiceCategory } from '@/types';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceId?: string | null;
    onSuccess: () => void;
}

export default function ServiceModal({ isOpen, onClose, serviceId, onSuccess }: ServiceModalProps) {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'akademik' as ServiceCategory,
        base_price: 0,
        estimated_days: 3,
        features: [''],
        image: '',
        is_active: true,
        is_popular: false,
    });

    useEffect(() => {
        if (isOpen && serviceId) {
            loadService(serviceId);
        } else if (isOpen) {
            setFormData({
                name: '',
                description: '',
                category: 'akademik',
                base_price: 0,
                estimated_days: 3,
                features: [''],
                image: '',
                is_active: true,
                is_popular: false,
            });
            setErrors({});
        }
    }, [isOpen, serviceId]);

    async function loadService(id: string) {
        setLoading(true);
        try {
            const res = await apiGetService(id);
            if (res.success) {
                const s = res.data as any;
                setFormData({
                    name: s.name,
                    description: s.description,
                    category: s.category.toLowerCase() as ServiceCategory,
                    base_price: Number(s.base_price),
                    estimated_days: s.estimated_days,
                    features: s.features.length > 0 ? s.features : [''],
                    image: s.image || '',
                    is_active: s.is_active,
                    is_popular: s.is_popular,
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const addFeature = () => setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    const removeFeature = (index: number) => setFormData(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
    }));
    const updateFeature = (index: number, val: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = val;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});

        // Simple validation
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Nama layanan wajib diisi';
        if (!formData.description) newErrors.description = 'Deskripsi wajib diisi';
        if (formData.base_price <= 0) newErrors.base_price = 'Harga harus lebih dari 0';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                category: formData.category.toUpperCase(), // Backend expects uppercase for Prisma enum
            };

            const res = serviceId
                ? await apiUpdateService(serviceId, payload)
                : await apiCreateService(payload);

            if (res.success) {
                onSuccess();
                onClose();
            } else {
                alert((res as any).error || 'Terjadi kesalahan');
            }
        } catch (err) {
            console.error(err);
            alert('Gagal menghubungi server');
        } finally {
            setSubmitting(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col z-10"
            >
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-2/50">
                    <h2 className="text-xl font-bold">
                        {serviceId ? 'Edit Layanan' : 'Tambah Layanan Baru'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-muted hover:text-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
                    {loading ? (
                        <div className="py-20 text-center">
                            <RefreshCw className="w-10 h-10 text-primary-light animate-spin mx-auto mb-4" />
                            <p className="text-muted">Memuat data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Nama Layanan *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full px-4 py-3 bg-surface-2 border rounded-xl focus:outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-border focus:border-primary/50'}`}
                                        placeholder="Contoh: Joki Makalah Express"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Deskripsi *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className={`w-full px-4 py-3 bg-surface-2 border rounded-xl focus:outline-none transition-colors resize-none h-24 ${errors.description ? 'border-red-500' : 'border-border focus:border-primary/50'}`}
                                        placeholder="Jelaskan detail layanan..."
                                    />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Kategori</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl focus:outline-none focus:border-primary/50"
                                    >
                                        <option value="akademik">Akademik</option>
                                        <option value="arsitektur">Arsitektur</option>
                                        <option value="coding">Coding</option>
                                        <option value="konsultasi">Konsultasi</option>
                                        <option value="ai_teknologi">AI & Teknologi</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Harga Dasar *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">Rp</span>
                                        <input
                                            type="number"
                                            value={formData.base_price || ''}
                                            onChange={(e) => setFormData({ ...formData, base_price: parseInt(e.target.value) || 0 })}
                                            className={`w-full pl-10 pr-4 py-3 bg-surface-2 border rounded-xl focus:outline-none transition-colors ${errors.base_price ? 'border-red-500' : 'border-border focus:border-primary/50'}`}
                                            placeholder="0"
                                        />
                                    </div>
                                    {errors.base_price && <p className="text-red-500 text-xs mt-1">{errors.base_price}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Estimasi Pengerjaan (Hari)</label>
                                    <input
                                        type="number"
                                        value={formData.estimated_days}
                                        onChange={(e) => setFormData({ ...formData, estimated_days: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl focus:outline-none focus:border-primary/50"
                                        min={1}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">URL Gambar (Opsional)</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl focus:outline-none focus:border-primary/50"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>

                            {/* Status Toggles */}
                            <div className="flex gap-6 p-4 bg-surface-2/30 rounded-xl border border-border/50">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary/50 transition-all cursor-pointer"
                                    />
                                    <span className="text-sm font-medium group-hover:text-foreground transition-colors">Layanan Aktif</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_popular}
                                        onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                                        className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary/50 transition-all cursor-pointer"
                                    />
                                    <span className="text-sm font-medium group-hover:text-foreground transition-colors">Label Populer</span>
                                </label>
                            </div>

                            {/* Features (Dynamic List) */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium">Fitur Keunggulan</label>
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        className="text-primary-light hover:text-primary transition-colors text-xs font-bold flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Tambah Fitur
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.features.map((feat, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={feat}
                                                onChange={(e) => updateFeature(idx, e.target.value)}
                                                className="flex-1 px-4 py-2.5 bg-surface-2 border border-border rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                                placeholder={`Fitur #${idx + 1}`}
                                            />
                                            {formData.features.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(idx)}
                                                    className="p-2.5 hover:bg-red-500/10 text-muted hover:text-red-400 rounded-xl transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </form>

                <div className="p-6 border-t border-border flex gap-3 bg-surface-2/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-surface-2 border border-border rounded-xl font-medium hover:border-primary/30 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={submitting || loading}
                        className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {submitting ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                {serviceId ? 'Simpan Perubahan' : 'Buat Layanan'}
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
