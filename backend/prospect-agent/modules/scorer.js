const UMBRAL_ALTA = 70;
const UMBRAL_MEDIA = 40;

/**
 * Calcula el score de probabilidad de conversión y la prioridad.
 * @param {Object} prospecto - Con tieneWebsite, esNuevo, pocasResenas
 * @returns {Object} prospecto con score y prioridad
 */
export function scoreProspect(prospecto) {
  if (!prospecto) {
    throw new Error('scorer: prospecto es requerido');
  }

  let score = 0;
  if (!prospecto.tieneWebsite) score += 40;
  if (prospecto.esNuevo) score += 30;
  if (prospecto.pocasResenas) score += 20;

  let prioridad;
  if (score >= UMBRAL_ALTA) prioridad = 'ALTA PRIORIDAD';
  else if (score >= UMBRAL_MEDIA) prioridad = 'MEDIA';
  else prioridad = 'BAJA';

  return {
    ...prospecto,
    score,
    prioridad,
  };
}

/**
 * Calcula score para todos los prospectos.
 */
export function scoreAll(prospectos) {
  return prospectos.map((p) => scoreProspect(p));
}
