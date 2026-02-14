/**
 * Sistema de Diagnóstico Conversacional Empresarial
 * 
 * Enfoque consultivo que calcula costos actuales vs. ahorros potenciales
 * Genera informes profesionales, no comerciales
 */

import { 
  getCurrentSituationImageUrl, 
  getOpportunityImageUrl, 
  getOperationalImpactImageUrl, 
  getFutureVisionImageUrl,
  getSummaryImageUrl 
} from './getResultImageUrl';

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

/**
 * Sistema de inferencias internas (no visible al usuario)
 * Se usa para entender mejor el negocio y generar insights más precisos
 */
export interface InternalInferences {
  sector: BusinessSector;
  madurezDigital: 'baja' | 'media' | 'alta';
  riesgosDetectados: Array<{
    id: string;
    tipo: 'tiempo' | 'dinero' | 'errores' | 'crecimiento';
    severidad: 'baja' | 'media' | 'alta';
    descripcion: string;
  }>;
  procesosManuales: Array<{
    id: string;
    nombre: string;
    tiempoSemanal: number;
    costoMensual: number;
  }>;
  impactoTiempoEstimado: number;
  impactoCostoEstimado: number;
  nivelOportunidad: 'bajo' | 'medio' | 'alto';
}

/**
 * Insight mejorado con explicaciones claras, empatía y visualización
 * Mantiene compatibilidad con formato viejo para el frontend
 */
export interface DiagnosticInsight {
  // Campos legacy (para compatibilidad con frontend)
  problem?: string; // DEPRECATED: Usar title en su lugar
  impact?: { // DEPRECATED: Usar operationalImpact en su lugar
    operational: string;
    financial: string;
    growth: string;
  };
  
  // Campos nuevos (mejorados)
  // Título amable y empático (no "problema")
  title: string;
  // Explicación simple de la situación actual (lenguaje humano)
  currentSituation: string;
  // Qué actividades representan estas horas/costos
  whatThisMeans?: {
    timeBreakdown?: string; // Explicación de las horas
    costBreakdown?: string; // Explicación de los costos
  };
  // Costos actuales (transparentes)
  currentCost: {
    timeHours: number; // Horas por semana
    moneyCost: number; // Costo mensual estimado
    errorRate: number; // Porcentaje de errores
    explanation?: string; // De dónde salen estos números
  };
  // Ahorros potenciales (conservadores)
  potentialSavings: {
    timeHours: number;
    moneyCost: number;
    errorReduction: number;
    explanation?: string; // Cómo se calcula el ahorro
  };
  // Impacto operativo (consecuencias reales, sin alarmismo)
  operationalImpact?: {
    daily: string; // Impacto en el día a día
    weekly: string; // Impacto semanal
    monthly: string; // Impacto mensual
  };
  // Oportunidad detectada (positivo, no culpabilizador)
  opportunity?: {
    title: string;
    description: string;
    whatWouldImprove: string[]; // Qué mejoraría en el día a día
  };
  // Recomendación (herramienta/solución)
  recommendation: {
    tool: string;
    description: string;
    benefits: string[];
  };
  // Prompt para generar imagen explicativa (estilo ilustración profesional)
  imagePrompt?: string;
}

