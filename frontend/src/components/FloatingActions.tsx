'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, MessageCircle } from 'lucide-react';

const WA_NUMBER = '6285998006060';
const WA_MESSAGE = encodeURIComponent('Halo DoneFast! Saya ingin konsultasi mengenai layanan yang tersedia.');

export default function FloatingActions() {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
            {/* Back to Top */}
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0, y: 20 }}
                        onClick={scrollToTop}
                        className="w-12 h-12 rounded-full bg-surface-2 border border-border text-muted hover:text-foreground hover:border-primary/50 flex items-center justify-center shadow-lg shadow-black/30 transition-colors"
                        title="Kembali ke atas"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* WhatsApp Float */}
            <motion.a
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-500/30 transition-all hover:scale-110"
                title="Chat WhatsApp"
            >
                <MessageCircle className="w-6 h-6" />
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
                {/* Tooltip */}
                <span className="absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 bg-surface-2 border border-border text-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                    Chat Admin 💬
                </span>
            </motion.a>
        </div>
    );
}
