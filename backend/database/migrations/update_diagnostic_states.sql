-- ============================================
-- ACTUALIZACIÓN: Estados del Diagnóstico Simplificados
-- ============================================
-- Cambia los estados a: contactado, aprobado, rechazado, no_contesto
-- ============================================

-- PASO 1: Eliminar el constraint existente (si existe)
ALTER TABLE diagnosticos DROP CONSTRAINT IF EXISTS diagnosticos_estado_check;

-- PASO 2: Actualizar estados existentes ANTES de aplicar el nuevo constraint
-- Esto asegura que todos los datos cumplan con el nuevo constraint

-- Actualizar 'nuevo' y 'cotizando' a 'contactado'
UPDATE diagnosticos 
SET estado = 'contactado' 
WHERE estado IN ('nuevo', 'cotizando');

-- Actualizar 'proyecto' a 'aprobado'
UPDATE diagnosticos 
SET estado = 'aprobado' 
WHERE estado = 'proyecto';

-- Actualizar 'cerrado' con notas de rechazo a 'rechazado'
UPDATE diagnosticos 
SET estado = 'rechazado' 
WHERE estado = 'cerrado' AND (notas ILIKE '%rechaz%' OR notas ILIKE '%rechazado%' OR notas ILIKE '%rechazó%');

-- Actualizar 'cerrado' con notas de no contestó a 'no_contesto'
UPDATE diagnosticos 
SET estado = 'no_contesto' 
WHERE estado = 'cerrado' AND (notas ILIKE '%no contest%' OR notas ILIKE '%no respond%' OR notas ILIKE '%sin respuesta%');

-- Actualizar cualquier 'cerrado' restante a 'rechazado' (por defecto)
UPDATE diagnosticos 
SET estado = 'rechazado' 
WHERE estado = 'cerrado';

-- Actualizar cualquier estado desconocido a 'contactado' (por defecto)
UPDATE diagnosticos 
SET estado = 'contactado' 
WHERE estado NOT IN ('contactado', 'aprobado', 'rechazado', 'no_contesto');

-- PASO 3: Ahora sí, aplicar el nuevo constraint
ALTER TABLE diagnosticos ADD CONSTRAINT diagnosticos_estado_check 
  CHECK (estado IN ('contactado', 'aprobado', 'rechazado', 'no_contesto'));

-- PASO 4: Actualizar estado por defecto
ALTER TABLE diagnosticos ALTER COLUMN estado SET DEFAULT 'contactado';

-- PASO 5: Agregar comentario
COMMENT ON COLUMN diagnosticos.estado IS 'Estado del diagnóstico: contactado (inicial), aprobado (cliente aprobó), rechazado (cliente rechazó), no_contesto (cliente no respondió)';

-- PASO 6: Verificar que no haya estados inválidos (opcional, para debugging)
-- SELECT estado, COUNT(*) FROM diagnosticos GROUP BY estado;
