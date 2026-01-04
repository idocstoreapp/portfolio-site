/**
 * Sistema de Diagnóstico Conversacional Empresarial
 * 
 * Enfoque consultivo que calcula costos actuales vs. ahorros potenciales
 * Genera informes profesionales, no comerciales
 */

export type BusinessSector = 'restaurante' | 'servicio-tecnico' | 'taller' | 'fabrica' | 'comercio' | 'servicios';

export interface ConversationalQuestion {
  id: string;
  sector?: BusinessSector; // Si es null, es pregunta transversal
  title: string;
  subtitle?: string;
  type: 'single' | 'multiple' | 'number' | 'text';
  options?: Array<{
    value: string;
    label: string;
    description?: string;
    icon?: string;
    costImpact?: {
      timeHours?: number; // Horas perdidas por semana
      moneyCost?: number; // Costo en dinero por mes
      errorRate?: number; // Porcentaje de errores
    };
  }>;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    required?: boolean;
  };
}

export interface DiagnosticInsight {
  problem: string;
  currentCost: {
    timeHours: number; // Horas por semana
    moneyCost: number; // Costo mensual estimado
    errorRate: number; // Porcentaje de errores
  };
  potentialSavings: {
    timeHours: number;
    moneyCost: number;
    errorReduction: number;
  };
  impact: {
    operational: string;
    financial: string;
    growth: string;
  };
  recommendation: {
    tool: string;
    description: string;
    benefits: string[];
  };
}

export interface ConversationalDiagnosticResult {
  sector: BusinessSector;
  insights: DiagnosticInsight[];
  summary: {
    totalCurrentCost: {
      timeHours: number;
      moneyCost: number;
    };
    totalPotentialSavings: {
      timeHours: number;
      moneyCost: number;
    };
    roi: number; // Retorno de inversión estimado
  };
  personalizedMessage: {
    greeting: string;
    context: string;
    opportunity: string;
    vision: string;
  };
}

/**
 * Preguntas específicas por rubro (conversacionales)
 */
