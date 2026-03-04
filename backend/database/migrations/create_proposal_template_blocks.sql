-- Bloques editables por plantilla de propuesta (portada, cierre, etc.)
CREATE TABLE IF NOT EXISTS proposal_template_blocks (
  tipo_negocio text NOT NULL,
  block_key text NOT NULL,
  content text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (tipo_negocio, block_key)
);

COMMENT ON TABLE proposal_template_blocks IS 'Textos editables por tipo de plantilla (generic, restaurante, etc.) para el PDF de propuesta';
