-- ============================================
-- SCRIPT PARA CREAR USUARIO ADMIN
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Primero crea el usuario en Supabase Auth (Authentication → Users → Add user)
-- 2. Copia el UUID del usuario creado
-- 3. Reemplaza los valores en este script
-- 4. Ejecuta este script en Supabase SQL Editor
--
-- ============================================

-- Reemplaza estos valores:
-- - 'TU_USER_ID_AQUI': El UUID del usuario de Supabase Auth
-- - 'Tu Nombre': Tu nombre completo
-- - 'tu@email.com': El email del usuario

-- Si el usuario ya existe, actualizarlo. Si no existe, crearlo.
INSERT INTO usuarios_admin (
  id,
  nombre,
  email,
  rol,
  activo,
  puede_ver_diagnosticos,
  puede_editar_diagnosticos,
  puede_ver_clientes,
  puede_editar_clientes,
  puede_ver_proyectos,
  puede_editar_proyectos
)
VALUES (
  'TU_USER_ID_AQUI',  -- ⚠️ REEMPLAZA: UUID del usuario de Supabase Auth
  'Tu Nombre Completo',  -- ⚠️ REEMPLAZA: Tu nombre
  'tu@email.com',  -- ⚠️ REEMPLAZA: Email del usuario
  'admin',  -- Rol: admin, vendedor, o soporte
  true,  -- Usuario activo
  true,  -- Puede ver diagnósticos
  true,  -- Puede editar diagnósticos
  true,  -- Puede ver clientes
  true,  -- Puede editar clientes
  true,  -- Puede ver proyectos
  true   -- Puede editar proyectos
)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  rol = EXCLUDED.rol,
  activo = true,
  puede_ver_diagnosticos = true,
  puede_editar_diagnosticos = true,
  puede_ver_clientes = true,
  puede_editar_clientes = true,
  puede_ver_proyectos = true,
  puede_editar_proyectos = true;

-- ============================================
-- VERIFICAR QUE SE CREÓ CORRECTAMENTE
-- ============================================

SELECT 
  id,
  nombre,
  email,
  rol,
  activo,
  puede_ver_diagnosticos,
  puede_editar_diagnosticos,
  created_at
FROM usuarios_admin
WHERE email = 'tu@email.com';  -- ⚠️ REEMPLAZA con tu email

-- ============================================
-- SI NECESITAS DESACTIVAR UN ADMIN
-- ============================================

-- UPDATE usuarios_admin 
-- SET activo = false 
-- WHERE email = 'tu@email.com';

-- ============================================
-- SI NECESITAS VER TODOS LOS ADMINS
-- ============================================

-- SELECT 
--   id,
--   nombre,
--   email,
--   rol,
--   activo,
--   created_at
-- FROM usuarios_admin
-- ORDER BY created_at DESC;

