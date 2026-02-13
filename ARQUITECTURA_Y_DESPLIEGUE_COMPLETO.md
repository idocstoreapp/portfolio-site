# 🏗️ ARQUITECTURA Y DESPLIEGUE COMPLETO

## 📊 ARQUITECTURA DEL PROYECTO

Tu proyecto tiene **3 aplicaciones separadas** que funcionan juntas:

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA COMPLETA                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│                  │      │                  │      │                  │
│  FRONTEND ASTRO  │      │  ADMIN PANEL     │      │  BACKEND NESTJS  │
│  (Sitio Web)     │      │  (Next.js)       │      │  (API REST)      │
│                  │      │                  │      │                  │
│  Puerto: 4321    │      │  Puerto: 3001    │      │  Puerto: 3000    │
│                  │      │                  │      │                  │
│  - Landing Page  │      │  - Dashboard     │      │  - API Endpoints │
│  - Wizard        │      │  - Órdenes       │      │  - Supabase      │
│  - Proyectos     │      │  - Diagnósticos  │      │  - Database      │
│  - Servicios     │      │  - Precios       │      │  - Auth          │
│                  │      │                  │      │                  │
└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
         │                         │                         │
         │                         │                         │
         └─────────────────────────┴─────────────────────────┘
                                   │
                          ┌────────▼────────┐
                          │                 │
                          │   SUPABASE      │
                          │   (Database)    │
                          │                 │
                          └─────────────────┘
```

---

## 🔌 PUERTOS Y QUÉ HACE CADA UNO

### 1. **Puerto 4321 - Frontend Astro (Sitio Web Público)**
- **Qué es:** Tu sitio web informativo principal
- **Tecnología:** Astro
- **Contenido:**
  - Landing page
  - Wizard de diagnóstico
  - Páginas de servicios
  - Portafolio de proyectos
  - Información de contacto
- **Público:** ✅ Sí, accesible para todos
- **Comando:** `npm run dev` (desde la raíz del proyecto)

### 2. **Puerto 3001 - Admin Panel (Panel de Administración)**
- **Qué es:** Panel privado para gestionar el negocio
- **Tecnología:** Next.js
- **Contenido:**
  - Dashboard
  - Gestión de diagnósticos
  - Gestión de órdenes
  - Configuración de precios
  - Gestión de garantías
- **Público:** ❌ No, requiere autenticación
- **Comando:** `cd backend/admin-panel && npm run dev`

### 3. **Puerto 3000 - Backend API (API REST)**
- **Qué es:** Servidor backend que maneja la lógica de negocio
- **Tecnología:** NestJS
- **Contenido:**
  - Endpoints de API (`/api/diagnostic`, `/api/orders`, etc.)
  - Conexión a Supabase
  - Validación de datos
  - Lógica de negocio
- **Público:** ❌ No directamente, solo accesible por las otras apps
- **Comando:** `cd backend && npm run start:dev`

### 4. **Puerto 4322 - ¿Qué es?**
- Probablemente una configuración alternativa o un servicio adicional
- O puede ser el puerto de desarrollo de Astro cuando 4321 está ocupado

---

## 🚀 CÓMO FUNCIONAN JUNTOS

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE DATOS                            │
└─────────────────────────────────────────────────────────────┘

1. Usuario visita sitio web (Puerto 4321)
   ↓
2. Completa el wizard de diagnóstico
   ↓
3. Frontend Astro envía datos al Backend (Puerto 3000)
   ↓
4. Backend guarda en Supabase
   ↓
5. Admin ve el diagnóstico en Admin Panel (Puerto 3001)
   ↓
6. Admin crea orden desde diagnóstico
   ↓
7. Backend procesa y guarda orden
   ↓
8. Admin genera PDF y gestiona orden
```

---

## 📦 DESPLIEGUE EN VERCEL

### ⚠️ IMPORTANTE: Vercel tiene limitaciones

Vercel es excelente para:
- ✅ **Frontend Astro** (sitio web público)
- ✅ **Admin Panel Next.js** (puede funcionar como Serverless Functions)

Vercel NO es ideal para:
- ❌ **Backend NestJS** (necesita servidor siempre activo)

### 🎯 OPCIONES DE DESPLIEGUE

#### **OPCIÓN 1: Todo en Vercel (Recomendado para empezar)**

