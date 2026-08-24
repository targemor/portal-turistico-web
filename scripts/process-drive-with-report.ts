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
const REPORT_MD_PATH = path.join(DATA_DIR, 'reporte_permisos_drive.md');
const REPORT_CSV_PATH = path.join(DATA_DIR, 'reporte_permisos_drive.csv');

interface PrivateDriveItem {
  negocio: string;
  tipo: string;
  email: string;
  telefono: string;
  driveUrl: string;
  fileId: string;
}

const fileIdToLocalPath = new Map<string, string>();
const privateDriveItems: PrivateDriveItem[] = [];

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
 * Normaliza una cadena para crear slugs de nombres de archivos
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
 * Obtiene el Token de Acceso de Google si está disponible en archivo o variable de entorno
 */
async function getAccessToken(): Promise<string | null> {
  if (process.env.GOOGLE_ACCESS_TOKEN) {
    return process.env.GOOGLE_ACCESS_TOKEN.trim();
  }
  const tokenFile = path.join(ROOT, 'drive_token.txt');
  try {
    const raw = await fs.readFile(tokenFile, 'utf-8');
    const match = raw.match(/access_token=([^\s\r\n]+)/);
    if (match) return match[1].trim();
    return raw.trim();
  } catch {
    return null;
  }
}

/**
 * Intenta descargar una imagen de Google Drive (autenticada o pública)
 */
async function downloadDriveFile(fileId: string): Promise<Buffer | null> {
  const token = await getAccessToken();

  // 1. Si existe token de acceso, intentar la API v3 oficial con autenticación Bearer
  if (token) {
    try {
      const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const res = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'image/*,*/*',
        },
      });

      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        const head = buffer.slice(0, 200).toString('utf-8').toLowerCase();
        if (buffer.length > 500 && !head.includes('<!doctype html>') && !head.includes('<html') && !head.includes('error')) {
          return buffer;
        }
      }
    } catch (err) {
      // Fallback a endpoints públicos
    }
  }

  // 2. Endpoints de descarga pública tradicionales
  const urlsToTry = [
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
    `https://docs.google.com/uc?export=download&id=${fileId}&confirm=t`,
  ];

  for (const downloadUrl of urlsToTry) {
    try {
      const res = await fetch(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (!res.ok) continue;

      const buffer = Buffer.from(await res.arrayBuffer());
      const head = buffer.slice(0, 200).toString('utf-8').toLowerCase();
      if (buffer.length > 500 && !head.includes('<!doctype html>') && !head.includes('<html') && !head.includes('accounts.google.com')) {
        return buffer;
      }
    } catch {
      // Probar siguiente
    }
  }

  return null;
}

/**
 * Procesa una imagen de Drive: la descarga si es pública y la convierte a WebP
 */
async function tryProcessDriveImage(
  fileId: string,
  originalUrl: string,
  baseSlug: string,
  index: number,
  context: { negocio: string; tipo: string; email: string; telefono: string }
): Promise<string | null> {
  if (fileIdToLocalPath.has(fileId)) {
    return fileIdToLocalPath.get(fileId)!;
  }

  const fileName = `${baseSlug}_${index}.webp`;
  const localFilePath = path.join(ASSETS_DIR, fileName);
  const publicUrlPath = `/assets/${fileName}`;

  // Si ya existe localmente
  try {
    await fs.access(localFilePath);
    fileIdToLocalPath.set(fileId, publicUrlPath);
    return publicUrlPath;
  } catch {
    // No existe localmente
  }

  const buffer = await downloadDriveFile(fileId);

  if (buffer) {
    try {
      const webpBuffer = await sharp(buffer)
        .webp({ quality: 82, effort: 5 })
        .toBuffer();

      await fs.writeFile(localFilePath, webpBuffer);
      console.log(`  ✔ [PÚBLICA] Descargada y convertida: ${fileName} (${(webpBuffer.length / 1024).toFixed(1)} KB)`);
      fileIdToLocalPath.set(fileId, publicUrlPath);
      return publicUrlPath;
    } catch (err) {
      console.error(`  ✗ Error convirtiendo a WebP ${fileId}:`, err);
    }
  }

  // Si no se pudo descargar por permisos privados
  console.log(`  🔒 [PRIVADA/RESTRINGIDA] Se requiere cambio de permisos para ID: ${fileId} (${context.negocio})`);
  privateDriveItems.push({
    negocio: context.negocio,
    tipo: context.tipo,
    email: context.email,
    telefono: context.telefono,
    driveUrl: originalUrl,
    fileId,
  });

  return null;
}

