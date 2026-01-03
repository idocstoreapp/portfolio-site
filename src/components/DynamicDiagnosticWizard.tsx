/**
 * Wizard de Diagnóstico Dinámico
 * 
 * Genera preguntas específicas según el tipo de negocio seleccionado
 * Basado en el sistema de caminos (decision tree)
 */

import { useState, useEffect } from 'react';
import { 
  getBusinessTypeOptions, 
  getDiagnosticPath, 
  type BusinessType,
  type DiagnosticQuestion 
} from '../utils/diagnosticPaths';
import { createDiagnostic } from '../utils/backendClient';

interface DiagnosticAnswers {
  businessType?: BusinessType;
  [questionId: string]: string | string[] | BusinessType | undefined;
}

export default function DynamicDiagnosticWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [answers, setAnswers] = useState<DiagnosticAnswers>({});
  const [contactInfo, setContactInfo] = useState({ name: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const businessTypes = getBusinessTypeOptions();
  const currentPath = selectedBusinessType ? getDiagnosticPath(selectedBusinessType) : null;
  const totalSteps = currentPath 
    ? 1 + currentPath.questions.length + 1 // Tipo negocio + preguntas + contacto
    : 1; // Solo selección de tipo

  // Paso 1: Selección de tipo de negocio
  if (currentStep === 1) {
    return (
      <div className="wizard-step active">
        <div className="step-header">
          <span className="step-number">1</span>
          <h3 className="step-title">¿Qué tipo de negocio eres?</h3>
          <p className="step-description">Selecciona la opción que mejor describe tu negocio</p>
        </div>
        <div className="cards-grid">
          {businessTypes.map((type) => (
            <button
              key={type.value}
              className="option-card"
              onClick={() => {
                setSelectedBusinessType(type.value);
                setAnswers({ businessType: type.value });
                setCurrentStep(2);
              }}
            >
              <div className="card-icon">{type.icon}</div>
              <h4 className="card-title">{type.label}</h4>
              <p className="card-description">{type.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!currentPath) {
    return <div>Error: No se encontró el camino de diagnóstico</div>;
  }

  // Pasos intermedios: Preguntas del camino
  const questionIndex = currentStep - 2; // -2 porque paso 1 es tipo negocio, paso 2 es primera pregunta
  const currentQuestion = currentPath.questions[questionIndex];

  if (currentQuestion) {
    const isMultiple = currentQuestion.type === 'multiple';
    const selectedValues = (answers[currentQuestion.id] as string[]) || [];

    return (
      <div className="wizard-step active">
        <div className="step-header">
          <span className="step-number">{currentStep}</span>
          <h3 className="step-title">{currentQuestion.title}</h3>
          <p className="step-description">{currentQuestion.description}</p>
        </div>
        <div className="cards-grid">
          {currentQuestion.options.map((option) => {
            const isSelected = isMultiple
              ? selectedValues.includes(option.value)
              : answers[currentQuestion.id] === option.value;

            return (
              <button
                key={option.value}
                className={`option-card ${isMultiple ? 'multi-select' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  if (isMultiple) {
                    const newValues = isSelected
                      ? selectedValues.filter(v => v !== option.value)
                      : [...selectedValues, option.value];
                    setAnswers({ ...answers, [currentQuestion.id]: newValues });
                  } else {
                    setAnswers({ ...answers, [currentQuestion.id]: option.value });
                  }
                }}
              >
                {option.icon && <div className="card-icon">{option.icon}</div>}
                <h4 className="card-title">{option.label}</h4>
                <p className="card-description">{option.description}</p>
                {isMultiple && <div className="check-icon">✓</div>}
              </button>
            );
          })}
        </div>
        <div className="step-footer">
          <button
            className="btn-continue"
            disabled={
              currentQuestion.required &&
              (!answers[currentQuestion.id] ||
                (isMultiple && selectedValues.length === 0))
            }
            onClick={() => {
              if (questionIndex < currentPath.questions.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                // Última pregunta, ir a contacto
                setCurrentStep(currentStep + 1);
              }
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // Paso de contacto (penúltimo)
  if (currentStep === totalSteps - 1) {
    return (
      <div className="wizard-step active">
        <div className="step-header">
          <span className="step-number">{currentStep}</span>
          <h3 className="step-title">Información de contacto (opcional)</h3>
          <p className="step-description">Nos ayuda a personalizar mejor tu resultado</p>
        </div>
        <div className="contact-form">
          <div className="form-group">
            <label className="form-label">Tu nombre</label>
            <input
              type="text"
              className="form-input"
              value={contactInfo.name}
              onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nombre de tu empresa</label>
            <input
              type="text"
              className="form-input"
              value={contactInfo.company}
              onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
              placeholder="Ej: Mi Empresa S.A."
            />
          </div>
        </div>
        <div className="step-footer">
          <button
            className="btn-continue"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Ver mi resultado
          </button>
        </div>
      </div>
    );
  }

  // Paso final: Análisis y envío
  if (currentStep === totalSteps) {
    useEffect(() => {
      handleSubmit();
    }, []);

    async function handleSubmit() {
      setLoading(true);
      setError('');

      try {
        // Normalizar respuestas para el backend
        // Mapear tipos de negocio del nuevo sistema al formato del backend
        const tipoEmpresaMap: Record<BusinessType, string> = {
          'restaurante': 'restaurante',
          'servicio-tecnico': 'servicio-tecnico',
          'taller': 'servicio-tecnico', // Taller se mapea a servicio-tecnico para compatibilidad
          'fabrica': 'fabrica',
          'presencia-web': 'otro', // Presencia web se mapea a 'otro' para compatibilidad
        };

        // Enviar TODAS las respuestas específicas al backend
        const diagnosticData: any = {
          tipoEmpresa: tipoEmpresaMap[selectedBusinessType!] || 'otro',
          nivelDigital: answers['nivel-digital'] || answers['situacion-actual'] || 'basica',
          objetivos: answers['objetivo-principal'] 
            ? (Array.isArray(answers['objetivo-principal']) 
                ? answers['objetivo-principal'] 
                : [answers['objetivo-principal'] as string])
            : [],
          tamano: answers['tamano'] || '1-5',
          necesidadesAdicionales: answers['necesidades-adicionales']
            ? (Array.isArray(answers['necesidades-adicionales'])
                ? answers['necesidades-adicionales']
                : [answers['necesidades-adicionales'] as string])
            : [],
          // Tipo de negocio original para el motor mejorado
          businessType: selectedBusinessType,
          nombre: contactInfo.name || undefined,
          empresa: contactInfo.company || undefined,
        };

        // Agregar TODAS las respuestas específicas del wizard dinámico
        // Esto permite que el motor de diagnóstico genere recomendaciones muy específicas
        Object.keys(answers).forEach(key => {
          if (!['objetivo-principal', 'necesidades-adicionales'].includes(key)) {
            // Convertir guiones a camelCase para compatibilidad con backend
            const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            diagnosticData[camelKey] = answers[key];
            // También mantener el formato original con guiones
            diagnosticData[key] = answers[key];
          }
        });

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
    }

    return (
      <div className="wizard-step active">
        <div className="analysis-container">
          <div className="analysis-icon">🔍</div>
          <h3 className="analysis-title">Analizando tu información...</h3>
          <p className="analysis-text">Verificando compatibilidad y oportunidades</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: loading ? '100%' : '0%', transition: 'width 2s ease' }}
            />
          </div>
          {error && (
            <div className="error-message" style={{ marginTop: '2rem', color: '#dc2626' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

