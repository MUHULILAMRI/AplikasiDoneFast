'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { apiGetMessages, apiSendMessage, apiGetOrder } from '@/lib/api';
import {
    ArrowLeft, Send, Paperclip, MoreVertical, MapPin,
    User as UserIcon, Clock
} from 'lucide-react';

interface ChatMsg {
    id: string;
    message: string;
    file_url?: string;
    is_read: boolean;
    created_at: string;
    sender_id: string;
    sender: {
        id: string;
        name: string;
        avatar?: string;
        role: string;
    };
}

interface OrderInfo {
    id: string;
    order_number: string;
    title: string;
    status: string;
    joki?: { id: string; name: string };
    user?: { id: string; name: string };
}

function timeStr(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function dateStr(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OrderChatPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;
    const { user } = useAppStore();

    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [order, setOrder] = useState<OrderInfo | null>(null);
    const [newMsg, setNewMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = useCallback(async () => {
        const res = await apiGetMessages(orderId);
        if (res.success) {
            setMessages(res.data as ChatMsg[]);
        }
    }, [orderId]);

    const fetchOrder = useCallback(async () => {
        const res = await apiGetOrder(orderId);
        if (res.success) {
            const d = res.data as Record<string, unknown>;
            setOrder({
                id: d.id as string,
                order_number: d.order_number as string,
                title: d.title as string,
                status: d.status as string,
                joki: d.joki as OrderInfo['joki'],
                user: d.user as OrderInfo['user'],
            });
        }
    }, [orderId]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchMessages(), fetchOrder()]);
            setLoading(false);
        };
        init();
    }, [fetchMessages, fetchOrder]);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Poll for new messages every 5 seconds
    useEffect(() => {
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const handleSend = async () => {
        if (!newMsg.trim() || sending) return;
        setSending(true);

        const res = await apiSendMessage(orderId, newMsg.trim());
        if (res.success) {
            setMessages(prev => [...prev, res.data as ChatMsg]);
            setNewMsg('');
            inputRef.current?.focus();
        }
        setSending(false);
    };

    // Determine the "other party" name
    const otherParty = user?.role === 'customer'
        ? order?.joki?.name || 'Joki'
        : order?.user?.name || 'Customer';

    // Group messages by date
    const grouped: { date: string; msgs: ChatMsg[] }[] = [];
    messages.forEach((msg) => {
        const d = dateStr(msg.created_at);
        const last = grouped[grouped.length - 1];
        if (last && last.date === d) {
            last.msgs.push(msg);
        } else {
            grouped.push({ date: d, msgs: [msg] });
        }
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col h-screen">
            {/* Chat Header */}
            <div className="glass border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => router.back()} className="p-2 hover:bg-surface-2 rounded-lg transition-colors flex-shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{otherParty}</h3>
                        <p className="text-xs text-muted truncate">
                            {order?.order_number} — {order?.title}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                    <Link
                        href={`/tracking?id=${order?.order_number || orderId}`}
                        className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                        title="Lacak Order"
                    >
                        <MapPin className="w-4 h-4 text-muted" />
                    </Link>
                    <button className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-muted" />
                    </button>
                </div>
            </div>

            {/* Order Status Banner */}
            {order && (
                <div className="px-4 py-2 bg-surface-2/50 border-b border-border/50 flex items-center justify-center gap-2 text-xs text-muted">
                    <Clock className="w-3 h-3" />
                    Status: <span className="font-medium text-foreground">{order.status.replace(/_/g, ' ')}</span>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted">
                        <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 opacity-30" />
                        </div>
                        <p className="text-sm font-medium">Belum ada pesan</p>
                        <p className="text-xs mt-1">Mulai percakapan dengan mengirim pesan pertama</p>
                    </div>
                ) : (
                    grouped.map((group) => (
                        <div key={group.date}>
                            {/* Date Separator */}
                            <div className="flex items-center justify-center my-4">
                                <span className="text-[10px] text-muted bg-surface-2 px-3 py-1 rounded-full">
                                    {group.date}
                                </span>
                            </div>

                            {/* Messages */}
                            {group.msgs.map((msg, i) => {
                                const isMe = msg.sender_id === user?.id;
                                const showAvatar = !isMe && (i === 0 || group.msgs[i - 1]?.sender_id !== msg.sender_id);

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex mb-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {/* Avatar for other */}
                                        {!isMe && (
                                            <div className="w-7 mr-2 flex-shrink-0">
                                                {showAvatar ? (
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center mt-1">
                                                        <span className="text-[10px] text-white font-bold">
                                                            {msg.sender.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}

                                        <div className={`max-w-[75%] ${isMe
                                                ? 'bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl rounded-br-md'
                                                : 'bg-surface-2 border border-border rounded-2xl rounded-bl-md'
                                            } px-4 py-2.5`}>
                                            {/* Sender name for first message in group */}
                                            {showAvatar && !isMe && (
                                                <p className="text-[10px] font-semibold text-primary-light mb-0.5">{msg.sender.name}</p>
                                            )}
                                            <p className="text-sm whitespace-pre-line break-words">{msg.message}</p>
                                            {msg.file_url && (
                                                <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs underline mt-1 opacity-80">
                                                    <Paperclip className="w-3 h-3" /> File lampiran
                                                </a>
                                            )}
                                            <div className={`flex items-center gap-1 justify-end mt-1 ${isMe ? 'text-white/50' : 'text-muted'}`}>
                                                <span className="text-[10px]">{timeStr(msg.created_at)}</span>
                                                {isMe && msg.is_read && (
                                                    <span className="text-[9px]">✓✓</span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 border-t border-border glass">
                <div className="flex items-center gap-3 max-w-3xl mx-auto">
                    <button className="p-2 hover:bg-surface-2 rounded-lg transition-colors flex-shrink-0">
                        <Paperclip className="w-5 h-5 text-muted" />
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ketik pesan..."
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                        disabled={sending}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMsg.trim() || sending}
                        className="p-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
