import sharp from 'sharp';
import path from 'path';

const ASSETS_DIR = path.resolve('public', 'assets');
const BRAIN_DIR = 'C:/Users/bucke/.gemini/antigravity-ide/brain/0d59c6a1-bd3f-48f6-8144-574d0f4cc6b2';

const mappings = [
  { src: 'joyeria_gazaed_1_1787599529167.png', dest: 'joyeria_gazaed_1.webp' },
  { src: 'cosmetica_natural_1_1787599542624.png', dest: 'cosmetica_natural_1.webp' },
  { src: 'arete_salazar_1_1787599620763.png', dest: 'arete_salazar_1.webp' },
  { src: 'cnk_natural_1_1787599634094.png', dest: 'cnk_natural_1.webp' },
];

for (const m of mappings) {
  const srcPath = path.join(BRAIN_DIR, m.src);
  const destPath = path.join(ASSETS_DIR, m.dest);
  try {
    await sharp(srcPath).webp({ quality: 82, effort: 5 }).toFile(destPath);
    console.log(`✔ Converted ${m.src} -> ${m.dest}`);
  } catch (err) {
    console.error(`❌ Failed ${m.src}:`, err);
  }
}
