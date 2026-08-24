import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const ASSETS_DIR = path.join(ROOT, 'public', 'assets');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const CSV_PATH = path.join(DATA_DIR, 'registro.csv');

// Mapa global de File ID -> Ruta local (/assets/filename.webp)
const fileIdToLocalPath = new Map<string, string>();

/**
 * Extrae el ID de Google Drive a partir de una URL
 */
function extractDriveId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const matchId = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (matchId) return matchId[1];

  const matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD) return matchD[1];

  return null;
}

/**
 * Limpia y crea un slug a partir de una cadena
 */
function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Descarga una imagen desde Google Drive dado su file ID
 */
async function downloadDriveFile(fileId: string): Promise<Buffer> {
  const urlsToTry = [
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
    `https://docs.google.com/uc?export=download&id=${fileId}&confirm=t`,
  ];

  for (const downloadUrl of urlsToTry) {
    try {
      const res = await fetch(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!res.ok) continue;

      const buffer = Buffer.from(await res.arrayBuffer());
      // Verificar si es un buffer válido (al menos 100 bytes y no es una página HTML de error)
      if (buffer.length > 500 && !buffer.slice(0, 200).toString('utf-8').toLowerCase().includes('<!doctype html>')) {
        return buffer;
      }
    } catch {
      // Probar siguiente URL
    }
  }

  throw new Error(`No se pudo descargar el archivo con ID Drive: ${fileId}`);
}

/**
 * Procesa un File ID de Drive: lo descarga, lo convierte a WebP y lo guarda en public/assets
 */
