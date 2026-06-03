import { useSystemStore } from '../stores/useSystemStore';
import { translations } from '../i18n/translations';
import type { TranslationKeys } from '../i18n/translations';

export const useTranslation = () => {
  const language = useSystemStore((state) => state.language);

  const t = (key: TranslationKeys): string => {
    return translations[language][key] || key;
  };

  return { t, language };
};
export default useTranslation;