export const SECTOR_QUESTIONS: Record<BusinessSector, ConversationalQuestion[]> = {
  restaurante: [
    {
      id: 'operacion-diaria',
      sector: 'restaurante',
      title: 'Cuéntame, ¿cómo funciona tu restaurante día a día?',
      subtitle: 'Quiero entender cómo operas actualmente',
      type: 'single',
      options: [
        {
          value: 'papel-comandas',
          label: 'Todo en papel',
          description: 'Anoto pedidos en papel y comandas físicas',
          icon: '📝',
          costImpact: {
            timeHours: 10, // 10 horas/semana perdiendo órdenes, buscando comandas
            moneyCost: 200, // Costo de papel, impresión, tiempo perdido
            errorRate: 15 // 15% de errores por órdenes perdidas
          }
        },
        {
          value: 'whatsapp-papel',
          label: 'WhatsApp y papel',
          description: 'Recibo pedidos por WhatsApp pero anoto en papel',
          icon: '💬',
          costImpact: {
            timeHours: 8,
            moneyCost: 150,
            errorRate: 12
          }
        },
        {
          value: 'pos-basico',
          label: 'Tengo un POS básico',
          description: 'Caja registradora o sistema simple',
          icon: '💰',
          costImpact: {
            timeHours: 5,
            moneyCost: 100,
            errorRate: 8
          }
        },
        {
          value: 'sistema-completo',
          label: 'Ya tengo un sistema',
          description: 'Tengo sistema pero quiero mejorar',
          icon: '⚙️',
          costImpact: {
            timeHours: 2,
            moneyCost: 50,
            errorRate: 3
          }
        }
      ]
    },
    {
      id: 'menu-digital',
      sector: 'restaurante',
      title: '¿Tus clientes ven el menú en papel o digital?',
      subtitle: 'Esto afecta cuánto gastas cada vez que cambias precios',
      type: 'single',
      options: [
        {
          value: 'solo-impreso',
          label: 'Solo menú impreso',
          description: 'Menús físicos en papel o cartón',
          icon: '📄',
          costImpact: {
            timeHours: 2, // Tiempo en actualizar, imprimir, distribuir
            moneyCost: 300, // Costo de impresión cada cambio (promedio)
            errorRate: 5 // Errores por menús desactualizados
          }
        },
        {
          value: 'ambos',
          label: 'Tengo ambos',
          description: 'Menú impreso y también digital',
          icon: '📱',
          costImpact: {
            timeHours: 1,
            moneyCost: 150,
            errorRate: 3
          }
        },
        {
          value: 'solo-digital',
          label: 'Solo menú digital',
          description: 'Menú con código QR',
          icon: '📲',
          costImpact: {
            timeHours: 0.5,
            moneyCost: 0,
            errorRate: 0
          }
        }
      ]
    },
    {
      id: 'mesas-meseros',
      sector: 'restaurante',
      title: '¿Tienes mesas con meseros que toman pedidos?',
      subtitle: 'Esto determina si necesitas sistema de comandas',
      type: 'single',
      options: [
        {
          value: 'solo-mostrador',
          label: 'No, solo mostrador',
          description: 'Los clientes piden en el mostrador',
          icon: '🏪'
        },
        {
          value: 'mesas-sin-meseros',
          label: 'Sí, mesas pero sin meseros',
          description: 'Los clientes se sientan pero piden en mostrador',
          icon: '🪑'
        },
        {
          value: 'mesas-con-meseros',
          label: 'Sí, mesas y meseros',
          description: 'Tengo meseros que toman pedidos en las mesas',
          icon: '👨‍🍳',
          costImpact: {
            timeHours: 8, // Tiempo perdido en errores de comunicación cocina-meseros
            moneyCost: 400, // Costo de meseros esperando, órdenes incorrectas
            errorRate: 10
          }
        }
      ]
    },
    {
      id: 'inventario-restaurante',
      sector: 'restaurante',
      title: '¿Sabes exactamente qué ingredientes tienes en stock?',
      subtitle: 'Esto afecta desperdicio y compras innecesarias',
      type: 'single',
      options: [
        {
          value: 'no-se',
          label: 'No, no sé',
          description: 'No sé qué tengo hasta que me falta',
          icon: '❌',
          costImpact: {
            timeHours: 5, // Tiempo en verificar manualmente
            moneyCost: 500, // Desperdicio y compras duplicadas
            errorRate: 20 // 20% de desperdicio
          }
        },
        {
          value: 'manual',
          label: 'Sí, pero lo anoto manualmente',
          description: 'Llevo inventario en papel o Excel',
          icon: '📝',
          costImpact: {
            timeHours: 8,
            moneyCost: 300,
            errorRate: 12
          }
        },
        {
          value: 'sistema',
          label: 'Sí, tengo sistema',
          description: 'Tengo sistema que controla inventario',
          icon: '📦',
          costImpact: {
            timeHours: 1,
            moneyCost: 50,
            errorRate: 2
          }
        }
      ]
    }
  ],

  'servicio-tecnico': [
    {
      id: 'gestion-ordenes',
      sector: 'servicio-tecnico',
      title: '¿Cómo llevas el registro de las reparaciones?',
      subtitle: 'Quiero entender cómo gestionas las órdenes de servicio',
      type: 'single',
      options: [
        {
          value: 'papel',
          label: 'Todo en papel',
          description: 'Anoto órdenes en papel o libretas',
          icon: '📝',
          costImpact: {
            timeHours: 12, // Tiempo buscando papeles, perdiendo órdenes
            moneyCost: 300, // Órdenes perdidas, clientes insatisfechos
            errorRate: 18
          }
        },
        {
          value: 'excel',
          label: 'En Excel o planilla',
          description: 'Llevo registro en planillas',
          icon: '📊',
          costImpact: {
            timeHours: 8,
            moneyCost: 200,
            errorRate: 10
          }
        },
        {
          value: 'whatsapp',
          label: 'Por WhatsApp',
          description: 'Recibo órdenes por WhatsApp',
          icon: '💬',
          costImpact: {
            timeHours: 6,
            moneyCost: 150,
            errorRate: 8
          }
        },
        {
          value: 'sistema',
          label: 'Con un sistema',
          description: 'Uso un sistema para gestionar',
          icon: '⚙️',
          costImpact: {
            timeHours: 2,
            moneyCost: 50,
            errorRate: 3
          }
        }
      ]
    },
    {
      id: 'comisiones-tecnicos',
      sector: 'servicio-tecnico',
      title: '¿Pagas comisiones a tus técnicos?',
      subtitle: 'Esto afecta cuánto tiempo tomas calculando pagos',
      type: 'single',
      options: [
        {
          value: 'no-comisiones',
          label: 'No, no pago comisiones',
          description: 'Pago salario fijo',
          icon: '💵'
        },
        {
          value: 'manual',
          label: 'Sí, pero lo calculo manualmente',
          description: 'Calculo comisiones a mano o en Excel',
          icon: '📝',
          costImpact: {
            timeHours: 6, // Tiempo calculando comisiones cada semana
            moneyCost: 0, // No hay costo directo, pero tiempo valioso
            errorRate: 8 // Errores en cálculos
          }
        },
        {
          value: 'automatico',
          label: 'Sí, mi sistema lo calcula',
          description: 'Mi sistema calcula comisiones automáticamente',
          icon: '⚙️',
          costImpact: {
            timeHours: 0.5,
            moneyCost: 0,
            errorRate: 0
          }
        }
      ]
    },
    {
      id: 'inventario-repuestos',
      sector: 'servicio-tecnico',
      title: '¿Sabes qué repuestos tienes en stock?',
      subtitle: 'Esto afecta compras innecesarias o faltantes',
      type: 'single',
      options: [
        {
          value: 'no-se',
          label: 'No, no sé',
          description: 'No sé qué tengo hasta que lo necesito',
          icon: '❌',
          costImpact: {
            timeHours: 4,
            moneyCost: 400, // Compras duplicadas, faltantes
            errorRate: 15
          }
        },
        {
          value: 'manual',
          label: 'Sí, pero manual',
          description: 'Llevo inventario en papel o Excel',
          icon: '📝',
          costImpact: {
            timeHours: 6,
            moneyCost: 250,
            errorRate: 10
          }
        },
        {
          value: 'sistema',
          label: 'Sí, con sistema',
          description: 'Tengo sistema que controla inventario',
          icon: '📦',
          costImpact: {
            timeHours: 1,
            moneyCost: 50,
            errorRate: 2
          }
        }
      ]
    },
    {
      id: 'comunicacion-clientes',
      sector: 'servicio-tecnico',
      title: '¿Los clientes te llaman constantemente preguntando por su reparación?',
      subtitle: 'Esto consume tiempo que podrías usar en reparar',
      type: 'single',
      options: [
        {
          value: 'si-constantemente',
          label: 'Sí, constantemente',
          description: 'Me llaman varias veces al día',
          icon: '📞',
          costImpact: {
            timeHours: 10, // Tiempo en llamadas, explicaciones
            moneyCost: 0, // Tiempo perdido = dinero
            errorRate: 5
          }
        },
        {
          value: 'a veces',
          label: 'A veces',
          description: 'Algunos clientes preguntan ocasionalmente',
          icon: '📱',
          costImpact: {
            timeHours: 4,
            moneyCost: 0,
            errorRate: 2
          }
        },
        {
          value: 'no',
          label: 'No, casi nunca',
          description: 'Los clientes saben cómo consultar el estado',
          icon: '✅',
          costImpact: {
            timeHours: 0.5,
            moneyCost: 0,
            errorRate: 0
          }
        }
      ]
    }
  ],

  taller: [
    {
      id: 'gestion-ordenes-taller',
      sector: 'taller',
      title: '¿Cómo llevas el registro de las reparaciones?',
      subtitle: 'Quiero entender cómo gestionas las órdenes de servicio',
      type: 'single',
      options: [
        {
          value: 'papel',
          label: 'Todo en papel',
          description: 'Anoto órdenes en papel o libretas',
          icon: '📝',
          costImpact: {
            timeHours: 12,
            moneyCost: 300,
            errorRate: 18
          }
        },
        {
          value: 'excel',
          label: 'En Excel o planilla',
          description: 'Llevo registro en planillas',
          icon: '📊',
          costImpact: {
            timeHours: 8,
            moneyCost: 200,
            errorRate: 10
          }
        },
        {
          value: 'sistema',
          label: 'Con un sistema',
          description: 'Uso un sistema para gestionar',
          icon: '⚙️',
          costImpact: {
            timeHours: 2,
            moneyCost: 50,
            errorRate: 3
          }
        }
      ]
    },
    {
      id: 'comisiones-mecanicos',
      sector: 'taller',
      title: '¿Pagas comisiones a tus mecánicos?',
      subtitle: 'Esto afecta cuánto tiempo tomas calculando pagos',
      type: 'single',
      options: [
        {
          value: 'no-comisiones',
          label: 'No, no pago comisiones',
          description: 'Pago salario fijo',
          icon: '💵'
        },
        {
          value: 'manual',
          label: 'Sí, pero lo calculo manualmente',
          description: 'Calculo comisiones a mano o en Excel',
          icon: '📝',
          costImpact: {
            timeHours: 6,
            moneyCost: 0,
            errorRate: 8
          }
        },
        {
          value: 'automatico',
          label: 'Sí, mi sistema lo calcula',
          description: 'Mi sistema calcula comisiones automáticamente',
          icon: '⚙️',
          costImpact: {
            timeHours: 0.5,
            moneyCost: 0,
            errorRate: 0
          }
        }
      ]
    }
  ],

  fabrica: [
    {
      id: 'cotizaciones',
      sector: 'fabrica',
      title: '¿Haces cotizaciones para tus clientes?',
      subtitle: 'Quiero entender cómo generas presupuestos',
      type: 'single',
      options: [
        {
          value: 'si-cotizo',
          label: 'Sí, hago cotizaciones',
          description: 'Cotizo productos o servicios regularmente',
          icon: '📋'
        },
        {
          value: 'no-cotizo',
          label: 'No, no hago cotizaciones',
          description: 'Tengo precios fijos',
          icon: '💰'
        }
      ]
    },
    {
      id: 'como-cotiza',
      sector: 'fabrica',
      title: '¿Cómo generas las cotizaciones?',
      subtitle: 'Esto determina cuánto tiempo tomas en cada cotización',
      type: 'single',
      options: [
        {
          value: 'manual',
          label: 'Cotizo a mano',
          description: 'Calculo y escribo las cotizaciones a mano',
          icon: '📝',
          costImpact: {
            timeHours: 15, // Tiempo en calcular, escribir, revisar
            moneyCost: 0,
            errorRate: 12 // Errores en cálculos
          }
        },
        {
          value: 'excel',
          label: 'Uso Excel',
          description: 'Uso Excel para calcular y crear cotizaciones',
          icon: '📊',
          costImpact: {
            timeHours: 10,
            moneyCost: 0,
            errorRate: 8
          }
        },
        {
          value: 'sistema',
          label: 'Tengo un sistema',
          description: 'Tengo un sistema que genera cotizaciones',
          icon: '⚙️',
          costImpact: {
            timeHours: 2,
            moneyCost: 0,
            errorRate: 2
          }
        }
      ]
    },
    {
      id: 'calculo-costos',
      sector: 'fabrica',
      title: '¿Cómo calculas los costos reales de producción?',
      subtitle: 'Esto afecta tu margen de ganancia',
      type: 'single',
      options: [
        {
          value: 'manual',
          label: 'Calculo a mano',
          description: 'Calculo los costos manualmente con calculadora',
          icon: '🔢',
          costImpact: {
            timeHours: 8,
            moneyCost: 500, // Pérdidas por errores en costos
            errorRate: 15
          }
        },
        {
          value: 'excel',
          label: 'Uso Excel',
          description: 'Uso Excel para calcular costos',
          icon: '📊',
          costImpact: {
            timeHours: 5,
            moneyCost: 300,
            errorRate: 10
          }
        },
        {
          value: 'aproximado',
          label: 'Uso costos aproximados',
          description: 'Tengo costos aproximados pero no exactos',
          icon: '📝',
          costImpact: {
            timeHours: 2,
            moneyCost: 400, // Pérdidas por no saber costos reales
            errorRate: 12
          }
        },
        {
          value: 'sistema',
          label: 'Mi sistema calcula costos',
          description: 'Tengo un sistema que calcula costos reales',
          icon: '⚙️',
          costImpact: {
            timeHours: 0.5,
            moneyCost: 50,
            errorRate: 1
          }
        }
      ]
    }
  ],

  comercio: [
    {
      id: 'gestion-ventas',
      sector: 'comercio',
      title: '¿Cómo llevas el registro de tus ventas?',
      subtitle: 'Quiero entender cómo operas actualmente',
      type: 'single',
      options: [
        {
          value: 'papel',
          label: 'Todo en papel',
          description: 'Anoto ventas en papel',
          icon: '📝',
          costImpact: {
            timeHours: 10,
            moneyCost: 200,
            errorRate: 12
          }
        },
        {
          value: 'pos-basico',
          label: 'Tengo un POS básico',
          description: 'Caja registradora o sistema simple',
          icon: '💰',
          costImpact: {
            timeHours: 5,
            moneyCost: 100,
            errorRate: 6
          }
        },
        {
          value: 'sistema',
          label: 'Tengo un sistema',
          description: 'Tengo sistema pero quiero mejorar',
          icon: '⚙️',
          costImpact: {
            timeHours: 2,
            moneyCost: 50,
            errorRate: 2
          }
        }
      ]
    }
  ],

  servicios: [
    {
      id: 'gestion-servicios',
      sector: 'servicios',
      title: '¿Cómo gestionas tus servicios y clientes?',
      subtitle: 'Quiero entender cómo operas actualmente',
      type: 'single',
      options: [
        {
          value: 'papel',
          label: 'Todo en papel',
          description: 'Anoto servicios y clientes en papel',
          icon: '📝',
          costImpact: {
            timeHours: 10,
            moneyCost: 200,
            errorRate: 12
          }
        },
        {
          value: 'excel',
          label: 'Uso Excel',
          description: 'Llevo registro en planillas',
          icon: '📊',
          costImpact: {
            timeHours: 6,
            moneyCost: 100,
            errorRate: 8
          }
        },
        {
          value: 'sistema',
          label: 'Tengo un sistema',
          description: 'Tengo sistema pero quiero mejorar',
          icon: '⚙️',
          costImpact: {
            timeHours: 2,
            moneyCost: 50,
            errorRate: 2
          }
        }
      ]
    }
  ]
};

