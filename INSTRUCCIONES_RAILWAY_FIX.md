# 🔧 INSTRUCCIONES: Arreglar Railway Deploy

## 🚨 PROBLEMA

Railway está ejecutando `npm run start:prod` pero el archivo `dist/main` no existe porque el build no se ejecuta.

## ✅ SOLUCIONES IMPLEMENTADAS

1. ✅ **`nixpacks.toml`** creado - Configuración explícita para Railway
2. ✅ **`Dockerfile`** mejorado - Multi-stage build para producción
3. ✅ **`railway.json`** actualizado - Usa `npm ci` en lugar de `npm install`

## 🚀 PASOS PARA ARREGLAR EN RAILWAY

### **Opción 1: Usar Nixpacks (Recomendado)**

1. **En Railway Dashboard:**
   - Ve a tu proyecto
   - Settings → Service
   - Verifica que **Root Directory** sea `backend/`
   - Verifica que **Builder** sea `NIXPACKS`

2. **Verificar que `nixpacks.toml` esté en el repositorio:**
   ```bash
   git add backend/nixpacks.toml
   git commit -m "Add nixpacks.toml for Railway"
   git push
   ```

3. **Railway debería detectar automáticamente `nixpacks.toml` y:**
   - Ejecutar `npm ci`
   - Ejecutar `npm run build`
   - Ejecutar `npm run start:prod`

### **Opción 2: Usar Dockerfile**

Si Nixpacks no funciona:

1. **En Railway Dashboard:**
   - Settings → Service
   - Cambiar **Builder** a `DOCKERFILE`
   - Verificar que **Root Directory** sea `backend/`

2. **Railway usará el `Dockerfile` que:**
   - Compila el código en un stage de build
   - Copia solo los archivos necesarios a producción
   - Ejecuta `node dist/main` directamente

### **Opción 3: Configuración Manual**

Si ninguna de las anteriores funciona:

1. **En Railway Dashboard:**
   - Settings → Deploy
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node dist/main`

2. **Verificar variables de entorno:**
   - `PORT` (Railway lo asigna automáticamente)
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CORS_ORIGIN`

## 🔍 VERIFICACIÓN

Después de hacer push, verifica en Railway:

### **Build Logs deben mostrar:**
```
Running: npm ci
Running: npm run build
✓ Build completed successfully
✓ dist/main.js exists
```

### **Deploy Logs deben mostrar:**
```
Starting: node dist/main
[Nest] Starting Nest application...
[Nest] Application successfully started
```

## ⚠️ SI SIGUE FALLANDO

1. **Verificar logs de build:**
   - Buscar errores de compilación TypeScript
   - Verificar que todas las dependencias estén instaladas

2. **Verificar Root Directory:**
   - Debe ser `backend/` (no la raíz del repo)

3. **Verificar que el build funcione localmente:**
   ```bash
   cd backend
   npm ci
   npm run build
   ls dist/main.js  # Debe existir
   ```

4. **Forzar redeploy:**
   - En Railway Dashboard → Deployments
   - Click en "Redeploy"

## 📋 CHECKLIST

- [x] `nixpacks.toml` creado
- [x] `Dockerfile` mejorado
- [x] `railway.json` actualizado
- [ ] Verificar Root Directory en Railway
- [ ] Hacer commit y push
- [ ] Verificar logs de build en Railway
- [ ] Verificar que el servicio esté corriendo
