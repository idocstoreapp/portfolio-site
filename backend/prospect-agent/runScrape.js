/**
 * CLI bridge para el CRM: ejecuta búsqueda en Maps y devuelve leads normalizados por stdout.
 * Uso: node runScrape.js "rubro" "ciudad" limite
 * Ejemplo: node runScrape.js "servicio tecnico celulares" "Santiago" 15
 */

import { buildSearchQuery } from './utils.js';
import { scrapeMaps } from './mapsScraper.js';
import { parsePlaces } from './parser.js';

const args = process.argv.slice(2).filter((a) => typeof a === 'string');
const rubro = (args[0] || '').trim() || 'servicio tecnico celulares';
const ciudad = (args[1] || '').trim() || 'Santiago';
const limite = Math.max(5, Math.min(50, parseInt(args[2], 10) || 20));

const fullQuery = buildSearchQuery(rubro, ciudad);

const { results } = await scrapeMaps(fullQuery, { minResults: limite });
const parsed = parsePlaces(results);

const normalized = parsed.map((p) => ({
  nombre: p.nombre || '',
  telefono: p.telefono ?? null,
  website: p.website ?? null,
  direccion: p.direccion || '',
  ciudad: p.ciudad || ciudad,
  rubro: p.categoria || rubro,
  score: typeof p.score === 'number' ? p.score : 0,
}));

process.stdout.write(JSON.stringify(normalized));
