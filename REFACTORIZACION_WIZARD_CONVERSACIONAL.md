# 🔄 Refactorización del Wizard Conversacional

## ✅ Cambios Implementados

### 1. Sistema de Preguntas Conversacionales (`src/utils/conversationalDiagnostic.ts`)

- **Preguntas específicas por rubro**: Cada sector tiene preguntas muy específicas que identifican problemas reales
- **Cálculo de costos**: Cada opción tiene `costImpact` que calcula:
  - Horas perdidas por semana
  - Costo en dinero por mes
  - Tasa de errores
- **Preguntas transversales**: Al final, preguntas sobre empleados, sucursales y presencia web
- **Motor de insights**: Genera insights específicos basados en las respuestas
- **Cálculo de ahorros**: Calcula ahorros potenciales (80% reducción de tiempo, 85% reducción de costos)

### 2. Componente Wizard Conversacional (`src/components/ConversationalDiagnosticWizard.tsx`)

- **UX conversacional**: Preguntas que se sienten como una conversación, no un test
- **Auto-avance inteligente**: En preguntas de selección única, avanza automáticamente después de seleccionar
- **Progreso visual**: Muestra paso actual / total
- **Información de contacto opcional**: Al final, antes de generar el diagnóstico
- **Manejo de errores**: Muestra errores de forma amigable

### 3. Wrapper Astro (`src/components/ConversationalDiagnosticWizard.astro`)

- **Mantiene diseño existente**: Usa los mismos estilos y estructura visual
- **Responsive**: Adaptado para móviles
- **Estilos conversacionales**: Tipografía y espaciado mejorados para mejor lectura

## 🎯 Características Clave

### Enfoque Consultivo
- **No comercial**: El resultado explica problemas, no vende productos
- **Cálculo de costos reales**: Muestra cuánto está perdiendo el cliente
- **Ahorros potenciales**: Calcula ahorros específicos en tiempo y dinero
- **ROI estimado**: Calcula retorno de inversión

### Mensajes Personalizados
- **Saludo personalizado**: Usa el nombre del cliente si lo proporciona
- **Contexto específico**: Explica qué encontró en el análisis
- **Oportunidad clara**: Muestra el potencial de ahorro
- **Visión inspiradora**: Conecta con los sueños del cliente (más tiempo, menos errores, crecimiento)

### Insights Específicos
Cada problema detectado genera un insight con:
- **Problema identificado**: Descripción clara del problema
- **Costo actual**: Tiempo y dinero que está perdiendo
- **Ahorros potenciales**: Cuánto podría ahorrar
- **Impacto operativo**: Cómo afecta su operación
- **Impacto financiero**: Cuánto dinero podría ahorrar
- **Impacto en crecimiento**: Cómo limita su crecimiento
- **Recomendación de herramienta**: Qué herramienta ayudaría (no producto específico)
- **Beneficios**: Lista de beneficios específicos

## 📋 Próximos Pasos

### 1. Actualizar Backend
- Modificar `diagnostic.service.ts` para procesar el nuevo formato
- Guardar `summary`, `insights` y `personalizedMessage` en la base de datos
- Actualizar DTOs para incluir nuevos campos

### 2. Crear Página de Resultados Consultiva
- Mostrar el informe profesional (no comercial)
- Presentar costos actuales vs. ahorros potenciales
- Mostrar insights específicos
- Incluir mensaje personalizado
- CTA: "Solicitar validación operativa" (no "Comprar ahora")

### 3. Integrar en Página Principal
- Reemplazar wizard actual por el conversacional
- Mantener hero y diseño existente

## 🔧 Estructura de Datos

### DiagnosticAnswers
```typescript
{
  sector: 'restaurante' | 'servicio-tecnico' | ...
  'operacion-diaria': 'papel-comandas' | ...
  'menu-digital': 'solo-impreso' | ...
  'empleados': 5,
  'sucursales': 'una' | 'varias',
  'presencia-web': 'no-web' | ...
}
```

### ConversationalDiagnosticResult
```typescript
{
  sector: BusinessSector,
  insights: DiagnosticInsight[],
  summary: {
    totalCurrentCost: { timeHours: number, moneyCost: number },
    totalPotentialSavings: { timeHours: number, moneyCost: number },
    roi: number
  },
  personalizedMessage: {
    greeting: string,
    context: string,
    opportunity: string,
    vision: string
  }
}
```

## 🎨 UX Mejorada

### Conversacional
- Preguntas que empiezan con "Cuéntame", "¿Sabes?", "¿Tienes?"
- Subtítulos que explican por qué se pregunta
- Auto-avance en selecciones únicas
- Progreso visual claro

### No Repetitivo
- Cada pregunta es específica y relevante
- No hay preguntas genéricas innecesarias
- Flujo lógico basado en el sector

### Consultivo
- Resultado explica problemas, no vende
- Muestra costos reales y ahorros
- Conecta con sueños del cliente
- Recomienda herramientas, no productos

## 📝 Notas de Implementación

- El wizard mantiene el diseño existente
- Los estilos están en el componente Astro
- El cálculo de costos es estimado pero realista
- Los ahorros se calculan asumiendo 80% reducción de tiempo y 85% de costos
- El ROI se calcula comparando ahorros vs. costo del sistema (estimado en $300/mes)