export interface ConversationalDiagnosticResult {
  sector: BusinessSector;
  insights: DiagnosticInsight[];
  summary: {
    totalCurrentCost: {
      timeHours: number;
      moneyCost: number;
      explanation: string; // Explicación transparente de los cálculos
    };
    totalPotentialSavings: {
      timeHours: number;
      moneyCost: number;
      explanation: string; // Explicación de cómo se calculó el ahorro
    };
    roi: number; // Retorno de inversión estimado
    roiExplanation: string; // Explicación del ROI
    imageUrl?: string; // URL de la imagen para el resumen
  };
  // Estructura mejorada de resultados
  currentSituation: {
    title: string;
    description: string;
    highlights: string[]; // Puntos clave de la situación actual
    imageUrl?: string; // URL de la imagen para la situación actual
  };
  opportunities: Array<{
    title: string;
    description: string;
    impact: {
      time?: string;
      money?: string;
      quality?: string;
    };
    dailyImprovement: string[]; // Qué mejoraría en el día a día
    imageUrl?: string; // URL de la imagen para esta oportunidad
  }>;
  operationalImpact: {
    title: string;
    description: string;
    consequences: Array<{
      area: string;
      impact: string;
      imageUrl?: string; // URL de la imagen para este impacto
    }>;
  };
  futureVision: {
    title: string;
    description: string;
    benefits: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    imageUrl?: string; // URL de la imagen para la visión futura
  };
  personalizedMessage: {
    greeting: string;
    context: string;
    opportunity: string;
    vision: string;
  };
  // Inferencias internas (para debug, no se muestran al usuario)
  _internalInferences?: InternalInferences;
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
    },
    {
      id: 'pedidos-diarios',
      sector: 'restaurante',
      title: '¿Cuántos pedidos manejas aproximadamente al día?',
      subtitle: 'Esto ayuda a entender el volumen de trabajo y calcular mejor los ahorros',
      type: 'number',
      placeholder: 'Ej: 50, 100, 200...',
      validation: {
        min: 1,
        max: 10000,
        required: false
      }
    },
    {
      id: 'mesas-restaurante',
      sector: 'restaurante',
      title: '¿Cuántas mesas tienes aproximadamente?',
      subtitle: 'Esto ayuda a dimensionar el sistema',
      type: 'number',
      placeholder: 'Ej: 5, 10, 20...',
      validation: {
        min: 1,
        max: 500,
        required: false
      }
    },
    {
      id: 'gasto-papel-mes',
      sector: 'restaurante',
      title: '¿Cuánto gastas aproximadamente en papel/menús al mes?',
      subtitle: 'Solo si usas menús impresos',
      type: 'number',
      placeholder: 'Ej: 50, 100, 200 (en miles de pesos)',
      validation: {
        min: 0,
        max: 1000,
        required: false
      }
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
 * Genera inferencias internas sobre el negocio
 * No visible al usuario, solo para lógica interna
 */
export function generateInternalInferences(
  answers: Record<string, any>,
  sector: BusinessSector
): InternalInferences {
  const riesgosDetectados: InternalInferences['riesgosDetectados'] = [];
  const procesosManuales: InternalInferences['procesosManuales'] = [];
  let totalTimeHours = 0;
  let totalMoneyCost = 0;

  // Analizar respuestas para detectar riesgos y procesos manuales
  Object.keys(answers).forEach(key => {
    const answer = answers[key];
    const question = [...SECTOR_QUESTIONS[sector], ...TRANSVERSAL_QUESTIONS]
      .find(q => q.id === key);

    if (question && question.options) {
      const selectedOption = question.options.find(opt => opt.value === answer);
      if (selectedOption?.costImpact) {
        const { timeHours = 0, moneyCost = 0, errorRate = 0 } = selectedOption.costImpact;
        totalTimeHours += timeHours;
        totalMoneyCost += moneyCost;

        // Detectar riesgos
        if (timeHours > 5) {
          riesgosDetectados.push({
            id: key,
            tipo: 'tiempo',
            severidad: timeHours > 10 ? 'alta' : timeHours > 7 ? 'media' : 'baja',
            descripcion: getRiskDescription(key, answer, sector, 'tiempo')
          });
        }

        if (moneyCost > 100) {
          riesgosDetectados.push({
            id: `${key}-cost`,
            tipo: 'dinero',
            severidad: moneyCost > 300 ? 'alta' : moneyCost > 200 ? 'media' : 'baja',
            descripcion: getRiskDescription(key, answer, sector, 'dinero')
          });
        }

        if (errorRate > 10) {
          riesgosDetectados.push({
            id: `${key}-errors`,
            tipo: 'errores',
            severidad: errorRate > 15 ? 'alta' : 'media',
            descripcion: getRiskDescription(key, answer, sector, 'errores')
          });
        }

        // Detectar procesos manuales
        if (timeHours > 3) {
          procesosManuales.push({
            id: key,
            nombre: getProcessName(key, sector),
            tiempoSemanal: timeHours,
            costoMensual: moneyCost
          });
        }
      }
    }
  });

  // Determinar madurez digital
  let madurezDigital: 'baja' | 'media' | 'alta' = 'baja';
  const digitalIndicators = [
    answers['operacion-diaria']?.includes('sistema') || answers['operacion-diaria'] === 'sistema-completo',
    answers['menu-digital'] === 'solo-digital' || answers['menu-digital'] === 'ambos',
    answers['inventario-restaurante'] === 'sistema',
    answers['presencia-web'] === 'web-completa'
  ];
  const digitalCount = digitalIndicators.filter(Boolean).length;
  if (digitalCount >= 3) madurezDigital = 'alta';
  else if (digitalCount >= 1) madurezDigital = 'media';

  // Determinar nivel de oportunidad
  let nivelOportunidad: 'bajo' | 'medio' | 'alto' = 'bajo';
  if (totalTimeHours > 15 || totalMoneyCost > 500) nivelOportunidad = 'alto';
  else if (totalTimeHours > 8 || totalMoneyCost > 250) nivelOportunidad = 'medio';

  return {
    sector,
    madurezDigital,
    riesgosDetectados,
    procesosManuales,
    impactoTiempoEstimado: totalTimeHours,
    impactoCostoEstimado: totalMoneyCost,
    nivelOportunidad
  };
}

// Funciones auxiliares para inferencias
function getRiskDescription(key: string, answer: string, sector: BusinessSector, tipo: 'tiempo' | 'dinero' | 'errores'): string {
  // Implementación básica, se puede expandir
  return `Riesgo detectado en ${key}`;
}

function getProcessName(key: string, sector: BusinessSector): string {
  const names: Record<string, string> = {
    'operacion-diaria': 'Gestión de pedidos',
    'menu-digital': 'Actualización de menú',
    'inventario-restaurante': 'Control de inventario',
    'gestion-ordenes': 'Gestión de órdenes'
  };
  return names[key] || 'Proceso manual';
}

/**
 * Calcula costos actuales y ahorros potenciales con explicaciones transparentes
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

  // Generar explicaciones transparentes
  const timeExplanation = totalTimeHours > 0
    ? `Estas ${Math.round(totalTimeHours)} horas semanales representan tiempo que actualmente inviertes en tareas manuales repetitivas: buscar comandas, anotar pedidos, actualizar inventarios, calcular totales a mano, entre otras actividades que son muy comunes en negocios como el tuyo.`
    : 'Tu negocio tiene procesos bastante organizados.';

  const costExplanation = totalMoneyCost > 0
    ? `Los $${Math.round(totalMoneyCost)} mensuales incluyen costos directos como papel e impresiones, tiempo perdido buscando información, compras innecesarias por falta de control, y oportunidades de venta que no se concretan por demoras.`
    : 'Tus costos operativos están bien controlados.';

  const savingsExplanation = totalPotentialTimeSavings > 0
    ? `Con sistemas digitales, podrías recuperar aproximadamente el 80% de este tiempo (${Math.round(totalPotentialTimeSavings)} horas semanales) y reducir los costos en alrededor del 85% ($${Math.round(totalPotentialMoneySavings)} mensuales). Son estimaciones conservadoras basadas en experiencias reales de negocios similares.`
    : 'Hay oportunidades menores de optimización.';

  const roiExplanation = roi > 0
    ? `El ROI de ${Math.round(roi)}% significa que por cada peso que inviertas en digitalización, obtendrías aproximadamente $${(roi / 100 + 1).toFixed(2)} en retorno. Este cálculo considera el ahorro mensual estimado menos el costo del sistema ($${systemCost}/mes).`
    : 'El retorno de inversión sería positivo a mediano plazo.';

  return {
    totalCurrentCost: {
      timeHours: totalTimeHours,
      moneyCost: totalMoneyCost,
      explanation: timeExplanation + ' ' + costExplanation
    },
    totalPotentialSavings: {
      timeHours: totalPotentialTimeSavings,
      moneyCost: totalPotentialMoneySavings,
      explanation: savingsExplanation
    },
    roi: Math.max(0, roi),
    roiExplanation
  };
}

/**
 * Genera insights específicos basados en las respuestas
 * Versión mejorada con tono empático, explicaciones claras e imágenes
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
          ((selectedOption.costImpact.timeHours ?? 0) > 5 || 
           (selectedOption.costImpact.moneyCost ?? 0) > 100)) {
        
        const currentCost = {
          timeHours: selectedOption.costImpact.timeHours ?? 0,
          moneyCost: selectedOption.costImpact.moneyCost ?? 0,
          errorRate: selectedOption.costImpact.errorRate ?? 0
        };
        const potentialSavings = {
          timeHours: currentCost.timeHours * 0.8,
          moneyCost: currentCost.moneyCost * 0.85,
          errorReduction: currentCost.errorRate * 0.9
        };

        // Generar insight con nuevo formato
        const insight = generateImprovedInsight(key, answer, sector, currentCost, potentialSavings);
        insights.push(insight);
      }
    }
  });

  return insights;
}

/**
 * Genera un insight mejorado con tono empático y explicaciones claras
 */
function generateImprovedInsight(
  key: string,
  answer: string,
  sector: BusinessSector,
  currentCost: { timeHours: number; moneyCost: number; errorRate: number },
  potentialSavings: { timeHours: number; moneyCost: number; errorReduction: number }
): DiagnosticInsight {
  const title = getEmpatheticTitle(key, sector);
  const currentSituation = getCurrentSituationDescription(key, answer, sector);
  const whatThisMeans = getWhatThisMeans(key, currentCost, sector);
  const operationalImpact = getOperationalImpactNew(key, currentCost, sector);
  const opportunity = getOpportunityDescription(key, sector);
  const recommendation = {
    tool: getRecommendedTool(key, sector),
    description: getToolDescription(key, sector),
    benefits: getToolBenefits(key, sector)
  };
  const imagePrompt = generateImagePrompt(key, answer, sector);

  // Explicaciones transparentes
  const costExplanation = getCostExplanation(key, currentCost, sector);
  const savingsExplanation = getSavingsExplanation(key, potentialSavings, sector);

  // Generar campos legacy para compatibilidad con frontend
  const problem = `Estás ${getProblemDescription(key, answer, sector)}`;
  const impact = {
    operational: operationalImpact?.daily || getOperationalImpact(key, answer, sector),
    financial: getFinancialImpact(currentCost, potentialSavings),
    growth: getGrowthImpact(key, answer, sector)
  };

  return {
    // Campos nuevos (mejorados)
    title,
    currentSituation,
    whatThisMeans,
    currentCost: {
      ...currentCost,
      explanation: costExplanation
    },
    potentialSavings: {
      ...potentialSavings,
      explanation: savingsExplanation
    },
    operationalImpact,
    opportunity,
    recommendation,
    imagePrompt,
    // Campos legacy (para compatibilidad con frontend existente)
    problem,
    impact
  };
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
 * Genera mensaje personalizado consultivo (mejorado con tono empático)
 */
export function generatePersonalizedMessage(
  answers: Record<string, any>,
  sector: BusinessSector,
  summary: ConversationalDiagnosticResult['summary']
): ConversationalDiagnosticResult['personalizedMessage'] {
  const employeeRange = answers['empleados'] || '1-5';
  const hasMultipleLocations = answers['sucursales'] === 'varias';
  const sectorName = getSectorName(sector);
  
  // Obtener nombre y empresa de las respuestas o del contacto
  const nombre = answers.nombre || answers.contactName || '';
  const empresa = answers.empresa || answers.contactCompany || '';
  
  // Saludo personalizado
  const greeting = nombre ? `Hola, ${nombre}!` : 'Hola!';
  
  // Contexto personalizado usando nombre y empresa
  let context = `He analizado ${empresa ? `tu ${empresa}` : `tu ${sectorName}`} y encontré algunas áreas muy comunes en negocios como ${empresa ? `el de ${empresa}` : 'el tuyo'} donde se puede optimizar tiempo y recursos.`;
  if (nombre) {
    context += ` ${nombre}, no es que estés haciendo algo mal, simplemente hay oportunidades de mejora que podrían darte más libertad y tranquilidad.`;
  } else {
    context += ` No es que estés haciendo algo mal, simplemente hay oportunidades de mejora que podrían darte más libertad y tranquilidad.`;
  }
  
  // Oportunidad personalizada
  let opportunity = `Actualmente${empresa ? `, en ${empresa}` : ''}, inviertes aproximadamente ${Math.round(summary.totalCurrentCost.timeHours)} horas semanales y $${Math.round(summary.totalCurrentCost.moneyCost)} mensuales en procesos manuales que son necesarios pero que consumen mucho tiempo.`;
  if (nombre) {
    opportunity += ` ${nombre}, con las herramientas adecuadas, podrías recuperar ${Math.round(summary.totalPotentialSavings.timeHours)} horas semanales y ahorrar $${Math.round(summary.totalPotentialSavings.moneyCost)} mensuales.`;
  } else {
    opportunity += ` Con las herramientas adecuadas, podrías recuperar ${Math.round(summary.totalPotentialSavings.timeHours)} horas semanales y ahorrar $${Math.round(summary.totalPotentialSavings.moneyCost)} mensuales.`;
  }
  opportunity += ` Son estimaciones conservadoras basadas en experiencias reales.`;
  
  // Visión personalizada
  let vision = `Imagina${nombre ? `, ${nombre}` : ''} tener ${Math.round(summary.totalPotentialSavings.timeHours)} horas más cada semana.`;
  if (empresa) {
    vision += ` Tiempo para pensar en estrategias para ${empresa}, atender mejor a tus clientes, y hacer crecer tu negocio sin miedo al descontrol.`;
  } else {
    vision += ` Tiempo para pensar en estrategias, atender mejor a tus clientes, y hacer crecer tu negocio sin miedo al descontrol.`;
  }
  vision += ` Menos errores, más organización, y la tranquilidad de saber que todo está bajo control. No es un sueño, es algo alcanzable con los procesos y herramientas correctas.`;
  
  return {
    greeting,
    context,
    opportunity,
    vision
  };
}

/**
 * Genera la estructura mejorada de resultados
 */
export function generateEnhancedResultStructure(
  answers: Record<string, any>,
  sector: BusinessSector,
  insights: DiagnosticInsight[],
  summary: ConversationalDiagnosticResult['summary']
): {
  currentSituation: ConversationalDiagnosticResult['currentSituation'];
  opportunities: ConversationalDiagnosticResult['opportunities'];
  operationalImpact: ConversationalDiagnosticResult['operationalImpact'];
  futureVision: ConversationalDiagnosticResult['futureVision'];
  summary: ConversationalDiagnosticResult['summary'];
} {
  const sectorName = getSectorName(sector);
  const employeeRange = answers['empleados'] || '1-5';
  const nombre = answers.nombre || answers.contactName || '';
  const empresa = answers.empresa || answers.contactCompany || '';
  
  // Generar currentSituation
  const currentSituation = generateCurrentSituation(sector, summary, insights, nombre, empresa);
  currentSituation.imageUrl = getCurrentSituationImageUrl(sector);
  
  // Generar opportunities
  const opportunities = generateOpportunities(insights);
  opportunities.forEach(opp => {
    opp.imageUrl = getOpportunityImageUrl(sector, opp.title);
  });
  
  // Si no hay oportunidades, generar al menos una genérica (SIEMPRE)
  if (opportunities.length === 0) {
    const firstInsight = insights[0];
    opportunities.push({
      title: 'Optimización de procesos',
      description: 'Hay oportunidades de mejorar tus procesos actuales para ahorrar tiempo y reducir costos.',
      impact: {
        time: firstInsight.potentialSavings.timeHours > 0 
          ? `Ahorro estimado: ${Math.round(firstInsight.potentialSavings.timeHours)} horas/semana`
          : undefined,
        money: firstInsight.potentialSavings.moneyCost > 0
          ? `Ahorro estimado: $${Math.round(firstInsight.potentialSavings.moneyCost)}/mes`
          : undefined
      },
      dailyImprovement: ['Menos tiempo en tareas repetitivas', 'Mayor organización', 'Menos errores'],
      imageUrl: getOpportunityImageUrl(sector, 'optimizacion-procesos')
    });
  }
  
  // Generar operationalImpact
  const operationalImpact = generateOperationalImpact(sector, summary, insights, nombre, empresa);
  operationalImpact.consequences.forEach(consequence => {
    const impactArea = getImpactAreaFromConsequence(consequence.area);
    if (impactArea) {
      consequence.imageUrl = getOperationalImpactImageUrl(sector, impactArea);
    } else {
      // Si no se puede determinar el área, usar 'tiempo' como default
      consequence.imageUrl = getOperationalImpactImageUrl(sector, 'tiempo');
    }
  });
  
  // Generar futureVision
  const futureVision = generateFutureVision(sector, summary, nombre, empresa);
  futureVision.imageUrl = getFutureVisionImageUrl(sector);
  
  // Agregar imagen al summary (usar 'beforeAfter' como default)
  const summaryWithImage = {
    ...summary,
    imageUrl: getSummaryImageUrl(sector, 'beforeAfter')
  };
  
  return {
    currentSituation,
    opportunities,
    operationalImpact,
    futureVision,
    summary: summaryWithImage
  };
}

/**
 * Convierte el área de consecuencia a tipo de impacto
 */
function getImpactAreaFromConsequence(area: string): 'tiempo' | 'costos' | 'errores' | 'crecimiento' | null {
  const areaLower = area.toLowerCase();
  if (areaLower.includes('tiempo')) return 'tiempo';
  if (areaLower.includes('costo')) return 'costos';
  if (areaLower.includes('error')) return 'errores';
  if (areaLower.includes('crecimiento')) return 'crecimiento';
  return null;
}

/**
 * Genera descripción de la situación actual
 */
function generateCurrentSituation(
  sector: BusinessSector,
  summary: ConversationalDiagnosticResult['summary'],
  insights: DiagnosticInsight[],
  nombre: string = '',
  empresa: string = ''
): ConversationalDiagnosticResult['currentSituation'] {
  const sectorName = getSectorName(sector);
  
  const highlights: string[] = [];
  
  if (summary.totalCurrentCost.timeHours > 0) {
    highlights.push(`${nombre ? `${nombre}, ` : ''}Inviertes ${Math.round(summary.totalCurrentCost.timeHours)} horas semanales en procesos manuales repetitivos${empresa ? ` en ${empresa}` : ''}`);
  }
  
  if (summary.totalCurrentCost.moneyCost > 0) {
    highlights.push(`Aproximadamente $${Math.round(summary.totalCurrentCost.moneyCost)} mensuales en costos directos e indirectos${empresa ? ` para ${empresa}` : ''}`);
  }
  
  if (insights.length > 0) {
    highlights.push(`${insights.length} ${insights.length === 1 ? 'área identificada' : 'áreas identificadas'} con oportunidades de mejora`);
  }
  
  // Detectar procesos manuales comunes
  const manualProcesses = insights.filter(i => 
    i.currentSituation?.includes('manual') || 
    i.currentSituation?.includes('papel') ||
    i.currentSituation?.includes('WhatsApp')
  );
  
  if (manualProcesses.length > 0) {
    highlights.push('Procesos que funcionan pero requieren mucha atención manual');
  }
  
  return {
    title: 'Tu situación actual',
    description: `Tu ${sectorName} funciona, pero hay procesos que requieren mucho tiempo y atención que podrían optimizarse. Esto es muy común en negocios como el tuyo, no es un problema, simplemente hay formas más eficientes de hacer las cosas que te darían más libertad y tranquilidad.`,
    highlights: highlights.length > 0 ? highlights : [
      'Procesos manuales que requieren atención constante',
      'Tiempo invertido en tareas repetitivas',
      'Oportunidades de optimización identificadas'
    ]
  };
}

/**
 * Genera lista de oportunidades detectadas
 */
function generateOpportunities(
  insights: DiagnosticInsight[]
): ConversationalDiagnosticResult['opportunities'] {
  // Filtrar insights con oportunidad y mapear
  const opportunities = insights
    .filter(insight => insight.opportunity)
    .map(insight => ({
      title: insight.opportunity!.title,
      description: insight.opportunity!.description,
      impact: {
        time: insight.operationalImpact?.weekly ? `Semanalmente: ${insight.operationalImpact.weekly}` : undefined,
        money: insight.potentialSavings.moneyCost > 0 
          ? `Ahorro estimado: $${Math.round(insight.potentialSavings.moneyCost)} mensuales`
          : undefined,
        quality: insight.potentialSavings.errorReduction > 0
          ? `Reducción de errores: ${Math.round(insight.potentialSavings.errorReduction)}%`
          : undefined
      },
      dailyImprovement: insight.opportunity!.whatWouldImprove
    }));
  
  // Normalizar título para comparación (eliminar espacios extra, normalizar caracteres)
  const normalizeTitle = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno solo
      .replace(/[^\w\s]/g, '') // Eliminar caracteres especiales
      .trim();
  };
  
  // Eliminar duplicados basándose en el título normalizado
  const seenTitles = new Map<string, number>(); // Map para mantener el índice del primero
  const uniqueOpportunities: typeof opportunities = [];
  
  opportunities.forEach((opp, index) => {
    const normalizedTitle = normalizeTitle(opp.title);
    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.set(normalizedTitle, index);
      uniqueOpportunities.push(opp);
    } else {
      // Si es duplicado, combinar los impactos si es necesario (tomar el que tenga más información)
      const firstIndex = seenTitles.get(normalizedTitle)!;
      const firstOpp = uniqueOpportunities[firstIndex];
      
      // Si el duplicado tiene más información en impact, actualizar
      const hasMoreInfo = (opp.impact.time || opp.impact.money || opp.impact.quality) &&
                          !(firstOpp.impact.time && firstOpp.impact.money && firstOpp.impact.quality);
      
      if (hasMoreInfo) {
        uniqueOpportunities[firstIndex] = {
          ...firstOpp,
          impact: {
            time: opp.impact.time || firstOpp.impact.time,
            money: opp.impact.money || firstOpp.impact.money,
            quality: opp.impact.quality || firstOpp.impact.quality
          }
        };
      }
    }
  });
  
  console.log('🔍 [BACKEND] Opportunities deduplication:', {
    total: opportunities.length,
    unique: uniqueOpportunities.length,
    removed: opportunities.length - uniqueOpportunities.length,
    titles: uniqueOpportunities.map(o => o.title)
  });
  
  return uniqueOpportunities;
}

