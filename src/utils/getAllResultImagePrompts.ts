/**
 * Utilidad para generar todos los prompts de imágenes posibles para RESULTADOS del diagnóstico
 * 
 * Estas imágenes son para las SECCIONES DE RESULTADOS, no para las preguntas del wizard.
 * Cada sección de resultados puede tener una imagen explicativa.
 * 
 * Estilo: Elegante, sofisticado, cálido, profesional pero amigable
 * Paleta: Beige claro, dorados sutiles, grises suaves, blancos
 */

import type { BusinessSector } from './conversationalDiagnostic';

export interface ResultImagePromptInfo {
  sectionType: 'currentSituation' | 'opportunities' | 'operationalImpact' | 'futureVision' | 'summary' | 'opportunitySection' | 'insight';
  sector: BusinessSector;
  prompt: string;
  suggestedFileName: string;
  description: string;
  context?: string; // Información adicional sobre qué representa esta imagen
  insightType?: string; // Para insights: tipo de problema (papel-procesos, menu-digital, etc.)
}

/**
 * Genera prompt de imagen para "Situación Actual" (currentSituation)
 * Estilo: Ultra realista, fotográfico, detallado, actual
 */
function generateCurrentSituationImagePrompt(sector: BusinessSector): string {
  const sectorScenes: Record<BusinessSector, string> = {
    'restaurante': 'Ultra-realistic, detailed photograph of a real restaurant owner in their actual restaurant kitchen or dining area. The scene shows: handwritten order tickets on a clipboard, paper menus, a traditional order pad on the counter, a busy but organized kitchen in the background. The owner (a real person, not illustrated) is wearing a chef apron or restaurant uniform, holding a pen and looking at order tickets. Visible details: stainless steel kitchen equipment, food prep stations, warm restaurant lighting, real restaurant atmosphere. Photorealistic, high detail, natural lighting, current modern restaurant setting',
    'servicio-tecnico': 'Ultra-realistic, detailed photograph of a real technical service shop owner in their actual repair shop. The scene shows: a professional electronics repair workbench with precision tools (screwdrivers, tweezers, soldering iron, multimeter), disassembled smartphones and tablets on anti-static mats, repair order forms on paper, a phone ringing with customer calls. The owner (a real person, not illustrated) is wearing a technician apron or casual work clothes, holding a phone or tool, looking at repair orders. Visible details: organized tool drawers, component organizers, repair equipment, LED workbench lighting, modern electronics repair shop atmosphere. Photorealistic, high detail, natural lighting, current professional repair shop setting',
    'taller': 'Ultra-realistic, detailed photograph of a real auto mechanic workshop owner in their actual garage. The scene shows: car parts organized on shelves (engines, tires, tools), paper work orders on a clipboard, a car lift or vehicle in the background, professional mechanic tools (wrenches, impact guns, diagnostic equipment). The owner (a real person, not illustrated) is wearing mechanic coveralls or work clothes with grease stains, holding a clipboard with work orders. Visible details: hydraulic lifts, tool chests, automotive parts, bright workshop lighting, authentic mechanic garage atmosphere. Photorealistic, high detail, natural lighting, current professional auto repair shop setting',
    'fabrica': 'Ultra-realistic, detailed photograph of a real factory or furniture workshop owner in their actual production space. The scene shows: woodworking machinery or production equipment, measurement tools, production orders on paper, sketches and blueprints, raw materials. The owner (a real person, not illustrated) is wearing work clothes or business casual, holding production documents or measuring tools. Visible details: industrial equipment, workbenches, materials, production lighting, real manufacturing atmosphere. Photorealistic, high detail, natural lighting, current modern production setting',
    'comercio': 'Ultra-realistic, detailed photograph of a real retail store owner in their actual shop. The scene shows: product inventory lists on paper, sales records, a cash register or POS system, product shelves in the background. The owner (a real person, not illustrated) is wearing casual or business casual clothes, holding inventory sheets or sales records. Visible details: store shelves with products, display cases, store lighting, real retail environment. Photorealistic, high detail, natural lighting, current modern retail setting',
    'servicios': 'Ultra-realistic, detailed photograph of a real professional service provider in their actual office. The scene shows: client appointment books, documents on a desk, a computer or laptop, professional office setting. The owner (a real person, not illustrated) is wearing business casual or professional attire, looking at client notes or documents. Visible details: modern office furniture, desk organization, office lighting, real professional workspace. Photorealistic, high detail, natural lighting, current modern office setting'
  };

  const scene = sectorScenes[sector] || 'Ultra-realistic, detailed photograph of a real small business owner in their actual workspace, surrounded by papers and notes';

  return `${scene}. Photorealistic style, not illustration or animation. Ultra-high detail, sharp focus, natural lighting. Color palette: realistic colors, warm beige and cream tones, natural grays, subtle warm lighting. The mood is understanding and respectful - showing real, current business operations. No text overlays, no illustrations, purely photographic realism.`;
}

