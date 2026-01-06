/**
 * Wizard de Diagnóstico Conversacional Empresarial
 * 
 * Enfoque consultivo con cálculo de costos y ahorros
 * UX conversacional, no como test repetitivo
 */

import { useState, useEffect } from 'react';
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

const BUSINESS_SECTORS: Array<{ value: BusinessSector; label: string; description: string; icon: string }> = [
  { value: 'restaurante', label: 'Restaurante / Bar / Café', description: 'Negocio de comida y bebidas', icon: '/images/icons/restaurante.png' },
  { value: 'servicio-tecnico', label: 'Servicio Técnico', description: 'Reparación de celulares, electrodomésticos, etc.', icon: '/images/icons/servicio-tecnico.png' },
  { value: 'taller', label: 'Taller Mecánico', description: 'Reparación de autos, motos, etc.', icon: '/images/icons/taller.png' },
  { value: 'fabrica', label: 'Fábrica / Mueblería', description: 'Producción y cotizaciones a medida', icon: '/images/icons/fabrica.png' },
  { value: 'comercio', label: 'Comercio / Tienda', description: 'Venta de productos', icon: '/images/icons/tienda.png' },
  { value: 'servicios', label: 'Servicios Profesionales', description: 'Consultoría, diseño, etc.', icon: '/images/icons/servicios-profesionales.png' }
];

interface DiagnosticAnswers {
  sector?: BusinessSector;
  [key: string]: any;
}

