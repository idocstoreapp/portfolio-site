-- Agregar campos de costo y trabajo real a la tabla diagnosticos
ALTER TABLE diagnosticos 
ADD COLUMN IF NOT EXISTS costo_real DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS trabajo_real_horas DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS fecha_aprobacion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES auth.users(id);

-- Índice para búsquedas por aprobación
CREATE INDEX IF NOT EXISTS idx_diagnosticos_fecha_aprobacion ON diagnosticos(fecha_aprobacion DESC);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_aprobado_por ON diagnosticos(aprobado_por);




