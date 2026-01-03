/**
 * Motor de Decisión del Diagnóstico Estratégico
 * 
 * Este motor procesa las respuestas del diagnóstico y determina:
 * - Solución principal recomendada
 * - Soluciones complementarias
 * - Mensaje personalizado
 * - Nivel de urgencia
 * 
 * Diseñado para ser extensible y mantenible.
 */

export interface DiagnosticAnswers {
  tipoEmpresa: 'restaurante' | 'servicio-tecnico' | 'fabrica' | 'otro';
  nivelDigital: 'nada' | 'basica' | 'funciona' | 'avanzada';
  objetivos: string[]; // Múltiples objetivos permitidos
  tamano: '1-5' | '6-20' | '21-100' | '100+';
  necesidadesAdicionales?: string[]; // stock, sucursales, empleados, catalogo
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  matchScore: number; // 0-100, qué tan bien encaja
  reason: string; // Por qué se recomienda
}

export interface DiagnosticResult {
  qualifies: boolean;
  primarySolution: Solution;
  complementarySolutions: Solution[];
  personalizedMessage: {
    title: string;
    subtitle: string;
    insight: string; // Insight específico basado en respuestas
  };
  urgency: 'high' | 'medium' | 'low';
  nextSteps: {
    primary: {
      text: string;
      link: string;
    };
    secondary?: {
      text: string;
      link: string;
    };
  };
}

// Mapeo de soluciones disponibles
const SOLUTIONS: Record<string, Solution> = {
  restaurantes: {
    id: 'restaurantes',
    title: 'Sistema para Restaurantes',
    description: 'Menú QR, POS y gestión completa. Deja el papel atrás.',
    icon: '🍽️',
    link: '/soluciones/restaurantes',
    matchScore: 0,
    reason: ''
  },
  'servicio-tecnico': {
    id: 'servicio-tecnico',
    title: 'Sistema para Servicio Técnico',
    description: 'Gestiona reparaciones, inventario y clientes desde un solo sistema.',
    icon: '🔧',
    link: '/soluciones/servicio-tecnico',
    matchScore: 0,
    reason: ''
  },
  'taller-mecanico': {
    id: 'taller-mecanico',
    title: 'Sistema para Taller Mecánico',
    description: 'Organiza reparaciones, repuestos y clientes de forma profesional.',
    icon: '🚗',
    link: '/soluciones/taller-mecanico',
    matchScore: 0,
    reason: ''
  },
  'cotizador-fabrica': {
    id: 'cotizador-fabrica',
    title: 'Sistema Cotizador / Fábrica',
    description: 'Cotizaciones personalizadas con cálculo automático de costos.',
    icon: '🏭',
    link: '/soluciones/cotizador-fabrica',
    matchScore: 0,
    reason: ''
  },
  'desarrollo-web': {
    id: 'desarrollo-web',
    title: 'Desarrollo Web Profesional',
    description: 'Páginas web que convierten visitantes en clientes.',
    icon: '🌐',
    link: '/soluciones/desarrollo-web',
    matchScore: 0,
    reason: ''
  }
};

/**
 * Calcula el score de match para cada solución basado en las respuestas
 */
