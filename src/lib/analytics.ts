/**
 * analytics.ts — Eventos de Google Analytics 4.
 * Portado de sitio-cholula y adaptado a los componentes de este proyecto.
 *
 * Todas las funciones son no-op si gtag no existe (SSR, GA sin configurar o
 * bloqueado por el navegador), así que se pueden llamar sin comprobar nada.
 */

type GtagCommand = "config" | "event" | "js" | "set";

function gtag(command: GtagCommand, ...args: unknown[]): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  w.gtag(command, ...args);
}

/** Búsqueda en el buscador del hero (tras el debounce). */
export function trackSearch(searchTerm: string, resultsCount: number): void {
  if (!searchTerm.trim()) return;
  gtag("event", "search", {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

/** Clic en un resultado del buscador. */
export function trackResultClick(itemName: string, category: string): void {
  gtag("event", "select_content", {
    content_type: category,
    item_id: itemName,
  });
}

/** Clic en una píldora de categoría del hero. */
export function trackShortcutClick(category: string): void {
  gtag("event", "shortcut_click", { category });
}

/** Clic en una card de "Visítanos". */
export function trackNavigationClick(destination: string): void {
  gtag("event", "navigation_click", { destination });
}

/** Vista de un imperdible en el carrusel. */
export function trackImperdibleView(itemName: string, category: string): void {
  gtag("event", "view_item", {
    item_name: itemName,
    item_category: category,
  });
}

/** Cambio de pestaña de categoría (imperdibles, itinerarios). */
export function trackTabClick(tabLabel: string, section: string): void {
  gtag("event", "tab_click", { tab_label: tabLabel, section });
}

/** Cambio de idioma. */
export function trackLanguageChange(lang: string): void {
  gtag("event", "language_change", { language: lang });
}

/** Clic en el botón flotante de WhatsApp. */
export function trackWhatsAppClick(): void {
  gtag("event", "whatsapp_click", {
    event_category: "contact",
    event_label: "fab",
  });
}

/** Clic en un enlace externo (Maps, Instagram, etc.). */
export function trackExternalLink(url: string): void {
  try {
    gtag("event", "click", {
      event_category: "outbound",
      event_label: url,
      link_domain: new URL(url).hostname,
      link_url: url,
    });
  } catch {
    /* URL inválida — ignorar */
  }
}

/** Profundidad de scroll (25/50/75/100). */
export function trackScrollDepth(depthPercent: number): void {
  gtag("event", "scroll", { percent_scrolled: depthPercent });
}
