/**
 * Utilidad para obtener la URL de la imagen correspondiente a una sección de resultado
 */

import type { BusinessSector } from './conversationalDiagnostic';

/**
 * Obtiene la URL de la imagen para "Situación Actual"
 */
export function getCurrentSituationImageUrl(sector: BusinessSector): string {
  const sectorSlug = getSectorSlug(sector);
  return `/images/resultados/resultado-situacion-actual-${sectorSlug}.png`;
}

/**
 * Mapeo de títulos de oportunidades a nombres de imágenes existentes
 * Basado en las imágenes que realmente existen en public/images/resultados/
 */
const OPPORTUNITY_IMAGE_MAP: Record<string, string> = {
  // Restaurante
  'digitalizar la gestión de pedidos': 'digitalizar-procesos',
  'menú digital que se actualiza al instante': 'comunicación-digital',
  'control automático de inventario': 'control-automatizado',
  'comunicación fluida entre meseros y cocina': 'comunicación-digital',
  'gestión centralizada de órdenes': 'sistema-de-gestión',
  'optimización de procesos': 'automatizar-tareas',
  'automatizar procesos manuales': 'automatizar-tareas',
  
  // Servicio técnico
  'gestión de órdenes de servicio': 'sistema-de-gestión',
  'control de inventario de repuestos': 'control-automatizado',
  'comunicación con clientes': 'comunicación-digital',
  'seguimiento de reparaciones': 'sistema-de-gestión',
  
  // Taller
  'gestión de órdenes de trabajo': 'sistema-de-gestión',
  'control de inventario de partes': 'control-automatizado',
  'comunicación con clientes': 'comunicación-digital',
  
  // Fábrica
  'control de producción': 'control-automatizado',
  'gestión de inventario': 'control-automatizado',
  'comunicación entre áreas': 'comunicación-digital',
  
  // Comercio
  'gestión de inventario': 'control-automatizado',
  'comunicación con proveedores': 'comunicación-digital',
  'control de ventas': 'sistema-de-gestión',
  
  // Servicios
  'gestión de citas': 'sistema-de-gestión',
  'comunicación con clientes': 'comunicación-digital',
  'control de servicios': 'control-automatizado',
};

/**
 * Obtiene la URL de la imagen para "Oportunidades"
 */
export function getOpportunityImageUrl(
  sector: BusinessSector,
  opportunityTitle: string
): string {
  const sectorSlug = getSectorSlug(sector);
  
  // Intentar encontrar un mapeo directo
  const titleLower = opportunityTitle.toLowerCase().trim();
  const mappedSlug = OPPORTUNITY_IMAGE_MAP[titleLower];
  
  if (mappedSlug) {
    return `/images/resultados/resultado-oportunidades-${sectorSlug}-${mappedSlug}.png`;
  }
  
  // Si no hay mapeo directo, intentar encontrar coincidencias parciales
  
  // Buscar palabras clave en el título para determinar qué imagen usar
  if (titleLower.includes('digitalizar') || titleLower.includes('digital')) {
    return `/images/resultados/resultado-oportunidades-${sectorSlug}-digitalizar-procesos.png`;
  }
  if (titleLower.includes('comunicación') || titleLower.includes('comunicacion') || titleLower.includes('menú') || titleLower.includes('menu')) {
    return `/images/resultados/resultado-oportunidades-${sectorSlug}-comunicación-digital.png`;
  }
  if (titleLower.includes('inventario') || titleLower.includes('control') || titleLower.includes('stock')) {
    return `/images/resultados/resultado-oportunidades-${sectorSlug}-control-automatizado.png`;
  }
  if (titleLower.includes('gestión') || titleLower.includes('gestion') || titleLower.includes('sistema') || titleLower.includes('centralizada')) {
    return `/images/resultados/resultado-oportunidades-${sectorSlug}-sistema-de-gestión.png`;
  }
  if (titleLower.includes('automatizar') || titleLower.includes('optimización') || titleLower.includes('optimizacion')) {
    return `/images/resultados/resultado-oportunidades-${sectorSlug}-automatizar-tareas.png`;
  }
  
  // Fallback: usar imagen genérica que sabemos que existe
  return `/images/resultados/resultado-oportunidades-${sectorSlug}-automatizar-tareas.png`;
}