function calculateSolutionScores(answers: DiagnosticAnswers): Map<string, number> {
  const scores = new Map<string, number>();

  // Inicializar todos los scores en 0
  Object.keys(SOLUTIONS).forEach(key => scores.set(key, 0));

  // Regla 1: Tipo de empresa determina solución principal
  switch (answers.tipoEmpresa) {
    case 'restaurante':
      scores.set('restaurantes', scores.get('restaurantes')! + 50);
      break;
    case 'servicio-tecnico':
      scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 50);
      scores.set('taller-mecanico', scores.get('taller-mecanico')! + 30); // Relacionado
      break;
    case 'fabrica':
      scores.set('cotizador-fabrica', scores.get('cotizador-fabrica')! + 50);
      break;
    case 'otro':
      // Para "otro", dar más peso a desarrollo web y objetivos
      scores.set('desarrollo-web', scores.get('desarrollo-web')! + 30);
      break;
  }

  // Regla 2: Nivel digital afecta urgencia y tipo de solución
  switch (answers.nivelDigital) {
    case 'nada':
      // Si no tiene nada digital, necesita sistema completo
      // Ya tiene score por tipo de empresa, agregar bonus
      if (answers.tipoEmpresa === 'restaurante') {
        scores.set('restaurantes', scores.get('restaurantes')! + 20);
      } else if (answers.tipoEmpresa === 'servicio-tecnico') {
        scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 20);
      } else if (answers.tipoEmpresa === 'fabrica') {
        scores.set('cotizador-fabrica', scores.get('cotizador-fabrica')! + 20);
      }
      break;
    case 'basica':
      // Tiene web básica, puede necesitar mejorarla o sistema
      scores.set('desarrollo-web', scores.get('desarrollo-web')! + 15);
      break;
    case 'funciona':
    case 'avanzada':
      // Ya tiene sistemas, puede necesitar optimización o web
      scores.set('desarrollo-web', scores.get('desarrollo-web')! + 10);
      break;
  }

  // Regla 3: Objetivos múltiples determinan prioridad
  // Procesar cada objetivo en el array
  answers.objetivos.forEach(objetivo => {
    switch (objetivo) {
      case 'ventas':
        // Para vender más, web es importante
        scores.set('desarrollo-web', scores.get('desarrollo-web')! + 25);
        // Pero también sistemas que organizan ayudan a vender más
        if (answers.tipoEmpresa === 'restaurante') {
          scores.set('restaurantes', scores.get('restaurantes')! + 15);
        }
        break;
      case 'organizar':
        // Para organizar, sistemas son clave
        if (answers.tipoEmpresa === 'restaurante') {
          scores.set('restaurantes', scores.get('restaurantes')! + 20);
        } else if (answers.tipoEmpresa === 'servicio-tecnico') {
          scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 20);
        } else if (answers.tipoEmpresa === 'fabrica') {
          scores.set('cotizador-fabrica', scores.get('cotizador-fabrica')! + 20);
        }
        break;
      case 'automatizar':
        // Automatizar requiere sistemas
        if (answers.tipoEmpresa === 'restaurante') {
          scores.set('restaurantes', scores.get('restaurantes')! + 20);
        } else if (answers.tipoEmpresa === 'servicio-tecnico') {
          scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 20);
        } else if (answers.tipoEmpresa === 'fabrica') {
          scores.set('cotizador-fabrica', scores.get('cotizador-fabrica')! + 20);
        }
        break;
      case 'presencia':
        // Presencia = web
        scores.set('desarrollo-web', scores.get('desarrollo-web')! + 30);
        break;
    }
  });

  // Regla 3.5: Necesidades adicionales afectan soluciones
  if (answers.necesidadesAdicionales) {
    answers.necesidadesAdicionales.forEach(necesidad => {
      switch (necesidad) {
        case 'stock':
          // Si necesita stock, requiere sistema de gestión
          if (answers.tipoEmpresa === 'restaurante') {
            scores.set('restaurantes', scores.get('restaurantes')! + 15);
          } else if (answers.tipoEmpresa === 'servicio-tecnico') {
            scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 15);
          } else if (answers.tipoEmpresa === 'fabrica') {
            scores.set('cotizador-fabrica', scores.get('cotizador-fabrica')! + 15);
          }
          break;
        case 'sucursales':
          // Múltiples sucursales = sistema multi-sucursal
          if (answers.tipoEmpresa === 'restaurante') {
            scores.set('restaurantes', scores.get('restaurantes')! + 10);
          } else if (answers.tipoEmpresa === 'servicio-tecnico') {
            scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 10);
          }
          break;
        case 'empleados':
          // Gestión de empleados = sistema con módulo de personal
          if (answers.tipoEmpresa === 'restaurante') {
            scores.set('restaurantes', scores.get('restaurantes')! + 10);
          } else if (answers.tipoEmpresa === 'servicio-tecnico') {
            scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 10);
          }
          break;
        case 'catalogo':
          // Catálogo = web con catálogo
          scores.set('desarrollo-web', scores.get('desarrollo-web')! + 20);
          break;
      }
    });
  }

  // Regla 4: Tamaño de empresa afecta complejidad
  if (answers.tamano === '21-100' || answers.tamano === '100+') {
    // Empresas grandes necesitan sistemas más robustos
    if (answers.tipoEmpresa === 'restaurante') {
      scores.set('restaurantes', scores.get('restaurantes')! + 10);
    } else if (answers.tipoEmpresa === 'servicio-tecnico') {
      scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 10);
    } else if (answers.tipoEmpresa === 'fabrica') {
      scores.set('cotizador-fabrica', scores.get('cotizador-fabrica')! + 10);
    }
  }

  return scores;
}

/**
 * Genera mensaje personalizado basado en las respuestas
 */
