'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiGetOrders, apiJokiUpload } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Upload, FileText, X, CheckCircle,
  Send
} from 'lucide-react';

export default function UploadPage() {
  const [pendingUploads, setPendingUploads] = useState<Record<string, unknown>[]>([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await apiGetOrders({ status: 'IN_PROGRESS', limit: 20 });
      if (res.success) {
        const d = res.data as Record<string, unknown>;
        const list = (d.data ?? d) as Record<string, unknown>[];
        setPendingUploads(list);
        if (list.length > 0) setSelectedOrder(list[0].id as string);
      }
    }
    load();
  }, []);

  const simulateUpload = () => {
    setFiles(prev => [...prev, `hasil_${prev.length + 1}.pdf`]);
  };

  async function handleSubmit() {
    if (!selectedOrder) {
      alert('Pilih order terlebih dahulu');
      return;
    }
    if (files.length === 0) {
      alert('Tambahkan minimal satu file hasil');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await apiJokiUpload(selectedOrder, { result_files: files, notes });
      if (!res.success) {
        alert(res.error || 'Gagal mengirim hasil');
        return;
      }
      setSubmitted(true);
      setPendingUploads((prev) => prev.filter((o) => o.id !== selectedOrder));
      setSelectedOrder('');
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat mengirim hasil');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Hasil Berhasil Diupload!</h2>
          <p className="text-muted mb-6">Customer akan menerima notifikasi dan melakukan review.</p>
          <button
            onClick={() => { setSubmitted(false); setFiles([]); setNotes(''); }}
            className="px-6 py-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl font-medium hover:opacity-90"
          >
            Upload Lagi
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Upload Hasil</h1>
        <p className="text-muted text-sm mt-1">Kirim hasil pekerjaan ke customer.</p>
      </div>

      {/* Select Order */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-4">Pilih Order</h3>
        <div className="space-y-3">
          {pendingUploads.map((order) => (
            <button
              key={order.id as string}
              onClick={() => setSelectedOrder(order.id as string)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                selectedOrder === order.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-surface-2 hover:border-primary/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted">{(order.order_number as string) || (order.id as string)}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-400">Dikerjakan</span>
                  </div>
                  <p className="text-sm font-medium">{order.title as string}</p>
                  <p className="text-xs text-muted mt-1">👤 {(order.customer as Record<string, unknown>)?.name as string ?? 'Customer'} • ⏰ Deadline: {order.deadline ? formatDate(order.deadline as string) : '-'}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedOrder === order.id ? 'border-accent bg-accent' : 'border-muted'
                }`}>
                  {selectedOrder === order.id && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-4">Upload File</h3>
        <div
          onClick={simulateUpload}
          className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
        >
          <Upload className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Klik untuk upload atau drag & drop</p>
          <p className="text-xs text-muted">PDF, DOCX, ZIP, RAR, dan file lainnya (maks. 50MB)</p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-surface-2 rounded-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-light" />
                  <div>
                    <p className="text-sm font-medium">{file}</p>
                    <p className="text-xs text-muted">2.4 MB</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)); }}
                  className="p-1 hover:bg-surface rounded-lg"
                >
                  <X className="w-4 h-4 text-muted" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-4">Catatan untuk Customer</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tulis catatan atau penjelasan tentang hasil pekerjaan..."
          rows={4}
          className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 resize-none"
        />
      </motion.div>

      {/* Submit */}
      <div className="flex gap-3">
        <button className="flex-1 py-3 bg-surface-2 border border-border rounded-xl hover:border-primary/30 text-sm">
          Simpan Draft
        </button>
        <button
          onClick={handleSubmit}
          disabled={files.length === 0 || isSubmitting}
          className="flex-1 py-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Mengirim...' : 'Kirim Hasil'}
        </button>
      </div>
    </div>
  );
}