/**
 * Obtiene la URL de la imagen para "Impacto Operativo"
 */
export function getOperationalImpactImageUrl(
  sector: BusinessSector,
  impactArea: 'tiempo' | 'costos' | 'errores' | 'crecimiento'
): string {
  const sectorSlug = getSectorSlug(sector);
  return `/images/resultados/resultado-impacto-operativo-${sectorSlug}-${impactArea}.png`;
}

/**
 * Obtiene la URL de la imagen para "Visión Futura"
 */
export function getFutureVisionImageUrl(sector: BusinessSector): string {
  const sectorSlug = getSectorSlug(sector);
  return `/images/resultados/resultado-vision-futura-${sectorSlug}.png`;
}

/**
 * Obtiene la URL de la imagen para "Resumen"
 */
export function getSummaryImageUrl(
  sector: BusinessSector,
  summaryType: 'beforeAfter' | 'savings' | 'roi'
): string {
  const sectorSlug = getSectorSlug(sector);
  // Convertir summaryType a minúsculas para coincidir con los nombres de archivo
  const summaryTypeLower = summaryType.toLowerCase();
  return `/images/resultados/resultado-resumen-${sectorSlug}-${summaryTypeLower}.png`;
}

/**
 * Obtiene la URL de la imagen para la sección "La Oportunidad"
 */
export function getOpportunitySectionImageUrl(sector: BusinessSector): string {
  const sectorSlug = getSectorSlug(sector);
  return `/images/resultados/resultado-oportunidad-seccion-${sectorSlug}.png`;
}

/**
 * Obtiene la URL de la imagen para un insight individual
 * Basado en el problema o título del insight
 */
export function getInsightImageUrl(
  sector: BusinessSector,
  insightProblem: string
): string {
  const sectorSlug = getSectorSlug(sector);
  const problemLower = insightProblem.toLowerCase().trim();
  
  // Mapeo de problemas comunes a imágenes
  if (problemLower.includes('papel') || problemLower.includes('comandas') || problemLower.includes('pedidos')) {
    return `/images/resultados/resultado-insight-${sectorSlug}-papel-procesos.png`;
  }
  if (problemLower.includes('menú') || problemLower.includes('menu') || problemLower.includes('cambiar')) {
    return `/images/resultados/resultado-insight-${sectorSlug}-menu-digital.png`;
  }
  if (problemLower.includes('inventario') || problemLower.includes('stock') || problemLower.includes('control')) {
    return `/images/resultados/resultado-insight-${sectorSlug}-inventario.png`;
  }
  if (problemLower.includes('comunicación') || problemLower.includes('comunicacion') || problemLower.includes('coordinación')) {
    return `/images/resultados/resultado-insight-${sectorSlug}-comunicacion.png`;
  }
  if (problemLower.includes('tiempo') || problemLower.includes('horas') || problemLower.includes('perdiendo')) {
    return `/images/resultados/resultado-insight-${sectorSlug}-tiempo.png`;
  }
  if (problemLower.includes('dinero') || problemLower.includes('costo') || problemLower.includes('gastando')) {
    return `/images/resultados/resultado-insight-${sectorSlug}-costos.png`;
  }
  
  // Fallback: usar imagen genérica
  return `/images/resultados/resultado-insight-${sectorSlug}-general.png`;
}

/**
 * Convierte el sector a slug para nombres de archivo
 */
function getSectorSlug(sector: BusinessSector): string {
  const slugs: Record<BusinessSector, string> = {
    'restaurante': 'restaurante',
    'servicio-tecnico': 'servicio-tecnico',
    'taller': 'taller',
    'fabrica': 'fabrica',
    'comercio': 'comercio',
    'servicios': 'servicios'
  };
  return slugs[sector] || 'general';
}