/**
 * Genera prompt de imagen para "Oportunidades Detectadas" (opportunities)
 * Estilo: Ultra realista, fotográfico, actual, optimista
 */
function generateOpportunitiesImagePrompt(sector: BusinessSector, opportunityTitle: string): string {
  const sectorContexts: Record<BusinessSector, string> = {
    'restaurante': 'restaurant owner in their restaurant',
    'servicio-tecnico': 'electronics repair shop owner in their repair shop',
    'taller': 'auto mechanic in their garage',
    'fabrica': 'factory or furniture workshop owner in their production space',
    'comercio': 'retail store owner in their shop',
    'servicios': 'professional service provider in their office'
  };

  const context = sectorContexts[sector] || 'business owner in their workspace';
  const opportunityDesc = opportunityTitle.toLowerCase();

  if (opportunityDesc.includes('digital') || opportunityDesc.includes('digitalizar')) {
    return `Ultra-realistic, detailed photograph of a real ${context} looking at a modern tablet or digital screen displaying organized business data, order management system, or digital dashboard. The owner (real person, not illustrated) has a thoughtful, positive expression. Visible: their actual workspace in the background, the tablet/screen showing modern business software interface, traditional elements transitioning to digital. Photorealistic, ultra-high detail, sharp focus, natural lighting. Color palette: realistic colors, warm beige and cream tones, subtle warm lighting. No text overlays, no illustrations, purely photographic realism. The mood is optimistic and achievable.`;
  }

  if (opportunityDesc.includes('automat') || opportunityDesc.includes('automatizar')) {
    return `Ultra-realistic, detailed photograph showing a split or side-by-side view: left side shows the real ${context} with manual processes (papers, handwritten notes, traditional methods), right side shows the same owner with automated digital systems (tablet, digital tools, organized digital interface). Both sides are photorealistic, showing the same real person in both scenarios. Ultra-high detail, sharp focus, natural lighting. Color palette: realistic colors, warm beige tones, natural lighting. No text overlays, no illustrations, purely photographic realism. The contrast shows improvement with empathy.`;
  }

  // Prompt genérico para oportunidades
  return `Ultra-realistic, detailed photograph of a real ${context} in a moment of positive realization, looking at possibilities with a thoughtful but optimistic expression. The scene shows their actual workspace with potential improvements visible. Photorealistic, ultra-high detail, sharp focus, natural lighting. Color palette: realistic colors, warm beige and cream tones, natural lighting. No text overlays, no illustrations, purely photographic realism. The mood is optimistic and achievable.`;
}

/**
 * Genera prompt de imagen para "Impacto Operativo" (operationalImpact)
 * Estilo: Ultra realista, fotográfico, informativo pero empático
 */