/**
 * Preguntas transversales (al final, para todos los rubros)
 */
export const TRANSVERSAL_QUESTIONS: ConversationalQuestion[] = [
  {
    id: 'empleados',
    title: '¿Cuántos empleados tienes?',
    subtitle: 'Esto me ayuda a entender el tamaño de tu operación',
    type: 'single',
    options: [
      {
        value: '1-5',
        label: '1-5 empleados',
        description: 'Negocio pequeño',
        icon: '👤'
      },
      {
        value: '6-15',
        label: '6-15 empleados',
        description: 'Negocio mediano',
        icon: '👥'
      },
      {
        value: '16-50',
        label: '16-50 empleados',
        description: 'Negocio grande',
        icon: '🏢'
      },
      {
        value: '50+',
        label: 'Más de 50 empleados',
        description: 'Empresa grande',
        icon: '🏭'
      }
    ]
  },
  {
    id: 'sucursales',
    title: '¿Tienes más de una ubicación?',
    subtitle: 'Esto afecta cómo gestionas tu negocio',
    type: 'single',
    options: [
      {
        value: 'una',
        label: 'Solo una ubicación',
        description: 'Tengo un solo local o taller',
        icon: '📍'
      },
      {
        value: 'varias',
        label: 'Tengo varias ubicaciones',
        description: 'Tengo 2 o más sucursales',
        icon: '🏢',
        costImpact: {
          timeHours: 5, // Tiempo en coordinar entre sucursales
          moneyCost: 200,
          errorRate: 8
        }
      }
    ]
  },
  {
    id: 'presencia-web',
    title: '¿Tienes página web?',
    subtitle: 'Esto afecta cómo te encuentran los clientes',
    type: 'single',
    options: [
      {
        value: 'no-web',
        label: 'No, no tengo página web',
        description: 'No tengo presencia en internet',
        icon: '❌',
        costImpact: {
          timeHours: 0,
          moneyCost: 0, // Oportunidad perdida, no costo directo
          errorRate: 0
        }
      },
      {
        value: 'web-basica',
        label: 'Sí, pero básica',
        description: 'Tengo web pero está desactualizada',
        icon: '🌐',
        costImpact: {
          timeHours: 0,
          moneyCost: 0,
          errorRate: 0
        }
      },
      {
        value: 'web-completa',
        label: 'Sí, tengo web completa',
        description: 'Tengo web profesional y actualizada',
        icon: '✨',
        costImpact: {
          timeHours: 0,
          moneyCost: 0,
          errorRate: 0
        }
      }
    ]
  }
];

