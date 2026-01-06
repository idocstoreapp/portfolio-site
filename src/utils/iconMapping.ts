/**
 * Mapeo de iconos para las opciones del wizard
 * 
 * Este archivo mapea cada opción de pregunta a un nombre de icono sugerido
 * para buscar en Flaticon.es con el estilo negro y premium.
 * 
 * Formato sugerido para buscar en Flaticon:
 * - Buscar por el término sugerido
 * - Filtrar por estilo: "line", "outline", "filled" (negro)
 * - Descargar en formato PNG, tamaño 512x512 o mayor
 * - Guardar en /public/images/icons/ con el nombre especificado
 */

export interface IconMapping {
  questionId: string;
  optionValue: string;
  optionLabel: string;
  suggestedFlaticonSearch: string;
  suggestedFileName: string;
  description: string;
}

/**
 * Mapeo completo de iconos necesarios para todas las preguntas del wizard
 */
export const ICON_MAPPINGS: IconMapping[] = [
  // ============================================
  // RESTAURANTE
  // ============================================
  {
    questionId: 'operacion-diaria',
    optionValue: 'papel-comandas',
    optionLabel: 'Todo en papel',
    suggestedFlaticonSearch: 'notepad paper document',
    suggestedFileName: 'notepad-paper.png',
    description: 'Icono de libreta o papel para representar gestión manual'
  },
  {
    questionId: 'operacion-diaria',
    optionValue: 'whatsapp-papel',
    optionLabel: 'WhatsApp y papel',
    suggestedFlaticonSearch: 'whatsapp message chat',
    suggestedFileName: 'whatsapp-chat.png',
    description: 'Icono de WhatsApp para representar comunicación por chat'
  },
  {
    questionId: 'operacion-diaria',
    optionValue: 'pos-basico',
    optionLabel: 'Tengo un POS básico',
    suggestedFlaticonSearch: 'cash register pos terminal',
    suggestedFileName: 'cash-register.png',
    description: 'Icono de caja registradora o terminal POS'
  },
  {
    questionId: 'operacion-diaria',
    optionValue: 'sistema-completo',
    optionLabel: 'Ya tengo un sistema',
    suggestedFlaticonSearch: 'system software dashboard',
    suggestedFileName: 'system-dashboard.png',
    description: 'Icono de sistema o dashboard'
  },
  {
    questionId: 'menu-digital',
    optionValue: 'solo-impreso',
    optionLabel: 'Solo menú impreso',
    suggestedFlaticonSearch: 'menu restaurant menu card',
    suggestedFileName: 'menu-card.png',
    description: 'Icono de menú de restaurante en papel'
  },
  {
    questionId: 'menu-digital',
    optionValue: 'ambos',
    optionLabel: 'Tengo ambos',
    suggestedFlaticonSearch: 'menu digital qr code',
    suggestedFileName: 'menu-digital.png',
    description: 'Icono de menú digital o QR code'
  },
  {
    questionId: 'menu-digital',
    optionValue: 'solo-digital',
    optionLabel: 'Solo menú digital',
    suggestedFlaticonSearch: 'qr code scan mobile',
    suggestedFileName: 'qr-code.png',
    description: 'Icono de código QR'
  },
  {
    questionId: 'mesas-meseros',
    optionValue: 'solo-mostrador',
    optionLabel: 'No, solo mostrador',
    suggestedFlaticonSearch: 'counter shop store front',
    suggestedFileName: 'counter-shop.png',
    description: 'Icono de mostrador de tienda'
  },
  {
    questionId: 'mesas-meseros',
    optionValue: 'mesas-sin-meseros',
    optionLabel: 'Sí, mesas pero sin meseros',
    suggestedFlaticonSearch: 'table restaurant dining',
    suggestedFileName: 'restaurant-table.png',
    description: 'Icono de mesa de restaurante'
  },
  {
    questionId: 'mesas-meseros',
    optionValue: 'mesas-con-meseros',
    optionLabel: 'Sí, mesas y meseros',
    suggestedFlaticonSearch: 'waiter server restaurant service',
    suggestedFileName: 'waiter-service.png',
    description: 'Icono de mesero o servicio de restaurante'
  },
  {
    questionId: 'inventario-restaurante',
    optionValue: 'no-se',
    optionLabel: 'No, no sé',
    suggestedFlaticonSearch: 'question mark unknown',
    suggestedFileName: 'unknown-inventory.png',
    description: 'Icono de pregunta o desconocido'
  },
  {
    questionId: 'inventario-restaurante',
    optionValue: 'manual',
    optionLabel: 'Sí, pero lo anoto manualmente',
    suggestedFlaticonSearch: 'inventory checklist manual',
    suggestedFileName: 'inventory-manual.png',
    description: 'Icono de inventario manual o checklist'
  },
  {
    questionId: 'inventario-restaurante',
    optionValue: 'sistema',
    optionLabel: 'Sí, tengo sistema',
    suggestedFlaticonSearch: 'inventory system warehouse',
    suggestedFileName: 'inventory-system.png',
    description: 'Icono de sistema de inventario'
  },

  // ============================================
  // SERVICIO TÉCNICO
  // ============================================
  {
    questionId: 'gestion-ordenes',
    optionValue: 'papel',
    optionLabel: 'Todo en papel',
    suggestedFlaticonSearch: 'notepad paper document',
    suggestedFileName: 'notepad-paper.png',
    description: 'Icono de libreta o papel (reutilizar)'
  },
  {
    questionId: 'gestion-ordenes',
    optionValue: 'excel',
    optionLabel: 'En Excel o planilla',
    suggestedFlaticonSearch: 'excel spreadsheet table',
    suggestedFileName: 'excel-spreadsheet.png',
    description: 'Icono de Excel o planilla'
  },
  {
    questionId: 'gestion-ordenes',
    optionValue: 'whatsapp',
    optionLabel: 'Por WhatsApp',
    suggestedFlaticonSearch: 'whatsapp message chat',
    suggestedFileName: 'whatsapp-chat.png',
    description: 'Icono de WhatsApp (reutilizar)'
  },
  {
    questionId: 'gestion-ordenes',
    optionValue: 'sistema',
    optionLabel: 'Con un sistema',
    suggestedFlaticonSearch: 'system software dashboard',
    suggestedFileName: 'system-dashboard.png',
    description: 'Icono de sistema (reutilizar)'
  },
  {
    questionId: 'comisiones-tecnicos',
    optionValue: 'no-comisiones',
    optionLabel: 'No, no pago comisiones',
    suggestedFlaticonSearch: 'salary fixed payment',
    suggestedFileName: 'fixed-salary.png',
    description: 'Icono de salario fijo'
  },
  {
    questionId: 'comisiones-tecnicos',
    optionValue: 'manual',
    optionLabel: 'Sí, pero lo calculo manualmente',
    suggestedFlaticonSearch: 'calculator manual calculation',
    suggestedFileName: 'calculator-manual.png',
    description: 'Icono de calculadora'
  },
  {
    questionId: 'comisiones-tecnicos',
    optionValue: 'automatico',
    optionLabel: 'Sí, mi sistema lo calcula',
    suggestedFlaticonSearch: 'automation automatic system',
    suggestedFileName: 'automation.png',
    description: 'Icono de automatización'
  },
  {
    questionId: 'inventario-repuestos',
    optionValue: 'no-se',
    optionLabel: 'No, no sé',
    suggestedFlaticonSearch: 'question mark unknown',
    suggestedFileName: 'unknown-inventory.png',
    description: 'Icono de pregunta (reutilizar)'
  },
  {
    questionId: 'inventario-repuestos',
    optionValue: 'manual',
    optionLabel: 'Sí, pero manual',
    suggestedFlaticonSearch: 'inventory checklist manual',
    suggestedFileName: 'inventory-manual.png',
    description: 'Icono de inventario manual (reutilizar)'
  },
  {
    questionId: 'inventario-repuestos',
    optionValue: 'sistema',
    optionLabel: 'Sí, con sistema',
    suggestedFlaticonSearch: 'inventory system warehouse',
    suggestedFileName: 'inventory-system.png',
    description: 'Icono de sistema de inventario (reutilizar)'
  },
  {
    questionId: 'comunicacion-clientes',
    optionValue: 'si-constantemente',
    optionLabel: 'Sí, constantemente',
    suggestedFlaticonSearch: 'phone call ringing',
    suggestedFileName: 'phone-ringing.png',
    description: 'Icono de teléfono sonando'
  },
  {
    questionId: 'comunicacion-clientes',
    optionValue: 'a veces',
    optionLabel: 'A veces',
    suggestedFlaticonSearch: 'phone call occasional',
    suggestedFileName: 'phone-occasional.png',
    description: 'Icono de teléfono ocasional'
  },
  {
    questionId: 'comunicacion-clientes',
    optionValue: 'no',
    optionLabel: 'No, casi nunca',
    suggestedFlaticonSearch: 'check mark success',
    suggestedFileName: 'check-success.png',
    description: 'Icono de check o éxito'
  },

  // ============================================
  // TALLER
  // ============================================
  {
    questionId: 'gestion-ordenes-taller',
    optionValue: 'papel',
    optionLabel: 'Todo en papel',
    suggestedFlaticonSearch: 'notepad paper document',
    suggestedFileName: 'notepad-paper.png',
    description: 'Icono de libreta (reutilizar)'
  },
  {
    questionId: 'gestion-ordenes-taller',
    optionValue: 'excel',
    optionLabel: 'En Excel o planilla',
    suggestedFlaticonSearch: 'excel spreadsheet table',
    suggestedFileName: 'excel-spreadsheet.png',
    description: 'Icono de Excel (reutilizar)'
  },
  {
    questionId: 'gestion-ordenes-taller',
    optionValue: 'sistema',
    optionLabel: 'Con un sistema',
    suggestedFlaticonSearch: 'system software dashboard',
    suggestedFileName: 'system-dashboard.png',
    description: 'Icono de sistema (reutilizar)'
  },
  {
    questionId: 'comisiones-mecanicos',
    optionValue: 'no-comisiones',
    optionLabel: 'No, no pago comisiones',
    suggestedFlaticonSearch: 'salary fixed payment',
    suggestedFileName: 'fixed-salary.png',
    description: 'Icono de salario fijo (reutilizar)'
  },
  {
    questionId: 'comisiones-mecanicos',
    optionValue: 'manual',
    optionLabel: 'Sí, pero lo calculo manualmente',
    suggestedFlaticonSearch: 'calculator manual calculation',
    suggestedFileName: 'calculator-manual.png',
    description: 'Icono de calculadora (reutilizar)'
  },
  {
    questionId: 'comisiones-mecanicos',
    optionValue: 'automatico',
    optionLabel: 'Sí, mi sistema lo calcula',
    suggestedFlaticonSearch: 'automation automatic system',
    suggestedFileName: 'automation.png',
    description: 'Icono de automatización (reutilizar)'
  },

  // ============================================
  // FÁBRICA
  // ============================================
  {
    questionId: 'cotizaciones',
    optionValue: 'si-cotizo',
    optionLabel: 'Sí, hago cotizaciones',
    suggestedFlaticonSearch: 'quote quotation document',
    suggestedFileName: 'quotation-document.png',
    description: 'Icono de cotización o presupuesto'
  },
  {
    questionId: 'cotizaciones',
    optionValue: 'no-cotizo',
    optionLabel: 'No, no hago cotizaciones',
    suggestedFlaticonSearch: 'price tag fixed price',
    suggestedFileName: 'fixed-price.png',
    description: 'Icono de precio fijo o etiqueta'
  },
  {
    questionId: 'como-cotiza',
    optionValue: 'manual',
    optionLabel: 'Cotizo a mano',
    suggestedFlaticonSearch: 'pen writing document',
    suggestedFileName: 'pen-writing.png',
    description: 'Icono de pluma escribiendo'
  },
  {
    questionId: 'como-cotiza',
    optionValue: 'excel',
    optionLabel: 'Uso Excel',
    suggestedFlaticonSearch: 'excel spreadsheet table',
    suggestedFileName: 'excel-spreadsheet.png',
    description: 'Icono de Excel (reutilizar)'
  },
  {
    questionId: 'como-cotiza',
    optionValue: 'sistema',
    optionLabel: 'Tengo un sistema',
    suggestedFlaticonSearch: 'system software dashboard',
    suggestedFileName: 'system-dashboard.png',
    description: 'Icono de sistema (reutilizar)'
  },
  {
    questionId: 'calculo-costos',
    optionValue: 'manual',
    optionLabel: 'Calculo a mano',
    suggestedFlaticonSearch: 'calculator manual calculation',
    suggestedFileName: 'calculator-manual.png',
    description: 'Icono de calculadora (reutilizar)'
  },
  {
    questionId: 'calculo-costos',
    optionValue: 'excel',
    optionLabel: 'Uso Excel',
    suggestedFlaticonSearch: 'excel spreadsheet table',
    suggestedFileName: 'excel-spreadsheet.png',
    description: 'Icono de Excel (reutilizar)'
  },
  {
    questionId: 'calculo-costos',
    optionValue: 'aproximado',
    optionLabel: 'Uso costos aproximados',
    suggestedFlaticonSearch: 'approximate estimate',
    suggestedFileName: 'approximate.png',
    description: 'Icono de aproximación o estimación'
  },
  {
    questionId: 'calculo-costos',
    optionValue: 'sistema',
    optionLabel: 'Mi sistema calcula costos',
    suggestedFlaticonSearch: 'system software dashboard',
    suggestedFileName: 'system-dashboard.png',
    description: 'Icono de sistema (reutilizar)'
  },

  // ============================================
  // COMERCIO
  // ============================================
  {
    questionId: 'gestion-ventas',
    optionValue: 'papel',
    optionLabel: 'Todo en papel',
    suggestedFlaticonSearch: 'notepad paper document',
    suggestedFileName: 'notepad-paper.png',
    description: 'Icono de libreta (reutilizar)'
  },
  {
    questionId: 'gestion-ventas',
    optionValue: 'pos-basico',
    optionLabel: 'Tengo un POS básico',
    suggestedFlaticonSearch: 'cash register pos terminal',
    suggestedFileName: 'cash-register.png',
    description: 'Icono de caja registradora (reutilizar)'
  },
  {
    questionId: 'gestion-ventas',
    optionValue: 'sistema',
    optionLabel: 'Tengo un sistema',
    suggestedFlaticonSearch: 'system software dashboard',
    suggestedFileName: 'system-dashboard.png',
    description: 'Icono de sistema (reutilizar)'
  },

  // ============================================
  // SERVICIOS
  // ============================================
  {
    questionId: 'gestion-servicios',
    optionValue: 'papel',
    optionLabel: 'Todo en papel',
    suggestedFlaticonSearch: 'notepad paper document',
    suggestedFileName: 'notepad-paper.png',
    description: 'Icono de libreta (reutilizar)'
  },
  {
    questionId: 'gestion-servicios',
    optionValue: 'excel',
    optionLabel: 'Uso Excel',
    suggestedFlaticonSearch: 'excel spreadsheet table',
    suggestedFileName: 'excel-spreadsheet.png',
    description: 'Icono de Excel (reutilizar)'
  },
  {
    questionId: 'gestion-servicios',
    optionValue: 'sistema',
    optionLabel: 'Tengo un sistema',
    suggestedFlaticonSearch: 'system software dashboard',
    suggestedFileName: 'system-dashboard.png',
    description: 'Icono de sistema (reutilizar)'
  },

  // ============================================
  // PREGUNTAS TRANSVERSALES
  // ============================================
  {
    questionId: 'empleados',
    optionValue: '1-5',
    optionLabel: '1-5 empleados',
    suggestedFlaticonSearch: 'team small group people',
    suggestedFileName: 'team-small.png',
    description: 'Icono de equipo pequeño'
  },
  {
    questionId: 'empleados',
    optionValue: '6-15',
    optionLabel: '6-15 empleados',
    suggestedFlaticonSearch: 'team medium group people',
    suggestedFileName: 'team-medium.png',
    description: 'Icono de equipo mediano'
  },
  {
    questionId: 'empleados',
    optionValue: '16-50',
    optionLabel: '16-50 empleados',
    suggestedFlaticonSearch: 'team large group people',
    suggestedFileName: 'team-large.png',
    description: 'Icono de equipo grande'
  },
  {
    questionId: 'empleados',
    optionValue: '50+',
    optionLabel: 'Más de 50 empleados',
    suggestedFlaticonSearch: 'team corporate company',
    suggestedFileName: 'team-corporate.png',
    description: 'Icono de empresa corporativa'
  },
  {
    questionId: 'sucursales',
    optionValue: 'una',
    optionLabel: 'Solo una ubicación',
    suggestedFlaticonSearch: 'location pin single place',
    suggestedFileName: 'location-single.png',
    description: 'Icono de ubicación única'
  },
  {
    questionId: 'sucursales',
    optionValue: 'varias',
    optionLabel: 'Tengo varias ubicaciones',
    suggestedFlaticonSearch: 'multiple locations branches',
    suggestedFileName: 'locations-multiple.png',
    description: 'Icono de múltiples ubicaciones'
  },
  {
    questionId: 'presencia-web',
    optionValue: 'no-web',
    optionLabel: 'No, no tengo página web',
    suggestedFlaticonSearch: 'no website internet forbidden',
    suggestedFileName: 'no-website.png',
    description: 'Icono de "no tengo" o prohibido'
  },
  {
    questionId: 'presencia-web',
    optionValue: 'web-basica',
    optionLabel: 'Sí, pero básica',
    suggestedFlaticonSearch: 'website basic page simple',
    suggestedFileName: 'website-basic.png',
    description: 'Icono de página web básica'
  },
  {
    questionId: 'presencia-web',
    optionValue: 'web-completa',
    optionLabel: 'Sí, tengo página completa',
    suggestedFlaticonSearch: 'website professional complete',
    suggestedFileName: 'website-complete.png',
    description: 'Icono de página web profesional'
  }
];

