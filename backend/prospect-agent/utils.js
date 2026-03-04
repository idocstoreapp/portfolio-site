/**
 * Utilidades: contexto geográfico por defecto, deduplicación y helpers.
 */

export const GEO_DEFAULT = {
  ciudad: 'Santiago',
  region: 'Metropolitana',
  pais: 'Chile',
};

/**
 * Construye el sufijo de ubicación para la búsqueda en Google Maps.
 * @param {string} [comuna] - Comuna opcional (ej: "Las Condes")
 * @returns {string}
 */
export function getLocationSuffix(comuna = null) {
  if (comuna && typeof comuna === 'string' && comuna.trim()) {
    return `${comuna.trim()} ${GEO_DEFAULT.ciudad} ${GEO_DEFAULT.pais}`;
  }
  return `${GEO_DEFAULT.ciudad} ${GEO_DEFAULT.pais}`;
}

/**
 * Enriquece la consulta del usuario con el contexto geográfico.
 * @param {string} query - Consulta del usuario (ej: "Plaza de Armas", "peluquerías")
 * @param {string} [comuna] - Comuna opcional
 * @returns {string} - Consulta para Google Maps (ej: "Plaza de Armas Santiago Chile")
 */
export function buildSearchQuery(query, comuna = null) {
  const q = (query || '').trim();
  if (!q) return getLocationSuffix(comuna);
  const suffix = getLocationSuffix(comuna);
  return `${q} ${suffix}`;
}

/**
 * Normaliza teléfono a solo dígitos para comparación.
 */
function normalizePhone(phone) {
  if (phone == null || phone === '') return '';
  return String(phone).replace(/\D/g, '');
}

/**
 * Elimina duplicados por nombre + dirección.
 */
export function deduplicateByNameAndAddress(list) {
  if (!Array.isArray(list) || list.length === 0) return list;
  const seen = new Set();
  return list.filter((item) => {
    const nombre = (item.nombre ?? '').toString().trim();
    const direccion = (item.direccion ?? '').toString().trim();
    const key = `${nombre}|${direccion}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Elimina duplicados por teléfono: mismo número = mismo negocio, se queda el primero.
 */
export function deduplicateByPhone(list) {
  if (!Array.isArray(list) || list.length === 0) return list;
  const seen = new Set();
  return list.filter((item) => {
    const phone = normalizePhone(item.telefono);
    if (!phone) return true;
    if (seen.has(phone)) return false;
    seen.add(phone);
    return true;
  });
}

/**
 * Normaliza string para comparación (quita acentos, minúsculas).
 * @param {string} s
 * @returns {string}
 */
export function normalizeString(s) {
  if (s == null || typeof s !== 'string') return '';
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