/**
 * Calcula costos actuales y ahorros potenciales
 */
export function calculateCostsAndSavings(
  answers: Record<string, any>,
  sector: BusinessSector
): ConversationalDiagnosticResult['summary'] {
  let totalTimeHours = 0;
  let totalMoneyCost = 0;
  let totalPotentialTimeSavings = 0;
  let totalPotentialMoneySavings = 0;

  // Recorrer todas las respuestas y sumar costos
  Object.keys(answers).forEach(key => {
    const answer = answers[key];
    const question = [...SECTOR_QUESTIONS[sector], ...TRANSVERSAL_QUESTIONS]
      .find(q => q.id === key);

    if (question && question.options) {
      const selectedOption = question.options.find(opt => opt.value === answer);
      if (selectedOption?.costImpact) {
        totalTimeHours += selectedOption.costImpact.timeHours || 0;
        totalMoneyCost += selectedOption.costImpact.moneyCost || 0;
        
        // Calcular ahorros potenciales (asumiendo 80% de reducción con sistema)
        totalPotentialTimeSavings += (selectedOption.costImpact.timeHours || 0) * 0.8;
        totalPotentialMoneySavings += (selectedOption.costImpact.moneyCost || 0) * 0.85;
      }
    }
  });

  // Calcular ROI (asumiendo costo mensual promedio de sistema: $200-500)
  const systemCost = 300; // Costo mensual promedio
  const roi = totalPotentialMoneySavings > 0 
    ? ((totalPotentialMoneySavings - systemCost) / systemCost) * 100 
    : 0;

  return {
    totalCurrentCost: {
      timeHours: totalTimeHours,
      moneyCost: totalMoneyCost
    },
    totalPotentialSavings: {
      timeHours: totalPotentialTimeSavings,
      moneyCost: totalPotentialMoneySavings
    },
    roi: Math.max(0, roi)
  };
}

