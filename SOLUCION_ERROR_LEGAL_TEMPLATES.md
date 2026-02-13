# 🔧 SOLUCIÓN: Error 404 en /api/legal-templates

## ❌ Problema

El endpoint `/api/legal-templates` retorna 404 (Not Found).

**Error:**
```
GET http://localhost:3000/api/legal-templates 404 (Not Found)
```

---

## ✅ Solución Aplicada

### 1. **Corregido el Controller**

**Problema:** El controller tenía `@Controller('api/legal-templates')` pero el `main.ts` ya tiene `app.setGlobalPrefix('api')`, causando una ruta duplicada: `/api/api/legal-templates`.

**Solución:** Cambiado a `@Controller('legal-templates')` para que la ruta final sea `/api/legal-templates`.

**Archivo:** `backend/src/modules/legal-templates/legal-templates.controller.ts`

```typescript
// ANTES:
@Controller('api/legal-templates')

// AHORA:
@Controller('legal-templates')
```

---

### 2. **Mejorado Manejo de Errores en GarantiasContent**

**Problema:** Si el endpoint falla, se muestra un alert genérico y no se indica claramente qué hacer.

**Solución:** 
- Manejo específico para errores 404 (tabla puede no existir)
- Mensajes más claros sobre qué hacer
- Indicadores visuales cuando no hay datos

**Archivo:** `backend/admin-panel/app/garantias/GarantiasContent.tsx`

---

## 🚀 Cómo Verificar

### Paso 1: Reiniciar Backend

```bash
cd backend
npm run start:dev
```

### Paso 2: Verificar Endpoint

```bash
# Debería retornar 200 OK (aunque esté vacío si no hay datos)
curl http://localhost:3000/api/legal-templates
```

### Paso 3: Verificar en Admin Panel

1. Ve a `/admin/garantias`
2. Deberías ver:
   - ✅ Garantías cargadas: X (en consola)
   - O un mensaje indicando que ejecutes el SQL

### Paso 4: Ejecutar Migración SQL (si no hay datos)

Si la tabla `legal_templates` no existe o está vacía:

```sql
-- En Supabase SQL Editor
-- Ejecutar: backend/database/migrations/add_professional_features.sql
```

Este script:
- Crea la tabla `legal_templates`
- Inserta garantías pre-escritas para:
  - Web
  - App
  - Sistema
  - Marketing
  - Combinado

---

## 🔍 Debugging

### Si las Garantías No Aparecen:

1. **Verifica en la consola del navegador:**
   ```
   ✅ Garantías cargadas: X
   ```

2. **Si dice 0 garantías:**
   - Verifica que la tabla existe:
     ```sql
     SELECT COUNT(*) FROM legal_templates;
     ```
   - Si no existe, ejecuta `add_professional_features.sql`
   - Si existe pero está vacía, el script debería haber insertado datos

3. **Verifica el backend:**
   ```bash
   # Debería retornar datos o array vacío
   curl http://localhost:3000/api/legal-templates
   ```

4. **Verifica categorías específicas:**
   ```bash
   curl http://localhost:3000/api/legal-templates?category=web
   curl http://localhost:3000/api/legal-templates?category=app
   ```

---

## 📝 Notas Importantes

1. **La Tabla Puede No Existir:**
   - Si es la primera vez que ejecutas el sistema, la tabla `legal_templates` puede no existir
   - Ejecuta `add_professional_features.sql` para crearla y poblarla

2. **Garantías Pre-escritas:**
   - El script SQL incluye garantías defensivas y profesionales
   - Todas incluyen el requisito de 50% de pago inicial
   - Se pueden editar después desde el admin panel

3. **Categorías Disponibles:**
   - `web`: Sitios web
   - `app`: Aplicaciones
   - `system`: Sistemas de gestión
   - `marketing`: Marketing digital
   - `combined`: Proyectos combinados

---

## ✅ Checklist

- [ ] Backend reiniciado
- [ ] Endpoint `/api/legal-templates` responde (200 o 404 es OK si no existe tabla)
- [ ] Tabla `legal_templates` existe en Supabase
- [ ] Script `add_professional_features.sql` ejecutado
- [ ] En `/admin/garantias` se muestran las garantías
- [ ] No hay errores en la consola del navegador

---

## 🎯 Próximos Pasos

1. **Si la tabla no existe:**
   - Ejecuta `add_professional_features.sql`
   - Verifica que se crearon las garantías

2. **Si la tabla existe pero está vacía:**
   - El script debería haber insertado datos
   - Verifica que el script se ejecutó completamente

3. **Si hay garantías pero no aparecen:**
   - Verifica el filtro de categoría
   - Verifica que `is_active = true`

---

**¿Aún no funciona?** Verifica:
1. El backend está corriendo
2. La tabla existe en Supabase
3. El script SQL se ejecutó correctamente
4. No hay errores de CORS
