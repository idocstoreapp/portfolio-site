# Auditoría del DiagnosticWizard — Análisis completo

**Objetivo:** Documentar cómo funciona el wizard de diagnóstico antes de rediseñarlo.  
**Alcance:** Wizard conversacional (flujo principal en la home). No se ha modificado ningún código.

---

## SECCIÓN 1 — ARQUITECTURA GENERAL

### Archivo principal del wizard
- **Ubicación:** `src/components/ConversationalDiagnosticWizard.tsx`
- **Wrapper Astro:** `src/components/ConversationalDiagnosticWizard.astro` (renderiza el React con `client:load`)

### Componentes relacionados
| Archivo | Rol |
|--------|-----|
| `ConversationalDiagnosticWizard.tsx` | Componente principal (React): pasos, estado, envío |
| `ConversationalDiagnosticWizard.astro` | Contenedor y estilos de la sección del wizard |
| `src/utils/conversationalDiagnostic.ts` | Preguntas por sector, transversales, cálculo de costos/ahorros, insights, estructura de resultado |
| `src/utils/diagnosticResultDerivation.ts` | Datos derivados (hoursBreakdown, financialProjection, before/after, impactEquivalents, opportunityPlan, texto personalizado) |
| `src/utils/backendClient.ts` | `createDiagnostic()` — envío al backend |
| `src/utils/services.ts` | Servicios recomendados, categorías, `getRecommendedServicesForSector` |
| `src/utils/iconMapping.ts` | `getIconFileName` para iconos |
| `src/components/DiagnosticResultClient.tsx` | Página de resultado (lee `localStorage` o ID y renderiza el informe) |

### Componentes hijos (internos al TSX)
El wizard **no** usa componentes hijos separados. Todo el UI está en el mismo archivo:
- Paso de selección de sector (grid de `BUSINESS_SECTORS`)
- Paso de pregunta actual (título, opciones según `question.type`: single/multiple/number/text)
- Paso de selección de servicios (categorías + servicios)
- Formulario de contacto (nombre, empresa, email) integrado en el flujo
- Botones Siguiente / Atrás / Generar diagnóstico

### Hooks usados
- `useState`: `currentStep`, `selectedSector`, `answers`, `contactInfo`, `selectedServices`, `currentServiceCategory`, `loading`, `error`, `isMobile`, `isCompleted`
- `useEffect`: detección de móvil, `beforeunload`, aplicación de filtro a iconos/emojis, scroll al paso

### Estado (local, sin contexto)
- **currentStep:** número de paso (-1 = sector, 0..N-1 = preguntas, N = servicios)
- **selectedSector:** `BusinessSector | null`
- **answers:** `Record<string, any>` (todas las respuestas por `question.id`)
- **contactInfo:** `{ name, company, email }`
- **selectedServices:** `string[]` (IDs de servicios)
- **currentServiceCategory:** categoría actual en el paso de servicios
- **loading / error / isMobile / isCompleted:** UX y envío

### Contexto
No se usa React Context. Todo el estado es local al componente.

---

## SECCIÓN 2 — LISTA COMPLETA DE PASOS (ORDEN EXACTO)

El orden es: **1) Selección de sector** → **2..N) Preguntas del sector + transversales** → **N+1) Selección de servicios**.

### Paso 0 (interno: currentStep === -1)
- **Nombre interno:** Selección de sector / sector selection
- **Pregunta mostrada:** ¿Cuál es tu negocio?
- **Descripción:** Selecciona el tipo de negocio que mejor describe el tuyo
- **Tipo de input:** radio (cards con un solo seleccionable)
- **Opciones:** Ver BUSINESS_SECTORS en el código (10 opciones: Restaurante, Servicio Técnico Celulares, Servicio Técnico General, Taller Vehículos, Taller Motos, Mueblería, Comercio, Página Web, Portfolio, Servicios Profesionales)
- **Valor guardado:** `sector`, `extendedType`, `servicePage` en `answers`; `selectedSector` en estado

