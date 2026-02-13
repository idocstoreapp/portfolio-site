# 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO

## 📋 Problemas Detectados y Soluciones

### ❌ Problema 1: Backend NestJS (localhost:3000) - 404 en `/`

**Esto es NORMAL.** El backend NestJS solo tiene endpoints en `/api/*`. 

**Para probar que funciona:**
```
GET http://localhost:3000/api/diagnostic
GET http://localhost:3000/api/solution-templates
GET http://localhost:3000/api/orders
```

### ❌ Problema 2: Admin Panel (localhost:3001) - Error de Supabase

**Solución:** Crear archivo `.env.local` en `backend/admin-panel/`

---

## 📁 UBICACIÓN DE ARCHIVOS .env

### 1. Backend NestJS
**Archivo:** `backend/.env`  
**Ubicación:** `C:\Users\Dell\Documents\portfolio-site\backend\.env`

**Variables necesarias:**
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4322,http://localhost:3001
```

### 2. Admin Panel Next.js
**Archivo:** `backend/admin-panel/.env.local`  
**Ubicación:** `C:\Users\Dell\Documents\portfolio-site\backend\admin-panel\.env.local`

**Variables necesarias:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## 🔑 DÓNDE OBTENER LAS VARIABLES DE SUPABASE

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Ahí encontrarás:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRETO, solo para backend)

---

## ✅ PASOS PARA CONFIGURAR

### Paso 1: Crear `.env` en Backend

1. Ve a la carpeta `backend/`
2. Crea un archivo llamado `.env` (sin extensión)
3. Copia el contenido de `backend/.env.example`
4. Completa con tus valores reales de Supabase

### Paso 2: Crear `.env.local` en Admin Panel

1. Ve a la carpeta `backend/admin-panel/`
2. Crea un archivo llamado `.env.local` (sin extensión)
3. Copia el contenido de `backend/admin-panel/.env.local.example`
4. Completa con tus valores reales

### Paso 3: Reiniciar Servidores

**Backend NestJS:**
```bash
cd backend
npm run start:dev
```

**Admin Panel:**
```bash
cd backend/admin-panel
npm run dev
```

---

## 🧪 VERIFICAR QUE FUNCIONA

### Backend NestJS (puerto 3000):
```bash
# Debería mostrar en consola:
🔍 Debug Supabase config:
  SUPABASE_URL: https://...
  SUPABASE_ANON_KEY: eyJ...
  SUPABASE_SERVICE_ROLE_KEY: eyJ...
🚀 Backend API running on: http://localhost:3000/api
```

### Admin Panel (puerto 3001):
- Debería abrir sin errores
- No debería mostrar el error de "Missing Supabase environment variables"

---

## ⚠️ IMPORTANTE

1. **NUNCA** subas archivos `.env` o `.env.local` a Git
2. Estos archivos ya deberían estar en `.gitignore`
3. **SUPABASE_SERVICE_ROLE_KEY** es SECRETO, solo para backend
4. **NEXT_PUBLIC_*** variables son públicas (se exponen en el frontend)

---

## 🔍 TROUBLESHOOTING

### Error: "Cannot find .env file"
- Verifica que el archivo esté en la ubicación correcta
- Verifica que no tenga extensión `.txt` (Windows a veces agrega esto)
- Reinicia el servidor después de crear el archivo

### Error: "Missing Supabase environment variables"
- Verifica que las variables estén escritas correctamente
- Verifica que no haya espacios extra
- Verifica que las URLs no tengan comillas

### Backend no lee las variables
- Verifica que el archivo esté en `backend/.env` (no en la raíz del proyecto)
- Reinicia el servidor completamente
- Verifica los logs de inicio del backend

---

## 📝 ESTRUCTURA DE CARPETAS CORRECTA

```
portfolio-site/
├── backend/
│   ├── .env                    ← AQUÍ (Backend NestJS)
│   ├── src/
│   └── ...
│
└── backend/
    └── admin-panel/
        ├── .env.local          ← AQUÍ (Admin Panel Next.js)
        ├── lib/
        └── ...
```

---

**Estado:** ✅ Archivos de ejemplo creados  
**Próximo paso:** Crear los archivos `.env` reales con tus valores de Supabase
