// ─── Strapi API Response Shape ────────────────────────────────────────────────

/** Raw pagination metadata returned by Strapi */
export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

/** Raw meta wrapper in the Strapi response */
export interface StrapiMeta {
  pagination: StrapiPagination;
}

/** A single Strapi entity with nested attributes (v4/v5 format) */
export interface StrapiEntity {
  id: number;
  attributes: Record<string, unknown>;
}

/** Top-level Strapi collection response */
export interface StrapiCollectionResponse {
  data: StrapiEntity[];
  meta: StrapiMeta;
}

// ─── Strapi Media ─────────────────────────────────────────────────────────────

/** Strapi media/upload object shape (after flattening) */
export interface StrapiMediaObject {
  url: string;
  mime: string;
  hash?: string;
  ext?: string;
  name?: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

// ─── Collection Definition ────────────────────────────────────────────────────

/** Nested query param object (supports Strapi's populate, filters, sort, etc.) */
export type StrapiQueryParams = {
  populate?: string | Record<string, unknown>;
  filters?: Record<string, unknown>;
  sort?: string | string[];
  fields?: string[];
  pagination?: Partial<Pick<StrapiPagination, 'page' | 'pageSize'>>;
  [key: string]: unknown;
};

/** A collection definition with its name and optional query params */
export interface CollectionDefinition {
  /** Strapi collection API endpoint name (e.g. 'hoteles', 'destinos-turisticos') */
  name: string;
  /** Nested query params object serialized via qs.stringify */
  query: StrapiQueryParams;
}

// ─── Fetcher Config ───────────────────────────────────────────────────────────

/** Configuration injected into the StrapiClient */
export interface StrapiClientConfig {
  strapiUrl: string;
  apiToken?: string;
  dataDir: string;
  assetsDir: string;
}

// ─── Generic Flattened Record ─────────────────────────────────────────────────

/** A fully flattened Strapi record — attributes promoted to top-level */
export type FlatRecord = Record<string, unknown>;
