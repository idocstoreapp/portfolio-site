# 🔧 INSTRUCCIONES: INTEGRACIÓN FRONTEND-BACKEND

## ✅ Cambios Implementados

### 1. **Cliente API del Backend**
- ✅ Creado: `src/utils/backendClient.ts`
- Funciones: `createDiagnostic()`, `getDiagnostic()`, `getDiagnosticResult()`

### 2. **Página Dinámica de Resultado**
- ✅ Creado: `src/pages/diagnostico/[id].astro`
- Obtiene el diagnóstico del backend usando el ID
- Renderiza resultado personalizado

### 3. **Modificación del Wizard**
- ✅ Actualizado: `src/components/DiagnosticWizard.astro`
- Ahora llama al backend Nest.js en lugar del endpoint Astro
- Redirige a `/diagnostico/{id}` con el ID generado

### 4. **Configuración del Backend**
- ✅ Actualizado: `backend/src/main.ts`
- CORS configurado para `http://localhost:4322` (puerto de Astro)

---

## 🚀 PASOS PARA CONFIGURAR

### **Paso 1: Configurar Variables de Entorno**

#### Frontend (raíz del proyecto)
Crear o actualizar `.env.local`:
```env
PUBLIC_BACKEND_URL=http://localhost:3000
```

#### Backend (carpeta `backend/`)
Crear o actualizar `backend/.env`:
```env
CORS_ORIGIN=http://localhost:4322
PORT=3000
SUPABASE_URL=tu_supabase_url_aqui
SUPABASE_KEY=tu_supabase_key_aqui
```

### **Paso 2: Iniciar el Backend**

```bash
cd backend
npm install  # Si no has instalado las dependencias
npm run start:dev
```

Deberías ver:
```
🚀 Backend API running on: http://localhost:3000/api
```

### **Paso 3: Iniciar el Frontend**

En otra terminal:
```bash
npm run dev
```

Deberías ver:
```
Local: http://localhost:4322/
```

### **Paso 4: Probar el Flujo Completo**

1. Ir a `http://localhost:4322`
2. Hacer scroll hasta "Diagnóstico Estratégico"
3. Completar el wizard
4. Debería:
   - Llamar al backend
   - Guardar en Supabase
   - Redirigir a `/diagnostico/{id}`
   - Mostrar el resultado personalizado

---

## 🔍 VERIFICACIÓN

### **Verificar que el Backend Funciona**

Probar con curl o Postman:
```bash
curl -X POST http://localhost:3000/api/diagnostic \
  -H "Content-Type: application/json" \
  -d '{
    "tipoEmpresa": "restaurante",
    "nivelDigital": "basica",
    "objetivos": ["ventas"],
    "tamano": "6-20",
    "nombre": "Test User"
  }'
```

Deberías recibir:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "created_at": "...",
    "solucion_principal": "...",
    ...
  }
}
```

### **Verificar que el Frontend se Conecta**

1. Abrir DevTools (F12)
2. Ir a la pestaña "Network"
3. Completar el diagnóstico
4. Deberías ver:
   - `POST http://localhost:3000/api/diagnostic` (200 OK)
   - `GET http://localhost:3000/api/diagnostic/{id}` (200 OK)
   - `GET http://localhost:3000/api/diagnostic/{id}/result` (200 OK)

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Error: "Failed to fetch" o CORS**

**Problema**: El backend no acepta peticiones del frontend.

**Solución**:
1. Verificar que `CORS_ORIGIN` en `backend/.env` sea `http://localhost:4322`
2. Reiniciar el backend después de cambiar `.env`
3. Verificar que el backend esté corriendo en el puerto 3000

### **Error: "No se recibió ID del diagnóstico"**

**Problema**: El backend no está retornando el ID correctamente.

**Solución**:
1. Verificar que Supabase esté configurado correctamente
2. Verificar que la tabla `diagnosticos` exista en Supabase
3. Revisar los logs del backend para ver errores

### **Error: "Diagnostic with id X not found"**

**Problema**: El diagnóstico no se guardó en Supabase.

**Solución**:
1. Verificar las credenciales de Supabase en `backend/.env`
2. Verificar que la tabla `diagnosticos` tenga las columnas correctas
3. Revisar los logs del backend

### **La página dinámica no carga**

**Problema**: El endpoint `GET /api/diagnostic/:id/result` no funciona.

**Solución**:
1. Verificar que el backend esté corriendo
2. Probar el endpoint directamente: `http://localhost:3000/api/diagnostic/{id}/result`
3. Verificar que el ID sea válido (UUID)

---

## 📝 NOTAS IMPORTANTES

1. **El endpoint Astro antiguo** (`src/pages/api/diagnostico.ts`) ya no se usa, pero se mantiene como fallback. Puedes eliminarlo si todo funciona correctamente.

2. **La página estática** (`src/pages/diagnostico/resultado.astro`) ya no se usa, pero se mantiene por si acaso. Puedes eliminarla si todo funciona correctamente.

3. **El motor de diagnóstico** está duplicado:
   - `src/utils/diagnosticEngine.ts` (frontend - ya no se usa)
   - `backend/diagnostic-engine.ts` (backend - este es el que se usa ahora)

   Puedes eliminar el del frontend cuando confirmes que todo funciona.

---

## ✅ CHECKLIST FINAL

- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Frontend corriendo en `http://localhost:4322`
- [ ] Variables de entorno configuradas
- [ ] CORS configurado correctamente
- [ ] Supabase configurado y funcionando
- [ ] Probar flujo completo end-to-end
- [ ] Verificar que los diagnósticos se guarden en Supabase
- [ ] Verificar que la página dinámica cargue correctamente

---

## 🎯 PRÓXIMOS PASOS (Opcional)

1. **Eliminar código no usado**:
   - `src/pages/api/diagnostico.ts` (endpoint Astro antiguo)
   - `src/pages/diagnostico/resultado.astro` (página estática antigua)
   - `src/utils/diagnosticEngine.ts` (motor duplicado)

2. **Mejorar manejo de errores**:
   - Mostrar mensajes más amigables al usuario
   - Implementar retry logic
   - Agregar logging mejorado

3. **Optimizaciones**:
   - Cachear resultados del diagnóstico
   - Implementar loading states mejorados
   - Agregar analytics