function generateOperationalImpactImagePrompt(sector: BusinessSector, impactArea: 'tiempo' | 'costos' | 'errores' | 'crecimiento'): string {
  const sectorContexts: Record<BusinessSector, string> = {
    'restaurante': 'restaurant owner in their restaurant',
    'servicio-tecnico': 'electronics repair shop owner in their repair shop',
    'taller': 'auto mechanic in their garage',
    'fabrica': 'factory or furniture workshop owner in their production space',
    'comercio': 'retail store owner in their shop',
    'servicios': 'professional service provider in their office'
  };

  const context = sectorContexts[sector] || 'business owner in their workspace';

  const impactScenes: Record<string, string> = {
    'tiempo': `Ultra-realistic, detailed photograph of a real ${context} looking at a clock or calendar thoughtfully, surrounded by their actual daily tasks and responsibilities. The scene shows: papers, tools, work orders, their real workspace. The owner (real person) appears dedicated and focused, not overwhelmed. Visible details: a wall clock or desk calendar, their actual work environment, natural time indicators integrated naturally. Photorealistic, ultra-high detail, sharp focus, natural lighting`,
    'costos': `Ultra-realistic, detailed photograph of a real ${context} reviewing expenses, invoices, or receipts in a calm, practical way. The scene shows: actual receipts, invoices, financial documents, calculator or computer, their real workspace. The owner (real person) looks thoughtful and in control. Visible details: financial papers, receipts, invoices, organized workspace. Photorealistic, ultra-high detail, sharp focus, natural lighting`,
    'errores': `Ultra-realistic, detailed photograph of a real ${context} noticing a small mistake that needs correction, with a calm, understanding expression. The scene shows: their actual work, a paper with a correction or review, their real workspace. The owner (real person) looks capable and attentive. Visible details: work documents, correction marks, organized workspace. Photorealistic, ultra-high detail, sharp focus, natural lighting`,
    'crecimiento': `Ultra-realistic, detailed photograph of a real ${context} looking toward the future with thoughtful optimism. The scene shows: their actual workspace, forward-looking perspective, organized and growing environment. The owner (real person) looks confident and forward-thinking. Visible details: their real business environment, organized workspace, positive atmosphere. Photorealistic, ultra-high detail, sharp focus, natural lighting`
  };

  const scene = impactScenes[impactArea] || impactScenes['tiempo'];

  return `${scene}. Color palette: realistic colors, warm beige and cream tones, natural grays, subtle warm lighting. No text overlays, no illustrations, purely photographic realism. The mood is understanding and supportive - "these are real considerations, but they're manageable". Natural, warm lighting.`;
}

/**
 * Genera prompt de imagen para "Visión Futura" (futureVision)
 * Estilo: Ultra realista, fotográfico, inspirador, actual
 */
function generateFutureVisionImagePrompt(sector: BusinessSector): string {
  const sectorScenes: Record<BusinessSector, string> = {
    'restaurante': 'Ultra-realistic, detailed photograph of a real restaurant owner in their actual restaurant, looking calm and in control. The scene shows: modern digital POS system or tablet for orders, organized kitchen, streamlined processes, warm restaurant atmosphere. The owner (real person) has a relaxed but focused expression. Visible details: digital order system, organized workspace, efficient restaurant operations, real restaurant setting. Photorealistic, ultra-high detail, sharp focus, natural lighting',
    'servicio-tecnico': 'Ultra-realistic, detailed photograph of a real electronics repair shop owner in their actual repair shop, looking efficient and organized. The scene shows: organized digital repair management system, streamlined workbench, efficient tool organization, modern repair shop atmosphere. The owner (real person) looks relaxed and in control. Visible details: digital management tools, organized repair station, professional equipment, real repair shop setting. Photorealistic, ultra-high detail, sharp focus, natural lighting',
    'taller': 'Ultra-realistic, detailed photograph of a real auto mechanic in their actual garage, looking confident and organized. The scene shows: digital diagnostic equipment, organized tool systems, streamlined workflow, efficient garage operations. The owner (real person) looks calm and professional. Visible details: modern diagnostic tools, organized workspace, professional garage atmosphere, real mechanic shop setting. Photorealistic, ultra-high detail, sharp focus, natural lighting',
    'fabrica': 'Ultra-realistic, detailed photograph of a real factory or furniture workshop owner in their actual production space, looking creative and efficient. The scene shows: organized production systems, digital tools, streamlined processes, efficient workspace. The owner (real person) looks focused and productive. Visible details: organized production area, digital management tools, real manufacturing setting. Photorealistic, ultra-high detail, sharp focus, natural lighting',
    'comercio': 'Ultra-realistic, detailed photograph of a real retail store owner in their actual shop, looking satisfied and in control. The scene shows: modern POS system, organized inventory, digital tools, efficient store operations. The owner (real person) looks calm and professional. Visible details: modern retail systems, organized store, real retail environment. Photorealistic, ultra-high detail, sharp focus, natural lighting',
    'servicios': 'Ultra-realistic, detailed photograph of a real professional service provider in their actual modern office, looking calm and professional. The scene shows: organized digital systems, streamlined workspace, efficient operations, modern office atmosphere. The owner (real person) looks relaxed and in control. Visible details: modern office setup, digital tools, organized workspace, real professional environment. Photorealistic, ultra-high detail, sharp focus, natural lighting'
  };

  const scene = sectorScenes[sector] || 'Ultra-realistic, detailed photograph of a real business owner in their optimized workspace, looking calm and in control';

  return `${scene}. Color palette: realistic colors, warm beige and cream tones, natural grays, subtle warm lighting. No text overlays, no illustrations, purely photographic realism. The mood is "this is achievable, and it feels wonderful". Natural, warm lighting that creates an atmosphere of success and peace.`;
}

