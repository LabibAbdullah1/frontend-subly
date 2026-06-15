// src/pages/dashboard/SupportChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, MessageSquare, User, X, Trash2, ArrowLeft } from 'lucide-react';
import { useDataStore } from '../../stores/useDataStore';
import { useToastStore } from '../../stores/useToastStore';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { apiFetch } from '../../utils/api';

export interface ChatClient {
  id: string;
  name: string;
  email: string;
  hasUnread: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageAt: string;
}

const UPLOADS_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
  : 'http://localhost:5000';

export const SupportChat: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { chatMessages, addChatMessage, settings, fetchChats, deleteChatMessage, fetchUnreadChatCount } = useDataStore();
  const { user } = useAuthStore();
  const slaRespon = settings.system_support_sla || '< 10 Menit';

  const isAdmin = user?.role === 'Admin';

  const [inputMsg, setInputMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Delete Confirmation States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<{ id: number; targetUserId: number } | null>(null);

  // Admin States
  const [chatClients, setChatClients] = useState<ChatClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const chatTargetId = isAdmin ? (selectedClientId ? Number(selectedClientId) : 0) : (user?.id || 0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when message list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Load chat clients for admin
  const loadChatClients = React.useCallback(async (silent = false) => {
    if (!isAdmin) return;
    if (!silent) setIsLoadingClients(true);
    try {
      const res = await apiFetch<{ success: boolean; data: ChatClient[] }>('/chats');
      setChatClients(res.data);
    } catch (err) {
      console.error('Failed to load chat clients:', err);
    } finally {
      if (!silent) setIsLoadingClients(false);
    }
  }, [isAdmin]);

  // Initial Load & Polling Interval
  useEffect(() => {
    let active = true;
    const initLoad = async () => {
      if (!active) return;
      if (isAdmin) {
        await loadChatClients();
      } else if (user) {
        await fetchChats(user.id);
      }
    };
    initLoad();
    return () => {
      active = false;
    };
  }, [isAdmin, user, fetchChats, loadChatClients]);

  useEffect(() => {
    const markReadAndFetch = async () => {
      if (isAdmin) {
        loadChatClients(true);
        if (selectedClientId) {
          await fetchChats(Number(selectedClientId));
          try {
            await apiFetch('/chats/read', {
              method: 'POST',
              body: { userId: Number(selectedClientId) }
            });
            fetchUnreadChatCount();
          } catch (e) {}
        }
      } else if (user) {
        await fetchChats(user.id);
        try {
          await apiFetch('/chats/read', {
            method: 'POST',
            body: { userId: user.id }
          });
          fetchUnreadChatCount();
        } catch (e) {}
      }
    };

    if (!isAdmin && user) {
      apiFetch('/chats/read', { method: 'POST', body: { userId: user.id } })
        .then(() => fetchUnreadChatCount())
        .catch(() => {});
    }

    const interval = setInterval(markReadAndFetch, 4000);
    return () => clearInterval(interval);
  }, [isAdmin, selectedClientId, user, fetchChats, loadChatClients, fetchUnreadChatCount]);

  const handleSelectClient = async (clientId: string) => {
    setSelectedClientId(clientId);
    await fetchChats(Number(clientId));
    // Mark as read
    try {
      await apiFetch('/chats/read', {
        method: 'POST',
        body: { userId: Number(clientId) }
      });
      // Refresh client list to clear unread badge
      loadChatClients(true);
      fetchUnreadChatCount();
    } catch (err) {
      console.error('Failed to mark chats as read:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (filePreview) URL.revokeObjectURL(filePreview);
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      addToast({
        type: 'success',
        title: t('toastImageSelectedTitle'),
        message: t('toastImageSelectedMsg').replace('{name}', file.name),
      });
    }
  };

  const handleCancelFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() && !selectedFile) return;

    if (isAdmin && !selectedClientId) {
      addToast({
        type: 'error',
        title: t('toastSendFailedTitle'),
        message: t('toastSendFailedMsg'),
      });
      return;
    }

    const targetUserId = isAdmin ? Number(selectedClientId) : 1;
    
    // Pass the actual File object
    await addChatMessage(targetUserId, inputMsg, isAdmin, selectedFile);
    
    setInputMsg('');
    handleCancelFile();
    
    addToast({
      type: 'info',
      title: t('toastMessageSentTitle'),
      message: isAdmin ? t('toastMessageSentMsgAdmin') : t('toastMessageSentMsgClient'),
    });

    if (isAdmin) {
      loadChatClients(true);
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
            {isAdmin ? t('adminSupportConsole') : t('chatTitle')}
          </h1>
          <p className="text-[10px] text-text-muted font-semibold tracking-wide uppercase mt-0.5">
            {isAdmin ? t('adminSupportConsoleDesc') : t('chatSub')}
          </p>
        </div>
        {!isAdmin && (
          <div className="text-[10px] bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider">
            {t('chatSlaLabel').replace('{sla}', slaRespon)}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-200">
        <div className="glass-panel rounded-2xl overflow-hidden border border-border-main/60 shadow-lg shadow-brand-primary/5 bg-bg-surface/50 backdrop-blur-md flex h-[580px]">
          
          {/* LEFT PANEL: Client List (Admin Only) */}
          {isAdmin && (
            <div className={`w-full md:w-80 border-r border-border-main/60 flex flex-col bg-bg-surface/20 shrink-0 ${selectedClientId ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-border-main/60 select-none">
                <span className="text-[10px] font-black uppercase text-text-muted tracking-wider block">{t('chatQueueTitle')}</span>
                <span className="text-[9px] text-text-muted mt-0.5 block">{t('chatQueueSub')}</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border-main/20">
                {chatClients.map((client) => {
                  const isSelected = selectedClientId === client.id;
                  return (
                    <button
                      key={client.id}
                      onClick={() => handleSelectClient(client.id)}
                      className={`w-full text-left p-4 transition-all hover:bg-border-main/10 flex items-start gap-3 border-none outline-none cursor-pointer ${
                      isSelected ? 'bg-brand-primary/10 border-l-4 border-l-brand-primary' : 'bg-transparent'
                      }`}
                    >
                      <div className="h-9 w-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                        <User className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-text-main truncate">{client.name}</span>
                          {client.hasUnread && (
                            <span className="h-4.5 min-w-4.5 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse shrink-0">
                              {client.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-text-muted truncate mt-0.5">{client.email}</p>
                        <p className="text-[10px] text-text-main truncate mt-2 font-medium bg-border-main/10 px-2 py-1 rounded">
                          {client.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })}
                {chatClients.length === 0 && !isLoadingClients && (
                  <div className="p-8 text-center text-xs text-text-muted italic select-none">
                    {t('chatQueueEmpty')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RIGHT PANEL: Chat Box Container */}
          <div className={`flex-1 flex flex-col h-full relative ${(!isAdmin || selectedClientId) ? 'flex' : 'hidden md:flex'}`}>
            {(!isAdmin || selectedClientId) ? (
              <>
                {/* Header chat */}
                <div className="px-6 py-4 bg-bg-surface border-b border-border-main flex items-center justify-between select-none">
                  <div className="flex items-center gap-2.5">
                    {isAdmin && selectedClientId && (
                      <button
                        onClick={() => setSelectedClientId(null)}
                        className="md:hidden p-1.5 rounded-xl hover:bg-border-main/40 text-text-muted hover:text-text-main flex items-center justify-center cursor-pointer border-none bg-transparent mr-1 shrink-0"
                        title={t('backToClientList')}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                    )}
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-text-main uppercase tracking-wider">
                      {isAdmin 
                        ? t('chatWithClientTitle').replace('{name}', chatClients.find(c => c.id === selectedClientId)?.name || '')
                        : t('chatAgentTitle')
                      }
                    </span>
                  </div>
                  <span className="text-[9px] font-bold uppercase text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full">
                    {t('chatStatusOnline')}
                  </span>
                </div>

                {/* Bubble Messages list */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-bg-base/30 flex flex-col">
                  {chatMessages.map((msg) => {
                    const isIncoming = isAdmin ? !msg.is_admin : msg.is_admin;
                    
                    return (
                      <div 
                        key={msg.id}
                        className={`flex flex-col max-w-[75%] relative group ${
                          isIncoming ? 'self-start items-start text-left' : 'self-end items-end text-right'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {!isIncoming && (
                            <button
                              onClick={() => {
                                setMessageToDelete({ id: msg.id, targetUserId: chatTargetId });
                                setDeleteConfirmOpen(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all cursor-pointer border-none bg-transparent"
                              title="Hapus Pesan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <div 
                            className={`px-4 py-2.5 rounded-xl text-xs font-medium leading-relaxed shadow-xs text-left ${
                              isIncoming 
                                ? 'bg-bg-surface border border-border-main text-text-main rounded-tl-none' 
                                : 'bg-brand-primary text-white rounded-tr-none'
                            }`}
                          >
                            {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                            {msg.image_path && (
                              <div className="mt-2 rounded-lg overflow-hidden border border-border-main/50 max-w-xs shadow-xs bg-black/25">
                                <img 
                                  src={`${UPLOADS_BASE}/${msg.image_path}`} 
                                  alt="Uploaded Attachment" 
                                  className="w-full h-auto max-h-48 object-cover cursor-pointer hover:scale-101 transition-all"
                                  onClick={() => window.open(`${UPLOADS_BASE}/${msg.image_path}`, '_blank')}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-[8px] font-semibold text-text-muted mt-1 select-none uppercase tracking-widest px-1">
                          {isIncoming 
                            ? (isAdmin ? t('chatRoleClient') : t('chatRoleAgent')) 
                            : t('chatRoleYou')
                          } • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* File Preview area before sending */}
                {filePreview && (
                  <div className="px-6 py-3 bg-bg-surface border-t border-border-main flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-border-main bg-black/10">
                        <img src={filePreview} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="text-[10px] text-text-muted truncate max-w-xs font-semibold">
                        {selectedFile?.name} ({(selectedFile ? selectedFile.size / 1024 : 0).toFixed(1)} KB)
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleCancelFile}
                      className="p-1 rounded-full hover:bg-border-main text-text-muted hover:text-red-500 cursor-pointer transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Input bar */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border-main bg-bg-surface flex gap-3.5 items-center">
                  <input 
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl hover:bg-border-main/40 text-text-muted hover:text-text-main transition-colors cursor-pointer"
                    title="Lampirkan Gambar"
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
                  </div>

                  <Button type="submit" variant="primary" size="md">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center select-none text-text-muted">
                <MessageSquare className="h-10 w-10 text-brand-primary/30" />
                <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">{t('startChatPromptTitle')}</h3>
                <p className="text-[10px] max-w-xs leading-relaxed">
                  {t('startChatPromptDesc')}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setMessageToDelete(null);
        }}
        title={t('deleteMessageConfirmTitle')}
        description={t('deleteMessageConfirmDesc')}
        size="sm"
        footerActions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setMessageToDelete(null);
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (messageToDelete) {
                  await deleteChatMessage(messageToDelete.id, messageToDelete.targetUserId);
                  addToast({
                    type: 'success',
                    title: t('toastMessageDeletedTitle'),
                    message: t('toastMessageDeletedMsg'),
                  });
                }
                setDeleteConfirmOpen(false);
                setMessageToDelete(null);
              }}
            >
              {t('yesDelete')}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl select-none">
          <Trash2 className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="text-[10px] font-semibold leading-relaxed">
            {t('deleteMessageWarningText')}
          </p>
        </div>
      </Modal>
    </div>
  );
};
export default SupportChat;
