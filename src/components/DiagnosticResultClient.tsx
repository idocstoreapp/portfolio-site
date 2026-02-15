import { useEffect, useState } from 'react';
import type { BusinessSector } from '../utils/conversationalDiagnostic';
import { getServiceById, getRecommendedServicesForSector, getServicePageForExtendedType } from '../utils/services';
import type { Service } from '../utils/services';
import { deriveDiagnosticInsights } from '../utils/diagnosticResultDerivation';
import { 
  getCurrentSituationImageUrl, 
  getOpportunityImageUrl, 
  getOperationalImpactImageUrl, 
  getFutureVisionImageUrl, 
  getSummaryImageUrl,
  getOpportunitySectionImageUrl,
  getInsightImageUrl
} from '../utils/getResultImageUrl';

interface DiagnosticResultClientProps {
  diagnosticId: string;
  /** Si viene del backend, pasar los datos para mostrar la misma UI que en localStorage */
  initialData?: any;
}

const MAX_PREVIEW_CHARS = 100;
const MAX_HIGHLIGHTS_PREVIEW = 3;
const MAX_OPPORTUNITY_DESC_CHARS = 80;

export default function DiagnosticResultClient({ diagnosticId, initialData }: DiagnosticResultClientProps) {
  const [diagnosticData, setDiagnosticData] = useState<any>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<{ situation?: boolean; opportunities?: Record<number, boolean>; impact?: Record<number, boolean> }>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [countUp, setCountUp] = useState({ hours: 0, money: 0, roi: 0 });
  const [countUpDone, setCountUpDone] = useState(false);

  useEffect(() => {
    if (!diagnosticData) return;
    const els = document.querySelectorAll('[data-reveal-id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-reveal-id');
          if (id && entry.isIntersecting) setVisible((v) => ({ ...v, [id]: true }));
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [diagnosticData]);

  useEffect(() => {
    if (!visible.hero || !diagnosticData || countUpDone) return;
    const summary = diagnosticData.summary;
    const targetHours = Math.round(summary?.totalPotentialSavings?.timeHours ?? 0);
    const targetMoney = Math.round(summary?.totalPotentialSavings?.moneyCost ?? 0);
    const targetRoi = summary?.roi != null ? Math.round(summary.roi) : 0;
    const duration = 800;
    const steps = 24;
    const interval = duration / steps;
    let step = 0;
    const t = setInterval(() => {
      step += 1;
      const p = Math.min(1, step / steps);
      const ease = 1 - (1 - p) * (1 - p);
      setCountUp({
        hours: Math.round(ease * targetHours),
        money: Math.round(ease * targetMoney),
        roi: Math.round(ease * targetRoi),
      });
      if (step >= steps) {
        clearInterval(t);
        setCountUp({ hours: targetHours, money: targetMoney, roi: targetRoi });
        setCountUpDone(true);
      }
    }, interval);
    return () => clearInterval(t);
  }, [visible.hero, diagnosticData, countUpDone]);

  useEffect(() => {
    if (initialData) {
      setDiagnosticData(initialData);
      setLoading(false);
      return;
    }
    try {
      const stored = localStorage.getItem(`diagnostic-${diagnosticId}`);
      if (stored) {
        const data = JSON.parse(stored);
        
        if (!data.nextSteps) {
          data.nextSteps = {
            primary: { text: 'Solicitar consulta personalizada', link: '/contacto' },
            secondary: { text: 'Ver todos los servicios', link: '/servicios' }
          };
        }
        if (!data.urgency) data.urgency = 'medium';
        
        setDiagnosticData(data);
        setLoading(false);
      } else {
        setError('Diagnóstico no encontrado en localStorage');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar el diagnóstico');
      setLoading(false);
    }
  }, [diagnosticId, initialData]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
          Cargando tu diagnóstico...
        </h2>
        <p style={{ color: '#64748b' }}>Por favor espera un momento</p>
      </div>
    );
  }

  if (error || !diagnosticData) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
          {error || 'Diagnóstico no encontrado'}
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          {error || 'No se pudo cargar el diagnóstico. Por favor, realiza un nuevo diagnóstico.'}
        </p>
        <a 
          href="/#diagnostico-estrategico"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#0f172a',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 600
          }}
        >
          Realizar nuevo diagnóstico
        </a>
      </div>
    );
  }

  // Detectar si es un diagnóstico conversacional
  const isConversational = diagnosticData.type === 'conversational' ||
                          diagnosticData.summary !== undefined ||
                          diagnosticData.insights !== undefined;

  if (!isConversational) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
          Tipo de diagnóstico no soportado
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Este tipo de diagnóstico no puede ser renderizado desde localStorage.
        </p>
        <a 
          href="/#diagnostico-estrategico"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#0f172a',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 600
          }}
        >
          Realizar nuevo diagnóstico
        </a>
      </div>
    );
  }

  const sector = (diagnosticData?.sector || 'restaurante') as BusinessSector;
  const extendedType = diagnosticData.extendedType;
  const servicePage = diagnosticData.servicePage;
  
  // Obtener servicios seleccionados o recomendados según el tipo
  const selectedServicesIds = diagnosticData.selectedServices || [];
  let selectedServicesList: Service[] = selectedServicesIds
    .map((id: string) => getServiceById(id))
    .filter((s: Service | undefined): s is Service => s !== undefined);
  
  // Si no hay servicios seleccionados, usar recomendados según el tipo extendido
  if (selectedServicesList.length === 0) {
    selectedServicesList = getRecommendedServicesForSector(sector, extendedType);
  }
  
  // Agregar información de página específica a cada servicio
  const servicesWithPages = selectedServicesList.map(service => {
    // Si hay una página específica del servicio, usarla
    const specificPage = servicePage || getServicePageForExtendedType(extendedType);
    return {
      ...service,
      servicePage: specificPage || `/contacto?service=${service.id}`
    };
  });

  const summary = diagnosticData.summary;
  const hoursSave = Math.round(summary?.totalPotentialSavings?.timeHours ?? 0);
  const moneySave = Math.round(summary?.totalPotentialSavings?.moneyCost ?? 0);
  const roi = summary?.roi != null ? Math.round(summary.roi) : null;
  const opportunities = diagnosticData.opportunities || [];
  const errorReduction = opportunities.find((o: any) => o.impact?.errors != null)?.impact?.errors ?? '9%';
  const impactTime = (o: any) => o.impact?.timeHours != null ? `${Math.round(o.impact.timeHours)}h` : o.impact?.time;
  const impactMoney = (o: any) => o.impact?.moneyCost != null ? `$${Math.round(o.impact.moneyCost)}` : o.impact?.money;
  const baseCards = opportunities.slice(0, 4).map((opp: any) => ({
    title: opp.title,
    description: opp.description?.slice(0, 120) + (opp.description?.length > 120 ? '…' : '') || 'Mejora concreta para tu operación.',
    metric: impactTime(opp) || impactMoney(opp) || (opp.impact ? Object.values(opp.impact)[0] : null),
    icon: opp.title?.toLowerCase().includes('orden') ? '📋' : opp.title?.toLowerCase().includes('automat') ? '⚙️' : opp.title?.toLowerCase().includes('impacto') ? '📈' : '⏰',
  }));
  const fallbacks: { title: string; description: string; metric: string; icon: string }[] = [];
  if (hoursSave > 0) fallbacks.push({ title: 'Más tiempo libre', description: `Con ${hoursSave} horas semanales liberadas puedes dedicar más tiempo a estrategias o disfrutar tu tiempo libre.`, metric: `${hoursSave} Horas Ahorradas`, icon: '⏰' });
  if (moneySave > 0) fallbacks.push({ title: 'Impacto operativo positivo', description: 'Operativa más eficiente y controlada, mejorando la libertad y gestión del negocio.', metric: `$${moneySave} Ahorro Mensual`, icon: '📈' });
  fallbacks.push({ title: 'Menos errores', description: 'Automatización y procesos claros reducen equivocaciones y reprocesos.', metric: `-${typeof errorReduction === 'string' ? errorReduction : errorReduction + '%'} errores`, icon: '✓' });
  fallbacks.push({ title: 'Más control', description: 'Visibilidad total de tu operación y decisiones basadas en datos.', metric: 'Control total', icon: '🎯' });
  fallbacks.push({ title: 'Crecimiento', description: 'Escala tu negocio sin multiplicar horas ni costos operativos.', metric: roi != null ? `${roi}% ROI` : 'ROI positivo', icon: '📈' });
  const benefitCards = [...baseCards, ...fallbacks].slice(0, 6);

  const nombre = diagnosticData?.nombre || diagnosticData?.contactName || '';
  const empresa = diagnosticData?.empresa || diagnosticData?.contactCompany || '';
  const insights = diagnosticData?.insights || [];
  const opps = diagnosticData?.opportunities || [];

  const derivedFromServer = diagnosticData as typeof diagnosticData & {
    hoursBreakdown?: Array<{ id: string; label: string; hoursSavedPerWeek: number; description: string }>;
    financialProjection?: { monthlySavings: number; yearlySavings: number; yearlyHoursSaved: number };
    beforeState?: { hoursPerWeekCurrent: number; monthlyCostCurrent: number; errorRateCurrent: number };
    afterState?: { hoursPerWeekAfter: number; monthlyCostAfter: number; errorRateAfter: number };
    impactEquivalents?: { hoursSavedPerMonth: number; workDaysSavedPerYear: number; workWeeksSavedPerYear: number };
    opportunityPlan?: Array<{ order: number; title: string; description: string }>;
    personalizedSummaryParagraph?: string;
    psychological?: {
      heroImpact: { title: string; subtitlePersonalized: string; hoursLostPerWeek: number; equivalents: { hoursPerMonth: number; hoursPerYear: number; workDaysPerYear: number } };
      realLifeEquivalent: Array<{ title: string; description: string }>;
      problemBreakdown: Array<{ label: string; hoursLostPerWeek: number }>;
      beforeAfter: { beforeHours: number; afterHours: number; resultSummary: string };
      emotionalOutcome: { paragraph: string };
    };
  };

  const hasServerDerived = !!(derivedFromServer.personalizedSummaryParagraph || (derivedFromServer.hoursBreakdown && derivedFromServer.hoursBreakdown.length > 0) || derivedFromServer.financialProjection || derivedFromServer.impactEquivalents || (derivedFromServer.opportunityPlan && derivedFromServer.opportunityPlan.length > 0));
  const clientDerived = !hasServerDerived && summary ? deriveDiagnosticInsights(summary, insights, opps, sector, nombre, empresa) : null;

  const derived = (clientDerived ? {
    ...derivedFromServer,
    hoursBreakdown: clientDerived.hoursBreakdown,
    financialProjection: clientDerived.financialProjection,
    beforeState: clientDerived.beforeState,
    afterState: clientDerived.afterState,
    impactEquivalents: clientDerived.impactEquivalents,
    opportunityPlan: clientDerived.opportunityPlan,
    personalizedSummaryParagraph: clientDerived.personalizedSummaryParagraph,
    psychological: clientDerived.psychological,
  } : derivedFromServer) as typeof derivedFromServer;

  const psych = derived.psychological;

  const currentHours = Math.round(diagnosticData.summary?.totalCurrentCost?.timeHours || 0);
  const afterHours = Math.max(0, currentHours - hoursSave);
  const workDaysPerYear = derived.impactEquivalents?.workDaysSavedPerYear ?? Math.round((hoursSave * 52) / 8);
  const hoursPerMonth = derived.impactEquivalents?.hoursSavedPerMonth ?? Math.round(hoursSave * 4.33 * 10) / 10;
  const workDaysPerMonth = Math.round((hoursSave * 4.33) / 8);
  const monthsLaboralesPerYear = derived.impactEquivalents?.workWeeksSavedPerYear ? Math.round(derived.impactEquivalents.workWeeksSavedPerYear / 4) : Math.round((hoursSave * 52) / 160);

  const heroSubtitle = psych?.heroImpact?.subtitlePersonalized ?? (nombre
    ? `${nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase()}, tu negocio está perdiendo tiempo valioso cada semana`
    : 'Tu negocio está perdiendo tiempo valioso cada semana');

  return (
    <>
      {/* SECCIÓN 1 — HERO DE IMPACTO */}
      <div
        className={`result-hero-impact ${visible.hero ? 'result-reveal-visible' : ''}`}
        data-reveal-id="hero"
      >
        <div className="result-hero-impact-inner">
          <h1 className="result-hero-impact-title">{psych?.heroImpact?.title ?? 'Tu diagnóstico está listo'}</h1>
          <p className="result-hero-impact-subtitle">{heroSubtitle}</p>
          {psych?.heroImpact?.equivalents && (
            <div className="result-hero-equivalents">
              <p className="result-hero-equivalents-intro">Esto equivale a:</p>
              <ul className="result-hero-equivalents-list">
                <li><strong>{psych.heroImpact.equivalents.hoursPerMonth}</strong> horas al mes</li>
                <li><strong>{psych.heroImpact.equivalents.hoursPerYear}</strong> horas al año</li>
                <li><strong>{psych.heroImpact.equivalents.workDaysPerYear}</strong> días laborales al año</li>
              </ul>
            </div>
          )}
          <div className="result-hero-impact-cards">
            <div className="result-hero-impact-card">
              <span className="result-hero-impact-number">{countUp.hours}h</span>
              <span className="result-hero-impact-card-label">recuperables por semana</span>
            </div>
            <div className="result-hero-impact-card">
              <span className="result-hero-impact-number">${countUp.money}</span>
              <span className="result-hero-impact-card-label">ahorro mensual</span>
            </div>
            <div className="result-hero-impact-card">
              <span className="result-hero-impact-number">{workDaysPerYear}</span>
              <span className="result-hero-impact-card-label">días laborales recuperables al año</span>
            </div>
          </div>
          <a href="#que-significa" className="result-hero-impact-cta">Ver cómo recuperar este tiempo</a>
        </div>
      </div>

      {/* SECCIÓN 2 — QUÉ SIGNIFICA ESTO (cards emocionales si hay psychological) */}
      <div
        id="que-significa"
        className={`result-means-section result-reveal ${visible.hero ? 'result-reveal-visible' : ''}`}
        data-reveal-id="means"
      >
        <h2 className="result-section-title">{psych?.realLifeEquivalent?.length ? 'Qué significa esto' : 'Qué significa en la práctica'}</h2>
        {psych?.realLifeEquivalent && psych.realLifeEquivalent.length > 0 ? (
          <>
            <div className="result-means-cards result-means-cards-equivalent">
              {psych.realLifeEquivalent.map((card, idx) => (
                <div key={idx} className="result-means-card">
                  <span className="result-means-value">{card.title}</span>
                  <span className="result-means-label">{card.description}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="result-means-intro">Esto significa que cada mes estás perdiendo:</p>
            <div className="result-means-cards">
              <div className="result-means-card">
                <span className="result-means-value">{hoursPerMonth}h</span>
                <span className="result-means-label">de trabajo</span>
              </div>
              <div className="result-means-card">
                <span className="result-means-value">{workDaysPerMonth}</span>
                <span className="result-means-label">días laborales equivalentes</span>
              </div>
              <div className="result-means-card">
                <span className="result-means-value">{monthsLaboralesPerYear}</span>
                <span className="result-means-label">meses laborales al año</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* SECCIÓN 3 — DE DÓNDE SALE ESTO (breakdown) */}
      {((psych?.problemBreakdown?.length ?? 0) > 0 || derived.hoursBreakdown?.length > 0 || opportunities.length > 0) && (
        <div
          className={`result-causes-section result-reveal ${visible['beneficios-grid'] ? 'result-reveal-visible' : ''}`}
          data-reveal-id="causes"
        >
          <h2 className="result-section-title">De dónde sale esto</h2>
          <div className="result-causes-cards">
            {(psych?.problemBreakdown && psych.problemBreakdown.length > 0
              ? psych.problemBreakdown.map((item, idx) => ({ id: `pb-${idx}`, label: item.label, hoursSavedPerWeek: item.hoursLostPerWeek }))
              : derived.hoursBreakdown && derived.hoursBreakdown.length > 0
                ? derived.hoursBreakdown.map((item: { id: string; label: string; hoursSavedPerWeek: number }) => ({ id: item.id, label: item.label, hoursSavedPerWeek: item.hoursSavedPerWeek }))
                : opportunities.slice(0, 4).map((o: any, idx: number) => {
                    const h = o.impact?.timeHours ?? (typeof o.impact?.time === 'string' ? parseFloat(o.impact.time.replace(/\D/g, '')) || null : null) ?? (hoursSave / Math.max(1, opportunities.length));
                    return { id: `opp-${idx}`, label: o.title || 'Proceso manual', hoursSavedPerWeek: Math.round(h * 10) / 10 || 1 };
                  })
            ).map((item: { id: string; label: string; hoursSavedPerWeek: number }) => (
              <div key={item.id} className="result-cause-card">
                <h3 className="result-cause-title">{item.label}</h3>
                <p className="result-cause-hours">{item.hoursSavedPerWeek}h perdidas por semana</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN 4 — ANTES VS DESPUÉS */}
      {(psych?.beforeAfter || diagnosticData.summary) && (
        <div
          className={`result-before-after result-reveal ${visible['comparison'] ? 'result-reveal-visible' : ''}`}
          data-reveal-id="comparison"
        >
          <h2 className="result-section-title">Antes vs después</h2>
          <div className="result-before-after-grid">
            <div className="result-ba-block result-ba-before">
              <span className="result-ba-label">Antes</span>
              <span className="result-ba-value">{psych?.beforeAfter?.beforeHours ?? currentHours}h</span>
              <span className="result-ba-sublabel">por semana perdidas</span>
            </div>
            <div className="result-ba-block result-ba-after">
              <span className="result-ba-label">Después</span>
              <span className="result-ba-value">{psych?.beforeAfter?.afterHours ?? afterHours}h</span>
              <span className="result-ba-sublabel">por semana</span>
            </div>
            <div className="result-ba-block result-ba-result">
              <span className="result-ba-label">Resultado</span>
              <span className="result-ba-value">{psych?.beforeAfter?.resultSummary ?? `Recuperas ${hoursSave}h cada semana`}</span>
              <span className="result-ba-sublabel">cada semana</span>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 5 — RESULTADO EMOCIONAL */}
      <div
        className={`result-emotional result-reveal ${visible['comparison'] ? 'result-reveal-visible' : ''}`}
        data-reveal-id="emotional"
      >
        <p className="result-emotional-text">
          {psych?.emotionalOutcome?.paragraph ?? 'Con estas mejoras, tu negocio funcionará con más control, menos errores y menos estrés. Tendrás claridad total y más tiempo para crecer.'}
        </p>
      </div>

      {/* SECCIÓN — CÓMO CALCULAMOS ESTE RESULTADO */}
      <div
        className={`result-credibility result-reveal ${visible.credibility ? 'result-reveal-visible' : ''}`}
        data-reveal-id="credibility"
      >
        <h2 className="result-section-title">Cómo calculamos este resultado</h2>
        <p className="result-credibility-text">Este diagnóstico se basa en tus respuestas al cuestionario: tipo de negocio, cómo registras órdenes, inventarios, comisiones y horas dedicadas. Las estimaciones de tiempo y ahorro son conservadoras y están alineadas con experiencias reales de negocios similares al tuyo.</p>
      </div>

      {/* SECCIÓN 6 — SERVICIOS RECOMENDADOS */}
      {selectedServicesList.length > 0 && (
        <div
          className={`result-services-section result-reveal ${visible.services ? 'result-reveal-visible' : ''}`}
          data-reveal-id="services"
        >
          <h2 className="result-section-title">Servicios recomendados</h2>
          <p className="result-services-intro">Estos servicios se adaptan a lo que tu negocio necesita.</p>
          <div className="result-services-grid">
            {servicesWithPages.map((service: Service & { servicePage?: string }) => (
              <div 
                key={service.id}
                className="service-card-result-enhanced"
                style={{
                  background: service.popular 
                    ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
                    : '#ffffff',
                  border: service.popular 
                    ? '3px solid #3b82f6' 
                    : '2px solid #e2e8f0',
                  borderRadius: '24px',
                  padding: '2rem',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  boxShadow: service.popular 
                    ? '0 12px 40px rgba(59, 130, 246, 0.2)' 
                    : '0 4px 20px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = service.popular 
                    ? '0 12px 40px rgba(59, 130, 246, 0.2)' 
                    : '0 4px 20px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = service.popular ? '#3b82f6' : '#e2e8f0';
                }}
              >
                {/* Badge Popular mejorado */}
                {service.popular && (
                  <span style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    background: 'linear-gradient(135deg, #00C2FF 0%, #7C4DFF 100%)',
                    color: '#ffffff',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '999px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(0, 194, 255, 0.4)',
                    zIndex: 10
                  }}>
                    ⭐ Más Popular
                  </span>
                )}

                {/* Icono grande y destacado */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                  }}>
                    {service.icon || '⚙️'}
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '1rem',
                  marginTop: 0,
                  lineHeight: 1.3,
                  textAlign: 'center'
                }}>
                  {service.name}
                </h3>
                
                <p style={{
                  fontSize: '1rem',
                  color: '#64748b',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  {service.description}
                </p>
                
                {service.features && service.features.length > 0 && (
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      {service.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} style={{
                          display: 'flex',
                          alignItems: 'start',
                          gap: '0.75rem',
                          fontSize: '0.9375rem',
                          color: '#475569',
                          lineHeight: 1.6
                        }}>
                          <span style={{ 
                            color: '#3b82f6', 
                            flexShrink: 0, 
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            marginTop: '0.125rem'
                          }}>✓</span>
                          <span style={{ flex: 1 }}>{feature}</span>
                        </li>
                      ))}
                      {service.features.length > 4 && (
                        <li style={{
                          fontSize: '0.875rem',
                          color: '#94a3b8',
                          fontWeight: 600,
                          marginTop: '0.5rem',
                          textAlign: 'center'
                        }}>
                          +{service.features.length - 4} características adicionales
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {service.includesHardware && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: '#3b82f6',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.25rem' }}>📦</span>
                      <span>Incluye hardware completo</span>
                    </p>
                  </div>
                )}
                
                <a 
                  href={service.servicePage || `/contacto?service=${service.id}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    padding: '1rem 2rem',
                    background: service.popular
                      ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                      : '#0f172a',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    boxShadow: service.popular
                      ? '0 4px 16px rgba(59, 130, 246, 0.4)'
                      : '0 4px 12px rgba(15, 23, 42, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = service.popular
                      ? '0 8px 24px rgba(59, 130, 246, 0.5)'
                      : '0 8px 20px rgba(15, 23, 42, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = service.popular
                      ? '0 4px 16px rgba(59, 130, 246, 0.4)'
                      : '0 4px 12px rgba(15, 23, 42, 0.2)';
                  }}
                >
                  {service.servicePage ? 'Ver solución completa →' : `Solicitar ${service.name.split('(')[0].trim()}`}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Situación Actual - poco texto visible, imagen protagonista */}
      {diagnosticData.currentSituation && (
        <div
          className={`current-situation-section-modern diagnostic-result-mobile result-reveal ${visible.situation ? 'result-reveal-visible' : ''}`}
          data-reveal-id="situation"
        >
          <div className="current-situation-content">
            <div className="current-situation-text">
              <h2 className="current-situation-title">{diagnosticData.currentSituation.title}</h2>
              <div className="result-description-wrap">
                <p className={`current-situation-description result-description ${expanded.situation ? 'result-expanded' : ''}`}>
                  {diagnosticData.currentSituation.description}
                </p>
                {diagnosticData.currentSituation.description && diagnosticData.currentSituation.description.length > MAX_PREVIEW_CHARS && (
                  <button
                    type="button"
                    className="result-ver-mas"
                    onClick={() => setExpanded(e => ({ ...e, situation: !e.situation }))}
                  >
                    {expanded.situation ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
              {diagnosticData.currentSituation.highlights && diagnosticData.currentSituation.highlights.length > 0 && (
                <>
                  <ul className="current-situation-highlights">
                    {(expanded.situation ? diagnosticData.currentSituation.highlights : diagnosticData.currentSituation.highlights.slice(0, MAX_HIGHLIGHTS_PREVIEW)).map((highlight: string, idx: number) => (
                      <li key={idx} className="current-situation-highlight-item highlight-chip">
                        <span className="highlight-icon">✓</span>
                        <span className="highlight-text">{highlight.length > 60 ? highlight.slice(0, 60) + (highlight.length > 60 ? '…' : '') : highlight}</span>
                      </li>
                    ))}
                  </ul>
                  {!expanded.situation && diagnosticData.currentSituation.highlights.length > MAX_HIGHLIGHTS_PREVIEW && (
                    <button type="button" className="result-ver-mas" onClick={() => setExpanded(e => ({ ...e, situation: true }))}>
                      Ver {diagnosticData.currentSituation.highlights.length - MAX_HIGHLIGHTS_PREVIEW} más
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="current-situation-image-wrapper">
              {(() => {
                let imageUrl = diagnosticData.currentSituation.imageUrl;
                if (!imageUrl) {
                  imageUrl = getCurrentSituationImageUrl(sector);
                }
                return (
                  <img 
                    src={imageUrl} 
                    alt={diagnosticData.currentSituation.title || 'Situación actual'}
                    className="current-situation-image"
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Oportunidades - tarjetas modernas con expand */}
      {diagnosticData.opportunities && diagnosticData.opportunities.length > 0 && (
        <div
          className={`opportunities-section-modern diagnostic-result-mobile result-reveal ${visible.opportunities ? 'result-reveal-visible' : ''}`}
          data-reveal-id="opportunities"
        >
          <h2 className="opportunities-section-title">Oportunidades Detectadas</h2>
          <div className="opportunities-slider-wrapper">
            <div className="opportunities-slider" id="opportunities-slider">
              {diagnosticData.opportunities.map((opportunity: any, index: number) => {
                let imageUrl = opportunity.imageUrl;
                if (!imageUrl && opportunity.title) {
                  imageUrl = getOpportunityImageUrl(sector, opportunity.title);
                }
                const oppExpanded = expanded.opportunities?.[index];
                const shortDesc = opportunity.description && opportunity.description.length > MAX_OPPORTUNITY_DESC_CHARS
                  ? opportunity.description.slice(0, MAX_OPPORTUNITY_DESC_CHARS) + '…'
                  : opportunity.description;
                return (
                  <div key={index} className="opportunity-slide">
                    <div className="opportunity-card-modern">
                      <div className="opportunity-image-wrapper">
                        {imageUrl && (
                          <img 
                            src={imageUrl} 
                            alt={opportunity.title}
                            className="opportunity-image-modern"
                          />
                        )}
                      </div>
                      <div className="opportunity-content-modern">
                        <h3 className="opportunity-title-modern">{opportunity.title}</h3>
                        {opportunity.description && (
                          <div className="opportunity-desc-wrap">
                            <p className={`opportunity-description-modern result-description ${oppExpanded ? 'result-expanded' : ''}`}>
                              {oppExpanded ? opportunity.description : shortDesc}
                            </p>
                            {opportunity.description.length > MAX_OPPORTUNITY_DESC_CHARS && (
                              <button type="button" className="result-ver-mas" onClick={() => setExpanded(e => ({ ...e, opportunities: { ...e.opportunities, [index]: !oppExpanded } }))}>
                                {oppExpanded ? 'Ver menos' : 'Ver más'}
                              </button>
                            )}
                          </div>
                        )}
                        {opportunity.impact && (
                          <div className="opportunity-impact-modern impact-pills">
                            {Object.entries(opportunity.impact).map(([key, value]: [string, any]) => (
                              <div key={key} className="impact-item-modern">
                                <span className="impact-icon">{key === 'time' ? '⏱️' : key === 'money' ? '💰' : '📈'}</span>
                                <span className="impact-text">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {opportunity.improvements && opportunity.improvements.length > 0 && (
                          <div className="improvements-wrap">
                            <ul className="improvement-list-modern">
                              {opportunity.improvements.slice(0, oppExpanded ? undefined : 2).map((improvement: string, idx: number) => (
                                <li key={idx} className="improvement-item-modern">
                                  <span className="improvement-icon">✓</span>
                                  {improvement}
                                </li>
                              ))}
                            </ul>
                            {!oppExpanded && opportunity.improvements.length > 2 && (
                              <button type="button" className="result-ver-mas" onClick={() => setExpanded(e => ({ ...e, opportunities: { ...e.opportunities, [index]: true } }))}>
                                Ver {opportunity.improvements.length - 2} beneficios más
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Impacto Operativo - imagen y título destacados, texto breve */}
      {diagnosticData.operationalImpact && (
        <div
          className={`operational-impact-section-modern diagnostic-result-mobile result-reveal ${visible.impact ? 'result-reveal-visible' : ''}`}
          data-reveal-id="impact"
        >
          <h2 className="operational-impact-title">{diagnosticData.operationalImpact.title}</h2>
          <p className="operational-impact-description result-description result-expanded">{diagnosticData.operationalImpact.description}</p>
          {diagnosticData.operationalImpact.consequences && diagnosticData.operationalImpact.consequences.length > 0 && (
            <div className="operational-impact-consequences">
              {diagnosticData.operationalImpact.consequences.map((consequence: any, index: number) => {
                const areaLower = consequence.area?.toLowerCase() || '';
                let impactArea: 'tiempo' | 'costos' | 'errores' | 'crecimiento' = 'tiempo';
                if (areaLower.includes('tiempo')) impactArea = 'tiempo';
                else if (areaLower.includes('costo')) impactArea = 'costos';
                else if (areaLower.includes('error')) impactArea = 'errores';
                else if (areaLower.includes('crecimiento')) impactArea = 'crecimiento';
                let imageUrl = consequence.imageUrl;
                if (!imageUrl) imageUrl = getOperationalImpactImageUrl(sector, impactArea);
                const isEven = index % 2 === 0;
                const impactExp = expanded.impact?.[index];
                const shortImpact = consequence.impact && consequence.impact.length > MAX_PREVIEW_CHARS
                  ? consequence.impact.slice(0, MAX_PREVIEW_CHARS) + '…'
                  : consequence.impact;
                return (
                  <div key={index} className={`consequence-card-modern ${isEven ? 'text-left' : 'image-left'}`}>
                    {isEven ? (
                      <>
                        <div className="consequence-content-modern">
                          <h3 className="consequence-area-modern">{consequence.area}</h3>
                          <div className="result-description-wrap">
                            <p className={`consequence-impact-modern result-description ${impactExp ? 'result-expanded' : ''}`}>
                              {impactExp ? consequence.impact : shortImpact}
                            </p>
                            {consequence.impact && consequence.impact.length > MAX_PREVIEW_CHARS && (
                              <button type="button" className="result-ver-mas" onClick={() => setExpanded(e => ({ ...e, impact: { ...e.impact, [index]: !impactExp } }))}>
                                {impactExp ? 'Ver menos' : 'Ver más'}
                              </button>
                            )}
                          </div>
                        </div>
                        {imageUrl && (
                          <div className="consequence-image-wrapper">
                            <img src={imageUrl} alt={consequence.area} className="consequence-image-modern" />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {imageUrl && (
                          <div className="consequence-image-wrapper">
                            <img src={imageUrl} alt={consequence.area} className="consequence-image-modern" />
                          </div>
                        )}
                        <div className="consequence-content-modern">
                          <h3 className="consequence-area-modern">{consequence.area}</h3>
                          <div className="result-description-wrap">
                            <p className={`consequence-impact-modern result-description ${impactExp ? 'result-expanded' : ''}`}>
                              {impactExp ? consequence.impact : shortImpact}
                            </p>
                            {consequence.impact && consequence.impact.length > MAX_PREVIEW_CHARS && (
                              <button type="button" className="result-ver-mas" onClick={() => setExpanded(e => ({ ...e, impact: { ...e.impact, [index]: !impactExp } }))}>
                                {impactExp ? 'Ver menos' : 'Ver más'}
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Visión Futura */}
      {diagnosticData.futureVision && (
        <div
          className={`future-vision-section-modern result-reveal ${visible.future ? 'result-reveal-visible' : ''}`}
          data-reveal-id="future"
        >
          <div className="future-vision-content">
            <div className="future-vision-left">
              {(() => {
                let imageUrl = diagnosticData.futureVision.imageUrl;
                if (!imageUrl) {
                  imageUrl = getFutureVisionImageUrl(sector);
                }
                return (
                  <div className="future-vision-image-wrapper">
                    <img 
                      src={imageUrl} 
                      alt={diagnosticData.futureVision.title}
                      className="future-vision-image"
                    />
                    <div className="future-vision-text-overlay">
                      <h2 className="future-vision-title-overlay">{diagnosticData.futureVision.title}</h2>
                      <p className="future-vision-description-overlay">{diagnosticData.futureVision.description}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
            {diagnosticData.futureVision.benefits && diagnosticData.futureVision.benefits.length > 0 && (
              <div className="future-vision-benefits">
                {diagnosticData.futureVision.benefits.map((benefit: any, index: number) => {
                  const totalBenefits = diagnosticData.futureVision.benefits.length;
                  const isAloneInLastRow = totalBenefits % 2 !== 0 && index === totalBenefits - 1;
                  return (
                    <div 
                      key={index}
                      className={`benefit-card-modern ${isAloneInLastRow ? 'benefit-card-full-width' : ''}`}
                    >
                      <div className="benefit-icon-modern">{benefit.icon}</div>
                      <h3 className="benefit-title-modern">{benefit.title}</h3>
                      <p className="benefit-description-modern">{benefit.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA Final Prominente con Pulso y Gradiente */}
      {diagnosticData.nextSteps?.primary && (
        <div
          className={`result-reveal ${visible.cta ? 'result-reveal-visible' : ''}`}
          data-reveal-id="cta"
          style={{
          margin: '6rem 0 4rem',
          padding: '4rem 2rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '32px',
          maxWidth: '1000px',
          marginLeft: 'auto',
          marginRight: 'auto',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Efecto de brillo animado */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            animation: 'pulse-glow 3s ease-in-out infinite',
            pointerEvents: 'none'
          }} />
          
          {diagnosticData.urgency && (
            <div style={{
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              fontSize: '1.125rem',
              color: '#ffffff',
              fontWeight: 600
            }}>
              {diagnosticData.urgency === 'high' && (
                <>
                  <span style={{ fontSize: '1.5rem' }}>⚡</span>
                  <span>Tu negocio necesita esta solución ahora</span>
                </>
              )}
              {diagnosticData.urgency === 'medium' && (
                <>
                  <span style={{ fontSize: '1.5rem' }}>📈</span>
                  <span>Esta solución puede acelerar tu crecimiento</span>
                </>
              )}
              {diagnosticData.urgency === 'low' && (
                <>
                  <span style={{ fontSize: '1.5rem' }}>✨</span>
                  <span>Esta solución puede optimizar tu operación</span>
                </>
              )}
            </div>
          )}
          
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            letterSpacing: '-0.02em'
          }}>
            Tu negocio puede mejorar significativamente
          </h2>
          
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '2.5rem',
            lineHeight: 1.6,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Agenda una demo o habla con un especialista para llevar estos resultados a la práctica.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <a 
              href={diagnosticData.nextSteps.primary.link || '/contacto'}
              style={{
                display: 'inline-block',
                padding: '1.25rem 2.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '1.25rem',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.4)';
              }}
            >
              Agendar demo
            </a>
            <a 
              href="/contacto"
              style={{
                padding: '0.875rem 1.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              Hablar con especialista
            </a>
          </div>
        </div>
      )}
      
      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        @keyframes pulse-button {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
          }
          50% {
            box-shadow: 0 8px 40px rgba(16, 185, 129, 0.6);
          }
        }
      `}</style>
    </>
  );
}
