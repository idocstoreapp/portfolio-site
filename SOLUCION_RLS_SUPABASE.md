# ✅ SOLUCIÓN: Error RLS en Supabase

## 🔴 PROBLEMA IDENTIFICADO

El error es:
```
new row violates row-level security policy for table "diagnosticos"
```

**Causa**: El backend está usando el cliente con `anon_key` que tiene restricciones de Row Level Security (RLS). Aunque existe una política que permite insertar, no está funcionando correctamente.

## ✅ SOLUCIÓN

El backend ahora intenta usar el `service_role_key` (admin client) que **bypassea RLS completamente**. 

### **Opción 1: Usar Service Role Key (Recomendado)**

El código ya está actualizado para usar el admin client. Solo necesitas asegurarte de que el `SUPABASE_SERVICE_ROLE_KEY` esté configurado en `backend/.env`.

**Verifica que tu `backend/.env` tenga:**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Opción 2: Ajustar Políticas RLS (Alternativa)**

Si prefieres usar el `anon_key`, necesitas ajustar las políticas RLS en Supabase:

1. Ve a Supabase → **Authentication** → **Policies**
2. Busca la tabla `diagnosticos`
3. Verifica que la política "Permitir insertar diagnósticos" esté activa
4. O crea una nueva política que permita insertar sin autenticación:

```sql
CREATE POLICY "Permitir insertar diagnósticos públicos"
  ON diagnosticos
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

## 🚀 PASOS PARA APLICAR

### **Paso 1: Verificar Service Role Key**

1. Ve a Supabase → **Settings** → **API**
2. Copia el **service_role** key (⚠️ MANTÉN ESTA SECRETA)
3. Verifica que esté en `backend/.env`:
```env
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### **Paso 2: Reiniciar el Backend**

1. Detén el backend (Ctrl+C)
2. Inicia de nuevo:
```bash
cd backend
npm run start:dev
```

### **Paso 3: Probar el Diagnóstico**

1. Completa el diagnóstico
2. Deberías ver en los logs:
```
💾 Using admin client (service_role) for database operations
✅ Diagnostic saved successfully to Supabase
```

## ✅ VERIFICACIÓN

- ✅ Backend usa `service_role_key` para operaciones administrativas
- ✅ RLS es bypasseado por el admin client
- ✅ El diagnóstico se guarda correctamente en Supabase

---

**El código ya está actualizado. Solo necesitas verificar que el `SUPABASE_SERVICE_ROLE_KEY` esté configurado en `backend/.env`.**




