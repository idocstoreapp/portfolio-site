import axios from 'axios';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'ProspectAgent/1.0 (local business discovery)';

/**
 * Busca negocios usando OpenStreetMap Nominatim API.
 * @param {string} query - Búsqueda (ej: "servicio técnico celulares Santiago Chile")
 * @param {number} limit - Máximo de resultados (default 20)
 * @returns {Promise<Array<{nombre: string, direccion: string, lat: number, lon: number}>>}
 */
export async function discoverBusinesses(query, limit = 20) {
  if (!query || typeof query !== 'string') {
    throw new Error('discover: query es requerido y debe ser string');
  }

  try {
    const { data } = await axios.get(NOMINATIM_BASE, {
      params: {
        q: query,
        format: 'json',
        limit: Math.min(limit, 50),
        addressdetails: 1,
      },
      headers: {
        'User-Agent': USER_AGENT,
      },
      timeout: 15000,
    });

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => ({
      nombre: item.display_name?.split(',')[0]?.trim() || item.display_name || 'Sin nombre',
      direccion: item.display_name || '',
      lat: parseFloat(item.lat) || 0,
      lon: parseFloat(item.lon) || 0,
    }));
  } catch (err) {
    if (err.response?.status === 429) {
      throw new Error('Nominatim: demasiadas peticiones. Espera unos segundos.');
    }
    throw new Error(`discover: ${err.message || 'Error al buscar negocios'}`);
  }
}
