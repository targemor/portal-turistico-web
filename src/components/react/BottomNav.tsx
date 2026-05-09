import React, { useState, useEffect } from "react";

// Iconos SVG en línea
const MessageCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
  </svg>
);

const PaperPlaneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <polygon points="3 11 22 2 13 21 11 13 3 11" fill="currentColor" fillOpacity="0.1"/>
  </svg>
);

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const UtensilsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M18 8h1a4 4 0 010 8h-1"/>
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const navItems = [
  { id: 'destinos', label: 'Explora', href: '/#destinos', icon: PaperPlaneIcon },
  { id: 'hoteles', label: 'Hoteles', href: '/#hoteles', icon: HomeIcon },
  { id: 'restaurantes', label: 'Cocina', href: '/#restaurantes', icon: UtensilsIcon },
  { id: 'guias', label: 'Guías', href: '/#guias', icon: UserIcon },
];

export default function BottomNav() {
  const [activeItem, setActiveItem] = useState<string>('destinos'); // default

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
    
    // Opcional: Escuchar eventos de cambio de hash si navegamos estando en la misma página
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
      {/* FAB flotante (WhatsApp / Chat) */}
      <a
        href="#"
        id="fab-chat"
        aria-label="Abrir chat"
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-40 p-4 rounded-2xl shadow-2xl text-white transform transition-all hover:scale-110 active:scale-95"
        style={{ 
          backgroundColor: 'var(--color-mex-rosa)', 
          boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--color-mex-rosa) 25%, transparent)' 
        }}
      >
        <MessageCircleIcon className="w-6 h-6" />
      </a>

      {/* Bottom nav (solo mobile) */}
      <div
        id="bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-8 py-3 flex justify-between items-center shadow-lg"
        role="navigation"
        aria-label="Navegación principal móvil"
      >
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;
          
          return (
            <a 
              key={item.id}
              href={item.href} 
              id={`bn-${item.id}`} 
              className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-orange-600' : 'text-slate-400'}`}
              onClick={() => setActiveItem(item.id)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase">{item.label}</span>
            </a>
          );
        })}
      </div>
    </>
  );
}