### Pasos 1..K (preguntas según sector)
Para cada sector, primero se muestran **todas** las preguntas de `SECTOR_QUESTIONS[sector]` y luego las de `TRANSVERSAL_QUESTIONS`. El número total de pasos de preguntas varía por sector.

**Restaurante (9 preguntas):**
1. operacion-diaria — single  
2. menu-digital — single  
3. mesas-meseros — single  
4. inventario-restaurante — single  
5. pedidos-diarios — number  
6. mesas-restaurante — number  
7. gasto-papel-mes — number  
+ 3 transversales (empleados, sucursales, presencia-web)

**Servicio técnico (6 preguntas):**
1. gestion-ordenes — single  
2. comisiones-tecnicos — single  
3. inventario-repuestos — single  
4. comunicacion-clientes — single  
5. reparaciones-mes — number  
+ 3 transversales

**Taller (3 preguntas):**
1. gestion-ordenes-taller — single  
2. comisiones-mecanicos — single  
3. vehiculos-mes — number  
+ 3 transversales

**Fabrica (3 preguntas):**
1. cotizaciones — single  
2. como-cotiza — single  
3. calculo-costos — single  
+ 3 transversales

**Comercio (1 pregunta):**
1. gestion-ventas — single  
+ 3 transversales

**Servicios (1 pregunta):**
1. gestion-servicios — single  
+ 3 transversales

### Paso transversal 1 (mismo para todos)
- **id:** empleados  
- **Pregunta:** ¿Cuántos empleados tienes?  
- **Tipo:** single (radio)  
- **Opciones:** 1-5, 6-15, 16-50, 50+  
- **Valor guardado:** `answers.empleados`

### Paso transversal 2
- **id:** sucursales  
- **Pregunta:** ¿Tienes más de una ubicación?  
- **Tipo:** single  
- **Opciones:** una, varias (varias tiene costImpact)  
- **Valor guardado:** `answers.sucursales`

### Paso transversal 3
- **id:** presencia-web  
- **Pregunta:** ¿Tienes página web?  
- **Tipo:** single  
- **Opciones:** no-web, web-basica, web-completa  
- **Valor guardado:** `answers.presencia-web`

### Paso final (servicios)
- **Nombre interno:** SERVICES_STEP (currentStep === allQuestions.length)
- **Pregunta mostrada:** Servicios recomendados para tu negocio
- **Tipo de input:** checkbox (múltiples servicios por categoría)
- **Valor guardado:** `selectedServices` (array de IDs)

Después de este paso el usuario puede hacer clic en **Generar mi diagnóstico**, que pide (si aplica) nombre, empresa, email y luego ejecuta el cálculo y redirige a la página de resultado.

---

## SECCIÓN 3 — TODAS LAS PREGUNTAS Y RESPUESTAS POSIBLES

Resumen por **id**: tipo, pregunta, opciones (valor guardado).

### Restaurante
| id | Pregunta | Tipo | Opciones / valor guardado |
|----|----------|------|---------------------------|
| operacion-diaria | Cuéntame, ¿cómo funciona tu restaurante día a día? | single | papel-comandas, whatsapp-papel, pos-basico, sistema-completo |
| menu-digital | ¿Tus clientes ven el menú en papel o digital? | single | solo-impreso, ambos, solo-digital |
| mesas-meseros | ¿Tienes mesas con meseros que toman pedidos? | single | solo-mostrador, mesas-sin-meseros, mesas-con-meseros |
| inventario-restaurante | ¿Sabes exactamente qué ingredientes tienes en stock? | single | no-se, manual, sistema |
| pedidos-diarios | ¿Cuántos pedidos manejas aproximadamente al día? | number | número (min 1, max 10000) |
| mesas-restaurante | ¿Cuántas mesas tienes aproximadamente? | number | número (1–500) |
| gasto-papel-mes | ¿Cuánto gastas aproximadamente en papel/menús al mes? | number | número (0–1000) |

