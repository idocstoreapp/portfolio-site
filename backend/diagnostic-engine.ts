/**
 * Motor de Decisión del Diagnóstico Estratégico
 * 
 * Este archivo es una copia del motor de decisión del frontend
 * para que el backend pueda procesar diagnósticos sin depender del frontend.
 * 
 * En producción, esto debería ser un paquete compartido o importado desde el frontend.
 */

export interface DiagnosticAnswers {
  tipoEmpresa: 'restaurante' | 'servicio-tecnico' | 'fabrica' | 'otro';
  nivelDigital: 'nada' | 'basica' | 'funciona' | 'avanzada';
  objetivos: string[];
  tamano: '1-5' | '6-20' | '21-100' | '100+';
  necesidadesAdicionales?: string[];
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  matchScore: number;
  reason: string;
}

export interface DiagnosticResult {
  qualifies: boolean;
  primarySolution: Solution;
  complementarySolutions: Solution[];
  personalizedMessage: {
    title: string;
    subtitle: string;
    insight: string;
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

function calculateSolutionScores(answers: DiagnosticAnswers): Map<string, number> {
  const scores = new Map<string, number>();
  Object.keys(SOLUTIONS).forEach(key => scores.set(key, 0));

  // Regla 1: Tipo de empresa
  switch (answers.tipoEmpresa) {
    case 'restaurante':
      scores.set('restaurantes', scores.get('restaurantes')! + 50);
      break;
    case 'servicio-tecnico':
      scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 50);
      scores.set('taller-mecanico', scores.get('taller-mecanico')! + 30);
      break;
    case 'fabrica':
      scores.set('cotizador-fabrica', scores.get('cotizador-fabrica')! + 50);
      break;
    case 'otro':
      scores.set('desarrollo-web', scores.get('desarrollo-web')! + 30);
      break;
  }

  // Regla 2: Nivel digital
  switch (answers.nivelDigital) {
    case 'nada':
      if (answers.tipoEmpresa === 'restaurante') {
        scores.set('restaurantes', scores.get('restaurantes')! + 20);
      } else if (answers.tipoEmpresa === 'servicio-tecnico') {
        scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 20);
      } else if (answers.tipoEmpresa === 'fabrica') {
        scores.set('cotizador-fabrica', scores.get('cotizador-fabrica')! + 20);
      }
      break;
    case 'basica':
      scores.set('desarrollo-web', scores.get('desarrollo-web')! + 15);
      break;
    case 'funciona':
    case 'avanzada':
      scores.set('desarrollo-web', scores.get('desarrollo-web')! + 10);
      break;
  }

