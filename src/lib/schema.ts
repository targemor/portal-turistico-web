/**
 * schema.ts — Constructores de JSON-LD (schema.org).
 * Portado de sitio-cholula (`lib/home-schema.ts`) y ampliado con ItemList para
 * los imperdibles y las páginas de directorio.
 *
 * Dos reglas que se respetan aquí a propósito:
 *
 * 1. NO se emite `aggregateRating`. Las valoraciones que guarda el JSON vienen
 *    de Google Maps; publicarlas como reseñas propias del sitio incumple las
 *    guías de datos estructurados de Google y expone a una acción manual.
 *
 * 2. Los datos de contacto de relleno que arrastra el seed (teléfonos 238000…,
 *    correos hola@…, dominios www.<slug>.com) se filtran. Un teléfono falso en
 *    el JSON-LD es peor que no poner ninguno.
 */
import { SITE_URL, SITE_NAME, GEO, absoluteUrl } from "./seo";

/* ─── Utilidades ─────────────────────────────────────────────── */

/** Teléfono de relleno: seis o más ceros seguidos. */
function realPhone(tel?: string | null): string | undefined {
  if (!tel) return undefined;
  const digits = tel.replace(/\D/g, "");
  if (digits.length < 10 || /0{6,}/.test(digits)) return undefined;
  return `+52${digits.slice(-10)}`;
}

/** Correo de relleno: hola@<algo>.com generado por el seed. */
function realEmail(email?: string | null): string | undefined {
  if (!email) return undefined;
  if (/^hola@[a-z0-9-]+\.com$/i.test(email.trim())) return undefined;
  return email.trim();
}

/** Sitio de relleno: https://www.<slug>.com generado por el seed. */
function realSite(url?: string | null, slug?: string): string | undefined {
  if (!url) return undefined;
  const u = url.trim();
  if (slug && new RegExp(`^https?://(www\\.)?${slug}\\.com/?$`, "i").test(u)) {
    return undefined;
  }
  return u;
}

function firstImage(item: any): string | undefined {
  const url = item?.galeria?.[0]?.url;
  return url ? absoluteUrl(url) : undefined;
}

/** Quita las claves undefined para no ensuciar el JSON-LD. */
function clean<T extends Record<string, any>>(obj: T): T {
  Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
  return obj;
}

function splitList(value?: string | null): string[] | undefined {
  if (!value) return undefined;
  const parts = value
    .split(/[,/]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

/**
 * Solo afirmamos localidad/estado cuando la propia cadena dice "Tehuacán".
 * Hay fichas cuya dirección de Google cae fuera del municipio (la Reserva de la
 * Biosfera resuelve a Santiago Suchilquitongo, Oaxaca): rellenar ahí
 * addressLocality con "Tehuacán" sería publicar una dirección falsa.
 */
function postalAddress(street?: string | null) {
  if (!street) return undefined;
  // "Tehuacán, Pue." es como cierran las direcciones del municipio. Exigir la
  // coma + estado evita falsos positivos como la carretera "Oaxaca-Tehuacán".
  const enTehuacan = /tehuac[áa]n,\s*pue/i.test(street);
  return clean({
    "@type": "PostalAddress",
    streetAddress: street,
    addressLocality: enTehuacan ? "Tehuacán" : undefined,
    addressRegion: enTehuacan ? "Puebla" : undefined,
    addressCountry: "MX",
  });
}

/* ─── Entidades base del sitio ───────────────────────────────── */

export function touristDestination() {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: "Tehuacán",
    alternateName: [
      "Tehuacán de las Granadas",
      "Cuna del Maíz",
      "Portal Turístico Tehuacán",
    ],
    description:
      "Tehuacán, Puebla, es la puerta al Valle de Tehuacán-Cuicatlán, Patrimonio Mundial Mixto de la UNESCO desde 2018 y hogar del bosque de cactáceas columnares más denso del planeta. Sus cuevas conservan el registro arqueológico de maíz más antiguo de México y sus manantiales dieron fama al agua mineral mexicana.",
    url: SITE_URL,
    image: absoluteUrl("/og-image.jpg"),
    geo: {
      "@type": "GeoCoordinates",
      latitude: GEO.lat,
      longitude: GEO.lng,
    },
    containedInPlace: {
      "@type": "State",
      name: "Puebla",
      containedInPlace: { "@type": "Country", name: "México" },
    },
    touristType: [
      "Turistas culturales",
      "Turistas de naturaleza",
      "Turistas gastronómicos",
      "Familias",
    ],
    hasMap: "https://www.google.com/maps/place/Tehuac%C3%A1n,+Pue.",
  };
}

export function webSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Guía turística oficial de Tehuacán, Puebla: hoteles, restaurantes, destinos y guías certificados.",
    inLanguage: "es-MX",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo_color.png"),
    areaServed: { "@type": "City", name: "Tehuacán" },
  };
}