/**
 * Genera insights específicos basados en las respuestas
 */
export function generateInsights(
  answers: Record<string, any>,
  sector: BusinessSector
): DiagnosticInsight[] {
  const insights: DiagnosticInsight[] = [];

  // Analizar cada respuesta y generar insight
  Object.keys(answers).forEach(key => {
    const answer = answers[key];
    const question = [...SECTOR_QUESTIONS[sector], ...TRANSVERSAL_QUESTIONS]
      .find(q => q.id === key);

    if (question && question.options) {
      const selectedOption = question.options.find(opt => opt.value === answer);
      
      if (selectedOption?.costImpact && 
          (selectedOption.costImpact.timeHours > 5 || 
           selectedOption.costImpact.moneyCost > 100)) {
        
        const currentCost = selectedOption.costImpact;
        const potentialSavings = {
          timeHours: currentCost.timeHours * 0.8,
          moneyCost: currentCost.moneyCost * 0.85,
          errorReduction: currentCost.errorRate * 0.9
        };

        insights.push({
          problem: `Estás ${getProblemDescription(key, answer, sector)}`,
          currentCost,
          potentialSavings,
          impact: {
            operational: getOperationalImpact(key, answer, sector),
            financial: getFinancialImpact(currentCost, potentialSavings),
            growth: getGrowthImpact(key, answer, sector)
          },
          recommendation: {
            tool: getRecommendedTool(key, sector),
            description: getToolDescription(key, sector),
            benefits: getToolBenefits(key, sector)
          }
        });
      }
    }
  });

  return insights;
}

