'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import {
  Send, Search, Paperclip, Smile, Phone, Video,
  MoreVertical, CircleDot, MessageSquare
} from 'lucide-react';

const CONVERSATIONS = [
  { id: '1', name: 'Ahmad Rizki', avatar: '🧑‍🎓', lastMsg: 'Kapan selesai tugasnya?', time: '2 mnt', unread: 2, status: 'online', orderId: 'ORD-001' },
  { id: '2', name: 'Siti Nurhaliza', avatar: '👩‍💻', lastMsg: 'File sudah saya upload ya', time: '1 jam', unread: 0, status: 'offline', orderId: 'ORD-002' },
  { id: '3', name: 'Admin DoneFast', avatar: '🛡️', lastMsg: 'Order baru sudah di-assign', time: '3 jam', unread: 1, status: 'online', orderId: '' },
];

const MESSAGES = [
  { id: 1, sender: 'customer', text: 'Halo, gimana progress skripsi saya?', time: '14:30' },
  { id: 2, sender: 'joki', text: 'Halo kak! Progress sudah 70%. Bagian metodologi hampir selesai.', time: '14:31' },
  { id: 3, sender: 'customer', text: 'Mantap! Ada yang perlu saya bantu?', time: '14:32' },
  { id: 4, sender: 'joki', text: 'Bisa minta referensi jurnal tambahan untuk bagian kajian pustaka? 📚', time: '14:33' },
  { id: 5, sender: 'customer', text: 'Oke, nanti saya kirim. Kapan selesai tugasnya?', time: '14:35' },
];

export default function JokiChatPage() {
  const [selectedChat, setSelectedChat] = useState(CONVERSATIONS[0]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex h-full glass rounded-2xl overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent" />
              Chat
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {CONVERSATIONS.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-surface-2 transition-colors ${
                  selectedChat.id === conv.id ? 'bg-surface-2 border-l-2 border-accent' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg">
                    {conv.avatar}
                  </div>
                  {conv.status === 'online' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-green rounded-full border-2 border-surface" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm truncate">{conv.name}</span>
                    <span className="text-[10px] text-muted">{conv.time}</span>
                  </div>
                  <p className="text-xs text-muted truncate">{conv.lastMsg}</p>
                  {conv.orderId && <p className="text-[10px] text-accent font-mono">{conv.orderId}</p>}
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-accent text-[10px] text-white flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-lg">
                {selectedChat.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{selectedChat.name}</h3>
                <p className="text-xs text-muted flex items-center gap-1">
                  <CircleDot className={`w-3 h-3 ${selectedChat.status === 'online' ? 'text-accent-green' : 'text-muted'}`} />
                  {selectedChat.status === 'online' ? 'Online' : 'Offline'}
                  {selectedChat.orderId && <span className="font-mono ml-1">• {selectedChat.orderId}</span>}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-surface-2 rounded-lg"><Phone className="w-4 h-4 text-muted" /></button>
              <button className="p-2 hover:bg-surface-2 rounded-lg"><MoreVertical className="w-4 h-4 text-muted" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="text-center mb-4">
              <span className="text-xs text-muted bg-surface-2 px-3 py-1 rounded-full">Hari ini</span>
            </div>
            {MESSAGES.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex ${msg.sender === 'joki' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${
                  msg.sender === 'joki'
                    ? 'bg-gradient-to-r from-accent to-primary text-white rounded-2xl rounded-br-md'
                    : 'bg-surface-2 border border-border rounded-2xl rounded-bl-md'
                } px-4 py-3`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === 'joki' ? 'text-white/60' : 'text-muted'}`}>{msg.time}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="px-6 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['Sedang dikerjakan', 'Akan selesai besok', 'Sudah selesai!', 'Bisa kirim referensinya?'].map((reply) => (
                <button key={reply} onClick={() => setMessage(reply)} className="flex-shrink-0 px-3 py-1.5 bg-surface-2 border border-border rounded-full text-xs text-muted hover:border-accent/30 transition-colors">
                  {reply}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-border flex items-center gap-3">
            <button className="p-2 hover:bg-surface-2 rounded-lg"><Paperclip className="w-5 h-5 text-muted" /></button>
            <input
              type="text"
              placeholder="Ketik pesan..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setMessage('')}
              className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50"
            />
            <button className="p-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl hover:opacity-90">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
