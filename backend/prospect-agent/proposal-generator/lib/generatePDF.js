/**
 * Generate A4 PDF from HTML string using Puppeteer.
 */

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {string} html - Full HTML document string (with inline or resolved CSS/images)
 * @param {string} outputPath - Absolute path for the output PDF file
 * @param {string} [baseUrl] - Optional base URL (file://) for resolving relative resources
 */
export async function generatePDF(html, outputPath, baseUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    const base = baseUrl || `file://${path.join(__dirname, '..', 'templates')}/`;
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await browser.close();
  }
}
