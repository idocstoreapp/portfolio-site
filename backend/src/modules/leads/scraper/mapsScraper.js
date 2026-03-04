/**
 * Google Maps scraper: scroll profundo en feed, .Nv2PK, extracción robusta.
 * - Scroll en role="feed" hasta 40+ resultados o sin más carga
 * - Filtra tarjetas con nombre "Resultados"
 * - Website sin parámetros (fbclid, utm_*, etc.)
 * - rating (float), reviews_count (entero, 0 si no existe)
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const MAPS_SEARCH_BASE = 'https://www.google.com/maps/search/';
const MIN_RESULTS_TARGET = 40;
const MIN_REAL_BUSINESSES = 30;
const SCROLL_PAUSE_MS = 1500;
const MAX_SCROLL_ATTEMPTS = 25;
const PANEL_WAIT_MS = 2000;
const PANEL_NAME_SELECTOR = 'h1.DUwDvf';
const FEED_SELECTOR = '[role="feed"]';
const CARD_SELECTORS = ['.Nv2PK', '[role="feed"] a[href*="/place/"]', '.m6QErb a[href*="/place/"]'];
const CARD_SELECTOR = '.Nv2PK';
const FAKE_NAME_FILTER = /^resultados$/i;

/**
 * Limpia URL de website: mantiene origin + pathname, elimina solo parámetros de tracking.
 * @param {string} url
 * @returns {string}
 */
export function cleanWebsiteUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const u = url.trim();
    if (!u.startsWith('http')) return u;
    const parsed = new URL(u);
    const blacklist = ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'ref'];
    blacklist.forEach((k) => parsed.searchParams.delete(k));
    [...parsed.searchParams.keys()].forEach((k) => {
      if (/^utm_/i.test(k) || k.toLowerCase() === 'fbclid') parsed.searchParams.delete(k);
    });
    return parsed.origin + parsed.pathname + (parsed.search ? parsed.search : '');
  } catch {
    return url;
  }
}

/**
 * Cierra banner de cookies si aparece.
 */
async function dismissConsentBanner(page) {
  try {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate((e) => (e.textContent || '').trim().toLowerCase());
      if (text.includes('accept') || text.includes('aceptar') || text.includes('agree') || text.includes('estoy de acuerdo') || text === 'all' || text === 'todos') {
        await btn.click();
        await new Promise((r) => setTimeout(r, 800));
        return true;
      }
    }
  } catch (_) {}
  return false;
}

/**
 * Detecta qué selector de tarjetas tiene resultados (prueba .Nv2PK y fallbacks).
 */
async function detectCardSelector(page) {
  for (const sel of CARD_SELECTORS) {
    const count = await page.evaluate((s) => {
      const els = document.querySelectorAll(s);
      let n = 0;
      els.forEach((e) => {
        const rect = e.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) n++;
      });
      return n;
    }, sel);
    if (count > 0) return sel;
  }
  return null;
}

/**
 * Scroll dentro del feed hasta cargar mínimo target resultados o hasta que no carguen más.
 * @param {string} cardSelector - Selector de tarjeta a usar
 */
async function scrollFeedUntilLoaded(page, targetCount, cardSelector) {
  const feed = await page.$(FEED_SELECTOR);
  if (!feed) return 0;

  let lastCount = 0;
  let noChangeCount = 0;

  for (let attempt = 0; attempt < MAX_SCROLL_ATTEMPTS; attempt++) {
    const count = await page.evaluate((cardSel) => {
      const cards = document.querySelectorAll(cardSel);
      let n = 0;
      cards.forEach((c) => {
        const rect = c.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) n++;
      });
      return n;
    }, cardSelector);

    if (count >= targetCount) return count;
    if (count === lastCount) {
      noChangeCount++;
      if (noChangeCount >= 3) return count;
    } else {
      noChangeCount = 0;
    }
    lastCount = count;

    await page.evaluate((sel) => {
      const feedEl = document.querySelector(sel);
      if (feedEl) feedEl.scrollTop = feedEl.scrollHeight;
    }, FEED_SELECTOR);
    await new Promise((r) => setTimeout(r, SCROLL_PAUSE_MS));
  }

  return lastCount;
}

