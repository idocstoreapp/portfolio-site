import { useEffect, useState } from 'react';
import type { BusinessSector } from '../utils/conversationalDiagnostic';
import { getServiceById, getRecommendedServicesForSector, getServicePageForExtendedType } from '../utils/services';
import type { Service } from '../utils/services';
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
}

const MAX_PREVIEW_CHARS = 100;
const MAX_HIGHLIGHTS_PREVIEW = 3;
const MAX_OPPORTUNITY_DESC_CHARS = 80;

export default function DiagnosticResultClient({ diagnosticId }: DiagnosticResultClientProps) {
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    try {
      const stored = localStorage.getItem(`diagnostic-${diagnosticId}`);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Asegurar que tenga nextSteps y urgency
        if (!data.nextSteps) {
          data.nextSteps = {
            primary: {
              text: 'Solicitar consulta personalizada',
              link: '/contacto'
            },
            secondary: {
              text: 'Ver todos los servicios',
              link: '/servicios'
            }
          };
        }
        if (!data.urgency) {
          data.urgency = 'medium';
        }
        
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
  }, [diagnosticId]);

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
    const { getRecommendedServicesForSector } = require('../utils/services');
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

  return (
    <>
      {/* SECCIÓN 1 — Hero de resultado premium */}
      <div
        className={`result-hero-premium ${visible.hero ? 'result-reveal-visible' : ''}`}
        data-reveal-id="hero"
      >
        <div className="result-hero-premium-inner">
          <h1 className="result-hero-premium-title">Tu diagnóstico está listo</h1>
          <p className="result-hero-premium-subtitle">
            Estas son las oportunidades detectadas para mejorar tu negocio
          </p>
          <div className="result-hero-premium-metrics">
            <div className="result-hero-metric-block">
              <div className="result-hero-metric-ring" style={{ ['--progress' as string]: Math.min(100, (hoursSave || 1) / 20 * 100) }}>
                <span className="result-hero-metric-value">+{countUp.hours}h</span>
                <span className="result-hero-metric-label">Horas ahorradas</span>
              </div>
            </div>
            <div className="result-hero-metric-block">
              <div className="result-hero-metric-ring result-hero-metric-ring-money" style={{ ['--progress' as string]: Math.min(100, (moneySave || 1) / 500 * 100) }}>
                <span className="result-hero-metric-value">${countUp.money}</span>
                <span className="result-hero-metric-label">Ahorro mensual</span>
              </div>
            </div>
            <div className="result-hero-metric-block">
              <div className="result-hero-metric-ring result-hero-metric-ring-roi" style={{ ['--progress' as string]: roi != null ? Math.min(100, roi) : 0 }}>
                <span className="result-hero-metric-value">{countUp.roi}%</span>
                <span className="result-hero-metric-label">ROI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de 4 beneficios (icono + descripción corta + métrica) */}
      {benefitCards.length > 0 && (
        <div
          id="beneficios-clave"
          className={`result-beneficios-grid result-reveal ${visible['beneficios-grid'] ? 'result-reveal-visible' : ''}`}
          data-reveal-id="beneficios-grid"
        >
          <h2 className="result-beneficios-title">Beneficios Clave Detectados</h2>
          <div className="result-beneficios-cards">
            {benefitCards.map((card: { title: string; description: string; metric: string | number | null; icon: string }, idx: number) => (
              <div key={idx} className="result-beneficio-card">
                <div className="result-beneficio-icon">{card.icon}</div>
                <h3 className="result-beneficio-card-title">{card.title}</h3>
                <p className="result-beneficio-card-desc">{card.description}</p>
                {card.metric && (
                  <div className="result-beneficio-metric">
                    <span className="result-beneficio-metric-icon">{String(card.metric).startsWith('$') ? '💰' : '⏱️'}</span>
                    <span>{card.metric}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN 3 — Comparación visual: Situación actual vs optimizada */}
      {diagnosticData.summary && (
        <div
          className={`result-comparison-section result-reveal ${visible['comparison'] ? 'result-reveal-visible' : ''}`}
          data-reveal-id="comparison"
        >
          <h2 className="result-comparison-title">Comparación visual</h2>
          <p className="result-comparison-subtitle">Situación actual vs situación optimizada</p>
          <div className="result-comparison-cards">
            <div className="result-comparison-card result-comparison-card-actual">
              <div className="result-comparison-card-label">Situación actual</div>
              <div className="result-comparison-metric">
                <span className="result-comparison-value">{Math.round(diagnosticData.summary.totalCurrentCost?.timeHours || 0)}h</span>
                <span className="result-comparison-metric-label">por semana</span>
              </div>
              <div className="result-comparison-metric">
                <span className="result-comparison-value">${Math.round(diagnosticData.summary.totalCurrentCost?.moneyCost || 0)}</span>
                <span className="result-comparison-metric-label">por mes</span>
              </div>
              <p className="result-comparison-card-desc">Tiempo y dinero en procesos manuales</p>
            </div>
            <div className="result-comparison-card result-comparison-card-optimized">
              <div className="result-comparison-card-label">Situación optimizada</div>
              <div className="result-comparison-metric">
                <span className="result-comparison-value">-{Math.round(diagnosticData.summary.totalPotentialSavings?.timeHours || 0)}h</span>
                <span className="result-comparison-metric-label">por semana</span>
              </div>
              <div className="result-comparison-metric">
                <span className="result-comparison-value">+${Math.round(diagnosticData.summary.totalPotentialSavings?.moneyCost || 0)}</span>
                <span className="result-comparison-metric-label">ahorro mensual</span>
              </div>
              <p className="result-comparison-card-desc">Con automatización y mejores procesos</p>
            </div>
          </div>
        </div>
      )}

      {/* Testimonial + CTA verde */}
      <div
        className={`result-testimonial-cta result-reveal ${visible['testimonial'] ? 'result-reveal-visible' : ''}`}
        data-reveal-id="testimonial"
      >
        <div className="result-testimonial">
          <span className="result-testimonial-quote">"</span>
          <p className="result-testimonial-text">
            Las oportunidades detectadas me han permitido ahorrar tiempo y reducir errores en mi negocio. Estoy muy satisfecho con los resultados y el impacto positivo que ha tenido en mi operativa diaria.
          </p>
          <p className="result-testimonial-author">Jonathan Guarirap, Dueño de negocio.</p>
          <div className="result-testimonial-stars">★★★★★</div>
          <div className="result-testimonial-photo-wrap">
            <div className="result-testimonial-photo" aria-hidden />
          </div>
        </div>
        <a href="/contacto" className="result-cta-green">
          <span className="result-cta-green-icon">✉️</span>
          Contáctanos Para Saber Más →
        </a>
      </div>

      {/* Servicios Seleccionados - Diseño mejorado y más visual */}
      {selectedServicesList.length > 0 && (
        <div
          className={`selected-services-section-modern result-reveal ${visible.services ? 'result-reveal-visible' : ''}`}
          data-reveal-id="services"
          style={{ margin: '4rem 0' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Servicios Recomendados para Ti
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
              Basado en tu diagnóstico, estos son los servicios que mejor se adaptan a las necesidades de tu negocio
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '2rem', 
            maxWidth: '1400px', 
            margin: '0 auto' 
          }}>
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
