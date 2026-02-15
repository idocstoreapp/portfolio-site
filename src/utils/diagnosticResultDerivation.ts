/**
 * Derives extra result fields for the diagnostic report.
 * ADD-ON only: does not remove or replace existing data.
 * Used for: hoursBreakdown, financialProjection, beforeState, afterState, impactEquivalents,
 * personalized summary text, and opportunity plan steps.
 */

import type { BusinessSector } from './conversationalDiagnostic';

function getSectorDisplayName(sector: BusinessSector): string {
  const names: Record<BusinessSector, string> = {
    'restaurante': 'restaurante',
    'servicio-tecnico': 'servicio técnico',
    'taller': 'taller mecánico',
    'fabrica': 'fábrica',
    'comercio': 'comercio',
    'servicios': 'negocio de servicios'
  };
  return names[sector] || 'negocio';
}

export interface HoursBreakdownItem {
  id: string;
  label: string;
  hoursSavedPerWeek: number;
  description: string;
}

export interface FinancialProjection {
  monthlySavings: number;
  yearlySavings: number;
  yearlyHoursSaved: number;
}

export interface BeforeState {
  hoursPerWeekCurrent: number;
  monthlyCostCurrent: number;
  errorRateCurrent: number;
}

export interface AfterState {
  hoursPerWeekAfter: number;
  monthlyCostAfter: number;
  errorRateAfter: number;
}

export interface ImpactEquivalents {
  hoursSavedPerMonth: number;
  workDaysSavedPerYear: number;
  workWeeksSavedPerYear: number;
}

export interface OpportunityPlanStep {
  order: number;
  title: string;
  description: string;
}

/** Estructura psicológica del resultado para conversión (hero, equivalencias, antes/después, emocional) */
export interface HeroImpact {
  title: string;
  subtitlePersonalized: string;
  hoursLostPerWeek: number;
  equivalents: {
    hoursPerMonth: number;
    hoursPerYear: number;
    workDaysPerYear: number;
  };
}

export interface RealLifeEquivalentCard {
  title: string;
  description: string;
}

export interface ProblemBreakdownItem {
  label: string;
  hoursLostPerWeek: number;
}

export interface BeforeAfterBlock {
  beforeHours: number;
  afterHours: number;
  resultSummary: string;
}

export interface EmotionalOutcome {
  paragraph: string;
}

export interface SolutionImpact {
  headline?: string;
  description?: string;
}

export interface PsychologicalResult {
  heroImpact: HeroImpact;
  realLifeEquivalent: RealLifeEquivalentCard[];
  problemBreakdown: ProblemBreakdownItem[];
  beforeAfter: BeforeAfterBlock;
  emotionalOutcome: EmotionalOutcome;
  solutionImpact?: SolutionImpact;
}

export interface DerivedDiagnosticResult {
  hoursBreakdown: HoursBreakdownItem[];
  financialProjection: FinancialProjection;
  beforeState: BeforeState;
  afterState: AfterState;
  impactEquivalents: ImpactEquivalents;
  opportunityPlan: OpportunityPlanStep[];
  personalizedSummaryParagraph?: string;
  /** Nueva estructura psicológica para UI de resultado */
  psychological?: PsychologicalResult;
}

const PROCESS_LABELS: Record<string, string> = {
  'operacion-diaria': 'Gestión de operación diaria',
  'menu-digital': 'Actualización de menú y precios',
  'inventario-restaurante': 'Control de inventario',
  'gestion-ordenes': 'Gestión centralizada de órdenes',
  'registro-ordenes': 'Registro manual de órdenes',
  'busqueda-informacion': 'Búsqueda de información',
  'procesos-admin': 'Tareas administrativas repetitivas',
  'correccion-errores': 'Corrección de errores manuales',
  'seguimiento-pedidos': 'Seguimiento de pedidos',
};

/**
 * Derives hours breakdown from insights (each insight = one source of time/cost).
 */
export function calculateSavingsBreakdown(
  insights: Array<{
    opportunity?: { title: string };
    currentCost?: { timeHours: number; moneyCost: number; errorRate?: number };
    potentialSavings?: { timeHours: number; moneyCost: number; errorReduction?: number };
  }>,
  opportunityTitles?: string[]
): HoursBreakdownItem[] {
  const items: HoursBreakdownItem[] = [];
  const seen = new Set<string>();

  insights.forEach((insight, idx) => {
    const hoursSaved = insight.potentialSavings?.timeHours ?? 0;
    if (hoursSaved <= 0) return;

    const title = insight.opportunity?.title || opportunityTitles?.[idx] || `Área ${idx + 1}`;
    const key = title.toLowerCase().replace(/\s+/g, '-').slice(0, 40);
    if (seen.has(key)) return;
    seen.add(key);

    items.push({
      id: key,
      label: PROCESS_LABELS[key] || title,
      hoursSavedPerWeek: Math.round(hoursSaved * 10) / 10,
      description: `Ahorro estimado al eliminar o automatizar tareas manuales en: ${title}`,
    });
  });

  return items;
}

