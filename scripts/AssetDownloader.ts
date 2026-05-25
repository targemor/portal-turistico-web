import fs from 'fs/promises';
import path from 'path';
import type { FlatRecord, StrapiMediaObject } from './types.ts';

/**
 * AssetDownloader
 *
 * Responsible for scanning flattened Strapi records for media objects,
 * downloading them to the local filesystem, and rewriting their URLs
 * to point to the locally saved copies (enabling zero-external-request builds).
 */
export class AssetDownloader {
  private readonly strapiUrl: string;
  private readonly assetsDir: string;
  private readonly assetsPublicPath = '/assets';
  private counter = 1;

  constructor(strapiUrl: string, assetsDir: string) {
    this.strapiUrl = strapiUrl;
    this.assetsDir = assetsDir;
  }

  // ─── Public Methods ──────────────────────────────────────────────────────────

  /**
   * Recursively traverses the given data structure, downloads any Strapi
   * media objects found, and rewrites their `url` to the local static path.
   */
  async process(data: unknown, parentName = 'media'): Promise<unknown> {
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        data[i] = await this.process(data[i], parentName);
      }
      return data;
    }

    if (data !== null && typeof data === 'object') {
      const obj = data as FlatRecord;

      const currentName = typeof obj['nombre'] === 'string' ? obj['nombre'] : parentName;

      // Detect a Strapi media object by the presence of `url` and `mime` fields
      if (this.isMediaObject(obj)) {
        await this.downloadAndRewrite(obj as unknown as StrapiMediaObject, currentName);
        return obj;
      }

      // Recurse into nested object properties
      for (const key in obj) {
        obj[key] = await this.process(obj[key], currentName);
      }
    }

    return data;
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  /**
   * Type guard — returns true if the object looks like a Strapi media upload.
   */
  private isMediaObject(obj: FlatRecord): boolean {
    if (typeof obj['url'] !== 'string') return false;

    // Detectamos si es una imagen cuando tiene 'mime', o los campos recortados 'alternativeText' / 'caption',
    // o si su ruta inicia con la típica ruta de guardado por defecto de Strapi (/uploads/).
    return (
      typeof obj['mime'] === 'string' ||
      'alternativeText' in obj ||
      'caption' in obj ||
      obj['url'].startsWith('/uploads/')
    );
  }

  /**
   * Downloads the binary asset from the Strapi server and saves it locally.
   * Then rewrites the `url` field to point to the local public path.
   * The filename follows the pattern: nombre_numero.ext
   */
  private async downloadAndRewrite(media: StrapiMediaObject, baseName: string): Promise<void> {
    const isRelativeUrl = media.url.startsWith('/');
    const remoteUrl = isRelativeUrl ? `${this.strapiUrl}${media.url}` : media.url;

    const ext = media.ext || path.extname(new URL(remoteUrl).pathname) || '';
    const cleanName = baseName
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const fileName = `${cleanName}_${this.counter++}${ext}`;
    const localPath = path.join(this.assetsDir, fileName);

    try {
      // Verificar si el archivo ya existe
      try {
        await fs.access(localPath);
        console.log(`   ⏭ Skipping (already exists): ${fileName}`);
        media.url = `${this.assetsPublicPath}/${fileName}`;
        return;
      } catch {
        // El archivo no existe, continuar con la descarga
      }

      console.log(`   ⬇ Downloading: ${fileName}`);

      const response = await fetch(remoteUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(localPath, buffer);

      // Rewrite URL to local static path
      media.url = `${this.assetsPublicPath}/${fileName}`;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`   ✗ Failed to download ${remoteUrl}: ${msg}`);
    }
  }
}