/**
 * Genera prompt de imagen para "Resumen de Costos y Ahorros" (summary)
 * Estilo: Ultra realista, fotográfico, claro y transparente
 */
function generateSummaryImagePrompt(sector: BusinessSector, comparisonType: 'beforeAfter' | 'savings' | 'roi'): string {
  const sectorContexts: Record<BusinessSector, string> = {
    'restaurante': 'restaurant owner in their restaurant',
    'servicio-tecnico': 'electronics repair shop owner in their repair shop',
    'taller': 'auto mechanic in their garage',
    'fabrica': 'factory or furniture workshop owner in their production space',
    'comercio': 'retail store owner in their shop',
    'servicios': 'professional service provider in their office'
  };

  const context = sectorContexts[sector] || 'business owner in their workspace';

  const comparisonScenes: Record<string, string> = {
    'beforeAfter': `Ultra-realistic, detailed photograph showing a split or side-by-side view of a real ${context} in two moments. Left side: current situation with manual processes (papers, handwritten notes, traditional methods) - the owner (real person) looks busy but capable. Right side: optimized future (digital tools, organized systems, streamlined processes) - the same owner looks more at ease and efficient. Both sides are photorealistic, showing the same real person. Ultra-high detail, sharp focus, natural lighting`,
    'savings': `Ultra-realistic, detailed photograph of a real ${context} in a moment of positive realization, looking at their organized workspace with a sense of financial clarity and time efficiency. The scene shows: their actual optimized workspace, subtle indicators of savings (organized systems, time saved). The owner (real person) looks thoughtful and positive. Visible details: their real business environment, organized workspace. Photorealistic, ultra-high detail, sharp focus, natural lighting`,
    'roi': `Ultra-realistic, detailed photograph of a real ${context} looking confidently toward the future, with their organized and growing business visible. The scene shows: their actual optimized workspace, forward momentum, positive business environment. The owner (real person) looks forward-thinking and confident. Visible details: their real business setting, organized and growing atmosphere. Photorealistic, ultra-high detail, sharp focus, natural lighting`
  };

  const scene = comparisonScenes[comparisonType] || comparisonScenes['beforeAfter'];

  return `${scene}. Color palette: realistic colors, warm beige and cream tones, natural grays, subtle warm lighting. No text overlays, no illustrations, no data charts or numbers visible, purely photographic realism. The mood is transparent and positive - "here's what's possible, clearly and honestly". Natural, warm lighting.`;
}

/**
 * Genera nombre de archivo sugerido para una imagen de resultado
 */
