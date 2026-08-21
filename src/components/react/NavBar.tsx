import { useState, useEffect } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import LangToggle from "./LangToggle";
import LogoTehuacan from "./LogoTehuacan";

interface NavBarProps {
  forceBackground?: boolean;
}

export default function NavBar({ forceBackground = false }: NavBarProps) {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(forceBackground);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30 || forceBackground);
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

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 py-3.5 shadow-xs transition-all duration-300">
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo multicolor SVG: YO SOY DE Tehuacán */}
        <div
          className="flex items-center gap-4"
          style={{
            transform: isScrolled ? "translateY(0)" : "translateY(-6px)",
            transition: "transform 400ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <a href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95" aria-label="Tehuacán - Inicio">
            <LogoTehuacan isScrolled={isScrolled} baseColor="var(--color-mex-rojo, #C82E31)" className="h-14 md:h-16 w-auto" />
          </a>
          {/* Separador y subtítulo: se ocultan antes del scroll */}
          <div
            className="hidden sm:block h-5 w-[1px] bg-slate-200"
            aria-hidden="true"
            style={{ opacity: isScrolled ? 1 : 0, transition: "opacity 300ms ease" }}
          />
          <span
            className="hidden sm:block text-[10px] font-semibold uppercase tracking-widest text-slate-500"
            style={{ opacity: isScrolled ? 1 : 0, transition: "opacity 300ms ease" }}
          >
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
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none"
              >
                {label}
              </a>
            ))}
          </nav>
          {/* Language toggle — desktop */}
          <div className="ml-4 h-5 w-[1px] bg-slate-200" aria-hidden="true" />
          <LangToggle isScrolled={true} className="ml-3" />
        </div>

        {/* Mobile: lang toggle only (nav stays in BottomNav) */}
        <div className="md:hidden">
          <LangToggle isScrolled={true} />
        </div>
      </div>
    </header>
  );
}
