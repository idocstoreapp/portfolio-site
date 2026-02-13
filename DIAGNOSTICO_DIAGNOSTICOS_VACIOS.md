# 🔍 DIAGNÓSTICO: No aparecen diagnósticos (0 diagnósticos)

## 🔴 PROBLEMA

El admin panel muestra "0 diagnósticos" aunque debería haber algunos.

## ✅ SOLUCIONES PASO A PASO

### **Paso 1: Verificar que el backend use SERVICE_ROLE_KEY**

El backend necesita `SUPABASE_SERVICE_ROLE_KEY` para leer diagnósticos sin restricciones RLS.

**Verifica tu `backend/.env`:**
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui  ← ESTA ES CRÍTICA
```

**Dónde obtenerla:**
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia el **service_role** key (⚠️ SECRETO)

---

### **Paso 2: Verificar logs del backend**

Cuando el backend inicia, deberías ver:

```
🔍 Debug Supabase config:
  SUPABASE_URL: https://...
  SUPABASE_ANON_KEY: eyJ...
  SUPABASE_SERVICE_ROLE_KEY: eyJ...  ← Debe aparecer
💾 Using admin client (service_role) for fetching diagnostics - RLS bypassed
```

**Si ves:**
```
⚠️  Service role key not configured. Using anon client - RLS restrictions apply
```

**Significa que:** No tienes `SUPABASE_SERVICE_ROLE_KEY` configurado.

---

### **Paso 3: Probar el endpoint directamente**

Abre en tu navegador o usa Postman:

```
GET http://localhost:3000/api/diagnostic
```

**Debería devolver:**
```json
{
  "data": [...],
  "total": X,
  "page": 1,
  "limit": 20
}
```

**Si devuelve error o `total: 0`:**
- Verifica los logs del backend para ver qué cliente está usando
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté en `.env`

---

### **Paso 4: Verificar que haya diagnósticos en Supabase**

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Table Editor** → **diagnosticos**
4. Verifica si hay filas en la tabla

**Si NO hay filas:**
- Nadie ha completado el wizard aún
- O el wizard no está guardando correctamente

**Si SÍ hay filas pero el backend no las ve:**
- Problema de RLS o configuración del backend

---

### **Paso 5: Ejecutar script de prueba**

He creado un script para probar la conexión:

```bash
cd backend
npx ts-node scripts/test-diagnostics.ts
```

**O si tienes TypeScript compilado:**
```bash
cd backend
npm run build
node dist/scripts/test-diagnostics.js
```

Este script te dirá:
- ✅ Si la conexión funciona
- ✅ Cuántos diagnósticos hay
- ✅ Si el service_role_key está configurado
- ✅ Si hay problemas de RLS

---

### **Paso 6: Verificar políticas RLS en Supabase**

Si el problema persiste, verifica las políticas RLS:

1. Ve a Supabase → **Authentication** → **Policies**
2. Busca la tabla `diagnosticos`
3. Verifica que existan estas políticas:
   - ✅ "Permitir insertar diagnósticos" (para INSERT)
   - ✅ "Admin puede leer diagnósticos" (para SELECT)

**Nota:** El `service_role_key` debería bypasear RLS automáticamente, pero si hay problemas, estas políticas ayudan.

---

## 🔧 SOLUCIÓN RÁPIDA

### **Si no tienes `SUPABASE_SERVICE_ROLE_KEY`:**

1. Ve a Supabase → Settings → API
2. Copia el **service_role** key
3. Agrega a `backend/.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Reinicia el backend:
   ```bash
   cd backend
   # Ctrl+C para detener
   npm run start:dev
   ```

### **Si ya tienes `SUPABASE_SERVICE_ROLE_KEY` pero sigue sin funcionar:**

1. Verifica que no haya espacios extra en `.env`
2. Verifica que la URL y las keys sean correctas
3. Reinicia el backend completamente
4. Verifica los logs del backend al hacer GET `/api/diagnostic`

---

## 📊 VERIFICACIÓN FINAL

Después de aplicar los cambios:

1. ✅ Backend muestra: "💾 Using admin client (service_role)"
2. ✅ `GET http://localhost:3000/api/diagnostic` devuelve datos
3. ✅ Admin panel muestra los diagnósticos correctamente

---

## 🆘 SI NADA FUNCIONA

1. Ejecuta el script de prueba: `npx ts-node scripts/test-diagnostics.ts`
2. Comparte los logs del backend cuando haces GET `/api/diagnostic`
3. Verifica en Supabase Dashboard si realmente hay filas en `diagnosticos`

---

**Estado:** ✅ Script de diagnóstico creado  
**Próximo paso:** Ejecutar el script y verificar la configuración