function getSuggestedResultImageFileName(
  sectionType: ResultImagePromptInfo['sectionType'],
  sector: BusinessSector,
  suffix?: string
): string {
  const sectorNames: Record<BusinessSector, string> = {
    'restaurante': 'restaurante',
    'servicio-tecnico': 'servicio-tecnico',
    'taller': 'taller',
    'fabrica': 'fabrica',
    'comercio': 'comercio',
    'servicios': 'servicios'
  };

  const sectionNames: Record<ResultImagePromptInfo['sectionType'], string> = {
    'currentSituation': 'situacion-actual',
    'opportunities': 'oportunidades',
    'operationalImpact': 'impacto-operativo',
    'futureVision': 'vision-futura',
    'summary': 'resumen',
    'opportunitySection': 'oportunidad-seccion',
    'insight': 'insight'
  };

  const sectorSlug = sectorNames[sector] || 'general';
  const sectionSlug = sectionNames[sectionType];
  let suffixPart = suffix ? `-${suffix.toLowerCase().replace(/\s+/g, '-')}` : '';
  
  // Para insights, el suffix es el tipo de insight directamente
  if (sectionType === 'insight' && suffix) {
    suffixPart = `-${suffix}`;
  }

  return `resultado-${sectionSlug}-${sectorSlug}${suffixPart}.png`;
}

/**
 * Genera prompt de imagen para la sección "La Oportunidad"
 */
function generateOpportunitySectionImagePrompt(sector: BusinessSector): string {
  const sectorContexts: Record<BusinessSector, string> = {
    'restaurante': 'restaurant owner in their restaurant',
    'servicio-tecnico': 'electronics repair shop owner in their repair shop',
    'taller': 'auto mechanic in their garage',
    'fabrica': 'factory or furniture workshop owner in their production space',
    'comercio': 'retail store owner in their shop',
    'servicios': 'professional service provider in their office'
  };

  const context = sectorContexts[sector] || 'business owner in their workspace';

  return `Ultra-realistic, detailed photograph of a real ${context} in a moment of realization and opportunity. The scene shows: the owner (real person, not illustrated) looking thoughtfully at their current processes, with a sense of potential and possibility. Visible details: their actual business environment, current tools and processes, but with a forward-looking, optimistic atmosphere. The owner looks engaged and ready for positive change. Photorealistic style, not illustration or animation. Ultra-high detail, sharp focus, natural lighting. Color palette: realistic colors, warm beige and cream tones, natural grays, subtle warm lighting with a hint of optimism. The mood is positive and encouraging - "here's an opportunity to improve, and it's achievable". No text overlays, no illustrations, purely photographic realism.`;
}

/**
 * Genera prompt de imagen para un insight individual
 */
