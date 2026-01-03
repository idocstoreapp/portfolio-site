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
  type ConversationalQuestion
} from '../utils/conversationalDiagnostic';
import { createDiagnostic } from '../utils/backendClient';

const BUSINESS_SECTORS: Array<{ value: BusinessSector; label: string; description: string; icon: string }> = [
  { value: 'restaurante', label: 'Restaurante / Bar / Café', description: 'Negocio de comida y bebidas', icon: '🍽️' },
  { value: 'servicio-tecnico', label: 'Servicio Técnico', description: 'Reparación de celulares, electrodomésticos, etc.', icon: '🔧' },
  { value: 'taller', label: 'Taller Mecánico', description: 'Reparación de autos, motos, etc.', icon: '🚗' },
  { value: 'fabrica', label: 'Fábrica / Mueblería', description: 'Producción y cotizaciones a medida', icon: '🏭' },
  { value: 'comercio', label: 'Comercio / Tienda', description: 'Venta de productos', icon: '🏪' },
  { value: 'servicios', label: 'Servicios Profesionales', description: 'Consultoría, diseño, etc.', icon: '💼' }
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Obtener todas las preguntas en orden
  const getAllQuestions = (): ConversationalQuestion[] => {
    if (!selectedSector) return [];
    
    const sectorQuestions = SECTOR_QUESTIONS[selectedSector] || [];
    return [...sectorQuestions, ...TRANSVERSAL_QUESTIONS];
  };

  const allQuestions = getAllQuestions();
  const currentQuestion = allQuestions[currentStep];
  const isLastQuestion = currentStep === allQuestions.length - 1;
  const isSectorSelection = currentStep === -1;

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
              className="option-card sector-option-card"
              style={{
                background: '#FFFFFF',
                border: '2px solid #E5E5E3',
                borderRadius: isMobile ? '12px' : '16px',
                padding: isMobile ? '1rem 1.25rem' : '2rem 1.5rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: isMobile ? 'flex-start' : 'center',
                gap: '1rem',
                minHeight: isMobile ? 'auto' : '200px',
                height: isMobile ? 'auto' : 'auto',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2B2B2B';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                e.currentTarget.style.background = '#F6F5F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E5E3';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.background = '#FFFFFF';
              }}
              onClick={() => {
                setSelectedSector(sector.value);
                setAnswers({ sector: sector.value });
                setCurrentStep(0);
              }}
            >
              <div className="card-icon" style={{ 
                fontSize: isMobile ? '2rem' : '3.5rem', 
                marginBottom: isMobile ? '0' : '0.5rem', 
                lineHeight: 1,
                flexShrink: 0
              }}>
                {sector.icon}
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: isMobile ? 'flex-start' : 'center',
                flex: 1,
                textAlign: isMobile ? 'left' : 'center'
              }}>
                <h4 className="card-title" style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: isMobile ? '1rem' : '1.25rem',
                  fontWeight: 700,
                  color: '#2B2B2B',
                  margin: 0,
                  textAlign: isMobile ? 'left' : 'center',
                  lineHeight: 1.3
                }}>
                  {sector.label}
                </h4>
                <p className="card-description" style={{
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  color: '#9A9A97',
                  margin: 0,
                  marginTop: isMobile ? '0.25rem' : '0',
                  lineHeight: 1.4
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

  // Si no hay sector seleccionado, mostrar selección
  if (!selectedSector || !currentQuestion) {
    return (
      <div className="wizard-step active">
        <div className="step-header">
          <h3 className="step-title">Cargando...</h3>
        </div>
      </div>
    );
  }

  // Renderizar pregunta actual
  const renderQuestion = () => {
    const isMultiple = currentQuestion.type === 'multiple';
    const isNumber = currentQuestion.type === 'number';
    const isText = currentQuestion.type === 'text';
    const selectedValue = answers[currentQuestion.id];

    return (
      <div className="wizard-step active">
        <div className="step-header">
          <div className="conversational-question">
            <span className="step-number">{currentStep + 1} / {allQuestions.length}</span>
            <h3 className="step-title">{currentQuestion.title}</h3>
            {currentQuestion.subtitle && (
              <p className="step-description">{currentQuestion.subtitle}</p>
            )}
          </div>
        </div>

        {isNumber && (
          <div className="input-container">
            <input
              type="number"
              className="number-input"
              placeholder={currentQuestion.placeholder || 'Ingresa un número'}
              value={selectedValue || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setAnswers({ ...answers, [currentQuestion.id]: value });
              }}
              min={currentQuestion.validation?.min}
              max={currentQuestion.validation?.max}
            />
            <button
              className="btn-continue"
              onClick={() => {
                if (isLastQuestion) {
                  handleSubmit();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={!selectedValue || selectedValue < (currentQuestion.validation?.min || 1)}
            >
              Continuar →
            </button>
          </div>
        )}

        {isText && (
          <div className="input-container">
            <input
              type="text"
              className="text-input"
              placeholder={currentQuestion.placeholder || 'Escribe tu respuesta'}
              value={selectedValue || ''}
              onChange={(e) => {
                setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
              }}
            />
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
        )}

        {currentQuestion.options && (
          <div className="cards-grid" style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            {currentQuestion.options.map((option) => {
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
                      setAnswers({ ...answers, [currentQuestion.id]: newValue });
                    } else {
                      setAnswers({ ...answers, [currentQuestion.id]: option.value });
                      // Auto-avanzar después de un breve delay para mejor UX
                      setTimeout(() => {
                        if (isLastQuestion) {
                          handleSubmit();
                        } else {
                          setCurrentStep(currentStep + 1);
                        }
                      }, 300);
                    }
                  }}
                >
                  {option.icon && (
                    <div className="card-icon" style={{ fontSize: '3.5rem', marginBottom: '0.5rem', lineHeight: 1 }}>
                      {option.icon}
                    </div>
                  )}
                  <h4 className="card-title" style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '1.25rem',
                    fontWeight: 700,
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

        {isMultiple && (
          <div className="continue-container">
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
            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Generando tu diagnóstico...' : 'Generar mi diagnóstico personalizado'}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Manejar envío final
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Calcular costos y ahorros
      const summary = calculateCostsAndSavings(answers, selectedSector!);
      const insights = generateInsights(answers, selectedSector!);
      const personalizedMessage = generatePersonalizedMessage(answers, selectedSector!, summary);

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
        summary,
        insights,
        personalizedMessage
      };

      console.log('📤 Sending diagnostic data:', JSON.stringify(diagnosticData, null, 2));

      const response = await createDiagnostic(diagnosticData);

      if (response.success && response.data?.id) {
        window.location.href = `/diagnostico/${response.data.id}`;
      } else {
        throw new Error('No se recibió ID del diagnóstico');
      }
    } catch (err: any) {
      console.error('Error creating diagnostic:', err);
      setError(err.message || 'Error al procesar el diagnóstico');
      setLoading(false);
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