/**
 * Builds full derived result from summary + insights + opportunities.
 */
export function deriveDiagnosticInsights(
  summary: {
    totalCurrentCost: { timeHours: number; moneyCost: number };
    totalPotentialSavings: { timeHours: number; moneyCost: number };
    roi?: number;
  },
  insights: Array<{
    opportunity?: { title: string };
    currentCost?: { timeHours: number; moneyCost: number; errorRate?: number };
    potentialSavings?: { timeHours: number; moneyCost: number; errorReduction?: number };
  }>,
  opportunities: Array<{ title: string; description: string }>,
  sector?: BusinessSector,
  nombre?: string,
  empresa?: string
): DerivedDiagnosticResult {
  const cur = summary.totalCurrentCost;
  const sav = summary.totalPotentialSavings;

  const hoursBreakdown = calculateSavingsBreakdown(
    insights,
    opportunities.map(o => o.title)
  );

  // If no breakdown from insights, create one generic line from total
  const finalBreakdown =
    hoursBreakdown.length > 0
      ? hoursBreakdown
      : sav.timeHours > 0
        ? [
            {
              id: 'general',
              label: 'Procesos manuales',
              hoursSavedPerWeek: Math.round(sav.timeHours * 10) / 10,
              description: 'Ahorro estimado al optimizar y automatizar procesos manuales.',
            },
          ]
        : [];

  const monthlySavings = Math.round(sav.moneyCost);
  const yearlySavings = monthlySavings * 12;
  const yearlyHoursSaved = Math.round(sav.timeHours * 52);

  const totalErrorRate = insights.reduce(
    (acc, i) => acc + (i.currentCost?.errorRate ?? 0),
    0
  );
  const avgErrorReduction = insights.length > 0
    ? insights.reduce((acc, i) => acc + (i.potentialSavings?.errorReduction ?? 0), 0) / insights.length
    : 0;

  const financialProjection: FinancialProjection = {
    monthlySavings,
    yearlySavings,
    yearlyHoursSaved,
  };

  const beforeState: BeforeState = {
    hoursPerWeekCurrent: Math.round(cur.timeHours * 10) / 10,
    monthlyCostCurrent: Math.round(cur.moneyCost),
    errorRateCurrent: Math.round(totalErrorRate),
  };

  const afterState: AfterState = {
    hoursPerWeekAfter: Math.round((cur.timeHours - sav.timeHours) * 10) / 10,
    monthlyCostAfter: Math.round(cur.moneyCost - sav.moneyCost),
    errorRateAfter: Math.round(Math.max(0, totalErrorRate - avgErrorReduction)),
  };

  const hoursPerMonth = sav.timeHours * 4.33;
  const impactEquivalents: ImpactEquivalents = {
    hoursSavedPerMonth: Math.round(hoursPerMonth * 10) / 10,
    workDaysSavedPerYear: Math.round((sav.timeHours * 52) / 8),
    workWeeksSavedPerYear: Math.round(sav.timeHours * 52 / 40),
  };

  const opportunityPlan: OpportunityPlanStep[] = opportunities.slice(0, 6).map((opp, i) => ({
    order: i + 1,
    title: opp.title,
    description: opp.description?.slice(0, 160) || '',
  }));

  const sectorName = sector ? getSectorDisplayName(sector) : 'tu negocio';
  const personalizedSummaryParagraph = generatePersonalizedSummaryText(
    { beforeState, afterState, financialProjection, impactEquivalents },
    { nombre: nombre || '', empresa: empresa || '', sectorName }
  );

  const nameForHero = nombre ? `${nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase()}, ` : '';
  const heroImpact: HeroImpact = {
    title: 'Tu diagnóstico está listo',
    subtitlePersonalized: cur.timeHours > 0
      ? `${nameForHero}actualmente estás perdiendo aproximadamente ${Math.round(cur.timeHours)} horas cada semana`
      : `${nameForHero}tu negocio tiene margen de mejora en tiempo y organización`,
    hoursLostPerWeek: Math.round(cur.timeHours * 10) / 10,
    equivalents: {
      hoursPerMonth: Math.round(cur.timeHours * 4.33 * 10) / 10,
      hoursPerYear: Math.round(cur.timeHours * 52),
      workDaysPerYear: Math.round((cur.timeHours * 52) / 8),
    },
  };

  const daysRecoveredPerWeek = sav.timeHours >= 8 ? Math.round((sav.timeHours / 8) * 10) / 10 : 0;
  const realLifeEquivalent: RealLifeEquivalentCard[] = [];
  if (daysRecoveredPerWeek >= 0.5) {
    realLifeEquivalent.push({
      title: daysRecoveredPerWeek >= 1
        ? `Equivale a ${daysRecoveredPerWeek} ${daysRecoveredPerWeek === 1 ? 'día completo' : 'días completos'} cada semana`
        : 'Equivale a medio día o más cada semana',
      description: 'Tiempo que podrías dedicar a estrategia o a tu vida personal.',
    });
  }
  if (sav.timeHours >= 20) {
    realLifeEquivalent.push({
      title: 'Equivale a medio empleado adicional',
      description: 'Sin el costo de contratar: mismas horas, mejor organización.',
    });
  }
  realLifeEquivalent.push({
    title: 'Equivale a recuperar control de tu operación',
    description: 'Menos estrés, menos errores y más claridad para crecer.',
  });

  const problemBreakdown: ProblemBreakdownItem[] = finalBreakdown.map((b) => ({
    label: b.label,
    hoursLostPerWeek: b.hoursSavedPerWeek,
  }));

  const beforeAfter: BeforeAfterBlock = {
    beforeHours: beforeState.hoursPerWeekCurrent,
    afterHours: Math.max(0, afterState.hoursPerWeekAfter),
    resultSummary: `Recuperas ${Math.round(sav.timeHours)}h cada semana`,
  };

  const emotionalOutcome: EmotionalOutcome = {
    paragraph:
      'Con estas mejoras, tu negocio funcionará con más control, menos errores y menos estrés. Tendrás claridad total y más tiempo para crecer.',
  };

  const psychological: PsychologicalResult = {
    heroImpact,
    realLifeEquivalent,
    problemBreakdown,
    beforeAfter,
    emotionalOutcome,
  };

  return {
    hoursBreakdown: finalBreakdown,
    financialProjection,
    beforeState,
    afterState,
    impactEquivalents,
    opportunityPlan,
    personalizedSummaryParagraph,
    psychological,
  };
}