function generateInsightImagePrompt(sector: BusinessSector, insightType: string): string {
  const sectorContexts: Record<BusinessSector, string> = {
    'restaurante': 'restaurant owner in their restaurant',
    'servicio-tecnico': 'electronics repair shop owner in their repair shop',
    'taller': 'auto mechanic in their garage',
    'fabrica': 'factory or furniture workshop owner in their production space',
    'comercio': 'retail store owner in their shop',
    'servicios': 'professional service provider in their office'
  };

  const context = sectorContexts[sector] || 'business owner in their workspace';

  const insightScenes: Record<string, string> = {
    'papel-procesos': `Ultra-realistic, detailed photograph of a real ${context} working with paper-based processes. The scene shows: handwritten notes, paper forms, traditional order pads, manual record-keeping. The owner (real person, not illustrated) is holding papers or writing, showing the current manual process. Visible details: paper documents, pens, clipboards, traditional methods. Photorealistic, ultra-high detail, sharp focus, natural lighting`,
    'menu-digital': `Ultra-realistic, detailed photograph of a real ${context} dealing with menu or catalog updates. The scene shows: printed menus or catalogs, design files, printing materials, the challenge of updating printed materials. The owner (real person, not illustrated) is looking at printed materials or design files. Visible details: printed menus/catalogs, design tools, printing equipment. Photorealistic, ultra-high detail, sharp focus, natural lighting`,
    'inventario': `Ultra-realistic, detailed photograph of a real ${context} managing inventory manually. The scene shows: inventory lists on paper, physical counting, manual stock checking, storage areas. The owner (real person, not illustrated) is checking inventory or writing inventory lists. Visible details: storage areas, inventory lists, manual counting tools. Photorealistic, ultra-high detail, sharp focus, natural lighting`,
    'comunicacion': `Ultra-realistic, detailed photograph of a real ${context} dealing with communication challenges. The scene shows: phone calls, messages, coordination efforts, communication gaps. The owner (real person, not illustrated) is on the phone or trying to coordinate. Visible details: phones, messages, coordination tools. Photorealistic, ultra-high detail, sharp focus, natural lighting`,
    'tiempo': `Ultra-realistic, detailed photograph of a real ${context} showing time being spent on manual tasks. The scene shows: the owner (real person, not illustrated) engaged in time-consuming manual processes, clock visible, busy but organized workspace. Visible details: time indicators, manual tasks, busy but capable atmosphere. Photorealistic, ultra-high detail, sharp focus, natural lighting`,
    'costos': `Ultra-realistic, detailed photograph of a real ${context} dealing with cost management. The scene shows: receipts, invoices, cost calculations, financial documents. The owner (real person, not illustrated) is reviewing costs or financial documents. Visible details: financial documents, receipts, cost-related materials. Photorealistic, ultra-high detail, sharp focus, natural lighting`,
    'general': `Ultra-realistic, detailed photograph of a real ${context} in their daily operations, showing a common business challenge or process. The owner (real person, not illustrated) is engaged in their work, showing real business operations. Visible details: their actual workspace, business tools, real working environment. Photorealistic, ultra-high detail, sharp focus, natural lighting`
  };

  const scene = insightScenes[insightType] || insightScenes['general'];

  return `${scene}. Color palette: realistic colors, warm beige and cream tones, natural grays, subtle warm lighting. The mood is understanding and respectful - showing real business challenges without judgment. No text overlays, no illustrations, purely photographic realism.`;
}

/**
 * Obtiene todos los prompts de imágenes posibles para RESULTADOS
 * 
 * Esto incluye prompts para todas las secciones de resultados posibles:
 * - Situación Actual (por sector)
 * - Oportunidades (por sector y tipo)
 * - Impacto Operativo (por sector y área de impacto)
 * - Visión Futura (por sector)
 * - Resumen (por sector y tipo de comparación)
 * - Sección "La Oportunidad" (por sector)
 * - Insights individuales (por sector y tipo de problema)
 */
