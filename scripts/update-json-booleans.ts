import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve('src', 'data');

async function processJsonFile(fileName: string) {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!data) return;

    const processItem = (item: any) => {
      if (!item || typeof item !== 'object') return;
      const text = [
        item.caracteristicas,
        item.amenidades,
        item.descripcion,
        item.atractivo_principal,
        item.especialidad
      ].filter(Boolean).join(' ').toLowerCase();

      item.pet_friendly = item.pet_friendly ?? (item.es_pet_friendly || text.includes('pet friendly') || text.includes('mascotas'));
      item.estacionamiento = item.estacionamiento ?? (text.includes('estacionamiento') || text.includes('parking'));
      item.alberca = item.alberca ?? (text.includes('alberca') || text.includes('piscina'));
      item.gimnasio = item.gimnasio ?? (text.includes('gimnasio') || text.includes('gym'));
      item.jardin = item.jardin ?? (text.includes('jardín') || text.includes('jardin'));
      item.terraza = item.terraza ?? text.includes('terraza');
      item.musica_en_vivo = item.musica_en_vivo ?? (text.includes('música en vivo') || text.includes('musica en vivo'));
      item.vistas_increibles = item.vistas_increibles ?? (text.includes('vistas increíbles') || text.includes('vistas increibles') || text.includes('vista panorámica'));
      item.para_llevar = item.para_llevar ?? text.includes('para llevar');
      item.aire_libre = item.aire_libre ?? text.includes('aire libre');
      item.recepcion_24h = item.recepcion_24h ?? (text.includes('24h') || text.includes('24 horas') || text.includes('recepción 24'));
      item.desayuno_cortesia = item.desayuno_cortesia ?? text.includes('desayuno');
    };

    if (Array.isArray(data)) {
      data.forEach(processItem);
    } else if (typeof data === 'object') {
      if (Array.isArray(data.imperdibles)) data.imperdibles.forEach(processItem);
      if (Array.isArray(data.mejores_hoteles)) data.mejores_hoteles.forEach(processItem);
      if (Array.isArray(data.mejores_restaurantes)) data.mejores_restaurantes.forEach(processItem);
    }

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✔ Actualizados campos booleanos en: ${fileName}`);
  } catch (err) {
    console.error(`❌ Error procesando ${fileName}:`, err);
  }
}

async function main() {
  const files = ['hoteles.json', 'restaurantes.json', 'artesanias.json', 'home-page.json', 'destinos-turisticos.json'];
  for (const f of files) {
    await processJsonFile(f);
  }
}

main();
