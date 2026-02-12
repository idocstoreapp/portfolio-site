/**
 * Wizard de Diagnóstico Conversacional Empresarial
 * 
 * Enfoque consultivo con cálculo de costos y ahorros
 * UX conversacional, no como test repetitivo
 */

import React, { useState, useEffect } from 'react';
import {
  type BusinessSector,
  SECTOR_QUESTIONS,
  TRANSVERSAL_QUESTIONS,
  calculateCostsAndSavings,
  generateInsights,
  generatePersonalizedMessage,
  generateEnhancedResultStructure,
  type ConversationalQuestion
} from '../utils/conversationalDiagnostic';
import { createDiagnostic } from '../utils/backendClient';
import { getIconFileName } from '../utils/iconMapping';
import { 
  SERVICES, 
  SERVICE_CATEGORIES, 
  getRecommendedServicesForSector,
  type Service,
  type ServiceCategory 
} from '../utils/services';

// Tipos de negocio expandidos para mejor clasificación
type ExtendedBusinessType = 
  | 'restaurante' 
  | 'servicio-tecnico-celulares' 
  | 'servicio-tecnico-general'
  | 'taller-vehiculos' 
  | 'taller-motos'
  | 'muebleria'
  | 'comercio-catalogo'
  | 'pagina-web'
  | 'portfolio'
  | 'servicios-profesionales';

const BUSINESS_SECTORS: Array<{ 
  value: BusinessSector; 
  extendedType?: ExtendedBusinessType;
  label: string; 
  description: string; 
  icon: string;
  servicePage?: string; // Página específica del servicio
}> = [
  { 
    value: 'restaurante', 
    extendedType: 'restaurante',
    label: 'Restaurante / Bar / Café', 
    description: 'Negocio de comida y bebidas', 
    icon: '/images/icons/restaurante.png',
    servicePage: '/soluciones/restaurantes'
  },
  { 
    value: 'servicio-tecnico', 
    extendedType: 'servicio-tecnico-celulares',
    label: 'Servicio Técnico (Celulares, Tablets, Notebooks)', 
    description: 'Reparación de dispositivos móviles y computadores', 
    icon: '/images/icons/servicio-tecnico.png',
    servicePage: '/soluciones/servicio-tecnico'
  },
  { 
    value: 'servicio-tecnico', 
    extendedType: 'servicio-tecnico-general',
    label: 'Servicio Técnico (Consolas, TV, Electrónica)', 
    description: 'Reparación de consolas, televisores, controles y otros dispositivos', 
    icon: '/images/icons/servicio-tecnico.png',
    servicePage: '/soluciones/servicio-tecnico'
  },
  { 
    value: 'taller', 
    extendedType: 'taller-vehiculos',
    label: 'Taller Mecánico (Vehículos)', 
    description: 'Reparación de autos, camionetas y vehículos', 
    icon: '/images/icons/taller.png',
    servicePage: '/soluciones/taller-mecanico'
  },
  { 
    value: 'taller', 
    extendedType: 'taller-motos',
    label: 'Taller Mecánico (Motos)', 
    description: 'Reparación de motos y motocicletas', 
    icon: '/images/icons/taller.png',
    servicePage: '/soluciones/taller-mecanico'
  },
  { 
    value: 'fabrica', 
    extendedType: 'muebleria',
    label: 'Mueblería / Fábrica', 
    description: 'Producción de muebles y cotizaciones a medida', 
    icon: '/images/icons/fabrica.png',
    servicePage: '/soluciones/cotizador-fabrica'
  },
  { 
    value: 'comercio', 
    extendedType: 'comercio-catalogo',
    label: 'Comercio / Tienda con Catálogo', 
    description: 'Venta de productos con catálogo online', 
    icon: '/images/icons/tienda.png',
    servicePage: '/soluciones/desarrollo-web' // O crear página específica
  },
  { 
    value: 'servicios', 
    extendedType: 'pagina-web',
    label: 'Página Web Simple', 
    description: 'Sitio web informativo para tu negocio', 
    icon: '/images/icons/servicios-profesionales.png',
    servicePage: '/soluciones/desarrollo-web'
  },
  { 
    value: 'servicios', 
    extendedType: 'portfolio',
    label: 'Portfolio / Portafolio', 
    description: 'Muestra tu trabajo y proyectos', 
    icon: '/images/icons/servicios-profesionales.png',
    servicePage: '/soluciones/desarrollo-web'
  },
  { 
    value: 'servicios', 
    extendedType: 'servicios-profesionales',
    label: 'Servicios Profesionales', 
    description: 'Consultoría, diseño, servicios especializados', 
    icon: '/images/icons/servicios-profesionales.png',
    servicePage: '/soluciones/desarrollo-web'
  }
];

interface DiagnosticAnswers {
  sector?: BusinessSector;
  extendedType?: ExtendedBusinessType; // Tipo específico de negocio
  servicePage?: string; // Página del servicio específico
  [key: string]: any;
}

