# 🔧 Solución: Error de Clave Duplicada

## ❌ Error

```
ERROR: 23505: duplicate key value violates unique constraint "usuarios_admin_pkey"
DETAIL: Key (id)=(98c36970-e864-475c-8aba-75409fb881c6) already exists.
```

## ✅ Solución

Este error significa que **el usuario ya existe** en la tabla `usuarios_admin`. Tienes dos opciones:

### Opción 1: Actualizar el Usuario Existente (Recomendado)

Ejecuta este SQL para activar y configurar el usuario existente:

```sql
UPDATE usuarios_admin 
SET 
  nombre = 'Tu Nombre Completo',  -- ⚠️ REEMPLAZA con tu nombre
  email = 'tu@email.com',  -- ⚠️ REEMPLAZA con tu email
  rol = 'admin',
  activo = true,
  puede_ver_diagnosticos = true,
  puede_editar_diagnosticos = true,
  puede_ver_clientes = true,
  puede_editar_clientes = true,
  puede_ver_proyectos = true,
  puede_editar_proyectos = true
WHERE id = '98c36970-e864-475c-8aba-75409fb881c6';  -- ⚠️ El ID que aparece en el error
```

### Opción 2: Verificar y Activar el Usuario

Si solo necesitas activarlo, ejecuta:

```sql
UPDATE usuarios_admin 
SET activo = true
WHERE id = '98c36970-e864-475c-8aba-75409fb881c6';
```

### Opción 3: Ver el Estado Actual del Usuario

Primero verifica qué tiene el usuario:

```sql
SELECT 
  id,
  nombre,
  email,
  rol,
  activo,
  puede_ver_diagnosticos,
  puede_editar_diagnosticos
FROM usuarios_admin
WHERE id = '98c36970-e864-475c-8aba-75409fb881c6';
```

Luego actualiza solo lo que necesites.

## ✅ Verificar que Funciona

Después de ejecutar el UPDATE, verifica:

```sql
SELECT 
  id,
  nombre,
  email,
  rol,
  activo
FROM usuarios_admin
WHERE id = '98c36970-e864-475c-8aba-75409fb881c6';
```

Deberías ver `activo = true`.

## 🚀 Ahora Puedes Iniciar Sesión

Una vez que el usuario esté activo, puedes iniciar sesión en:

```
http://localhost:3001/login
```

Con el email y contraseña del usuario de Supabase Auth.

