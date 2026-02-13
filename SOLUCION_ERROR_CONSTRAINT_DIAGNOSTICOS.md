# 🔧 SOLUCIÓN: Error de Constraint en update_diagnostic_states.sql

## ❌ Problema

Al ejecutar `update_diagnostic_states.sql`, se obtiene el error:

```
ERROR: 23514: check constraint "diagnosticos_estado_check" of relation "diagnosticos" is violated by some row
```

**Causa:** El script intentaba aplicar el nuevo constraint ANTES de actualizar los datos existentes, causando que filas con estados antiguos (`nuevo`, `cotizando`, `proyecto`, `cerrado`) violaran el nuevo constraint.

---

## ✅ Solución Aplicada

### Orden Correcto de Operaciones:

1. **Eliminar constraint existente** (permite modificar datos)
2. **Actualizar TODOS los datos existentes** (asegura que cumplan con el nuevo constraint)
3. **Aplicar nuevo constraint** (ahora todos los datos son válidos)
4. **Actualizar valor por defecto**
5. **Agregar comentario**

---

## 📋 Cambios en el Script

### ANTES (Incorrecto):
```sql
-- 1. Eliminar constraint
ALTER TABLE diagnosticos DROP CONSTRAINT IF EXISTS diagnosticos_estado_check;

-- 2. Aplicar nuevo constraint (❌ FALLA aquí si hay datos antiguos)
ALTER TABLE diagnosticos ADD CONSTRAINT diagnosticos_estado_check 
  CHECK (estado IN ('contactado', 'aprobado', 'rechazado', 'no_contesto'));

-- 3. Actualizar datos (❌ Ya es demasiado tarde)
UPDATE diagnosticos SET estado = 'contactado' WHERE estado IN ('nuevo', 'cotizando');
```

### AHORA (Correcto):
```sql
-- 1. Eliminar constraint
ALTER TABLE diagnosticos DROP CONSTRAINT IF EXISTS diagnosticos_estado_check;

-- 2. Actualizar TODOS los datos primero
UPDATE diagnosticos SET estado = 'contactado' WHERE estado IN ('nuevo', 'cotizando');
UPDATE diagnosticos SET estado = 'aprobado' WHERE estado = 'proyecto';
UPDATE diagnosticos SET estado = 'rechazado' WHERE estado = 'cerrado' AND notas ILIKE '%rechaz%';
-- ... etc

-- 3. Aplicar nuevo constraint (✅ Ahora todos los datos son válidos)
ALTER TABLE diagnosticos ADD CONSTRAINT diagnosticos_estado_check 
  CHECK (estado IN ('contactado', 'aprobado', 'rechazado', 'no_contesto'));
```

---

## 🚀 Cómo Aplicar

### Paso 1: Ejecutar el Script Corregido

```sql
-- En Supabase SQL Editor
-- Ejecutar: backend/database/migrations/update_diagnostic_states.sql
```

### Paso 2: Verificar que Funcionó

```sql
-- Verificar estados actuales
SELECT estado, COUNT(*) 
FROM diagnosticos 
GROUP BY estado;

-- Deberías ver solo: contactado, aprobado, rechazado, no_contesto
```

### Paso 3: Verificar Constraint

```sql
-- Verificar que el constraint existe
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'diagnosticos'::regclass 
AND conname = 'diagnosticos_estado_check';

-- Deberías ver: CHECK (estado IN ('contactado', 'aprobado', 'rechazado', 'no_contesto'))
```

---

## 🔍 Mapeo de Estados

| Estado Anterior | Estado Nuevo | Condición |
|----------------|--------------|-----------|
| `nuevo` | `contactado` | Siempre |
| `cotizando` | `contactado` | Siempre |
| `proyecto` | `aprobado` | Siempre |
| `cerrado` | `rechazado` | Si notas contienen "rechaz" |
| `cerrado` | `no_contesto` | Si notas contienen "no contest" o "no respond" |
| `cerrado` | `rechazado` | Por defecto (si no cumple otras condiciones) |
| Cualquier otro | `contactado` | Por defecto |

---

## ⚠️ Si Aún Falla

### Opción 1: Verificar Datos Antes de Actualizar

```sql
-- Ver qué estados existen actualmente
SELECT DISTINCT estado FROM diagnosticos;

-- Ver cuántos registros hay de cada estado
SELECT estado, COUNT(*) 
FROM diagnosticos 
GROUP BY estado;
```

### Opción 2: Actualizar Manualmente Estados Problemáticos

Si hay estados que no reconoces, actualízalos manualmente:

```sql
-- Ver registros con estados desconocidos
SELECT id, estado, notas 
FROM diagnosticos 
WHERE estado NOT IN ('nuevo', 'cotizando', 'proyecto', 'cerrado', 'contactado', 'aprobado', 'rechazado', 'no_contesto');

-- Actualizar manualmente según corresponda
UPDATE diagnosticos 
SET estado = 'contactado' 
WHERE estado = 'estado_desconocido';
```

### Opción 3: Ejecutar Paso a Paso

Si el script completo falla, ejecuta paso a paso:

```sql
-- 1. Eliminar constraint
ALTER TABLE diagnosticos DROP CONSTRAINT IF EXISTS diagnosticos_estado_check;

-- 2. Verificar datos actuales
SELECT estado, COUNT(*) FROM diagnosticos GROUP BY estado;

-- 3. Actualizar datos (uno por uno)
UPDATE diagnosticos SET estado = 'contactado' WHERE estado IN ('nuevo', 'cotizando');
UPDATE diagnosticos SET estado = 'aprobado' WHERE estado = 'proyecto';
-- ... etc

-- 4. Verificar que todos los datos están actualizados
SELECT estado, COUNT(*) FROM diagnosticos GROUP BY estado;

-- 5. Aplicar constraint
ALTER TABLE diagnosticos ADD CONSTRAINT diagnosticos_estado_check 
  CHECK (estado IN ('contactado', 'aprobado', 'rechazado', 'no_contesto'));
```

---

## ✅ Checklist

- [ ] Script ejecutado sin errores
- [ ] Solo existen estados: `contactado`, `aprobado`, `rechazado`, `no_contesto`
- [ ] Constraint aplicado correctamente
- [ ] Valor por defecto actualizado a `contactado`
- [ ] Comentario agregado a la columna

---

**¿Aún tienes problemas?** Ejecuta las queries de verificación y comparte los resultados.
