import { useState, useEffect, useRef, useCallback } from "react";

export interface SearchableItem {
  id: string | number;
  label: string;
  category: string;
  sublabel?: string;
  href: string;
  searchKeywords?: string;
  rating?: number;
}

export interface ShortcutItem {
  key: string;
  aliasKey: string;
  categories: string[];
}

export interface SearchAlgorithmContext {
  shortcuts?: ShortcutItem[];
  translations?: Record<string, any>;
}

export interface SearchAlgorithm {
  name: string;
  description?: string;
  search: (
    query: string,
    items: SearchableItem[],
    context?: SearchAlgorithmContext
  ) => SearchableItem[];
}

/* ─── Utilidad: normalizar texto para comparación ────────── */
export function normalizeText(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* ─── Helper de coincidencia por palabra ─────────────────── */
function matchesWord(queryWord: string, text: string): boolean {
  if (queryWord.length < 2) return false;
  const tokens = text.split(/[\s,·\/\-–•()]+/).filter((w) => w.length > 1);
  return tokens.some(
    (token) => queryWord.startsWith(token) || token.startsWith(queryWord)
  );
}

/**
 * 1. Algoritmo por Scoring (Default)
 * Evalúa relevancia por coincidencia de palabras, tokens, categoría, subetiqueta y regex exacta.
 */
export const scoredSearchAlgorithm: SearchAlgorithm = {
  name: "scored",
  description: "Algoritmo por scoring de relevancia, palabras clave y alias",
  search: (query, items, context) => {
    const norm = normalizeText(query.trim());
    if (!norm) return [];

    const shortcuts = context?.shortcuts || [];
    const t = context?.translations || {};

    // ¿Coincide con algún alias de shortcut?
    const shortcut = shortcuts.find((sc) => {
      const aliasVal = t[sc.aliasKey];
      if (!aliasVal) return false;
      return aliasVal
        .split(",")
        .some((alias: string) => normalizeText(alias) === norm);
    });

    if (shortcut) {
      return items.filter((item) => shortcut.categories.includes(item.category));
    }

    const queryWords = norm.split(/\s+/).filter(Boolean);
    const escapeRE = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const exactRx = new RegExp("\\b" + escapeRE(norm), "i");

    const scored = items.map((item) => {
      const nLabel = normalizeText(item.label);
      const nCat = normalizeText(item.category);
      const nSub = normalizeText(item.sublabel);
      const nKw = normalizeText(item.searchKeywords);

      let score = 0;
      queryWords.forEach((word) => {
        let ws = 0;
        if (matchesWord(word, nLabel)) ws += 3;
        if (matchesWord(word, nCat)) ws += 2;
        if (matchesWord(word, nSub)) ws += 1;
        if (matchesWord(word, nKw)) ws += 1;
        if (ws > 0) score += ws;
      });

      if (exactRx.test(nLabel)) score += 5;
      else if (exactRx.test(nSub) || exactRx.test(nKw)) score += 2;
      else if (exactRx.test(nCat)) score += 1;

      return { item, score };
    });

    return scored
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);
  },
};

/**
 * 2. Algoritmo Simple (Inclusión por Subcadena)
 * Filtrado rápido por inclusión directa del texto normalizado en cualquier campo.
 */
export const simpleSearchAlgorithm: SearchAlgorithm = {
  name: "simple",
  description: "Búsqueda rápida por subcadena",
  search: (query, items) => {
    const norm = normalizeText(query.trim());
    if (!norm) return [];

    return items.filter((item) => {
      const nLabel = normalizeText(item.label);
      const nCat = normalizeText(item.category);
      const nSub = normalizeText(item.sublabel);
      const nKw = normalizeText(item.searchKeywords);

      return (
        nLabel.includes(norm) ||
        nCat.includes(norm) ||
        nSub.includes(norm) ||
        nKw.includes(norm)
      );
    });
  },
};

export interface UseSearchProps {
  items: SearchableItem[];
  algorithm?: SearchAlgorithm;
  debounceMs?: number;
  shortcuts?: ShortcutItem[];
  translations?: Record<string, any>;
  onSearch?: (query: string, results: SearchableItem[]) => void;
}

export function useSearch({
  items,
  algorithm = scoredSearchAlgorithm,
  debounceMs = 200,
  shortcuts = [],
  translations = {},
  onSearch,
}: UseSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<SearchAlgorithm>(algorithm);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mantener actualizado el algoritmo si cambia la prop
  useEffect(() => {
    if (algorithm) {
      setCurrentAlgorithm(algorithm);
    }
  }, [algorithm]);

  const executeSearch = useCallback(
    (q: string, algoToUse = currentAlgorithm) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        const norm = normalizeText(q.trim());
        if (!norm) {
          setResults([]);
          setIsSearching(false);
          if (onSearch) onSearch("", []);
          document.dispatchEvent(
            new CustomEvent("portal:search", { detail: { query: "" } })
          );
          return;
        }

        const found = algoToUse.search(q, items, { shortcuts, translations });
        setResults(found);
        setIsSearching(false);

        if (onSearch) onSearch(norm, found);
        document.dispatchEvent(
          new CustomEvent("portal:search", {
            detail: { query: norm, results: found, algorithm: algoToUse.name },
          })
        );
      }, debounceMs);
    },
    [items, currentAlgorithm, shortcuts, translations, debounceMs, onSearch]
  );

  useEffect(() => {
    executeSearch(query);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, executeSearch]);

  const setAlgorithm = useCallback((newAlgo: SearchAlgorithm) => {
    setCurrentAlgorithm(newAlgo);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return {
    query,
    setQuery,
    clearQuery,
    results,
    isSearching,
    currentAlgorithm,
    setAlgorithm,
  };
}
