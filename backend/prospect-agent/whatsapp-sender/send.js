/**
 * Envía mensajes WhatsApp por Twilio a los contactos de leads.json.
 * Guarda enviados en enviados.json y fallidos en fallidos.json.
 *
 * Variables de entorno: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
 * Opcional: TWILIO_WHATSAPP_FROM, TWILIO_CONTENT_SID
 */

import 'dotenv/config';
import twilio from 'twilio';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LEADS_PATH = path.join(__dirname, 'leads.json');
const ENVIADOS_PATH = path.join(__dirname, 'enviados.json');
const FALLIDOS_PATH = path.join(__dirname, 'fallidos.json');

const DELAY_MS = 1500;
// Usar variables de entorno. Ejemplo: whatsapp:+14155238886
const DEFAULT_FROM = process.env.TWILIO_WHATSAPP_FROM || '';
// Content SID del template de WhatsApp en Twilio (configurar en .env como TWILIO_CONTENT_SID)
const DEFAULT_CONTENT_SID = '';

function loadLeads() {
  try {
    const data = readFileSync(LEADS_PATH, 'utf8');
    const leads = JSON.parse(data);
    return Array.isArray(leads) ? leads : [leads];
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`No se encontró ${LEADS_PATH}. Crea el archivo con un array de contactos que tengan al menos "telefono".`);
    }
    throw err;
  }
}

function normalizePhone(lead) {
  let tel = (lead.telefono || lead.phone || '').toString().trim();
  if (!tel || tel.toLowerCase() === 'desconocido') return null;
  tel = tel.replace(/\D/g, '');
  if (tel.length < 8) return null;
  if (tel.startsWith('56') && tel.length >= 11) return `whatsapp:+${tel}`;
  if (tel.length === 9 && (tel.startsWith('9') || tel.startsWith('2'))) return `whatsapp:+56${tel}`;
  if (tel.length >= 9) return `whatsapp:+${tel}`;
  return null;
}

function buildContentVariables(lead) {
  const fecha = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  return JSON.stringify({
    '1': (lead.nombre || lead.name || '').toString().trim() || 'Contacto',
    '2': fecha,
    '3': hora,
    '4': (lead.categoria || '').toString().trim() || '',
  });
}

async function sendOne(client, from, contentSid, to, contentVariables) {
  return client.messages.create({
    from,
    contentSid,
    contentVariables,
    to,
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.AuthToken;
  if (!accountSid) {
    console.error('Falta TWILIO_ACCOUNT_SID. Configúralo en .env (nunca subas credenciales al repo).');
    process.exit(1);
  }
  if (!authToken) {
    console.error('Falta TWILIO_AUTH_TOKEN (o AuthToken). Configúralo en .env o en el entorno.');
    process.exit(1);
  }

  const from = process.env.TWILIO_WHATSAPP_FROM || DEFAULT_FROM;
  const contentSid = process.env.TWILIO_CONTENT_SID || DEFAULT_CONTENT_SID;
  if (!from || !contentSid) {
    console.error('Faltan TWILIO_WHATSAPP_FROM y/o TWILIO_CONTENT_SID en .env.');
    process.exit(1);
  }

  const client = twilio(accountSid, authToken);
  const leads = loadLeads();

  const valid = [];
  for (const lead of leads) {
    const to = normalizePhone(lead);
    if (to) valid.push({ lead, to });
  }

  if (valid.length === 0) {
    console.error('Ningún contacto tiene teléfono válido en leads.json');
    process.exit(1);
  }

  console.log(`Leads con teléfono: ${valid.length}. Enviando mensajes...`);

  const enviados = [];
  const fallidos = [];

  for (let i = 0; i < valid.length; i++) {
    const { lead, to } = valid[i];
    const contentVariables = buildContentVariables(lead);

    try {
      const message = await sendOne(client, from, contentSid, to, contentVariables);
      enviados.push({ ...lead, sid: message.sid, enviado_at: new Date().toISOString() });
      console.log(`[${i + 1}/${valid.length}] OK ${to} -> ${message.sid}`);
    } catch (err) {
      fallidos.push({
        ...lead,
        error: err.message || String(err.code || err),
        fallido_at: new Date().toISOString(),
      });
      console.error(`[${i + 1}/${valid.length}] FALLO ${to}: ${err.message}`);
    }

    if (i < valid.length - 1) await sleep(DELAY_MS);
  }

  writeFileSync(ENVIADOS_PATH, JSON.stringify(enviados, null, 2), 'utf8');
  writeFileSync(FALLIDOS_PATH, JSON.stringify(fallidos, null, 2), 'utf8');

  console.log('');
  console.log(`Enviados: ${enviados.length} -> ${ENVIADOS_PATH}`);
  console.log(`Fallidos: ${fallidos.length} -> ${FALLIDOS_PATH}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
