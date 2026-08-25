import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { Search, X, ArrowRight, Utensils, BedDouble, Compass, UserCheck, ChevronRight } from "lucide-react";
import {
  useSearch,
  normalizeText,
  scoredSearchAlgorithm,
  type SearchableItem,
  type SearchAlgorithm,
  type ShortcutItem,
} from "../../hooks/useSearch";

export type { SearchableItem, SearchAlgorithm };

/* ─── Resalta ocurrencias de query ───────────────────────── */
function highlightLabel(label: string, query: string): React.ReactNode {
  if (!label) return "";
  const normQ = normalizeText(query.trim());
  if (!normQ) return label;

  const normLabel = normalizeText(label);
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let searchFrom = 0;

  while (searchFrom < normLabel.length) {
    const idx = normLabel.indexOf(normQ, searchFrom);
    if (idx === -1) break;
    if (idx > lastIdx) nodes.push(label.slice(lastIdx, idx));
    nodes.push(
      <mark
        key={idx}
        className="font-black rounded px-0.5"
        style={{ background: "var(--color-brand)", color: "white" }}
      >
        {label.slice(idx, idx + normQ.length)}
      </mark>
    );
    lastIdx = idx + normQ.length;
    searchFrom = lastIdx;
  }

  if (lastIdx < label.length) nodes.push(label.slice(lastIdx));
  return nodes.length > 0 ? <>{nodes}</> : label;
}

/* ─── Iconos de shortcuts ───────────────────────────────── */
const SHORTCUTS: (ShortcutItem & {
  Icon: any;
  colorClass: string;
  labelKey: string;
  queryKey: string;
})[] = [
  {
    key: "food",
    Icon: Utensils,
    colorClass: "border-[#c85244] text-[#c85244] hover:bg-rose-50/50",
    labelKey: "searchShortcutFoodLabel",
    queryKey: "searchShortcutFoodQuery",
    aliasKey: "searchAliasFood",
    categories: ["Restaurante", "Restaurant"],
  },
  {
    key: "sleep",
    Icon: BedDouble,
    colorClass: "border-[#388596] text-[#388596] hover:bg-teal-50/50",
    labelKey: "searchShortcutSleepLabel",
    queryKey: "searchShortcutSleepQuery",
    aliasKey: "searchAliasSleep",
    categories: ["Hotel"],
  },
  {
    key: "things",
    Icon: Compass,
    colorClass: "border-[#e59b38] text-[#e59b38] hover:bg-amber-50/50",
    labelKey: "searchShortcutThingsLabel",
    queryKey: "searchShortcutThingsQuery",
    aliasKey: "searchAliasThings",
    categories: ["Destino", "Destination", "Imperdible", "Must-see"],
  },
  {
    key: "guides",
    Icon: UserCheck,
    colorClass: "border-[#d46597] text-[#d46597] hover:bg-pink-50/50",
    labelKey: "searchShortcutGuidesLabel",
    queryKey: "searchShortcutGuidesQuery",
    aliasKey: "searchAliasGuides",
    categories: ["Guia", "Guide"],
  },
];

/* ─── Iconos de sugerencias (SVG inline) ──────────────────── */
const SugIcon = ({ type }: { type: string }) => {
  const cls = "w-3.5 h-3.5 shrink-0";
  if (type === "food")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    );
  if (type === "bed")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
        <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
        <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
        <path d="M12 4v6" />
        <path d="M2 18h20" />
      </svg>
    );
  if (type === "landmark")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  if (type === "layers")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
};

const SUGGESTION_ICONS = ["food", "bed", "landmark", "landmark", "layers", "layers"];

/* ─── Props ──────────────────────────────────────────────── */
interface SearchBarProps {
  placeholder?: string;
  items?: SearchableItem[];
  algorithm?: SearchAlgorithm;
}