// Funciones auxiliares para generar textos personalizados
function getProblemDescription(key: string, answer: string, sector: BusinessSector): string {
  const descriptions: Record<string, string> = {
    'operacion-diaria': 'perdiendo tiempo y dinero trabajando en papel',
    'menu-digital': 'gastando dinero cada vez que cambias tu menú',
    'inventario-restaurante': 'desperdiciando dinero en inventario sin control',
    'gestion-ordenes': 'perdiendo órdenes y tiempo buscando información',
    'comisiones-tecnicos': 'perdiendo horas valiosas calculando comisiones manualmente',
    'inventario-repuestos': 'comprando repuestos duplicados o faltándote los necesarios',
    'comunicacion-clientes': 'perdiendo tiempo en llamadas que podrías evitar',
    'como-cotiza': 'tardando horas en cada cotización',
    'calculo-costos': 'perdiendo dinero por no saber tus costos reales'
  };
  return descriptions[key] || 'perdiendo oportunidades de optimización';
}

function getOperationalImpact(key: string, answer: string, sector: BusinessSector): string {
  const impacts: Record<string, string> = {
    'operacion-diaria': 'Cada orden perdida es un cliente insatisfecho y dinero que no ingresa',
    'menu-digital': 'Cada cambio de menú te cuesta tiempo y dinero en impresión',
    'inventario-restaurante': 'El desperdicio y las compras innecesarias reducen tu margen de ganancia',
    'gestion-ordenes': 'Las órdenes perdidas y la falta de organización afectan tu reputación',
    'comisiones-tecnicos': 'El tiempo que gastas calculando comisiones es tiempo que no reparas',
    'inventario-repuestos': 'Compras duplicadas y faltantes afectan tu flujo de caja',
    'comunicacion-clientes': 'Las llamadas constantes interrumpen tu trabajo y reducen productividad',
    'como-cotiza': 'Las cotizaciones lentas hacen que pierdas clientes que buscan rapidez',
    'calculo-costos': 'No saber tus costos reales significa que puedes estar vendiendo a pérdida'
  };
  return impacts[key] || 'La falta de organización limita tu capacidad de crecimiento';
}

