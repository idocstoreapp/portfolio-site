/**
 * Estructura de Servicios Detallados
 * Basado en los flyers y servicios ofrecidos
 */

export type ServiceCategory = 'sistemas-gestion' | 'menu-qr' | 'marketing-digital';

export interface Service {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  icon?: string;
  image?: string;
  features?: string[];
  price?: {
    from?: number;
    to?: number;
    currency?: string;
  };
  includesHardware?: boolean;
  popular?: boolean;
}

export const SERVICES: Record<ServiceCategory, Service[]> = {
  'sistemas-gestion': [
    {
      id: 'sistema-completo',
      category: 'sistemas-gestion',
      name: 'Sistema Completo (Software + Hardware)',
      description: 'Sistema de gestión completo con software, computador, lector de código de barras e impresora térmica incluidos',
      features: [
        'Control de stock',
        'Órdenes de trabajo',
        'Cotizaciones en PDF',
        'Impresión automática',
        'Reportes de ventas',
        'Acceso desde celular o computador'
      ],
      includesHardware: true,
      popular: true
    },
    {
      id: 'solo-software',
      category: 'sistemas-gestion',
      name: 'Solo Software de Gestión',
      description: 'Sistema de gestión completo sin hardware. Úsalo en tu computador o dispositivo existente',
      features: [
        'Control de stock',
        'Órdenes de trabajo',
        'Cotizaciones en PDF',
        'Reportes de ventas',
        'Acceso desde celular o computador'
      ],
      includesHardware: false
    },
    {
      id: 'solo-hardware',
      category: 'sistemas-gestion',
      name: 'Solo Hardware',
      description: 'Computador, lector de código de barras e impresora térmica. Para usar con tu sistema existente',
      features: [
        'Computador incluido',
        'Lector de código de barras',
        'Impresora térmica',
        'Instalación y configuración'
      ],
      includesHardware: true
    },
    {
      id: 'control-stock',
      category: 'sistemas-gestion',
      name: 'Control de Stock',
      description: 'Sistema específico para controlar tu inventario y evitar faltantes o compras duplicadas',
      features: [
        'Control de inventario en tiempo real',
        'Alertas de stock bajo',
        'Historial de movimientos',
        'Reportes de inventario'
      ],
      includesHardware: false
    },
    {
      id: 'ordenes-trabajo',
      category: 'sistemas-gestion',
      name: 'Órdenes de Trabajo',
      description: 'Gestiona todas tus órdenes de trabajo de forma organizada y profesional',
      features: [
        'Registro de órdenes',
        'Seguimiento de estado',
        'Historial completo',
        'Notificaciones automáticas'
      ],
      includesHardware: false
    },
    {
      id: 'cotizaciones-pdf',
      category: 'sistemas-gestion',
      name: 'Cotizaciones en PDF',
      description: 'Genera cotizaciones profesionales en PDF de forma automática',
      features: [
        'Generación automática de PDF',
        'Plantillas personalizables',
        'Cálculos automáticos',
        'Envío por email'
      ],
      includesHardware: false
    },
    {
      id: 'reportes-ventas',
      category: 'sistemas-gestion',
      name: 'Reportes de Ventas',
      description: 'Reportes detallados de tus ventas para tomar mejores decisiones',
      features: [
        'Reportes diarios, semanales y mensuales',
        'Análisis de tendencias',
        'Exportación a Excel',
        'Gráficos y visualizaciones'
      ],
      includesHardware: false
    },
    {
      id: 'acceso-movil',
      category: 'sistemas-gestion',
      name: 'Acceso Móvil',
      description: 'Accede a tu sistema desde cualquier dispositivo móvil',
      features: [
        'Acceso desde celular o tablet',
        'Interfaz optimizada para móvil',
        'Sincronización en tiempo real',
        'Funcionalidades principales disponibles'
      ],
      includesHardware: false
    }
  ],
  'menu-qr': [
    {
      id: 'menu-qr-completo',
      category: 'menu-qr',
      name: 'Menú QR Completo',
      description: 'Menú digital con código QR + sistema de pedidos integrado',
      features: [
        'Menú QR personalizado',
        'Sistema de pedidos',
        'Actualización de precios al instante',
        'Control de pedidos',
        'Se ve bien en celular',
        'Fácil de usar'
      ],
      popular: true
    },
    {
      id: 'menu-qr-solo',
      category: 'menu-qr',
      name: 'Solo Menú QR',
      description: 'Menú digital con código QR sin sistema de pedidos',
      features: [
        'Menú QR personalizado',
        'Actualización de precios al instante',
        'Diseño personalizado',
        'Se ve bien en celular',
        'Fácil de usar'
      ]
    },
    {
      id: 'sistema-pedidos',
      category: 'menu-qr',
      name: 'Solo Sistema de Pedidos',
      description: 'Sistema de pedidos digital sin menú QR',
      features: [
        'Control de pedidos',
        'Gestión de mesas',
        'Notificaciones en tiempo real',
        'Reportes de pedidos'
      ]
    },
    {
      id: 'actualizacion-precios',
      category: 'menu-qr',
      name: 'Actualización Instantánea de Precios',
      description: 'Actualiza los precios de tu menú al instante sin costo de impresión',
      features: [
        'Cambios instantáneos',
        'Sin costo de impresión',
        'Todos los clientes ven precios actualizados',
        'Fácil de administrar'
      ]
    }
  ],
  'marketing-digital': [
    {
      id: 'pagina-web',
      category: 'marketing-digital',
      name: 'Página Web Profesional',
      description: 'Sitio web moderno, responsive y optimizado para convertir visitantes en clientes',
      features: [
        'Diseño moderno y profesional',
        'Optimizado para móviles',
        'Optimización SEO',
        'Formulario de contacto',
        'Integración con redes sociales'
      ],
      popular: true
    },
    {
      id: 'google-maps',
      category: 'marketing-digital',
      name: 'Presencia en Google Maps',
      description: 'Aparece en Google Maps para que los clientes te encuentren fácilmente',
      features: [
        'Perfil en Google Maps',
        'Información de contacto',
        'Horarios de atención',
        'Fotos de tu negocio',
        'Direcciones y rutas'
      ]
    },
    {
      id: 'google-negocios',
      category: 'marketing-digital',
      name: 'Google Negocios (Google My Business)',
      description: 'Perfil completo en Google Negocios para aumentar tu visibilidad',
      features: [
        'Perfil completo en Google',
        'Información de contacto',
        'Horarios y ubicación',
        'Fotos y videos',
        'Publicación de actualizaciones'
      ],
      popular: true
    },
    {
      id: 'solo-google-negocios',
      category: 'marketing-digital',
      name: 'Solo Aparecer en Google Negocios',
      description: 'Configuración básica para aparecer en Google Negocios',
      features: [
        'Creación de perfil',
        'Información básica',
        'Verificación de negocio',
        'Aparecer en búsquedas'
      ]
    },
    {
      id: 'solo-rating-google',
      category: 'marketing-digital',
      name: 'Solo Tener Rating en Google',
      description: 'Sistema para obtener y gestionar reseñas en Google',
      features: [
        'Tótem QR para calificar',
        'Solicitud de reseñas',
        'Gestión de reseñas',
        'Mejora de calificación'
      ]
    },
    {
      id: 'totem-qr-google',
      category: 'marketing-digital',
      name: 'Tótem QR para Calificar en Google',
      description: 'Tótem físico con código QR para que los clientes califiquen en Google',
      features: [
        'Tótem físico personalizado',
        'Código QR único',
        'Fácil de usar para clientes',
        'Aumenta reseñas en Google'
      ]
    },
    {
      id: 'redes-sociales',
      category: 'marketing-digital',
      name: 'Gestión de Redes Sociales',
      description: 'Gestión profesional de tus redes sociales para aumentar tu presencia',
      features: [
        'Publicación regular',
        'Contenido de calidad',
        'Interacción con seguidores',
        'Análisis de resultados'
      ]
    },
    {
      id: 'whatsapp-automatico',
      category: 'marketing-digital',
      name: 'Respuestas Automáticas en WhatsApp',
      description: 'Sistema de respuestas automáticas para WhatsApp Business',
      features: [
        'Mensajes automáticos',
        'Respuestas frecuentes',
        'Horarios de atención',
        'Integración con sistema'
      ]
    },
    {
      id: 'anuncios-posts',
      category: 'marketing-digital',
      name: 'Creación de Anuncios y Posts',
      description: 'Creación profesional de anuncios y contenido para redes sociales',
      features: [
        'Diseño de anuncios',
        'Posts para redes sociales',
        'Contenido optimizado',
        'Llamadas a la acción efectivas'
      ]
    },
    {
      id: 'contenido-redes',
      category: 'marketing-digital',
      name: 'Contenido Constante en Redes',
      description: 'Publicación constante y estratégica de contenido en tus redes sociales',
      features: [
        'Calendario de publicaciones',
        'Contenido variado',
        'Publicación automática',
        'Análisis de engagement'
      ]
    }
  ]
};