/**
 * Obtiene índices de tarjetas válidas (excluye nombre "Resultados" cuando se puede detectar).
 * @param {string} cardSelector
 */
async function getCardIndices(page, cardSelector) {
  const indices = await page.evaluate((cardSel, fakeNamePattern) => {
    const cards = document.querySelectorAll(cardSel);
    const re = new RegExp(fakeNamePattern, 'i');
    const out = [];
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nameEl = card.querySelector('[class*="fontHeadline"], .qBF1Pd') || card;
      const name = (nameEl.textContent || '').trim().split('\n')[0].trim().slice(0, 150);
      if (!name) { out.push(index); return; }
      if (!re.test(name)) out.push(index);
    });
    return out;
  }, cardSelector, FAKE_NAME_FILTER.source);
  if (indices.length > 0) return indices;
  return page.evaluate((cardSel) => {
    const cards = document.querySelectorAll(cardSel);
    const out = [];
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) out.push(index);
    });
    return out;
  }, cardSelector);
}

/**
 * Hace click en la tarjeta por índice.
 * @param {string} cardSelector
 */
async function clickCardByIndex(page, cardIndex, cardSelector) {
  return page.evaluate((cardSel, index) => {
    const cards = document.querySelectorAll(cardSel);
    const card = cards[index];
    if (!card) return false;
    const link = card.querySelector && card.querySelector('a[href*="/place/"]') ? card.querySelector('a[href*="/place/"]') : (card.href ? card : null);
    const target = link || card;
    target.scrollIntoView({ block: 'center', behavior: 'instant' });
    target.click();
    return true;
  }, cardSelector, cardIndex);
}

/**
 * Extrae el website del panel usando SOLO button[data-item-id="authority"].
 * Devuelve { url, reason } para saber si es null porque no tiene web o porque falló el selector.
 * reason: 'found' | 'no_button' | 'button_empty'
 */
async function extractWebsite(page) {
  try {
    await page.waitForSelector('button[data-item-id="authority"]', {
      timeout: 3000,
    });

    const result = await page.evaluate(() => {
      const btn = document.querySelector('button[data-item-id="authority"]');
      if (!btn) return { url: null, reason: 'button_empty' };

      const link = btn.querySelector('a');
      if (link && link.href) return { url: link.href, reason: 'found' };

      const dataUrl = btn.getAttribute('data-url');
      if (dataUrl) return { url: dataUrl, reason: 'found' };

      return { url: null, reason: 'button_empty' };
    });

    return result;
  } catch {
    return { url: null, reason: 'no_button' };
  }
}

/**
 * Extrae todos los datos del panel del negocio (solo después de que el panel haya cambiado).
 * Nombre desde h1.DUwDvf. Website desde extractWebsite(page) → button[data-item-id="authority"].
 */