/**
 * Genera descripción del impacto operativo
 */
function generateOperationalImpact(
  sector: BusinessSector,
  summary: ConversationalDiagnosticResult['summary'],
  insights: DiagnosticInsight[],
  nombre: string = '',
  empresa: string = ''
): ConversationalDiagnosticResult['operationalImpact'] {
  const sectorName = getSectorName(sector);
  
  const consequences: Array<{ area: string; impact: string }> = [];
  
  // Impacto en tiempo - reducir umbral para que siempre se genere si hay tiempo
  if (summary.totalCurrentCost.timeHours > 0) {
    const empresaText = empresa ? ` en ${empresa}` : '';
    consequences.push({
      area: 'Tiempo',
      impact: summary.totalCurrentCost.timeHours > 10
        ? `${nombre ? `${nombre}, ` : ''}Semanalmente inviertes ${Math.round(summary.totalCurrentCost.timeHours)} horas${empresaText} en procesos manuales que podrían automatizarse. Este tiempo podría usarse para hacer crecer${empresaText} tu negocio, mejorar la atención a clientes, o simplemente descansar.`
        : `${nombre ? `${nombre}, ` : ''}Inviertes ${Math.round(summary.totalCurrentCost.timeHours)} horas semanales${empresaText} en procesos manuales. Aunque no es mucho tiempo, cada hora cuenta cuando estás ocupado con el día a día${empresaText ? ` de ${empresa}` : ' del negocio'}.`
    });
  }
  
  // Impacto en costos - reducir umbral para que siempre se genere si hay costos
  if (summary.totalCurrentCost.moneyCost > 0) {
    consequences.push({
      area: 'Costos',
      impact: summary.totalCurrentCost.moneyCost > 200
        ? `Aproximadamente $${Math.round(summary.totalCurrentCost.moneyCost)} mensuales en costos directos (papel, impresiones) e indirectos (tiempo perdido, oportunidades no concretadas). Estos costos son reales y afectan tu margen de ganancia.`
        : `Aproximadamente $${Math.round(summary.totalCurrentCost.moneyCost)} mensuales en costos operativos. Aunque no es una cantidad grande, estos costos se acumulan y podrían reducirse con mejores procesos.`
    });
  }
  
  // Impacto en errores - reducir umbral
  const totalErrorRate = insights.reduce((sum, i) => sum + (i.currentCost.errorRate || 0), 0);
  if (totalErrorRate > 0) {
    consequences.push({
      area: 'Errores',
      impact: totalErrorRate > 10
        ? `Los procesos manuales generan aproximadamente ${Math.round(totalErrorRate)}% de errores que requieren corrección. Cada error toma tiempo y puede afectar la satisfacción de tus clientes.`
        : `Los procesos manuales pueden generar errores ocasionales que requieren corrección. Aunque no es frecuente, cada error toma tiempo y puede afectar la calidad del servicio.`
    });
  }
  
  // Impacto en crecimiento - siempre incluirlo
  const empresaTextCrecimiento = empresa ? ` para ${empresa}` : '';
  consequences.push({
    area: 'Crecimiento',
    impact: `${nombre ? `${nombre}, ` : ''}Con procesos más eficientes${empresaTextCrecimiento}, tendrías más tiempo y recursos para pensar en estrategias${empresaTextCrecimiento ? ` para ${empresa}` : ''}, expandir tu negocio, o simplemente tener más tranquilidad. El crecimiento requiere tiempo, y ese tiempo está actualmente ocupado en tareas operativas.`
  });
  
  // Asegurar que siempre haya al menos una consecuencia
  if (consequences.length === 0) {
    consequences.push({
      area: 'Organización',
      impact: 'Los procesos manuales requieren mucha atención y pueden generar desorganización cuando hay mucho movimiento o cuando estás ocupado con otras tareas.'
    });
  }
  
  const empresaTextFinal = empresa ? ` de ${empresa}` : ` de tu ${sectorName}`;
  
  return {
    title: 'Impacto operativo',
    description: `${nombre ? `${nombre}, ` : ''}Estos procesos manuales tienen consecuencias reales en el día a día${empresaTextFinal}. No son problemas graves, pero sí oportunidades de mejora que, si se abordan, te darían más libertad y control.`,
    consequences
  };
}

