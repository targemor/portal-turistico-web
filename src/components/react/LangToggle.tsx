/**
 * react/LangToggle.tsx
 * Componente de toggle de idioma reutilizable.
 * Muestra únicamente una opción a la vez para cambiar de idioma.
 */

import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface LangToggleProps {
  /** Clases CSS adicionales para el botón */
  className?: string;
  /** Indica si la barra de navegación está con fondo blanco por scroll */
  isScrolled?: boolean;
}

export default function LangToggle({ className = '', isScrolled = false }: LangToggleProps) {
  const { lang, setLang, t } = useLanguage();

  const handleToggle = () => {
    setLang(lang === 'es' ? 'en' : 'es');
  };

  const nextLang = lang === 'es' ? 'en' : 'es';
  const label = nextLang === 'en' ? 'EN' : 'ES';
  const flag = nextLang === 'en' ? '🇺🇸' : '🇲🇽';
  const ariaLabel = nextLang === 'en' ? t.ariaEn : t.ariaEs;

  const btnStyle = isScrolled
    ? 'border-slate-200 bg-slate-100/80 hover:bg-slate-200 text-slate-700 shadow-xs'
    : 'border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md shadow-xs';

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer outline-none select-none active:scale-95 ${btnStyle} ${className}`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span role="img" aria-hidden="true" className="text-sm leading-none">{flag}</span>
      <span>{label}</span>
    </button>
  );
}

