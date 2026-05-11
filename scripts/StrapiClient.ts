import qs from 'qs';
import type {
  CollectionDefinition,
  FlatRecord,
  StrapiClientConfig,
  StrapiCollectionResponse,
  StrapiQueryParams,
} from './types.ts';

/**
 * StrapiClient
 *
 * Responsible for fetching and flattening data from the Strapi REST API.
 * Handles recursive pagination automatically.
 */
export class StrapiClient {
  private readonly strapiUrl: string;
  private readonly headers: Record<string, string>;

  constructor(config: StrapiClientConfig) {
    this.strapiUrl = config.strapiUrl;
    this.headers = { 'Content-Type': 'application/json' };

    if (config.apiToken) {
      this.headers['Authorization'] = `Bearer ${config.apiToken}`;
    }
  }

  // ─── Public Methods ──────────────────────────────────────────────────────────

  /**
   * Fetches all records from a collection, paginating recursively until
   * all pages are consumed.
   */
  async fetchAll(
    collection: CollectionDefinition,
    page = 1,
    accumulated: FlatRecord[] = [],
  ): Promise<FlatRecord[]> {
    const endpoint = this.buildEndpoint(collection.name, collection.query, page);

    const response = await fetch(endpoint, { headers: this.headers });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to fetch '${collection.name}'. ` +
          `Server responded with: ${response.status} ${response.statusText}\nDetails: ${errorBody}`,
      );
    }

    const json = (await response.json()) as StrapiCollectionResponse;

    const flatPage = this.flattenResponse(json.data) as FlatRecord[];
    const allRecords = accumulated.concat(flatPage);

    const pagination = json.meta?.pagination;
    if (pagination && pagination.page < pagination.pageCount) {
      return this.fetchAll(collection, page + 1, allRecords);
    }

    return allRecords;
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  /**
   * Builds the full API endpoint URL for a collection page using qs.stringify
   * to correctly serialize nested query parameters.
   */
  private buildEndpoint(
    collectionName: string,
    query: StrapiQueryParams,
    page: number,
  ): string {
    const mergedQuery: StrapiQueryParams = {
      ...query,
      pagination: {
        ...(query.pagination ?? {}),
        page,
        pageSize: 25,
      },
    };

    const queryString = qs.stringify(mergedQuery, { encodeValuesOnly: true });
    return `${this.strapiUrl}/api/${collectionName}?${queryString}`;
  }

  /**
   * Recursively flattens Strapi's deeply nested API responses.
   *
   * Normalizes structures like:
   *   { id, attributes: { name, image: { data: { id, attributes: {...} } } } }
   * into:
   *   { id, name, image: { id, url, ... } }
   */
  private flattenResponse(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.flattenResponse(item));
    }

    if (data !== null && typeof data === 'object') {
      const obj = data as Record<string, unknown>;

      // Unwrap `{ data: [...] }` or `{ data: {...} }`
      if ('data' in obj) {
        if (Array.isArray(obj.data)) {
          return this.flattenResponse(obj.data);
        }
        if (obj.data === null) {
          return null;
        }
        const nested = obj.data as Record<string, unknown>;
        return this.flattenResponse({ id: nested.id, ...(nested.attributes as object) });
      }

      // Promote attributes to top level
      if ('attributes' in obj) {
        return this.flattenResponse({ id: obj.id, ...(obj.attributes as object) });
      }

      // Recurse into plain objects
      const flattened: Record<string, unknown> = {};
      for (const key in obj) {
        flattened[key] = this.flattenResponse(obj[key]);
      }
      return flattened;
    }

    return data;
  }
}
