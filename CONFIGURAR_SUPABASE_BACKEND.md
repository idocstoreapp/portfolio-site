# 🔧 CONFIGURAR SUPABASE PARA EL BACKEND

## ⚠️ PROBLEMA ACTUAL

El backend está fallando con este error:
```
Error: Supabase configuration is missing. Please check your .env file.
```

Esto significa que **falta el archivo `.env`** en la carpeta `backend/` o las variables de Supabase no están configuradas.

---

## ✅ SOLUCIÓN PASO A PASO

### **Paso 1: Crear el archivo `.env`**

1. Ve a la carpeta `backend/`:
```bash
cd backend
```

2. Crea el archivo `.env` (copia de `.env.example`):
```bash
# En Windows (PowerShell)
Copy-Item .env.example .env

# En Mac/Linux
cp .env.example .env
```

### **Paso 2: Obtener las Credenciales de Supabase**

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto (o créalo si no tienes uno)
3. Ve a **Settings** → **API**
4. Encontrarás:
   - **Project URL** → Esta es tu `SUPABASE_URL`
   - **anon public** key → Esta es tu `SUPABASE_ANON_KEY`
   - **service_role** key → Esta es tu `SUPABASE_SERVICE_ROLE_KEY` (⚠️ MANTÉN ESTA SECRETA)

### **Paso 3: Editar el archivo `.env`**

Abre `backend/.env` y completa los valores:

```env
PORT=3000
CORS_ORIGIN=http://localhost:4322

# ⚠️ REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO SUPABASE
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NODE_ENV=development
```

### **Paso 4: Crear las Tablas en Supabase**

1. Ve a tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Abre el archivo `backend/database/schema.sql`
4. Copia todo el contenido SQL
5. Pégalo en el SQL Editor de Supabase
6. Ejecuta el script (botón "Run")

Esto creará las tablas necesarias:
- `diagnosticos`
- `clientes`
- `proyectos`
- `usuarios_admin`

### **Paso 5: Reiniciar el Backend**

1. Detén el backend (Ctrl+C en la terminal)
2. Inicia de nuevo:
```bash
npm run start:dev
```

Deberías ver:
```
🚀 Backend API running on: http://localhost:3000/api
```

**Sin errores de Supabase.**

---

## 🔍 VERIFICACIÓN

### **Verificar que el Backend Funciona:**

1. Abre en tu navegador: `http://localhost:3000/api`
2. Deberías ver una respuesta (puede ser un error 404, pero significa que el servidor está corriendo)

### **Verificar que Supabase Está Configurado:**

1. El backend debería iniciar sin errores
2. No deberías ver: `Error: Supabase configuration is missing`

---

## 🆘 SI NO TIENES PROYECTO SUPABASE

### **Opción 1: Crear un Proyecto Nuevo (Recomendado)**

1. Ve a: https://supabase.com
2. Crea una cuenta (gratis)
3. Crea un nuevo proyecto
4. Espera a que se configure (2-3 minutos)
5. Obtén las credenciales (Settings → API)
6. Sigue los pasos anteriores

### **Opción 2: Usar Valores de Prueba (Solo para Desarrollo)**

Si solo quieres probar el diagnóstico sin guardar en Supabase, puedes modificar temporalmente el servicio para que sea opcional. Pero **NO es recomendado** para producción.

---

## 📝 ESTRUCTURA DEL ARCHIVO .env

El archivo `.env` debe verse así:

```env
# Servidor
PORT=3000
CORS_ORIGIN=http://localhost:4322
NODE_ENV=development

# Supabase (REQUERIDO)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk5OTk5OSwiZXhwIjoxOTYxNTc1OTk5fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1OTk5OTk5LCJleHAiOjE5NjE1NzU5OTl9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ⚠️ IMPORTANTE

- **NUNCA** subas el archivo `.env` a Git (ya está en `.gitignore`)
- **NUNCA** compartas tu `SUPABASE_SERVICE_ROLE_KEY` públicamente
- El `SUPABASE_SERVICE_ROLE_KEY` tiene permisos completos, mantenlo seguro

---

## ✅ CHECKLIST

- [ ] Archivo `.env` creado en `backend/`
- [ ] `SUPABASE_URL` configurado
- [ ] `SUPABASE_ANON_KEY` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
- [ ] Tablas creadas en Supabase (ejecutado `schema.sql`)
- [ ] Backend reiniciado
- [ ] Backend inicia sin errores
- [ ] Mensaje visible: `🚀 Backend API running on: http://localhost:3000/api`

---

**Una vez completado, el diagnóstico debería funcionar correctamente.**