export function getAllResultImagePrompts(): ResultImagePromptInfo[] {
  const sectors: BusinessSector[] = ['restaurante', 'servicio-tecnico', 'taller', 'fabrica', 'comercio', 'servicios'];
  const impactAreas: Array<'tiempo' | 'costos' | 'errores' | 'crecimiento'> = ['tiempo', 'costos', 'errores', 'crecimiento'];
  const opportunityTypes = [
    'Digitalizar procesos',
    'Automatizar tareas',
    'Sistema de gestión',
    'Comunicación digital',
    'Control automatizado'
  ];
  const summaryTypes: Array<'beforeAfter' | 'savings' | 'roi'> = ['beforeAfter', 'savings', 'roi'];

  const prompts: ResultImagePromptInfo[] = [];

  // 1. Situación Actual (1 por sector)
  sectors.forEach(sector => {
    prompts.push({
      sectionType: 'currentSituation',
      sector,
      prompt: generateCurrentSituationImagePrompt(sector),
      suggestedFileName: getSuggestedResultImageFileName('currentSituation', sector),
      description: `Imagen para la sección "Situación Actual" del diagnóstico para ${sector}`,
      context: 'Esta imagen se muestra al inicio de los resultados, explicando la situación actual del negocio de forma empática y sin juicios.'
    });
  });

  // 2. Oportunidades (1 por sector y tipo de oportunidad)
  sectors.forEach(sector => {
    opportunityTypes.forEach(opportunityType => {
      prompts.push({
        sectionType: 'opportunities',
        sector,
        prompt: generateOpportunitiesImagePrompt(sector, opportunityType),
        suggestedFileName: getSuggestedResultImageFileName('opportunities', sector, opportunityType),
        description: `Imagen para la sección "Oportunidades" del diagnóstico para ${sector} - ${opportunityType}`,
        context: 'Esta imagen se muestra en la sección de oportunidades detectadas, mostrando el potencial de mejora de forma positiva y alcanzable.'
      });
    });
  });

  // 3. Impacto Operativo (1 por sector y área de impacto)
  sectors.forEach(sector => {
    impactAreas.forEach(impactArea => {
      prompts.push({
        sectionType: 'operationalImpact',
        sector,
        prompt: generateOperationalImpactImagePrompt(sector, impactArea),
        suggestedFileName: getSuggestedResultImageFileName('operationalImpact', sector, impactArea),
        description: `Imagen para la sección "Impacto Operativo" del diagnóstico para ${sector} - ${impactArea}`,
        context: `Esta imagen se muestra en la sección de impacto operativo, explicando el impacto en ${impactArea} de forma transparente pero no alarmante.`
      });
    });
  });

  // 4. Visión Futura (1 por sector)
  sectors.forEach(sector => {
    prompts.push({
      sectionType: 'futureVision',
      sector,
      prompt: generateFutureVisionImagePrompt(sector),
      suggestedFileName: getSuggestedResultImageFileName('futureVision', sector),
      description: `Imagen para la sección "Visión Futura" del diagnóstico para ${sector}`,
      context: 'Esta imagen se muestra al final de los resultados, mostrando cómo sería el negocio con procesos optimizados, de forma inspiradora pero realista.'
    });
  });

  // 5. Resumen (1 por sector y tipo de comparación)
  sectors.forEach(sector => {
    summaryTypes.forEach(summaryType => {
      prompts.push({
        sectionType: 'summary',
        sector,
        prompt: generateSummaryImagePrompt(sector, summaryType),
        suggestedFileName: getSuggestedResultImageFileName('summary', sector, summaryType),
        description: `Imagen para la sección "Resumen" del diagnóstico para ${sector} - ${summaryType}`,
        context: `Esta imagen se muestra en la sección de resumen, mostrando ${summaryType === 'beforeAfter' ? 'la comparación antes/después' : summaryType === 'savings' ? 'los ahorros potenciales' : 'el retorno de inversión'} de forma clara y transparente.`
      });
    });
  });

  // 6. Sección "La Oportunidad" (1 por sector)
  sectors.forEach(sector => {
    prompts.push({
      sectionType: 'opportunitySection',
      sector,
      prompt: generateOpportunitySectionImagePrompt(sector),
      suggestedFileName: getSuggestedResultImageFileName('opportunitySection', sector),
      description: `Imagen para la sección "La Oportunidad" del diagnóstico para ${sector}`,
      context: 'Esta imagen se muestra en la sección "La Oportunidad", mostrando el potencial de mejora de forma positiva y alcanzable.'
    });
  });

  // 7. Insights individuales (por sector y tipo de problema)
  const insightTypes = ['papel-procesos', 'menu-digital', 'inventario', 'comunicacion', 'tiempo', 'costos', 'general'];
  sectors.forEach(sector => {
    insightTypes.forEach(insightType => {
      prompts.push({
        sectionType: 'insight',
        sector,
        prompt: generateInsightImagePrompt(sector, insightType),
        suggestedFileName: getSuggestedResultImageFileName('insight', sector, insightType),
        description: `Imagen para insight individual del diagnóstico para ${sector} - ${insightType}`,
        context: `Esta imagen se muestra en cada insight individual, mostrando el problema específico de forma empática y sin juicios.`,
        insightType
      });
    });
  });

  return prompts;
}