/* ─── Home ───────────────────────────────────────────────────── */

export function imperdiblesItemList(imperdibles: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Imperdibles de Tehuacán",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: imperdibles.length,
    itemListElement: imperdibles.map((it, i) =>
      clean({
        "@type": "ListItem",
        position: i + 1,
        item: clean({
          "@type": "TouristAttraction",
          name: it.nombre,
          description: it.descripcion_corta || undefined,
          image: firstImage(it),
          geo:
            typeof it.lat === "number" && typeof it.lng === "number"
              ? {
                  "@type": "GeoCoordinates",
                  latitude: it.lat,
                  longitude: it.lng,
                }
              : undefined,
          address: postalAddress(it.googleMapsInfo?.formattedAddress),
          hasMap: it.direccion_google_maps || undefined,
          openingHours: it.horarios || undefined,
          isAccessibleForFree:
            typeof it.precio === "string" && /gratis/i.test(it.precio)
              ? true
              : undefined,
          telephone: realPhone(it.contacto?.telefono),
          email: realEmail(it.contacto?.email),
          url: realSite(it.contacto?.sitio_web, it.slug),
        }),
      })
    ),
  };
}

export function buildHomeSchemas(imperdibles: any[] = []): object[] {
  const schemas: object[] = [touristDestination(), webSite(), organization()];
  if (imperdibles.length) schemas.push(imperdiblesItemList(imperdibles));
  return schemas;
}

/* ─── Directorio ─────────────────────────────────────────────── */

const CATEGORIA_META: Record<
  string,
  { label: string; type: string; singular: string }
> = {
  hoteles: { label: "Hoteles", type: "Hotel", singular: "hotel" },
  restaurantes: {
    label: "Restaurantes",
    type: "Restaurant",
    singular: "restaurante",
  },
  destinos: {
    label: "Destinos turísticos",
    type: "TouristAttraction",
    singular: "destino",
  },
  guias: { label: "Guías turísticos", type: "Person", singular: "guía" },
};

function directorioItem(categoria: string, item: any) {
  const meta = CATEGORIA_META[categoria];
  const base: Record<string, any> = {
    "@type": meta.type,
    name: item.nombre,
    image: firstImage(item),
    telephone: realPhone(item.contacto?.telefono),
    email: realEmail(item.contacto?.email),
  };

  if (categoria === "guias") {
    return clean({
      ...base,
      jobTitle: "Guía de turistas certificado por SECTUR",
      knowsAbout: splitList(item.especialidad),
      workLocation: postalAddress(item.ubicacion),
      url: realSite(item.contacto?.sitio_web),
    });
  }

  base.description = item.descripcion || item.descripcion_corta || undefined;
  base.address = postalAddress(
    item.direccion || item.google_maps_formatted_address
  );
  base.url = realSite(item.contacto?.sitio_web || item.sitio_web, item.slug);

  if (categoria === "hoteles") {
    base.priceRange = item.categoria_precio || undefined;
    if (typeof item.estrellas === "number" && item.estrellas > 0) {
      base.starRating = {
        "@type": "Rating",
        ratingValue: item.estrellas,
        bestRating: 5,
      };
    }
  }

  if (categoria === "restaurantes") {
    base.servesCuisine = splitList(item.tipo_comida);
    base.priceRange = item.categoria_precio || undefined;
    base.openingHours = item.horario || undefined;
  }

  if (categoria === "destinos") {
    base.hasMap = item.direccion_google_maps || undefined;
    base.openingHours = item.horarios || undefined;
    if (typeof item.lat === "number" && typeof item.lng === "number") {
      base.geo = {
        "@type": "GeoCoordinates",
        latitude: item.lat,
        longitude: item.lng,
      };
    }
    if (typeof item.precio === "string" && /gratis/i.test(item.precio)) {
      base.isAccessibleForFree = true;
    }
  }

  return clean(base);
}

export function buildDirectorioSchemas(
  categoria: string,
  items: any[] = []
): object[] {
  const meta = CATEGORIA_META[categoria];
  if (!meta) return [];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: meta.label,
        item: `${SITE_URL}/directorio/${categoria}`,
      },
    ],
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${meta.label} en Tehuacán`,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: directorioItem(categoria, it),
    })),
  };

  return [breadcrumb, itemList];
}