export const SERVICE_CATEGORIES: Array<{
  id: ServiceCategory;
  name: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'sistemas-gestion',
    name: 'Sistemas de Gestión',
    description: 'Software y hardware para automatizar tu negocio',
    icon: '⚙️'
  },
  {
    id: 'menu-qr',
    name: 'Menú QR y Pedidos',
    description: 'Menús digitales y sistemas de pedidos para restaurantes',
    icon: '📱'
  },
  {
    id: 'marketing-digital',
    name: 'Marketing Digital',
    description: 'Presencia online y estrategias de marketing digital',
    icon: '📢'
  }
];

/**
 * Obtiene todos los servicios de una categoría
 */
export function getServicesByCategory(category: ServiceCategory): Service[] {
  return SERVICES[category] || [];
}

/**
 * Obtiene un servicio por ID
 */
export function getServiceById(id: string): Service | undefined {
  for (const category of Object.values(SERVICES)) {
    const service = category.find(s => s.id === id);
    if (service) return service;
  }
  return undefined;
}

/**
 * Mapeo de tipos extendidos a páginas de servicios
 */
export function getServicePageForExtendedType(extendedType?: string): string | null {
  const pageMap: Record<string, string> = {
    'restaurante': '/soluciones/restaurantes',
    'servicio-tecnico-celulares': '/soluciones/servicio-tecnico',
    'servicio-tecnico-general': '/soluciones/servicio-tecnico',
    'taller-vehiculos': '/soluciones/taller-mecanico',
    'taller-motos': '/soluciones/taller-mecanico',
    'muebleria': '/soluciones/cotizador-fabrica',
    'comercio-catalogo': '/soluciones/desarrollo-web',
    'pagina-web': '/soluciones/desarrollo-web',
    'portfolio': '/soluciones/desarrollo-web',
    'servicios-profesionales': '/soluciones/desarrollo-web'
  };
  
  return extendedType ? (pageMap[extendedType] || null) : null;
}

