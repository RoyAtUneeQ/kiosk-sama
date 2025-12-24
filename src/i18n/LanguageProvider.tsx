import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@/hooks';

export interface LanguageOption {
  code: string;
  label: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
  isActive: boolean;
}

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  availableLanguages: string[];
  isRTL: boolean;
  languageOptions: LanguageOption[];
  getActiveLanguage: () => LanguageOption | undefined;
  getLanguageByCode: (code: string) => LanguageOption | undefined;
  switchLanguage: (code: string) => boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Centralized language metadata
const LANGUAGE_METADATA = {
  en: { nativeName: 'English', flag: '🇺🇸', isRTL: false },
  fr: { nativeName: 'Français', flag: '🇫🇷', isRTL: false },
  es: { nativeName: 'Español', flag: '🇪🇸', isRTL: false },
  ja: { nativeName: '日本語', flag: '🇯🇵', isRTL: false },
  ar: { nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
  pt: { nativeName: 'Português', flag: '🇵🇹', isRTL: false },
  de: { nativeName: 'Deutsch', flag: '🇩🇪', isRTL: false },
} as const;

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isRTL, setIsRTL] = useState(false);

  const { config } = useConfig();
  const availableLanguages = Object.keys(config?.personas || {});

  // Helper function to check if language is RTL
  const isLanguageRTL = (language: string): boolean => {
    return LANGUAGE_METADATA[language as keyof typeof LANGUAGE_METADATA]?.isRTL || false;
  };

  // Create language options with all metadata
  const languageOptions: LanguageOption[] = availableLanguages
    .filter(code => availableLanguages.includes(code.toLowerCase()))
    .map((code) => ({
      code,
      label: t(`languages.${code}`),
      nativeName: LANGUAGE_METADATA[code as keyof typeof LANGUAGE_METADATA]?.nativeName || code,
      flag: LANGUAGE_METADATA[code as keyof typeof LANGUAGE_METADATA]?.flag || '🌐',
      isRTL: LANGUAGE_METADATA[code as keyof typeof LANGUAGE_METADATA]?.isRTL || false,
      isActive: currentLanguage === code,
    }));

  const changeLanguage = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      const rtl = isLanguageRTL(language);
      setIsRTL(rtl);
      
      // Update document direction and language
      document.documentElement.lang = language;
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
      
      // Store language preference
      localStorage.setItem('preferred-language', language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // Helper functions
  const getActiveLanguage = () => languageOptions.find(lang => lang.isActive);
  
  const getLanguageByCode = (code: string) => languageOptions.find(lang => lang.code === code);
  
  const switchLanguage = (code: string) => {
    const language = getLanguageByCode(code);
    if (language) {
      changeLanguage(code);
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Initialize RTL state based on current language
    const rtl = isLanguageRTL(currentLanguage);
    setIsRTL(rtl);
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  useEffect(() => {
    // Listen for language changes from i18n
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    availableLanguages,
    isRTL,
    languageOptions,
    getActiveLanguage,
    getLanguageByCode,
    switchLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 