  // Regla 3: Objetivos múltiples
  answers.objetivos.forEach(objetivo => {
    switch (objetivo) {
      case 'ventas':
        scores.set('desarrollo-web', scores.get('desarrollo-web')! + 25);
        if (answers.tipoEmpresa === 'restaurante') {
          scores.set('restaurantes', scores.get('restaurantes')! + 15);
        }
        break;
      case 'organizar':
        if (answers.tipoEmpresa === 'restaurante') {
          scores.set('restaurantes', scores.get('restaurantes')! + 20);
        } else if (answers.tipoEmpresa === 'servicio-tecnico') {
          scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 20);
        } else if (answers.tipoEmpresa === 'fabrica') {
          scores.set('cotizador-fabrica', scores.get('cotizador-fabrica')! + 20);
        }
        break;
      case 'automatizar':
        if (answers.tipoEmpresa === 'restaurante') {
          scores.set('restaurantes', scores.get('restaurantes')! + 20);
        } else if (answers.tipoEmpresa === 'servicio-tecnico') {
          scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 20);
        } else if (answers.tipoEmpresa === 'fabrica') {
          scores.set('cotizador-fabrica', scores.get('cotizador-fabrica')! + 20);
        }
        break;
      case 'presencia':
        scores.set('desarrollo-web', scores.get('desarrollo-web')! + 30);
        break;
    }
  });

  // Regla 3.5: Necesidades adicionales
  if (answers.necesidadesAdicionales) {
    answers.necesidadesAdicionales.forEach(necesidad => {
      switch (necesidad) {
        case 'stock':
          if (answers.tipoEmpresa === 'restaurante') {
            scores.set('restaurantes', scores.get('restaurantes')! + 15);
          } else if (answers.tipoEmpresa === 'servicio-tecnico') {
            scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 15);
          } else if (answers.tipoEmpresa === 'fabrica') {
            scores.set('cotizador-fabrica', scores.get('cotizador-fabrica')! + 15);
          }
          break;
        case 'sucursales':
          if (answers.tipoEmpresa === 'restaurante') {
            scores.set('restaurantes', scores.get('restaurantes')! + 10);
          } else if (answers.tipoEmpresa === 'servicio-tecnico') {
            scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 10);
          }
          break;
        case 'empleados':
          if (answers.tipoEmpresa === 'restaurante') {
            scores.set('restaurantes', scores.get('restaurantes')! + 10);
          } else if (answers.tipoEmpresa === 'servicio-tecnico') {
            scores.set('servicio-tecnico', scores.get('servicio-tecnico')! + 10);
          }
          break;
        case 'catalogo':
          scores.set('desarrollo-web', scores.get('desarrollo-web')! + 20);
          break;
      }
    });
  }

  // Regla 4: Tamaño
  if (answers.tamano === '21-100' || answers.tamano === '100+') {
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

function generatePersonalizedMessage(answers: DiagnosticAnswers, primarySolution: Solution): {
  title: string;
  subtitle: string;
  insight: string;
} {
  const insights: string[] = [];

  if (answers.nivelDigital === 'nada') {
    insights.push('Trabajas completamente en papel, lo que significa que estás perdiendo tiempo y oportunidades. Digitalizar tu negocio te dará control total y ahorrará horas de trabajo.');
  } else if (answers.nivelDigital === 'basica') {
    insights.push('Tienes una base digital, pero puedes optimizarla mucho más. Un sistema completo te ayudará a organizar mejor y generar más resultados.');
  }

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

  const insight = insights.length > 0 
    ? insights.join(' ') 
    : 'Basado en tus respuestas, tenemos una solución específica para tu negocio.';

  return {
    title: `Hemos encontrado la solución perfecta para tu negocio`,
    subtitle: `Basado en tu tipo de empresa, nivel digital y objetivos, te recomendamos:`,
    insight
  };
}

function calculateUrgency(answers: DiagnosticAnswers): 'high' | 'medium' | 'low' {
  if (answers.nivelDigital === 'nada' && 
      (answers.objetivos.includes('organizar') || answers.objetivos.includes('automatizar'))) {
    return 'high';
  }

  if ((answers.tamano === '21-100' || answers.tamano === '100+') && answers.nivelDigital === 'nada') {
    return 'high';
  }

  if (answers.nivelDigital === 'basica' || answers.nivelDigital === 'funciona') {
    return 'medium';
  }

  return 'low';
}

export function processDiagnostic(answers: DiagnosticAnswers): DiagnosticResult {
  const scores = calculateSolutionScores(answers);

  let maxScore = 0;
  let primarySolutionId = 'desarrollo-web';

  scores.forEach((score, solutionId) => {
    if (score > maxScore) {
      maxScore = score;
      primarySolutionId = solutionId;
    }
  });

  const primarySolution = { ...SOLUTIONS[primarySolutionId] };
  primarySolution.matchScore = maxScore;

  if (answers.tipoEmpresa !== 'otro' && primarySolutionId !== 'desarrollo-web') {
    primarySolution.reason = `Tu tipo de negocio (${answers.tipoEmpresa}) se alinea perfectamente con esta solución.`;
  } else if (answers.objetivos.includes('presencia')) {
    primarySolution.reason = 'Uno de tus objetivos es tener presencia digital, por eso te recomendamos desarrollo web.';
  } else if (answers.objetivos.includes('ventas')) {
    primarySolution.reason = 'Para aumentar ventas, necesitas estar donde tus clientes te buscan.';
  } else {
    primarySolution.reason = 'Basado en tus respuestas, esta es la solución que mejor se adapta a tus necesidades.';
  }

  if (answers.necesidadesAdicionales && answers.necesidadesAdicionales.length > 0) {
    const necesidades = answers.necesidadesAdicionales.join(', ');
    primarySolution.reason += ` Además, necesitas manejar: ${necesidades}.`;
  }

  const complementarySolutions: Solution[] = [];
  const sortedScores = Array.from(scores.entries())
    .filter(([id]) => id !== primarySolutionId)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  sortedScores.forEach(([solutionId, score]) => {
    if (score > 10) {
      const solution = { ...SOLUTIONS[solutionId] };
      solution.matchScore = score;
      
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

  const qualifies = maxScore > 0;
  const personalizedMessage = generatePersonalizedMessage(answers, primarySolution);
  const urgency = calculateUrgency(answers);

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




