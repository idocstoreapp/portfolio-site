-- ============================================
-- MIGRACIÓN: TABLA PROPOSALS
-- ============================================
-- Ejecutar en Supabase SQL Editor si no usas DATABASE_URL en el backend.
-- ============================================

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
