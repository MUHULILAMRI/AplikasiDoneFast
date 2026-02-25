'use client';

import { motion } from 'framer-motion';
import { Bell, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const MOCK_NOTIFS = [
    { id: 1, title: 'Order Baru!', message: 'Pelanggan telah melakukan pembayaran untuk order #DF-12345', time: '5 menit yang lalu', type: 'info', icon: Bell },
    { id: 2, title: 'Pekerjaan Selesai', message: 'Joki Alex telah mengupload hasil untuk order #DF-12200', time: '1 jam yang lalu', type: 'success', icon: CheckCircle },
    { id: 3, title: 'Revisi Diminta', message: 'Pelanggan meminta revisi pada order #DF-12150', time: '3 jam yang lalu', type: 'warning', icon: AlertTriangle },
];

export default function AdminNotificationsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Notifikasi</h1>
                <button className="text-sm text-primary-light hover:underline">Tandai semua dibaca</button>
            </div>

            <div className="space-y-3">
                {MOCK_NOTIFS.map((notif, i) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass rounded-2xl p-4 flex gap-4 items-start border border-transparent hover:border-primary/20 transition-all cursor-pointer group"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'success' ? 'bg-green-500/10 text-green-400' :
                                notif.type === 'warning' ? 'bg-orange-500/10 text-orange-400' :
                                    'bg-blue-500/10 text-blue-400'
                            }`}>
                            <notif.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm group-hover:text-primary-light transition-colors">{notif.title}</h3>
                            <p className="text-sm text-muted mt-0.5">{notif.message}</p>
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted">
                                <Clock className="w-3 h-3" />
                                {notif.time}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