/**
 * Generates a single personalized summary paragraph using actual numbers and names.
 */
export function generatePersonalizedSummaryText(
  data: {
    beforeState: BeforeState;
    afterState: AfterState;
    financialProjection: FinancialProjection;
    impactEquivalents: ImpactEquivalents;
  },
  context: { nombre: string; empresa: string; sectorName: string }
): string {
  const { beforeState, afterState, financialProjection, impactEquivalents } = data;
  const { nombre, empresa, sectorName } = context;

  const namePart = nombre ? `${nombre}, ` : '';
  const bizPart = empresa ? ` en ${empresa}` : '';

  if (
    beforeState.hoursPerWeekCurrent <= 0 &&
    beforeState.monthlyCostCurrent <= 0
  ) {
    return `${namePart}Tu ${sectorName} tiene procesos relativamente organizados. Con pequeñas mejoras podrías ahorrar aún más tiempo y reducir costos.`;
  }

  const parts: string[] = [];

  if (beforeState.hoursPerWeekCurrent > 0) {
    parts.push(
      `Según tus respuestas, actualmente dedicas aproximadamente ${beforeState.hoursPerWeekCurrent} horas por semana a procesos manuales${bizPart}.`
    );
  }
  if (beforeState.monthlyCostCurrent > 0) {
    parts.push(
      `El costo mensual estimado de estos procesos es de aproximadamente $${beforeState.monthlyCostCurrent}.`
    );
  }

  if (afterState.hoursPerWeekAfter >= 0 && beforeState.hoursPerWeekCurrent > 0) {
    const saved = beforeState.hoursPerWeekCurrent - afterState.hoursPerWeekAfter;
    parts.push(
      `Con automatización y gestión centralizada, podrías reducir esto a unas ${Math.max(0, afterState.hoursPerWeekAfter)} horas por semana, recuperando unas ${Math.round(saved)} horas semanales.`
    );
  }
  if (financialProjection.monthlySavings > 0) {
    parts.push(
      `El ahorro estimado es de $${financialProjection.monthlySavings} mensuales ($${financialProjection.yearlySavings} al año).`
    );
  }
  if (impactEquivalents.workDaysSavedPerYear > 0) {
    parts.push(
      `Esto equivale a aproximadamente ${impactEquivalents.workDaysSavedPerYear} días laborales recuperados al año.`
    );
  }

  return `${namePart}${parts.join(' ')}`;
}