function generatePersonalizedMessage(answers: DiagnosticAnswers, primarySolution: Solution): {
  title: string;
  subtitle: string;
  insight: string;
} {
  const insights: string[] = [];

  // Insight basado en nivel digital
  if (answers.nivelDigital === 'nada') {
    insights.push('Trabajas completamente en papel, lo que significa que estás perdiendo tiempo y oportunidades. Digitalizar tu negocio te dará control total y ahorrará horas de trabajo.');
  } else if (answers.nivelDigital === 'basica') {
    insights.push('Tienes una base digital, pero puedes optimizarla mucho más. Un sistema completo te ayudará a organizar mejor y generar más resultados.');
  }

  // Insight basado en objetivos múltiples
  if (answers.objetivos.includes('organizar')) {
    insights.push('Organizar tu negocio es el primer paso para crecer. Un sistema digital te permitirá tener todo bajo control y tomar mejores decisiones.');
  }
  if (answers.objetivos.includes('ventas')) {
    insights.push('Para vender más necesitas estar donde tus clientes te buscan y tener procesos que conviertan. La combinación de presencia digital y sistemas eficientes es clave.');
  }
  if (answers.objetivos.includes('automatizar')) {
    insights.push('Automatizar procesos te libera tiempo para enfocarte en lo que realmente importa: hacer crecer tu negocio.');
  }
  if (answers.objetivos.includes('presencia')) {
    insights.push('Tener presencia profesional en internet es fundamental para que tus clientes te encuentren y confíen en ti.');
  }
  
  // Insight basado en necesidades adicionales
  if (answers.necesidadesAdicionales) {
    if (answers.necesidadesAdicionales.includes('stock')) {
      insights.push('El manejo de stock y proveedores requiere un sistema que te permita controlar inventario en tiempo real.');
    }
    if (answers.necesidadesAdicionales.includes('sucursales')) {
      insights.push('Con múltiples sucursales, necesitas un sistema centralizado que coordine todas tus ubicaciones.');
    }
    if (answers.necesidadesAdicionales.includes('empleados')) {
      insights.push('La gestión de empleados requiere herramientas que te permitan organizar horarios, tareas y rendimiento.');
    }
    if (answers.necesidadesAdicionales.includes('catalogo')) {
      insights.push('Un catálogo online permite que tus clientes vean tus productos y servicios desde cualquier lugar.');
    }
  }

  // Insight basado en tamaño
  if (answers.tamano === '1-5') {
    insights.push('Como negocio pequeño, cada hora cuenta. Un sistema digital te ayudará a hacer más con menos recursos.');
  } else if (answers.tamano === '6-20' || answers.tamano === '21-100') {
    insights.push('Con tu tamaño de equipo, necesitas sistemas que coordinen a todos y mantengan la información centralizada.');
  }

  const insight = insights.length > 0 
    ? insights.join(' ') 
    : 'Basado en tus respuestas, tenemos una solución específica para tu negocio.';

  return {
    title: `Hemos encontrado la solución perfecta para tu negocio`,
    subtitle: `Basado en tu tipo de empresa, nivel digital y objetivos, te recomendamos:`,
    insight
  };
}

/**
 * Determina el nivel de urgencia
 */
function calculateUrgency(answers: DiagnosticAnswers): 'high' | 'medium' | 'low' {
  // Alta urgencia: trabaja en papel + objetivo organizar/automatizar
  if (answers.nivelDigital === 'nada' && 
      (answers.objetivos.includes('organizar') || answers.objetivos.includes('automatizar'))) {
    return 'high';
  }

  // Alta urgencia: empresa grande sin sistemas
  if ((answers.tamano === '21-100' || answers.tamano === '100+') && answers.nivelDigital === 'nada') {
    return 'high';
  }

  // Media urgencia: tiene algo pero quiere mejorar
  if (answers.nivelDigital === 'basica' || answers.nivelDigital === 'funciona') {
    return 'medium';
  }

  // Baja urgencia: ya tiene sistemas avanzados
  return 'low';
}

/**
 * Motor principal de decisión
 * 
 * @param answers - Respuestas del diagnóstico
 * @returns Resultado estructurado con solución principal, complementarias y mensaje personalizado
 */
