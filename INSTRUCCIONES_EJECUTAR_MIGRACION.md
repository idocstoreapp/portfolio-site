# 📋 INSTRUCCIONES: Ejecutar Migración SQL

## 🎯 MIGRACIÓN A EJECUTAR

**Archivo:** `backend/database/migrations/improve_solution_templates_structure.sql`

---

## 📝 PASOS PARA EJECUTAR

### **1. Abrir Supabase SQL Editor**

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Click en **"SQL Editor"** en el menú lateral
3. Click en **"New query"**

### **2. Copiar y Ejecutar la Migración**

1. Abre el archivo: `backend/database/migrations/improve_solution_templates_structure.sql`
2. Copia TODO el contenido
3. Pega en el SQL Editor de Supabase
4. Click en **"Run"** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### **3. Verificar Resultados**

Después de ejecutar, deberías ver:
- ✅ Mensaje de éxito
- ✅ Tablas creadas/actualizadas
- ✅ Datos insertados

---

## ✅ VERIFICACIÓN

### **Verificar Campos Nuevos:**

```sql
-- Ver estructura de solution_templates
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'solution_templates'
ORDER BY ordinal_position;
```

Deberías ver los nuevos campos:
- `description_detailed`
- `features_list`
- `is_prefabricated`
- `estimated_delivery_days`
- etc.

### **Verificar Tabla pricing_rules:**

```sql
-- Ver reglas de pricing
SELECT rule_type, rule_name, base_price, unit 
FROM pricing_rules 
WHERE is_active = true 
ORDER BY rule_type, rule_name;
```

Deberías ver múltiples reglas de pricing.

### **Verificar Templates Actualizados:**

```sql
-- Ver templates con nuevas descripciones
SELECT name, is_prefabricated, estimated_delivery_days, 
       jsonb_array_length(features_list) as features_count
FROM solution_templates 
WHERE is_active = true;
```

---

## 🚨 SI HAY ERRORES

### **Error: "column already exists"**

Si algunos campos ya existen, la migración usa `ADD COLUMN IF NOT EXISTS`, así que debería funcionar. Si aún hay error, puedes ejecutar solo las partes que faltan.

### **Error: "table already exists"**

Si la tabla `pricing_rules` ya existe, puedes omitir esa parte o usar `CREATE TABLE IF NOT EXISTS`.

### **Error: "duplicate key"**

Si hay datos duplicados en `pricing_rules`, la migración usa `ON CONFLICT DO NOTHING`, así que debería funcionar.

---

## 📋 DESPUÉS DE EJECUTAR

1. ✅ Reinicia el backend
2. ✅ Verifica que compile sin errores
3. ✅ Prueba crear una orden desde diagnóstico
4. ✅ Verifica que el PDF muestre la solución seleccionada

---

**¿Listo para ejecutar?** 🚀
