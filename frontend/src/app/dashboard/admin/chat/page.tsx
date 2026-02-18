'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_CHAT } from '@/lib/data';
import {
  MessageSquare, Send, Search, Phone, Video,
  MoreVertical, Paperclip, Smile, Star, Clock,
  User, CircleDot
} from 'lucide-react';

const CONVERSATIONS = [
  { id: '1', name: 'Ahmad Rizki', avatar: '🧑‍🎓', lastMsg: 'Kapan selesai tugasnya?', time: '2 mnt', unread: 2, status: 'online' },
  { id: '2', name: 'Siti Nurhaliza', avatar: '👩‍💻', lastMsg: 'Oke, saya kirim filenya', time: '15 mnt', unread: 0, status: 'online' },
  { id: '3', name: 'Budi Santoso', avatar: '🧑‍🔬', lastMsg: 'Bisa revisi bagian ini?', time: '1 jam', unread: 1, status: 'offline' },
  { id: '4', name: 'Dian Permata', avatar: '👩‍🎓', lastMsg: 'Terima kasih banyak!', time: '3 jam', unread: 0, status: 'offline' },
  { id: '5', name: 'Fajar Nugroho', avatar: '🧑‍💼', lastMsg: 'Order baru: Skripsi BAB 3', time: '5 jam', unread: 0, status: 'online' },
];

const MESSAGES = [
  { id: 1, sender: 'customer', text: 'Halo admin, saya mau tanya tentang order saya', time: '14:30' },
  { id: 2, sender: 'admin', text: 'Halo! Silakan, ada yang bisa saya bantu?', time: '14:31' },
  { id: 3, sender: 'customer', text: 'Order #ORD-001 sudah sampai mana ya progressnya?', time: '14:32' },
  { id: 4, sender: 'admin', text: 'Sebentar saya cek dulu ya... 🔍', time: '14:33' },
  { id: 5, sender: 'admin', text: 'Order #ORD-001 sudah 70% selesai. Joki sedang mengerjakan bagian analisis data. Estimasi selesai besok sore.', time: '14:35' },
  { id: 6, sender: 'customer', text: 'Wah cepat juga ya! Kapan selesai tugasnya?', time: '14:36' },
];

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(CONVERSATIONS[0]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex h-full glass rounded-2xl overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-light" />
              Chat
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Cari percakapan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {CONVERSATIONS.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-surface-2 transition-colors ${
                  selectedChat.id === conv.id ? 'bg-surface-2 border-l-2 border-primary' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-surface flex items-center justify-center text-xl">
                    {conv.avatar}
                  </div>
                  {conv.status === 'online' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-accent-green rounded-full border-2 border-surface" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm truncate">{conv.name}</span>
                    <span className="text-[10px] text-muted flex-shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">{conv.lastMsg}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-[10px] text-white flex items-center justify-center flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg">
                  {selectedChat.avatar}
                </div>
                {selectedChat.status === 'online' && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-green rounded-full border-2 border-surface" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{selectedChat.name}</h3>
                <p className="text-xs text-muted flex items-center gap-1">
                  <CircleDot className={`w-3 h-3 ${selectedChat.status === 'online' ? 'text-accent-green' : 'text-muted'}`} />
                  {selectedChat.status === 'online' ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <Phone className="w-4 h-4 text-muted" />
              </button>
              <button className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <Video className="w-4 h-4 text-muted" />
              </button>
              <button className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-muted" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="text-center mb-6">
              <span className="text-xs text-muted bg-surface-2 px-3 py-1 rounded-full">Hari ini</span>
            </div>
            {MESSAGES.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${
                  msg.sender === 'admin'
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl rounded-br-md'
                    : 'bg-surface-2 border border-border rounded-2xl rounded-bl-md'
                } px-4 py-3`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === 'admin' ? 'text-white/60' : 'text-muted'}`}>
                    {msg.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Replies */}
          <div className="px-6 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['Terima kasih!', 'Order sedang diproses', 'Cek email ya', 'Akan saya follow up'].map((reply) => (
                <button
                  key={reply}
                  onClick={() => setMessage(reply)}
                  className="flex-shrink-0 px-3 py-1.5 bg-surface-2 border border-border rounded-full text-xs text-muted hover:border-primary/30 hover:text-foreground transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5 text-muted" />
              </button>
              <button className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <Smile className="w-5 h-5 text-muted" />
              </button>
              <input
                type="text"
                placeholder="Ketik pesan..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setMessage('')}
                className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50"
              />
              <button className="p-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:opacity-90 transition-opacity">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
