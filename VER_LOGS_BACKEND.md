# 🔍 CÓMO VER LOS LOGS DEL BACKEND

## ⚠️ PROBLEMA ACTUAL

El diagnóstico está fallando con error **500 (Internal Server Error)**. Necesitamos ver los logs del backend para identificar el problema exacto.

## 📋 PASOS PARA VER LOS LOGS

### **Paso 1: Ve a la Terminal del Backend**

Busca la terminal donde está corriendo el backend Nest.js. Deberías ver algo como:
```
🚀 Backend API running on: http://localhost:3000/api
```

### **Paso 2: Completa el Diagnóstico**

1. Ve al diagnóstico en el navegador
2. Completa todos los pasos
3. Haz clic en "Ver mi resultado"

### **Paso 3: Revisa los Logs del Backend**

Inmediatamente después de hacer clic, deberías ver en la terminal del backend:

```
📥 POST /api/diagnostic - Request received
📥 Request body: {...}
🔄 Calling diagnosticService.createDiagnostic...
🔄 DiagnosticService.createDiagnostic - Starting...
🔄 Input DTO: {...}
🔄 Normalized answers: {...}
🔄 Processing diagnostic with engine...
```

**Si hay un error, verás:**
```
❌ Error creating diagnostic: ...
❌ Error message: ...
❌ Error stack: ...
```

## 🔍 QUÉ BUSCAR EN LOS LOGS

### **Si ves "NOT FOUND" en las variables de Supabase:**
```
🔍 Debug Supabase config:
  SUPABASE_URL: NOT FOUND
  SUPABASE_ANON_KEY: NOT FOUND
```
**Solución**: El archivo `.env` no se está leyendo correctamente.

### **Si ves un error de Supabase:**
```
❌ Error saving to Supabase: ...
❌ Error details: {...}
```
**Solución**: Revisa el error específico (puede ser que falte una tabla, un campo, etc.)

### **Si ves un error del motor de diagnóstico:**
```
❌ Error in createDiagnostic service: ...
```
**Solución**: Revisa el stack trace para ver dónde falla.

## 📝 COMPARTE LOS LOGS

**Copia y pega aquí los logs completos** que aparecen en la terminal del backend cuando intentas crear el diagnóstico. Esto me ayudará a identificar el problema exacto.

---

**Los logs son la clave para resolver el problema. Sin ellos, no puedo saber qué está fallando exactamente.**




