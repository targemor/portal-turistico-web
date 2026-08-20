import { useState, useEffect } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import LangToggle from "./LangToggle";
import LogoTehuacan from "./LogoTehuacan";

interface NavBarProps {
  forceBackground?: boolean;
}

export default function NavBar({ forceBackground = false }: NavBarProps) {
  const { t, lang } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(forceBackground);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50 || forceBackground);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceBackground]);

  const navLinks = [
    { label: t.navWhere, href: "/directorio/hoteles" },
    { label: t.navEat, href: "/directorio/restaurantes" },
    { label: t.navDo, href: "/directorio/destinos" },
    { label: t.navGuides, href: "/directorio/guias" },
  ];

  const headerClass = isScrolled
    ? "bg-white/90 backdrop-blur-md border-b border-slate-100 py-3 shadow-sm"
    : "bg-transparent border-transparent py-6";

  const dividerClass = isScrolled ? "bg-slate-200" : "bg-white/20";
  const subtitleClass = isScrolled ? "text-slate-500" : "text-white/70";
  const linkClass = isScrolled
    ? "text-slate-600 hover:bg-slate-100"
    : "text-white hover:bg-white/20";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo multicolor SVG: YO SOY DE Tehuacán */}
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95" aria-label="Tehuacán - Inicio">
            <LogoTehuacan isScrolled={isScrolled} className="h-14 md:h-18 w-auto" />
          </a>
          <div className={`hidden sm:block h-5 w-[1px] transition-colors ${dividerClass}`}></div>
          <span className={`hidden sm:block text-[10px] font-semibold uppercase tracking-widest transition-colors ${subtitleClass}`}>
            {t.navSubtitle}
          </span>
        </div>

        {/* Desktop nav + toggle */}
        <div className="hidden md:flex gap-2 items-center">
          <nav className="flex gap-2 items-center" aria-label={t.navAriaLabel}>
            {navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-colors focus-visible:outline-none ${linkClass}`}
              >
                {label}
              </a>
            ))}
          </nav>
          {/* Language toggle — desktop */}
          <div className={`ml-4 h-5 w-[1px] transition-colors ${dividerClass}`} aria-hidden="true" />
          <LangToggle className="ml-3" />
        </div>

        {/* Mobile: lang toggle only (nav stays in BottomNav) */}
        <div className="md:hidden">
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