function getFinancialImpact(currentCost: any, potentialSavings: any): string {
  const monthlySavings = potentialSavings.moneyCost;
  const yearlySavings = monthlySavings * 12;
  return `Podrías ahorrar aproximadamente $${Math.round(monthlySavings)} mensuales ($${Math.round(yearlySavings)} al año) en costos directos, además de ${Math.round(potentialSavings.timeHours)} horas semanales que podrías usar para hacer crecer tu negocio.`;
}

function getGrowthImpact(key: string, answer: string, sector: BusinessSector): string {
  return 'Con más tiempo libre y menos errores, puedes enfocarte en lo que realmente importa: hacer crecer tu negocio, atender mejor a tus clientes y pensar en estrategias, no en números.';
}

function getRecommendedTool(key: string, sector: BusinessSector): string {
  const tools: Record<string, string> = {
    'operacion-diaria': 'Sistema de gestión integrado',
    'menu-digital': 'Menú digital con código QR',
    'inventario-restaurante': 'Sistema de control de inventario',
    'gestion-ordenes': 'Sistema de gestión de órdenes',
    'comisiones-tecnicos': 'Sistema de cálculo automático de comisiones',
    'inventario-repuestos': 'Sistema de control de inventario de repuestos',
    'comunicacion-clientes': 'Sistema de comunicación automática con clientes',
    'como-cotiza': 'Sistema de cotizaciones automáticas',
    'calculo-costos': 'Sistema de cálculo de costos reales'
  };
  return tools[key] || 'Sistema de gestión empresarial';
}

function getToolDescription(key: string, sector: BusinessSector): string {
  const descriptions: Record<string, string> = {
    'operacion-diaria': 'Un sistema que digitaliza todas tus operaciones, eliminando el papel y garantizando que ninguna orden se pierda',
    'menu-digital': 'Un menú digital que se actualiza instantáneamente sin costo, accesible desde cualquier celular',
    'inventario-restaurante': 'Un sistema que controla tu inventario automáticamente, alertándote cuando algo se agota',
    'gestion-ordenes': 'Un sistema que centraliza todas tus órdenes, permitiéndote ver el estado de cada una en tiempo real',
    'comisiones-tecnicos': 'Un sistema que calcula las comisiones automáticamente basado en cada trabajo realizado',
    'inventario-repuestos': 'Un sistema que controla tu inventario de repuestos, evitando compras duplicadas y faltantes',
    'comunicacion-clientes': 'Un sistema que informa automáticamente a los clientes sobre el estado de su reparación',
    'como-cotiza': 'Un sistema que genera cotizaciones profesionales en minutos con cálculos automáticos',
    'calculo-costos': 'Un sistema que calcula tus costos reales de producción automáticamente'
  };
  return descriptions[key] || 'Una herramienta que optimiza tus procesos y te ahorra tiempo y dinero';
}

