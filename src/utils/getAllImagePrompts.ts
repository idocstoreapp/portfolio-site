/**
 * Utilidad para obtener TODOS los prompts de imágenes posibles
 * que el sistema puede generar según las preguntas y respuestas del wizard
 * 
 * Esta función analiza TODAS las preguntas y respuestas posibles
 * y genera los prompts correspondientes para que puedas crear todas las imágenes necesarias
 */

import { SECTOR_QUESTIONS, TRANSVERSAL_QUESTIONS, type BusinessSector, generateImagePrompt } from './conversationalDiagnostic';

export interface ImagePromptInfo {
  questionId: string;
  questionTitle: string;
  answerValue: string;
  answerLabel: string;
  sector: BusinessSector;
  imagePrompt: string;
  costImpact: {
    timeHours: number;
    moneyCost: number;
    errorRate: number;
  };
  suggestedFileName: string;
}

/**
 * Obtiene TODOS los prompts de imágenes posibles que el sistema puede generar
 * Analiza todas las preguntas y respuestas que generan insights
 */
export function getAllImagePrompts(): ImagePromptInfo[] {
  const allPrompts: ImagePromptInfo[] = [];
  const sectors: BusinessSector[] = ['restaurante', 'servicio-tecnico', 'taller', 'fabrica', 'comercio', 'servicios'];
  
  // IDs de preguntas que generan insights con imágenes
  const questionsWithImages = [
    'operacion-diaria',
    'menu-digital',
    'inventario-restaurante',
    'mesas-meseros',
    'gestion-ordenes',
    'comisiones-tecnicos',
    'inventario-repuestos',
    'comunicacion-clientes',
    'como-cotiza',
    'calculo-costos',
    'presencia-web'
  ];

  sectors.forEach(sector => {
    const sectorQuestions = SECTOR_QUESTIONS[sector] || [];
    
    // Analizar cada pregunta del sector
    sectorQuestions.forEach(question => {
      // Solo incluir preguntas que generan imágenes
      if (!questionsWithImages.includes(question.id)) return;
      
      if (question.options) {
        question.options.forEach(option => {
          // Solo incluir opciones que generan insights (con costImpact significativo)
          if (option.costImpact && 
              (option.costImpact.timeHours > 5 || option.costImpact.moneyCost > 100)) {
            
            const imagePrompt = generateImagePrompt(question.id, option.value, sector);
            const suggestedFileName = getSuggestedImageFileName({
              questionId: question.id,
              answerValue: option.value,
              sector,
              questionTitle: question.title,
              answerLabel: option.label,
              imagePrompt,
              costImpact: option.costImpact
            });
            
            allPrompts.push({
              questionId: question.id,
              questionTitle: question.title,
              answerValue: option.value,
              answerLabel: option.label,
              sector,
              imagePrompt,
              costImpact: option.costImpact,
              suggestedFileName
            });
          }
        });
      }
    });

    // Analizar preguntas transversales
    TRANSVERSAL_QUESTIONS.forEach(question => {
      if (!questionsWithImages.includes(question.id)) return;
      
      if (question.options) {
        question.options.forEach(option => {
          if (option.costImpact && 
              (option.costImpact.timeHours > 5 || option.costImpact.moneyCost > 100)) {
            
            const imagePrompt = generateImagePrompt(question.id, option.value, sector);
            const suggestedFileName = getSuggestedImageFileName({
              questionId: question.id,
              answerValue: option.value,
              sector,
              questionTitle: question.title,
              answerLabel: option.label,
              imagePrompt,
              costImpact: option.costImpact
            });
            
            allPrompts.push({
              questionId: question.id,
              questionTitle: question.title,
              answerValue: option.value,
              answerLabel: option.label,
              sector,
              imagePrompt,
              costImpact: option.costImpact,
              suggestedFileName
            });
          }
        });
      }
    });
  });

  return allPrompts;
}

/**
 * Obtiene prompts únicos (agrupados por questionId + answerValue)
 * Útil para saber cuántas imágenes únicas necesitas generar
 */
export function getUniqueImagePrompts(): ImagePromptInfo[] {
  const allPrompts = getAllImagePrompts();
  const uniqueMap = new Map<string, ImagePromptInfo>();

  allPrompts.forEach(prompt => {
    const key = `${prompt.questionId}-${prompt.answerValue}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, prompt);
    }
  });

  return Array.from(uniqueMap.values());
}

/**
 * Genera un nombre sugerido para el archivo de imagen
 */
function getSuggestedImageFileName(promptInfo: Omit<ImagePromptInfo, 'suggestedFileName'>): string {
  const sectorPrefix = promptInfo.sector.substring(0, 3);
  const questionId = promptInfo.questionId.replace(/-/g, '_');
  const answerValue = promptInfo.answerValue.replace(/-/g, '_');
  return `${sectorPrefix}_${questionId}_${answerValue}.png`;
}

