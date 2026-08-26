/**
 * seo.ts — Constantes compartidas de SEO y analítica.
 *
 * El dominio y el ID de GA4 se leen de variables de entorno para que producción
 * y preview no compartan configuración. Ambas son públicas (viajan al cliente),
 * de ahí el prefijo PUBLIC_ que exige Astro.
 *
 * Defínelas en `.env` (local) y en el panel de Vercel (producción):
 *   PUBLIC_SITE_URL=https://visit-tehuacan.vercel.app
 *   PUBLIC_GA_ID=G-XXXXXXXXXX
 */

/** URL base sin barra final. */
export const SITE_URL = (
  import.meta.env.PUBLIC_SITE_URL || "https://visit-tehuacan.vercel.app"
).replace(/\/$/, "");

/**
 * Measurement ID de GA4 (formato G-XXXXXXXXXX).
 * Si está vacío, NO se inyecta ningún script de Google: mejor sin analítica que
 * con datos yendo a una propiedad equivocada.
 */
export const GA_MEASUREMENT_ID = import.meta.env.PUBLIC_GA_ID || "";

export const SITE_NAME = "Portal Turístico Tehuacán";

/** Centro de Tehuacán (zócalo). Usado en geo tags y en el JSON-LD. */
export const GEO = {
  lat: 18.4617,
  lng: -97.3928,
  region: "MX-PUE",
  placename: "Tehuacán, Puebla, México",
} as const;

/** Imagen por defecto para Open Graph / Twitter (1200×630). */
export const DEFAULT_OG_IMAGE = "/og-image.jpg";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Convierte una ruta relativa en absoluta; deja intactas las que ya lo son. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