**Frontend Astro:**
- ✅ Despliega fácilmente en Vercel
- ✅ Usa Serverless Functions para API routes si es necesario

**Admin Panel Next.js:**
- ✅ Despliega en Vercel como proyecto separado
- ✅ Usa Serverless Functions para API routes

**Backend NestJS:**
- ⚠️ Convierte a Serverless Functions o usa otro servicio
- ⚠️ O usa Vercel Edge Functions (limitado)

#### **OPCIÓN 2: Híbrido (Recomendado para producción)**

**Frontend Astro:** Vercel
**Admin Panel Next.js:** Vercel
**Backend NestJS:** Railway, Render, Fly.io, o DigitalOcean

---

## 🛠️ CÓMO DESPLEGAR CADA PARTE

### 1. **FRONTEND ASTRO (Puerto 4321) - Vercel**

**Ya está configurado:**
- ✅ `astro.config.mjs` tiene `adapter: vercel()`
- ✅ `output: 'server'` para Serverless Functions

**Pasos:**
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Selecciona la carpeta raíz del proyecto
4. Vercel detectará Astro automáticamente
5. Configura variables de entorno:
   ```
   SUPABASE_URL=tu_url_supabase
   SUPABASE_ANON_KEY=tu_key_supabase
   ```

**Resultado:** `https://tu-sitio.vercel.app`

---

### 2. **ADMIN PANEL (Puerto 3001) - Vercel**

**Configuración necesaria:**

1. **Crear `vercel.json` en `backend/admin-panel/`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_BACKEND_URL": "https://tu-backend.railway.app",
    "NEXT_PUBLIC_SUPABASE_URL": "tu_url_supabase",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "tu_key_supabase"
  }
}
```

2. **Desplegar:**
   - Ve a Vercel
   - Crea un nuevo proyecto
   - Selecciona la carpeta `backend/admin-panel`
   - Vercel detectará Next.js automáticamente
   - Configura las variables de entorno

**Resultado:** `https://admin-tu-sitio.vercel.app`

---

### 3. **BACKEND NESTJS (Puerto 3000) - Railway/Render**

**⚠️ Vercel NO es ideal para NestJS**

**Mejores opciones:**

#### **A) Railway (Recomendado - Más fácil)**

