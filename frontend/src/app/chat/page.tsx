'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { apiAIChatbot } from '@/lib/api';
import {
  Send, Search, Paperclip, Smile, ArrowLeft,
  Phone, MoreVertical, CircleDot, MessageSquare, Bot
} from 'lucide-react';

function ChatContent() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Halo! 👋 Selamat datang di DoneFast. Saya AI Assistant yang siap membantu kamu. Mau tanya apa?', time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const userMsg = {
      id: chatMessages.length + 1,
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, userMsg]);
    const userText = message;
    setMessage('');
    setIsBotTyping(true);

    const res = await apiAIChatbot(userText);
    setIsBotTyping(false);

    let botText = 'Maaf, saya belum bisa menjawab itu. Silakan hubungi admin kami.';
    if (res.success) {
      const d = res.data as Record<string, unknown>;
      botText = (d.response as string) || (d.message as string) || botText;
    }

    setChatMessages(prev => [...prev, {
      id: prev.length + 1,
      sender: 'bot',
      text: botText,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="glass border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-surface-2 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">DoneFast AI Assistant</h3>
            <p className="text-xs text-accent-green flex items-center gap-1">
              <CircleDot className="w-3 h-3" />
              Selalu Online
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-surface-2 rounded-lg"><Phone className="w-4 h-4 text-muted" /></button>
          <button className="p-2 hover:bg-surface-2 rounded-lg"><MoreVertical className="w-4 h-4 text-muted" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full">
        <div className="text-center mb-4">
          <span className="text-xs text-muted bg-surface-2 px-3 py-1 rounded-full">Hari ini</span>
        </div>
        {chatMessages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] ${
              msg.sender === 'user'
                ? 'bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl rounded-br-md'
                : 'bg-surface-2 border border-border rounded-2xl rounded-bl-md'
            } px-4 py-3`}>
              <p className="text-sm whitespace-pre-line">{msg.text}</p>
              <p className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-white/60' : 'text-muted'}`}>{msg.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-4 sm:px-6 max-w-3xl mx-auto w-full">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['Cek harga layanan', 'Status order saya', 'Cara pembayaran', 'Hubungi admin', 'Promo tersedia'].map((action) => (
            <button
              key={action}
              onClick={() => setMessage(action)}
              className="flex-shrink-0 px-3 py-1.5 bg-surface-2 border border-border rounded-full text-xs text-muted hover:border-primary/30 hover:text-foreground transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-surface-2 rounded-lg">
            <Paperclip className="w-5 h-5 text-muted" />
          </button>
          <input
            type="text"
            placeholder="Ketik pesan..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50"
          />
          <button
            onClick={sendMessage}
            className="p-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:opacity-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
