# 🔐 Cómo Iniciar Sesión como Admin

## 📋 Pasos para Configurar y Acceder como Administrador

### Paso 1: Crear Usuario en Supabase Auth

1. Ve a tu proyecto en **Supabase Dashboard**
2. Navega a **Authentication** → **Users**
3. Haz clic en **"Add user"** o **"Invite user"**
4. Completa el formulario:
   - **Email**: Tu correo electrónico (ej: `admin@tudominio.com`)
   - **Password**: Una contraseña segura
   - **Auto Confirm User**: ✅ Marca esta opción (para no necesitar verificación de email)
5. Haz clic en **"Create user"** o **"Send invite"**

### Paso 2: Obtener el ID del Usuario

Una vez creado el usuario:

1. En la lista de usuarios, haz clic en el usuario que acabas de crear
2. **Copia el UUID** que aparece (ej: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
3. También anota el **email** del usuario

### Paso 3: Agregar Usuario a la Tabla `usuarios_admin`

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Ejecuta este SQL (reemplaza los valores):

```sql
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
  'TU_USER_ID_AQUI',  -- El UUID que copiaste en el Paso 2
  'Tu Nombre Completo',  -- Tu nombre
  'tu@email.com',  -- El email del usuario
  'admin',  -- Rol: admin, vendedor, o soporte
  true,  -- Usuario activo
  true,  -- Puede ver diagnósticos
  true,  -- Puede editar diagnósticos
  true,  -- Puede ver clientes
  true,  -- Puede editar clientes
  true,  -- Puede ver proyectos
  false  -- Puede editar proyectos (opcional)
);
```

**Ejemplo real:**
```sql
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
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Jonathan Contreras',
  'admin@maestrodigital.com',
  'admin',
  true,
  true,
  true,
  true,
  true,
  true,
  true
);
```

### Paso 4: Verificar que el Usuario Fue Creado Correctamente

Ejecuta este SQL para verificar:

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
WHERE email = 'tu@email.com';
```

Deberías ver tu usuario en los resultados.

### Paso 5: Iniciar Sesión en el Panel

1. **Inicia el panel admin** (si no está corriendo):
   ```bash
   cd backend/admin-panel
   npm run dev
   ```

2. **Abre tu navegador** y ve a:
   ```
   http://localhost:3001/login
   ```

3. **Ingresa tus credenciales**:
   - **Email**: El email que usaste al crear el usuario
   - **Password**: La contraseña que configuraste

4. **Haz clic en "Iniciar Sesión"**

5. Si todo está correcto, serás redirigido al **Dashboard** (`/`)

## ✅ Verificación de Acceso

Si puedes ver:
- ✅ El Dashboard con estadísticas
- ✅ El sidebar con opciones de navegación
- ✅ Tu nombre en el header

¡Entonces tienes acceso de admin correctamente configurado!

## 🐛 Solución de Problemas

### Error: "No tienes permisos de administrador"

**Causa**: El usuario no está en la tabla `usuarios_admin` o `activo = false`

**Solución**:
1. Verifica que ejecutaste el SQL del Paso 3
2. Verifica que `activo = true`:
   ```sql
   UPDATE usuarios_admin 
   SET activo = true 
   WHERE email = 'tu@email.com';
   ```

### Error: "Invalid login credentials"

**Causa**: Email o contraseña incorrectos

**Solución**:
1. Verifica que el email sea exactamente el mismo que creaste en Supabase
2. Si olvidaste la contraseña, puedes resetearla desde Supabase Dashboard → Authentication → Users → [Tu usuario] → Reset Password

### Error: "Missing Supabase environment variables"

**Causa**: No has configurado las variables de entorno

**Solución**:
1. Crea `backend/admin-panel/.env.local`
2. Agrega:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
   ```
3. Reinicia el servidor (`npm run dev`)

### El panel no carga o muestra errores

**Solución**:
1. Verifica que el backend Nest.js esté corriendo en `http://localhost:3000`
2. Verifica la consola del navegador (F12) para ver errores
3. Verifica los logs del servidor Next.js

## 🔄 Crear Múltiples Admins

Para crear más administradores, repite los Pasos 1-3 con diferentes usuarios.

## 📝 Notas Importantes

- ⚠️ **Mantén segura tu contraseña de admin**
- ⚠️ **No compartas las credenciales de admin**
- ✅ Puedes crear múltiples usuarios admin
- ✅ Cada usuario admin puede tener diferentes permisos (ver `puede_ver_*`, `puede_editar_*`)
- ✅ El rol puede ser: `admin`, `vendedor`, o `soporte`

---

**¿Necesitas ayuda?** Revisa los logs del servidor y la consola del navegador para más detalles del error.


