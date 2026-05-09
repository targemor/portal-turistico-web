import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesToOptimize = [
  {
    input: path.join(__dirname, '../public/assets/hero-poster.png'),
    output: path.join(__dirname, '../public/assets/hero-poster.webp')
  },
  {
    input: path.join(__dirname, '../public/assets/img/museo-evolucion.jpeg'),
    output: path.join(__dirname, '../public/assets/img/museo-evolucion.webp')
  }
];

async function optimizeImages() {
  console.log('Iniciando optimización de imágenes...');
  for (const { input, output } of imagesToOptimize) {
    try {
      if (fs.existsSync(input)) {
        await sharp(input)
          .webp({ quality: 80 })
          .toFile(output);
        console.log(`✅ Optimizado: ${path.basename(output)}`);
      } else {
        console.warn(`⚠️ Archivo no encontrado: ${input}`);
      }
    } catch (err) {
      console.error(`❌ Error al optimizar ${path.basename(input)}:`, err.message);
    }
  }
  console.log('Proceso finalizado.');
}

optimizeImages();
