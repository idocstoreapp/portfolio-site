import { getDb } from '../db/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'output');
const outputPath = path.join(outputDir, 'prospects.json');

/**
 * Guarda prospectos en SQLite evitando duplicados (por nombre, direccion, lat, lon).
 * Añade createdAt a cada uno.
 */
export function saveProspects(prospectos) {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR IGNORE INTO prospects (
      nombre, direccion, lat, lon,
      tiene_website, es_nuevo, pocas_resenas,
      score, prioridad, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const toRow = (p) => [
    p.nombre ?? '',
    p.direccion ?? '',
    p.lat ?? 0,
    p.lon ?? 0,
    p.tieneWebsite ? 1 : 0,
    p.esNuevo ? 1 : 0,
    p.pocasResenas ? 1 : 0,
    p.score ?? 0,
    p.prioridad ?? 'BAJA',
  ];

  const runMany = db.transaction((list) => {
    for (const p of list) {
      insert.run(...toRow(p));
    }
  });

  runMany(prospectos);
  return prospectos.length;
}

/**
 * Exporta los prospectos a /output/prospects.json.
 */
export function exportToJson(prospectos) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const withCreatedAt = prospectos.map((p) => ({
    ...p,
    createdAt: p.createdAt ?? new Date().toISOString(),
  }));

  fs.writeFileSync(outputPath, JSON.stringify(withCreatedAt, null, 2), 'utf-8');
  return outputPath;
}

/**
 * Obtiene los N prospectos con mayor score desde la DB.
 */
export function getTopProspects(limit = 10) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT nombre, direccion, lat, lon,
           tiene_website AS tieneWebsite,
           es_nuevo AS esNuevo,
           pocas_resenas AS pocasResenas,
           score, prioridad, created_at AS createdAt
    FROM prospects
    ORDER BY score DESC
    LIMIT ?
  `).all(limit);

  return rows.map((r) => ({
    ...r,
    tieneWebsite: Boolean(r.tieneWebsite),
    esNuevo: Boolean(r.esNuevo),
    pocasResenas: Boolean(r.pocasResenas),
  }));
}