export default function ConversationalDiagnosticWizard() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = selección de sector
  const [selectedSector, setSelectedSector] = useState<BusinessSector | null>(null);
  const [answers, setAnswers] = useState<DiagnosticAnswers>({});
  const [contactInfo, setContactInfo] = useState({ name: '', company: '', email: '' });
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
  
  // Calcular currentQuestion de forma segura
  let currentQuestion: ConversationalQuestion | undefined = undefined;
  if (selectedSector && allQuestions.length > 0) {
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

  // Paso inicial: Selección de sector
  if (isSectorSelection) {
    return (
      <div className="wizard-step active" style={{ display: 'block' }}>
        <div className="step-header">
          <div className="conversational-intro">
            <h3 className="step-title">Cuéntame sobre tu negocio</h3>
            <p className="step-description">
              Quiero entender cómo operas para identificar oportunidades de ahorro y crecimiento
            </p>
          </div>
        </div>
        <div className="cards-grid sector-selection-grid" style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: isMobile ? '0.75rem' : '1.5rem',
          marginTop: '2rem'
        }}>
          {BUSINESS_SECTORS.map((sector) => (
            <button
              key={sector.value}
              className={`option-card sector-option-card ${selectedSector === sector.value ? 'selected' : ''}`}
              style={{
                background: '#FFFFFF',
                border: isMobile ? 'none' : '2px solid #E5E5E3',
                borderRadius: isMobile ? '12px' : '16px',
                padding: isMobile ? '1rem 1.25rem' : '2rem 1.5rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: isMobile ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.3s ease',
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: isMobile ? 'flex-start' : 'center',
                gap: '1rem',
                minHeight: isMobile ? 'auto' : '200px',
                height: isMobile ? 'auto' : 'auto',
                position: 'relative',
                boxShadow: isMobile 
                  ? '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.05)',
                width: '100%',
                transform: 'scale(1)',
                transformOrigin: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.borderColor = '#2B2B2B';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.background = '#F6F5F2';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.borderColor = '#E5E5E3';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.background = '#FFFFFF';
                }
              }}
              onTouchStart={(e) => {
                if (isMobile) {
                  e.currentTarget.style.transform = 'scale(0.98)';
                }
              }}
              onTouchEnd={(e) => {
                if (isMobile) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
              onClick={() => {
                setSelectedSector(sector.value);
                setAnswers({ sector: sector.value });
                setCurrentStep(0);
              }}
            >
              <div className="card-icon" style={{ 
                width: isMobile ? '40px' : '56px',
                height: isMobile ? '40px' : '56px',
                marginBottom: isMobile ? '0' : '0.5rem', 
                marginRight: isMobile ? '0' : '0',
                lineHeight: 1,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={sector.icon} 
                  alt={sector.label}
                  className="black-icon"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'grayscale(100%) brightness(0)' // Convertir iconos a negro
                  }}
                />
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: isMobile ? 'flex-start' : 'center',
                flex: 1,
                textAlign: isMobile ? 'left' : 'center'
              }}>
                <h4 className="card-title" style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                  fontSize: isMobile ? '1rem' : '1.25rem',
                  fontWeight: 600,
                  color: '#2B2B2B',
                  margin: 0,
                  textAlign: isMobile ? 'left' : 'center',
                  lineHeight: 1.4,
                  letterSpacing: '-0.01em'
                }}>
                  {sector.label}
                </h4>
                <p className="card-description" style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                  fontSize: isMobile ? '0.8125rem' : '0.875rem',
                  color: '#6B7280',
                  margin: 0,
                  marginTop: isMobile ? '0.25rem' : '0',
                  lineHeight: 1.5,
                  fontWeight: 400
                }}>
                  {sector.description}
                </p>
              </div>
              {isMobile && (
                <div style={{ 
                  fontSize: '1.25rem', 
                  color: '#9A9A97',
                  flexShrink: 0,
                  marginLeft: 'auto'
                }}>
                  →
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Si no hay sector seleccionado, no debería llegar aquí (ya se maneja en isSectorSelection)
  if (!selectedSector) {
    return null;
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

    return (
      <div className="wizard-step active">
        <div className="step-header">
          <div className="conversational-question">
            <span className="step-number">{currentStep + 1} / {allQuestions.length}</span>
            <h3 className="step-title">{question.title}</h3>
            {question.subtitle && (
              <p className="step-description">{question.subtitle}</p>
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
                    handleSubmit();
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
                    handleSubmit();
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

        {question.options && (
          <div className="cards-grid" style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            {question.options.map((option) => {
              const isSelected = isMultiple
                ? Array.isArray(selectedValue) && selectedValue.includes(option.value)
                : selectedValue === option.value;

              return (
                <button
                  key={option.value}
                  className={`option-card ${isMultiple ? 'multi-select' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{
                    background: isSelected ? '#2B2B2B' : '#FFFFFF',
                    border: `2px solid ${isSelected ? '#2B2B2B' : '#E5E5E3'}`,
                    borderRadius: '16px',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    minHeight: '200px',
                    position: 'relative',
                    boxShadow: isSelected ? '0 8px 24px rgba(43, 43, 43, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
                    color: isSelected ? '#FFFFFF' : 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#2B2B2B';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                      e.currentTarget.style.background = '#F6F5F2';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#E5E5E3';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                      e.currentTarget.style.background = '#FFFFFF';
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
                      // Auto-avanzar después de un breve delay para mejor UX (solo si no es la última pregunta)
                      if (!isLastQuestion) {
                        setTimeout(() => {
                          setCurrentStep(currentStep + 1);
                        }, 300);
                      }
                    }
                  }}
                >
                  {option.icon && (
                    <div 
                      className="card-icon" 
                      style={{ 
                        fontSize: isMobile ? '2rem' : '3rem',
                        marginBottom: isMobile ? '0.5rem' : '1rem',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: 'none'
                      }}
                      data-icon={option.icon}
                    >
                      {(() => {
                        // Intentar usar icono de imagen si existe
                        const iconFileName = currentQuestion ? getIconFileName(currentQuestion.id, option.value) : null;
                        const iconPath = iconFileName ? `/images/icons/${iconFileName}` : null;
                        
                        // Si es una ruta de imagen (http, /, o archivo de icono)
                        if (typeof option.icon === 'string' && (option.icon.startsWith('http') || option.icon.startsWith('/'))) {
                          return <img 
                            src={option.icon} 
                            alt={option.label}
                            className="black-icon"
                            style={{ 
                              width: isMobile ? '2rem' : '3rem', 
                              height: isMobile ? '2rem' : '3rem', 
                              objectFit: 'contain',
                              filter: 'grayscale(100%) brightness(0)' // Convertir iconos a negro
                            }}
                          />;
                        }
                        
                        // Si tenemos un icono mapeado, intentar usarlo
                        if (iconPath) {
                          return <img 
                            src={iconPath} 
                            alt={option.label}
                            className="black-icon"
                            style={{ 
                              width: isMobile ? '2rem' : '3rem', 
                              height: isMobile ? '2rem' : '3rem', 
                              objectFit: 'contain',
                              filter: 'grayscale(100%) brightness(0)' // Convertir iconos a negro
                            }}
                            onError={(e) => {
                              // Silenciar el error y ocultar la imagen
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent && option.icon) {
                                // Verificar que no sea una URL antes de usar como emoji
                                const iconStr = option.icon as string;
                                if (!iconStr.startsWith('http') && !iconStr.startsWith('/') && !iconStr.includes('.')) {
                                  // Solo agregar fallback si no existe ya
                                  if (!parent.querySelector('span[data-icon-fallback]')) {
                                    const fallback = document.createElement('span');
                                    fallback.setAttribute('data-icon-fallback', 'true');
                                    fallback.style.fontSize = isMobile ? '2rem' : '3rem';
                                    fallback.style.display = 'inline-block';
                                    fallback.style.lineHeight = '1';
                                    fallback.textContent = iconStr;
                                    parent.appendChild(fallback);
                                  }
                                }
                              }
                            }}
                          />;
                        }
                        
                        // Fallback a emoji (solo si no es una URL)
                        if (option.icon && typeof option.icon === 'string') {
                          const iconStr = option.icon;
                          // Si es una URL, no mostrar nada
                          if (iconStr.startsWith('http') || iconStr.startsWith('/') || iconStr.includes('.')) {
                            return <span style={{ fontSize: isMobile ? '2rem' : '3rem', display: 'inline-block', opacity: 0.3 }}>●</span>;
                          }
                          // Si es un emoji, mostrarlo con filtro para hacerlo negro
                          return <span 
                            className="black-emoji-icon"
                            style={{ 
                              fontSize: isMobile ? '2rem' : '3rem', 
                              lineHeight: 1,
                              display: 'inline-block',
                              filter: 'grayscale(100%) brightness(0) contrast(200%)',
                              WebkitFilter: 'grayscale(100%) brightness(0) contrast(200%)'
                            }}
                          >{option.icon}</span>;
                        }
                        
                        // Si no hay icono, mostrar placeholder
                        return <span style={{ fontSize: isMobile ? '2rem' : '3rem', display: 'inline-block', opacity: 0.3 }}>●</span>;
                      })()}
                    </div>
                  )}
                  <h4 className="card-title" style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: isSelected ? '#FFFFFF' : '#2B2B2B',
                    margin: 0,
                    lineHeight: 1.3
                  }}>
                    {option.label}
                  </h4>
                  {option.description && (
                    <p className="card-description" style={{
                      fontSize: '0.875rem',
                      color: isSelected ? '#FFFFFF' : '#9A9A97',
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      {option.description}
                    </p>
                  )}
                  {isMultiple && isSelected && (
                    <div className="check-icon" style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      color: '#2B2B2B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

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
                  handleSubmit();
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

        {/* Información de contacto al final */}
        {isLastQuestion && (
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
      
      // Log para depuración - verificar insights
      console.log('🔍 [FRONTEND] Insights generated:', {
        count: insights.length,
        insightsWithOpportunity: insights.filter(i => i.opportunity).length,
        insightsDetails: insights.map(i => ({
          title: i.title,
          hasOpportunity: !!i.opportunity,
          opportunityTitle: i.opportunity?.title
        }))
      });
      
      // Generar estructura mejorada de resultados
      // Obtener nombre y empresa de las respuestas o del contacto
      const nombre = answers.nombre || contactInfo.name || '';
      const empresa = answers.empresa || contactInfo.company || '';
      
      const enhancedStructure = generateEnhancedResultStructure(
        { ...answers, nombre, empresa },
        selectedSector!,
        insights,
        summary
      );
      
      // Log para depuración - verificar estructura generada
      console.log('🔍 [FRONTEND] Enhanced structure generated:', {
        hasCurrentSituation: !!enhancedStructure.currentSituation,
        currentSituationTitle: enhancedStructure.currentSituation?.title,
        opportunitiesCount: enhancedStructure.opportunities?.length || 0,
        hasOperationalImpact: !!enhancedStructure.operationalImpact,
        operationalImpactConsequences: enhancedStructure.operationalImpact?.consequences?.length || 0,
        hasFutureVision: !!enhancedStructure.futureVision,
        futureVisionTitle: enhancedStructure.futureVision?.title
      });

      // Log detallado para depuración
      console.log('🖼️ [FRONTEND] Enhanced structure COMPLETE:', JSON.stringify(enhancedStructure, null, 2));
      console.log('🖼️ [FRONTEND] Enhanced structure imageUrls:', {
        currentSituation: {
          exists: !!enhancedStructure.currentSituation,
          hasImageUrl: !!enhancedStructure.currentSituation?.imageUrl,
          imageUrl: enhancedStructure.currentSituation?.imageUrl || 'MISSING',
          title: enhancedStructure.currentSituation?.title
        },
        opportunities: {
          count: enhancedStructure.opportunities?.length || 0,
          items: enhancedStructure.opportunities?.map(opp => ({ 
            title: opp.title, 
            hasImageUrl: !!opp.imageUrl,
            imageUrl: opp.imageUrl || 'MISSING' 
          })) || []
        },
        operationalImpact: {
          exists: !!enhancedStructure.operationalImpact,
          hasConsequences: !!enhancedStructure.operationalImpact?.consequences,
          consequencesCount: enhancedStructure.operationalImpact?.consequences?.length || 0,
          consequences: enhancedStructure.operationalImpact?.consequences?.map(c => ({ 
            area: c.area, 
            hasImageUrl: !!c.imageUrl,
            imageUrl: c.imageUrl || 'MISSING' 
          })) || []
        },
        futureVision: {
          exists: !!enhancedStructure.futureVision,
          hasImageUrl: !!enhancedStructure.futureVision?.imageUrl,
          imageUrl: enhancedStructure.futureVision?.imageUrl || 'MISSING',
          title: enhancedStructure.futureVision?.title
        },
        summary: {
          exists: !!enhancedStructure.summary,
          hasImageUrl: !!enhancedStructure.summary?.imageUrl,
          imageUrl: enhancedStructure.summary?.imageUrl || 'MISSING'
        }
      });
      
      // Verificar que los imageUrl se estén generando
      if (!enhancedStructure.currentSituation?.imageUrl) {
        console.error('❌ [FRONTEND] currentSituation.imageUrl is MISSING!', enhancedStructure.currentSituation);
      }
      if (!enhancedStructure.summary?.imageUrl) {
        console.error('❌ [FRONTEND] summary.imageUrl is MISSING!', enhancedStructure.summary);
      }
      if (!enhancedStructure.futureVision?.imageUrl) {
        console.error('❌ [FRONTEND] futureVision.imageUrl is MISSING!', enhancedStructure.futureVision);
      }
      if (!enhancedStructure.opportunities || enhancedStructure.opportunities.length === 0) {
        console.warn('⚠️ [FRONTEND] No opportunities generated!', { insights, insightsWithOpportunity: insights.filter(i => i.opportunity) });
      }
      if (!enhancedStructure.operationalImpact?.consequences || enhancedStructure.operationalImpact.consequences.length === 0) {
        console.warn('⚠️ [FRONTEND] No operational impact consequences generated!', { 
          operationalImpact: enhancedStructure.operationalImpact,
          summary: enhancedStructure.summary 
        });
      }

      // Preparar datos para el backend
      const diagnosticData = {
        tipoEmpresa: selectedSector,
        businessType: selectedSector,
        sector: selectedSector, // Campo específico para el sistema conversacional
        // Incluir todas las respuestas (excluyendo sector que ya está arriba)
        ...Object.fromEntries(
          Object.entries(answers).filter(([key]) => key !== 'sector')
        ),
        // Información de contacto
        nombre: contactInfo.name || undefined,
        empresa: contactInfo.company || undefined,
        email: contactInfo.email || undefined,
        // Datos calculados
        summary: enhancedStructure.summary, // Usar el summary con imageUrl
        insights,
        personalizedMessage,
        // Estructura mejorada de resultados - Asegurar que siempre existan
        currentSituation: enhancedStructure.currentSituation || null,
        opportunities: enhancedStructure.opportunities || [],
        operationalImpact: enhancedStructure.operationalImpact || null,
        futureVision: enhancedStructure.futureVision || null
      };
      
      // Log crítico antes de enviar
      console.log('🚨 [FRONTEND] CRITICAL CHECK before sending:', {
        hasCurrentSituation: !!diagnosticData.currentSituation,
        currentSituationType: typeof diagnosticData.currentSituation,
        currentSituationKeys: diagnosticData.currentSituation ? Object.keys(diagnosticData.currentSituation) : 'NULL',
        hasOpportunities: !!diagnosticData.opportunities,
        opportunitiesIsArray: Array.isArray(diagnosticData.opportunities),
        opportunitiesLength: diagnosticData.opportunities?.length || 0,
        hasOperationalImpact: !!diagnosticData.operationalImpact,
        operationalImpactType: typeof diagnosticData.operationalImpact,
        hasFutureVision: !!diagnosticData.futureVision,
        futureVisionType: typeof diagnosticData.futureVision,
        allKeys: Object.keys(diagnosticData)
      });

      console.log('📤 [FRONTEND] Sending diagnostic data:', JSON.stringify(diagnosticData, null, 2));
      
      // Log detallado de la estructura mejorada antes de enviar
      console.log('📤 [FRONTEND] Enhanced structure being sent:', {
        currentSituation: diagnosticData.currentSituation ? {
          hasImageUrl: !!diagnosticData.currentSituation.imageUrl,
          imageUrl: diagnosticData.currentSituation.imageUrl,
          title: diagnosticData.currentSituation.title
        } : 'MISSING',
        opportunities: diagnosticData.opportunities ? {
          count: diagnosticData.opportunities.length,
          first: diagnosticData.opportunities[0] ? {
            title: diagnosticData.opportunities[0].title,
            hasImageUrl: !!diagnosticData.opportunities[0].imageUrl,
            imageUrl: diagnosticData.opportunities[0].imageUrl
          } : 'empty'
        } : 'MISSING',
        operationalImpact: diagnosticData.operationalImpact ? {
          hasConsequences: !!diagnosticData.operationalImpact.consequences,
          consequencesCount: diagnosticData.operationalImpact.consequences?.length || 0,
          firstConsequence: diagnosticData.operationalImpact.consequences?.[0] ? {
            area: diagnosticData.operationalImpact.consequences[0].area,
            hasImageUrl: !!diagnosticData.operationalImpact.consequences[0].imageUrl,
            imageUrl: diagnosticData.operationalImpact.consequences[0].imageUrl
          } : 'empty'
        } : 'MISSING',
        futureVision: diagnosticData.futureVision ? {
          hasImageUrl: !!diagnosticData.futureVision.imageUrl,
          imageUrl: diagnosticData.futureVision.imageUrl,
          title: diagnosticData.futureVision.title
        } : 'MISSING',
        summary: diagnosticData.summary ? {
          hasImageUrl: !!diagnosticData.summary.imageUrl,
          imageUrl: diagnosticData.summary.imageUrl
        } : 'MISSING'
      });

      const response = await createDiagnostic(diagnosticData);
      
      // Log de la respuesta del backend
      console.log('📥 [FRONTEND] Response from backend:', {
        success: response.success,
        diagnosticId: response.data?.id,
        hasData: !!response.data
      });

      if (response.success && response.data?.id) {
        // Redirigir solo si se completó exitosamente
        window.location.href = `/diagnostico/${response.data.id}`;
      } else {
        throw new Error('No se recibió ID del diagnóstico');
      }
    } catch (err: any) {
      console.error('Error creating diagnostic:', err);
      setError(err.message || 'Error al procesar el diagnóstico');
      setLoading(false);
      setIsCompleted(false); // Resetear si hay error
    }
  };

  // Mostrar error si existe
  if (error) {
    return (
      <div className="wizard-step active">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error al procesar el diagnóstico</h3>
          <p className="error-message">{error}</p>
          <button
            className="btn-retry"
            onClick={() => {
              setError('');
              setLoading(false);
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return renderQuestion();
}

