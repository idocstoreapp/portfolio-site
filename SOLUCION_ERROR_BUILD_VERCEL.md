# ✅ SOLUCIÓN: Error de Build en Vercel

## ❌ Error

```
Type error: Cannot find name 'CostosReales'.
./app/diagnosticos/[id]/page.tsx:93:20
```

## 🔍 Causa

El path alias `@/components/proyectos/CostosReales` no se resuelve correctamente durante el build de producción en Vercel, aunque funciona en desarrollo local.

## ✅ Solución

Cambiar el import de path alias a ruta relativa:

**Antes:**
```typescript
import CostosReales from '@/components/proyectos/CostosReales';
```

**Después:**
```typescript
import CostosReales from '../../components/proyectos/CostosReales';
```

## 📝 Archivo Modificado

- `backend/admin-panel/app/diagnosticos/[id]/page.tsx`

## ✅ Verificación

Después del cambio:
1. Haz commit y push
2. Vercel debería hacer build exitosamente
3. El componente debería funcionar correctamente

---

## 🔧 Alternativa: Verificar tsconfig.json

Si prefieres mantener el path alias, verifica que `tsconfig.json` tenga:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Y que `next.config.ts` no esté sobrescribiendo los paths.

---

**Nota:** La solución con ruta relativa es más confiable para builds en producción.
