# 🔧 SOLUCIÓN: Error de Políticas Duplicadas

## ❌ Error Encontrado

```
ERROR: 42710: policy "Admins can view pricing_config" for table "pricing_config" already exists
```

## ✅ Solución Aplicada

Se actualizó el archivo `add_professional_features.sql` para usar `DROP POLICY IF EXISTS` antes de crear cada política.

**Cambio realizado:**
- Antes: `CREATE POLICY "Admins can view pricing_config"...`
- Ahora: `DROP POLICY IF EXISTS "Admins can view pricing_config"...` seguido de `CREATE POLICY...`

Esto permite ejecutar la migración múltiples veces sin errores.

---

## 🚀 Cómo Aplicar la Corrección

### Opción 1: Ejecutar Solo las Políticas (Rápido)

Si ya ejecutaste la migración pero falló en las políticas, ejecuta solo esta parte en Supabase SQL Editor:

```sql
-- Políticas para pricing_config
DROP POLICY IF EXISTS "Admins can view pricing_config" ON pricing_config;
CREATE POLICY "Admins can view pricing_config" ON pricing_config
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert pricing_config" ON pricing_config;
CREATE POLICY "Admins can insert pricing_config" ON pricing_config
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update pricing_config" ON pricing_config;
CREATE POLICY "Admins can update pricing_config" ON pricing_config
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete pricing_config" ON pricing_config;
CREATE POLICY "Admins can delete pricing_config" ON pricing_config
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para legal_templates
DROP POLICY IF EXISTS "Anyone can view legal_templates" ON legal_templates;
CREATE POLICY "Anyone can view legal_templates" ON legal_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert legal_templates" ON legal_templates;
CREATE POLICY "Admins can insert legal_templates" ON legal_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update legal_templates" ON legal_templates;
CREATE POLICY "Admins can update legal_templates" ON legal_templates
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete legal_templates" ON legal_templates;
CREATE POLICY "Admins can delete legal_templates" ON legal_templates
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para change_orders
DROP POLICY IF EXISTS "Admins can view change_orders" ON change_orders;
CREATE POLICY "Admins can view change_orders" ON change_orders
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert change_orders" ON change_orders;
CREATE POLICY "Admins can insert change_orders" ON change_orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update change_orders" ON change_orders;
CREATE POLICY "Admins can update change_orders" ON change_orders
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete change_orders" ON change_orders;
CREATE POLICY "Admins can delete change_orders" ON change_orders
  FOR DELETE USING (auth.role() = 'authenticated');
```

### Opción 2: Ejecutar Migración Completa (Recomendado)

El archivo `add_professional_features.sql` ya está corregido. Puedes ejecutarlo completo de nuevo sin problemas.

---

## ✅ Verificación

Después de ejecutar, verifica que las políticas se crearon correctamente:

```sql
-- Ver políticas de pricing_config
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'pricing_config';

-- Ver políticas de legal_templates
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'legal_templates';

-- Ver políticas de change_orders
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'change_orders';
```

Deberías ver 4 políticas para cada tabla.

---

## 📝 Nota

El archivo `add_professional_features.sql` ya está actualizado con esta corrección. Si ejecutas la migración completa de nuevo, no deberías tener este error.
