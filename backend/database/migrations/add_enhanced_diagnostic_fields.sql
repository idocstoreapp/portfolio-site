-- Migración: Agregar campos para diagnóstico mejorado
-- Agrega campos adicionales para soportar el sistema de caminos dinámicos

ALTER TABLE diagnosticos
ADD COLUMN IF NOT EXISTS operacion_actual TEXT,
ADD COLUMN IF NOT EXISTS dolor_principal TEXT,
ADD COLUMN IF NOT EXISTS situacion_actual TEXT,
ADD COLUMN IF NOT EXISTS tipo_negocio TEXT,
ADD COLUMN IF NOT EXISTS envelope_data JSONB;

-- Índices para búsquedas futuras
CREATE INDEX IF NOT EXISTS idx_diagnosticos_operacion_actual ON diagnosticos(operacion_actual);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_dolor_principal ON diagnosticos(dolor_principal);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_envelope_data ON diagnosticos USING GIN (envelope_data);

-- Comentarios para documentación
COMMENT ON COLUMN diagnosticos.operacion_actual IS 'Cómo opera actualmente el negocio (papel, excel, sistema, etc.)';
COMMENT ON COLUMN diagnosticos.dolor_principal IS 'Problema principal identificado en el diagnóstico';
COMMENT ON COLUMN diagnosticos.situacion_actual IS 'Situación actual del negocio (sin-web, web-desactualizada, etc.)';
COMMENT ON COLUMN diagnosticos.tipo_negocio IS 'Tipo específico de negocio para web (servicios, productos, portfolio, etc.)';
COMMENT ON COLUMN diagnosticos.envelope_data IS 'Diagnostic envelope completo en formato JSON para referencia futura';




