import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { StrapiClient } from './StrapiClient.ts';
import { AssetDownloader } from './AssetDownloader.ts';
import { optimizeAssets } from './optimize-assets.ts';
import type { CollectionDefinition, FlatRecord, StrapiClientConfig } from './types.ts';

// ─── Load environment variables (Node >= 20.6.0) ─────────────────────────────
try {
  process.loadEnvFile();
} catch {
  // Silently continue — variables may be injected by the CI/CD environment
}

// ─── Resolve script-relative paths ───────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..'); // /web

// ─── Output directories ───────────────────────────────────────────────────────
const DATA_DIR = path.join(ROOT, 'src', 'data');
const ASSETS_DIR = path.join(ROOT, 'public', 'assets');

// ─── Collection definitions ───────────────────────────────────────────────────
const COLLECTIONS: CollectionDefinition[] = [
  {
    name: 'hoteles',
    query: {
      populate: {
        redes_sociales: {
          fields: ['plataforma', 'usuario', 'enlace'],
        },
        contacto: {
          fields: ['telefono', 'email', 'sitio_web', 'whatsapp'],
        },
        galeria: {
          fields: ['url', 'alternativeText', 'caption'],
        },
      }
    },
  },
  {
    name: 'restaurantes',
    query: {
      populate: {
        redes_sociales: {
          fields: ['plataforma', 'usuario', 'enlace'],
        },
        contacto: {
          fields: ['telefono', 'email', 'sitio_web', 'whatsapp'],
        },
        galeria: {
          fields: ['url', 'alternativeText', 'caption'],
        },
      }
    },
  },
  {
    name: 'guias-turisticos',
    query: {
      populate: {
        redes_sociales: {
          fields: ['plataforma', 'usuario', 'enlace'],
        },
        contacto: {
          fields: ['telefono', 'email', 'sitio_web', 'whatsapp'],
        },
        galeria: {
          fields: ['url', 'alternativeText', 'caption'],
        },
      }
    },
  },
  {
    name: 'destinos-turisticos',
    query: {
      populate: {
        redes_sociales: {
          fields: ['plataforma', 'usuario', 'enlace'],
        },
        contacto: {
          fields: ['telefono', 'email', 'sitio_web', 'whatsapp'],
        },
        galeria: {
          fields: ['url', 'alternativeText', 'caption'],
        },
      }
    },
  },
  {
    name: 'home-page',
    singleType: true,
    query: {
      fields: ['titulo_principal', 'texto_busqueda'],
      populate: {
        imagen_principal: {
          fields: ['url', 'alternativeText', 'caption'],
        },
        mejores_hoteles: {
          populate: {
            galeria: {
              fields: ['url', 'alternativeText', 'caption'],
            },
            contacto: {
              fields: ['telefono', 'email', 'sitio_web', 'whatsapp'],
            },
            redes_sociales: {
              fields: ['plataforma', 'usuario', 'enlace'],
            },
          },
        },
        mejores_restaurantes: {
          populate: {
            galeria: {
              fields: ['url', 'alternativeText', 'caption'],
            },
            contacto: {
              fields: ['telefono', 'email', 'sitio_web', 'whatsapp'],
            },
            redes_sociales: {
              fields: ['plataforma', 'usuario', 'enlace'],
            },
          },
        },
        imperdibles: {
          fields: [
            'nombre',
            'direccion_google_maps',
            'slug',
            'descripcion_corta',
            'descripcion_larga',
            'precio',
            'como_llegar',
            'horarios',
            'duracion_recomendada',
            'recomendaciones',
            'tips_imperdibles',
            'es_pet_friendly',
            'lat',
            'lng',
            'google_maps_rating',
            'google_maps_user_ratings_total',
            'google_maps_formatted_address'
          ],
          populate: {
            galeria: {
              fields: ['url', 'alternativeText', 'caption'],
            },
            contacto: {
              fields: ['telefono', 'email', 'sitio_web', 'whatsapp'],
            },
            redes_sociales: {
              fields: ['plataforma', 'usuario', 'enlace'],
            },
            categorias: {
              fields: ['nombre'],
            },
          },
        },
      }
    },
  },
];

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * StrapiFetcher
 *
 * Top-level orchestrator. Wires together StrapiClient and AssetDownloader,
 * iterates over all defined collections, and writes the resulting JSON files
 * to the local filesystem for use during the Astro static build.
 */
class StrapiFetcher {
  private readonly client: StrapiClient;
  private readonly downloader: AssetDownloader;

  constructor() {
    const strapiUrl = process.env.STRAPI_URL ?? 'http://127.0.0.1:1337';
    const apiToken = process.env.STRAPI_API_TOKEN;

    const config: StrapiClientConfig = {
      strapiUrl,
      apiToken,
      dataDir: DATA_DIR,
      assetsDir: ASSETS_DIR,
    };

    this.client = new StrapiClient(config);
    this.downloader = new AssetDownloader(strapiUrl, ASSETS_DIR);
  }

  /** Creates the required output directories if they don't already exist. */
  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(ASSETS_DIR, { recursive: true });
  }

  /** Fetches, processes assets, and writes one collection to disk. */
  private async processCollection(collection: CollectionDefinition): Promise<void> {
    console.log(`\n📦 Fetching collection: [${collection.name}]...`);

    const records = await this.client.fetchAll(collection);
    console.log(` → ${records.length} records fetched. Processing media assets...`);

    const processedRecords = (await this.downloader.process(records)) as FlatRecord[];

    // Single Types devuelven un arreglo de un elemento — guardamos solo el objeto.
    const output = collection.singleType
      ? (processedRecords[0] ?? null)
      : processedRecords;

    if (collection.name === 'home-page' && output) {
      const homeData = output as any;
      if (homeData.imperdibles && Array.isArray(homeData.imperdibles)) {
        for (const item of homeData.imperdibles) {
          if (item.google_maps_rating || item.google_maps_formatted_address) {
            item.googleMapsInfo = {
              rating: item.google_maps_rating,
              userRatingsTotal: item.google_maps_user_ratings_total,
              formattedAddress: item.google_maps_formatted_address,
            };
          }
          delete item.google_maps_rating;
          delete item.google_maps_user_ratings_total;
          delete item.google_maps_formatted_address;
        }
      }
    }

    const filePath = path.join(DATA_DIR, `${collection.name}.json`);
    await fs.writeFile(filePath, JSON.stringify(output, null, 2), 'utf-8');

    console.log(` ✔ Saved → ${filePath}`);
  }

  /** Entry point: runs the full pipeline for all defined collections. */
  async run(): Promise<void> {
    console.log(`\n🚀 [Strapi Static Fetcher] Started at ${new Date().toISOString()}`);

    try {
      await this.ensureDirectories();

      for (const collection of COLLECTIONS) {
        await this.processCollection(collection);
      }

      await optimizeAssets();

      console.log('\n✅ All collections mirrored successfully. Ready for static build!\n');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`\n❌ [FATAL] Pre-build failed — could not fetch data from Strapi:\n${msg}\n`);
      process.exit(1);
    }
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────────
new StrapiFetcher().run();
