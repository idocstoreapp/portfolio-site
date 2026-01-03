# 🚀 Guía de Activación del Wizard Dinámico

## ✅ Implementación Completada

El sistema de wizard dinámico basado en caminos está completamente implementado y listo para usar.

## 📋 Archivos Creados/Modificados

### Frontend
- ✅ `src/utils/diagnosticPaths.ts` - Sistema de caminos por tipo de negocio
- ✅ `src/utils/enhancedDiagnosticEngine.ts` - Motor mejorado (frontend)
- ✅ `src/components/DynamicDiagnosticWizard.tsx` - Componente React dinámico
- ✅ `src/components/DiagnosticWizardDynamic.astro` - Wrapper Astro
- ✅ `src/pages/diagnostico/[id].astro` - Página de resultados actualizada
- ✅ `src/utils/backendClient.ts` - Tipos actualizados

### Backend
- ✅ `backend/enhanced-diagnostic-engine.ts` - Motor mejorado (backend)
- ✅ `backend/src/modules/diagnostic/dto/create-diagnostic.dto.ts` - DTO actualizado
- ✅ `backend/src/modules/diagnostic/diagnostic.service.ts` - Servicio actualizado
- ✅ `backend/src/modules/diagnostic/diagnostic.controller.ts` - Controlador actualizado
- ✅ `backend/database/migrations/add_enhanced_diagnostic_fields.sql` - Migración SQL

## 🔧 Pasos para Activar

### 1. Ejecutar Migración SQL

Ejecuta la migración en Supabase para agregar los nuevos campos:

```sql
-- Ejecutar: backend/database/migrations/add_enhanced_diagnostic_fields.sql
```

O ejecuta directamente en Supabase SQL Editor:

```sql
ALTER TABLE diagnosticos
ADD COLUMN IF NOT EXISTS operacion_actual TEXT,
ADD COLUMN IF NOT EXISTS dolor_principal TEXT,
ADD COLUMN IF NOT EXISTS situacion_actual TEXT,
ADD COLUMN IF NOT EXISTS tipo_negocio TEXT,
ADD COLUMN IF NOT EXISTS envelope_data JSONB;

CREATE INDEX IF NOT EXISTS idx_diagnosticos_operacion_actual ON diagnosticos(operacion_actual);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_dolor_principal ON diagnosticos(dolor_principal);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_envelope_data ON diagnosticos USING GIN (envelope_data);
```

### 2. Activar el Nuevo Wizard

En `src/pages/index.astro`, reemplaza:

```astro
<DiagnosticWizard />
```

por:

```astro
<DiagnosticWizardDynamic />
```

### 3. Reiniciar Servidores

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
npm run dev
```

## 🎯 Cómo Funciona

1. **Usuario selecciona tipo de negocio** → Se carga el camino específico
2. **Wizard muestra preguntas contextualizadas** → Solo preguntas relevantes para ese rubro
3. **Usuario completa diagnóstico** → Respuestas se envían al backend
4. **Backend procesa con motor mejorado** → Genera envelope completo
5. **Backend guarda en Supabase** → Con todos los campos nuevos
6. **Usuario es redirigido** → `/diagnostico/[id]`
7. **Página muestra resultado profesional** → Oportunidad, pain points, benefits, módulos

## 📊 Tipos de Negocio Soportados

- 🍽️ **Restaurante / Bar** - Preguntas sobre operación, menús, comandas
- 🔧 **Servicio Técnico** - Preguntas sobre reparaciones, inventario, clientes
- 🚗 **Taller Mecánico** - Preguntas sobre reparaciones, repuestos
- 🏭 **Fábrica / Producción** - Preguntas sobre cotizaciones, costos, catálogo
- 🌐 **Presencia Web / Ecommerce** - Preguntas sobre situación actual, objetivos

## ✨ Características

- ✅ Preguntas específicas por rubro (no genéricas)
- ✅ Detección de oportunidad con pain points y benefits
- ✅ Recomendación de módulos específicos
- ✅ Mensajes personalizados y consultivos
- ✅ Compatible con diagnósticos antiguos
- ✅ Diseño profesional y no comercial agresivo

## 🔍 Verificación

Para verificar que todo funciona:

1. Accede a la página principal
2. Haz clic en "Diagnóstico Estratégico"
3. Selecciona un tipo de negocio
4. Completa las preguntas (deberían ser específicas del rubro)
5. Verifica que la página de resultados muestre:
   - Oportunidad detectada
   - Problemas identificados
   - Beneficios de la solución
   - Módulos recomendados

## 🐛 Troubleshooting

### El wizard no muestra preguntas dinámicas
- Verifica que `DiagnosticWizardDynamic` esté importado correctamente
- Revisa la consola del navegador por errores

### El backend no procesa el diagnóstico mejorado
- Verifica que el backend esté corriendo
- Revisa los logs del backend para ver qué motor está usando
- Verifica que los campos nuevos estén llegando al backend

### La página de resultados no muestra el envelope completo
- Verifica que el diagnóstico tenga `envelope_data` en Supabase
- Revisa la consola del navegador
- Verifica que `getDiagnosticResult` esté retornando el envelope

## 📝 Notas Finales

- El sistema es **retrocompatible**: diagnósticos antiguos seguirán funcionando
- El wizard **mantiene el diseño visual** existente
- Las **páginas de soluciones no se modifican**
- El sistema es **extensible**: fácil agregar nuevos tipos de negocio

