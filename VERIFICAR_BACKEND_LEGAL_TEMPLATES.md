# 🔍 VERIFICACIÓN: Endpoint legal-templates

## ❌ Problema Actual

El endpoint `/api/legal-templates` retorna 404 aunque:
- ✅ La tabla `legal_templates` existe
- ✅ Hay 5 garantías en la base de datos
- ✅ El controller está corregido

**Causa probable:** El backend no se reinició después de cambiar el controller.

---

## ✅ Solución

### Paso 1: Reiniciar el Backend

**IMPORTANTE:** El backend DEBE reiniciarse para que los cambios en el controller tomen efecto.

```bash
# Detener el backend actual (Ctrl+C)
# Luego reiniciar:
cd backend
npm run start:dev
```

### Paso 2: Verificar que el Endpoint Funciona

Una vez reiniciado, prueba:

```bash
# Debería retornar las 5 garantías
curl http://localhost:3000/api/legal-templates
```

O en el navegador:
```
http://localhost:3000/api/legal-templates
```

### Paso 3: Verificar en el Admin Panel

1. Refresca la página `/admin/garantias`
2. Deberías ver las 5 garantías cargadas

---

## 🔍 Verificación de Rutas

### Rutas Esperadas:

- ✅ `GET /api/legal-templates` - Lista todas las garantías
- ✅ `GET /api/legal-templates?category=web` - Filtra por categoría
- ✅ `GET /api/legal-templates/default/web` - Obtiene garantía por defecto de web
- ✅ `GET /api/legal-templates/code/WEB-STD` - Obtiene por código

### Si Sigue Dando 404:

1. **Verifica que el módulo esté registrado:**
   ```typescript
   // backend/src/app.module.ts
   imports: [
     // ...
     LegalTemplatesModule, // ← Debe estar aquí
   ]
   ```

2. **Verifica que el controller esté correcto:**
   ```typescript
   // backend/src/modules/legal-templates/legal-templates.controller.ts
   @Controller('legal-templates') // ← Sin 'api/' al inicio
   ```

3. **Verifica que el prefijo global esté configurado:**
   ```typescript
   // backend/src/main.ts
   app.setGlobalPrefix('api'); // ← Debe estar aquí
   ```

---

## 🚨 Si Aún No Funciona

### Opción 1: Verificar Logs del Backend

Al iniciar el backend, deberías ver:
```
🚀 Backend API running on: http://localhost:3000/api
```

Si no ves esto, hay un problema con el inicio del backend.

### Opción 2: Probar Endpoint Directamente

```bash
# Desde la terminal
curl http://localhost:3000/api/legal-templates

# O desde el navegador
http://localhost:3000/api/legal-templates
```

### Opción 3: Verificar que el Módulo Esté Importado

```typescript
// backend/src/app.module.ts debe tener:
import { LegalTemplatesModule } from './modules/legal-templates/legal-templates.module';

@Module({
  imports: [
    // ... otros módulos
    LegalTemplatesModule, // ← Debe estar aquí
  ],
})
```

---

## ✅ Checklist

- [ ] Backend reiniciado después de cambiar el controller
- [ ] Módulo `LegalTemplatesModule` está en `app.module.ts`
- [ ] Controller tiene `@Controller('legal-templates')` (sin `api/`)
- [ ] `main.ts` tiene `app.setGlobalPrefix('api')`
- [ ] Endpoint `/api/legal-templates` responde (no 404)
- [ ] Las 5 garantías aparecen en `/admin/garantias`

---

**¿Aún no funciona?** Comparte:
1. Los logs del backend al iniciar
2. El resultado de `curl http://localhost:3000/api/legal-templates`
3. Si el módulo está en `app.module.ts`
