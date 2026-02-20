'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiGetOrders, apiGetMessages, apiSendMessage } from '@/lib/api';
import {
  Send, Search, Paperclip, Smile, Phone, Video,
  MoreVertical, CircleDot, MessageSquare
} from 'lucide-react';

type Conversation = { id: string; name: string; avatar: string; lastMsg: string; time: string; unread: number; status: string; orderId: string };
type Message = { id: string; sender: string; text: string; time: string };

export default function JokiChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await apiGetOrders({ limit: 20 });
      if (res.success) {
        const d = res.data as Record<string, unknown>;
        const orders = (d.data ?? d) as Record<string, unknown>[];
        const convs: Conversation[] = orders.map((o, i) => ({
          id: String(i + 1),
          name: (o.user as Record<string, unknown>)?.name as string ?? `Order ${o.id}`,
          avatar: '👤',
          lastMsg: (o.title as string) ?? '',
          time: '',
          unread: 0,
          status: 'online',
          orderId: (o.id as string) || (o.order_number as string),
        }));
        setConversations(convs);
        if (convs.length > 0) {
          setSelectedChat(convs[0]);
          loadMessages(convs[0].orderId);
        }
      }
    }
    load();
  }, []);

  async function loadMessages(orderId: string) {
    const res = await apiGetMessages(orderId);
    if (res.success) {
      const msgs = res.data as Record<string, unknown>[];
      setMessages(msgs.map((m) => ({
        id: m.id ? String(m.id) : crypto.randomUUID(),
        sender: (m.sender_role as string)?.toLowerCase() ?? 'customer',
        text: m.message as string,
        time: new Date(m.created_at as string).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      })));
    }
  }

  async function handleSend() {
    if (!message.trim() || !selectedChat) return;
    try {
      setIsSending(true);
      const res = await apiSendMessage(selectedChat.orderId, message);
      if (!res.success) {
        alert(res.error || 'Gagal mengirim pesan');
        return;
      }
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const newMsg: Message = { id: crypto.randomUUID(), sender: 'joki', text: message, time: now };
      setMessages(prev => [...prev, newMsg]);
      setConversations((prev) => prev.map((c) => c.id === selectedChat.id ? { ...c, lastMsg: message, time: now } : c));
      setMessage('');
    } finally {
      setIsSending(false);
    }
  }

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
            {conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((conv) => (
              <button
                key={conv.id}
                onClick={() => { setSelectedChat(conv); loadMessages(conv.orderId); }}
                className={`w-full flex items-center gap-3 p-4 hover:bg-surface-2 transition-colors ${
                  selectedChat?.id === conv.id ? 'bg-surface-2 border-l-2 border-accent' : ''
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
              {selectedChat?.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{selectedChat?.name}</h3>
                <p className="text-xs text-muted flex items-center gap-1">
                  <CircleDot className={`w-3 h-3 ${selectedChat?.status === 'online' ? 'text-accent-green' : 'text-muted'}`} />
                  {selectedChat?.status === 'online' ? 'Online' : 'Offline'}
                  {selectedChat?.orderId && <span className="font-mono ml-1">• {selectedChat.orderId}</span>}
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
            {messages.map((msg, i) => (
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
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={handleSend}
              disabled={isSending}
              className="p-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl hover:opacity-90 disabled:opacity-60"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
