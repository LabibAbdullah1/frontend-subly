// src/pages/dashboard/SupportChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Image, AlertCircle, FileText, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { CardPanel } from '../../components/ui/CardPanel';
import { Button } from '../../components/ui/Button';

export const SupportChat: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const { chatMessages, addChatMessage } = useDataStore();

  const [inputMsg, setInputMsg] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when message list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() && !attachedImage) return;

    addChatMessage(1, inputMsg, false, attachedImage);
    setInputMsg('');
    setAttachedImage(null);
    
    addToast({
      type: 'info',
      title: 'Pesan Terkirim',
      message: 'Pesan dikirim. Hubungan agen Live Chat terhubung.',
    });
  };

  const handleAttachImage = () => {
    setAttachedImage('/proofs/receipt-chat-attachment.png');
    addToast({
      type: 'success',
      title: 'Bukti Terlampir',
      message: 'Bukti bayar/screenshot disisipkan ke kolom input chat.',
    });
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-text-main tracking-tight uppercase">
            {t('chatTitle')}
          </h1>
          <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
            {t('chatSub')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Chat box (Span 2) */}
        <div className="lg:col-span-2">
          <CardPanel className="flex flex-col h-[480px] overflow-hidden p-0 rounded-3xl border">
            {/* Header chat */}
            <div className="px-6 py-4.5 bg-bg-surface border-b border-border-main flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-text-main uppercase tracking-wider">Subly Support Agent</span>
              </div>
              <span className="text-[9px] font-black uppercase text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                Online
              </span>
            </div>

            {/* Bubble Messages list */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-bg-base/30">
              {chatMessages.map((msg) => {
                const isAdmin = msg.is_admin;
                
                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[75%] ${
                      isAdmin ? 'self-start text-left' : 'self-end ml-auto text-right'
                    }`}
                  >
                    <div 
                      className={`px-4.5 py-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                        isAdmin 
                          ? 'bg-bg-surface border border-border-main text-text-main rounded-tl-none' 
                          : 'bg-brand-primary text-white rounded-tr-none'
                      }`}
                    >
                      <p>{msg.message}</p>
                      {msg.image_path && (
                        <div className="mt-2.5 p-2 rounded-xl bg-slate-900/10 border border-slate-500/10 flex items-center gap-2">
                          <Image className="h-4 w-4 text-brand-primary" />
                          <span className="font-mono text-[9px] hover:underline">Attached receipt proof</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] font-black text-text-muted mt-1 select-none uppercase tracking-widest px-1">
                      {isAdmin ? 'System Support' : 'You'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border-main bg-bg-surface flex gap-3.5 items-center">
              <button 
                type="button" 
                onClick={handleAttachImage}
                className="p-2.5 rounded-xl hover:bg-border-main/40 text-text-muted hover:text-text-main transition-colors cursor-pointer"
                title="Sisipkan Bukti Bayar"
              >
                <Image className="h-5 w-5" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder={t('chatPlaceholder')}
                  className="w-full bg-bg-base/70 border border-border-main focus:border-brand-primary rounded-xl px-4 py-3 text-xs font-semibold text-text-main placeholder-text-muted/65 outline-none transition-all"
                />
                {attachedImage && (
                  <span className="absolute right-3 top-2.5 text-[8px] font-black bg-brand-primary/10 text-brand-primary border border-brand-primary/15 px-2 py-0.5 rounded uppercase">
                    Proof Attached
                  </span>
                )}
              </div>

              <Button type="submit" variant="primary" size="md">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardPanel>
        </div>

        {/* Right Column: Ticket statuses quick view */}
        <div className="lg:col-span-1">
          <CardPanel title="Info Tiket Dukungan">
            <div className="space-y-4 mt-2 text-xs select-none">
              <div className="p-3 bg-brand-primary/5 border border-brand-primary/10 text-brand-primary rounded-2xl flex items-start gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="text-[10px] leading-relaxed">
                  <p className="font-bold">Panduan Live Chat:</p>
                  <p className="mt-0.5 text-text-muted">Gunakan tombol kamera/gambar di kiri input chat untuk mensimulasikan pelampiran bukti transaksi transfer pembayaran QRIS.</p>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                <span className="text-text-muted font-semibold">User ID</span>
                <span className="font-mono text-text-main text-[11px] font-bold">#208392</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-main/40">
                <span className="text-text-muted font-semibold">SLA Respon</span>
                <span className="text-text-main font-bold">&lt; 10 Menit</span>
              </div>
            </div>
          </CardPanel>
        </div>

      </div>

    </div>
  );
};
export default SupportChat;
