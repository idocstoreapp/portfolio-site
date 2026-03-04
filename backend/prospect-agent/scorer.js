/**
 * Scoring para nicho "servicio técnico celulares".
 * Puntos por oportunidades de mejora (más puntos = mejor lead).
 * Incluye array `reasons` con los motivos que sumaron puntos.
 */

const POINTS = {
  DOMAIN_POOR: 35,      // bento.me, linktr.ee, instagram, facebook
  NO_WEBSITE: 40,
  REVIEWS_UNDER_20: 25,
  REVIEWS_ZERO: 35,
  RATING_UNDER_43: 15,
  NO_HTTPS: 20,
  NO_WHATSAPP: 15,
};

const PRIORIDAD_ALTA = 55;
const PRIORIDAD_MEDIA = 35;

const POOR_DOMAIN_PATTERNS = [
  'bento.me',
  'linktr.ee',
  'instagram.com',
  'facebook.com',
  'fb.com',
  'fb.me',
];

function isPoorDomain(website) {
  if (!website || typeof website !== 'string') return false;
  const lower = website.toLowerCase().trim();
  return POOR_DOMAIN_PATTERNS.some((pattern) => lower.includes(pattern));
}

/**
 * Calcula score y motivos para un lead.
 * @param {Object} place - Lugar con website, reviews_count, rating, websiteAnalysis
 * @returns {{ score: number, reasons: string[] }}
 */
export function calculateScoreAndReasons(place) {
  const reasons = [];
  let score = 0;

  if (!place || typeof place !== 'object') {
    return { score: 0, reasons: [] };
  }

  const hasWebsite = place.website && String(place.website).trim();
  const web = place.websiteAnalysis || {};
  const reviews = place.reviews_count != null ? Number(place.reviews_count) : (place.reviews != null ? Number(place.reviews) : null);
  const rating = place.rating != null ? Number(place.rating) : null;

  if (!hasWebsite) {
    score += POINTS.NO_WEBSITE;
    reasons.push('Sin website');
  } else {
    if (isPoorDomain(place.website)) {
      score += POINTS.DOMAIN_POOR;
      reasons.push('Dominio pobre (bento/linktr.ee/red social)');
    }
    if (web.hasHttps === false) {
      score += POINTS.NO_HTTPS;
      reasons.push('Sin HTTPS');
    }
    if (!web.hasWhatsAppButton) {
      score += POINTS.NO_WHATSAPP;
      reasons.push('Sin botón WhatsApp');
    }
  }

  if (reviews !== null && Number.isFinite(reviews)) {
    if (reviews === 0) {
      score += POINTS.REVIEWS_ZERO;
      reasons.push('Sin reseñas');
    } else if (reviews < 20) {
      score += POINTS.REVIEWS_UNDER_20;
      reasons.push('Menos de 20 reseñas');
    }
  } else {
    score += POINTS.REVIEWS_ZERO;
    reasons.push('Sin reseñas');
  }

  if (rating !== null && Number.isFinite(rating) && rating < 4.3) {
    score += POINTS.RATING_UNDER_43;
    reasons.push('Rating bajo (< 4.3)');
  }

  return { score, reasons };
}

/**
 * Calcula solo el score (compatibilidad).
 * @param {Object} place
 * @returns {number}
 */
export function calculateScore(place) {
  const { score } = calculateScoreAndReasons(place);
  return score;
}

/**
 * Asigna prioridad según score.
 * ALTA >= 55, MEDIA >= 35, BAJA < 35
 * @param {number} score
 * @returns {'ALTA'|'MEDIA'|'BAJA'}
 */
export function getPrioridad(score) {
  const s = Number(score);
  if (s >= PRIORIDAD_ALTA) return 'ALTA';
  if (s >= PRIORIDAD_MEDIA) return 'MEDIA';
  return 'BAJA';
}

/**
 * Añade score, prioridad y reasons al lugar (mutando).
 * @param {Object} place
 * @returns {Object}
 */
export function scorePlace(place) {
  if (!place || typeof place !== 'object') return place;
  const { score, reasons } = calculateScoreAndReasons(place);
  place.score = score;
  place.prioridad = getPrioridad(score);
  place.reasons = reasons;
  return place;
}

/**
 * Añade score, prioridad y reasons a una lista.
 * @param {Array<Object>} places
 * @returns {Array<Object>}
 */
export function scorePlaces(places) {
  if (!Array.isArray(places)) return [];
  places.forEach(scorePlace);
  return places;
}
