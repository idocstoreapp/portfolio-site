import { NextResponse } from 'next/server';
import { scrapeRubro } from '@/lib/scraper';
import { addNewLeads } from '@/lib/database';

export type SearchBody = {
  rubros: string[];
  ciudad: string;
  limite: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchBody;
    const rubros = Array.isArray(body.rubros) ? body.rubros : [];
    const ciudad = typeof body.ciudad === 'string' ? body.ciudad.trim() || 'Santiago' : 'Santiago';
    const limite = Math.max(5, Math.min(50, Number(body.limite) || 20));

    if (rubros.length === 0) {
      return NextResponse.json(
        { error: 'rubros is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    let totalFound = 0;
    let allCollected: { nombre: string; telefono: string | null; website: string | null; direccion: string; ciudad: string; rubro: string; score: number }[] = [];

    for (const rubro of rubros) {
      const r = (rubro || '').trim();
      if (!r) continue;
      const leads = await scrapeRubro(r, ciudad, limite);
      totalFound += leads.length;
      allCollected = allCollected.concat(leads);
    }

    const newLeads = await addNewLeads(allCollected);
    const duplicates = totalFound - newLeads.length;

    return NextResponse.json({
      totalFound,
      newLeads: newLeads.length,
      duplicates,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Search failed' },
      { status: 500 }
    );
  }
}
