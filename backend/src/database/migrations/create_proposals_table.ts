import { SupabaseService } from '../../common/supabase/supabase.service';

const CREATE_PROPOSALS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id uuid REFERENCES diagnosticos(id) ON DELETE CASCADE,
  business_name text,
  solution text,
  price numeric,
  status text DEFAULT 'pending',
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
`;

/**
 * Crea la tabla proposals en Supabase.
 * Requiere DATABASE_URL en .env (connection string de Supabase: Project Settings > Database)
 * para ejecutar DDL. Si no está definido, la tabla debe crearse manualmente en SQL Editor.
 */
export async function createProposalsTable(supabaseService: SupabaseService): Promise<void> {
  if (!supabaseService.isConfigured()) {
    return;
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn(
      '[migrations] DATABASE_URL not set. Skipping create_proposals_table. Create the table manually in Supabase SQL Editor if needed.',
    );
    return;
  }
  try {
    const { Client } = await import('pg');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    await client.query(CREATE_PROPOSALS_TABLE_SQL);
    await client.end();
    console.log('[migrations] Table proposals created or already exists.');
  } catch (err) {
    console.warn('[migrations] create_proposals_table failed:', (err as Error).message);
    throw err;
  }
}
