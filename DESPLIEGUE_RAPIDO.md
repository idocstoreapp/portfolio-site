# 🚀 GUÍA RÁPIDA DE DESPLIEGUE

## 📋 RESUMEN EJECUTIVO

Tu proyecto tiene **3 aplicaciones** que necesitas desplegar:

1. **Frontend Astro** (Puerto 4321) → **Vercel** ✅
2. **Admin Panel Next.js** (Puerto 3001) → **Vercel** ✅  
3. **Backend NestJS** (Puerto 3000) → **Railway** o **Render** ✅

**Todo en un solo repositorio** - No necesitas repos separados.

---

## 🎯 PASOS RÁPIDOS

### **1. BACKEND (Railway) - 10 minutos**

1. Ve a [railway.app](https://railway.app) y crea cuenta
2. Click "New Project" → "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Railway detectará automáticamente la carpeta `backend`
5. Configura variables de entorno:
   ```
   PORT=3000
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   CORS_ORIGIN=https://tu-sitio.vercel.app,https://admin-tu-sitio.vercel.app
   ```
6. Railway te dará una URL como: `https://tu-backend.up.railway.app`
7. **¡Copia esta URL!** La necesitarás para los siguientes pasos

---

### **2. FRONTEND ASTRO (Vercel) - 5 minutos**

1. Ve a [vercel.com](https://vercel.com) y crea cuenta
2. Click "Add New Project" → Conecta GitHub
3. Selecciona tu repositorio
4. **Root Directory:** Deja vacío (raíz del proyecto)
5. Vercel detectará Astro automáticamente
6. Configura variables de entorno:
   ```
   PUBLIC_BACKEND_URL=https://tu-backend.up.railway.app
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_ANON_KEY=tu_anon_key
   ```
7. Click "Deploy"
8. Vercel te dará una URL como: `https://tu-sitio.vercel.app`

---

### **3. ADMIN PANEL (Vercel) - 5 minutos**

1. En Vercel, click "Add New Project" otra vez
2. Selecciona el mismo repositorio
3. **Root Directory:** `backend/admin-panel`
4. Vercel detectará Next.js automáticamente
5. Configura variables de entorno:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://tu-backend.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```
6. Click "Deploy"
7. Vercel te dará una URL como: `https://admin-tu-sitio.vercel.app`

---

### **4. ACTUALIZAR CORS EN BACKEND - 2 minutos**

1. Ve a Railway → Tu proyecto backend
2. Ve a "Variables" tab
3. Actualiza `CORS_ORIGIN` con las URLs de Vercel:
   ```
   CORS_ORIGIN=https://tu-sitio.vercel.app,https://admin-tu-sitio.vercel.app
   ```
4. Railway reiniciará automáticamente

---

## ✅ VERIFICACIÓN

### **Frontend Astro:**
- ✅ Abre `https://tu-sitio.vercel.app`
- ✅ Deberías ver tu landing page
- ✅ El wizard debería funcionar

### **Admin Panel:**
- ✅ Abre `https://admin-tu-sitio.vercel.app`
- ✅ Deberías ver la página de login
- ✅ Inicia sesión y verifica que funcione

### **Backend:**
- ✅ Abre `https://tu-backend.up.railway.app`
- ✅ Deberías ver: `{"message":"Maestro Digital Backend API",...}`
- ✅ Abre `https://tu-backend.up.railway.app/api/diagnostic`
- ✅ Deberías ver respuesta (aunque sea error de autenticación, significa que funciona)

---

## 🔧 SOLUCIÓN DE PROBLEMAS RÁPIDOS

### **Error: CORS bloqueado**
- Verifica que `CORS_ORIGIN` en Railway incluya ambas URLs de Vercel
- Formato: `https://sitio1.vercel.app,https://sitio2.vercel.app` (sin espacios)

### **Error: Backend no responde**
- Ve a Railway → Logs
- Verifica que el build haya sido exitoso
- Verifica que todas las variables de entorno estén configuradas

### **Error: Variables no funcionan**
- En Vercel: Variables públicas deben empezar con `PUBLIC_` (Astro) o `NEXT_PUBLIC_` (Next.js)
- Reinicia el despliegue después de cambiar variables

### **Error: Admin Panel no encuentra backend**
- Verifica que `NEXT_PUBLIC_BACKEND_URL` tenga la URL completa de Railway
- Debe ser: `https://tu-backend.up.railway.app` (sin `/api` al final)

---

## 💰 COSTOS

- **Vercel:** Gratis para proyectos personales ✅
- **Railway:** $5/mes o $0 con créditos gratis ✅
- **Total:** ~$0-5/mes

---

## 📚 ARCHIVOS DE CONFIGURACIÓN CREADOS

He creado estos archivos para facilitar el despliegue:

1. ✅ `backend/admin-panel/vercel.json` - Configuración para Vercel
2. ✅ `backend/railway.json` - Configuración para Railway
3. ✅ `backend/render.yaml` - Configuración alternativa para Render

---

## 🎯 RESUMEN

```
┌─────────────────────────────────────────┐
│  TU ARQUITECTURA DESPLEGADA              │
└─────────────────────────────────────────┘

Frontend Astro (Vercel)
  ↓
  https://tu-sitio.vercel.app
  ↓
Backend NestJS (Railway)
  ↓
  https://tu-backend.up.railway.app
  ↓
Admin Panel (Vercel)
  ↓
  https://admin-tu-sitio.vercel.app
```

**Todo en un solo repositorio, desplegado en 20 minutos.** 🚀

---

¿Necesitas ayuda con algún paso específico? Revisa `ARQUITECTURA_Y_DESPLIEGUE_COMPLETO.md` para más detalles.
