/**
 * i18n/LanguageContext.tsx
 * React Context para el idioma activo.
 * - Lee la preferencia de localStorage al montar.
 * - Emite el evento "portal:lang-change" al cambiar idioma para que los
 *   componentes Astro estáticos también se actualicen.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, type Lang, type Translations } from './translations';

interface LanguageContextValue {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'es',
  t: translations.es,
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');

  // Init: read from localStorage on client
  useEffect(() => {
    const saved = localStorage.getItem('portal-lang') as Lang | null;
    if (saved === 'es' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  // When lang changes, persist and notify static Astro components
  useEffect(() => {
    document.documentElement.lang = lang;
    document.dispatchEvent(
      new CustomEvent('portal:lang-change', { detail: { lang } })
    );
  }, [lang]);

  const setLang = useCallback((newLang: Lang) => {
    localStorage.setItem('portal-lang', newLang);
    setLangState(newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
