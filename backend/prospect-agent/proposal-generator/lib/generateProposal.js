/**
 * Main proposal generation flow:
 * 1. Extract colors from client logo
 * 2. Load correct template by business type
 * 3. Inject variables (including image data URLs)
 * 4. Generate PDF and save to /output
 */

import path from 'path';
import { readFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { extractColors } from './extractColors.js';
import { generatePDF } from './generatePDF.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SUBTITLES = {
  restaurante: 'Menú QR · Automatización · Administración',
  taller: 'Órdenes de trabajo · Inventario · Técnicos · Reportes',
  'servicio-tecnico': 'Órdenes de trabajo · Clientes · Seguimiento',
  generic: 'Solución digital a medida',
};

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

/**
 * Resolve asset path to absolute and read as data URL (base64).
 * @param {string} assetPath - Relative or absolute path to image
 * @returns {Promise<string>} data URL or empty string on error
 */
async function imageToDataUrl(assetPath) {
  if (!assetPath || typeof assetPath !== 'string') return '';
  const resolved = path.isAbsolute(assetPath) ? assetPath : path.resolve(ROOT, assetPath);
  try {
    const buf = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const mime = MIME[ext] || 'image/png';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return '';
  }
}

/**
 * Build variables map and resolve image paths to data URLs.
 * @param {object} options - generateProposal options
 * @param {string} colorPrimary
 * @param {string} colorSecondary
 * @returns {Promise<Record<string, string>>}
 */
async function buildVariables(options, colorPrimary, colorSecondary) {
  const {
    cliente,
    logoCliente,
    logoTu,
    mockups = [],
    planes = {},
    subtitle: customSubtitle,
    tipoNegocio = 'generic',
  } = options;

  const tipo = tipoNegocio === 'restaurante' ? 'restaurante' : tipoNegocio === 'taller' ? 'taller' : tipoNegocio === 'servicio-tecnico' ? 'servicio-tecnico' : 'generic';
  const subtitle = customSubtitle ?? SUBTITLES[tipo];

  const [logoClienteData, logoTuData, mockup1, mockup2, mockup3] = await Promise.all([
    imageToDataUrl(logoCliente),
    imageToDataUrl(logoTu),
    imageToDataUrl(mockups[0]),
    imageToDataUrl(mockups[1]),
    imageToDataUrl(mockups[2]),
  ]);

  return {
    cliente: String(cliente ?? 'Cliente'),
    logoCliente: logoClienteData || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="180" height="56"%3E%3Crect fill="%23ddd" width="180" height="56" rx="4"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="14"%3ELogo%3C/text%3E%3C/svg%3E',
    logoTu: logoTuData || logoClienteData || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="140" height="48"%3E%3Crect fill="%23eee" width="140" height="48" rx="4"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="12"%3ETu logo%3C/text%3E%3C/svg%3E',
    mockup1: mockup1 || mockup2 || mockup3 || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="200"%3E%3Crect fill="%23f0f0f0" width="320" height="200" rx="8"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3EMockup%3C/text%3E%3C/svg%3E',
    mockup2: mockup2 || mockup1 || mockup3 || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="280" height="180"%3E%3Crect fill="%23f0f0f0" width="280" height="180" rx="8"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3EMockup 2%3C/text%3E%3C/svg%3E',
    mockup3: mockup3 || mockup1 || mockup2 || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="240" height="160"%3E%3Crect fill="%23f0f0f0" width="240" height="160" rx="8"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3EMockup 3%3C/text%3E%3C/svg%3E',
    colorPrimary: colorPrimary,
    colorSecondary: colorSecondary,
    subtitle,
    precioBasico: String(planes.basico ?? '150.000'),
    precioProfesional: String(planes.profesional ?? '200.000'),
    precioEnterprise: String(planes.enterprise ?? '270.000'),
  };
}

/**
 * Load template HTML and inline base.css.
 */
async function loadTemplate(tipoNegocio) {
  const tipo = tipoNegocio === 'restaurante' ? 'restaurante' : tipoNegocio === 'taller' ? 'taller' : tipoNegocio === 'servicio-tecnico' ? 'servicio-tecnico' : 'generic';
  const templatePath = path.join(ROOT, 'templates', tipo, 'template.html');
  const cssPath = path.join(ROOT, 'templates', 'base.css');
  const [template, css] = await Promise.all([
    readFile(templatePath, 'utf-8'),
    readFile(cssPath, 'utf-8'),
  ]);
  const withCss = template.replace(
    /<link\s+rel="stylesheet"\s+href="[^"]*base\.css"\s*\/?>/i,
    `<style>${css}</style>`
  );
  return withCss;
}

/**
 * Replace all {{key}} in html with values from variables.
 */
function injectVariables(html, variables) {
  let out = html;
  for (const [key, value] of Object.entries(variables)) {
    const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    out = out.replace(re, value);
  }
  return out;
}

/**
 * Generate proposal PDF.
 * @param {object} options
 * @param {string} options.cliente - Client name
 * @param {string} options.logoCliente - Path to client logo image
 * @param {string} options.logoTu - Path to your logo image
 * @param {string[]} [options.mockups] - Paths to mockup images
 * @param {string} [options.tipoNegocio] - 'restaurante' | 'taller' | 'servicio-tecnico' | 'generic'
 * @param {object} [options.planes] - { basico, profesional, enterprise } prices (e.g. "150.000 CLP")
 * @param {string} [options.subtitle] - Custom subtitle (overrides tipoNegocio default)
 * @param {string} [options.outputPath] - Custom output path; default: /output/propuesta-{cliente}.pdf
 * @returns {Promise<string>} Path to generated PDF
 */
export async function generateProposal(options) {
  const {
    cliente,
    logoCliente,
    tipoNegocio = 'generic',
    outputPath: customOutputPath,
  } = options;

  const logoPath = path.isAbsolute(logoCliente) ? logoCliente : path.resolve(ROOT, logoCliente);
  let colorPrimary = '#c41e3a';
  let colorSecondary = '#2d2d2d';
  try {
    const colors = await extractColors(logoPath);
    colorPrimary = colors.primary;
    colorSecondary = colors.secondary;
  } catch {
    // use defaults if logo missing or extraction fails
  }

  const variables = await buildVariables(options, colorPrimary, colorSecondary);
  let html = await loadTemplate(tipoNegocio);
  html = injectVariables(html, variables);

  const safeName = String(cliente ?? 'Cliente').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  const outputDir = path.join(ROOT, 'output');
  await mkdir(outputDir, { recursive: true });
  const outputPath = customOutputPath ?? path.join(outputDir, `propuesta-${safeName}.pdf`);

  await generatePDF(html, outputPath);
  return outputPath;
}
