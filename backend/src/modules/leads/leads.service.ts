import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { ScrapeLeadsDto } from './dto/scrape-leads.dto';
import * as path from 'path';
import { pathToFileURL } from 'url';

interface ParsedLead {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string | null;
  website: string | null;
  rating: number | null;
  reviews_count: number;
  categoria: string | null;
  score: number;
}

/** Ruta al scraper: desde dist o desde src según exista (watch mode no copia assets). */
function getScraperModulePath(filename: string): string {
  const fromDist = path.join(__dirname, 'scraper', filename);
  const fromSrc = path.join(process.cwd(), 'src', 'modules', 'leads', 'scraper', filename);
  const fs = require('fs');
  if (fs.existsSync(fromDist)) return pathToFileURL(fromDist).href;
  return pathToFileURL(fromSrc).href;
}

/** Llamada a import() en runtime para que el compilador no la convierta en require() (los .js del scraper son ESM). */
const importEsModule = (specifier: string) => new Function('specifier', 'return import(specifier)')(specifier);

@Injectable()
export class LeadsService {
  constructor(private readonly supabase: SupabaseService) {}

  async scrapeLeads(dto: ScrapeLeadsDto): Promise<{
    success: boolean;
    created: number;
    skipped: number;
    total: number;
  }> {
    const limit = dto.limit ?? 20;

    const { buildSearchQuery } = await importEsModule(getScraperModulePath('utils.js'));
    const { scrapeMaps } = await importEsModule(getScraperModulePath('mapsScraper.js'));
    const { parsePlaces } = await importEsModule(getScraperModulePath('parser.js'));

    const fullQuery = buildSearchQuery(dto.query, dto.city);
    const { results } = await scrapeMaps(fullQuery, { minResults: limit });
    const parsed = parsePlaces(results) as ParsedLead[];

    if (!this.supabase.isConfigured()) {
      throw new Error('Supabase is not configured. Cannot save leads.');
    }

    const admin = this.supabase.getAdminClient();

    const { data: existingRows } = await admin
      .from('leads')
      .select('id, phone, name, address');

    const normalizedPhones = new Set<string>();
    const nameAddressKeys = new Set<string>();
    (existingRows || []).forEach((row: { phone?: string | null; name?: string | null; address?: string | null }) => {
      if (row.phone && String(row.phone).trim()) {
        normalizedPhones.add(String(row.phone).replace(/\D/g, ''));
      }
      const name = (row.name ?? '').toString().trim().toLowerCase();
      const address = (row.address ?? '').toString().trim().toLowerCase();
      nameAddressKeys.add(`${name}|${address}`);
    });

    let created = 0;
    let skipped = 0;

    for (const p of parsed) {
      const name = (p.nombre ?? '').trim() || null;
      const address = (p.direccion ?? '').trim() || '';
      const phone = p.telefono && String(p.telefono).trim() ? String(p.telefono).trim() : null;
      const normalizedPhone = phone ? phone.replace(/\D/g, '') : '';

      if (normalizedPhone && normalizedPhones.has(normalizedPhone)) {
        skipped++;
        continue;
      }
      const key = `${(name ?? '').toLowerCase()}|${address.toLowerCase()}`;
      if (nameAddressKeys.has(key)) {
        skipped++;
        continue;
      }

      const row = {
        name: name ?? 'Sin nombre',
        phone,
        website: p.website && String(p.website).trim() ? String(p.website).trim() : null,
        address: address || null,
        city: (p.ciudad ?? dto.city ?? '').trim() || null,
        category: p.categoria && String(p.categoria).trim() ? String(p.categoria).trim() : null,
        google_maps_url: null,
        rating: p.rating != null && Number.isFinite(Number(p.rating)) ? Number(p.rating) : null,
        reviews_count: typeof p.reviews_count === 'number' && Number.isInteger(p.reviews_count) ? p.reviews_count : null,
        score: typeof p.score === 'number' && Number.isInteger(p.score) ? p.score : null,
        status: 'new',
        source: 'google_maps',
      };

      const { error } = await admin.from('leads').insert([row]).select('id').single();
      if (error) {
        skipped++;
        continue;
      }
      created++;
      if (normalizedPhone) normalizedPhones.add(normalizedPhone);
      nameAddressKeys.add(key);
    }

    return {
      success: true,
      created,
      skipped,
      total: parsed.length,
    };
  }

  async getLeads(filters: { status?: string; city?: string; category?: string }) {
    if (!this.supabase.isConfigured()) {
      return [];
    }
    const admin = this.supabase.getAdminClient();
    let q = admin.from('leads').select('*').order('created_at', { ascending: false });
    if (filters.status) q = q.eq('status', filters.status);
    if (filters.city) q = q.eq('city', filters.city);
    if (filters.category) q = q.eq('category', filters.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const leads = rows ?? [];

    const proposalIds = [...new Set(leads.map((l: { proposal_id?: string | null }) => l.proposal_id).filter(Boolean))] as string[];
    let pdfByProposalId: Record<string, string | null> = {};
    if (proposalIds.length > 0) {
      const { data: proposals } = await admin.from('proposals').select('id, pdf_url').in('id', proposalIds);
      if (proposals) {
        pdfByProposalId = Object.fromEntries(proposals.map((p: { id: string; pdf_url: string | null }) => [p.id, p.pdf_url ?? null]));
      }
    }

    return leads.map((lead: Record<string, unknown>) => ({
      ...lead,
      pdf_url: lead.proposal_id ? pdfByProposalId[lead.proposal_id as string] ?? null : null,
    }));
  }

  async updateLeadStatus(id: string, status: string) {
    if (!this.supabase.isConfigured()) {
      throw new Error('Supabase is not configured.');
    }
    const admin = this.supabase.getAdminClient();
    const { data, error } = await admin
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}