async function extractPanelData(page) {
  const { url: websiteUrl, reason: websiteReason } = await extractWebsite(page);

  const raw = await page.evaluate((websiteFromPanel) => {
    const getText = (sel) => {
      const el = document.querySelector(sel);
      return el ? (el.textContent || '').trim() : '';
    };

    const h1El = document.querySelector('h1.DUwDvf');
    const nombre = (h1El && (h1El.innerText || h1El.textContent || '').trim()) || '';

    let direccion = '';
    document.querySelectorAll('button[data-item-id="address"], [data-item-id="address"]').forEach((el) => { if (!direccion) direccion = (el.textContent || '').trim(); });
    if (!direccion) {
      const aria = document.querySelector('[aria-label*="dirección"], [aria-label*="Address"]');
      if (aria) direccion = (aria.getAttribute('aria-label') || '').replace(/^(Dirección|Address):\s*/i, '').trim();
    }
    if (!direccion) direccion = getText('button[data-tooltip="Copiar dirección"]');

    let telefono = '';
    document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
      if (!telefono) {
        const m = (a.getAttribute('href') || '').match(/^tel:(.+)$/);
        if (m) telefono = m[1].trim();
      }
    });
    if (!telefono) {
      const phoneEl = document.querySelector('[data-item-id="phone"]');
      if (phoneEl) telefono = (phoneEl.textContent || '').trim();
    }

    let rating = null;
    let reviews = null;
    const ratingAria = document.querySelector('[aria-label*="estrellas"], [aria-label*="stars"]');
    if (ratingAria) {
      const label = (ratingAria.getAttribute('aria-label') || '').replace(/,/g, '.');
      const rMatch = label.match(/(\d+[.,]\d+)/);
      if (rMatch) rating = parseFloat(rMatch[1].replace(',', '.'));
      const revMatch = label.match(/(\d[\d.]*)\s*(?:reseñas|reviews)/i) || label.match(/·\s*(\d[\d.]*)/);
      if (revMatch) reviews = parseInt(String(revMatch[1]).replace(/\./g, ''), 10);
    }
    if (rating == null) {
      const rt = getText('[class*="fontDisplay"], [class*="rating"]');
      const r = parseFloat(rt.replace(',', '.').replace(/[^\d.]/g, ''));
      if (!Number.isNaN(r)) rating = r;
    }
    if (reviews == null) {
      const revEl = document.querySelector('[class*="review"], [class*="Review"]');
      if (revEl) {
        const revStr = (revEl.textContent || '').replace(/\s/g, '').replace(/[^\d]/g, '');
        if (revStr) reviews = parseInt(revStr, 10);
      }
    }
    if (reviews == null) {
      const allText = document.body ? (document.body.innerText || '').slice(0, 3000) : '';
      const reseñasMatch = allText.match(/(\d[\d.]*)\s*reseñas/i) || allText.match(/(\d[\d.]*)\s*reviews/i);
      if (reseñasMatch) reviews = parseInt(String(reseñasMatch[1]).replace(/\./g, ''), 10);
    }

    let lat = null;
    let lng = null;
    const placeLink = document.querySelector('a[href*="/place/"]');
    if (placeLink) {
      const m = (placeLink.getAttribute('href') || '').match(/@(-?\d+[.,]\d+),(-?\d+[.,]\d+)/);
      if (m) {
        lat = parseFloat(m[1].replace(',', '.'));
        lng = parseFloat(m[2].replace(',', '.'));
      }
    }

    const categoria = getText('button[class*="DkEaL"]') || getText('[data-item-id="category"]');
    let estadoText = '';
    const openEl = document.querySelector('[aria-label*="Abierto"], [aria-label*="Cerrado"], [class*="open"]');
    if (openEl) estadoText = (openEl.textContent || openEl.getAttribute('aria-label') || '').trim();

    return {
      nombre,
      direccion,
      telefono: telefono || null,
      website: websiteFromPanel || null,
      rating: Number.isFinite(rating) ? rating : null,
      reviews: Number.isFinite(reviews) ? reviews : null,
      categoria: categoria || null,
      lat,
      lng,
      estadoText,
    };
  }, websiteUrl);

  raw.website = raw.website ? cleanWebsiteUrl(raw.website) : null;
  raw.website_reason = websiteReason;
  raw.reviews_count = typeof raw.reviews === 'number' && Number.isInteger(raw.reviews) ? raw.reviews : 0;
  if (raw.rating != null && typeof raw.rating !== 'number') raw.rating = parseFloat(raw.rating);
  return raw;
}

function isInvalidName(nombre) {
  const n = (nombre || '').trim();
  return !n || /^resultados$/i.test(n);
}

/**
 * Enriquece con geo por defecto (Santiago, Chile).
 */