1. Ve a [railway.app](https://railway.app)
2. Conecta tu GitHub
3. Crea nuevo proyecto desde GitHub
4. Selecciona la carpeta `backend`
5. Railway detectará Node.js automáticamente
6. Configura variables de entorno:
   ```
   PORT=3000
   SUPABASE_URL=tu_url
   SUPABASE_ANON_KEY=tu_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_key
   CORS_ORIGIN=https://tu-sitio.vercel.app,https://admin-tu-sitio.vercel.app
   ```
7. Railway asignará una URL automáticamente

**Resultado:** `https://tu-backend.railway.app`

#### **B) Render (Alternativa)**

1. Ve a [render.com](https://render.com)
2. Crea nuevo "Web Service"
3. Conecta GitHub y selecciona carpeta `backend`
4. Configura:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Environment: Node
5. Configura variables de entorno
6. Render asignará una URL

**Resultado:** `https://tu-backend.onrender.com`

---

## 🔗 CONFIGURAR COMUNICACIÓN ENTRE APPS

### Después de desplegar, actualiza las URLs:

#### **1. Frontend Astro → Backend**

En `src/lib/api.ts` o donde hagas llamadas al backend:
```typescript
const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || 'https://tu-backend.railway.app';
```

#### **2. Admin Panel → Backend**

En `backend/admin-panel/lib/api.ts`:
```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://tu-backend.railway.app';
```

#### **3. Backend → CORS**

En `backend/src/main.ts`:
```typescript
const corsOrigin = process.env.CORS_ORIGIN || 'https://tu-sitio.vercel.app,https://admin-tu-sitio.vercel.app';
```

---

## 📁 ESTRUCTURA DEL REPOSITORIO

```
portfolio-site/
├── src/                    # Frontend Astro (Puerto 4321)
│   ├── pages/
│   ├── components/
│   └── ...
├── backend/
│   ├── src/                # Backend NestJS (Puerto 3000)
│   │   ├── modules/
│   │   └── ...
│   └── admin-panel/        # Admin Panel Next.js (Puerto 3001)
│       ├── app/
│       ├── components/
│       └── ...
├── public/
├── package.json            # Frontend Astro
└── astro.config.mjs
```

---

## 🎯 PLAN DE DESPLIEGUE PASO A PASO

### **FASE 1: Backend (Railway/Render)**

1. ✅ Crea cuenta en Railway o Render
2. ✅ Conecta GitHub
3. ✅ Despliega carpeta `backend`
4. ✅ Configura variables de entorno
5. ✅ Obtén URL del backend (ej: `https://tu-backend.railway.app`)

### **FASE 2: Frontend Astro (Vercel)**

1. ✅ Ve a Vercel
2. ✅ Conecta GitHub
3. ✅ Despliega carpeta raíz (donde está `astro.config.mjs`)
4. ✅ Configura variables de entorno:
   ```
   PUBLIC_BACKEND_URL=https://tu-backend.railway.app
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```
5. ✅ Obtén URL del frontend (ej: `https://tu-sitio.vercel.app`)

### **FASE 3: Admin Panel (Vercel)**

1. ✅ Ve a Vercel
2. ✅ Crea nuevo proyecto
3. ✅ Despliega carpeta `backend/admin-panel`
4. ✅ Configura variables de entorno:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://tu-backend.railway.app
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
5. ✅ Obtén URL del admin (ej: `https://admin-tu-sitio.vercel.app`)

### **FASE 4: Actualizar URLs**

1. ✅ Actualiza `CORS_ORIGIN` en backend con URLs de Vercel
2. ✅ Actualiza `PUBLIC_BACKEND_URL` en frontend con URL de Railway
3. ✅ Actualiza `NEXT_PUBLIC_BACKEND_URL` en admin con URL de Railway

---

## 💰 COSTOS ESTIMADOS

### **Vercel (Frontend + Admin):**
- ✅ **Gratis** para proyectos personales
- ✅ 100GB bandwidth/mes gratis
- ✅ Serverless Functions incluidas

### **Railway (Backend):**
- ✅ **$5/mes** para plan básico
- ✅ O **$0** con créditos gratis ($5/mes gratis)
- ✅ Incluye base de datos PostgreSQL si quieres

### **Render (Backend - Alternativa):**
- ✅ **Gratis** pero se duerme después de 15 min de inactividad
- ✅ **$7/mes** para plan que no se duerme

---

## ✅ CHECKLIST DE DESPLIEGUE

### **Backend:**
- [ ] Cuenta en Railway/Render creada
- [ ] Repositorio conectado
- [ ] Backend desplegado
- [ ] Variables de entorno configuradas
- [ ] URL del backend obtenida
- [ ] CORS configurado con URLs de frontend/admin

### **Frontend Astro:**
- [ ] Proyecto en Vercel creado
- [ ] Repositorio conectado
- [ ] Frontend desplegado
- [ ] Variables de entorno configuradas
- [ ] URL del backend configurada
- [ ] Wizard funciona correctamente

### **Admin Panel:**
- [ ] Proyecto en Vercel creado (separado)
- [ ] Repositorio conectado
- [ ] Admin desplegado
- [ ] Variables de entorno configuradas
- [ ] URL del backend configurada
- [ ] Autenticación funciona

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Error: CORS bloqueado**
- ✅ Verifica que `CORS_ORIGIN` en backend incluya todas las URLs de Vercel
- ✅ Formato: `https://sitio1.vercel.app,https://sitio2.vercel.app`

### **Error: Backend no responde**
- ✅ Verifica que Railway/Render esté corriendo
- ✅ Revisa logs en Railway/Render
- ✅ Verifica variables de entorno

### **Error: Variables de entorno no funcionan**
- ✅ En Vercel: Usa `PUBLIC_` para variables públicas en Astro
- ✅ En Next.js: Usa `NEXT_PUBLIC_` para variables públicas
- ✅ Reinicia el despliegue después de cambiar variables

---

## 📚 RECURSOS

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs
- **Astro Deployment:** https://docs.astro.build/en/guides/deploy/vercel/
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

## 🎯 RESUMEN RÁPIDO

1. **Frontend Astro (4321)** → Vercel ✅
2. **Admin Panel (3001)** → Vercel ✅
3. **Backend NestJS (3000)** → Railway/Render ✅
4. **Una sola repo** → Todo en el mismo repositorio ✅
5. **Configurar URLs** → Actualizar variables de entorno ✅

**¿Necesitas ayuda con algún paso específico?** 🚀
