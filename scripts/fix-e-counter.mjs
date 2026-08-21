/**
 * fix-e-counter.mjs
 * Convierte pixels blancos/casi-blancos del counter de 08-e.png en transparentes.
 * Threshold más agresivo (160) para atrapar anti-aliasing en los bordes del counter.
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "../public/logo_letters/08-e.png");

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const buf = Buffer.from(data);

// Conteo antes
let opaqueCount = 0, transparentCount = 0;
for (let i = 0; i < buf.length; i += channels) {
  if (buf[i + 3] > 0) opaqueCount++; else transparentCount++;
}
console.log(`Antes: ${opaqueCount} opacos, ${transparentCount} transparentes`);

// Convertir pixels "blancos" (todos los canales RGB altos) a transparente.
// Se usa threshold 160 para atrapar anti-aliasing de bordes del counter.
let replaced = 0;
const THRESHOLD = 160;
for (let i = 0; i < buf.length; i += channels) {
  const r = buf[i], g = buf[i + 1], b = buf[i + 2], a = buf[i + 3];
  if (a > 0 && r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
    buf[i + 3] = 0;
    replaced++;
  }
}

// Contar colores para diagnóstico
let golden = 0, dark = 0, other = 0;
for (let i = 0; i < buf.length; i += channels) {
  const r = buf[i], g = buf[i + 1], b = buf[i + 2], a = buf[i + 3];
  if (a === 0) continue;
  if (r >= 150 && g >= 100 && b < 120) golden++;
  else if (r < 80 && g < 80 && b < 80) dark++;
  else other++;
}
console.log(`Pixels restantes: ${golden} dorados, ${dark} oscuros, ${other} otros`);
console.log(`Convertidos a transparente: ${replaced}`);

const DST = SRC + ".new.png";
await sharp(buf, { raw: { width, height, channels } }).png().toFile(DST);

import { renameSync } from "fs";
renameSync(DST, SRC);

console.log(`✅ 08-e.png actualizado`);