### Servicio técnico
| id | Pregunta | Tipo | Opciones / valor guardado |
|----|----------|------|---------------------------|
| gestion-ordenes | ¿Cómo llevas el registro de las reparaciones? | single | papel, excel, whatsapp, sistema |
| comisiones-tecnicos | ¿Pagas comisiones a tus técnicos? | single | no-comisiones, manual, automatico |
| inventario-repuestos | ¿Sabes qué repuestos tienes en stock? | single | no-se, manual, sistema |
| comunicacion-clientes | ¿Los clientes te llaman constantemente preguntando por su reparación? | single | si-constantemente, a veces, no |
| reparaciones-mes | ¿Cuántas reparaciones manejas aproximadamente al mes? | number | número (1–10000) |

### Taller
| id | Pregunta | Tipo | Opciones / valor guardado |
|----|----------|------|---------------------------|
| gestion-ordenes-taller | ¿Cómo llevas el registro de las reparaciones? | single | papel, excel, sistema |
| comisiones-mecanicos | ¿Pagas comisiones a tus mecánicos? | single | no-comisiones, manual, automatico |
| vehiculos-mes | ¿Cuántos vehículos reparas aproximadamente al mes? | number | número (1–10000) |

### Fabrica
| id | Pregunta | Tipo | Opciones / valor guardado |
|----|----------|------|---------------------------|
| cotizaciones | ¿Haces cotizaciones para tus clientes? | single | si-cotizo, no-cotizo |
| como-cotiza | ¿Cómo generas las cotizaciones? | single | manual, excel, sistema |
| calculo-costos | ¿Cómo calculas los costos reales de producción? | single | manual, excel, aproximado, sistema |

### Comercio
| id | Pregunta | Tipo | Opciones / valor guardado |
|----|----------|------|---------------------------|
| gestion-ventas | ¿Cómo llevas el registro de tus ventas? | single | papel, pos-basico, sistema |

### Servicios
| id | Pregunta | Tipo | Opciones / valor guardado |
|----|----------|------|---------------------------|
| gestion-servicios | ¿Cómo gestionas tus servicios y clientes? | single | papel, excel, sistema |

### Transversales (todos los sectores)
| id | Pregunta | Tipo | Opciones / valor guardado |
|----|----------|------|---------------------------|
| empleados | ¿Cuántos empleados tienes? | single | 1-5, 6-15, 16-50, 50+ |
| sucursales | ¿Tienes más de una ubicación? | single | una, varias |
| presencia-web | ¿Tienes página web? | single | no-web, web-basica, web-completa |

Cada opción de tipo `single` guarda el **value** de la opción elegida en `answers[question.id]`. Las opciones pueden tener `costImpact: { timeHours, moneyCost, errorRate }` que se usan en el cálculo (ver Sección 5).

---

## SECCIÓN 4 — ESTRUCTURA DE DATOS FINAL GENERADA

El wizard produce dos estructuras:

### 1) Payload enviado al backend (`diagnosticData`)
```javascript
{
  tipoEmpresa: string,           // ej. "restaurante"
  businessType: string,
  sector: string,
  nivelDigital: string,          // default "intermedio"
  objetivos: string[],           // default ["mejorar-operaciones"]
  tamano: string,                // default "pequeña"
  necesidadesAdicionales: string[],
  extendedType: string | undefined,
  servicePage: string | undefined,
  selectedServices: string[],
  // Todas las respuestas del wizard (answers) menos sector/tipoEmpresa/businessType
  [questionId]: value,           // ej. operacion-diaria: "papel-comandas", empleados: "1-5"
  nombre: string | undefined,
  empresa: string | undefined,
  email: string | undefined,
  summary: { totalCurrentCost, totalPotentialSavings, roi, roiExplanation, imageUrl? },
  insights: DiagnosticInsight[],
  personalizedMessage: { greeting, context, opportunity, vision },
  currentSituation: { title, description, highlights, imageUrl? },
  opportunities: Array<{ title, description, impact, dailyImprovement, imageUrl? }>,
  operationalImpact: { title, description, consequences[] },
  futureVision: { title, description, benefits[], imageUrl? },
  type: "conversational"
}
```

