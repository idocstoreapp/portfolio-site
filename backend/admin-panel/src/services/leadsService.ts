import type { Lead } from '@/src/types/lead';

const BACKEND_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '')
    : process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export interface ScrapeLeadsResponse {
  success: boolean;
  created: number;
  skipped: number;
  total: number;
}

export interface GetLeadsFilters {
  status?: string;
  city?: string;
  category?: string;
}

export async function scrapeLeads(
  query: string,
  city: string,
  limit: number
): Promise<ScrapeLeadsResponse> {
  const url = `${BACKEND_URL}/api/leads/scrape`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, city, limit }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `Error ${res.status}`);
  }
  return data as ScrapeLeadsResponse;
}

export async function getLeads(filters: GetLeadsFilters = {}): Promise<Lead[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.city) params.set('city', filters.city);
  if (filters.category) params.set('category', filters.category);
  const qs = params.toString();
  const url = `${BACKEND_URL}/api/leads${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `Error ${res.status}`);
  }
  return Array.isArray(data) ? data : (data?.data ?? data?.leads ?? []);
}

export async function updateLeadStatus(
  id: string,
  status: string
): Promise<Lead> {
  const url = `${BACKEND_URL}/api/leads/${id}/status`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `Error ${res.status}`);
  }
  return data as Lead;
}

/** Crea un diagnóstico desde un lead y actualiza el lead (diagnostic_id, status). */
export async function createDiagnosticFromLead(leadId: string): Promise<{ id: string; [k: string]: unknown }> {
  const url = `${BACKEND_URL}/api/diagnostic/from-lead/${leadId}`;
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? `Error ${res.status}`);
  }
  return data?.data ?? data;
}

/** Crea el registro de propuesta desde un diagnóstico (sin PDF). */
export async function createProposalFromDiagnostic(diagnosticId: string): Promise<{
  id: string;
  pdf_url: string | null;
  diagnostic_id: string;
  business_name: string | null;
  [k: string]: unknown;
}> {
  const url = `${BACKEND_URL}/api/proposal/from-diagnostic/${diagnosticId}`;
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? `Error ${res.status}`);
  }
  return data?.data ?? data;
}

export interface GeneratePdfPayload {
  logoCliente?: string;
  logoTu?: string;
  mockup1?: string;
  mockup2?: string;
  mockup3?: string;
  mockup4?: string;
  mockup5?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  tipoNegocio?: string;
  /** landing | multi-pagina | catalogo (cuando hay web) */
  tipoWeb?: string;
  /** un-local | multi-sucursal (cuando hay sistema) */
  tipoSistema?: string;
  /** Si el sistema incluye roles (admin, técnicos, empleados) */
  conRoles?: boolean;
  /** solo-web | solo-sistema | combo */
  tipoOferta?: string;
  precioBasico?: string;
  precioProfesional?: string;
  precioEnterprise?: string;
  subtitle?: string;
}

/** Genera el PDF de la propuesta con plantillas (editor: logos, mockups, colores). */
export async function generateProposalPdf(
  proposalId: string,
  payload: GeneratePdfPayload
): Promise<{ id: string; pdf_url: string | null; [k: string]: unknown }> {
  const url = `${BACKEND_URL}/api/proposal/${proposalId}/generate-pdf`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? `Error ${res.status}`);
  }
  return data?.data ?? data;
}
