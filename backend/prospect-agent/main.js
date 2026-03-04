/**
 * Agente de prospección comercial.
 * Uso: node main.js "servicio técnico celulares" [comuna]
 * Por defecto: Santiago Chile
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { scrapeMaps } from './mapsScraper.js';
import { scrapeGoogleMaps } from './scraper.js';
import { parsePlaces } from './parser.js';
import { scorePlaces } from './scorer.js';
import { analyzeWebsite } from './websiteAnalyzer.js';
import { analyzeReputation } from './reputationAnalyzer.js';
import { buildSearchQuery, deduplicateByNameAndAddress, deduplicateByPhone } from './utils.js';

const FAKE_NAME = /^resultados$/i;
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

puppeteer.use(StealthPlugin());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HIGH_PRIORITY_LEADS_PATH = path.join(__dirname, 'high_priority_leads.json');
const TOP_N = 10;
const MIN_BUSINESSES = 30;

function getArgs() {
  const args = process.argv.slice(2).filter((a) => typeof a === 'string' && !a.startsWith('-'));
  const query = (args[0] || '').trim();
  const comuna = (args[1] || '').trim() || null;
  return { query, comuna };
}

function formatLeadForExport(place) {
  return {
    nombre: place.nombre,
    direccion: place.direccion,
    comuna: place.comuna,
    ciudad: place.ciudad,
    region: place.region,
    pais: place.pais,
    telefono: place.telefono,
    website: place.website,
    website_reason: place.website_reason ?? null,
    rating: place.rating,
    reviews_count: place.reviews_count ?? place.reviews ?? 0,
    categoria: place.categoria,
    coords: place.coords,
    estado: place.estado,
    websiteAnalysis: place.websiteAnalysis || null,
    reputation: place.reputation || null,
    score: place.score,
    prioridad: place.prioridad,
    reasons: place.reasons || [],
  };
}

async function run() {
  const { query, comuna } = getArgs();

  if (!query) {
    console.log('Uso: node main.js "consulta" [comuna]');
    console.log('Ejemplo: node main.js "servicio técnico celulares"');
    console.log('Por defecto: Santiago Chile');
    process.exitCode = 1;
    return;
  }

  const fullQuery = buildSearchQuery(query, comuna);
  console.log('Buscando en Google Maps:', fullQuery);
  console.log('');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    let rawList;
    let page;
    const mapsResult = await scrapeMaps(fullQuery, { minResults: 40, externalBrowser: browser });
    rawList = mapsResult.results || [];
    page = mapsResult.page || null;

    if (!rawList || rawList.length === 0) {
      const fallback = await scrapeGoogleMaps(fullQuery, 25, browser);
      rawList = Array.isArray(fallback) ? fallback : (fallback.results || []);
      page = Array.isArray(fallback) ? null : (fallback.page || null);
    }

    if (!rawList || rawList.length === 0) {
      console.log('No se encontraron resultados para esta búsqueda.');
      return;
    }

    let places = parsePlaces(rawList);
    places = places.filter((p) => !FAKE_NAME.test((p.nombre || '').trim()));
    places = deduplicateByPhone(places);
    places = deduplicateByNameAndAddress(places);

    for (const p of places) {
      p.reputation = analyzeReputation(p);
    }

    const defaultWebAnalysis = { hasHttps: false, isResponsive: false, hasWhatsAppButton: false, loadTimeMs: null, isSlow: false };
    if (page) {
      const withWeb = places.filter((p) => p.website && String(p.website).trim());
      const CONCURRENT = 3;
      const pages = [page];
      try {
        for (let i = 1; i < CONCURRENT; i++) pages.push(await page.browser().newPage());
      } catch (_) {}
      for (let i = 0; i < withWeb.length; i += CONCURRENT) {
        const batch = withWeb.slice(i, i + CONCURRENT);
        await Promise.all(
          batch.map(async (p, j) => {
            const pager = pages[j % pages.length];
            try {
              p.websiteAnalysis = await analyzeWebsite(p.website, pager);
            } catch (_) {
              p.websiteAnalysis = defaultWebAnalysis;
            }
          })
        );
      }
      for (let i = 1; i < pages.length; i++) try { await pages[i].close(); } catch (_) {}
      places.forEach((p) => {
        if (!p.websiteAnalysis) p.websiteAnalysis = p.website ? defaultWebAnalysis : null;
      });
    } else {
      places.forEach((p) => {
        p.websiteAnalysis = p.website ? defaultWebAnalysis : null;
      });
    }

    scorePlaces(places);

    const altaLeads = places
      .filter((p) => p.prioridad === 'ALTA' && !FAKE_NAME.test((p.nombre || '').trim()))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const highPriorityLeads = altaLeads.map(formatLeadForExport);

    const top10ByScore = [...places]
      .filter((p) => !FAKE_NAME.test((p.nombre || '').trim()))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, TOP_N);

    writeFileSync(HIGH_PRIORITY_LEADS_PATH, JSON.stringify(highPriorityLeads, null, 2), 'utf8');
    console.log('Guardado:', highPriorityLeads.length, 'leads ALTA en', HIGH_PRIORITY_LEADS_PATH);
    console.log('');

    console.log('TOP 10 (por score):\n');
    if (top10ByScore.length > 0) {
      top10ByScore.forEach((p, i) => {
        console.log(`${i + 1}. ${p.nombre}`);
        console.log(`   Score: ${p.score} | ${p.prioridad} | Rating: ${p.rating ?? '-'} | Reseñas: ${p.reviews_count ?? 0}`);
        console.log(`   ${p.direccion || '-'}`);
        if (p.website) console.log(`   Web: ${p.website}`);
        else if (p.website_reason) console.log(`   Web: null (${p.website_reason})`);
        if (p.reasons && p.reasons.length) console.log(`   Motivos: ${p.reasons.join(' · ')}`);
        console.log('');
      });
    } else {
      console.log('No hay resultados para mostrar.');
    }

    const nAlta = places.filter((p) => p.prioridad === 'ALTA').length;
    const nMedia = places.filter((p) => p.prioridad === 'MEDIA').length;
    const nBaja = places.filter((p) => p.prioridad === 'BAJA').length;
    console.log('Resumen: total', places.length, '| ALTA:', nAlta, '| MEDIA:', nMedia, '| BAJA:', nBaja);
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