export default function ConversationalDiagnosticWizard() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = selección de sector
  const [selectedSector, setSelectedSector] = useState<BusinessSector | null>(null);
  const [answers, setAnswers] = useState<DiagnosticAnswers>({});
  const [contactInfo, setContactInfo] = useState({ name: '', company: '', email: '' });
  const [selectedServices, setSelectedServices] = useState<string[]>([]); // IDs de servicios seleccionados
  const [currentServiceCategory, setCurrentServiceCategory] = useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false); // Flag para saber si se completó

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevenir envío si se abandona el wizard antes de completarlo
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Solo mostrar advertencia si el wizard está en progreso pero no completado
      if (!isCompleted && selectedSector && currentStep >= 0) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requiere returnValue
        return ''; // Algunos navegadores requieren return string
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isCompleted, selectedSector, currentStep]);

  // Aplicar filtro negro a todos los iconos después de renderizar
  useEffect(() => {
    const applyBlackFilter = () => {
      // Buscar todas las imágenes de iconos
      const iconImages = document.querySelectorAll('.card-icon img, .option-card img, .sector-option-card img, .sector-selection-grid img');
      iconImages.forEach((img: Element) => {
        const imgElement = img as HTMLImageElement;
        // Aplicar filtro directamente con máxima prioridad
        imgElement.style.setProperty('filter', 'grayscale(100%) brightness(0)', 'important');
        imgElement.style.setProperty('-webkit-filter', 'grayscale(100%) brightness(0)', 'important');
        // También agregar clase para CSS
        imgElement.classList.add('black-icon');
      });
      
      // Buscar todos los spans que contienen emojis y aplicar filtro
      const emojiSpans = document.querySelectorAll('.card-icon span:not([data-icon-fallback]), .option-card .card-icon span:not([data-icon-fallback])');
      emojiSpans.forEach((span: Element) => {
        const spanElement = span as HTMLElement;
        // Aplicar filtro a emojis (aunque no funcionará perfectamente)
        spanElement.style.setProperty('filter', 'grayscale(100%) brightness(0) contrast(200%)', 'important');
        spanElement.style.setProperty('-webkit-filter', 'grayscale(100%) brightness(0) contrast(200%)', 'important');
        spanElement.classList.add('black-emoji-icon');
      });
    };

    // Aplicar inmediatamente
    applyBlackFilter();

    // Aplicar después de delays para imágenes que se cargan después
    const timeouts = [
      setTimeout(applyBlackFilter, 50),
      setTimeout(applyBlackFilter, 100),
      setTimeout(applyBlackFilter, 300),
      setTimeout(applyBlackFilter, 500)
    ];
    
    // Agregar listener para cuando las imágenes se carguen
    const handleImageLoad = (e: Event) => {
      const img = e.target as HTMLImageElement;
      if (img) {
        img.style.setProperty('filter', 'brightness(0) saturate(0)', 'important');
        img.style.setProperty('-webkit-filter', 'brightness(0) saturate(0)', 'important');
        img.classList.add('black-icon');
      }
    };

    // Agregar listener a todas las imágenes existentes
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
      if (img.complete) {
        applyBlackFilter();
      } else {
        img.addEventListener('load', handleImageLoad);
      }
    });
    
    // Observar cambios en el DOM para aplicar a nuevas imágenes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element;
            // Buscar imágenes en el nodo agregado
            const images = element.querySelectorAll ? element.querySelectorAll('img') : [];
            images.forEach((img: HTMLImageElement) => {
              img.style.setProperty('filter', 'brightness(0) saturate(0)', 'important');
              img.style.setProperty('-webkit-filter', 'brightness(0) saturate(0)', 'important');
              img.classList.add('black-icon');
              if (!img.complete) {
                img.addEventListener('load', handleImageLoad);
              }
            });
            // Si el nodo mismo es una imagen
            if (element.tagName === 'IMG') {
              const img = element as HTMLImageElement;
              img.style.setProperty('filter', 'brightness(0) saturate(0)', 'important');
              img.style.setProperty('-webkit-filter', 'brightness(0) saturate(0)', 'important');
              img.classList.add('black-icon');
              if (!img.complete) {
                img.addEventListener('load', handleImageLoad);
              }
            }
          }
        });
      });
      applyBlackFilter();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      observer.disconnect();
      allImages.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
      });
    };
  }, [currentStep, selectedSector]); // Re-ejecutar cuando cambie el paso o sector

  // Obtener todas las preguntas en orden
  const getAllQuestions = (): ConversationalQuestion[] => {
    if (!selectedSector) return [];
    
    const sectorQuestions = SECTOR_QUESTIONS[selectedSector] || [];
    return [...sectorQuestions, ...TRANSVERSAL_QUESTIONS];
  };

  const isSectorSelection = currentStep === -1;
  
  // Obtener todas las preguntas si hay sector seleccionado
  const allQuestions = selectedSector ? getAllQuestions() : [];
  
  // Paso especial: selección de servicios (después de todas las preguntas)
  const SERVICES_STEP = allQuestions.length; // El paso después de todas las preguntas
  
  // Determinar si estamos en el paso de servicios
  const isServicesStep = selectedSector && currentStep === SERVICES_STEP;
  
  // Calcular currentQuestion de forma segura
  let currentQuestion: ConversationalQuestion | undefined = undefined;
  if (selectedSector && allQuestions.length > 0 && !isServicesStep) {
    if (currentStep >= 0 && currentStep < allQuestions.length) {
      currentQuestion = allQuestions[currentStep];
    } else {
      // Si currentStep está fuera de rango, ajustarlo
      console.warn('currentStep fuera de rango:', { currentStep, allQuestionsLength: allQuestions.length });
    }
  }
  
  const isLastQuestion = selectedSector && allQuestions.length > 0 && currentStep >= 0
    ? currentStep === allQuestions.length - 1 
    : false;

  // Verificar si todas las preguntas están respondidas
  const isAllQuestionsAnswered = () => {
    if (!selectedSector) return false;
    
    const allQuestions = getAllQuestions();
    
    // Verificar que todas las preguntas tengan respuesta
    for (const question of allQuestions) {
      const answer = answers[question.id];
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        return false;
      }
    }
    
    return true;
  };

  // Manejar envío final - SOLO si se completó todo el test
  const handleSubmit = async () => {
    // Verificar que todas las preguntas estén respondidas
    if (!isAllQuestionsAnswered()) {
      setError('Por favor, completa todas las preguntas antes de enviar el diagnóstico.');
      return;
    }

    setLoading(true);
    setError('');
    setIsCompleted(true); // Marcar como completado antes de enviar

    try {
      // Calcular costos y ahorros
      const summary = calculateCostsAndSavings(answers, selectedSector!);
      const insights = generateInsights(answers, selectedSector!);
      const personalizedMessage = generatePersonalizedMessage(answers, selectedSector!, summary);
      
      // Generar estructura mejorada de resultados
      const nombre = answers.nombre || contactInfo.name || '';
      const empresa = answers.empresa || contactInfo.company || '';
      
      const enhancedStructure = generateEnhancedResultStructure(
        { ...answers, nombre, empresa },
        selectedSector!,
        insights,
        summary
      );

      // Preparar datos para el backend
      const diagnosticData = {
        tipoEmpresa: selectedSector || '',
        businessType: selectedSector || '',
        extendedType: answers.extendedType, // Tipo específico de negocio
        servicePage: answers.servicePage, // Página del servicio específico
        selectedServices: selectedServices, // Incluir servicios seleccionados
        sector: selectedSector || '',
        ...Object.fromEntries(
          Object.entries(answers).filter(([key]) => key !== 'sector')
        ),
        nombre: contactInfo.name || undefined,
        empresa: contactInfo.company || undefined,
        email: contactInfo.email || undefined,
        summary: enhancedStructure.summary,
        insights,
        personalizedMessage,
        currentSituation: enhancedStructure.currentSituation || null,
        opportunities: enhancedStructure.opportunities || [],
        operationalImpact: enhancedStructure.operationalImpact || null,
        futureVision: enhancedStructure.futureVision || null
      };

      // Generar ID único para el diagnóstico
      const diagnosticId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Preparar resultado completo para guardar
      // Asegurar que tenga nextSteps y urgency para evitar errores en la página de resultado
      // Si hay una página de servicio específica, dirigir allí
      const primaryLink = answers.servicePage || '/contacto';
      const primaryText = answers.servicePage 
        ? 'Ver solución específica para mi negocio'
        : 'Solicitar consulta personalizada';
      
      const fullResult = {
        ...diagnosticData,
        id: diagnosticId,
        type: 'conversational',
        sector: selectedSector || diagnosticData.sector,
        extendedType: answers.extendedType || diagnosticData.extendedType,
        servicePage: answers.servicePage || diagnosticData.servicePage,
        selectedServices: selectedServices || diagnosticData.selectedServices,
        // Agregar nextSteps y urgency si no existen
        nextSteps: {
          primary: {
            text: primaryText,
            link: primaryLink
          },
          secondary: {
            text: 'Ver todos los servicios',
            link: '/servicios'
          }
        },
        urgency: 'medium' as const,
        created_at: new Date().toISOString(),
      };

      // Guardar en localStorage inmediatamente
      if (typeof window !== 'undefined') {
        localStorage.setItem(`diagnostic-${diagnosticId}`, JSON.stringify(fullResult));
        console.log('✅ [WIZARD] Diagnostic saved to localStorage:', diagnosticId);
      }

      // Intentar enviar al backend (pero no bloquear si falla)
      try {
        const response = await createDiagnostic(diagnosticData);
        
        if (response.success && response.data?.id) {
          // Si el backend responde con un ID diferente, actualizar
          if (response.data.id !== diagnosticId) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`diagnostic-${diagnosticId}`);
              localStorage.setItem(`diagnostic-${response.data.id}`, JSON.stringify({
                ...fullResult,
                id: response.data.id
              }));
            }
            window.location.href = `/diagnostico/${response.data.id}`;
          } else {
            window.location.href = `/diagnostico/${diagnosticId}`;
          }
        } else {
          // Si el backend no responde bien, usar el ID local
          window.location.href = `/diagnostico/${diagnosticId}`;
        }
      } catch (err) {
        console.warn('⚠️ [WIZARD] Backend not available, using local storage:', err);
        // Si el backend falla, usar localStorage
        window.location.href = `/diagnostico/${diagnosticId}`;
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError('Error al generar el diagnóstico. Por favor, intenta de nuevo.');
      setLoading(false);
      setIsCompleted(false);
    }
  };

  // Calcular progreso total
  const totalSteps = selectedSector ? (getAllQuestions().length + 1) : 1; // +1 para el paso de servicios
  const currentProgress = isSectorSelection ? 0 : (isServicesStep ? totalSteps : currentStep + 1);
  const progressPercentage = (currentProgress / totalSteps) * 100;

  // Paso inicial: Selección de sector
  if (isSectorSelection) {
    return (
      <div className="wizard-step active" style={{ display: 'block' }}>
        {/* Barra de progreso elegante */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto 2rem',
          height: '4px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progressPercentage}%`,
            background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
            borderRadius: '999px',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)'
          }} />
        </div>

        <div className="step-header">
          <div className="conversational-intro">
            <h3 className="step-title" style={{
              fontSize: isMobile ? '1.5rem' : '2.25rem',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '0.5rem',
              lineHeight: 1.2,
              letterSpacing: '-0.02em'
            }}>¿Cuál es tu negocio?</h3>
            <p className="step-description" style={{
              fontSize: isMobile ? '0.875rem' : '1.125rem',
              color: '#64748b',
              lineHeight: 1.5,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Selecciona el tipo de negocio que mejor describe el tuyo
            </p>
          </div>
        </div>
        <div className="cards-grid sector-selection-grid" style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
          gap: isMobile ? '0.5rem' : '2rem',
          marginTop: isMobile ? '1rem' : '2.5rem',
          maxWidth: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: isMobile ? '0.5rem' : '2rem',
          paddingRight: isMobile ? '0.5rem' : '2rem',
          paddingBottom: isMobile ? '1rem' : '0'
        }}>
          {BUSINESS_SECTORS.map((sector) => {
            const isSelected = selectedSector === sector.value;
            return (
            <button
              key={sector.value}
                className={`option-card sector-option-card ${isSelected ? 'selected' : ''}`}
              style={{
                  background: isSelected ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#FFFFFF',
                  border: isSelected ? '3px solid #3b82f6' : '2px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: 0,
                textAlign: 'left',
                cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                position: 'relative',
                  boxShadow: isSelected 
                    ? '0 12px 32px rgba(59, 130, 246, 0.3), 0 0 0 4px rgba(59, 130, 246, 0.1)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.08)',
                width: '100%',
                transform: 'scale(1)',
                  transformOrigin: 'center',
                  minHeight: isMobile ? '280px' : '320px'
              }}
              onMouseEnter={(e) => {
                  if (!isMobile && !isSelected) {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(59, 130, 246, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                  if (!isMobile && !isSelected) {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                }
              }}
              onClick={() => {
                setSelectedSector(sector.value);
                setAnswers({ 
                  sector: sector.value,
                  extendedType: sector.extendedType,
                  servicePage: sector.servicePage
                });
                setCurrentStep(0);
              }}
            >
                {/* Imagen de fondo del sector */}
                <div style={{
                  width: '100%',
                  height: isMobile ? '70px' : '200px',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)' 
                    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                display: 'flex',
                alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Icono o imagen del sector */}
                  <div style={{
                    width: isMobile ? '45px' : '100px',
                    height: isMobile ? '45px' : '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1
              }}>
                <img 
                  src={sector.icon} 
                  alt={sector.label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                        filter: isSelected ? 'brightness(0) invert(1)' : 'grayscale(100%) brightness(0)',
                        opacity: isSelected ? 1 : 0.6
                  }}
                />
              </div>
                  {/* Anillo de selección */}
                  {isSelected && (
              <div style={{ 
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '120%',
                      height: '120%',
                      borderRadius: '50%',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }} />
                  )}
                </div>
                
                {/* Contenido de texto */}
                <div style={{ 
                  padding: isMobile ? '0.5rem 0.5rem' : '1.5rem',
                display: 'flex', 
                flexDirection: 'column', 
                  gap: '0.5rem',
                  flex: 1
                }}>
                  <h4 style={{
                    fontSize: isMobile ? '0.8125rem' : '1.25rem',
                    fontWeight: 700,
                    color: isSelected ? '#FFFFFF' : '#0f172a',
                  margin: 0,
                    lineHeight: 1.3,
                  letterSpacing: '-0.01em'
                }}>
                  {sector.label}
                </h4>
                  <p style={{
                    fontSize: isMobile ? '0.6875rem' : '0.9375rem',
                    color: isSelected ? 'rgba(255, 255, 255, 0.9)' : '#64748b',
                  margin: 0,
                    lineHeight: 1.5
                }}>
                  {sector.description}
                </p>
              </div>

                {/* Indicador de selección */}
                {isSelected && (
                <div style={{ 
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}>
                    <span style={{ color: '#3b82f6', fontSize: '1.125rem', fontWeight: 'bold' }}>✓</span>
                </div>
              )}
            </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Si no hay sector seleccionado, no debería llegar aquí (ya se maneja en isSectorSelection)
  if (!selectedSector) {
    return null;
  }

  // Mostrar error si existe
  if (error && !loading) {
    return (
      <div className="wizard-step active" style={{ display: 'block' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2B2B2B', marginBottom: '1rem' }}>
            Error al procesar el diagnóstico
          </h3>
          <p style={{ color: '#6B7280', marginBottom: '2rem' }}>{error}</p>
          <button
            onClick={() => {
              setError('');
              setLoading(false);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#2B2B2B',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // Mostrar loading
  if (loading) {
    return (
      <div className="wizard-step active" style={{ display: 'block' }}>
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2B2B2B', marginBottom: '1rem' }}>
            Generando tu diagnóstico...
          </h3>
          <p style={{ color: '#6B7280' }}>Esto puede tomar unos momentos</p>
        </div>
      </div>
    );
  }

  // Renderizar paso de selección de servicios
  if (isServicesStep) {
    const recommendedServices = getRecommendedServicesForSector(selectedSector);
    const allServicesList = Object.values(SERVICES).flat();
    
    return (
      <div className="wizard-step active" style={{ display: 'block' }}>
        <div className="step-header">
          <div className="conversational-intro">
            <h3 className="step-title">¿Qué servicios te interesan?</h3>
            <p className="step-description">
              Selecciona los servicios que te gustaría conocer o implementar. Puedes elegir varios o ninguno.
            </p>
          </div>
        </div>

        {/* Categorías de servicios */}
        <div style={{ marginTop: '2rem' }}>
          {SERVICE_CATEGORIES.map((category) => {
            const categoryServices = SERVICES[category.id];
            const isCategoryExpanded = currentServiceCategory === category.id;
            
            return (
              <div key={category.id} style={{ marginBottom: '1.5rem' }}>
                <button
                  onClick={() => setCurrentServiceCategory(isCategoryExpanded ? null : category.id)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    background: isCategoryExpanded ? '#2B2B2B' : '#FFFFFF',
                    border: `2px solid ${isCategoryExpanded ? '#2B2B2B' : '#E5E5E3'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    color: isCategoryExpanded ? '#FFFFFF' : '#2B2B2B'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCategoryExpanded) {
                      e.currentTarget.style.borderColor = '#2B2B2B';
                      e.currentTarget.style.background = '#F6F5F2';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCategoryExpanded) {
                      e.currentTarget.style.borderColor = '#E5E5E3';
                      e.currentTarget.style.background = '#FFFFFF';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ 
                        margin: 0, 
                        fontSize: '1.125rem', 
                        fontWeight: 600,
                        color: isCategoryExpanded ? '#FFFFFF' : '#2B2B2B'
                      }}>
                        {category.name}
                      </h4>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '0.875rem', 
                        color: isCategoryExpanded ? '#D1D5DB' : '#6B7280',
                        marginTop: '0.25rem'
                      }}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '1.25rem' }}>
                    {isCategoryExpanded ? '−' : '+'}
                  </span>
                </button>

                {isCategoryExpanded && (
                  <div style={{ 
                    marginTop: '1rem',
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem'
                  }}>
                    {categoryServices.map((service) => {
                      const isSelected = selectedServices.includes(service.id);
                      const isRecommended = recommendedServices.some(s => s.id === service.id);
                      
                      return (
                        <button
                          key={service.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedServices(selectedServices.filter(id => id !== service.id));
                            } else {
                              setSelectedServices([...selectedServices, service.id]);
                            }
                          }}
                          style={{
                            padding: '1.5rem',
                            background: isSelected ? '#2B2B2B' : '#FFFFFF',
                            border: `2px solid ${isSelected ? '#2B2B2B' : '#E5E5E3'}`,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            boxShadow: isSelected ? '0 4px 12px rgba(43, 43, 43, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.05)'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#2B2B2B';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#E5E5E3';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                            }
                          }}
                        >
                          {isRecommended && (
                            <span style={{
                              position: 'absolute',
                              top: '0.75rem',
                              right: '0.75rem',
                              background: '#3B82F6',
                              color: '#FFFFFF',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px'
                            }}>
                              Recomendado
                            </span>
                          )}
                          {service.popular && (
                            <span style={{
                              position: 'absolute',
                              top: '0.75rem',
                              right: isRecommended ? '4.5rem' : '0.75rem',
                              background: '#10B981',
                              color: '#FFFFFF',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px'
                            }}>
                              Popular
                            </span>
                          )}
                          <h5 style={{ 
                            margin: 0, 
                            marginBottom: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: isSelected ? '#FFFFFF' : '#2B2B2B'
                          }}>
                            {service.name}
                          </h5>
                          <p style={{ 
                            margin: 0,
                            fontSize: '0.875rem',
                            color: isSelected ? '#D1D5DB' : '#6B7280',
                            lineHeight: 1.5
                          }}>
                            {service.description}
                          </p>
                          {service.features && service.features.length > 0 && (
                            <ul style={{
                              margin: '0.75rem 0 0 0',
                              paddingLeft: '1.25rem',
                              fontSize: '0.8125rem',
                              color: isSelected ? '#D1D5DB' : '#6B7280',
                              listStyle: 'disc'
                            }}>
                              {service.features.slice(0, 3).map((feature, idx) => (
                                <li key={idx} style={{ marginBottom: '0.25rem' }}>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}
                          <div style={{
                            marginTop: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span style={{
                              width: '20px',
                              height: '20px',
                              border: `2px solid ${isSelected ? '#FFFFFF' : '#9CA3AF'}`,
                              borderRadius: '4px',
                              background: isSelected ? '#2B2B2B' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {isSelected && (
                                <span style={{ color: '#FFFFFF', fontSize: '0.875rem' }}>✓</span>
                              )}
                            </span>
                            <span style={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: isSelected ? '#FFFFFF' : '#6B7280'
                            }}>
                              {isSelected ? 'Seleccionado' : 'Seleccionar'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Información de contacto */}
        <div className="contact-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #E5E5E3' }}>
          <h4 className="contact-title" style={{ 
            fontSize: '1.125rem', 
            fontWeight: 600, 
            color: '#2B2B2B',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Antes de generar tu diagnóstico, cuéntame un poco más
          </h4>
          <div className="contact-inputs" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <input
              type="text"
              className="contact-input"
              placeholder="Tu nombre (opcional)"
              value={contactInfo.name}
              onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
              style={{
                padding: '0.75rem 1rem',
                border: '2px solid #E5E5E3',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'border-color 0.3s ease'
              }}
            />
            <input
              type="text"
              className="contact-input"
              placeholder="Nombre de tu empresa (opcional)"
              value={contactInfo.company}
              onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
              style={{
                padding: '0.75rem 1rem',
                border: '2px solid #E5E5E3',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'border-color 0.3s ease'
              }}
            />
            <input
              type="email"
              className="contact-input"
              placeholder="Tu email (opcional)"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              style={{
                padding: '0.75rem 1rem',
                border: '2px solid #E5E5E3',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'border-color 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Botones de navegación */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button
            className="btn-back"
            onClick={() => setCurrentStep(currentStep - 1)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#F6F5F2',
              border: '2px solid #E5E5E3',
              borderRadius: '8px',
              color: '#2B2B2B',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 500,
              transition: 'all 0.3s ease'
            }}
          >
            ← Anterior
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={loading || !isAllQuestionsAnswered()}
            style={{
              padding: '0.75rem 1.5rem',
              background: loading || !isAllQuestionsAnswered() ? '#9CA3AF' : '#2B2B2B',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              cursor: loading || !isAllQuestionsAnswered() ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 500,
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Generando tu diagnóstico...' : 'Generar mi diagnóstico personalizado'}
          </button>
        </div>
        {!isAllQuestionsAnswered() && (
          <p style={{ 
            marginTop: '1rem', 
            color: '#9A9A97', 
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            Por favor, completa todas las preguntas para generar tu diagnóstico
          </p>
        )}
      </div>
    );
  }

  // Obtener la pregunta actual de forma segura
  // Si currentQuestion es undefined pero hay preguntas disponibles, obtenerla directamente
  let questionToRender = currentQuestion;
  if (!questionToRender && allQuestions.length > 0 && currentStep >= 0 && currentStep < allQuestions.length) {
    questionToRender = allQuestions[currentStep];
  }
  
  // Verificar que tenemos una pregunta válida para mostrar
  if (!questionToRender) {
    // Si no hay preguntas disponibles, mostrar error
    if (allQuestions.length === 0) {
      console.error('No se encontraron preguntas para el sector:', selectedSector);
      return (
        <div className="wizard-step active">
          <div className="step-header">
            <h3 className="step-title">Error</h3>
            <p className="step-description">No se encontraron preguntas para este sector. Por favor, intenta de nuevo.</p>
          </div>
        </div>
      );
    }
    
    // Si hay preguntas pero no podemos obtener la actual, mostrar estado de carga
    console.warn('No se pudo obtener la pregunta actual:', { currentStep, allQuestionsLength: allQuestions.length, selectedSector });
    return (
      <div className="wizard-step active">
        <div className="step-header">
          <h3 className="step-title">Cargando preguntas...</h3>
          <p className="step-description">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  // Renderizar pregunta actual
  const renderQuestion = () => {
    // Usar questionToRender que ya está validado
    const question = questionToRender;
    const isMultiple = question.type === 'multiple';
    const isNumber = question.type === 'number';
    const isText = question.type === 'text';
    const selectedValue = answers[question.id];
    const isFirstQuestion = currentStep === 0;
    const questionProgress = ((currentStep + 1) / allQuestions.length) * 100;

    return (
      <div className="wizard-step active">
        {/* Barra de progreso elegante y delgada */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto 2rem',
          height: '3px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${questionProgress}%`,
            background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
            borderRadius: '999px',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)'
          }} />
        </div>

        {/* Mensaje motivacional */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            fontWeight: 500,
            margin: 0
          }}>
            ¡Estás cerca de tu diagnóstico personalizado!
          </p>
        </div>

        <div className="step-header">
          <div className="conversational-question">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: '#64748b',
              fontWeight: 500
            }}>
              <span>Paso {currentStep + 1} de {allQuestions.length}</span>
            </div>
            <h3 className="step-title" style={{
              fontSize: isMobile ? '1.5rem' : '2.25rem',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '0.5rem',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              textAlign: 'center'
            }}>{question.title}</h3>
            {question.subtitle && (
              <p className="step-description" style={{
                fontSize: isMobile ? '0.875rem' : '1.125rem',
                color: '#64748b',
                lineHeight: 1.5,
                textAlign: 'center',
                maxWidth: '700px',
                margin: '0 auto'
              }}>{question.subtitle}</p>
            )}
          </div>
        </div>

        {isNumber && (
          <div className="input-container">
            <input
              type="number"
              className="number-input"
              placeholder={question.placeholder || 'Ingresa un número'}
              value={selectedValue || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setAnswers({ ...answers, [question.id]: value });
              }}
              min={question.validation?.min}
              max={question.validation?.max}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              {!isFirstQuestion && (
                <button
                  className="btn-back"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#F6F5F2',
                    border: '2px solid #E5E5E3',
                    borderRadius: '8px',
                    color: '#2B2B2B',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  }}
                >
                  ← Anterior
                </button>
              )}
              <button
                className="btn-continue"
                onClick={() => {
                  if (isLastQuestion) {
                  setCurrentStep(SERVICES_STEP);
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                disabled={!selectedValue || selectedValue < (question.validation?.min || 1)}
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {isText && (
          <div className="input-container">
            <input
              type="text"
              className="text-input"
              placeholder={question.placeholder || 'Escribe tu respuesta'}
              value={selectedValue || ''}
              onChange={(e) => {
                setAnswers({ ...answers, [question.id]: e.target.value });
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              {!isFirstQuestion && (
                <button
                  className="btn-back"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#F6F5F2',
                    border: '2px solid #E5E5E3',
                    borderRadius: '8px',
                    color: '#2B2B2B',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  }}
                >
                  ← Anterior
                </button>
              )}
              <button
                className="btn-continue"
                onClick={() => {
                  if (isLastQuestion) {
                  setCurrentStep(SERVICES_STEP);
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                disabled={!selectedValue}
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {question.options && (() => {
          const optionsCount = question.options.length;
          const use5Columns = optionsCount >= 10 && !isMobile;
          const use2ColumnsMobile = optionsCount >= 10 && isMobile;
          
          return (
            <div 
              className={`cards-grid ${use5Columns ? 'grid-5-columns' : ''} ${use2ColumnsMobile ? 'grid-2-columns-mobile' : ''}`}
              style={{ 
            display: 'grid',
                gridTemplateColumns: isMobile 
                  ? (use2ColumnsMobile ? 'repeat(2, 1fr)' : '1fr')
                  : use5Columns
                    ? 'repeat(5, 1fr)' 
                    : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: isMobile && use2ColumnsMobile ? '0.5rem' : (isMobile ? '1rem' : '1.5rem'),
                marginTop: isMobile && use2ColumnsMobile ? '1rem' : '2.5rem',
                maxWidth: use5Columns ? '1400px' : '1000px',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: '100%',
                paddingLeft: isMobile && use2ColumnsMobile ? '0.5rem' : '0',
                paddingRight: isMobile && use2ColumnsMobile ? '0.5rem' : '0',
                paddingBottom: isMobile && use2ColumnsMobile ? '1rem' : '0'
              } as React.CSSProperties}>
            {question.options.map((option) => {
              const isSelected = isMultiple
                ? Array.isArray(selectedValue) && selectedValue.includes(option.value)
                : selectedValue === option.value;

              return (
                <button
                  key={option.value}
                  className={`option-card ${isMultiple ? 'multi-select' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                      : '#FFFFFF',
                    border: isSelected 
                      ? '3px solid #3b82f6' 
                      : '2px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: isMobile && optionsCount >= 10 ? '1rem 0.75rem' : '0',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: isSelected 
                      ? '0 12px 32px rgba(59, 130, 246, 0.3), 0 0 0 4px rgba(59, 130, 246, 0.1)' 
                      : '0 4px 12px rgba(0, 0, 0, 0.08)',
                    minHeight: isMobile && optionsCount >= 10 ? '140px' : (isMobile ? '280px' : '320px'),
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isMobile) {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 16px 40px rgba(59, 130, 246, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isMobile) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                    }
                  }}
                  onClick={() => {
                    if (isMultiple) {
                      const currentArray = Array.isArray(selectedValue) ? selectedValue : [];
                      const newValue = isSelected
                        ? currentArray.filter(v => v !== option.value)
                        : [...currentArray, option.value];
                      setAnswers({ ...answers, [question.id]: newValue });
                    } else {
                      setAnswers({ ...answers, [question.id]: option.value });
                      // Auto-avanzar después de un breve delay para mejor UX
                      // Si es la última pregunta, avanzar al paso de servicios
                        setTimeout(() => {
                        if (isLastQuestion) {
                          setCurrentStep(SERVICES_STEP);
                        } else {
                          setCurrentStep(currentStep + 1);
                        }
                        }, 300);
                    }
                  }}
                >
                  {/* Área de imagen/icono */}
                  <div style={{
                    width: '100%',
                    height: isMobile && optionsCount >= 10 ? '70px' : (isMobile ? '180px' : '200px'),
                    background: isSelected 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)' 
                      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Icono o imagen de la opción */}
                  {option.icon && (
                      <div style={{
                        width: isMobile && optionsCount >= 10 ? '45px' : (isMobile ? '80px' : '100px'),
                        height: isMobile && optionsCount >= 10 ? '45px' : (isMobile ? '80px' : '100px'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1
                      }}>
                      {(() => {
                        // Intentar usar icono de imagen si existe
                        const iconFileName = currentQuestion ? getIconFileName(currentQuestion.id, option.value) : null;
                        const iconPath = iconFileName ? `/images/icons/${iconFileName}` : null;
                        
                        // Si es una ruta de imagen (http, /, o archivo de icono)
                        if (typeof option.icon === 'string' && (option.icon.startsWith('http') || option.icon.startsWith('/'))) {
                          return <img 
                            src={option.icon} 
                            alt={option.label}
                            style={{ 
                                width: '100%',
                                height: '100%',
                              objectFit: 'contain',
                                filter: isSelected ? 'brightness(0) invert(1)' : 'grayscale(100%) brightness(0)',
                                opacity: isSelected ? 1 : 0.6
                            }}
                          />;
                        }
                        
                        // Si tenemos un icono mapeado, intentar usarlo
                        if (iconPath) {
                          return <img 
                            src={iconPath} 
                            alt={option.label}
                            style={{ 
                                width: '100%',
                                height: '100%',
                              objectFit: 'contain',
                                filter: isSelected ? 'brightness(0) invert(1)' : 'grayscale(100%) brightness(0)',
                                opacity: isSelected ? 1 : 0.6
                            }}
                          />;
                        }
                        
                          // Fallback a emoji
                        if (option.icon && typeof option.icon === 'string') {
                          const iconStr = option.icon;
                            if (!iconStr.startsWith('http') && !iconStr.startsWith('/') && !iconStr.includes('.')) {
                              return <span style={{ 
                                fontSize: isMobile ? '3rem' : '4rem',
                              display: 'inline-block',
                                filter: isSelected ? 'brightness(0) invert(1)' : 'grayscale(100%) brightness(0)',
                                opacity: isSelected ? 1 : 0.6
                              }}>{option.icon}</span>;
                            }
                          }
                          
                          return null;
                      })()}
                    </div>
                  )}
                    
                    {/* Anillo de selección animado */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '120%',
                        height: '120%',
                        borderRadius: '50%',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }} />
                    )}
                  </div>
                  
                  {/* Contenido de texto */}
                  <div style={{ 
                    padding: isMobile && optionsCount >= 10 ? '0.5rem 0.5rem' : (isMobile ? '1.25rem' : '1.5rem'),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile && optionsCount >= 10 ? '0.25rem' : '0.5rem',
                    flex: 1
                  }}>
                    <h4 style={{
                      fontSize: isMobile && optionsCount >= 10 ? '0.8125rem' : (isMobile ? '1.125rem' : '1.25rem'),
                      fontWeight: 700,
                      color: isSelected ? '#FFFFFF' : '#0f172a',
                    margin: 0,
                      lineHeight: 1.3,
                      letterSpacing: '-0.01em'
                  }}>
                    {option.label}
                  </h4>
                  {option.description && (
                      <p style={{
                        fontSize: isMobile && optionsCount >= 10 ? '0.6875rem' : (isMobile ? '0.875rem' : '0.9375rem'),
                        color: isSelected ? 'rgba(255, 255, 255, 0.9)' : '#64748b',
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      {option.description}
                    </p>
                  )}
                  </div>

                  {/* Indicador de selección */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}>
                      <span style={{ color: '#3b82f6', fontSize: '1.125rem', fontWeight: 'bold' }}>✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          );
        })()}

        {/* Botón Anterior para preguntas de tipo single (no múltiples) */}
        {!isMultiple && question.options && !isLastQuestion && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            {!isFirstQuestion && (
              <button
                className="btn-back"
                onClick={() => setCurrentStep(currentStep - 1)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#F6F5F2',
                  border: '2px solid #E5E5E3',
                  borderRadius: '8px',
                  color: '#2B2B2B',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E5E5E3';
                  e.currentTarget.style.borderColor = '#2B2B2B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F6F5F2';
                  e.currentTarget.style.borderColor = '#E5E5E3';
                }}
              >
                ← Anterior
              </button>
            )}
          </div>
        )}

        {isMultiple && (
          <div className="continue-container" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            {!isFirstQuestion && (
              <button
                className="btn-back"
                onClick={() => setCurrentStep(currentStep - 1)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#F6F5F2',
                  border: '2px solid #E5E5E3',
                  borderRadius: '8px',
                  color: '#2B2B2B',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease'
                }}
              >
                ← Anterior
              </button>
            )}
            <button
              className="btn-continue"
              onClick={() => {
                if (isLastQuestion) {
                  setCurrentStep(SERVICES_STEP);
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={!selectedValue || (Array.isArray(selectedValue) && selectedValue.length === 0)}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* Información de contacto al final - Ahora en el paso de servicios */}
        {false && (
          <div className="contact-section">
            <h4 className="contact-title">Antes de generar tu diagnóstico, cuéntame un poco más</h4>
            <div className="contact-inputs">
              <input
                type="text"
                className="contact-input"
                placeholder="Tu nombre (opcional)"
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
              />
              <input
                type="text"
                className="contact-input"
                placeholder="Nombre de tu empresa (opcional)"
                value={contactInfo.company}
                onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
              />
              <input
                type="email"
                className="contact-input"
                placeholder="Tu email (opcional)"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              {!isFirstQuestion && (
                <button
                  className="btn-back"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#F6F5F2',
                    border: '2px solid #E5E5E3',
                    borderRadius: '8px',
                    color: '#2B2B2B',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E5E5E3';
                    e.currentTarget.style.borderColor = '#2B2B2B';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F6F5F2';
                    e.currentTarget.style.borderColor = '#E5E5E3';
                  }}
                >
                  ← Anterior
                </button>
              )}
              <button
                className="btn-submit"
                onClick={handleSubmit}
                disabled={loading || !isAllQuestionsAnswered()}
              >
                {loading ? 'Generando tu diagnóstico...' : 'Generar mi diagnóstico personalizado'}
              </button>
            </div>
            {!isAllQuestionsAnswered() && (
              <p style={{ 
                marginTop: '1rem', 
                color: '#9A9A97', 
                fontSize: '0.875rem',
                textAlign: 'center'
              }}>
                Por favor, completa todas las preguntas para generar tu diagnóstico
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizar pregunta actual
  return (
    <>
      {renderQuestion()}
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

