// src/pages/admin/views/AdminNotificationsView.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useDataStore } from '../../../stores/useDataStore';
import { useToastStore } from '../../../stores/useToastStore';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';

export const AdminNotificationsView: React.FC = () => {
  const { notifications, adminUsers, createNotification, deleteNotification } = useDataStore();
  const { addToast } = useToastStore();

  const [title, setTitle]             = useState('');
  const [message, setMessage]         = useState('');
  const [targetUser, setTargetUser]   = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setIsSubmitting(true);
    try {
      await createNotification(title, message, targetUser === 'all' ? null : targetUser);
      setTitle(''); setMessage(''); setTargetUser('all');
      addToast({ type: 'success', title: 'Notifikasi Terkirim', message: targetUser === 'all' ? 'Notifikasi broadcast berhasil dikirim.' : 'Notifikasi dikirim ke klien target.' });
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Gagal membuat notifikasi.' });
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      addToast({ type: 'success', title: 'Notifikasi Dihapus', message: 'Notifikasi berhasil dihapus.' });
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Gagal menghapus notifikasi.' });
    }
  };

  const targetOptions = [
    { value: 'all', label: 'Broadcast (Semua Klien)' },
    ...adminUsers.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
  ];

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">Broadcast Notifikasi Klien</h1>
        <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase mt-0.5">
          Buat dan kirim notifikasi ke seluruh klien atau ke klien tertentu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <CardPanel title="BUAT NOTIFIKASI">
            <form onSubmit={handleSubmit} className="space-y-4 text-left mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">Target Klien</label>
                <Select value={targetUser} onChange={(e) => setTargetUser(e.target.value)} options={targetOptions} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">Judul Notifikasi</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Pengumuman Penting"
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">Isi Notifikasi</label>
                <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ketik isi notifikasi di sini..."
                  className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none resize-none" required />
              </div>
              <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>Kirim Notifikasi</Button>
            </form>
          </CardPanel>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2">
          <CardPanel title="RIWAYAT NOTIFIKASI">
            <div className="overflow-x-auto w-full mt-2">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest">
                    <th className="py-2.5 pb-2 px-4 font-bold">Judul & Pesan</th>
                    <th className="py-2.5 pb-2 px-4 font-bold">Penerima</th>
                    <th className="py-2.5 pb-2 px-4 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/30 text-xs">
                  {notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-border-main/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-text-main">{n.title}</span>
                          <span className="text-[10px] text-text-muted leading-relaxed">{n.message}</span>
                          <span className="text-[9px] text-text-muted/60 mt-1">{new Date(n.createdAt).toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {n.user ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs">{n.user.name}</span>
                            <span className="text-[9px] text-text-muted">{n.user.email}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded border border-brand-primary/20">SEMUA KLIEN</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleDelete(n.id)}
                          className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors active:scale-95 inline-flex" title="Hapus">
                          <Plus className="h-4 w-4 rotate-45" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {notifications.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-text-muted italic">Belum ada notifikasi yang dibuat.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardPanel>
        </div>
      </div>
    </div>
  );
};
