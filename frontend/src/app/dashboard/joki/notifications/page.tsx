'use client';

import { motion } from 'framer-motion';
import { Bell, Clock, Zap, MessageSquare } from 'lucide-react';

const MOCK_NOTIFS = [
    { id: 1, title: 'Tugas Baru Diassign!', message: 'Admin telah menugaskan kamu untuk order #DF-9988', time: '10 menit yang lalu', type: 'new', icon: Zap },
    { id: 2, title: 'Pesan Baru', message: 'Pelanggan mengirim pesan di order #DF-9988', time: '30 menit yang lalu', type: 'chat', icon: MessageSquare },
    { id: 3, title: 'Deadline Mendekat', message: 'Jangan lupa! Deadline untuk order #DF-9950 tinggal 2 jam lagi.', time: '1 jam yang lalu', type: 'alert', icon: Bell },
];

export default function JokiNotificationsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Notifikasi Joki</h1>
                <button className="text-sm text-accent hover:underline">Tandai dibaca</button>
            </div>

            <div className="space-y-3">
                {MOCK_NOTIFS.map((notif, i) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass rounded-2xl p-4 flex gap-4 items-start border border-transparent hover:border-accent/20 transition-all cursor-pointer group"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'chat' ? 'bg-primary/10 text-primary-light' :
                                notif.type === 'alert' ? 'bg-red-500/10 text-red-400' :
                                    'bg-accent/10 text-accent'
                            }`}>
                            <notif.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{notif.title}</h3>
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
