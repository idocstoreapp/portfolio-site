/**
 * Parser: convierte datos crudos del panel de Google Maps a objeto estructurado.
 * Tolerante a campos faltantes.
 */

import { GEO_DEFAULT } from './utils.js';

const ESTADOS = ['ABIERTO', 'CERRADO', 'DESCONOCIDO'];

/**
 * Extrae número de valoración (rating) desde texto (ej: "4,6" o "4.6").
 * @param {string} text
 * @returns {number|null}
 */
function parseRating(text) {
  if (text == null || text === '') return null;
  const s = String(text).replace(',', '.').trim();
  const n = parseFloat(s);
  if (Number.isFinite(n) && n >= 0 && n <= 5) return Math.round(n * 10) / 10;
  return null;
}

/**
 * Extrae cantidad de reseñas desde texto (ej: "(1.234)" o "1.234 reseñas").
 * @param {string} text
 * @returns {number|null}
 */
function parseReviewCount(text) {
  if (text == null || text === '') return null;
  const match = String(text).replace(/\s/g, '').match(/(\d[\d.]*)/);
  if (!match) return null;
  const n = parseInt(match[1].replace(/\./g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Detecta estado ABIERTO/CERRADO desde texto del panel.
 * @param {string} text
 * @returns {'ABIERTO'|'CERRADO'|'DESCONOCIDO'}
 */
function parseEstado(text) {
  if (text == null || text === '') return 'DESCONOCIDO';
  const t = String(text).toLowerCase();
  if (t.includes('abierto') || t.includes('open')) return 'ABIERTO';
  if (t.includes('cerrado') || t.includes('closed')) return 'CERRADO';
  return 'DESCONOCIDO';
}

/**
 * Parsea un lugar crudo (objeto extraído del scraper) al formato de salida.
 * @param {Object} raw - Objeto con propiedades opcionales: nombre, direccion, comuna, ciudad, region, pais, telefono, website, rating, reviews, categoria, lat, lng, estado
 * @returns {Object}
 */
export function parsePlace(raw) {
  if (!raw || typeof raw !== 'object') raw = {};

  const nombre = raw.nombre != null ? String(raw.nombre).trim() : '';
  const direccion = raw.direccion != null ? String(raw.direccion).trim() : '';
  const comuna = raw.comuna != null ? String(raw.comuna).trim() : (raw.ciudad != null ? String(raw.ciudad).trim() : '');
  const ciudad = raw.ciudad != null ? String(raw.ciudad).trim() : GEO_DEFAULT.ciudad;
  const region = raw.region != null ? String(raw.region).trim() : GEO_DEFAULT.region;
  const pais = raw.pais != null ? String(raw.pais).trim() : GEO_DEFAULT.pais;
  const telefono = raw.telefono != null && raw.telefono !== '' ? String(raw.telefono).trim() : null;
  const website = raw.website != null && raw.website !== '' ? String(raw.website).trim() : null;
  const rating = parseRating(raw.rating) ?? (raw.rating != null ? parseRating(String(raw.rating)) : null);
  const reviews = raw.reviews != null && Number.isFinite(Number(raw.reviews)) ? Number(raw.reviews) : parseReviewCount(raw.reviewsText);
  const reviewsCount = (raw.reviews_count != null && Number.isFinite(Number(raw.reviews_count)))
    ? Math.max(0, Math.floor(Number(raw.reviews_count)))
    : (reviews != null && Number.isFinite(reviews) ? Math.max(0, Math.floor(reviews)) : 0);
  const categoria = raw.categoria != null ? String(raw.categoria).trim() : '';
  const lat = raw.lat != null && Number.isFinite(Number(raw.lat)) ? Number(raw.lat) : null;
  const lng = raw.lng != null && Number.isFinite(Number(raw.lng)) ? Number(raw.lng) : null;
  const estado = ESTADOS.includes(raw.estado) ? raw.estado : parseEstado(raw.estadoText || raw.estado);
  const reviewSnippets = Array.isArray(raw.reviewSnippets) ? raw.reviewSnippets : [];
  const websiteReason = raw.website_reason != null ? String(raw.website_reason) : null;

  return {
    nombre: nombre || 'Sin nombre',
    direccion: direccion || `${nombre || ''}, ${ciudad}, ${region}, ${pais}`.replace(/^,\s*/, '').trim(),
    comuna: comuna || ciudad,
    ciudad,
    region,
    pais,
    telefono,
    website,
    website_reason: websiteReason,
    rating: rating ?? null,
    reviews: reviews ?? reviewsCount,
    reviews_count: reviewsCount,
    categoria: categoria || null,
    coords: (lat != null && lng != null) ? { lat, lng } : { lat: null, lng: null },
    estado,
    review_snippets: reviewSnippets,
    score: 0,
    prioridad: 'BAJA',
  };
}

/**
 * Parsea un array de lugares crudos.
 * @param {Array<Object>} rawList
 * @returns {Array<Object>}
 */
export function parsePlaces(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((raw) => parsePlace(raw));
}
