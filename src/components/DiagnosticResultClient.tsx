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

export default function DiagnosticResultClient({ diagnosticId }: DiagnosticResultClientProps) {
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      {/* Mensaje Personalizado */}
      <div className="result-header">
        <h1 className="result-title">{diagnosticData.personalizedMessage?.greeting || 'Hola'}</h1>
        <p className="result-subtitle">{diagnosticData.personalizedMessage?.context || 'He analizado tu negocio'}</p>
      </div>

      {/* Servicios Seleccionados - Diseño mejorado y más visual */}
      {selectedServicesList.length > 0 && (
        <div className="selected-services-section-modern" style={{ margin: '4rem 0' }}>
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

      {/* Situación Actual */}
      {diagnosticData.currentSituation && (
        <div className="current-situation-section-modern">
          <div className="current-situation-content">
            <div className="current-situation-text">
              <h2 className="current-situation-title">{diagnosticData.currentSituation.title}</h2>
              <p className="current-situation-description">{diagnosticData.currentSituation.description}</p>
              {diagnosticData.currentSituation.highlights && diagnosticData.currentSituation.highlights.length > 0 && (
                <ul className="current-situation-highlights">
                  {diagnosticData.currentSituation.highlights.map((highlight: string, idx: number) => (
                    <li key={idx} className="current-situation-highlight-item">
                      <span className="highlight-icon">✓</span>
                      <span className="highlight-text">{highlight}</span>
                    </li>
                  ))}
                </ul>
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

      {/* Dashboard: ROI/Ahorro Estimado - Rediseñado como Dashboard */}
      {diagnosticData.summary && (
        <div style={{
          margin: '4rem 0',
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '32px',
          maxWidth: '1400px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '1rem',
              letterSpacing: '-0.02em'
            }}>
              Tu Ahorro Estimado
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#64748b',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Comparación entre tu situación actual y el potencial con nuestras soluciones
            </p>
          </div>

          {/* Cards de Comparación */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Card: Costos Actuales (Rojo) */}
            <div style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              borderRadius: '24px',
              padding: '2.5rem',
              color: '#ffffff',
              boxShadow: '0 12px 40px rgba(220, 38, 38, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '1.5rem',
                opacity: 0.9
              }}>
                Costos Actuales
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  lineHeight: 1.2
                }}>
                  {Math.round(diagnosticData.summary.totalCurrentCost?.timeHours || 0)}h
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  opacity: 0.9,
                  marginBottom: '1.5rem'
                }}>
                  por semana
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  lineHeight: 1.2
                }}>
                  ${Math.round(diagnosticData.summary.totalCurrentCost?.moneyCost || 0)}
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  opacity: 0.9
                }}>
                  por mes
                </div>
              </div>
              <div style={{
                fontSize: '0.9375rem',
                opacity: 0.8,
                lineHeight: 1.6,
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                Tiempo y dinero que estás perdiendo en procesos manuales
              </div>
            </div>

            {/* Card: Ahorro Potencial (Verde) */}
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '24px',
              padding: '2.5rem',
              color: '#ffffff',
              boxShadow: '0 12px 40px rgba(16, 185, 129, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '1.5rem',
                opacity: 0.9
              }}>
                Tu Ahorro con Maestro Digital
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  lineHeight: 1.2
                }}>
                  -{Math.round(diagnosticData.summary.totalPotentialSavings?.timeHours || 0)}h
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  opacity: 0.9,
                  marginBottom: '1.5rem'
                }}>
                  por semana
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  lineHeight: 1.2
                }}>
                  +${Math.round(diagnosticData.summary.totalPotentialSavings?.moneyCost || 0)}
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  opacity: 0.9
                }}>
                  por mes
                </div>
              </div>
              <div style={{
                fontSize: '0.9375rem',
                opacity: 0.8,
                lineHeight: 1.6,
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                Tiempo y dinero que puedes ahorrar con automatización
              </div>
            </div>

            {/* Card: ROI Estimado */}
            {diagnosticData.summary.roi && (
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '24px',
                padding: '2.5rem',
                color: '#ffffff',
                boxShadow: '0 12px 40px rgba(59, 130, 246, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '1.5rem',
                  opacity: 0.9
                }}>
                  ROI Estimado
                </div>
                <div style={{
                  fontSize: '4rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  marginBottom: '1rem'
                }}>
                  {Math.round(diagnosticData.summary.roi)}%
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  opacity: 0.9,
                  lineHeight: 1.6
                }}>
                  Retorno de inversión proyectado
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Oportunidades */}
      {diagnosticData.opportunities && diagnosticData.opportunities.length > 0 && (
        <div className="opportunities-section-modern">
          <h2 className="opportunities-section-title">Oportunidades Detectadas</h2>
          <div className="opportunities-slider-wrapper">
            <div className="opportunities-slider" id="opportunities-slider">
              {diagnosticData.opportunities.map((opportunity: any, index: number) => {
                let imageUrl = opportunity.imageUrl;
                if (!imageUrl && opportunity.title) {
                  imageUrl = getOpportunityImageUrl(sector, opportunity.title);
                }
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
                        <p className="opportunity-description-modern">{opportunity.description}</p>
                        {opportunity.impact && (
                          <div className="opportunity-impact-modern">
                            {Object.entries(opportunity.impact).map(([key, value]: [string, any]) => (
                              <div key={key} className="impact-item-modern">
                                <span className="impact-icon">{key === 'time' ? '⏱️' : key === 'money' ? '💰' : '📈'}</span>
                                <span className="impact-text">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {opportunity.improvements && opportunity.improvements.length > 0 && (
                          <ul className="improvement-list-modern">
                            {opportunity.improvements.map((improvement: string, idx: number) => (
                              <li key={idx} className="improvement-item-modern">
                                <span className="improvement-icon">✓</span>
                                {improvement}
                              </li>
                            ))}
                          </ul>
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

      {/* Impacto Operativo */}
      {diagnosticData.operationalImpact && (
        <div className="operational-impact-section-modern">
          <h2 className="operational-impact-title">{diagnosticData.operationalImpact.title}</h2>
          <p className="operational-impact-description">{diagnosticData.operationalImpact.description}</p>
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
                if (!imageUrl) {
                  imageUrl = getOperationalImpactImageUrl(sector, impactArea);
                }
                
                const isEven = index % 2 === 0;
                
                return (
                  <div key={index} className={`consequence-card-modern ${isEven ? 'text-left' : 'image-left'}`}>
                    {isEven ? (
                      <>
                        <div className="consequence-content-modern">
                          <h3 className="consequence-area-modern">{consequence.area}</h3>
                          <p className="consequence-impact-modern">{consequence.impact}</p>
                        </div>
                        {imageUrl && (
                          <div className="consequence-image-wrapper">
                            <img 
                              src={imageUrl} 
                              alt={consequence.area}
                              className="consequence-image-modern"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {imageUrl && (
                          <div className="consequence-image-wrapper">
                            <img 
                              src={imageUrl} 
                              alt={consequence.area}
                              className="consequence-image-modern"
                            />
                          </div>
                        )}
                        <div className="consequence-content-modern">
                          <h3 className="consequence-area-modern">{consequence.area}</h3>
                          <p className="consequence-impact-modern">{consequence.impact}</p>
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
        <div className="future-vision-section-modern">
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
        <div style={{
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
            ¡No pierdas más tiempo ni dinero!
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
            Agenda tu demo gratuita hoy y recibe un 15% de descuento en la implementación.
          </p>
          
          {/* CTA Principal con Pulso */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <a 
              href={diagnosticData.nextSteps.primary.link || '/contacto'}
              style={{
                display: 'inline-block',
                padding: '1.5rem 3rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '1.25rem',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 1,
                animation: 'pulse-button 2s ease-in-out infinite'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(16, 185, 129, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.4)';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>💬</span>
                <span>¡Quiero Mi Transformación Ahora!</span>
              </span>
            </a>
          </div>
          
          {/* Social Proof */}
          <div style={{
            marginTop: '2.5rem',
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 500
          }}>
            ⭐⭐⭐⭐⭐ Más de 500 negocios ya confían en nosotros
          </div>
          
          {/* CTAs Secundarios */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}>
            {diagnosticData.nextSteps.secondary && (
              <a 
                href={diagnosticData.nextSteps.secondary.link || '/servicios'}
                style={{
                  padding: '0.875rem 1.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                {diagnosticData.nextSteps.secondary.text || 'Ver servicios'}
              </a>
            )}
            <a 
              href="/contacto"
              style={{
                padding: '0.875rem 1.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Hablar con un especialista
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
