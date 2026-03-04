export type PlanKey = 'basic' | 'pro' | 'enterprise';

export interface PlanConfig {
  label: string;
  price: number;
  features: string[];
  warrantyMonths: number;
  supportLevel: 'estándar' | 'prioritario';
}

export interface ProductConfig {
  name: string;
  plans: Partial<Record<PlanKey, PlanConfig>>;
  comboOf?: string[];
  discountPercent?: number;
}

export interface AddonConfig {
  label: string;
  price: number;
}

export interface PricingCatalog {
  currency: string;
  products: Record<string, ProductConfig>;
  addons: Record<string, AddonConfig>;
}

export const PRICING_CATALOG: PricingCatalog = {
  currency: 'CLP',
  products: {
    web: {
      name: 'Sitio web',
      plans: {
        basic: {
          label: 'Web estática',
          price: 150000,
          features: [
            'Hasta 5 secciones (Inicio, Servicios, Nosotros, Contacto, Blog)',
            'Diseño adaptable a móvil y escritorio',
            'Formulario de contacto y botón WhatsApp',
          ],
          warrantyMonths: 1,
          supportLevel: 'estándar',
        },
        pro: {
          label: 'Web + catálogo',
          price: 200000,
          features: [
            'Todo lo del plan Básico',
            'Catálogo simple de productos/servicios',
            'Blog / novedades',
            'Optimización básica para buscadores (SEO on-page)',
          ],
          warrantyMonths: 3,
          supportLevel: 'prioritario',
        },
        enterprise: {
          label: 'Web + catálogo avanzado',
          price: 270000,
          features: [
            'Todo lo del plan Pro',
            'Múltiples landings específicas',
            'Integraciones simples (ej. chat, analytics avanzados)',
          ],
          warrantyMonths: 6,
          supportLevel: 'prioritario',
        },
      },
    },
    taller: {
      name: 'Sistema de gestión de taller',
      plans: {
        basic: {
          label: 'Taller Básico',
          price: 350000,
          features: [
            'Órdenes de trabajo digitales (cliente, vehículo, trabajos, repuestos)',
            'Historial por cliente y vehículo',
            'Generación de PDF de orden para el cliente',
          ],
          warrantyMonths: 1,
          supportLevel: 'estándar',
        },
        pro: {
          label: 'Taller Profesional',
          price: 497000,
          features: [
            'Todo lo del plan Básico',
            'Panel de órdenes en curso (estados, técnicos, tiempos)',
            'Catálogo de repuestos y accesorios',
            'Control de stock básico',
          ],
          warrantyMonths: 3,
          supportLevel: 'prioritario',
        },
        enterprise: {
          label: 'Taller Enterprise',
          price: 670000,
          features: [
            'Todo lo del plan Pro',
            'Métricas de ventas y servicios (dashboard)',
            'Múltiples sucursales (opcional según alcance)',
            'Reportes exportables',
          ],
          warrantyMonths: 6,
          supportLevel: 'prioritario',
        },
      },
    },
    servicio_tecnico: {
      name: 'Sistema de servicio técnico',
      plans: {
        basic: {
          label: 'Servicio técnico Básico',
          price: 350000,
          features: [
            'Órdenes con cliente, equipo, diagnóstico y repuestos',
            'PDF de orden para el cliente',
            'Historial de equipos atendidos',
          ],
          warrantyMonths: 1,
          supportLevel: 'estándar',
        },
        pro: {
          label: 'Servicio técnico Profesional',
          price: 497000,
          features: [
            'Todo lo del plan Básico',
            'Panel de estados (ingresado, diagnóstico, reparación, listo, entregado)',
            'Control de repuestos por orden',
            'Búsqueda rápida de clientes y equipos',
          ],
          warrantyMonths: 3,
          supportLevel: 'prioritario',
        },
        enterprise: {
          label: 'Servicio técnico Enterprise',
          price: 670000,
          features: [
            'Todo lo del plan Pro',
            'Reportes de tiempos y servicios más vendidos',
            'Múltiples sucursales / técnicos',
            'Integraciones adicionales (a definir)',
          ],
          warrantyMonths: 6,
          supportLevel: 'prioritario',
        },
      },
    },
    restaurante: {
      name: 'Sistema menú QR y restaurante',
      plans: {
        basic: {
          label: 'Menú digital',
          price: 350000,
          features: [
            'Menú QR con categorías, platos, fotos y precios',
            'Panel básico para actualizar menú',
            'Soporte para 1 local',
          ],
          warrantyMonths: 1,
          supportLevel: 'estándar',
        },
        pro: {
          label: 'Restaurante Profesional',
          price: 497000,
          features: [
            'Todo lo del plan Básico',
            'Gestión de mesas y pedidos en panel',
            'Órdenes a cocina y caja en tiempo real',
            'Reporte simple de ventas del día',
          ],
          warrantyMonths: 3,
          supportLevel: 'prioritario',
        },
        enterprise: {
          label: 'Restaurante Enterprise',
          price: 670000,
          features: [
            'Todo lo del plan Pro',
            'Múltiples sucursales',
            'Reportes avanzados y exportación',
            'Módulos adicionales a medida',
          ],
          warrantyMonths: 6,
          supportLevel: 'prioritario',
        },
      },
    },
    combo_taller_web: {
      name: 'Taller + Web',
      comboOf: ['taller', 'web'],
      discountPercent: 10,
      plans: {},
    },
    combo_servicio_tecnico_web: {
      name: 'Servicio técnico + Web',
      comboOf: ['servicio_tecnico', 'web'],
      discountPercent: 10,
      plans: {},
    },
    combo_restaurante_web: {
      name: 'Restaurante + Web',
      comboOf: ['restaurante', 'web'],
      discountPercent: 10,
      plans: {},
    },
  },
  addons: {
    metrics_advanced: {
      label: 'Métricas avanzadas',
      price: 60000,
    },
    multi_branch: {
      label: 'Múltiples sucursales',
      price: 90000,
    },
    whatsapp_integration: {
      label: 'Integración WhatsApp avanzada',
      price: 50000,
    },
  },
};

