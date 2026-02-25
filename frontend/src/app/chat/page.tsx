'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { apiAIChatbot } from '@/lib/api';
import {
  Send, ArrowLeft, Bot, Sparkles,
} from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  suggestedQuestions?: string[];
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-2 flex-shrink-0 mt-1">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-surface-2 border border-border rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function formatBotText(text: string) {
  // Convert **bold** to <strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function ChatContent() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Halo! 👋 Selamat datang di DoneFast AI Assistant.\n\nSaya bisa bantu kamu tentang layanan, harga, cara order, pembayaran, dan semua hal seputar DoneFast.\n\nMau tanya apa?',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        'Layanan apa saja yang tersedia?',
        'Berapa harga layanan?',
        'Bagaimana cara order?',
        'Metode pembayaran apa saja?',
      ],
    },
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isBotTyping]);

  const sendMessage = async (text?: string) => {
    const msgText = (text || message).trim();
    if (!msgText) return;

    const userMsg: ChatMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      text: msgText,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setMessage('');
    setIsBotTyping(true);

    // Simulate slight delay for natural feel
    await new Promise(r => setTimeout(r, 500 + Math.random() * 800));

    const res = await apiAIChatbot(msgText);
    setIsBotTyping(false);

    let botText = 'Maaf, saya sedang mengalami gangguan. Silakan coba lagi atau hubungi admin via WhatsApp. 🙏';
    let suggestedQuestions: string[] = [];

    if (res.success) {
      const d = res.data as Record<string, unknown>;
      botText = (d.response as string) || botText;
      suggestedQuestions = (d.suggested_questions as string[]) || [];
    }

    setChatMessages(prev => [...prev, {
      id: prev.length + 1,
      sender: 'bot',
      text: botText,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions,
    }]);

    inputRef.current?.focus();
  };

  const lastBotMsg = [...chatMessages].reverse().find(m => m.sender === 'bot');
  const currentSuggestions = lastBotMsg?.suggestedQuestions || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="glass border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              DoneFast AI Assistant
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </h3>
            <p className="text-xs text-accent-green flex items-center gap-1">
              <span className="w-2 h-2 bg-accent-green rounded-full inline-block" />
              Selalu Online
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <span className="px-2.5 py-1 bg-primary/10 text-primary-light text-[10px] font-medium rounded-full">
            Hanya seputar DoneFast
          </span>
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
            transition={{ delay: i === 0 ? 0 : 0.05 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] sm:max-w-[75%] ${msg.sender === 'user'
                ? 'bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl rounded-br-md'
                : 'bg-surface-2 border border-border rounded-2xl rounded-bl-md'
              } px-4 py-3`}>
              <p className="text-sm whitespace-pre-line leading-relaxed">
                {msg.sender === 'bot' ? formatBotText(msg.text) : msg.text}
              </p>
              <p className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-white/60' : 'text-muted'}`}>{msg.time}</p>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isBotTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {currentSuggestions.length > 0 && !isBotTyping && (
        <div className="px-4 sm:px-6 max-w-3xl mx-auto w-full">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {currentSuggestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="flex-shrink-0 px-3.5 py-2 bg-surface-2 border border-border rounded-full text-xs text-muted hover:border-primary/40 hover:text-foreground transition-all hover:bg-primary/5"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="Tanya seputar DoneFast..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={isBotTyping}
            className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!message.trim() || isBotTyping}
            className="p-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-muted/50 text-center mt-2">
          AI Assistant ini hanya menjawab pertanyaan seputar platform DoneFast.
        </p>
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
