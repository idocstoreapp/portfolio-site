# ✅ Panel Admin Integrado en Frontend Principal

## 🎉 ¡Panel Admin Ahora en el Frontend Principal!

El panel de administración ahora está **integrado en el frontend Astro principal** que corre en `localhost:4321`.

## 📍 URLs del Panel Admin

### Login
```
http://localhost:4321/admin/login
```

### Dashboard
```
http://localhost:4321/admin
```

### Lista de Diagnósticos
```
http://localhost:4321/admin/diagnosticos
```

### Detalle de Diagnóstico
```
http://localhost:4321/admin/diagnosticos/[id]
```

### Proyectos Activos
```
http://localhost:4321/admin/proyectos
```

## 🚀 Cómo Acceder

### Paso 1: Iniciar el Frontend

```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:4321`

### Paso 2: Ir a la Página de Login

Abre tu navegador y ve a:

```
http://localhost:4321/admin/login
```

### Paso 3: Iniciar Sesión

- **Email**: El email del usuario admin de Supabase Auth
- **Password**: La contraseña configurada

## 📁 Estructura Creada

```
src/
├── pages/
│   └── admin/
│       ├── login.astro              # Página de login
│       ├── index.astro              # Dashboard
│       ├── diagnosticos.astro       # Lista de diagnósticos
│       ├── diagnosticos/
│       │   └── [id].astro           # Detalle de diagnóstico
│       └── proyectos.astro          # Lista de proyectos
├── components/
│   └── admin/
│       ├── AdminLogin.tsx           # Componente de login
│       ├── AdminGuard.tsx            # Guard de autenticación
│       ├── AdminSidebar.tsx         # Sidebar de navegación
│       ├── AdminDashboard.tsx       # Dashboard con estadísticas
│       ├── DiagnosticosList.tsx     # Lista de diagnósticos
│       ├── DiagnosticDetail.tsx    # Detalle y edición
│       ├── ProyectosList.tsx        # Lista de proyectos
│       └── GenerateOrderPDF.tsx     # Generador de PDFs
└── utils/
    └── adminSupabase.ts             # Cliente Supabase para admin
```

## 🔐 Autenticación

- Usa **Supabase Auth** (mismo que el resto de la app)
- Verifica que el usuario esté en `usuarios_admin` con `activo = true`
- Protege todas las rutas `/admin/*` excepto `/admin/login`

## ✨ Funcionalidades

### ✅ Dashboard (`/admin`)
- Estadísticas en tiempo real
- Accesos rápidos

### ✅ Lista de Diagnósticos (`/admin/diagnosticos`)
- Filtros avanzados
- Paginación
- Vista en tarjetas

### ✅ Detalle de Diagnóstico (`/admin/diagnosticos/[id]`)
- Ver información completa
- Cambiar estado
- Registrar costo real
- Registrar horas de trabajo
- Generar orden PDF

### ✅ Proyectos Activos (`/admin/proyectos`)
- Lista de proyectos aprobados
- Acceso rápido a cada proyecto

## 🔧 Configuración

### Variables de Entorno

Asegúrate de que tu `.env` o `.env.local` tenga:

```env
PUBLIC_SUPABASE_URL=tu_supabase_url
PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
PUBLIC_BACKEND_URL=http://localhost:3000
```

### Instalar Dependencias

```bash
npm install @supabase/supabase-js date-fns jspdf html2canvas
```

## 🎯 Flujo de Trabajo

1. **Acceder**: `http://localhost:4321/admin/login`
2. **Login**: Email y contraseña de admin
3. **Dashboard**: Ver estadísticas
4. **Diagnósticos**: Gestionar diagnósticos
5. **Aprobar**: Cambiar estado a "Proyecto"
6. **Registrar Costos**: Ingresar costo real y horas
7. **Generar Orden**: Crear PDF profesional

## 📝 Notas

- ✅ El panel está **integrado en el mismo frontend** (Astro)
- ✅ Usa **componentes React** para interactividad
- ✅ Mismo **backend API** (`http://localhost:3000`)
- ✅ Mismo **Supabase** que el resto de la app
- ✅ **No necesitas** correr una app Next.js separada

---

**¡Ahora puedes gestionar diagnósticos desde el mismo frontend principal!** 🎉


