# Migraciones del Sistema de Work Orders

## 📋 Descripción

Este directorio contiene las migraciones SQL para implementar el sistema completo de Work Orders (Órdenes de Trabajo) sin modificar ninguna tabla existente.

## 🗂️ Archivos

1. **`create_work_orders_system.sql`** - Crea todas las tablas nuevas del sistema
2. **`seed_solution_templates.sql`** - Inserta datos iniciales de templates y módulos

## 🚀 Instrucciones de Ejecución

### Paso 1: Ejecutar Migración Principal

1. Abre Supabase Dashboard
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `create_work_orders_system.sql`
4. Ejecuta el script
5. Verifica que no haya errores

**Verificación:**
```sql
-- Verificar que las tablas se crearon
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'solution_templates',
  'solution_modules',
  'orders',
  'order_modules',
  'order_terms'
);
```

### Paso 2: Ejecutar Seed de Datos

1. En el mismo SQL Editor de Supabase
2. Copia y pega el contenido de `seed_solution_templates.sql`
3. Ejecuta el script
4. Verifica que los datos se insertaron

**Verificación:**
```sql
-- Verificar templates
SELECT slug, name, base_price FROM solution_templates;

-- Verificar módulos
SELECT code, name, solution_template_id FROM solution_modules;
```

## 📊 Tablas Creadas

### 1. `solution_templates`
- Templates de soluciones (Restaurantes, Servicio Técnico, etc.)
- Precios base por solución
- Metadata y contenido de marketing

### 2. `solution_modules`
- Módulos reutilizables (Menú QR, POS, Inventario, etc.)
- Precios por módulo
- Contenido para manuales de usuario
- Relación con templates

### 3. `orders`
- Órdenes de trabajo profesionales
- Estados: draft, sent, accepted, in_development, completed, cancelled
- Información del cliente (snapshot)
- Alcance del proyecto
- Aspectos económicos
- Términos legales
- URLs de PDFs generados

### 4. `order_modules`
- Relación detallada entre órdenes y módulos
- Precios personalizados por módulo
- Estado: included, excluded, optional

### 5. `order_terms`
- Términos legales personalizables por orden
- Garantías, mantenimiento, exclusiones
- Términos de pago y propiedad intelectual

## 🔒 Seguridad

- **RLS habilitado** en todas las tablas
- **Solo admins** pueden crear/editar órdenes
- **Templates y módulos activos** son públicos (para frontend)
- **Todas las operaciones** requieren autenticación

## 🔧 Funciones Creadas

1. **`generate_order_number()`** - Genera números de orden únicos (ORD-YYYY-NNN)
2. **`update_updated_at_column()`** - Trigger para actualizar `updated_at` automáticamente
3. **`obtener_estadisticas_ordenes()`** - Estadísticas agregadas de órdenes

## 📝 Notas Importantes

- ✅ **NO modifica tablas existentes** - Solo agrega nuevas
- ✅ **Compatible hacia atrás** - No afecta funcionalidad existente
- ✅ **Idempotente** - Puede ejecutarse múltiples veces sin problemas (usa `ON CONFLICT`)
- ✅ **RLS configurado** - Seguridad desde el inicio

## ⚠️ Troubleshooting

### Error: "relation already exists"
- Las tablas ya existen, esto es normal
- El script usa `CREATE TABLE IF NOT EXISTS`, así que es seguro

### Error: "permission denied"
- Verifica que estés usando el usuario correcto en Supabase
- Asegúrate de tener permisos de administrador

### Error: "duplicate key value"
- El seed usa `ON CONFLICT DO UPDATE`, así que es seguro ejecutarlo múltiples veces
- Si persiste, verifica que los datos no estén duplicados manualmente

## ✅ Checklist Post-Migración

- [ ] Todas las tablas creadas correctamente
- [ ] Índices creados
- [ ] RLS habilitado
- [ ] Políticas RLS creadas
- [ ] Triggers funcionando
- [ ] Templates insertados (5 templates)
- [ ] Módulos insertados (al menos 10 módulos para restaurantes)
- [ ] Función `generate_order_number()` funciona
- [ ] Función `obtener_estadisticas_ordenes()` funciona

## 🔄 Próximos Pasos

Después de ejecutar estas migraciones:

1. **FASE 4:** Implementar backend API (NestJS)
2. **FASE 5:** Implementar admin UI (Next.js)
3. **FASE 6:** Implementar generación de PDFs
4. **FASE 7:** Implementar manuales de usuario

---

**Estado:** ✅ Migraciones listas para ejecutar  
**Riesgo:** 🟢 BAJO (no modifica existente)
