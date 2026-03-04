import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { sha1 } from './hash';

const DB_DIR = 'database';
const DB_FILE = 'leads.json';

export type Lead = {
  id: string;
  nombre: string;
  telefono: string | null;
  website: string | null;
  direccion: string;
  ciudad: string;
  rubro: string;
  score: number;
  fechaDetectado: string;
  estado: string;
};

const DEFAULT_ESTADO = 'nuevo';

function getDbPath(): string {
  return path.join(process.cwd(), DB_DIR, DB_FILE);
}

/**
 * Carga todos los leads desde database/leads.json.
 * Si el archivo no existe, devuelve [].
 */
export async function loadLeads(): Promise<Lead[]> {
  const filePath = getDbPath();
  try {
    const data = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

/**
 * Guarda el array de leads en database/leads.json.
 * Crea el directorio database/ si no existe.
 */
export async function saveLeads(leads: Lead[]): Promise<void> {
  const dir = path.join(process.cwd(), DB_DIR);
  await mkdir(dir, { recursive: true });
  const filePath = getDbPath();
  await writeFile(filePath, JSON.stringify(leads, null, 2), 'utf-8');
}

export type LeadInput = {
  nombre: string;
  telefono: string | null;
  website: string | null;
  direccion: string;
  ciudad: string;
  rubro: string;
  score: number;
};

/**
 * Añade nuevos leads sin duplicados (id = sha1(nombre + telefono)).
 * Solo inserta los que no existan por id.
 * Devuelve solo los leads recién añadidos.
 */
export async function addNewLeads(inputLeads: LeadInput[]): Promise<Lead[]> {
  const existing = await loadLeads();
  const byId = new Map<string, Lead>(existing.map((l) => [l.id, l]));
  const newLeads: Lead[] = [];
  const now = new Date().toISOString();

  for (const input of inputLeads) {
    const nombre = (input.nombre ?? '').toString().trim();
    const telefono = (input.telefono ?? '').toString().trim();
    const id = sha1(nombre + telefono);
    if (byId.has(id)) continue;

    const lead: Lead = {
      id,
      nombre,
      telefono: input.telefono ?? null,
      website: input.website ?? null,
      direccion: (input.direccion ?? '').toString().trim() || nombre,
      ciudad: (input.ciudad ?? '').toString().trim() || 'Santiago',
      rubro: (input.rubro ?? '').toString().trim() || '',
      score: Number(input.score) || 0,
      fechaDetectado: now,
      estado: DEFAULT_ESTADO,
    };
    byId.set(id, lead);
    newLeads.push(lead);
  }

  if (newLeads.length > 0) {
    await saveLeads(Array.from(byId.values()));
  }
  return newLeads;
}