/* ═══════════════════════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════════════════════ */
export default function SearchBar({
  placeholder,
  items = [],
  algorithm = scoredSearchAlgorithm,
}: SearchBarProps) {
  const { t } = useLanguage();

  const {
    query,
    setQuery,
    clearQuery,
    results,
    currentAlgorithm,
    setAlgorithm,
  } = useSearch({
    items,
    algorithm,
    shortcuts: SHORTCUTS,
    translations: t,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [typedPlaceholder, setTypedPlaceholder] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Efecto máquina de escribir ── */
  const phrases = [
    t.searchTypewriter0,
    t.searchTypewriter1,
    t.searchTypewriter2,
    t.searchTypewriter3,
    t.searchTypewriter4,
  ];

  useEffect(() => {
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const type = () => {
      const phrase = phrases[phraseIdx];
      if (isDeleting) {
        setTypedPlaceholder(phrase.substring(0, charIdx - 1));
        charIdx--;
      } else {
        setTypedPlaceholder(phrase.substring(0, charIdx + 1));
        charIdx++;
      }
      let speed = isDeleting ? 30 : 65;
      if (!isDeleting && charIdx === phrase.length) {
        speed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        speed = 500;
      }
      timeoutId = setTimeout(type, speed);
    };

    timeoutId = setTimeout(type, 600);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Abrir dropdown cuando hay query ── */
  useEffect(() => {
    if (query.trim()) {
      setIsOpen(true);
    }
  }, [query]);

  /* ── Cerrar al hacer click fuera ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Slug de directorio por categoría ── */
  const categorySlug: Record<string, string> = {
    Hotel: "hoteles",
    Restaurante: "restaurantes",
    Restaurant: "restaurantes",
    Destino: "destinos",
    Destination: "destinos",
    Guia: "guias",
    Guide: "guias",
  };

  /* ── Navegar a un resultado ── */
  const goTo = (item: SearchableItem) => {
    setQuery(item.label);
    setIsOpen(false);
    if (item.category === "Imperdible" || item.category === "Must-see") {
      const el =
        document.querySelector("#imperdibles") ??
        document.querySelector(item.href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      const slug = categorySlug[item.category];
      if (slug) {
        window.location.href = `/directorio/${slug}?id=${item.id}`;
      } else {
        const el = document.querySelector(item.href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  /* ── Items a mostrar (con filtro openNow si se activa) ── */
  const baseItems = query.trim() ? results : openNow ? items : [];
  const displayItems = openNow
    ? baseItems // sin filtro de horario (no tenemos horario en este proyecto)
    : baseItems;

  const displayGrouped = displayItems.reduce<Record<string, SearchableItem[]>>(
    (acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    },
    {}
  );

  const grouped = results.reduce<Record<string, SearchableItem[]>>(
    (acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    },
    {}
  );

  const categoryIcons: Record<string, string> = {
    Hotel: "🏨",
    Restaurante: "🍽️",
    Restaurant: "🍽️",
    Destino: "📍",
    Destination: "📍",
    Imperdible: "⭐",
    "Must-see": "⭐",
    Guia: "🪪",
    Guide: "🪪",
  };

  const categoryGroupLabel: Record<string, string> = {
    Hotel: t.searchGroupHotel,
    Restaurante: t.searchGroupRestaurante,
    Restaurant: t.searchGroupRestaurante,
    Destino: t.searchGroupDestino,
    Destination: t.searchGroupDestino,
    Imperdible: t.searchGroupImperdible,
    "Must-see": t.searchGroupImperdible,
    Guia: t.searchGroupGuia,
    Guide: t.searchGroupGuia,
  };

  const showDropdown = isOpen;
  const suggestions = [
    t.searchSug0,
    t.searchSug1,
    t.searchSug2,
    t.searchSug3,
    t.searchSug4,
    t.searchSug5,
  ];
  const resultCount = displayItems.length;

  /* ── Renderizador de shortcuts ── */
  const renderShortcuts = (inDropdown = false) => (
    <div
      className={
        inDropdown
          ? "flex flex-wrap items-center justify-center gap-2 px-4 py-3 border-b border-slate-100 bg-white"
          : "mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
      }
    >
      {SHORTCUTS.map((sc) => {
        const Icon = sc.Icon;
        const label = t[sc.labelKey as keyof typeof t] as string;
        const qText = t[sc.queryKey as keyof typeof t] as string;
        return (
          <button
            key={sc.key}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setQuery(qText);
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-[1.5px] font-bold text-sm transition-all bg-white active:scale-95 cursor-pointer ${sc.colorClass}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className={inDropdown ? "hidden sm:inline" : ""}>{label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto relative z-40">
      {/* ── Barra de búsqueda ── */}
      <div
        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 transition-all duration-300 ${
          focused ? "ring-2 ring-[#c85244]/25 border-transparent" : ""
        } ${showDropdown ? "rounded-b-none border-b-slate-100" : ""}`}
      >
        {/* Icono lupa */}
        <div className="pl-2 sm:pl-3 shrink-0 text-slate-500">
          <Search className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          id="hero-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setQuery("");
              setIsOpen(false);
              setOpenNow(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={typedPlaceholder || placeholder || t.heroPlaceholder}
          className="flex-1 min-w-0 bg-transparent outline-none focus-visible:outline-none text-slate-700 font-medium placeholder:text-slate-400 text-sm sm:text-base py-2 sm:py-2.5"
          aria-label={t.heroAriaSearch}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          autoComplete="off"
        />

        {/* Botón limpiar */}
        {(query || openNow) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              setOpenNow(false);
              inputRef.current?.focus();
            }}
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            aria-label={t.searchClear}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Botón Buscar */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            if (query.trim()) {
              search(query);
              setIsOpen(true);
            } else {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
          className="shrink-0 bg-[#c85244] hover:bg-[#b54538] active:scale-95 text-white font-bold px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-1.5 text-sm sm:text-base cursor-pointer"
        >
          <span className="hidden sm:inline">{t.heroSearchBtn ?? "Buscar"}</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        </button>
      </div>

      {/* ── Shortcuts fuera del dropdown ── */}
      {!showDropdown && renderShortcuts(false)}

      {/* ── Dropdown unificado ── */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 bg-white rounded-b-2xl shadow-2xl border border-t-0 border-slate-100 overflow-hidden"
          style={{ animation: "dropdownIn 0.15s ease-out", zIndex: 9999 }}
          role="listbox"
          aria-label={t.searchAriaList}
        >
          {/* Shortcuts dentro del dropdown */}
          {renderShortcuts(true)}

          {/* Chip "Abierto ahora" */}
          <div className="flex gap-2 px-4 py-2.5 border-b border-slate-50">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpenNow((v) => !v);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                openNow
                  ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  openNow
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-slate-300"
                }`}
              />
              {t.searchOpenNow}
            </button>
          </div>

          {/* Contenido del dropdown */}
          {!query.trim() && !openNow ? (
            /* Sugerencias */
            <div className="p-4 pb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                {t.searchSuggestionsTitle}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {suggestions.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setQuery(label);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-full text-slate-600 text-xs font-medium hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all text-left truncate"
                  >
                    <span className="text-slate-400 shrink-0">
                      <SugIcon type={SUGGESTION_ICONS[i % SUGGESTION_ICONS.length]} />
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : displayItems.length === 0 ? (
            /* Estado vacío */
            <div className="py-10 px-6 text-center">
              <div className="text-3xl mb-2">{openNow ? "🔒" : "🔍"}</div>
              <p className="text-slate-500 font-medium">
                {openNow && !query
                  ? t.searchEmptyClosed
                  : openNow
                  ? (
                    <>
                      {t.searchEmptyOpenResults}{" "}
                      <span className="text-slate-800 font-bold">"{query}"</span>
                    </>
                  )
                  : (
                    <>
                      {t.searchEmpty}{" "}
                      <span className="text-slate-800 font-bold">"{query}"</span>
                    </>
                  )}
              </p>
              {!openNow && (
                <p className="text-slate-400 text-sm mt-1">
                  {t.searchEmptyHint}
                </p>
              )}
            </div>
          ) : (
            /* Resultados agrupados */
            <div className="max-h-80 overflow-y-auto">
              {Object.entries(displayGrouped).map(([cat, catItems]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 px-5 py-2 bg-slate-50 border-b border-slate-100">
                    <span className="text-base">{categoryIcons[cat] ?? "📌"}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {categoryGroupLabel[cat] ?? cat}
                    </span>
                  </div>
                  {catItems.map((item) => {
                    const labelNode = highlightLabel(item.label, query);
                    const sublabelNode = item.sublabel
                      ? highlightLabel(item.sublabel, query)
                      : null;
                    return (
                      <button
                        key={`${cat}-${item.id}`}
                        role="option"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          goTo(item);
                        }}
                        className="w-full flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left group border-b border-slate-50 last:border-none"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-800 font-semibold text-sm">
                            {labelNode}
                          </p>
                          {sublabelNode && (
                            <p className="text-slate-400 text-xs truncate mt-0.5">
                              {sublabelNode}
                            </p>
                          )}
                          {item.rating && (
                            <p className="text-[11px] mt-0.5" style={{ color: "var(--color-brand)" }}>
                              {"★".repeat(item.rating)}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto shrink-0 text-slate-300 group-hover:text-slate-400 transition-colors mt-0.5" />
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {resultCount}{" "}
                  {resultCount !== 1 ? t.searchResults : t.searchResult}
                  {openNow ? ` ${t.searchOpenNow.toLowerCase()}` : ""}
                </span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider">
                  {t.searchFooter}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Animación CSS ── */}
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}