async function processDriveImage(fileId: string, baseSlug: string, index: number): Promise<string> {
  if (fileIdToLocalPath.has(fileId)) {
    return fileIdToLocalPath.get(fileId)!;
  }

  const fileName = `${baseSlug}_${index}.webp`;
  const localFilePath = path.join(ASSETS_DIR, fileName);
  const publicUrlPath = `/assets/${fileName}`;

  // Verificar si ya existe físicamente en disk
  try {
    await fs.access(localFilePath);
    console.log(`  ⏭ Ya existe: ${fileName}`);
    fileIdToLocalPath.set(fileId, publicUrlPath);
    return publicUrlPath;
  } catch {
    // No existe, proceder a la descarga y conversión
  }

  console.log(`  ⬇ Descargando Drive ID (${fileId}) → ${fileName}...`);
  try {
    const rawBuffer = await downloadDriveFile(fileId);
    
    // Convertir a WebP usando Sharp
    const webpBuffer = await sharp(rawBuffer)
      .webp({ quality: 82, effort: 5 })
      .toBuffer();

    await fs.writeFile(localFilePath, webpBuffer);
    console.log(`  ✔ Convertido y guardado: ${fileName} (${(webpBuffer.length / 1024).toFixed(1)} KB)`);
    
    fileIdToLocalPath.set(fileId, publicUrlPath);
    return publicUrlPath;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ Error procesando Drive ID (${fileId}): ${msg}`);
    return `https://drive.google.com/open?id=${fileId}`; // Mantener fallback si falla
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando procesamiento de imágenes de Google Drive a WebP...\n');

  await fs.mkdir(ASSETS_DIR, { recursive: true });

  // 1. Escanear todos los archivos JSON en src/data para encontrar enlaces de Drive existentes
  console.log('🔍 Escaneando archivos JSON en src/data/...\n');
  const jsonFiles = (await fs.readdir(DATA_DIR)).filter((f) => f.endsWith('.json'));

  const jsonDriveMap = new Map<string, { fileId: string; originalUrl: string }[]>();

  for (const jsonFile of jsonFiles) {
    const filePath = path.join(DATA_DIR, jsonFile);
    const content = await fs.readFile(filePath, 'utf-8');
    
    const driveRegex = /https:\/\/drive\.google\.com\/[^\s"',]+/g;
    const matches = content.match(driveRegex) || [];
    
    if (matches.length > 0) {
      console.log(`  📄 ${jsonFile}: encontradas ${matches.length} URLs de Drive`);
      for (const url of matches) {
        const fileId = extractDriveId(url);
        if (fileId) {
          if (!jsonDriveMap.has(jsonFile)) jsonDriveMap.set(jsonFile, []);
          jsonDriveMap.get(jsonFile)!.push({ fileId, originalUrl: url });
        }
      }
    }
  }

  // 2. Procesar imágenes encontradas en los JSON
  console.log('\n📥 Procesando imágenes extraídas de los JSON...\n');
  for (const jsonFile of jsonFiles) {
    const filePath = path.join(DATA_DIR, jsonFile);
    let rawContent = await fs.readFile(filePath, 'utf-8');
    const jsonName = path.basename(jsonFile, '.json');

    let data: any;
    try {
      data = JSON.parse(rawContent);
    } catch {
      continue;
    }

    if (Array.isArray(data)) {
      let counter = 100;
      for (const item of data) {
        if (!item || typeof item !== 'object') continue;
        const itemName = item.nombre || item.titulo || jsonName;
        const itemSlug = slugify(itemName);

        if (Array.isArray(item.galeria)) {
          for (let i = 0; i < item.galeria.length; i++) {
            const galItem = item.galeria[i];
            if (galItem && typeof galItem.url === 'string') {
              const fileId = extractDriveId(galItem.url);
              if (fileId) {
                counter++;
                const newUrl = await processDriveImage(fileId, itemSlug, counter);
                galItem.url = newUrl;
              }
            }
          }
        }
      }
    }

    // Reescribir cualquier otra URL suelta en el contenido del JSON
    let modified = false;
    for (const [fileId, localPath] of fileIdToLocalPath.entries()) {
      const drivePatterns = [
        `https://drive.google.com/open?id=${fileId}`,
        `https://drive.google.com/file/d/${fileId}/view`,
        `https://drive.google.com/file/d/${fileId}`,
      ];

      for (const pattern of drivePatterns) {
        if (rawContent.includes(pattern)) {
          rawContent = rawContent.replaceAll(pattern, localPath);
          modified = true;
        }
      }
    }

    // Si data fue modificado, serializar de nuevo
    const updatedContent = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, updatedContent, 'utf-8');
    console.log(`  ✔ Actualizado JSON: ${jsonFile}`);
  }

  // 3. Procesar registro.csv para asegurar que todos los registros del CSV estén al día
  console.log('\n📊 Leyendo registro.csv...\n');
  const csvContent = await fs.readFile(CSV_PATH, 'utf-8');
  
  // Extraer líneas y URLs de drive de cada fila
  const driveRegex = /https:\/\/drive\.google\.com\/[^\s"',]+/g;
  const csvMatches = csvContent.match(driveRegex) || [];
  console.log(`  Encontradas ${csvMatches.length} URLs de Drive en registro.csv`);

  let csvCounter = 1;
  for (const url of csvMatches) {
    const fileId = extractDriveId(url);
    if (fileId && !fileIdToLocalPath.has(fileId)) {
      await processDriveImage(fileId, `registro_asset`, csvCounter++);
    }
  }

  // 4. Último pase por todos los JSONs para reemplazar cualquier URL de Drive que haya sido procesada en el paso 3
  console.log('\n📝 Verificando y reemplazando URLs finales en los JSON...\n');
  for (const jsonFile of jsonFiles) {
    const filePath = path.join(DATA_DIR, jsonFile);
    let content = await fs.readFile(filePath, 'utf-8');
    let changed = false;

    for (const [fileId, localPath] of fileIdToLocalPath.entries()) {
      const regex = new RegExp(`https:\\/\\/drive\\.google\\.com\\/[^"'\`\\s,]+id=${fileId}[^"'\`\\s,]*`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, localPath);
        changed = true;
      }
    }

    if (changed) {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`  ✔ Actualización final en JSON: ${jsonFile}`);
    }
  }

  console.log('\n✨ ¡Proceso completado exitosamente!');
}

main().catch((err) => {
  console.error('\n❌ Error en el proceso:', err);
  process.exit(1);
});
