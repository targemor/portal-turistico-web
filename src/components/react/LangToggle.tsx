/**
 * react/LangToggle.tsx
 * Componente de toggle de idioma reutilizable.
 * Muestra 🇲🇽 ES | 🇺🇸 EN.
 */

import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Lang } from '../../i18n/translations';

interface LangToggleProps {
  /** Clases CSS adicionales para el contenedor */
  className?: string;
}

export default function LangToggle({ className = '' }: LangToggleProps) {
  const { lang, setLang, t } = useLanguage();

  const handleToggle = (newLang: Lang) => {
    setLang(newLang);
  };

  const btnBase =
    'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border-none outline-none select-none';
  const btnActive =
    'bg-white/25 text-white shadow-sm';
  const btnInactive =
    'bg-transparent text-white/60 hover:text-white hover:bg-white/12';

  return (
    <div
      className={`flex items-center gap-1 rounded-full border border-white/20 bg-black/30 backdrop-blur-md px-1 py-1 shadow-md ${className}`}
      role="group"
      aria-label={t.ariaLangToggle}
    >
      <button
        onClick={() => handleToggle('es')}
        className={`${btnBase} ${lang === 'es' ? btnActive : btnInactive}`}
        aria-label={t.ariaEs}
        aria-pressed={lang === 'es'}
      >
        <span role="img" aria-hidden="true" className="text-base leading-none">🇲🇽</span>
        <span>ES</span>
      </button>
      <div className="w-px h-4 bg-white/20 flex-shrink-0" aria-hidden="true" />
      <button
        onClick={() => handleToggle('en')}
        className={`${btnBase} ${lang === 'en' ? btnActive : btnInactive}`}
        aria-label={t.ariaEn}
        aria-pressed={lang === 'en'}
      >
        <span role="img" aria-hidden="true" className="text-base leading-none">🇺🇸</span>
        <span>EN</span>
      </button>
    </div>
  );
}
