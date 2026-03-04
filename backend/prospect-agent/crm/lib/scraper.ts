import { spawn } from 'child_process';
import path from 'path';

export type NormalizedLead = {
  nombre: string;
  telefono: string | null;
  website: string | null;
  direccion: string;
  ciudad: string;
  rubro: string;
  score: number;
};

/**
 * Ejecuta el scraper del proyecto raíz (runScrape.js) y devuelve leads normalizados.
 */
export async function scrapeRubro(
  rubro: string,
  ciudad: string,
  limite: number
): Promise<NormalizedLead[]> {
  const projectRoot = path.join(process.cwd(), '..');
  const scriptPath = path.join(projectRoot, 'runScrape.js');

  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath, rubro, ciudad, String(limite)], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Scraper exited with code ${code}`));
        return;
      }
      try {
        const data = JSON.parse(stdout.trim() || '[]');
        resolve(Array.isArray(data) ? data : []);
      } catch {
        reject(new Error('Invalid JSON from scraper: ' + stdout.slice(0, 200)));
      }
    });
  });
}
