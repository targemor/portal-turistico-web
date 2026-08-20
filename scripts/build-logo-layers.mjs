/**
 * Genera las capas del logo a partir de public/logo_bn.svg.
 *
 * El SVG es un trazado de potrace del line art: solo contiene contornos, el
 * interior de las letras es transparente. Para poder pintar las letras de color
 * solido hacen falta siluetas macizas, que aqui se derivan en tres pasos:
 *
 *   1. Silueta: se rasteriza el line art y se inunda el lienzo desde el borde.
 *      Lo que la inundacion no alcanza (trazos + areas que encierran) es letra.
 *   2. Separacion: las letras que se tocan quedan en una sola region conexa
 *      (T-e-h-u-a). Se separan con un watershed desde semillas que usa los
 *      propios contornos del line art como barrera, asi ninguna region puede
 *      desbordar el perimetro de su letra.
 *   3. Recorte: cada letra se guarda ya coloreada y recortada a su bounding
 *      box, mas un JSON con las posiciones en % para colocarlas por CSS.
 *
 * Salida:
 *   public/logo_fill.png             silueta completa (mascara del estado base)
 *   public/logo_detail.png           line art recortado a la silueta
 *   public/logo_letters/NN-key.png   una letra coloreada por archivo
 *   src/data/logo-letters.json       posiciones y colores, para el componente
 *
 * Uso: node scripts/build-logo-layers.mjs
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public", "logo_bn.svg");
const OUT_FILL = path.join(ROOT, "public", "logo_fill.png");
const OUT_DETAIL = path.join(ROOT, "public", "logo_detail.png");
const OUT_DIR = path.join(ROOT, "public", "logo_letters");
const OUT_MANIFEST = path.join(ROOT, "src", "data", "logo-letters.json");

const W = 2936;
const H = 1440;
const INK = 40; // alpha por encima de esto cuenta como trazo
const DILATE = 2; // engorda los trazos para cerrar cortes del antialiasing
const PAD = 4; // margen para que la inundacion pueda rodear el dibujo
const SEED_INSET = 0.15; // recorte lateral de la banda que hace de semilla
const CLOSE_R = 11; // radio del cierre que absorbe el dibujo dentro de un hueco

const ROJO = "#D62027"; // la u y la a comparten el rojo del logo
const ARENA = "#C0894F"; // la a con acento y su tilde van del mismo color

/**
 * Letras en orden de lectura, con el color tomado del logo oficial.
 *
 * `at` localiza la region conexa de la letra: basta un punto dentro de ella.
 * Las cinco que se tocan entre si (T-e-h-u-a) caen en una unica region, asi que
 * se separan por watershed y se declaran con `band`, el rango X de su cuerpo
 * medido sobre los contornos del SVG. `seeds` agrega puntos de refuerzo donde
 * la banda no llega, como el asta izquierda de la h, que es estrecha y quedaba
 * del color de la e.
 */
const LETTERS = [
  { key: "Y1", color: "#7A2E8E", at: [1044, 535] },
  { key: "O1", color: "#7A2E8E", at: [1204, 535] },
  { key: "S", color: "#76BC21", at: [1428, 535] },
  { key: "O2", color: "#76BC21", at: [1591, 535] },
  { key: "Y2", color: "#76BC21", at: [1753, 535] },
  { key: "D", color: "#7A2E8E", at: [1977, 535] },
  { key: "E", color: "#7A2E8E", at: [2130, 535] },
  { key: "T", color: "#A9123F", band: [142, 545] },
  { key: "e", color: "#D9A441", band: [545, 790] },
  {
    key: "h",
    color: "#2E9E4F",
    band: [790, 1149],
    seeds: [[830, 680], [830, 800], [830, 930], [830, 1040]],
  },
  { key: "u", color: ROJO, band: [1149, 1475] },
  { key: "a", color: ROJO, band: [1475, 1808] },
  { key: "c", color: "#1B75BB", at: [1966, 920] },
  { key: "a_con_acento", color: ARENA, at: [2297, 920] },
  { key: "acento", color: ARENA, at: [2326, 667] },
  { key: "n", color: "#7A3B9E", at: [2663, 920] },
];

