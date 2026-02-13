-- ============================================
-- FIX: Políticas RLS para permitir lectura con service_role
-- ============================================
-- Este script ajusta las políticas RLS para que el backend
-- pueda leer diagnósticos usando el service_role_key
-- ============================================

-- IMPORTANTE: El service_role_key bypasea RLS automáticamente,
-- pero si hay algún problema, estas políticas adicionales ayudan

-- Opción 1: Permitir lectura a service_role (si es necesario)
-- Nota: service_role normalmente bypasea RLS, pero por si acaso:

-- Política adicional: Permitir lectura desde el backend (service_role)
-- Esta política es redundante porque service_role bypasea RLS,
-- pero la dejamos por si hay alguna configuración especial

-- Opción 2: Crear una política más permisiva para desarrollo
-- Solo si realmente necesitas que el anon_key pueda leer (NO RECOMENDADO para producción)

-- ============================================
-- VERIFICACIÓN DE POLÍTICAS ACTUALES
-- ============================================

-- Ver políticas actuales de diagnosticos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'diagnosticos';

-- ============================================
-- SOLUCIÓN RECOMENDADA: Usar service_role_key
-- ============================================
-- El backend debe usar SUPABASE_SERVICE_ROLE_KEY en .env
-- El service_role_key bypasea RLS automáticamente
-- ============================================

-- Si necesitas permitir lectura temporal para debugging:
-- (SOLO PARA DESARROLLO, ELIMINAR EN PRODUCCIÓN)

-- DROP POLICY IF EXISTS "Permitir lectura temporal para backend" ON diagnosticos;
-- CREATE POLICY "Permitir lectura temporal para backend"
--   ON diagnosticos
--   FOR SELECT
--   TO service_role
--   USING (true);

-- ============================================
-- VERIFICAR QUE EL BACKEND USE SERVICE_ROLE
-- ============================================
-- En los logs del backend deberías ver:
-- "💾 Using admin client (service_role) for fetching diagnostics"
-- ============================================
