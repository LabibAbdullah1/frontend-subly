// src/pages/public/LegalPages.tsx
import React, { useState } from 'react';
import { Shield, BookOpen, CreditCard, Key } from 'lucide-react';
import { CardPanel } from '../../components/ui/CardPanel';
import { useTranslation } from '../../hooks/useTranslation';

type LegalTab = 'terms' | 'rules' | 'purchase' | 'privacy';

export const LegalPages: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<LegalTab>('terms');

  const tabs = [
    { id: 'terms' as LegalTab, label: 'Syarat & Ketentuan', icon: <BookOpen className="h-4.5 w-4.5" /> },
    { id: 'rules' as LegalTab, label: 'Aturan Server', icon: <Shield className="h-4.5 w-4.5" /> },
    { id: 'purchase' as LegalTab, label: 'Ketentuan Pembelian', icon: <CreditCard className="h-4.5 w-4.5" /> },
    { id: 'privacy' as LegalTab, label: 'Kebijakan Privasi', icon: <Key className="h-4.5 w-4.5" /> },
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full text-left">
      <h1 className="text-2xl font-black text-text-main uppercase tracking-tight mb-2">Legal & Documentation</h1>
      <p className="text-xs text-text-muted mb-8">Informasi regulasi penggunaan server, ketentuan hosting gratis, dan transaksi cPanel Subly.</p>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-border-main pb-4 select-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-brand-primary text-white border-transparent shadow-md shadow-brand-primary/15'
                : 'border-border-main text-text-muted hover:bg-border-main/20 hover:text-text-main'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <CardPanel>
        {activeTab === 'terms' && (
          <div className="space-y-4 text-xs text-text-muted leading-relaxed">
            <h2 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">Syarat & Ketentuan Layanan (Terms of Service)</h2>
            <p>1. <strong>Penggunaan Subdomain:</strong> Subdomain yang diklaim sepenuhnya milik sistem Subly dan dialokasikan untuk memfasilitasi hosting portofolio web Anda.</p>
            <p>2. <strong>Batas Penyimpanan:</strong> Pengguna dilarang keras mengunggah berkas di luar kepentingan website. Server ini bukan media file sharing.</p>
            <p>3. <strong>Penyalahgunaan Akun:</strong> Kami berhak menutup subdomain yang terdeteksi melakukan brute force, port scanning, phishing, atau penyebaran malware.</p>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4 text-xs text-text-muted leading-relaxed">
            <h2 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">Aturan Penggunaan Server & Hosting</h2>
            <p>1. <strong>Script Berbahaya:</strong> Dilarang memasang cron job dengan frekuensi berlebihan (&lt; 1 menit) atau script shell backdoor.</p>
            <p>2. <strong>Alokasi Database:</strong> Setiap database hanya boleh digunakan oleh satu virtual host subdomain yang valid.</p>
            <p>3. <strong>Deprovisioning:</strong> Subdomain yang kedaluwarsa lebih dari 7 hari akan dihapus otomatis dari server demi menjaga disk storage global.</p>
          </div>
        )}

        {activeTab === 'purchase' && (
          <div className="space-y-4 text-xs text-text-muted leading-relaxed">
            <h2 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">Ketentuan Pembelian & Transaksi</h2>
            <p>1. <strong>Pembayaran QRIS:</strong> Pembayaran menggunakan QRIS dinamis/statis bersifat final dan instan.</p>
            <p>2. <strong>Voucher Diskon:</strong> Kode diskon hanya berlaku sekali per akun saat mengklaim subdomain atau melakukan perpanjangan paket.</p>
            <p>3. <strong>Refund Policy:</strong> Tidak ada kebijakan refund untuk paket hosting yang telah aktif atau salah klaim nama subdomain.</p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4 text-xs text-text-muted leading-relaxed">
            <h2 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">Kebijakan Privasi Pengguna</h2>
            <p>1. <strong>Pengumpulan Informasi:</strong> Kami hanya menyimpan nama lengkap, email, IP login, dan kode checkout transaksi pembayaran.</p>
            <p>2. <strong>Keamanan Berkas:</strong> Berkas PHP/NodeJS Anda aman di direktori terenkripsi dan tidak akan dibagikan ke pihak ketiga mana pun.</p>
            <p>3. <strong>Penghapusan Data:</strong> Pengguna dapat mengajukan penghapusan akun permanen melalui tiket bantuan dukungan live chat cPanel.</p>
          </div>
        )}
      </CardPanel>
    </div>
  );
};
export default LegalPages;