/**
 * Contraformas que deben quedar transparentes. La inundacion exterior no puede
 * entrar en un hueco cerrado, asi que sin esto el ojo de la a o de la O saldria
 * macizo. Cada punto cae dentro del hueco a vaciar.
 *
 * La c y la n no aparecen porque son abiertas y la inundacion ya entra sola.
 */
const HOLES = [
  { key: "O1", at: [[1205, 535]] },
  { key: "O2", at: [[1592, 535]] },
  { key: "D", at: [[1977, 535]] },
  // el dibujo de la gota parte esta contraforma en dos celdas: hacen falta las
  // dos para poder cerrarla como una sola
  { key: "a", at: [[1660, 930], [1630, 916]] },
  { key: "a_con_acento", at: [[2249, 917]] },
];

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

/* ---------- 1. rasterizar y aislar la silueta ---------- */

const { data } = await sharp(SRC)
  .resize(W, H, { fit: "fill" })
  .extend({
    top: PAD,
    bottom: PAD,
    left: PAD,
    right: PAD,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = W + PAD * 2;
const h = H + PAD * 2;
const n = w * h;

const ink = new Uint8Array(n);
for (let i = 0; i < n; i++) ink[i] = data[i * 4 + 3] > INK ? 1 : 0;

const dilate = (src, r) => {
  const tmp = new Uint8Array(n);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let d = -r; d <= r && !v; d++) {
        const xx = x + d;
        if (xx >= 0 && xx < w && src[row + xx]) v = 1;
      }
      tmp[row + x] = v;
    }
  }
  const out = new Uint8Array(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let d = -r; d <= r && !v; d++) {
        const yy = y + d;
        if (yy >= 0 && yy < h && tmp[yy * w + x]) v = 1;
      }
      out[y * w + x] = v;
    }
  }
  return out;
};

const closed = DILATE > 0 ? dilate(ink, DILATE) : ink;