### 2) Objeto guardado en localStorage y mostrado en resultado (`fullResult`)
Incluye todo lo anterior más:

```javascript
{
  id: string,                    // "local-{timestamp}-{random}" o ID del backend
  created_at: string,
  nextSteps: { primary: { text, link }, secondary: { text, link } },
  urgency: "medium",
  hoursBreakdown: Array<{ id, label, hoursSavedPerWeek, description }>,
  financialProjection: { monthlySavings, yearlySavings, yearlyHoursSaved },
  beforeState: { hoursPerWeekCurrent, monthlyCostCurrent, errorRateCurrent },
  afterState: { hoursPerWeekAfter, monthlyCostAfter, errorRateAfter },
  impactEquivalents: { hoursSavedPerMonth, workDaysSavedPerYear, workWeeksSavedPerYear },
  opportunityPlan: Array<{ order, title, description }>,
  personalizedSummaryParagraph: string
}
```

---

## SECCIÓN 5 — LÓGICA DE CÁLCULO

### Función: `calculateCostsAndSavings`
- **Archivo:** `src/utils/conversationalDiagnostic.ts`
- **Qué hace:** Recorre todas las respuestas del wizard; para cada pregunta con `options` y opción elegida con `costImpact`, suma:
  - **totalTimeHours** y **totalMoneyCost** (costos actuales)
  - **totalPotentialTimeSavings** = 80% de las horas de costImpact
  - **totalPotentialMoneySavings** = 85% del dinero de costImpact  
  Calcula **ROI** = ((totalPotentialMoneySavings - 300) / 300) * 100 (costo sistema fijo 300).  
  Devuelve `summary` con totalCurrentCost, totalPotentialSavings, roi y textos de explicación.

### Función: `generateInsights`
- **Archivo:** `src/utils/conversationalDiagnostic.ts`
- **Qué hace:** Por cada respuesta con costImpact (y con timeHours > 5 o moneyCost > 100), genera un **DiagnosticInsight** (título, situación actual, costos, ahorros potenciales, impacto operativo, oportunidad, recomendación). No calcula totales; solo convierte cada respuesta “costosa” en un insight.

