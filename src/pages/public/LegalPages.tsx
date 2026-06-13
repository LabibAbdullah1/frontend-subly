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
    { id: 'terms' as LegalTab, label: t('tabTerms'), icon: <BookOpen className="h-4.5 w-4.5" /> },
    { id: 'rules' as LegalTab, label: t('tabRules'), icon: <Shield className="h-4.5 w-4.5" /> },
    { id: 'purchase' as LegalTab, label: t('tabPurchase'), icon: <CreditCard className="h-4.5 w-4.5" /> },
    { id: 'privacy' as LegalTab, label: t('tabPrivacy'), icon: <Key className="h-4.5 w-4.5" /> },
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full text-left">
      <h1 className="text-2xl font-bold text-text-main uppercase tracking-tight mb-2">{t('legalHeaderTitle')}</h1>
      <p className="text-xs text-text-muted mb-8">{t('legalHeaderSub')}</p>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-border-main pb-4 select-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-md text-xs font-medium flex items-center gap-2 border transition-all duration-150 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-brand-primary text-white border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
                : 'bg-transparent border-border-main text-text-subtle hover:bg-bg-surface hover:text-text-main'
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
            <h2 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">{t('termsTitle')}</h2>
            <p>1. <strong>{t('termsRule1Title')}</strong> {t('termsRule1Desc')}</p>
            <p>2. <strong>{t('termsRule2Title')}</strong> {t('termsRule2Desc')}</p>
            <p>3. <strong>{t('termsRule3Title')}</strong> {t('termsRule3Desc')}</p>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4 text-xs text-text-muted leading-relaxed">
            <h2 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">{t('rulesTitle')}</h2>
            <p>1. <strong>{t('rulesRule1Title')}</strong> {t('rulesRule1Desc')}</p>
            <p>2. <strong>{t('rulesRule2Title')}</strong> {t('rulesRule2Desc')}</p>
            <p>3. <strong>{t('rulesRule3Title')}</strong> {t('rulesRule3Desc')}</p>
          </div>
        )}

        {activeTab === 'purchase' && (
          <div className="space-y-4 text-xs text-text-muted leading-relaxed">
            <h2 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">{t('purchaseTitle')}</h2>
            <p>1. <strong>{t('purchaseRule1Title')}</strong> {t('purchaseRule1Desc')}</p>
            <p>2. <strong>{t('purchaseRule2Title')}</strong> {t('purchaseRule2Desc')}</p>
            <p>3. <strong>{t('purchaseRule3Title')}</strong> {t('purchaseRule3Desc')}</p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4 text-xs text-text-muted leading-relaxed">
            <h2 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">{t('privacyTitle')}</h2>
            <p>1. <strong>{t('privacyRule1Title')}</strong> {t('privacyRule1Desc')}</p>
            <p>2. <strong>{t('privacyRule2Title')}</strong> {t('privacyRule2Desc')}</p>
            <p>3. <strong>{t('privacyRule3Title')}</strong> {t('privacyRule3Desc')}</p>
          </div>
        )}
      </CardPanel>
    </div>
  );
};
export default LegalPages;
