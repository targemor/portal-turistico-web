import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas de archivos
const htmlReportPath = path.join(__dirname, '../lighthouse-report.html');
const outputJsonPath = path.join(__dirname, '../lighthouse-feedback.json');

console.log('Analizando el reporte de Lighthouse...');

try {
  // 1. Leer el archivo HTML
  const htmlContent = fs.readFileSync(htmlReportPath, 'utf8');

  // 2. Extraer el objeto JSON inyectado por Lighthouse
  // Lighthouse guarda los datos en window.__LIGHTHOUSE_JSON__ = {...};
  const jsonMatch = htmlContent.match(/window\.__LIGHTHOUSE_JSON__\s*=\s*(\{.*?\});\s*<\/script>/s);

  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('No se pudo encontrar la data JSON dentro de lighthouse-report.html');
  }

  // 3. Parsear el JSON
  const lhData = JSON.parse(jsonMatch[1]);

  // 4. Filtrar las auditorías (audits) para obtener áreas de mejora
  const feedbackItems = [];

  // Recorrer todas las auditorías
  for (const [id, audit] of Object.entries(lhData.audits)) {
    // Ignorar auditorías que pasaron perfecto (score === 1), o que no aplican (score === null)
    // Nos enfocamos en score < 1 (o score nulo pero que indica un error/advertencia si tiene details)
    if (audit.score !== null && audit.score < 1) {
      feedbackItems.push({
        id: audit.id,
        title: audit.title,
        score: audit.score,
        displayValue: audit.displayValue || 'N/A',
        description: audit.description,
        // Si hay oportunidades de ahorro (como ms ganados al comprimir imágenes)
        metricSavings: audit.metricSavings || undefined,
      });
    }
  }

  // 5. Agrupar la información esencial
  const summary = {
    url: lhData.finalUrl,
    fetchTime: lhData.fetchTime,
    categories: {},
    improvements: feedbackItems.sort((a, b) => (a.score || 0) - (b.score || 0)), // Ordenar de peor a mejor
  };

  // Obtener los puntajes generales por categoría (Performance, Accesibilidad, etc.)
  if (lhData.categories) {
    for (const [catId, catData] of Object.entries(lhData.categories)) {
      summary.categories[catData.title] = Math.round(catData.score * 100);
    }
  }

  // 6. Escribir el nuevo JSON limpio
  fs.writeFileSync(outputJsonPath, JSON.stringify(summary, null, 2), 'utf8');

  console.log('✅ ¡Feedback extraído exitosamente!');
  console.log(`📂 Archivo generado: ${outputJsonPath}`);
  console.log(`⚠️  Se encontraron ${feedbackItems.length} áreas de mejora.`);

} catch (error) {
  console.error('❌ Error al procesar el reporte:', error.message);
}
