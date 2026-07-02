import { useState, useEffect } from "react";

const navLinks = [
  { label: "Donde hospedarse", href: "/directorio/hoteles" },
  { label: "Donde comer", href: "/directorio/restaurantes" },
  { label: "Que hacer", href: "/directorio/destinos" },
  { label: "Guias Turisticos", href: "/directorio/guias" },
];

interface NavBarProps {
  forceBackground?: boolean;
}

export default function NavBar({ forceBackground = false }: NavBarProps) {
  const [isScrolled, setIsScrolled] = useState(forceBackground);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50 || forceBackground);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceBackground]);

  const headerClass = isScrolled
    ? "bg-white/90 backdrop-blur-md border-b border-slate-100 py-3 shadow-sm"
    : "bg-transparent border-transparent py-6";

  const dividerClass = isScrolled ? "bg-slate-200" : "bg-white/20";
  const subtitleClass = isScrolled ? "text-slate-500" : "text-white/70";

  const linkClass = isScrolled
    ? "text-slate-600 hover:bg-slate-100"
    : "text-white hover:bg-white/20";


  // Paleta multicolor "México" para el logo letra a letra
  const logoLetters = [
    { letter: "T", color: "var(--color-mex-rojo)" },
    { letter: "E", color: "var(--color-mex-rosa)" },
    { letter: "H", color: "var(--color-mex-naranja)" },
    { letter: "U", color: "var(--color-mex-purpura)" },
    { letter: "A", color: "var(--color-mex-verde)" },
    { letter: "C", color: "var(--color-mex-turquesa)" },
    { letter: "Á", color: "var(--color-mex-rosa)" },
    { letter: "N", color: "var(--color-mex-naranja)" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo multicolor */}
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter">
            <img
              src="/sanando_tehuacan.png"
              alt="Sanando Tehuacán"
              className="h-10 md:h-12 w-auto object-contain"
            />
            <div className="flex">
              {logoLetters.map(({ letter, color }, i) => (
                <span
                  key={i}
                  style={{ color: isScrolled ? color : "white" }}
                  className="transition-colors duration-300"
                >
                  {letter}
                </span>
              ))}
            </div>
          </a>
          <div className={`hidden sm:block h-5 w-[1px] transition-colors ${dividerClass}`}></div>
          <span className={`hidden sm:block text-[10px] font-semibold uppercase tracking-widest transition-colors ${subtitleClass}`}>
            Cuna del Maíz
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-2 items-center" aria-label="Navegación principal">
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
      </div>
    </header>
  );
}