/**
 * Obtiene el nombre de archivo sugerido para un icono basado en questionId y optionValue
 */
export function getIconFileName(questionId: string, optionValue: string): string | null {
  const mapping = ICON_MAPPINGS.find(
    m => m.questionId === questionId && m.optionValue === optionValue
  );
  return mapping?.suggestedFileName || null;
}

/**
 * Obtiene el término de búsqueda sugerido para Flaticon
 */
export function getFlaticonSearchTerm(questionId: string, optionValue: string): string | null {
  const mapping = ICON_MAPPINGS.find(
    m => m.questionId === questionId && m.optionValue === optionValue
  );
  return mapping?.suggestedFlaticonSearch || null;
}

/**
 * Obtiene todos los iconos únicos necesarios (sin duplicados)
 */
export function getUniqueIcons(): Array<{ fileName: string; searchTerm: string; description: string }> {
  const unique = new Map<string, { fileName: string; searchTerm: string; description: string }>();
  
  ICON_MAPPINGS.forEach(mapping => {
    if (!unique.has(mapping.suggestedFileName)) {
      unique.set(mapping.suggestedFileName, {
        fileName: mapping.suggestedFileName,
        searchTerm: mapping.suggestedFlaticonSearch,
        description: mapping.description
      });
    }
  });
  
  return Array.from(unique.values());
}

