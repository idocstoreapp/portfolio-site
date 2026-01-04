# 🔐 Dónde Iniciar Sesión como Admin

## 📍 URL de Login

La página de login del panel admin está en:

```
http://localhost:3001/login
```

## 🚀 Pasos para Acceder

### 1. Iniciar el Panel Admin

Abre una terminal y ejecuta:

```bash
cd backend/admin-panel
npm run dev
```

Deberías ver algo como:
```
  ▲ Next.js 16.1.1
  - Local:        http://localhost:3001
  - Ready in 2.3s
```

### 2. Abrir el Navegador

Abre tu navegador y ve a:

```
http://localhost:3001/login
```

### 3. Página de Login

Verás una página con:
- Título: "Panel de Administración"
- Subtítulo: "Sistema de Gestión de Diagnósticos"
- Formulario con:
  - Campo de **Correo Electrónico**
  - Campo de **Contraseña**
  - Botón **"Iniciar Sesión"**

### 4. Ingresar Credenciales

- **Email**: El email del usuario que creaste en Supabase Auth
- **Password**: La contraseña que configuraste

### 5. Hacer Click en "Iniciar Sesión"

Si las credenciales son correctas y el usuario está en `usuarios_admin` con `activo = true`, serás redirigido automáticamente al **Dashboard**.

## 🔄 Redirección Automática

- Si ya estás autenticado y visitas `/login`, serás redirigido a `/` (Dashboard)
- Si intentas acceder a cualquier página sin estar autenticado, serás redirigido a `/login`

## 📱 Estructura de Rutas

```
http://localhost:3001/
├── /login          → Página de login
├── /               → Dashboard (requiere auth)
├── /diagnosticos   → Lista de diagnósticos (requiere auth)
├── /diagnosticos/[id] → Detalle de diagnóstico (requiere auth)
└── /proyectos      → Lista de proyectos (requiere auth)
```

## 🐛 Si No Puedes Acceder

### El panel no inicia

```bash
# Verifica que estés en la carpeta correcta
cd backend/admin-panel

# Verifica que las dependencias estén instaladas
npm install

# Inicia el servidor
npm run dev
```

### Error: "Missing Supabase environment variables"

Crea `backend/admin-panel/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### Error: "No tienes permisos de administrador"

1. Verifica que el usuario esté en `usuarios_admin`:
   ```sql
   SELECT * FROM usuarios_admin WHERE email = 'tu@email.com';
   ```

2. Verifica que `activo = true`:
   ```sql
   UPDATE usuarios_admin SET activo = true WHERE email = 'tu@email.com';
   ```

### La página muestra errores

1. Abre la consola del navegador (F12)
2. Revisa los errores en la pestaña "Console"
3. Verifica los logs del servidor Next.js en la terminal

## ✅ Verificación Rápida

Para verificar que todo está configurado:

1. ✅ Panel admin corriendo en `http://localhost:3001`
2. ✅ Backend Nest.js corriendo en `http://localhost:3000`
3. ✅ Usuario en `usuarios_admin` con `activo = true`
4. ✅ Variables de entorno configuradas en `.env.local`

---

**URL de Login:** `http://localhost:3001/login`


