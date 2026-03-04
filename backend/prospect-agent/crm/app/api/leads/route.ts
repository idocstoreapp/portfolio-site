import { NextResponse } from 'next/server';
import { loadLeads } from '@/lib/database';

export async function GET() {
  try {
    const leads = await loadLeads();
    return NextResponse.json(leads);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to load leads' },
      { status: 500 }
    );
  }
}
