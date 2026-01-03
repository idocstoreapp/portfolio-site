/**
 * Sistema de Caminos Dinámicos para Diagnóstico
 * 
 * Define preguntas MUY ESPECÍFICAS por tipo de negocio
 * Cada camino es un árbol de decisión que se adapta según las respuestas
 */

export type BusinessType = 'restaurante' | 'servicio-tecnico' | 'taller' | 'fabrica' | 'presencia-web';

export interface QuestionOption {
  value: string;
  label: string;
  description: string;
  icon?: string;
  nextPath?: string; // Si esta opción lleva a un camino específico
}

export interface DiagnosticQuestion {
  id: string;
  step: number;
  title: string;
  description: string;
  type: 'single' | 'multiple';
  options: QuestionOption[];
  required: boolean;
  dependsOn?: {
    questionId: string;
    value: string | string[];
  };
}

export interface DiagnosticPath {
  businessType: BusinessType;
  title: string;
  description: string;
  icon: string;
  questions: DiagnosticQuestion[];
  resultProfile: {
    systemType: string;
    recommendedModules: string[];
    applicableServices: string[];
  };
}

/**
 * Configuración de caminos por tipo de negocio
 */
export const DIAGNOSTIC_PATHS: Record<BusinessType, DiagnosticPath> = {
  restaurante: {
    businessType: 'restaurante',
    title: 'Restaurante / Bar',
    description: 'Sistema para restaurantes, cafés, bares y negocios de comida',
    icon: '🍽️',
    questions: [
      {
        id: 'tiene-pos',
        step: 2,
        title: '¿Tienes un sistema POS?',
        description: 'Un POS (Point of Sale) es un sistema de punto de venta que registra las ventas, imprime tickets y gestiona pagos. ¿Tienes uno actualmente?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'no-pos',
            label: 'No, no tengo POS',
            description: 'Todo lo manejo en papel o con caja registradora básica',
            icon: '📝'
          },
          {
            value: 'pos-basico',
            label: 'Sí, tengo un POS básico',
            description: 'Tengo una caja registradora o sistema simple que solo registra ventas',
            icon: '💰'
          },
          {
            value: 'pos-completo',
            label: 'Sí, tengo un POS completo',
            description: 'Tengo un sistema POS que gestiona ventas, mesas y comandas',
            icon: '⚙️'
          }
        ]
      },
      {
        id: 'tiene-mesas-meseros',
        step: 3,
        title: '¿Tienes mesas y meseros?',
        description: '¿Tu restaurante tiene servicio de mesas con meseros que toman pedidos?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'solo-mostrador',
            label: 'No, solo mostrador',
            description: 'Los clientes piden en el mostrador y se sirven',
            icon: '🏪'
          },
          {
            value: 'mesas-sin-meseros',
            label: 'Sí, tengo mesas pero sin meseros',
            description: 'Los clientes se sientan pero piden en el mostrador',
            icon: '🪑'
          },
          {
            value: 'mesas-con-meseros',
            label: 'Sí, tengo mesas y meseros',
            description: 'Tengo meseros que toman pedidos en las mesas',
            icon: '👨‍🍳'
          }
        ]
      },
      {
        id: 'menu-digital',
        step: 4,
        title: '¿Tienes menú digital?',
        description: 'Un menú digital es un menú que los clientes pueden ver en su celular escaneando un código QR, sin necesidad de menú impreso',
        type: 'single',
        required: true,
        options: [
          {
            value: 'solo-impreso',
            label: 'No, solo menú impreso',
            description: 'Tengo menús físicos impresos en papel o cartón',
            icon: '📄'
          },
          {
            value: 'ambos',
            label: 'Sí, tengo ambos',
            description: 'Tengo menú impreso y también digital con QR',
            icon: '📱'
          },
          {
            value: 'solo-digital',
            label: 'Sí, solo menú digital',
            description: 'Solo uso menú digital con código QR',
            icon: '📲'
          }
        ]
      },
      {
        id: 'como-recibe-pedidos',
        step: 5,
        title: '¿Cómo recibes pedidos?',
        description: 'Selecciona todas las formas en que recibes pedidos',
        type: 'multiple',
        required: true,
        options: [
          {
            value: 'mesa',
            label: 'Pedidos en mesa',
            description: 'Los clientes piden cuando están sentados en las mesas',
            icon: '🪑'
          },
          {
            value: 'mostrador',
            label: 'Pedidos en mostrador',
            description: 'Los clientes piden en el mostrador o caja',
            icon: '🏪'
          },
          {
            value: 'delivery',
            label: 'Delivery',
            description: 'Recibo pedidos para entregar a domicilio',
            icon: '🚚'
          },
          {
            value: 'takeaway',
            label: 'Takeaway (para llevar)',
            description: 'Los clientes piden para llevar',
            icon: '🥡'
          },
          {
            value: 'whatsapp',
            label: 'Por WhatsApp',
            description: 'Recibo pedidos por WhatsApp o teléfono',
            icon: '💬'
          }
        ]
      },
      {
        id: 'control-inventario',
        step: 6,
        title: '¿Tienes control de inventario?',
        description: '¿Sabes qué ingredientes y productos tienes en stock?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'no-inventario',
            label: 'No, no tengo control',
            description: 'No sé qué tengo hasta que me falta algo',
            icon: '❌'
          },
          {
            value: 'inventario-manual',
            label: 'Sí, pero manual',
            description: 'Llevo inventario en papel o Excel',
            icon: '📝'
          },
          {
            value: 'inventario-sistema',
            label: 'Sí, con sistema',
            description: 'Tengo un sistema que controla mi inventario',
            icon: '📦'
          }
        ]
      },
      {
        id: 'problema-principal',
        step: 7,
        title: '¿Cuál es tu mayor problema?',
        description: 'Selecciona el problema que más te afecta actualmente',
        type: 'single',
        required: true,
        options: [
          {
            value: 'pierdo-ordenes',
            label: 'Pierdo órdenes o pedidos',
            description: 'Los meseros olvidan anotar o se pierden los pedidos',
            icon: '📝'
          },
          {
            value: 'tiempos-largos',
            label: 'Los clientes esperan mucho',
            description: 'La cocina no sabe qué hacer o los tiempos son largos',
            icon: '⏱️'
          },
          {
            value: 'sin-control-ventas',
            label: 'No sé cuánto vendí',
            description: 'No tengo control de ventas hasta que cierro la caja',
            icon: '💰'
          },
          {
            value: 'menus-caros',
            label: 'Los menús impresos son caros',
            description: 'Cada cambio de precio o plato nuevo cuesta dinero',
            icon: '📄'
          },
          {
            value: 'sin-inventario',
            label: 'No sé qué ingredientes tengo',
            description: 'Compro ingredientes que ya tengo o me faltan los necesarios',
            icon: '📦'
          }
        ]
      }
    ],
    resultProfile: {
      systemType: 'restaurantes',
      recommendedModules: ['menu-qr', 'pos', 'comandas', 'mesas', 'inventario'],
      applicableServices: ['/soluciones/restaurantes']
    }
  },

  'servicio-tecnico': {
    businessType: 'servicio-tecnico',
    title: 'Servicio Técnico',
    description: 'Sistema para servicios técnicos de celulares, electrodomésticos, etc.',
    icon: '🔧',
    questions: [
      {
        id: 'tiene-sistema-administrativo',
        step: 2,
        title: '¿Tienes un sistema administrativo?',
        description: 'Un sistema administrativo te ayuda a gestionar órdenes de servicio, clientes, inventario y pagos. ¿Tienes uno actualmente?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'no-sistema',
            label: 'No, no tengo sistema',
            description: 'Todo lo manejo en papel o Excel',
            icon: '📝'
          },
          {
            value: 'excel',
            label: 'Solo uso Excel',
            description: 'Llevo registro en planillas de Excel',
            icon: '📊'
          },
          {
            value: 'sistema-basico',
            label: 'Sí, tengo un sistema básico',
            description: 'Tengo un sistema pero es limitado o no funciona bien',
            icon: '⚙️'
          },
          {
            value: 'sistema-completo',
            label: 'Sí, tengo un sistema completo',
            description: 'Tengo un sistema pero quiero mejorar o cambiar',
            icon: '💻'
          }
        ]
      },
      {
        id: 'como-gestiona-ordenes',
        step: 3,
        title: '¿Cómo gestionas las órdenes de servicio?',
        description: '¿Cómo llevas el registro de las reparaciones que recibes?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'papel',
            label: 'Todo en papel',
            description: 'Anoto las órdenes en papel o libretas',
            icon: '📝'
          },
          {
            value: 'whatsapp',
            label: 'Por WhatsApp',
            description: 'Recibo órdenes por WhatsApp pero las anoto en papel',
            icon: '💬'
          },
          {
            value: 'excel',
            label: 'En Excel o planilla',
            description: 'Llevo registro en planillas de Excel',
            icon: '📊'
          },
          {
            value: 'sistema',
            label: 'Con un sistema',
            description: 'Uso un sistema para gestionar las órdenes',
            icon: '⚙️'
          }
        ]
      },
      {
        id: 'paga-comisiones',
        step: 4,
        title: '¿Pagas comisiones por trabajos?',
        description: '¿Tus técnicos reciben comisiones o porcentajes por cada reparación que realizan?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'no-comisiones',
            label: 'No, no pago comisiones',
            description: 'Pago salario fijo o no tengo técnicos',
            icon: '💵'
          },
          {
            value: 'comisiones-manual',
            label: 'Sí, pero lo calculo manualmente',
            description: 'Calculo las comisiones a mano o en Excel',
            icon: '📝'
          },
          {
            value: 'comisiones-sistema',
            label: 'Sí, mi sistema lo calcula',
            description: 'Mi sistema calcula las comisiones automáticamente',
            icon: '⚙️'
          }
        ]
      },
      {
        id: 'control-inventario-repuestos',
        step: 5,
        title: '¿Tienes control de inventario de repuestos?',
        description: '¿Sabes qué repuestos tienes en stock y cuándo necesitas comprar más?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'no-inventario',
            label: 'No, no tengo control',
            description: 'No sé qué repuestos tengo hasta que los necesito',
            icon: '❌'
          },
          {
            value: 'inventario-manual',
            label: 'Sí, pero manual',
            description: 'Llevo inventario en papel o Excel',
            icon: '📝'
          },
          {
            value: 'inventario-sistema',
            label: 'Sí, con sistema',
            description: 'Tengo un sistema que controla mi inventario',
            icon: '📦'
          }
        ]
      },
      {
        id: 'como-cotiza',
        step: 6,
        title: '¿Cómo cotizas a los clientes?',
        description: '¿Cómo generas presupuestos o cotizaciones para tus clientes?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'cotiza-manual',
            label: 'Cotizo a mano',
            description: 'Escribo las cotizaciones a mano o en papel',
            icon: '📝'
          },
          {
            value: 'cotiza-word',
            label: 'Uso Word o plantillas',
            description: 'Uso Word o plantillas para crear cotizaciones',
            icon: '📄'
          },
          {
            value: 'cotiza-sistema',
            label: 'Mi sistema genera cotizaciones',
            description: 'Mi sistema genera cotizaciones automáticamente',
            icon: '⚙️'
          }
        ]
      },
      {
        id: 'problema-principal',
        step: 7,
        title: '¿Cuál es tu mayor problema?',
        description: 'Selecciona el problema que más te afecta actualmente',
        type: 'single',
        required: true,
        options: [
          {
            value: 'pierdo-ordenes',
            label: 'Pierdo órdenes de servicio',
            description: 'Los papeles se pierden o no sé qué está pendiente',
            icon: '📝'
          },
          {
            value: 'sin-inventario',
            label: 'No sé qué repuestos tengo',
            description: 'Compro repuestos que ya tengo o me faltan los necesarios',
            icon: '📦'
          },
          {
            value: 'clientes-preguntan',
            label: 'Los clientes preguntan constantemente',
            description: 'No sé en qué estado está cada reparación y los clientes llaman mucho',
            icon: '⏱️'
          },
          {
            value: 'sin-control-financiero',
            label: 'No tengo control financiero',
            description: 'No sé cuánto gané ni qué servicios son más rentables',
            icon: '💰'
          },
          {
            value: 'comisiones-complicadas',
            label: 'Calcular comisiones es complicado',
            description: 'Me toma mucho tiempo calcular las comisiones de los técnicos',
            icon: '💵'
          }
        ]
      }
    ],
    resultProfile: {
      systemType: 'servicio-tecnico',
      recommendedModules: ['ordenes-servicio', 'inventario', 'clientes', 'pagos', 'comisiones', 'comunicacion'],
      applicableServices: ['/soluciones/servicio-tecnico']
    }
  },

  taller: {
    businessType: 'taller',
    title: 'Taller Mecánico',
    description: 'Sistema para talleres mecánicos de autos, motos, etc.',
    icon: '🚗',
    questions: [
      {
        id: 'tiene-sistema-administrativo',
        step: 2,
        title: '¿Tienes un sistema administrativo?',
        description: 'Un sistema administrativo te ayuda a gestionar órdenes de servicio, clientes, inventario y pagos. ¿Tienes uno actualmente?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'no-sistema',
            label: 'No, no tengo sistema',
            description: 'Todo lo manejo en papel o Excel',
            icon: '📝'
          },
          {
            value: 'excel',
            label: 'Solo uso Excel',
            description: 'Llevo registro en planillas de Excel',
            icon: '📊'
          },
          {
            value: 'sistema-basico',
            label: 'Sí, tengo un sistema básico',
            description: 'Tengo un sistema pero es limitado o no funciona bien',
            icon: '⚙️'
          },
          {
            value: 'sistema-completo',
            label: 'Sí, tengo un sistema completo',
            description: 'Tengo un sistema pero quiero mejorar o cambiar',
            icon: '💻'
          }
        ]
      },
      {
        id: 'como-gestiona-ordenes',
        step: 3,
        title: '¿Cómo gestionas las órdenes de servicio?',
        description: '¿Cómo llevas el registro de las reparaciones que recibes?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'papel',
            label: 'Todo en papel',
            description: 'Anoto las órdenes en papel o libretas',
            icon: '📝'
          },
          {
            value: 'excel',
            label: 'En Excel o planilla',
            description: 'Llevo registro en planillas de Excel',
            icon: '📊'
          },
          {
            value: 'sistema',
            label: 'Con un sistema',
            description: 'Uso un sistema para gestionar las órdenes',
            icon: '⚙️'
          }
        ]
      },
      {
        id: 'paga-comisiones',
        step: 4,
        title: '¿Pagas comisiones por trabajos?',
        description: '¿Tus mecánicos reciben comisiones o porcentajes por cada reparación que realizan?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'no-comisiones',
            label: 'No, no pago comisiones',
            description: 'Pago salario fijo o no tengo mecánicos',
            icon: '💵'
          },
          {
            value: 'comisiones-manual',
            label: 'Sí, pero lo calculo manualmente',
            description: 'Calculo las comisiones a mano o en Excel',
            icon: '📝'
          },
          {
            value: 'comisiones-sistema',
            label: 'Sí, mi sistema lo calcula',
            description: 'Mi sistema calcula las comisiones automáticamente',
            icon: '⚙️'
          }
        ]
      },
      {
        id: 'control-inventario-repuestos',
        step: 5,
        title: '¿Tienes control de inventario de repuestos?',
        description: '¿Sabes qué repuestos tienes en stock y cuándo necesitas comprar más?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'no-inventario',
            label: 'No, no tengo control',
            description: 'No sé qué repuestos tengo hasta que los necesito',
            icon: '❌'
          },
          {
            value: 'inventario-manual',
            label: 'Sí, pero manual',
            description: 'Llevo inventario en papel o Excel',
            icon: '📝'
          },
          {
            value: 'inventario-sistema',
            label: 'Sí, con sistema',
            description: 'Tengo un sistema que controla mi inventario',
            icon: '📦'
          }
        ]
      },
      {
        id: 'problema-principal',
        step: 6,
        title: '¿Cuál es tu mayor problema?',
        description: 'Selecciona el problema que más te afecta actualmente',
        type: 'single',
        required: true,
        options: [
          {
            value: 'pierdo-ordenes',
            label: 'Pierdo órdenes de servicio',
            description: 'Los papeles se pierden o no sé qué está pendiente',
            icon: '📝'
          },
          {
            value: 'sin-inventario',
            label: 'No sé qué repuestos tengo',
            description: 'Compro repuestos que ya tengo o me faltan los necesarios',
            icon: '📦'
          },
          {
            value: 'clientes-preguntan',
            label: 'Los clientes preguntan constantemente',
            description: 'No sé en qué estado está cada reparación y los clientes llaman mucho',
            icon: '⏱️'
          },
          {
            value: 'sin-control-financiero',
            label: 'No tengo control financiero',
            description: 'No sé cuánto gané ni qué servicios son más rentables',
            icon: '💰'
          }
        ]
      }
    ],
    resultProfile: {
      systemType: 'taller-mecanico',
      recommendedModules: ['ordenes-servicio', 'inventario', 'clientes', 'pagos', 'comisiones'],
      applicableServices: ['/soluciones/taller-mecanico']
    }
  },

  fabrica: {
    businessType: 'fabrica',
    title: 'Fábrica / Producción',
    description: 'Sistema para fábricas, mueblerías y negocios que cotizan por medidas',
    icon: '🏭',
    questions: [
      {
        id: 'hace-cotizaciones',
        step: 2,
        title: '¿Haces cotizaciones?',
        description: '¿Necesitas cotizar productos o servicios a tus clientes?',
        type: 'single',
        required: true,
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
            description: 'Tengo precios fijos o no necesito cotizar',
            icon: '💰'
          }
        ]
      },
      {
        id: 'como-cotiza',
        step: 3,
        title: '¿Cómo cotizas actualmente?',
        description: '¿Cómo generas las cotizaciones para tus clientes?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'cotiza-manual',
            label: 'Cotizo a mano',
            description: 'Calculo y escribo las cotizaciones a mano o en papel',
            icon: '📝'
          },
          {
            value: 'cotiza-excel',
            label: 'Uso Excel',
            description: 'Uso Excel para calcular y crear cotizaciones',
            icon: '📊'
          },
          {
            value: 'cotiza-word',
            label: 'Uso Word o plantillas',
            description: 'Uso Word o plantillas para crear cotizaciones',
            icon: '📄'
          },
          {
            value: 'cotiza-sistema',
            label: 'Tengo un sistema',
            description: 'Tengo un sistema que genera cotizaciones',
            icon: '⚙️'
          }
        ]
      },
      {
        id: 'como-calcula-costos',
        step: 4,
        title: '¿Cómo calculas los costos?',
        description: '¿Cómo determinas cuánto cuesta realmente producir cada producto?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'costos-manual',
            label: 'Calculo a mano',
            description: 'Calculo los costos manualmente con calculadora',
            icon: '🔢'
          },
          {
            value: 'costos-excel',
            label: 'Uso Excel',
            description: 'Uso Excel para calcular costos',
            icon: '📊'
          },
          {
            value: 'costos-aproximados',
            label: 'Uso costos aproximados',
            description: 'Tengo costos aproximados pero no exactos',
            icon: '📝'
          },
          {
            value: 'costos-sistema',
            label: 'Mi sistema calcula costos',
            description: 'Tengo un sistema que calcula costos reales',
            icon: '⚙️'
          }
        ]
      },
      {
        id: 'control-produccion',
        step: 5,
        title: '¿Tienes control de producción?',
        description: '¿Sabes qué productos estás fabricando, en qué estado están y cuándo estarán listos?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'no-control',
            label: 'No, no tengo control',
            description: 'No sé qué está en producción hasta que está listo',
            icon: '❌'
          },
          {
            value: 'control-manual',
            label: 'Sí, pero manual',
            description: 'Llevo control en papel o Excel',
            icon: '📝'
          },
          {
            value: 'control-sistema',
            label: 'Sí, con sistema',
            description: 'Tengo un sistema que controla la producción',
            icon: '📦'
          }
        ]
      },
      {
        id: 'control-materias-primas',
        step: 6,
        title: '¿Tienes control de materias primas?',
        description: '¿Sabes qué materias primas tienes en stock y cuándo necesitas comprar más?',
        type: 'single',
        required: true,
        options: [
          {
            value: 'no-inventario',
            label: 'No, no tengo control',
            description: 'No sé qué materias primas tengo hasta que me faltan',
            icon: '❌'
          },
          {
            value: 'inventario-manual',
            label: 'Sí, pero manual',
            description: 'Llevo inventario en papel o Excel',
            icon: '📝'
          },
          {
            value: 'inventario-sistema',
            label: 'Sí, con sistema',
            description: 'Tengo un sistema que controla mi inventario',
            icon: '📦'
          }
        ]
      },
      {
        id: 'problema-principal',
        step: 7,
        title: '¿Cuál es tu mayor problema?',
        description: 'Selecciona el problema que más te afecta actualmente',
        type: 'single',
        required: true,
        options: [
          {
            value: 'cotizaciones-lentas',
            label: 'Las cotizaciones toman mucho tiempo',
            description: 'Calculo a mano y tardo mucho en dar precios a los clientes',
            icon: '⏱️'
          },
          {
            value: 'errores-calculo',
            label: 'Cometo errores en los cálculos',
            description: 'Me equivoco al calcular costos y precios',
            icon: '❌'
          },
          {
            value: 'sin-control-costos',
            label: 'No sé cuánto cuesta realmente',
            description: 'No tengo control de costos reales de producción',
            icon: '💰'
          },
          {
            value: 'sin-catalogo',
            label: 'No tengo catálogo online',
            description: 'Los clientes no pueden ver mis productos fácilmente',
            icon: '📦'
          }
        ]
      }
    ],
    resultProfile: {
      systemType: 'cotizador-fabrica',
      recommendedModules: ['cotizador', 'calculadora-costos', 'catalogo', 'inventario', 'produccion'],
      applicableServices: ['/soluciones/cotizador-fabrica']
    }
  },

  'presencia-web': {
    businessType: 'presencia-web',
    title: 'Presencia Web / Ecommerce',
    description: 'Solución para tener presencia profesional en internet',
    icon: '🌐',
    questions: [
      {
        id: 'situacion-actual',
        step: 2,
        title: '¿Cuál es tu situación actual?',
        description: 'Selecciona tu situación con respecto a tu presencia en internet',
        type: 'single',
        required: true,
        options: [
          {
            value: 'sin-web',
            label: 'No tengo página web',
            description: 'No tengo presencia en internet',
            icon: '📝'
          },
          {
            value: 'web-desactualizada',
            label: 'Tengo web pero está desactualizada',
            description: 'Mi página web está vieja o no funciona bien',
            icon: '🌐'
          },
          {
            value: 'solo-redes',
            label: 'Solo tengo redes sociales',
            description: 'Tengo Instagram/Facebook pero no página web',
            icon: '📱'
          },
          {
            value: 'quiero-mejorar',
            label: 'Quiero mejorar mi web actual',
            description: 'Tengo web pero quiero modernizarla o agregar funciones',
            icon: '✨'
          }
        ]
      },
      {
        id: 'objetivo-principal',
        step: 3,
        title: '¿Cuál es tu objetivo principal?',
        description: 'Puedes seleccionar uno o más objetivos',
        type: 'multiple',
        required: true,
        options: [
          {
            value: 'presencia',
            label: 'Tener presencia profesional',
            description: 'Que los clientes me encuentren en internet',
            icon: '🌐'
          },
          {
            value: 'vender-online',
            label: 'Vender online',
            description: 'Tener tienda online o ecommerce',
            icon: '🛒'
          },
          {
            value: 'mostrar-trabajos',
            label: 'Mostrar mis trabajos',
            description: 'Portfolio o galería de proyectos',
            icon: '📸'
          },
          {
            value: 'contacto',
            label: 'Recibir consultas',
            description: 'Que los clientes me contacten fácilmente',
            icon: '📧'
          }
        ]
      },
      {
        id: 'tipo-negocio',
        step: 4,
        title: '¿Qué tipo de negocio tienes?',
        description: 'Esto nos ayuda a recomendar el mejor tipo de web',
        type: 'single',
        required: true,
        options: [
          {
            value: 'servicios',
            label: 'Servicios profesionales',
            description: 'Ofrezco servicios (consultoría, diseño, etc.)',
            icon: '💼'
          },
          {
            value: 'productos',
            label: 'Vendo productos',
            description: 'Tengo productos físicos o digitales para vender',
            icon: '📦'
          },
          {
            value: 'portfolio',
            label: 'Portfolio personal',
            description: 'Quiero mostrar mi trabajo y proyectos',
            icon: '🎨'
          },
          {
            value: 'empresa',
            label: 'Empresa o negocio',
            description: 'Tengo una empresa y quiero presencia corporativa',
            icon: '🏢'
          }
        ]
      }
    ],
    resultProfile: {
      systemType: 'desarrollo-web',
      recommendedModules: ['landing-page', 'ecommerce', 'portfolio', 'blog'],
      applicableServices: ['/soluciones/desarrollo-web']
    }
  }
};

/**
 * Obtiene el camino de diagnóstico para un tipo de negocio
 */
export function getDiagnosticPath(businessType: BusinessType): DiagnosticPath {
  return DIAGNOSTIC_PATHS[businessType];
}

/**
 * Obtiene todas las opciones de tipo de negocio para el paso inicial
 */
export function getBusinessTypeOptions(): Array<{ value: BusinessType; label: string; description: string; icon: string }> {
  return Object.values(DIAGNOSTIC_PATHS).map(path => ({
    value: path.businessType,
    label: path.title,
    description: path.description,
    icon: path.icon
  }));
}
