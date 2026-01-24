# Implementación del Wizard Dinámico Basado en Caminos

## ✅ Completado

### 1. Sistema de Caminos (Decision Tree)
- **Archivo**: `src/utils/diagnosticPaths.ts`
- **Funcionalidad**: Define preguntas específicas por tipo de negocio
- **Tipos de negocio soportados**:
  - Restaurante / Bar
  - Servicio Técnico
  - Taller Mecánico
  - Fábrica / Producción
  - Presencia Web / Ecommerce

Cada camino tiene:
- Preguntas específicas del rubro
- Opciones contextualizadas
- Perfil de resultado con módulos recomendados

### 2. Motor de Diagnóstico Mejorado
- **Archivo**: `src/utils/enhancedDiagnosticEngine.ts`
- **Funcionalidad**: Genera "diagnostic envelope" con:
  - Perfil de oportunidad (pain points y benefits)
  - Recomendaciones personalizadas
  - Mensajes contextualizados
  - Cálculo de urgencia inteligente

### 3. Componente React Dinámico
- **Archivo**: `src/components/DynamicDiagnosticWizard.tsx`
- **Funcionalidad**: Wizard que genera preguntas dinámicamente según el tipo de negocio seleccionado

### 4. Componente Astro Wrapper
- **Archivo**: `src/components/DiagnosticWizardDynamic.astro`
- **Funcionalidad**: Wrapper que mantiene el diseño existente e integra el componente React

## 🔄 Pendiente

### 1. Actualizar Página de Resultados
- **Archivo**: `src/pages/diagnostico/[id].astro`
- **Necesita**: 
  - Mostrar el "diagnostic envelope" completo
  - Diseño profesional y consultivo
  - Presentar oportunidad detectada
  - Redirigir a página de solución con módulos destacados

### 2. Actualizar Backend
- **Archivo**: `backend/src/modules/diagnostic/diagnostic.service.ts`
- **Necesita**:
  - Procesar nuevos campos (`operacionActual`, `dolorPrincipal`, etc.)
  - Usar el motor mejorado (`enhancedDiagnosticEngine`)
  - Guardar el "diagnostic envelope" completo

### 3. Integración
- Reemplazar el wizard actual por el nuevo (o mantener ambos como opción)
- Actualizar la página de inicio para usar el nuevo wizard
- Probar flujo completo end-to-end

## 📋 Estructura de Datos

### DiagnosticEnvelope
```typescript
{
  id: string;
  businessType: BusinessType;
  resultProfile: {
    systemType: string;
    recommendedModules: string[];
    applicableServices: string[];
  };
  opportunity: {
    title: string;
    description: string;
    painPoints: string[];
    benefits: string[];
  };
  recommendation: {
    primarySolution: {...};
    complementarySolutions: [...];
  };
  personalizedMessage: {...};
  urgency: 'high' | 'medium' | 'low';
  nextSteps: {...};
}
```

## 🎯 Próximos Pasos

1. **Actualizar página de resultados** para mostrar el envelope completo
2. **Actualizar backend** para procesar y guardar el envelope
3. **Integrar en la página principal** (reemplazar o mantener ambos)
4. **Probar flujo completo** con cada tipo de negocio
5. **Ajustar estilos** si es necesario para mantener consistencia

## 🔧 Cómo Activar el Nuevo Wizard

Para usar el nuevo wizard dinámico, reemplaza en `src/pages/index.astro`:

```astro
// Antes:
<DiagnosticWizard />

// Después:
<DiagnosticWizardDynamic />
```

O mantén ambos y permite al usuario elegir.

## 📝 Notas

- El nuevo wizard mantiene el diseño visual existente
- Las páginas de soluciones existentes no se modifican
- El sistema es extensible: fácil agregar nuevos tipos de negocio o preguntas
- El motor de diagnóstico es consultivo, no comercial agresivo




