# 📋 MIGRACIÓN: Mejoras Profesionales del Sistema

## 🎯 OBJETIVO

Agregar funcionalidades profesionales críticas:
1. Sistema de configuración de precios
2. Sistema de Change Orders
3. Garantías y términos legales pre-escritos
4. Scope freeze y aprobaciones
5. Límites cuantificables

---

## 📝 ARCHIVO DE MIGRACIÓN

**Archivo:** `backend/database/migrations/add_professional_features.sql`

---

## 🗄️ TABLAS CREADAS

### 1. `pricing_config`
Configuración de precios para templates, módulos y servicios.

**Tipos de precio:**
- `template` - Precio de un solution_template
- `module` - Precio de un solution_module
- `customization_hour` - Precio por hora de personalización
- `revision` - Precio por revisión adicional
- `support_hour` - Precio por hora de soporte
- `maintenance_month` - Precio por mes de mantenimiento

---

### 2. `legal_templates`
Plantillas de garantías y términos legales pre-escritos.

**Categorías:**
- `web` - Páginas web
- `app` - Aplicaciones web
- `system` - Sistemas de gestión
- `marketing` - Marketing digital
- `combined` - Combinado
- `custom` - Personalizado

**Plantillas incluidas:**
- `web-basic` - Garantía Web Básica (30 días)
- `app-standard` - Garantía App Web Estándar (60 días)
- `system-enterprise` - Garantía Sistema Empresarial (90 días)
- `marketing-basic` - Garantía Marketing Digital (30 días)
- `combined-standard` - Garantía Proyecto Combinado (60 días)

---

### 3. `change_orders`
Órdenes de cambio para modificaciones fuera del scope original.

**Estados:**
- `pending` - Pendiente de aprobación
- `approved` - Aprobado por cliente
- `rejected` - Rechazado por cliente
- `in_progress` - En desarrollo
- `completed` - Completado
- `cancelled` - Cancelado

---

## 🔧 CAMPOS AGREGADOS A `orders`

- `scope_approved_at` - Fecha de aprobación del scope
- `scope_approved_by` - Usuario que aprobó el scope
- `scope_frozen` - Si el scope está congelado
- `revisiones_incluidas` - Número de revisiones incluidas (default: 2)
- `revisiones_usadas` - Número de revisiones usadas (default: 0)
- `customization_hours_included` - Horas de personalización incluidas
- `customization_hours_used` - Horas de personalización usadas
- `customization_hour_rate` - Precio por hora de personalización adicional
- `legal_template_id` - Referencia a plantilla legal

---

## 📊 DATOS INICIALES

### Precios por Defecto:
- Personalización: $50,000 CLP/hora
- Revisión adicional: $50,000 CLP
- Soporte: $40,000 CLP/hora
- Mantenimiento: $100,000 CLP/mes

### Plantillas Legales:
- 5 plantillas pre-configuradas por categoría
- Cada una con garantías, mantenimiento y exclusiones específicas

---

## 🚀 CÓMO APLICAR LA MIGRACIÓN

### Opción 1: Desde Supabase Dashboard

1. Ve a tu proyecto en Supabase
2. Abre el SQL Editor
3. Copia y pega el contenido de `add_professional_features.sql`
4. Ejecuta el script

### Opción 2: Desde Terminal

```bash
# Conecta a tu base de datos PostgreSQL
psql -h [TU_HOST] -U [TU_USUARIO] -d [TU_DATABASE]

# Ejecuta el script
\i backend/database/migrations/add_professional_features.sql
```

---

## ✅ VERIFICACIÓN

Después de aplicar la migración, verifica:

1. **Tablas creadas:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pricing_config', 'legal_templates', 'change_orders');
```

2. **Plantillas legales:**
```sql
SELECT code, name, category FROM legal_templates;
```

3. **Precios por defecto:**
```sql
SELECT price_type, base_price, currency FROM pricing_config;
```

4. **Campos agregados a orders:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('scope_approved_at', 'revisiones_incluidas', 'customization_hours_included');
```

---

## 🔒 SEGURIDAD (RLS)

Todas las nuevas tablas tienen Row Level Security habilitado:

- **pricing_config:** Solo admins pueden ver/editar
- **legal_templates:** Todos pueden leer, solo admins pueden editar
- **change_orders:** Solo admins pueden ver/editar

---

## 📚 PRÓXIMOS PASOS

Después de aplicar la migración:

1. ✅ Reinicia el backend para cargar los nuevos módulos
2. ✅ Verifica que las APIs funcionen correctamente
3. ✅ Usa las plantillas legales al crear órdenes
4. ✅ Configura los precios desde `/admin/precios`
5. ✅ Crea Change Orders cuando sea necesario

---

## ⚠️ NOTAS IMPORTANTES

- Esta migración **NO modifica** tablas existentes destructivamente
- Solo **agrega** nuevas tablas y campos
- Los datos existentes **NO se afectan**
- Es seguro ejecutar múltiples veces (usa `IF NOT EXISTS`)

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "relation already exists"
- Las tablas ya existen, puedes ignorar este error
- O elimina las tablas y vuelve a ejecutar

### Error: "column already exists"
- Los campos ya existen en `orders`
- Puedes ignorar estos errores

### Error: "duplicate key value"
- Los datos iniciales ya existen
- Puedes ignorar estos errores

---

**¿Problemas?** Revisa los logs del backend y verifica que Supabase esté configurado correctamente.
