/**
 * Analiza un negocio y estima propiedades (simuladas para MVP).
 * @param {Object} negocio - { nombre, direccion, lat, lon }
 * @returns {Promise<Object>} Negocio con tieneWebsite, esNuevo, pocasResenas
 */
export async function analyzeBusiness(negocio) {
  if (!negocio || !negocio.nombre) {
    throw new Error('analyzer: negocio debe tener al menos nombre');
  }

  // Simulación: heurística basada en nombre para dar variedad
  const seed = hashString(negocio.nombre + (negocio.direccion || ''));
  const tieneWebsite = (seed % 100) > 55;  // ~45% no tienen web
  const esNuevo = (seed % 100) > 65;       // ~35% son nuevos
  const pocasResenas = (seed % 100) > 40;  // ~60% tienen pocas reseñas

  return {
    ...negocio,
    tieneWebsite,
    esNuevo,
    pocasResenas,
  };
}

/**
 * Analiza una lista de negocios.
 */
export async function analyzeAll(negocios) {
  const results = [];
  for (const n of negocios) {
    const analyzed = await analyzeBusiness(n);
    results.push(analyzed);
  }
  return results;
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
