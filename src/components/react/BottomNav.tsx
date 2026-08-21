import React, { useState, useEffect } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import LangToggle from "./LangToggle";

import { Compass, Hotel, Utensils, UserCheck } from "lucide-react";

export default function BottomNav() {
  const { t } = useLanguage();

  const navItems = [
    { id: 'destinos',     icon: Compass,   label: t.bnExplore, href: '/#destinos' },
    { id: 'hoteles',      icon: Hotel,     label: t.bnHotels,  href: '/#hoteles' },
    { id: 'restaurantes', icon: Utensils,  label: t.bnFood,    href: '/#restaurantes' },
    { id: 'guias',        icon: UserCheck, label: t.bnGuides,  href: '/#guias' },
  ];

  const [activeItem, setActiveItem] = useState<string>('destinos');

  useEffect(() => {
    const hash = window.location.hash;
    const pathname = window.location.pathname;

    let matched = false;
    for (const item of navItems) {
      if (hash && item.href.includes(hash)) {
        setActiveItem(item.id);
        matched = true;
        break;
      } else if (pathname.includes(item.href.replace('/#', ''))) {
        setActiveItem(item.id);
        matched = true;
        break;
      }
    }
    if (!matched && pathname === '/' && !hash) {
      setActiveItem(navItems[0].id);
    }

    const handleHashChange = () => {
      const currentHash = window.location.hash;
      const match = navItems.find(item => item.href.includes(currentHash));
      if (match) setActiveItem(match.id);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <>
      {/* Bottom nav (solo mobile) */}
      <div
        id="bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-between shadow-lg"
        role="navigation"
        aria-label={t.bnAriaLabel}
      >
        {/* Nav items distribuidos equitativamente */}
        <nav className="flex-1 grid grid-cols-4 items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={item.href}
                id={`bn-${item.id}`}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-[#C82E31] font-black'
                    : 'text-slate-400 hover:text-slate-600 font-bold'
                }`}
                onClick={() => setActiveItem(item.id)}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] tracking-tight uppercase leading-none">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Divisor vertical */}
        <div className="w-px h-7 bg-slate-200 shrink-0 mx-2" aria-hidden="true" />

        {/* Selector de idioma */}
        <div className="shrink-0">
          <LangToggle isScrolled={true} />
        </div>
      </div>
    </>
  );
}