function getToolBenefits(key: string, sector: BusinessSector): string[] {
  const benefits: Record<string, string[]> = {
    'operacion-diaria': [
      'Elimina pérdida de órdenes',
      'Ahorra horas de trabajo diarias',
      'Reduce errores significativamente',
      'Mejora la experiencia del cliente'
    ],
    'menu-digital': [
      'Actualización instantánea sin costo',
      'Ahorro en impresión',
      'Mejor experiencia para el cliente',
      'Fácil de mantener'
    ],
    'inventario-restaurante': [
      'Reduce desperdicio',
      'Evita compras innecesarias',
      'Ahorra tiempo en verificación',
      'Mejora tu margen de ganancia'
    ],
    'gestion-ordenes': [
      'Nunca pierdes una orden',
      'Control total en tiempo real',
      'Mejor comunicación con clientes',
      'Más tiempo para reparar'
    ],
    'comisiones-tecnicos': [
      'Cálculo automático sin errores',
      'Ahorra horas de trabajo',
      'Transparencia total',
      'Pagos más rápidos'
    ],
    'inventario-repuestos': [
      'Evita compras duplicadas',
      'Alertas de stock bajo',
      'Mejor flujo de caja',
      'Más organización'
    ],
    'comunicacion-clientes': [
      'Menos llamadas interrumpiendo',
      'Clientes más satisfechos',
      'Más tiempo para trabajar',
      'Mejor reputación'
    ],
    'como-cotiza': [
      'Cotizaciones en minutos',
      'Cálculos automáticos sin errores',
      'Más clientes atendidos',
      'Imagen más profesional'
    ],
    'calculo-costos': [
      'Conoces tus costos reales',
      'Mejores decisiones de precios',
      'Mayor margen de ganancia',
      'Sin vender a pérdida'
    ]
  };
  return benefits[key] || [
    'Ahorra tiempo',
    'Reduce errores',
    'Mejora la organización',
    'Aumenta la productividad'
  ];
}

/**
 * Genera mensaje personalizado consultivo
 */
export function generatePersonalizedMessage(
  answers: Record<string, any>,
  sector: BusinessSector,
  summary: ConversationalDiagnosticResult['summary']
): ConversationalDiagnosticResult['personalizedMessage'] {
  const employeeRange = answers['empleados'] || '1-5';
  const hasMultipleLocations = answers['sucursales'] === 'varias';
  
  const greeting = `Hola${answers.nombre ? `, ${answers.nombre}` : ''}`;
  
  const context = `He analizado tu ${getSectorName(sector)} y encontré algunas áreas donde estás perdiendo tiempo y dinero que podrías estar usando para hacer crecer tu negocio.`;
  
  const opportunity = `Actualmente, estás invirtiendo aproximadamente ${Math.round(summary.totalCurrentCost.timeHours)} horas semanales y $${Math.round(summary.totalCurrentCost.moneyCost)} mensuales en procesos que podrían automatizarse. Con las herramientas adecuadas, podrías recuperar ${Math.round(summary.totalPotentialSavings.timeHours)} horas semanales y ahorrar $${Math.round(summary.totalPotentialSavings.moneyCost)} mensuales.`;
  
  const vision = `Imagina tener ${Math.round(summary.totalPotentialSavings.timeHours)} horas más cada semana. Tiempo para pensar en estrategias, atender mejor a tus clientes, y hacer crecer tu negocio sin miedo al descontrol. Menos errores, más organización, y la tranquilidad de saber que todo está bajo control.`;
  
  return {
    greeting,
    context,
    opportunity,
    vision
  };
}

function getSectorName(sector: BusinessSector): string {
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


