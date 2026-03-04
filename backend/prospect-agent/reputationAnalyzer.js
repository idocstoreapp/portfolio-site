/**
 * Análisis de reputación: rating bajo, pocas reseñas, palabras negativas en reseñas.
 */

const RATING_LOW_THRESHOLD = 4;
const REVIEWS_FEW_THRESHOLD = 10;

const NEGATIVE_WORDS = [
  'malo', 'mala', 'mal', 'pésimo', 'pésima', 'horrible', 'terrible', 'decepcionado', 'decepcionada',
  'no recomiendo', 'no volvería', 'no volveré', 'peor', 'lento', 'lenta', 'sucio', 'sucia',
  'desastre', 'estafa', 'fraude', 'pésimo servicio', 'mal servicio', 'horrible experiencia',
  'nunca más', 'evitar', 'cuidado', 'peligroso', 'asqueroso', 'asquerosa', 'desorden',
  'no atienden', 'no responden', 'mentira', 'mentiras', 'engañ', 'rob', 'carísimo',
  'caro y malo', 'no vale la pena', 'perdida de tiempo', 'fatal', 'pésima atención',
  'pésimo trato', 'mal trato', 'malísimo', 'malísima', 'pésim', 'horribl',
];

/**
 * Comprueba si hay palabras negativas en un texto (normalizado, sin acentos).
 * @param {string} text
 * @returns {boolean}
 */
function hasNegativeWords(text) {
  if (!text || typeof text !== 'string') return false;
  const normalized = text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
  return NEGATIVE_WORDS.some((word) => {
    const w = word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    return normalized.includes(w);
  });
}

/**
 * Analiza la reputación de un lugar.
 * @param {Object} place - Lugar con rating, reviews/reviews_count, review_snippets
 * @returns {{ lowRating: boolean, fewReviews: boolean, hasNegativeWords: boolean }}
 */
export function analyzeReputation(place) {
  if (!place || typeof place !== 'object') {
    return { lowRating: false, fewReviews: false, hasNegativeWords: false };
  }

  const rating = place.rating != null ? Number(place.rating) : null;
  const reviews = place.reviews_count != null ? Number(place.reviews_count) : (place.reviews != null ? Number(place.reviews) : null);

  const lowRating = rating != null && Number.isFinite(rating) && rating < RATING_LOW_THRESHOLD;
  const fewReviews = reviews != null && Number.isFinite(reviews) && reviews < REVIEWS_FEW_THRESHOLD;

  const snippets = place.review_snippets || [];
  const allText = Array.isArray(snippets) ? snippets.join(' ') : '';
  const negativeWordsFound = hasNegativeWords(allText);

  return { lowRating, fewReviews, hasNegativeWords: negativeWordsFound };
}
