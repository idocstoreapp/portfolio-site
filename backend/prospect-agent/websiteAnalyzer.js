/**
 * Análisis de website del lead: velocidad, HTTPS, responsive, botón WhatsApp.
 * Pensado para usarse con la misma page de Puppeteer (reutilizar browser).
 */

const SLOW_LOAD_MS = 4000;
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Normaliza URL para navegación (añade protocolo si falta).
 * @param {string} url
 * @returns {string}
 */
function normalizeUrl(url) {
  const u = (url || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) return `https://${u}`;
  return u;
}

/**
 * Detecta viewport responsive en el HTML (meta viewport presente).
 * @param {string} html
 * @returns {boolean}
 */
function detectResponsive(html) {
  if (!html || typeof html !== 'string') return false;
  return /<meta[^>]+name=["']viewport["'][^>]*content=["'][^"']*width\s*=\s*device-width/i.test(html) ||
    /<meta[^>]+content=["'][^"']*width\s*=\s*device-width[^"']*["'][^>]*name=["']viewport["']/i.test(html);
}

/**
 * Detecta enlaces o botones de WhatsApp en el HTML.
 * @param {string} html
 * @returns {boolean}
 */
function detectWhatsApp(html) {
  if (!html || typeof html !== 'string') return false;
  const lower = html.toLowerCase();
  return lower.includes('wa.me') ||
    lower.includes('api.whatsapp.com') ||
    lower.includes('whatsapp.com/send') ||
    (lower.includes('whatsapp') && (lower.includes('href=') || lower.includes('click')));
}

/**
 * Analiza un website: velocidad, HTTPS, responsive, WhatsApp.
 * @param {string} url - URL del sitio
 * @param {import('puppeteer').Page} page - Página de Puppeteer (se navega y se reutiliza)
 * @returns {Promise<{ hasHttps: boolean, isResponsive: boolean, hasWhatsAppButton: boolean, loadTimeMs: number | null, isSlow: boolean }>}
 */
export async function analyzeWebsite(url, page) {
  const result = {
    hasHttps: false,
    isResponsive: false,
    hasWhatsAppButton: false,
    loadTimeMs: null,
    isSlow: false,
  };

  const normalized = normalizeUrl(url);
  if (!normalized) return result;

  result.hasHttps = normalized.toLowerCase().startsWith('https://');

  try {
    const start = Date.now();
    await page.goto(normalized, {
      waitUntil: 'domcontentloaded',
      timeout: REQUEST_TIMEOUT_MS,
    });
    result.loadTimeMs = Date.now() - start;
    result.isSlow = result.loadTimeMs > SLOW_LOAD_MS;

    const html = await page.content();
    result.isResponsive = detectResponsive(html);
    result.hasWhatsAppButton = detectWhatsApp(html);
  } catch (_) {
    result.loadTimeMs = null;
    result.isSlow = false;
  }

  return result;
}
