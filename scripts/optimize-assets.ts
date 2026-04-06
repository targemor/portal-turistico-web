import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// ─── Resolve script-relative paths ───────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const ASSETS_DIR = path.join(ROOT, 'public', 'assets');
const DATA_DIR = path.join(ROOT, 'src', 'data');

// Extensiones de imagen que serán convertidas a WebP
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.avif', '.tiff', '.bmp']);

// ─── Image Optimizer ──────────────────────────────────────────────────────────

/**
 * Scans the ASSETS_DIR, converts every qualifying image to WebP using sharp,
 * removes the original file, then updates all JSON files in DATA_DIR so that
 * any URL still referencing the old filename now points to the new .webp file.
 */
export async function optimizeAssets(): Promise<void> {
  console.log('\n🎨 [Asset Optimizer] Started\n');

  // ── 1. Read all files in the assets directory ─────────────────────────────
  let files: string[];
  try {
    files = await fs.readdir(ASSETS_DIR);
  } catch {
    console.error(`❌ Assets directory not found: ${ASSETS_DIR}`);
    process.exit(1);
  }

  const imageFiles = files.filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()));

  if (imageFiles.length === 0) {
    console.log('ℹ️  No images to process.\n');
    return;
  }

  // ── 2. Build a rename map { oldFilename → newFilename } ───────────────────
  const renameMap = new Map<string, string>();

  for (const file of imageFiles) {
    const ext = path.extname(file).toLowerCase();

    // Already WebP — nothing to convert, but add identity entry so JSON pass works
    if (ext === '.webp') {
      renameMap.set(file, file);
      continue;
    }

    const nameWithoutExt = path.basename(file, ext);
    const newFileName = `${nameWithoutExt}.webp`;
    renameMap.set(file, newFileName);
  }

  // ── 3. Convert images that need it ───────────────────────────────────────
  let converted = 0;
  let skipped = 0;
  let errors = 0;

  for (const [oldFile, newFile] of renameMap.entries()) {
    if (oldFile === newFile) {
      console.log(`  ✔ Already WebP: ${oldFile}`);
      skipped++;
      continue;
    }

    const sourcePath = path.join(ASSETS_DIR, oldFile);
    const destPath = path.join(ASSETS_DIR, newFile);

    try {
      await sharp(sourcePath)
        .webp({ quality: 82, effort: 5 })
        .toFile(destPath);

      await fs.unlink(sourcePath);

      console.log(`  ✔ Converted: ${oldFile} → ${newFile}`);
      converted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ Failed: ${oldFile} — ${msg}`);
      errors++;
    }
  }

  console.log(`\n  📊 Summary: ${converted} converted, ${skipped} already WebP, ${errors} errors.\n`);

  // ── 4. Update JSON data files ─────────────────────────────────────────────
  console.log('📝 Updating JSON data files...\n');

  let jsonFiles: string[];
  try {
    jsonFiles = (await fs.readdir(DATA_DIR)).filter((f) => path.extname(f) === '.json');
  } catch {
    console.error(`❌ Data directory not found: ${DATA_DIR}`);
    process.exit(1);
  }

  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(DATA_DIR, jsonFile);
    let raw = await fs.readFile(jsonPath, 'utf-8');
    let modified = false;

    for (const [oldFile, newFile] of renameMap.entries()) {
      if (oldFile === newFile) continue;

      const oldRef = `/assets/${oldFile}`;
      const newRef = `/assets/${newFile}`;

      if (raw.includes(oldRef)) {
        raw = raw.replaceAll(oldRef, newRef);
        modified = true;
      }
    }

    if (modified) {
      await fs.writeFile(jsonPath, raw, 'utf-8');
      console.log(`  ✔ Updated: ${jsonFile}`);
    } else {
      console.log(`  ─ No changes: ${jsonFile}`);
    }
  }

  console.log('\n✅ Asset optimization complete!\n');
}

// ─── Entry point (direct execution) ──────────────────────────────────────────
optimizeAssets().catch((err) => {
  console.error('\n❌ [FATAL] Optimization failed:', err);
  process.exit(1);
});