/**
 * Genera visión futura del negocio
 */
function generateFutureVision(
  sector: BusinessSector,
  summary: ConversationalDiagnosticResult['summary'],
  nombre: string = '',
  empresa: string = ''
): ConversationalDiagnosticResult['futureVision'] {
  const sectorName = getSectorName(sector);
  const hoursSaved = Math.round(summary.totalPotentialSavings.timeHours);
  const moneySaved = Math.round(summary.totalPotentialSavings.moneyCost);
  
  const empresaText = empresa ? ` para ${empresa}` : '';
  const nombreText = nombre ? `, ${nombre}` : '';
  
  const benefits: Array<{ icon: string; title: string; description: string }> = [
    {
      icon: '⏰',
      title: 'Más tiempo',
      description: `${hoursSaved} horas semanales que podrías usar${empresaText} para hacer crecer${empresaText ? ` ${empresa}` : ' tu negocio'}, atender mejor a tus clientes, o simplemente descansar. Tiempo real que recuperarías.`
    },
    {
      icon: '💰',
      title: 'Ahorro mensual',
      description: `Aproximadamente $${moneySaved} mensuales en ahorros directos e indirectos. Dinero que podría reinvertirse en tu negocio o simplemente mejorar tu flujo de caja.`
    },
    {
      icon: '😌',
      title: 'Menos estrés',
      description: 'Procesos más claros y organizados significan menos preocupaciones diarias. Saber que todo está bajo control da tranquilidad y reduce el estrés del día a día.'
    },
    {
      icon: '📈',
      title: 'Más control',
      description: 'Información clara y accesible en cualquier momento. Saber exactamente qué está pasando en tu negocio sin tener que buscarlo o calcularlo manualmente.'
    },
    {
      icon: '🚀',
      title: 'Crecimiento',
      description: 'Con más tiempo y menos errores, puedes enfocarte en hacer crecer tu negocio. Pensar en estrategias, mejorar servicios, o expandir sin miedo al descontrol.'
    }
  ];
  
  return {
    title: 'Cómo sería tu negocio con procesos optimizados',
    description: `Imagina tu ${sectorName} funcionando de forma más fluida. No es un cambio radical, simplemente procesos más claros, menos tiempo perdido, y más control sobre lo que pasa día a día. Es algo alcanzable y realista.`,
    benefits
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

// ============================================
// NUEVAS FUNCIONES AUXILIARES (Tono Empático)
// ============================================

/**
 * Genera títulos empáticos (no culpabilizadores)
 */
function getEmpatheticTitle(key: string, sector: BusinessSector): string {
  const titles: Record<string, string> = {
    'operacion-diaria': 'Gestión de pedidos en papel',
    'menu-digital': 'Actualización manual del menú',
    'inventario-restaurante': 'Control de inventario manual',
    'mesas-meseros': 'Comunicación entre meseros y cocina',
    'gestion-ordenes': 'Registro de órdenes manual',
    'comisiones-tecnicos': 'Cálculo manual de comisiones',
    'inventario-repuestos': 'Control de repuestos manual',
    'comunicacion-clientes': 'Seguimiento de clientes por teléfono',
    'como-cotiza': 'Cotizaciones hechas a mano',
    'calculo-costos': 'Cálculo manual de costos',
    'presencia-web': 'Presencia digital limitada'
  };
  return titles[key] || 'Proceso manual que requiere atención';
}

/**
 * Describe la situación actual de forma empática
 */
function getCurrentSituationDescription(key: string, answer: string, sector: BusinessSector): string {
  const descriptions: Record<string, string> = {
    'operacion-diaria': 'Trabajas con papel y comandas físicas, algo muy común en restaurantes. Esto significa que cada pedido se anota manualmente, se buscan comandas cuando se necesitan, y a veces se pierden órdenes cuando hay mucho movimiento.',
    'menu-digital': 'Cada vez que cambias precios o platos, imprimes nuevos menús. Esto es normal, pero cada cambio tiene un costo en tiempo y dinero que puedes evitar.',
    'inventario-restaurante': 'Llevas el control de ingredientes manualmente o simplemente vas comprando cuando te falta algo. Esto es muy común, pero puede generar desperdicio y compras innecesarias sin que te des cuenta.',
    'mesas-meseros': 'Tus meseros toman pedidos y los comunican a la cocina, ya sea verbalmente o con comandas. Cuando hay mucho movimiento, es fácil que se pierdan detalles o que haya malentendidos.',
    'gestion-ordenes': 'Registras las órdenes en papel o en WhatsApp, y luego buscas esa información cuando la necesitas. Esto funciona, pero requiere tiempo y a veces información se pierde.',
    'comisiones-tecnicos': 'Calculas las comisiones de tus técnicos manualmente, revisando cada trabajo realizado. Esto es correcto, pero toma tiempo valioso cada semana.',
    'inventario-repuestos': 'Sabes qué repuestos tienes porque los ves o los buscas cuando los necesitas. Es normal, pero a veces compras duplicados o te faltan cuando más los necesitas.',
    'comunicacion-clientes': 'Los clientes te llaman para consultar por sus reparaciones. Es buena atención, pero interrumpe tu trabajo constantemente.',
    'como-cotiza': 'Haces las cotizaciones a mano o en Excel, calculando cada detalle manualmente. Cada cotización te toma tiempo valioso.',
    'calculo-costos': 'Calculas los costos manualmente o usas aproximaciones. Esto funciona, pero puede haber errores que afecten tu margen de ganancia.',
    'presencia-web': 'No tienes presencia en internet o es muy básica. Muchos clientes buscan negocios en línea hoy en día.'
  };
  return descriptions[key] || 'Tienes procesos manuales que requieren atención constante, algo muy común en negocios como el tuyo.';
}

/**
 * Explica qué representan las horas y costos
 */
function getWhatThisMeans(key: string, currentCost: { timeHours: number; moneyCost: number; errorRate: number }, sector: BusinessSector): {
  timeBreakdown?: string;
  costBreakdown?: string;
} {
  const timeBreakdowns: Record<string, string> = {
    'operacion-diaria': `Estas ${Math.round(currentCost.timeHours)} horas semanales las inviertes en buscar comandas perdidas, reescribir pedidos, revisar notas, y coordinar entre el personal. Son actividades necesarias, pero muy repetitivas.`,
    'menu-digital': `Inviertes aproximadamente ${Math.round(currentCost.timeHours)} horas cada vez que actualizas tu menú en diseño, impresión y distribución.`,
    'inventario-restaurante': `Dedicas ${Math.round(currentCost.timeHours)} horas semanales a contar ingredientes, verificar qué falta, y decidir qué comprar. Es tiempo que podrías usar en otras cosas.`,
    'mesas-meseros': `Aquí se pierden alrededor de ${Math.round(currentCost.timeHours)} horas semanales en aclaraciones, correcciones y coordinación entre meseros y cocina.`,
    'gestion-ordenes': `Buscas información, revisas papeles o WhatsApp, y organizas datos durante ${Math.round(currentCost.timeHours)} horas cada semana.`,
    'comisiones-tecnicos': `Calculas comisiones manualmente, lo que te toma ${Math.round(currentCost.timeHours)} horas cada semana.`,
    'como-cotiza': `Cada cotización te toma tiempo en calcular y escribir, sumando ${Math.round(currentCost.timeHours)} horas semanales.`
  };

  const costBreakdowns: Record<string, string> = {
    'operacion-diaria': `Los $${Math.round(currentCost.moneyCost)} mensuales incluyen papel, impresiones, tiempo perdido buscando información, y oportunidades de venta que no se concretan por demoras.`,
    'menu-digital': `Cada cambio de menú te cuesta aproximadamente $${Math.round(currentCost.moneyCost)} en diseño e impresión.`,
    'inventario-restaurante': `El desperdicio y las compras innecesarias representan alrededor de $${Math.round(currentCost.moneyCost)} mensuales que podrías ahorrar.`,
    'mesas-meseros': `Los errores y demoras en la comunicación pueden representar $${Math.round(currentCost.moneyCost)} mensuales en oportunidades perdidas.`,
    'gestion-ordenes': `Las órdenes perdidas y el tiempo invertido representan aproximadamente $${Math.round(currentCost.moneyCost)} mensuales.`
  };

  return {
    timeBreakdown: timeBreakdowns[key],
    costBreakdown: costBreakdowns[key]
  };
}

/**
 * Impacto operativo (consecuencias reales sin alarmismo)
 */
function getOperationalImpactNew(key: string, currentCost: { timeHours: number; moneyCost: number; errorRate: number }, sector: BusinessSector): {
  daily: string;
  weekly: string;
  monthly: string;
} {
  const impacts: Record<string, { daily: string; weekly: string; monthly: string }> = {
    'operacion-diaria': {
      daily: 'Cada día dedicas tiempo a buscar comandas, reescribir pedidos y coordinar. Son minutos que se acumulan.',
      weekly: `Semanalmente inviertes ${Math.round(currentCost.timeHours)} horas en tareas repetitivas que podrían automatizarse.`,
      monthly: `Mensualmente esto representa tiempo valioso y aproximadamente $${Math.round(currentCost.moneyCost)} en costos directos e indirectos.`
    },
    'menu-digital': {
      daily: 'Cuando necesitas cambiar el menú, dedicas tiempo a diseñar e imprimir.',
      weekly: 'Estos cambios no son diarios, pero cuando ocurren requieren atención completa.',
      monthly: `Mensualmente los cambios de menú te cuestan aproximadamente $${Math.round(currentCost.moneyCost)}.`
    },
    'inventario-restaurante': {
      daily: 'Revisas qué ingredientes tienes y decides qué comprar, a veces sin tener información precisa.',
      weekly: `Dedicas ${Math.round(currentCost.timeHours)} horas semanales a controlar inventario manualmente.`,
      monthly: `El desperdicio y las compras innecesarias pueden sumar $${Math.round(currentCost.moneyCost)} mensuales.`
    },
    'mesas-meseros': {
      daily: 'Hay aclaraciones constantes entre meseros y cocina, especialmente en horas pico.',
      weekly: `Se pierden aproximadamente ${Math.round(currentCost.timeHours)} horas semanales en coordinación y correcciones.`,
      monthly: `Estos errores y demoras pueden representar $${Math.round(currentCost.moneyCost)} mensuales en oportunidades perdidas.`
    }
  };

  const defaultImpact = {
    daily: 'Esto afecta tu operación diaria de forma sutil pero constante.',
    weekly: `Semanalmente representa ${Math.round(currentCost.timeHours)} horas que podrías usar mejor.`,
    monthly: `Mensualmente son aproximadamente $${Math.round(currentCost.moneyCost)} en costos directos e indirectos.`
  };

  return impacts[key] || defaultImpact;
}

/**
 * Describe la oportunidad de mejora (positivo, no culpabilizador)
 */
function getOpportunityDescription(key: string, sector: BusinessSector): {
  title: string;
  description: string;
  whatWouldImprove: string[];
} {
  const opportunities: Record<string, { title: string; description: string; whatWouldImprove: string[] }> = {
    'operacion-diaria': {
      title: 'Digitalizar la gestión de pedidos',
      description: 'Con un sistema digital, todos tus pedidos estarían organizados, no se perderían órdenes, y podrías acceder a la información instantáneamente.',
      whatWouldImprove: [
        'No más búsqueda de comandas perdidas',
        'Pedidos organizados y accesibles siempre',
        'Más tiempo para atender clientes',
        'Menos errores en los pedidos'
      ]
    },
    'menu-digital': {
      title: 'Menú digital que se actualiza al instante',
      description: 'Un menú digital con código QR se actualiza instantáneamente sin costo de impresión. Tus clientes siempre verán el menú más actualizado.',
      whatWouldImprove: [
        'Actualizaciones instantáneas sin costo',
        'Los clientes siempre ven el menú correcto',
        'Ahorro en impresión y diseño',
        'Cambios de precio rápidos y fáciles'
      ]
    },
    'inventario-restaurante': {
      title: 'Control automático de inventario',
      description: 'Un sistema que controla tu inventario automáticamente, alertándote cuando algo se agota y ayudándote a evitar desperdicio.',
      whatWouldImprove: [
        'Siempre sabes qué tienes en stock',
        'Alertas cuando algo se agota',
        'Menos desperdicio de ingredientes',
        'Compras más inteligentes'
      ]
    },
    'mesas-meseros': {
      title: 'Comunicación fluida entre meseros y cocina',
      description: 'Con un sistema digital, los pedidos de los meseros llegan directo a la cocina, sin malentendidos ni pérdida de información.',
      whatWouldImprove: [
        'Pedidos que llegan correctos a la cocina',
        'Menos aclaraciones y correcciones',
        'Servicio más rápido',
        'Meseros más eficientes'
      ]
    },
    'gestion-ordenes': {
      title: 'Gestión centralizada de órdenes',
      description: 'Todas tus órdenes en un solo lugar, accesibles desde cualquier dispositivo, sin perder información.',
      whatWouldImprove: [
        'Toda la información en un solo lugar',
        'Búsqueda rápida de órdenes',
        'Historial completo disponible',
        'Mejor organización del trabajo'
      ]
    }
  };

  const defaultOpportunity = {
    title: 'Automatizar procesos manuales',
    description: 'Existen herramientas que pueden ayudarte a optimizar estos procesos, ahorrándote tiempo y reduciendo errores.',
    whatWouldImprove: [
      'Ahorro de tiempo valioso',
      'Menos errores humanos',
      'Mejor organización',
      'Más tiempo para hacer crecer tu negocio'
    ]
  };

  return opportunities[key] || defaultOpportunity;
}

/**
 * Genera explicación transparente de los costos
 */
function getCostExplanation(key: string, currentCost: { timeHours: number; moneyCost: number; errorRate: number }, sector: BusinessSector): string {
  const explanations: Record<string, string> = {
    'operacion-diaria': `Las ${Math.round(currentCost.timeHours)} horas semanales y $${Math.round(currentCost.moneyCost)} mensuales incluyen tiempo buscando comandas, papel e impresiones, oportunidades de venta perdidas por demoras, y errores que requieren corrección. Son estimaciones conservadoras basadas en experiencias reales de restaurantes similares.`,
    'menu-digital': `Cada cambio de menú tiene un costo aproximado de $${Math.round(currentCost.moneyCost)} en diseño e impresión. Esto se multiplica cada vez que actualizas precios o platos.`,
    'inventario-restaurante': `El desperdicio de ingredientes y las compras innecesarias representan aproximadamente $${Math.round(currentCost.moneyCost)} mensuales. Además, dedicas ${Math.round(currentCost.timeHours)} horas semanales a verificar inventario manualmente.`,
    'mesas-meseros': `Los errores en comunicación y las demoras representan aproximadamente ${Math.round(currentCost.timeHours)} horas semanales y $${Math.round(currentCost.moneyCost)} mensuales en oportunidades perdidas.`
  };

  return explanations[key] || `Estas ${Math.round(currentCost.timeHours)} horas semanales y $${Math.round(currentCost.moneyCost)} mensuales representan el costo real de trabajar con procesos manuales en tu negocio. Son estimaciones conservadoras.`;
}

/**
 * Genera explicación transparente de los ahorros
 */
function getSavingsExplanation(key: string, potentialSavings: { timeHours: number; moneyCost: number; errorReduction: number }, sector: BusinessSector): string {
  return `Con herramientas digitales, podrías recuperar aproximadamente ${Math.round(potentialSavings.timeHours)} horas semanales y ahorrar $${Math.round(potentialSavings.moneyCost)} mensuales. Son estimaciones conservadoras (80% de reducción en tiempo, 85% en costos) basadas en experiencias reales de negocios similares al tuyo que ya implementaron estas soluciones.`;
}

/**
 * Genera prompt para imagen explicativa
 * Exportada para uso en herramientas de análisis de prompts
 */
export function generateImagePrompt(key: string, answer: string, sector: BusinessSector): string {
  const prompts: Record<string, string> = {
    'operacion-diaria': 'Professional illustration showing the contrast: left side shows a busy restaurant owner surrounded by paper orders, looking confused and searching through stacks of papers, stressed expression. Right side shows the same owner using a tablet/digital system, relaxed and organized, with orders displayed clearly on screen. Soft lighting, warm colors, friendly and empathetic tone, no text overlays, clean modern style.',
    'menu-digital': 'Professional illustration comparing before and after: left shows a restaurant owner holding printed menus, frustrated expression, with a pile of outdated menus in the background. Right side shows customers scanning QR codes on their phones, looking at digital menu, owner smiling and relaxed. Modern, clean style, warm colors, empathetic and positive tone, no text overlays.',
    'inventario-restaurante': 'Professional illustration showing two scenarios: left shows a confused restaurant owner looking at ingredients, not knowing what they have, surrounded by waste and duplicate purchases. Right side shows the same owner checking inventory on a tablet, confident expression, with organized storage and clear stock levels. Clean, modern illustration style, warm and empathetic colors, no text, friendly tone.',
    'mesas-meseros': 'Professional illustration of restaurant communication: left shows chaotic scene with waiter trying to communicate order to kitchen, confusion and crossed wires, stressed expressions. Right side shows smooth digital flow from waiter tablet to kitchen screen, clear communication, everyone relaxed and efficient. Modern, clean style, warm colors, positive and empathetic tone, no text overlays.',
    'gestion-ordenes': 'Professional illustration showing order management contrast: left shows scattered papers, sticky notes, phone messages, owner overwhelmed searching for information. Right shows organized digital dashboard with all orders visible, owner relaxed and in control. Clean, modern illustration, warm empathetic colors, friendly tone, no text overlays.'
  };

  return prompts[key] || 'Professional illustration showing the contrast between manual processes (left, stressed, disorganized) and digital solutions (right, relaxed, organized). Modern, clean style, warm colors, empathetic and positive tone, no text overlays.';
}


