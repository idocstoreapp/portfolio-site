/**
 * Scraper de Google Maps con Puppeteer + Stealth.
 * Abre Maps, busca "query Santiago Chile", extrae datos del panel lateral.
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const MAPS_URL = 'https://www.google.com/maps';
const RESULTS_WAIT_MS = 4000;
const PANEL_WAIT_MS = 2500;
const DEFAULT_RESULTS_LIMIT = 20;

const SEARCH_INPUT_SELECTORS = [
  'input#searchboxinput',
  'input[aria-label*="Search" i]',
  'input[aria-label*="Buscar" i]',
  'input[placeholder*="Search" i]',
  'input[placeholder*="Buscar" i]',
  'input[placeholder*="Google" i]',
  'div[role="search"] input',
  'form[role="search"] input[type="text"]',
  '#searchbox input',
  '.searchbox input',
];

const SEARCH_BUTTON_SELECTORS = [
  'button#searchbox-searchbutton',
  'button[aria-label*="Search" i]',
  'button[aria-label*="Buscar" i]',
  'button[type="submit"]',
  'div[role="search"] button',
];

/**
 * Espera un selector con timeout opcional.
 */
async function waitSelector(page, selector, timeoutMs = 15000) {
  try {
    await page.waitForSelector(selector, { timeout: timeoutMs, visible: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Espera el primer selector que exista de una lista.
 */
async function waitAnySelector(page, selectors, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  for (const sel of selectors) {
    if (Date.now() > deadline) break;
    try {
      await page.waitForSelector(sel, { timeout: 5000, visible: true });
      return sel;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Cierra banner de cookies/consentimiento si aparece (para no bloquear el search box).
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
 * Obtiene los elementos clickeables de la lista de resultados (varios selectores de respaldo).
 * @param {import('puppeteer').Page} page
 * @returns {Promise<number>} Cantidad de resultados encontrados
 */
async function getResultCount(page) {
  const selectors = [
    'a[href*="/maps/place/"]',
    '[role="feed"] > div > div > a[href*="/place/"]',
    '.Nv2PK', // tarjeta de resultado
    '.m6QErb div[role="feed"] a',
  ];
  for (const sel of selectors) {
    try {
      const els = await page.$$(sel);
      const visible = [];
      for (const el of els) {
        const isVisible = await el.evaluate((e) => {
          const rect = e.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        if (isVisible) visible.push(el);
      }
      if (visible.length > 0) return Math.min(visible.length, 50);
    } catch (_) {}
  }
  return 0;
}

/**
 * Hace click en el i-ésimo resultado de la lista (por selector flexible).
 * @param {import('puppeteer').Page} page
 * @param {number} index 0-based
 */
async function clickResultByIndex(page, index) {
  const selectors = [
    `a[href*="/maps/place/"]:nth-of-type(${index + 1})`,
    `[role="feed"] a[href*="/place/"]`,
    '.Nv2PK a[href*="/place/"]',
  ];
  for (const base of selectors) {
    try {
      const els = await page.$$('a[href*="/maps/place/"], a[href*="/place/"]');
      const inFeed = await page.$$('[role="feed"] a[href*="/place/"], [role="feed"] a[href*="/maps/place/"]');
      const list = inFeed.length >= index + 1 ? inFeed : els;
      if (list[index]) {
        await list[index].evaluate((e) => e.scrollIntoView({ block: 'center' }));
        await new Promise((r) => setTimeout(r, 400));
        await list[index].click();
        return true;
      }
    } catch (_) {}
  }
  return false;
}

/**
 * Extrae datos del panel lateral del lugar (evaluate en el contexto del navegador).
 * Múltiples estrategias para resistir cambios de DOM.
 */
async function extractPanelData(page) {
  return page.evaluate(() => {
    const getText = (sel) => {
      const el = document.querySelector(sel);
      return el ? (el.textContent || '').trim() : '';
    };
    const getAllText = (sel) => {
      const nodes = document.querySelectorAll(sel);
      return Array.from(nodes).map((e) => (e.textContent || '').trim()).filter(Boolean);
    };
    const getHref = (sel) => {
      const el = document.querySelector(sel);
      return el && el.getAttribute('href') ? el.getAttribute('href').trim() : '';
    };

    // Nombre: h1 o encabezado del panel
    let nombre = getText('h1') || getText('[class*="fontHeadline"]') || getText('div[role="main"] h1');
    if (!nombre) {
      const titles = document.querySelectorAll('[class*="title"], [class*="Title"]');
      for (const t of titles) {
        const text = (t.textContent || '').trim();
        if (text.length > 2 && text.length < 200) {
          nombre = text;
          break;
        }
      }
    }

    // Dirección
    let direccion = '';
    const addrButtons = document.querySelectorAll('button[data-item-id="address"], [data-item-id="address"]');
    if (addrButtons.length) direccion = (addrButtons[0].textContent || '').trim();
    if (!direccion) {
      const ariaAddr = document.querySelector('[aria-label*="dirección"], [aria-label*="Address"]');
      if (ariaAddr) direccion = (ariaAddr.getAttribute('aria-label') || '').replace(/^(Dirección|Address):\s*/i, '').trim();
    }
    if (!direccion) direccion = getText('button[data-tooltip="Copiar dirección"]') || getText('[class*="address"]');

    // Teléfono
    let telefono = '';
    const telLinks = document.querySelectorAll('a[href^="tel:"], a[data-item-id="phone"], [data-item-id="phone"] a');
    for (const a of telLinks) {
      const href = a.getAttribute('href') || '';
      const match = href.match(/^tel:(.+)$/);
      if (match) {
        telefono = match[1].trim();
        break;
      }
      const text = (a.textContent || '').trim();
      if (text && /\d[\d\s\-]{6,}/.test(text)) {
        telefono = text;
        break;
      }
    }
    if (!telefono) {
      const phoneSpan = document.querySelector('[data-item-id="phone"]');
      if (phoneSpan) telefono = (phoneSpan.textContent || '').trim();
    }

    // Website
    let website = '';
    const webLinks = document.querySelectorAll('a[data-item-id="authority"], a[href^="http"]');
    for (const a of webLinks) {
      const href = (a.getAttribute('href') || '').trim();
      const text = (a.textContent || '').trim();
      if (href.startsWith('http') && !href.includes('google.com') && !href.includes('gstatic')) {
        website = href;
        break;
      }
    }

    // Rating y reseñas
    let rating = null;
    let reviews = null;
    const ratingAria = document.querySelector('[aria-label*="estrellas"], [aria-label*="stars"]');
    if (ratingAria) {
      const label = (ratingAria.getAttribute('aria-label') || '').replace(',', '.');
      const rMatch = label.match(/(\d+[.,]\d+)/);
      if (rMatch) rating = parseFloat(rMatch[1].replace(',', '.'));
      const revMatch = label.match(/(\d[\d.]*)\s*(reseñas|reviews)?/i);
      if (revMatch) reviews = parseInt(revMatch[1].replace(/\./g, ''), 10);
    }
    const ratingText = getText('[class*="fontDisplay"], [class*="rating"]');
    if (rating == null && ratingText) {
      const r = parseFloat(ratingText.replace(',', '.').replace(/[^\d.]/g, ''));
      if (!Number.isNaN(r)) rating = r;
    }
    const revEl = document.querySelector('[class*="review"], [class*="Review"]');
    if (reviews == null && revEl) {
      const revStr = (revEl.textContent || '').replace(/\s/g, '').replace(/[^\d]/g, '');
      if (revStr) reviews = parseInt(revStr, 10);
    }

    // Categoría
    let categoria = getText('button[class*="DkEaL"]') || getText('[class*="category"]') || getText('[data-item-id="category"]');
    if (!categoria) {
      const catButtons = document.querySelectorAll('button[class*="DkEaL"]');
      if (catButtons.length) categoria = (catButtons[0].textContent || '').trim();
    }

    // Estado (Abierto/Cerrado)
    let estadoText = '';
    const openEl = document.querySelector('[class*="open"], [class*="Open"], [aria-label*="Abierto"], [aria-label*="Cerrado"]');
    if (openEl) estadoText = (openEl.textContent || openEl.getAttribute('aria-label') || '').trim();
    if (!estadoText) estadoText = getText('span[class*="open"]') || getText('[data-hide-tooltip-on-mouse-move]');

    // Coordenadas desde enlace "Compartir" o URL
    let lat = null;
    let lng = null;
    const placeLink = document.querySelector('a[href*="/place/"]');
    if (placeLink) {
      const href = placeLink.getAttribute('href') || '';
      const coordMatch = href.match(/@(-?\d+[.,]\d+),(-?\d+[.,]\d+)/);
      if (coordMatch) {
        lat = parseFloat(coordMatch[1].replace(',', '.'));
        lng = parseFloat(coordMatch[2].replace(',', '.'));
      }
    }
    if (lat == null && window.location && window.location.href) {
      const m = window.location.href.match(/@(-?\d+[.,]\d+),(-?\d+[.,]\d+)/);
      if (m) {
        lat = parseFloat(m[1].replace(',', '.'));
        lng = parseFloat(m[2].replace(',', '.'));
      }
    }

    // Snippets de reseñas para análisis de palabras negativas (primeros visibles)
    const reviewSnippets = [];
    const reviewNodes = document.querySelectorAll('[class*="review"] span, [class*="Review"] span, [data-review-id]');
    for (const node of reviewNodes) {
      const t = (node.textContent || '').trim();
      if (t.length > 15 && t.length < 500) reviewSnippets.push(t);
    }
    const uniqueSnippets = [...new Set(reviewSnippets)].slice(0, 15);

    return {
      nombre: nombre || 'Sin nombre',
      direccion,
      telefono: telefono || null,
      website: website || null,
      rating: Number.isFinite(rating) ? rating : null,
      reviews: Number.isFinite(reviews) ? reviews : null,
      categoria,
      lat,
      lng,
      estadoText,
      reviewSnippets: uniqueSnippets,
    };
  });
}

/**
 * Añade comuna/ciudad/región/país por defecto desde la dirección o contexto Chile.
 */
function enrichWithGeo(raw) {
  const d = { ...raw };
  if (!d.ciudad) d.ciudad = 'Santiago';
  if (!d.region) d.region = 'Metropolitana';
  if (!d.pais) d.pais = 'Chile';
  if (d.direccion && !d.comuna) {
    if (d.direccion.includes('Santiago')) d.comuna = 'Santiago';
    else if (d.direccion.includes('Providencia')) d.comuna = 'Providencia';
    else if (d.direccion.includes('Las Condes')) d.comuna = 'Las Condes';
    else d.comuna = d.ciudad;
  } else if (!d.comuna) d.comuna = d.ciudad;
  return d;
}

/**
 * Scraper principal: busca en Google Maps y devuelve lista de lugares crudos.
 * Si se pasa browser, no se cierra y se devuelve { results, page } para reutilizar.
 * @param {string} fullQuery - Consulta completa (ej: "Plaza de Armas Santiago Chile")
 * @param {number} limit - Máximo de resultados a extraer
 * @param {import('puppeteer').Browser} [externalBrowser] - Browser opcional para reutilizar
 * @returns {Promise<Array<Object>> | Promise<{ results: Array<Object>, page: import('puppeteer').Page }>}
 */
export async function scrapeGoogleMaps(fullQuery, limit = DEFAULT_RESULTS_LIMIT, externalBrowser = null) {
  const ownBrowser = !externalBrowser;
  const browser = externalBrowser || (await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  }));

  const results = [];
  let page;

  try {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(MAPS_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 3000));
    await dismissConsentBanner(page);
    await new Promise((r) => setTimeout(r, 1000));

    let searchInputSelector = await waitAnySelector(page, SEARCH_INPUT_SELECTORS, 15000);
    if (searchInputSelector) {
      await page.click(searchInputSelector);
      await new Promise((r) => setTimeout(r, 300));
      await page.keyboard.type(fullQuery, { delay: 80 });
      await new Promise((r) => setTimeout(r, 600));
      let searchClicked = false;
      for (const btnSel of SEARCH_BUTTON_SELECTORS) {
        const found = await waitSelector(page, btnSel, 1500);
        if (found) {
          await page.click(btnSel);
          searchClicked = true;
          break;
        }
      }
      if (!searchClicked) await page.keyboard.press('Enter');
    } else {
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(fullQuery)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }
    await new Promise((r) => setTimeout(r, RESULTS_WAIT_MS));

    const count = await getResultCount(page);
    const toFetch = Math.min(count, limit);

    for (let i = 0; i < toFetch; i++) {
      try {
        const clicked = await clickResultByIndex(page, i);
        if (!clicked) continue;
        await new Promise((r) => setTimeout(r, PANEL_WAIT_MS));

        const raw = await extractPanelData(page);
        const enriched = enrichWithGeo(raw);
        results.push(enriched);
      } catch (err) {
        // Siguiente resultado aunque falle uno
        continue;
      }
    }
  } finally {
    if (ownBrowser) await browser.close();
  }

  if (externalBrowser) return { results, page };
  return results;
}