function enrichWithGeo(raw) {
  const d = { ...raw };
  d.ciudad = d.ciudad || 'Santiago';
  d.region = d.region || 'Metropolitana';
  d.pais = d.pais || 'Chile';
  if (d.direccion && !d.comuna) {
    if (d.direccion.includes('Santiago')) d.comuna = 'Santiago';
    else if (d.direccion.includes('Providencia')) d.comuna = 'Providencia';
    else if (d.direccion.includes('Las Condes')) d.comuna = 'Las Condes';
    else d.comuna = d.ciudad;
  } else d.comuna = d.comuna || d.ciudad;
  return d;
}

/**
 * Scraper principal.
 * @param {string} fullQuery - Búsqueda completa (ej: "servicio técnico celulares Santiago Chile")
 * @param {Object} options - { minResults?: number, externalBrowser?: Browser }
 * @returns {Promise<{ results: Array<Object>, page?: import('puppeteer').Page }>}
 */
export async function scrapeMaps(fullQuery, options = {}) {
  const minResults = options.minResults ?? MIN_RESULTS_TARGET;
  const externalBrowser = options.externalBrowser || null;
  const ownBrowser = !externalBrowser;

  const browser = externalBrowser || await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const results = [];
  let page;

  try {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    const searchUrl = `${MAPS_SEARCH_BASE}${encodeURIComponent(fullQuery)}`;
    await page.goto(searchUrl, { waitUntil: 'load', timeout: 40000 });
    await new Promise((r) => setTimeout(r, 4000));
    await dismissConsentBanner(page);
    await new Promise((r) => setTimeout(r, 1500));

    let feedFound = await page.$(FEED_SELECTOR);
    if (!feedFound) {
      await page.evaluate(() => window.scrollTo(0, 300));
      await new Promise((r) => setTimeout(r, 2000));
    }
    await page.waitForSelector(FEED_SELECTOR, { timeout: 20000, visible: true }).catch(() => null);
    await new Promise((r) => setTimeout(r, 2500));

    let cardSelector = await detectCardSelector(page);
    if (!cardSelector) {
      await page.evaluate((sel) => {
        const feed = document.querySelector(sel);
        if (feed) feed.scrollTop = feed.scrollHeight;
      }, FEED_SELECTOR);
      await new Promise((r) => setTimeout(r, 2000));
      cardSelector = await detectCardSelector(page) || CARD_SELECTORS[1];
    }

    const totalCards = await scrollFeedUntilLoaded(page, minResults, cardSelector);
    const indicesToFetch = await getCardIndices(page, cardSelector);
    const toFetch = Math.min(indicesToFetch.length, 55);

    let previousPanelName = '';

    for (let i = 0; i < toFetch; i++) {
      const cardIndex = indicesToFetch[i];
      try {
        previousPanelName = await page.$eval(PANEL_NAME_SELECTOR, (el) => (el.innerText || el.textContent || '').trim()).catch(() => null) || '';

        const clicked = await clickCardByIndex(page, cardIndex, cardSelector);
        if (!clicked) continue;
        await new Promise((r) => setTimeout(r, 400));

        await page.waitForFunction(
          (prev) => {
            const el = document.querySelector('h1.DUwDvf');
            const current = el ? (el.innerText || el.textContent || '').trim() : '';
            return current !== '' && current !== prev;
          },
          { timeout: 10000 },
          previousPanelName
        ).catch(() => null);

        await new Promise((r) => setTimeout(r, 800));

        const raw = await extractPanelData(page);
        if (isInvalidName(raw.nombre)) continue;
        const enriched = enrichWithGeo(raw);
        enriched.nombre = (enriched.nombre || '').trim() || null;
        if (!enriched.nombre) continue;
        results.push(enriched);

        previousPanelName = enriched.nombre;
      } catch (_) {
        // Siguiente negocio
      }
    }
  } finally {
    if (ownBrowser) await browser.close();
  }

  if (externalBrowser) return { results, page };
  return { results };
}
