'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { apiGetOrders, apiGetMessages, apiSendMessage, apiGetUnreadCounts } from '@/lib/api';
import {
  Send, Search, Paperclip,
  MoreVertical, CircleDot, MessageSquare, ExternalLink,
  MapPin, Clock, Users, ShieldCheck
} from 'lucide-react';

type Conversation = {
  id: string;
  customerName: string;
  jokiName: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  status: string;
  orderId: string;
  orderNumber: string;
  orderStatus: string;
};

type Message = {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  text: string;
  time: string;
  isRead: boolean;
  fileUrl?: string;
};

function statusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING_PAYMENT: 'Menunggu Bayar',
    PAID: 'Dibayar',
    IN_PROGRESS: 'Dikerjakan',
    REVISION: 'Revisi',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  };
  return map[s] || s;
}

function statusColor(s: string) {
  const map: Record<string, string> = {
    PENDING_PAYMENT: 'text-yellow-400',
    PAID: 'text-blue-400',
    IN_PROGRESS: 'text-purple-400',
    REVISION: 'text-orange-400',
    COMPLETED: 'text-green-400',
    CANCELLED: 'text-red-400',
  };
  return map[s] || 'text-muted';
}

export default function AdminChatPage() {
  const { user } = useAppStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedChatRef = useRef<Conversation | null>(null);

  // Keep ref in sync
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversations from orders API (admin sees all)
  useEffect(() => {
    async function load() {
      setLoading(true);
      const [ordersRes, unreadRes] = await Promise.all([
        apiGetOrders({ limit: 100 }),
        apiGetUnreadCounts(),
      ]);

      if (ordersRes.success) {
        const d = ordersRes.data as Record<string, unknown>;
        const orders = (d.data ?? d) as Record<string, unknown>[];
        const unreadMap = unreadRes.success ? (unreadRes.data as Record<string, number>) : {};

        const convs: Conversation[] = orders
          .filter((o) => !['CANCELLED', 'PENDING_PAYMENT'].includes(o.status as string))
          .map((o) => {
            const customerUser = o.user as Record<string, unknown> | undefined;
            const jokiMember = o.joki as Record<string, unknown> | undefined;
            const customerName = (customerUser?.name as string) || 'Customer';
            const jokiName = (jokiMember?.name as string) || 'Belum di-assign';

            return {
              id: o.id as string,
              customerName,
              jokiName,
              avatar: customerName.charAt(0).toUpperCase(),
              lastMsg: (o.title as string) || '',
              time: '',
              unread: unreadMap[o.id as string] || 0,
              status: 'online',
              orderId: o.id as string,
              orderNumber: (o.order_number as string) || (o.id as string),
              orderStatus: (o.status as string) || '',
            };
          });
        setConversations(convs);
        if (convs.length > 0) {
          setSelectedChat(convs[0]);
          loadMessages(convs[0].orderId);
        }
      }
      setLoading(false);
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
          isRead: (m.is_read as boolean) ?? false,
          fileUrl: m.file_url as string | undefined,
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
        alert((res as { error?: string }).error || 'Gagal mengirim pesan');
        return;
      }
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const newMsg: Message = {
        id: crypto.randomUUID(),
        senderId: user?.id || '',
        senderRole: 'admin',
        senderName: user?.name || 'Admin',
        text: message,
        time: now,
        isRead: false,
      };
      setMessages((prev) => [...prev, newMsg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedChat.id ? { ...c, lastMsg: message, time: now } : c
        )
      );
      setMessage('');
      setTimeout(scrollToBottom, 100);
    } finally {
      setIsSending(false);
    }
  }

  function selectChat(conv: Conversation) {
    setSelectedChat(conv);
    loadMessages(conv.orderId);
    // Clear unread for this conversation
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
    );
  }

  function isMyMessage(msg: Message) {
    return msg.senderId === user?.id || msg.senderRole === 'admin';
  }

  const filteredConversations = conversations.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jokiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex h-full glass rounded-2xl overflow-hidden">
        {/* Sidebar — Conversation List */}
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-light" />
              Admin Chat
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Cari customer, joki, atau order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-muted">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Tidak ada percakapan aktif</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectChat(conv)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-surface-2 transition-colors ${selectedChat?.id === conv.id
                      ? 'bg-surface-2 border-l-2 border-primary'
                      : ''
                    }`}
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{conv.avatar}</span>
                    </div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm truncate">{conv.customerName}</span>
                      {conv.time && (
                        <span className="text-[10px] text-muted flex-shrink-0">{conv.time}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate">{conv.lastMsg}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-accent font-mono">{conv.orderNumber}</span>
                      <span className={`text-[10px] ${statusColor(conv.orderStatus)}`}>
                        • {statusLabel(conv.orderStatus)}
                      </span>
                    </div>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-[10px] text-white flex items-center justify-center flex-shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Admin Stats */}
          <div className="p-3 border-t border-border text-center">
            <p className="text-[10px] text-muted">
              {conversations.length} percakapan aktif • {conversations.reduce((s, c) => s + c.unread, 0)} pesan belum dibaca
            </p>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-sm font-bold text-white">{selectedChat?.avatar}</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">{selectedChat?.customerName || 'Pilih Percakapan'}</h3>
                <p className="text-xs text-muted flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Joki: {selectedChat?.jokiName || '-'}
                  {selectedChat?.orderNumber && (
                    <span className="font-mono ml-1">• {selectedChat.orderNumber}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedChat && (
                <>
                  <span className={`text-xs px-2 py-1 rounded-lg bg-surface-2 ${statusColor(selectedChat.orderStatus)}`}>
                    {statusLabel(selectedChat.orderStatus)}
                  </span>
                  <Link
                    href={`/tracking?id=${selectedChat.orderNumber}`}
                    className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                    title="Lacak Order"
                  >
                    <MapPin className="w-4 h-4 text-muted" />
                  </Link>
                  <Link
                    href={`/orders/${selectedChat.orderId}/chat`}
                    className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                    title="Buka Full Chat"
                  >
                    <ExternalLink className="w-4 h-4 text-muted" />
                  </Link>
                </>
              )}
              <button className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-muted" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted">
                <Send className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-sm">Belum ada pesan</p>
                <p className="text-xs mt-1">Kirim pesan pertama sebagai admin</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMine = isMyMessage(msg);
                const roleLabel =
                  msg.senderRole === 'admin'
                    ? '🛡 Admin'
                    : msg.senderRole === 'joki'
                      ? '⚡ Joki'
                      : '👤 Customer';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar for others */}
                    {!isMine && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                        <span className="text-[10px] font-bold text-white">
                          {msg.senderName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] ${isMine
                          ? 'bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl rounded-br-md'
                          : 'bg-surface-2 border border-border rounded-2xl rounded-bl-md'
                        } px-4 py-3`}
                    >
                      {!isMine && (
                        <p className="text-[10px] font-semibold text-primary-light mb-0.5">
                          {msg.senderName} <span className="opacity-60">{roleLabel}</span>
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-line break-words">{msg.text}</p>
                      {msg.fileUrl && (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs underline mt-1 opacity-80"
                        >
                          <Paperclip className="w-3 h-3" /> File lampiran
                        </a>
                      )}
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
              {[
                'Terima kasih!',
                'Order sedang diproses',
                'Akan saya cek',
                'Sudah saya assign ke joki',
                'Cek email ya',
              ].map((reply) => (
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
              <input
                type="text"
                placeholder="Ketik pesan sebagai admin..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                disabled={!selectedChat || isSending}
              />
              <button
                onClick={handleSend}
                disabled={isSending || !message.trim() || !selectedChat}
                className="p-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity"
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
    </div>
  );
}
