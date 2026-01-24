# ✅ SOLUCIÓN: Backend No Inicia por Falta de Supabase

## 🔴 PROBLEMA

El backend está fallando con:
```
Error: Supabase configuration is missing. Please check your .env file.
```

## ✅ SOLUCIÓN RÁPIDA

### **Paso 1: El archivo `.env` ya está creado**

El archivo `backend/.env` ya existe, pero necesita tus credenciales de Supabase.

### **Paso 2: Obtener Credenciales de Supabase**

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto (o créalo si no tienes uno)
3. Ve a **Settings** → **API**
4. Copia estos valores:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### **Paso 3: Editar `backend/.env`**

Abre `backend/.env` y reemplaza estos valores:

```env
PORT=3000
CORS_ORIGIN=http://localhost:4322
NODE_ENV=development

# ⚠️ REEMPLAZA ESTOS VALORES:
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Paso 4: Crear Tablas en Supabase**

1. Ve a Supabase → **SQL Editor**
2. Abre `backend/database/schema.sql`
3. Copia todo el SQL
4. Pégalo en el SQL Editor
5. Ejecuta (botón "Run")

### **Paso 5: Reiniciar el Backend**

1. Detén el backend (Ctrl+C)
2. Inicia de nuevo:
```bash
cd backend
npm run start:dev
```

Deberías ver:
```
🚀 Backend API running on: http://localhost:3000/api
```

**Sin errores.**

---

## 🎯 VERIFICACIÓN

✅ Backend inicia sin errores
✅ Mensaje: `🚀 Backend API running on: http://localhost:3000/api`
✅ El diagnóstico funciona correctamente

---

## 📝 Si No Tienes Proyecto Supabase

1. Ve a: https://supabase.com
2. Crea cuenta (gratis)
3. Crea nuevo proyecto
4. Espera 2-3 minutos
5. Obtén credenciales (Settings → API)
6. Sigue los pasos anteriores

---

**Una vez configurado, el diagnóstico funcionará correctamente.**




