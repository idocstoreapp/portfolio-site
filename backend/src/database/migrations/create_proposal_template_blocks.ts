import { SupabaseService } from '../../common/supabase/supabase.service';

const CREATE_PROPOSAL_TEMPLATE_BLOCKS_SQL = `
CREATE TABLE IF NOT EXISTS proposal_template_blocks (
  tipo_negocio text NOT NULL,
  block_key text NOT NULL,
  content text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (tipo_negocio, block_key)
);
`;

export async function createProposalTemplateBlocksTable(
  supabaseService: SupabaseService,
): Promise<void> {
  if (!supabaseService.isConfigured()) return;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;
  try {
    const { Client } = await import('pg');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    await client.query(CREATE_PROPOSAL_TEMPLATE_BLOCKS_SQL);
    await client.end();
    console.log('[migrations] Table proposal_template_blocks created or already exists.');
  } catch (err) {
    console.warn(
      '[migrations] create_proposal_template_blocks failed:',
      (err as Error).message,
    );
    throw err;
  }
}