const stack = new Int32Array(n);
const outside = new Uint8Array(n);
{
  let sp = 0;
  const push = (i) => {
    if (!outside[i] && !closed[i]) {
      outside[i] = 1;
      stack[sp++] = i;
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (sp > 0) {
    const i = stack[--sp];
    const x = i % w;
    const y = (i - x) / w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }
}

const idx = (x, y) => (y + PAD) * w + (x + PAD);

/* ---------- 1b. vaciar las contraformas ---------- */

/**
 * Absorbe el dibujo que quede dentro de un hueco. En la primera a hay una gota
 * dibujada dentro de la contraforma, y su trazo esta unido al contorno del
 * ovalo, asi que no es una isla que se pueda detectar por conectividad: hay que
 * cerrar la grieta. Un cierre morfologico rellena lo estrecho de dentro y
 * devuelve el borde exterior del hueco a su sitio, dejando las dos
 * contraformas de la a del mismo tamano.
 */
const closeHole = (pixels) => {
  let x0 = w, x1 = -1, y0 = h, y1 = -1;
  for (const i of pixels) {
    const x = i % w;
    const y = (i - x) / w;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  const m = CLOSE_R * 2 + 2; // margen para que la erosion no muerda el borde
  const ax = Math.max(0, x0 - m);
  const bx = Math.min(w - 1, x1 + m);
  const ay = Math.max(0, y0 - m);
  const by = Math.min(h - 1, y1 + m);
  const ww = bx - ax + 1;
  const wh = by - ay + 1;

  let cur = new Uint8Array(ww * wh);
  for (const i of pixels) {
    const x = i % w;
    const y = (i - x) / w;
    cur[(y - ay) * ww + (x - ax)] = 1;
  }
  const dil = (src, r) => {
    const t = new Uint8Array(ww * wh);
    for (let y = 0; y < wh; y++)
      for (let x = 0; x < ww; x++) {
        let v = 0;
        for (let d = -r; d <= r && !v; d++) {
          const xx = x + d;
          if (xx >= 0 && xx < ww && src[y * ww + xx]) v = 1;
        }
        t[y * ww + x] = v;
      }
    const o = new Uint8Array(ww * wh);
    for (let y = 0; y < wh; y++)
      for (let x = 0; x < ww; x++) {
        let v = 0;
        for (let d = -r; d <= r && !v; d++) {
          const yy = y + d;
          if (yy >= 0 && yy < wh && t[yy * ww + x]) v = 1;
        }
        o[y * ww + x] = v;
      }
    return o;
  };
  const invert = (a) => {
    const o = new Uint8Array(ww * wh);
    for (let k = 0; k < a.length; k++) o[k] = a[k] ? 0 : 1;
    return o;
  };
  cur = invert(dil(invert(dil(cur, CLOSE_R)), CLOSE_R)); // dilatar + erosionar

  let added = 0;
  for (let y = 0; y < wh; y++) {
    for (let x = 0; x < ww; x++) {
      if (!cur[y * ww + x]) continue;
      const i = (y + ay) * w + (x + ax);
      if (!outside[i]) {
        outside[i] = 1;
        added++;
      }
    }
  }
  return added;
};

for (const hole of HOLES) {
  const pixels = [];
  for (const [hx, hy] of hole.at) {
    const start = idx(hx, hy);
    if (closed[start]) {
      console.error(`AVISO: el punto de ${hole.key} (${hx},${hy}) cae sobre un trazo.`);
      process.exit(1);
    }
    if (outside[start]) continue; // ya estaba abierta al exterior
    let sp = 0;
    stack[sp++] = start;
    outside[start] = 1;
    while (sp > 0) {
      const i = stack[--sp];
      pixels.push(i);
      const x = i % w;
      const y = (i - x) / w;
      for (const j of [
        x > 0 ? i - 1 : -1,
        x < w - 1 ? i + 1 : -1,
        y > 0 ? i - w : -1,
        y < h - 1 ? i + w : -1,
      ]) {
        if (j >= 0 && !outside[j] && !closed[j]) {
          outside[j] = 1;
          stack[sp++] = j;
        }
      }
    }
  }
  if (!pixels.length) continue;
  const added = closeHole(pixels);
  console.log(
    `hueco ${hole.key}: ${pixels.length} px vaciados` +
      (added ? ` + ${added} de dibujo interior = ${pixels.length + added}` : "")
  );
}

const fill = new Uint8Array(n);
let filledPx = 0;
for (let i = 0; i < n; i++) {
  fill[i] = outside[i] ? 0 : 1;
  if (fill[i]) filledPx++;
}
if (!filledPx || filledPx / n > 0.9) {
  console.error("AVISO: la silueta no parece valida; revisa INK/DILATE.");
  process.exit(1);
}

/* ---------- 2. separar las letras ---------- */

const comp = new Int32Array(n).fill(-1);
let compCount = 0;
for (let s = 0; s < n; s++) {
  if (!fill[s] || comp[s] >= 0) continue;
  const id = compCount++;
  let sp = 0;
  stack[sp++] = s;
  comp[s] = id;
  while (sp > 0) {
    const i = stack[--sp];
    const x = i % w;
    const y = (i - x) / w;
    if (x > 0 && fill[i - 1] && comp[i - 1] < 0) {
      comp[i - 1] = id;
      stack[sp++] = i - 1;
    }
    if (x < w - 1 && fill[i + 1] && comp[i + 1] < 0) {
      comp[i + 1] = id;
      stack[sp++] = i + 1;
    }
    if (y > 0 && fill[i - w] && comp[i - w] < 0) {
      comp[i - w] = id;
      stack[sp++] = i - w;
    }
    if (y < h - 1 && fill[i + w] && comp[i + w] < 0) {
      comp[i + w] = id;
      stack[sp++] = i + w;
    }
  }
}

const label = new Int32Array(n).fill(-1);

// bounding box de cada region, para localizarlas por contencion: el centro de
// una letra abierta como la "c" cae en su hueco, no sobre la silueta
const boxes = Array.from({ length: compCount }, () => ({
  x0: Infinity,
  x1: -Infinity,
  y0: Infinity,
  y1: -Infinity,
  area: 0,
}));
for (let i = 0; i < n; i++) {
  const c = comp[i];
  if (c < 0) continue;
  const x = i % w;
  const y = (i - x) / w;
  const b = boxes[c];
  b.area++;
  if (x < b.x0) b.x0 = x;
  if (x > b.x1) b.x1 = x;
  if (y < b.y0) b.y0 = y;
  if (y > b.y1) b.y1 = y;
}

const bandLetters = [];
LETTERS.forEach((L, li) => {
  if (!L.at) {
    bandLetters.push(li);
    return;
  }
  const px = L.at[0] + PAD;
  const py = L.at[1] + PAD;
  const hits = boxes
    .map((b, c) => ({ b, c }))
    .filter(({ b }) => px >= b.x0 && px <= b.x1 && py >= b.y0 && py <= b.y1)
    .sort((p, q) => p.b.area - q.b.area); // la mas ajustada al punto
  if (!hits.length) {
    console.error(`AVISO: ningun region contiene el punto de ${L.key} (${L.at}).`);
    process.exit(1);
  }
  const c = hits[0].c;
  for (let i = 0; i < n; i++) if (comp[i] === c) label[i] = li;
});

{
  const seeds = [];
  const sow = (i, li) => {
    if (i >= 0 && i < n && fill[i] && !ink[i] && label[i] < 0) {
      label[i] = li;
      seeds.push(i);
    }
  };
  for (const li of bandLetters) {
    const [xa, xb] = LETTERS[li].band;
    const inset = (xb - xa) * SEED_INSET;
    for (let y = 0; y < H; y++) {
      for (let x = Math.round(xa + inset); x < Math.round(xb - inset); x++) {
        sow(idx(x, y), li);
      }
    }
    // puntos de refuerzo, con holgura por si caen sobre un trazo
    for (const [sx, sy] of LETTERS[li].seeds ?? []) {
      let sown = 0;
      for (let dy = -6; dy <= 6; dy++) {
        for (let dx = -6; dx <= 6; dx++) {
          const before = seeds.length;
          sow(idx(sx + dx, sy + dy), li);
          sown += seeds.length - before;
        }
      }
      if (!sown) {
        console.error(`AVISO: la semilla de ${LETTERS[li].key} en (${sx},${sy}) no prendio.`);
        process.exit(1);
      }
    }
  }

  // pase 1: crece sin poder cruzar un trazo, asi no desborda la letra
  let head = 0;
  while (head < seeds.length) {
    const i = seeds[head++];
    const li = label[i];
    const x = i % w;
    const y = (i - x) / w;
    const nb = [
      x > 0 ? i - 1 : -1,
      x < w - 1 ? i + 1 : -1,
      y > 0 ? i - w : -1,
      y < h - 1 ? i + w : -1,
    ];
    for (const j of nb) {
      if (j >= 0 && fill[j] && !ink[j] && label[j] < 0) {
        label[j] = li;
        seeds.push(j);
      }
    }
  }

  // pase 2: los trazos, y las celdas que los detalles interiores dejaron
  // aisladas, se asignan a la etiqueta mas cercana
  const rest = [];
  for (let i = 0; i < n; i++) if (label[i] >= 0) rest.push(i);
  head = 0;
  while (head < rest.length) {
    const i = rest[head++];
    const li = label[i];
    const x = i % w;
    const y = (i - x) / w;
    const nb = [
      x > 0 ? i - 1 : -1,
      x < w - 1 ? i + 1 : -1,
      y > 0 ? i - w : -1,
      y < h - 1 ? i + w : -1,
    ];
    for (const j of nb) {
      if (j >= 0 && fill[j] && label[j] < 0) {
        label[j] = li;
        rest.push(j);
      }
    }
  }
}

let orphan = 0;
for (let i = 0; i < n; i++) if (fill[i] && label[i] < 0) orphan++;

/* ---------- 3. escribir las capas ---------- */

await fs.mkdir(OUT_DIR, { recursive: true });
for (const f of await fs.readdir(OUT_DIR)) await fs.rm(path.join(OUT_DIR, f));

const silhouette = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const d = (y * W + x) * 4;
    silhouette[d] = 255;
    silhouette[d + 1] = 255;
    silhouette[d + 2] = 255;
    silhouette[d + 3] = fill[idx(x, y)] ? 255 : 0;
  }
}
await sharp(silhouette, { raw: { width: W, height: H, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT_FILL);

// El line art tambien dibuja dentro de las contraformas: la gota de la primera
// a, por ejemplo. Recortandolo a la silueta, los huecos quedan limpios y el
// detalle solo se ve sobre el relleno de las letras.
const detail = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = idx(x, y);
    const d = (y * W + x) * 4;
    detail[d + 3] = fill[i] ? data[i * 4 + 3] : 0;
  }
}
await sharp(detail, { raw: { width: W, height: H, channels: 4 } })
  // se usa como mascara a unos cientos de px de ancho, no hace falta la
  // resolucion completa y a tamano nativo pesa varias veces mas
  .resize(Math.round(W / 2), Math.round(H / 2))
  .png({ compressionLevel: 9, palette: true })
  .toFile(OUT_DETAIL);

const manifest = [];
for (let li = 0; li < LETTERS.length; li++) {
  const L = LETTERS[li];
  let x0 = W;
  let x1 = -1;
  let y0 = H;
  let y1 = -1;
  let area = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (label[idx(x, y)] !== li) continue;
      area++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (area === 0) {
    console.error(`AVISO: ${L.key} quedo vacia.`);
    process.exit(1);
  }
  const bw = x1 - x0 + 1;
  const bh = y1 - y0 + 1;
  const [r, g, b] = hex(L.color);
  const buf = Buffer.alloc(bw * bh * 4);
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const d = (y * bw + x) * 4;
      buf[d] = r;
      buf[d + 1] = g;
      buf[d + 2] = b;
      buf[d + 3] = label[idx(x0 + x, y0 + y)] === li ? 255 : 0;
    }
  }
  const file = `${String(li).padStart(2, "0")}-${L.key}.png`;
  await sharp(buf, { raw: { width: bw, height: bh, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, file));
  manifest.push({
    key: L.key,
    color: L.color,
    src: `/logo_letters/${file}`,
    // porcentajes sobre el viewBox, para posicionar por CSS
    left: +((x0 / W) * 100).toFixed(4),
    top: +((y0 / H) * 100).toFixed(4),
    width: +((bw / W) * 100).toFixed(4),
    height: +((bh / H) * 100).toFixed(4),
  });
  console.log(
    `${file.padEnd(22)} ${String(area).padStart(7)} px  x ${x0}-${x1}  y ${y0}-${y1}`
  );
}

await fs.writeFile(
  OUT_MANIFEST,
  JSON.stringify({ viewBox: [W, H], letters: manifest }, null, 2) + "\n"
);

console.log(
  `\nsilueta: ${((filledPx / n) * 100).toFixed(1)}% del lienzo, ${compCount} regiones conexas`
);
console.log(`pixeles sin asignar: ${orphan}`);