async function main() {
  console.log('🚀 Iniciando escaneo y procesamiento de imágenes...\n');

  await fs.mkdir(ASSETS_DIR, { recursive: true });

  // 1. Parsear registro.csv para asociar URLs a información de contacto
  console.log('📊 Analizando registro.csv...\n');
  const csvRaw = await fs.readFile(CSV_PATH, 'utf-8');
  const lines = csvRaw.split('\n').filter((l) => l.trim().length > 0);

  // Mapear cada fila del CSV
  const csvItemsMap = new Map<string, { negocio: string; tipo: string; email: string; telefono: string; urls: string[] }>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const driveMatches = line.match(/https:\/\/drive\.google\.com\/[^\s"',]+/g) || [];
    if (driveMatches.length === 0) continue;

    // Extraer campos del CSV (separados por coma respetando comillas simples/dobles basico)
    const fields = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const email = fields[1]?.replace(/^"|"$/g, '').trim() || 'Sin email';
    const tipo = fields[2]?.replace(/^"|"$/g, '').trim() || 'Servicio';
    
    // Buscar nombre del negocio en distintas columnas
    let negocio = 'Establecimiento';
    for (const f of fields) {
      const cleanF = f.replace(/^"|"$/g, '').trim();
      if (cleanF && !cleanF.includes('@') && !cleanF.startsWith('http') && !cleanF.startsWith('Sí') && !cleanF.startsWith('No') && cleanF.length > 2 && cleanF.length < 50) {
        if (cleanF.match(/Hotel|Restaurante|Café|Bistró|Abacaxi|Violetta|Zenith|Creamy|Sabina|Real|Parrillas|Greca|Aislados|Salazar|Pérez|Gazaed|Herbal|Fenix/i)) {
          negocio = cleanF;
          break;
        }
      }
    }

    // Buscar telefono
    let telefono = 'Sin teléfono';
    for (const f of fields) {
      const cleanF = f.replace(/^"|"$/g, '').trim();
      if (cleanF.match(/\d{8,10}/)) {
        telefono = cleanF;
        break;
      }
    }

    for (const url of driveMatches) {
      const fileId = extractDriveId(url);
      if (fileId) {
        csvItemsMap.set(fileId, { negocio, tipo, email, telefono, urls: driveMatches });
      }
    }
  }

  // 2. Procesar todos los archivos JSON en src/data/
  console.log('📂 Procesando galerías en los archivos JSON de src/data/...\n');
  const jsonFiles = (await fs.readdir(DATA_DIR)).filter((f) => f.endsWith('.json') && f !== 'logo-letters.json');

  for (const jsonFile of jsonFiles) {
    const filePath = path.join(DATA_DIR, jsonFile);
    const rawContent = await fs.readFile(filePath, 'utf-8');
    let data: any;

    try {
      data = JSON.parse(rawContent);
    } catch {
      continue;
    }

    if (!Array.isArray(data)) continue;

    let modified = false;
    for (const item of data) {
      if (!item || typeof item !== 'object') continue;

      const itemName = item.nombre || item.titulo || 'establecimiento';
      const itemSlug = slugify(itemName);
      const email = item.contacto?.email || item.email || 'Sin email registrado';
      const telefono = item.contacto?.telefono || item.contacto?.whatsapp || 'Sin teléfono';
      const tipo = jsonFile.replace('.json', '');

      if (Array.isArray(item.galeria)) {
        const updatedGaleria: any[] = [];
        let index = 1;

        for (const galItem of item.galeria) {
          if (!galItem || typeof galItem.url !== 'string') {
            updatedGaleria.push(galItem);
            continue;
          }

          const driveUrl = galItem.url;
          const fileId = extractDriveId(driveUrl);

          if (fileId) {
            const context = csvItemsMap.get(fileId) || { negocio: itemName, tipo, email, telefono, urls: [driveUrl] };
            const localWebpPath = await tryProcessDriveImage(fileId, driveUrl, itemSlug, index++, context);

            if (localWebpPath) {
              galItem.url = localWebpPath;
              updatedGaleria.push(galItem);
              modified = true;
            } else {
              // Mantener entrada si es privada para que no se borre el schema, o marcar referencia
              updatedGaleria.push(galItem);
            }
          } else {
            updatedGaleria.push(galItem);
          }
        }
        item.galeria = updatedGaleria;
      }
    }

    if (modified) {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  ✔ Actualizado archivo JSON: ${jsonFile}`);
    }
  }

  // 3. Procesar las URLs de registro.csv directamente para asegurar que no quede ninguna pública sin descargar
  console.log('\n🔍 Verificando resto de URLs en registro.csv...\n');
  for (const [fileId, info] of csvItemsMap.entries()) {
    const slug = slugify(info.negocio);
    await tryProcessDriveImage(fileId, info.urls[0] || `https://drive.google.com/open?id=${fileId}`, slug, 1, info);
  }

  // 4. Generar reportes de permisos en Markdown y CSV para las imágenes privadas
  console.log('\n📄 Generando reportes de imágenes privadas...\n');

  // Eliminar duplicados en el reporte por fileId
  const uniquePrivateMap = new Map<string, PrivateDriveItem>();
  for (const p of privateDriveItems) {
    if (!uniquePrivateMap.has(p.fileId)) {
      uniquePrivateMap.set(p.fileId, p);
    }
  }
  const uniquePrivateList = Array.from(uniquePrivateMap.values());

  // Generar Markdown
  let mdContent = `# Reporte de Permisos Requeridos en Google Drive\n\n`;
  mdContent += `Este reporte contiene las imágenes adjuntas en los registros que se encuentran actualmente configuradas como **Privadas / Restringidas** en Google Drive.\n\n`;
  mdContent += `Para que la plataforma pueda mostrarlas en la web, es necesario solicitar a cada dueño/prestador de servicio que cambie los permisos de sus archivos o carpeta en Google Drive a: **"Cualquier persona con el enlace"** (Viewer / Lector).\n\n`;
  mdContent += `Total de imágenes pendientes por ajuste de permisos: **${uniquePrivateList.length}**\n\n`;
  mdContent += `| # | Negocio / Prestador | Categoría | Contacto (Email / Tel) | Enlace de Google Drive | Estado |\n`;
  mdContent += `|---|-------------------|-----------|-----------------------|-----------------------|--------|\n`;

  let rowIdx = 1;
  for (const item of uniquePrivateList) {
    mdContent += `| ${rowIdx++} | **${item.negocio}** | ${item.tipo} | ${item.email} / ${item.telefono} | [Ver enlace Drive](${item.driveUrl}) | 🔒 Privado |\n`;
  }

  await fs.writeFile(REPORT_MD_PATH, mdContent, 'utf-8');
  console.log(`  ✔ Reporte Markdown creado: ${REPORT_MD_PATH}`);

  // Generar CSV
  let csvOut = `"No","Negocio","Categoria","Email","Telefono","Url_Google_Drive","Estado"\n`;
  rowIdx = 1;
  for (const item of uniquePrivateList) {
    csvOut += `"${rowIdx++}","${item.negocio.replace(/"/g, '""')}","${item.tipo}","${item.email}","${item.telefono}","${item.driveUrl}","Privado (Cambiar permisos a Público)"\n`;
  }

  await fs.writeFile(REPORT_CSV_PATH, csvOut, 'utf-8');
  console.log(`  ✔ Reporte CSV creado: ${REPORT_CSV_PATH}`);

  console.log(`\n✨ Proceso completado. Se procesaron imágenes públicas y se creó el reporte para las ${uniquePrivateList.length} imágenes privadas.`);
}

main().catch((err) => {
  console.error('\n❌ Error ejecutando script:', err);
  process.exit(1);
});
