import { useState, useEffect } from "react";
import MenuIcon from "../../assets/icons/MenuIcon";
import CloseIcon from "../../assets/icons/CloseIcon";
const navLinks = [
  { label: "Donde hospedarse", href: "#hoteles" },
  { label: "Donde comer", href: "#restaurantes" },
  { label: "Que hacer", href: "#destinos" },
  { label: "Guias Turisticos", href: "#guias" },
];

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerClass = isScrolled
    ? "bg-white/90 backdrop-blur-md border-b border-slate-100 py-3 shadow-sm"
    : "bg-transparent border-transparent py-6";

  const dividerClass = isScrolled ? "bg-slate-200" : "bg-white/20";
  const subtitleClass = isScrolled ? "text-slate-500" : "text-white/70";
  
  const linkClass = isScrolled
    ? "text-slate-600 hover:bg-slate-100"
    : "text-white hover:bg-white/20";

  const mobileBtnClass = isScrolled ? "text-slate-600" : "text-white";

  // Paleta multicolor "México" para el logo letra a letra
  const logoLetters = [
    { letter: "T", color: "#C82E31" },
    { letter: "E", color: "#E6007E" },
    { letter: "H", color: "#F39200" },
    { letter: "U", color: "#7D287E" },
    { letter: "A", color: "#82BC00" },
    { letter: "C", color: "#009BA4" },
    { letter: "Á", color: "#E6007E" },
    { letter: "N", color: "#F39200" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo multicolor */}
        <div className="flex items-center gap-4">
          <a href="/" className="flex text-2xl font-black tracking-tighter">
            {logoLetters.map(({ letter, color }, i) => (
              <span
                key={i}
                style={{ color: isScrolled ? color : "white" }}
                className="transition-colors duration-300"
              >
                {letter}
              </span>
            ))}
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

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden p-2 rounded-md transition-colors ${mobileBtnClass}`}
          aria-label="Abrir menú"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? (
            <CloseIcon className="w-6 h-6" />
          ) : (
            <MenuIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"} bg-white border-b border-slate-200 shadow-md`}
      >
        <nav className="flex flex-col px-6 py-3 gap-1">
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-md text-slate-700 hover:text-brand hover:bg-slate-50 text-sm font-bold uppercase tracking-wide transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