/**
 * Obtiene servicios recomendados según el sector y tipo extendido
 */
export function getRecommendedServicesForSector(sector: string, extendedType?: string): Service[] {
  // Mapeo mejorado con tipos extendidos
  const recommendations: Record<string, string[]> = {
    'restaurante': ['menu-qr-completo', 'pagina-web', 'google-negocios', 'totem-qr-google'],
    'servicio-tecnico': ['sistema-completo', 'ordenes-trabajo', 'google-negocios', 'whatsapp-automatico'],
    'taller': ['sistema-completo', 'ordenes-trabajo', 'cotizaciones-pdf', 'google-negocios'],
    'fabrica': ['sistema-completo', 'cotizaciones-pdf', 'control-stock', 'reportes-ventas'],
    'comercio': ['sistema-completo', 'control-stock', 'google-negocios', 'pagina-web'],
    'servicios': ['pagina-web', 'google-negocios', 'redes-sociales', 'whatsapp-automatico']
  };

  // Si hay un tipo extendido, usar recomendaciones específicas
  if (extendedType) {
    const extendedRecommendations: Record<string, string[]> = {
      'servicio-tecnico-celulares': ['sistema-completo', 'ordenes-trabajo', 'google-negocios', 'whatsapp-automatico'],
      'servicio-tecnico-general': ['sistema-completo', 'ordenes-trabajo', 'google-negocios', 'whatsapp-automatico'],
      'taller-vehiculos': ['sistema-completo', 'ordenes-trabajo', 'cotizaciones-pdf', 'google-negocios'],
      'taller-motos': ['sistema-completo', 'ordenes-trabajo', 'cotizaciones-pdf', 'google-negocios'],
      'muebleria': ['sistema-completo', 'cotizaciones-pdf', 'control-stock', 'reportes-ventas'],
      'comercio-catalogo': ['sistema-completo', 'control-stock', 'google-negocios', 'pagina-web'],
      'pagina-web': ['pagina-web', 'google-negocios', 'redes-sociales'],
      'portfolio': ['pagina-web', 'google-negocios', 'redes-sociales'],
      'servicios-profesionales': ['pagina-web', 'google-negocios', 'redes-sociales', 'whatsapp-automatico']
    };
    
    const extendedIds = extendedRecommendations[extendedType] || recommendations[sector] || [];
    return extendedIds
      .map(id => getServiceById(id))
      .filter((s): s is Service => s !== undefined);
  }

  const recommendedIds = recommendations[sector] || [];
  return recommendedIds
    .map(id => getServiceById(id))
    .filter((s): s is Service => s !== undefined);
}
