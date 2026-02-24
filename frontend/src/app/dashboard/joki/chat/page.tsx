'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { apiGetOrders, apiGetMessages, apiSendMessage } from '@/lib/api';
import {
  Send, Search, Paperclip,
  MoreVertical, CircleDot, MessageSquare, ExternalLink
} from 'lucide-react';

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  status: string;
  orderId: string;
  orderNumber: string;
};

type Message = {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  text: string;
  time: string;
  isRead: boolean;
};

export default function JokiChatPage() {
  const { user } = useAppStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedChatRef = useRef<Conversation | null>(null);

  // Keep ref in sync
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    async function load() {
      const res = await apiGetOrders({ limit: 50 });
      if (res.success) {
        const d = res.data as Record<string, unknown>;
        const orders = (d.data ?? d) as Record<string, unknown>[];
        const convs: Conversation[] = orders
          .filter((o) => !['CANCELLED', 'PENDING_PAYMENT'].includes(o.status as string))
          .map((o) => ({
            id: o.id as string,
            name: (o.user as Record<string, unknown>)?.name as string ?? `Order ${o.id}`,
            avatar: ((o.user as Record<string, unknown>)?.name as string)?.charAt(0)?.toUpperCase() ?? '?',
            lastMsg: (o.title as string) ?? '',
            time: '',
            unread: 0,
            status: 'online',
            orderId: o.id as string,
            orderNumber: (o.order_number as string) || (o.id as string),
          }));
        setConversations(convs);
        if (convs.length > 0) {
          setSelectedChat(convs[0]);
          loadMessages(convs[0].orderId);
        }
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMessages(orderId: string) {
    const res = await apiGetMessages(orderId);
    if (res.success) {
      const msgs = res.data as Record<string, unknown>[];
      const formatted = msgs.map((m) => {
        const sender = m.sender as Record<string, unknown> | undefined;
        return {
          id: m.id ? String(m.id) : crypto.randomUUID(),
          senderId: (m.sender_id as string) || '',
          senderRole: ((m.sender_role as string) || '').toLowerCase(),
          senderName: (sender?.name as string) || 'Unknown',
          text: m.message as string,
          time: new Date(m.created_at as string).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isRead: m.is_read as boolean ?? false,
        };
      });
      setMessages(formatted);
      setTimeout(scrollToBottom, 100);
    }
  }

  // Auto-refresh messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedChatRef.current) {
        loadMessages(selectedChatRef.current.orderId);
      }
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSend() {
    if (!message.trim() || !selectedChat || isSending) return;
    try {
      setIsSending(true);
      const res = await apiSendMessage(selectedChat.orderId, message);
      if (!res.success) {
        alert(res.error || 'Gagal mengirim pesan');
        return;
      }
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const newMsg: Message = {
        id: crypto.randomUUID(),
        senderId: user?.id || '',
        senderRole: 'joki',
        senderName: user?.name || 'Joki',
        text: message,
        time: now,
        isRead: false,
      };
      setMessages(prev => [...prev, newMsg]);
      setConversations((prev) => prev.map((c) => c.id === selectedChat.id ? { ...c, lastMsg: message, time: now } : c));
      setMessage('');
      setTimeout(scrollToBottom, 100);
    } finally {
      setIsSending(false);
    }
  }

  function selectChat(conv: Conversation) {
    setSelectedChat(conv);
    loadMessages(conv.orderId);
  }

  // Determine if message is from current user
  function isMyMessage(msg: Message) {
    return msg.senderId === user?.id || msg.senderRole === 'joki';
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex h-full glass rounded-2xl overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent" />
              Chat Customer
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Cari customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-muted">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada percakapan</p>
              </div>
            ) : (
              conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectChat(conv)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-surface-2 transition-colors ${selectedChat?.id === conv.id ? 'bg-surface-2 border-l-2 border-accent' : ''
                    }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{conv.avatar}</span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-green rounded-full border-2 border-surface" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm truncate">{conv.name}</span>
                      <span className="text-[10px] text-muted">{conv.time}</span>
                    </div>
                    <p className="text-xs text-muted truncate">{conv.lastMsg}</p>
                    <p className="text-[10px] text-accent font-mono">{conv.orderNumber}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-accent text-[10px] text-white flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-sm font-bold text-white">{selectedChat?.avatar}</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">{selectedChat?.name || 'Pilih Customer'}</h3>
                <p className="text-xs text-muted flex items-center gap-1">
                  <CircleDot className="w-3 h-3 text-accent-green" />
                  Online
                  {selectedChat?.orderNumber && <span className="font-mono ml-1">• {selectedChat.orderNumber}</span>}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {selectedChat && (
                <Link
                  href={`/orders/${selectedChat.orderId}/chat`}
                  className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                  title="Buka di Full Chat"
                >
                  <ExternalLink className="w-4 h-4 text-muted" />
                </Link>
              )}
              <button className="p-2 hover:bg-surface-2 rounded-lg"><MoreVertical className="w-4 h-4 text-muted" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted">
                <Send className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-sm">Belum ada pesan</p>
                <p className="text-xs mt-1">Mulai percakapan dengan customer</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMine = isMyMessage(msg);
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar for customer */}
                    {!isMine && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                        <span className="text-[10px] font-bold text-white">{msg.senderName?.charAt(0)?.toUpperCase() || '?'}</span>
                      </div>
                    )}
                    <div className={`max-w-[70%] ${isMine
                        ? 'bg-gradient-to-r from-accent to-primary text-white rounded-2xl rounded-br-md'
                        : 'bg-surface-2 border border-border rounded-2xl rounded-bl-md'
                      } px-4 py-3`}>
                      {!isMine && (
                        <p className="text-[10px] font-semibold text-primary-light mb-0.5">{msg.senderName}</p>
                      )}
                      <p className="text-sm whitespace-pre-line break-words">{msg.text}</p>
                      <div className={`flex items-center gap-1 justify-end mt-1 ${isMine ? 'text-white/50' : 'text-muted'}`}>
                        <span className="text-[10px]">{msg.time}</span>
                        {isMine && msg.isRead && <span className="text-[9px]">✓✓</span>}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
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
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50"
              disabled={!selectedChat || isSending}
            />
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim() || !selectedChat}
              className="p-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
