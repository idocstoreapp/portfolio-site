/**
 * Lista diaria de 50-100 contactos verificados en Chile.
 * Busca por categorías y ciudades, filtra rating >= 4, deduplica, entrega JSON.
 *
 * Uso: node daily-leads.js
 * Salida: leads-diarios.json (y por consola el array JSON)
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { scrapeMaps } from './mapsScraper.js';
import { parsePlaces } from './parser.js';
import { deduplicateByPhone, deduplicateByNameAndAddress } from './utils.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

puppeteer.use(StealthPlugin());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, 'leads-diarios.json');

const CATEGORIAS = [
  'Servicio técnico celulares',
  'Taller mecánico',
  'Restaurantes',
  'Dentistas',
  'Peluquerías barberías',
  'Tiendas de informática y accesorios móviles',
];

const CIUDADES = [
  'Santiago',
  'Valparaíso',
  'Concepción',
  'Antofagasta',
  'La Serena',
  'Temuco',
  'Viña del Mar',
  'Rancagua',
];

const MIN_LEADS = 50;
const TARGET_LEADS = 100;
const RESULTS_PER_SEARCH = 12;
const MIN_RATING = 4.0;

function toLeadSchema(place, categoria) {
  const rating = place.rating != null && place.rating !== '' ? Number(place.rating) : null;
  const reviews = place.reviews_count ?? place.reviews;
  return {
    nombre: (place.nombre || '').trim() || '',
    direccion: (place.direccion || '').trim() || '',
    comuna: (place.comuna || '').trim() || '',
    ciudad: (place.ciudad || '').trim() || '',
    region: (place.region || '').trim() || '',
    pais: 'Chile',
    telefono: (place.telefono && String(place.telefono).trim()) ? String(place.telefono).trim() : 'desconocido',
    website: (place.website && String(place.website).trim()) ? String(place.website).trim() : '',
    rating: rating != null ? String(rating) : 'desconocido',
    reviews_count: reviews != null && reviews !== '' ? String(reviews) : 'desconocido',
    categoria: categoria || (place.categoria || '').trim() || '',
  };
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const allRaw = [];
  const seenQueries = new Set();

  try {
    for (const categoria of CATEGORIAS) {
      for (const ciudad of CIUDADES) {
        const fullQuery = `${categoria} ${ciudad} Chile`;
        if (seenQueries.has(fullQuery)) continue;
        seenQueries.add(fullQuery);

        try {
          const { results } = await scrapeMaps(fullQuery, {
            minResults: RESULTS_PER_SEARCH,
            externalBrowser: browser,
          });
          if (results && results.length) {
            results.forEach((r) => {
              r.categoria = r.categoria || categoria;
              r.ciudad = r.ciudad || ciudad;
            });
            allRaw.push(...results);
          }
        } catch (_) {}

        if (allRaw.length >= 150) break;
      }
      if (allRaw.length >= 150) break;
    }

    let places = parsePlaces(allRaw);
    places = deduplicateByPhone(places);
    places = deduplicateByNameAndAddress(places);

    places = places.filter((p) => {
      const r = p.rating != null ? Number(p.rating) : null;
      if (r != null && r < MIN_RATING) return false;
      const name = (p.nombre || '').trim();
      return name && !/^resultados$/i.test(name);
    });

    places.sort((a, b) => {
      const aPhone = (a.telefono && String(a.telefono).trim() && String(a.telefono) !== 'desconocido') ? 1 : 0;
      const bPhone = (b.telefono && String(b.telefono).trim() && String(b.telefono) !== 'desconocido') ? 1 : 0;
      if (bPhone !== aPhone) return bPhone - aPhone;
      const ra = a.rating != null ? Number(a.rating) : 0;
      const rb = b.rating != null ? Number(b.rating) : 0;
      return rb - ra;
    });

    const leads = places.slice(0, TARGET_LEADS).map((p) => toLeadSchema(p, p.categoria));

    const out = leads.length >= MIN_LEADS ? leads : leads;
    writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2), 'utf8');
    console.log(JSON.stringify(out, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