export function processDiagnostic(answers: DiagnosticAnswers): DiagnosticResult {
  // Calcular scores para cada solución
  const scores = calculateSolutionScores(answers);

  // Encontrar solución principal (mayor score)
  let maxScore = 0;
  let primarySolutionId = 'desarrollo-web'; // Default

  scores.forEach((score, solutionId) => {
    if (score > maxScore) {
      maxScore = score;
      primarySolutionId = solutionId;
    }
  });

  const primarySolution = { ...SOLUTIONS[primarySolutionId] };
  primarySolution.matchScore = maxScore;

  // Generar razón de recomendación
  if (answers.tipoEmpresa !== 'otro' && primarySolutionId !== 'desarrollo-web') {
    primarySolution.reason = `Tu tipo de negocio (${answers.tipoEmpresa}) se alinea perfectamente con esta solución.`;
  } else if (answers.objetivos.includes('presencia')) {
    primarySolution.reason = 'Uno de tus objetivos es tener presencia digital, por eso te recomendamos desarrollo web.';
  } else if (answers.objetivos.includes('ventas')) {
    primarySolution.reason = 'Para aumentar ventas, necesitas estar donde tus clientes te buscan.';
  } else {
    primarySolution.reason = 'Basado en tus respuestas, esta es la solución que mejor se adapta a tus necesidades.';
  }
  
  // Agregar información sobre necesidades adicionales
  if (answers.necesidadesAdicionales && answers.necesidadesAdicionales.length > 0) {
    const necesidades = answers.necesidadesAdicionales.join(', ');
    primarySolution.reason += ` Además, necesitas manejar: ${necesidades}.`;
  }

  // Encontrar soluciones complementarias (top 2-3 después de la principal)
  const complementarySolutions: Solution[] = [];
  const sortedScores = Array.from(scores.entries())
    .filter(([id]) => id !== primarySolutionId)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2); // Top 2 complementarias

  sortedScores.forEach(([solutionId, score]) => {
    if (score > 10) { // Solo incluir si tiene score significativo
      const solution = { ...SOLUTIONS[solutionId] };
      solution.matchScore = score;
      
      // Razón para complementaria
      if (solutionId === 'desarrollo-web' && primarySolutionId !== 'desarrollo-web') {
        solution.reason = 'Una página web profesional complementa cualquier sistema interno.';
      } else if (primarySolutionId === 'desarrollo-web' && solutionId !== 'desarrollo-web') {
        solution.reason = 'Un sistema interno puede optimizar tus procesos mientras creces online.';
      } else {
        solution.reason = 'Esta solución puede complementar tu estrategia digital.';
      }
      
      complementarySolutions.push(solution);
    }
  });

  // Determinar si califica (siempre califica, pero con diferentes niveles)
  const qualifies = maxScore > 0;

  // Generar mensaje personalizado
  const personalizedMessage = generatePersonalizedMessage(answers, primarySolution);

  // Calcular urgencia
  const urgency = calculateUrgency(answers);

  // Definir próximos pasos
  const nextSteps = {
    primary: {
      text: `Ver solución: ${primarySolution.title}`,
      link: `${primarySolution.link}?from=diagnostico`
    },
    secondary: complementarySolutions.length > 0 ? {
      text: 'Ver todas las soluciones',
      link: '/soluciones'
    } : undefined
  };

  return {
    qualifies,
    primarySolution,
    complementarySolutions,
    personalizedMessage,
    urgency,
    nextSteps
  };
}

/**
 * Convierte respuestas del wizard (formato antiguo) al formato del motor
 */
export function normalizeAnswers(rawAnswers: Record<number, string | string[]>): DiagnosticAnswers {
  console.log('normalizeAnswers called with:', rawAnswers);
  
  // Normalizar objetivos (puede ser string o array)
  let objetivos: string[] = [];
  const step3Value = rawAnswers[3];
  console.log('Step 3 value:', step3Value, 'Type:', typeof step3Value, 'Is Array:', Array.isArray(step3Value));
  
  if (Array.isArray(step3Value)) {
    objetivos = step3Value;
  } else if (typeof step3Value === 'string') {
    // Si es string, puede ser un solo valor o múltiples separados por coma
    if (step3Value.includes(',')) {
      objetivos = step3Value.split(',').map(s => s.trim());
    } else {
      objetivos = [step3Value];
    }
  } else if (step3Value) {
    // Por si acaso es otro tipo
    objetivos = [String(step3Value)];
  } else {
    console.warn('No step 3 value found, using default');
    objetivos = ['presencia']; // Default
  }
  
  console.log('Normalized objetivos:', objetivos);

  // Normalizar necesidades adicionales (paso 5, opcional)
  let necesidadesAdicionales: string[] = [];
  const step5Value = rawAnswers[5];
  if (step5Value) {
    if (Array.isArray(step5Value)) {
      necesidadesAdicionales = step5Value;
    } else if (typeof step5Value === 'string') {
      if (step5Value.includes(',')) {
        necesidadesAdicionales = step5Value.split(',').map(s => s.trim());
      } else {
        necesidadesAdicionales = [step5Value];
      }
    }
  }

  const normalized = {
    tipoEmpresa: (rawAnswers[1] as DiagnosticAnswers['tipoEmpresa']) || 'otro',
    nivelDigital: (rawAnswers[2] as DiagnosticAnswers['nivelDigital']) || 'basica',
    objetivos,
    tamano: (rawAnswers[4] as DiagnosticAnswers['tamano']) || '1-5',
    necesidadesAdicionales: necesidadesAdicionales.length > 0 ? necesidadesAdicionales : undefined
  };
  
  console.log('Final normalized answers:', normalized);
  return normalized;
}