### Función: `deriveDiagnosticInsights` (datos derivados)
- **Archivo:** `src/utils/diagnosticResultDerivation.ts`
- **Qué hace:** A partir de summary, insights y opportunities genera: **hoursBreakdown** (origen de horas ahorradas), **financialProjection** (mensual/anual, horas/año), **beforeState**/**afterState**, **impactEquivalents** (días/semanas laborales), **opportunityPlan** (lista de pasos), **personalizedSummaryParagraph** (texto con nombre/empresa y números). No reemplaza cálculos existentes; solo añade campos derivados.

**Resumen:**  
- **hours_saved / money_saved:** vienen de `calculateCostsAndSavings` (totalPotentialSavings).  
- **roi:** mismo archivo, fórmula anterior.  
- **error_reduction:** no se calcula un único número global; cada insight puede tener errorRate en costImpact; en la derivación se usa para afterState.errorRateAfter.

---

## SECCIÓN 6 — LÓGICA DE GENERACIÓN DEL RESULTADO

### Archivo que genera el resultado final
- **En el cliente:** `src/components/ConversationalDiagnosticWizard.tsx` (en `handleSubmit`).
- **Cálculos y textos:** `src/utils/conversationalDiagnostic.ts`.

### Flujo de transformación respuestas → resultado

1. **handleSubmit** (wizard):
   - `summary = calculateCostsAndSavings(answers, selectedSector)`
   - `insights = generateInsights(answers, selectedSector)`
   - `personalizedMessage = generatePersonalizedMessage(answers, selectedSector, summary)`
   - `enhancedStructure = generateEnhancedResultStructure(answers, selectedSector, insights, summary)`
   - `derived = deriveDiagnosticInsights(summary, insights, enhancedStructure.opportunities, ...)`
   - Se arma `diagnosticData` y `fullResult` (incluye summary, insights, opportunities, currentSituation, operationalImpact, futureVision, derived).
   - Se guarda en `localStorage` y se llama a `createDiagnostic(diagnosticData)`; redirección a `/diagnostico/{id}`.

2. **generateEnhancedResultStructure** (conversationalDiagnostic.ts):
   - **currentSituation:** `generateCurrentSituation(sector, summary, insights, nombre, empresa)` — título, descripción, highlights.
   - **opportunities:** `generateOpportunities(insights)` — desde insights con opportunity; se deduplican por título.
   - **operationalImpact:** `generateOperationalImpact(...)` — consecuencias en tiempo, costos, errores, crecimiento.
   - **futureVision:** `generateFutureVision(...)` — título, descripción, benefits.
   - **summary:** mismo summary con imageUrl.

Así se obtienen **hoursSaved** (summary.totalPotentialSavings.timeHours), **monthlySavings** (totalPotentialSavings.moneyCost), **yearlySavings** (en derived.financialProjection), **opportunitiesDetected** (enhancedStructure.opportunities), **recommendedSolutions** (servicios recomendados por sector/extendedType en el paso de servicios y en `getRecommendedServicesForSector`).

### Función completa: `generateEnhancedResultStructure` (conversationalDiagnostic.ts)

```typescript
export function generateEnhancedResultStructure(
  answers: Record<string, any>,
  sector: BusinessSector,
  insights: DiagnosticInsight[],
  summary: ConversationalDiagnosticResult['summary']
): {
  currentSituation: ConversationalDiagnosticResult['currentSituation'];
  opportunities: ConversationalDiagnosticResult['opportunities'];
  operationalImpact: ConversationalDiagnosticResult['operationalImpact'];
  futureVision: ConversationalDiagnosticResult['futureVision'];
  summary: ConversationalDiagnosticResult['summary'];
} {
  const sectorName = getSectorName(sector);
  const employeeRange = answers['empleados'] || '1-5';
  const nombre = answers.nombre || answers.contactName || '';
  const empresa = answers.empresa || answers.contactCompany || '';
  
  const currentSituation = generateCurrentSituation(sector, summary, insights, nombre, empresa);
  currentSituation.imageUrl = getCurrentSituationImageUrl(sector);
  
  const opportunities = generateOpportunities(insights);
  opportunities.forEach(opp => {
    opp.imageUrl = getOpportunityImageUrl(sector, opp.title);
  });
  
  if (opportunities.length === 0) {
    const firstInsight = insights[0];
    opportunities.push({
      title: 'Optimización de procesos',
      description: 'Hay oportunidades de mejorar tus procesos actuales...',
      impact: { time: ..., money: ... },
      dailyImprovement: ['Menos tiempo en tareas repetitivas', ...],
      imageUrl: getOpportunityImageUrl(sector, 'optimizacion-procesos')
    });
  }
  
  const operationalImpact = generateOperationalImpact(sector, summary, insights, nombre, empresa);
  operationalImpact.consequences.forEach(consequence => {
    consequence.imageUrl = getOperationalImpactImageUrl(sector, getImpactAreaFromConsequence(consequence.area));
  });
  
  const futureVision = generateFutureVision(sector, summary, nombre, empresa);
  futureVision.imageUrl = getFutureVisionImageUrl(sector);
  
  const summaryWithImage = { ...summary, imageUrl: getSummaryImageUrl(sector, 'beforeAfter') };
  
  return {
    currentSituation,
    opportunities,
    operationalImpact,
    futureVision,
    summary: summaryWithImage
  };
}
```

### Fragmento de `handleSubmit` que arma el resultado (ConversationalDiagnosticWizard.tsx)

```typescript
const summary = calculateCostsAndSavings(answers, selectedSector!);
const insights = generateInsights(answers, selectedSector!);
const personalizedMessage = generatePersonalizedMessage(answers, selectedSector!, summary);
const enhancedStructure = generateEnhancedResultStructure(
  { ...answers, nombre, empresa },
  selectedSector!,
  insights,
  summary
);

const diagnosticData = {
  tipoEmpresa, businessType, sector, nivelDigital, objetivos, tamano, necesidadesAdicionales,
  extendedType, servicePage, selectedServices,
  ...filteredAnswers,
  nombre, empresa, email,
  summary: enhancedStructure.summary,
  insights,
  personalizedMessage,
  currentSituation: enhancedStructure.currentSituation,
  opportunities: enhancedStructure.opportunities,
  operationalImpact: enhancedStructure.operationalImpact,
  futureVision: enhancedStructure.futureVision,
  type: 'conversational'
};

const derived = deriveDiagnosticInsights(
  enhancedStructure.summary,
  insights,
  enhancedStructure.opportunities || [],
  selectedSector,
  nombre,
  empresa
);

const fullResult = {
  ...diagnosticData,
  id: diagnosticId,
  hoursBreakdown: derived.hoursBreakdown,
  financialProjection: derived.financialProjection,
  beforeState: derived.beforeState,
  afterState: derived.afterState,
  impactEquivalents: derived.impactEquivalents,
  opportunityPlan: derived.opportunityPlan,
  personalizedSummaryParagraph: derived.personalizedSummaryParagraph,
  nextSteps: { primary: { text, link }, secondary: { text: 'Ver todos los servicios', link: '/servicios' } },
  urgency: 'medium',
  created_at: new Date().toISOString(),
};
```

---

## SECCIÓN 7 — LÓGICA DE RAMIFICACIÓN

### Qué preguntas cambian según tipo de negocio
Las preguntas **dependen 100%** del sector elegido en el paso 0.

- **Código:** En `ConversationalDiagnosticWizard.tsx`, `getAllQuestions()`:
  ```javascript
  const sectorQuestions = SECTOR_QUESTIONS[selectedSector] || [];
  return [...sectorQuestions, ...TRANSVERSAL_QUESTIONS];
  ```
- **Comportamiento:**  
  - Si `selectedSector === 'restaurante'` → se muestran las preguntas de `SECTOR_QUESTIONS.restaurante` y luego las 3 transversales.  
  - Si `selectedSector === 'servicio-tecnico'` → preguntas de servicio técnico + transversales.  
  - Igual para `taller`, `fabrica`, `comercio`, `servicios`.  
- No hay pasos intermedios que cambien el flujo (p. ej. “si respondiste X en pregunta 2, salta a pregunta 5”). El orden es siempre: **sector → todas las preguntas del sector → transversales → servicios**.

### Tipos de negocio (extendedType)
En el paso 0 se elige una opción de **BUSINESS_SECTORS**; cada una tiene `value` (sector) y opcionalmente `extendedType` (ej. servicio-tecnico-celulares, taller-vehiculos). Eso solo afecta qué **preguntas** se muestran (por sector) y qué **servicios** se recomiendan; no cambia el orden ni la cantidad de pasos de preguntas dentro del mismo sector.

---

## SECCIÓN 8 — FLUJO COMPLETO

1. **Inicio:** Usuario entra a la home → sección `#diagnostico-estrategico` con `ConversationalDiagnosticWizard` (client:load).
2. **Paso 0 (sector):** Muestra “¿Cuál es tu negocio?” con grid de BUSINESS_SECTORS. Al elegir uno se setea `selectedSector`, `answers.sector/extendedType/servicePage` y `currentStep = 0`.
3. **Pasos 1..N (preguntas):** Para cada índice `currentStep` se muestra `allQuestions[currentStep]`: título, subtítulo, input (single/multiple/number/text). Al elegir respuesta se guarda en `answers[question.id]` y se avanza con “Siguiente” (o “Atrás”). Las preguntas son `SECTOR_QUESTIONS[sector]` seguidas de `TRANSVERSAL_QUESTIONS`.
4. **Paso N+1 (servicios):** Pantalla de servicios recomendados por categorías; el usuario marca los que le interesan en `selectedServices`.
5. **Envío:** Botón “Generar mi diagnóstico”. Si no están todos los obligatorios respondidos, se muestra error. Si faltan nombre/empresa/email puede haber formulario de contacto en el mismo flujo. Luego:
   - `calculateCostsAndSavings(answers, selectedSector)` → summary  
   - `generateInsights(answers, selectedSector)` → insights  
   - `generatePersonalizedMessage(answers, selectedSector, summary)` → personalizedMessage  
   - `generateEnhancedResultStructure(answers, selectedSector, insights, summary)` → currentSituation, opportunities, operationalImpact, futureVision  
   - `deriveDiagnosticInsights(...)` → hoursBreakdown, financialProjection, beforeState, afterState, impactEquivalents, opportunityPlan, personalizedSummaryParagraph  
   - Se arma `fullResult`, se guarda en `localStorage` con clave `diagnostic-{id}` y se llama a `createDiagnostic(diagnosticData)`.
6. **Redirección:** `window.location.href = '/diagnostico/' + id` (id local o del backend).
7. **Página de resultado:** `DiagnosticResultClient` (en `src/pages/diagnostico/[id].astro`) lee de `localStorage` o (si no es local) del backend y renderiza hero, equivalencias, causas, antes/después, emocional, servicios recomendados, y el resto de secciones (situación actual, oportunidades detalladas, impacto, visión futura, CTA).

---

## SECCIÓN 9 — COMPONENTES DE UI USADOS

- **Cards:** `.option-card`, `.sector-option-card` (selección de sector y de opciones de pregunta), `.service-card-result-enhanced` (en resultado).
- **Inputs:**  
  - Radio: botones tipo card con una opción seleccionable (single).  
  - Checkbox: servicios (múltiple).  
  - Number: `<input type="number">` para preguntas numéricas.  
  - Text: `<input type="text">` / email para nombre, empresa, email.
- **Buttons:** “Siguiente”, “Atrás”, “Generar mi diagnóstico”, “Ver solución completa” (servicios), CTAs en resultado.
- **Progress bar:** Barra de progreso (porcentaje según `currentProgress / totalSteps`) en paso de sector y en cada pregunta; texto “Paso X de N” y “Analizando [título pregunta]”.
- **Contenedores:** `.wizard-step`, `.step-header`, `.conversational-intro`, `.conversational-question`, `.cards-grid`, `.sector-selection-grid`, listas de servicios por categoría.

Todo el UI del wizard está en el mismo TSX; no hay subcomponentes React extra para pasos o preguntas.

---

## SECCIÓN 10 — POSIBLES PUNTOS DE MEJORA (sin modificar código)

### UX
- Preguntas largas o muy similares entre sectores pueden cansar; podría valorarse acortar o unificar redacción.
- En móvil el grid de sector con muchas opciones puede ser denso; revisar tamaño de touch targets y espaciado.
- No hay indicador explícito de “preguntas opcionales” (p. ej. number con required: false); el usuario puede no saber que puede omitir.
- El paso de servicios puede ser largo si hay muchas categorías; podría valorarse progreso o resumen “X servicios seleccionados”.

### Estructura
- Un solo archivo TSX muy grande (~1.7k líneas) dificulta mantenimiento; separar por pasos o por “sector / preguntas / servicios / submit” podría ayudar.
- Preguntas y opciones viven solo en `conversationalDiagnostic.ts`; el wizard solo las consume. Bien para una sola fuente de verdad; si en el futuro hubiera otro flujo (p. ej. otro wizard), habría que reutilizar el mismo módulo.

### Claridad
- Nombres de variables como `SERVICES_STEP` vs `currentStep === allQuestions.length` requieren leer el código para entender el orden de pasos; un comentario o constante “PASO_SERVICIOS = allQuestions.length” podría ayudar.
- Algunos `costImpact` están en opciones y otros no; la regla (“solo se suman si hay costImpact”) no es evidente sin leer `calculateCostsAndSavings` y `generateInsights`.
- Diferencia entre “diagnosticData” (payload API) y “fullResult” (localStorage + UI) no está documentada en el código; un README o este análisis ayuda a futuros cambios.

---

**Fin del análisis.** No se ha modificado ningún archivo del proyecto.
