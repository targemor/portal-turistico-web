import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "../../i18n/LanguageContext";

/* ─── Tipos de ítem buscable ─────────────────────────────── */
interface SearchableItem {
  id: string | number;
  label: string;
  category: string;
  sublabel?: string;
  href: string;
}

/* ─── Utilidad: normalizar texto para comparación ────────── */
function normalize(str?: string | null) {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Resalta TODAS las ocurrencias de `query` en `label`.
 */
function highlightLabel(label: string, query: string): React.ReactNode {
  if (!label) return "";
  const normQ = normalize(query.trim());
  if (!normQ) return label;

  const normLabel = normalize(label);
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
        style={{ background: "var(--color-mex-rosa)", color: "white" }}
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

/* ─── Props ──────────────────────────────────────────────── */
interface SearchBarProps {
  placeholder?: string;
  items?: SearchableItem[];
}

export default function SearchBar({
  placeholder,
  items = [],
}: SearchBarProps) {
  const { t } = useLanguage();
  const effectivePlaceholder = placeholder ?? t.heroPlaceholder;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Búsqueda con debounce ── */
  const search = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const norm = normalize(q.trim());
        if (!norm) {
          setResults([]);
          setIsOpen(false);
          document.dispatchEvent(
            new CustomEvent("portal:search", { detail: { query: "" } })
          );
          return;
        }
        const found = items.filter(
          (item) =>
            normalize(item.label).includes(norm) ||
            normalize(item.category).includes(norm) ||
            (item.sublabel && normalize(item.sublabel).includes(norm))
        );
        setResults(found);
        setIsOpen(true);
        document.dispatchEvent(
          new CustomEvent("portal:search", { detail: { query: norm, results: found } })
        );
      }, 200);
    },
    [items]
  );

  useEffect(() => {
    search(query);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  /* ── Cerrar al hacer click fuera ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
      const el = document.querySelector("#imperdibles") ?? document.querySelector(item.href);
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

  /* ── Agrupar resultados por categoría ── */
  const grouped = results.reduce<Record<string, SearchableItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const categoryIcons: Record<string, string> = {
    Hotel: "🏨",
    Restaurante: "🍽️",
    Restaurant: "🍽️",
    Destino: "📍",
    Destination: "📍",
    Imperdible: "⭐",
    "Must-see": "⭐",
  };

  const showDropdown = isOpen && query.trim().length > 0;

  const resultCount = results.length;
  const resultLabel = resultCount !== 1 ? t.searchResults : t.searchResult;

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto relative">
      {/* ── Barra de búsqueda ── */}
      <div
        className={`flex items-center gap-3 px-5 bg-white rounded-2xl shadow-2xl transition-all duration-300 ${focused ? "ring-2 ring-offset-2" : ""}`}
        style={focused ? { "--tw-ring-color": "var(--color-mex-rosa)" } as React.CSSProperties : undefined}
      >
        {/* Icono lupa */}
        <svg
          className={`shrink-0 w-5 h-5 transition-colors duration-200 ${focused ? "" : "text-slate-400"}`}
          style={focused ? { color: "var(--color-mex-rosa)" } : undefined}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          id="hero-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); if (results.length > 0) setIsOpen(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setQuery(""); setIsOpen(false); inputRef.current?.blur(); }
          }}
          placeholder={effectivePlaceholder}
          className="flex-1 h-14 bg-transparent outline-none focus-visible:outline-none text-slate-800 font-medium placeholder:text-slate-400 text-base"
          aria-label={t.heroAriaSearch}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          autoComplete="off"
        />

        {/* Botón limpiar */}
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); inputRef.current?.focus(); }}
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            aria-label={t.searchClear}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Dropdown de resultados ── */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          style={{ animation: "dropdownIn 0.18s ease-out", zIndex: 9999 }}
          role="listbox"
          aria-label={t.searchAriaList}
        >
          {results.length === 0 ? (
            <div className="py-10 px-6 text-center">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-slate-500 font-medium">
                {t.searchEmpty} <span className="text-slate-800 font-bold">"{query}"</span>
              </p>
              <p className="text-slate-400 text-sm mt-1">{t.searchEmptySub}</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {Object.entries(grouped).map(([cat, catItems]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 px-5 py-2 bg-slate-50 border-b border-slate-100">
                    <span className="text-base">{categoryIcons[cat] ?? "📌"}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {cat}s
                    </span>
                  </div>
                  {catItems.map((item) => {
                    const labelNode = highlightLabel(item.label, query);
                    const sublabelNode = item.sublabel ? highlightLabel(item.sublabel, query) : null;
                    return (
                      <button
                        key={`${cat}-${item.id}`}
                        role="option"
                        onMouseDown={(e) => { e.preventDefault(); goTo(item); }}
                        className="w-full flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left group border-b border-slate-50 last:border-none"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-800 font-semibold text-sm">{labelNode}</p>
                          {sublabelNode && (
                            <p className="text-slate-400 text-xs truncate mt-0.5">{sublabelNode}</p>
                          )}
                        </div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                          className="w-4 h-4 ml-auto shrink-0 text-slate-300 group-hover:text-slate-400 transition-colors mt-0.5">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {resultCount} {resultLabel}
                </span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider">
                  {t.searchFooter}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Animación CSS inline ── */}
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}
