import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SolutionTemplatesService } from '../solution-templates/solution-templates.service';

// Tipo para diagnóstico (compatible con estructura de Supabase)
interface Diagnostic {
  id?: string;
  tipoEmpresa?: string;
  solucion_principal?: string;
  necesidadesAdicionales?: string;
  nombre?: string;
  empresa?: string;
  email?: string;
  telefono?: string;
  [key: string]: any;
}

export interface SolutionTypeDecision {
  type: 'prefabricated' | 'custom';
  template?: any;
  matchScore?: number;
  modules?: string[];
  customization?: any;
  estimatedSections?: number;
  estimatedFunctions?: number;
  estimatedIntegrations?: number;
  pricing?: {
    total: number;
    breakdown: Array<{ name: string; quantity: number; unitPrice: number; total: number }>;
  };
}

@Injectable()
export class SolutionTypeDeterminerService {
  constructor(
    private supabaseService: SupabaseService,
    private solutionTemplatesService: SolutionTemplatesService,
  ) {}

  /**
   * Determina si usar app prefabricada o personalizada basado en el diagnóstico
   */
  async determineSolutionType(diagnostic: Diagnostic): Promise<SolutionTypeDecision> {
    if (!this.supabaseService.isConfigured()) {
      return this.createCustomSolution(diagnostic);
    }

    const sector = diagnostic.tipoEmpresa;
    const needs = diagnostic.necesidadesAdicionales || '';

    // Buscar templates que coincidan con el sector
    const templates = await this.getTemplatesBySector(sector);

    if (templates.length === 0) {
      return this.createCustomSolution(diagnostic);
    }

    // Calcular match score para cada template
    const matches = await Promise.all(
      templates.map(async (template) => {
        const score = await this.calculateMatchScore(template, sector, needs);
        return { template, score };
      })
    );

    // Ordenar por score descendente
    matches.sort((a, b) => b.score - a.score);

    // Si hay match alto (>80%), usar prefabricada
    const bestMatch = matches[0];
    if (bestMatch && bestMatch.score > 0.8) {
      const recommendedModules = await this.getRecommendedModules(
        bestMatch.template,
        needs,
      );

      return {
        type: 'prefabricated',
        template: bestMatch.template,
        matchScore: bestMatch.score,
        modules: recommendedModules,
        customization: await this.getCustomizationNeeds(bestMatch.template, needs),
      };
    }

    // Si no hay match alto, crear personalizada
    return this.createCustomSolution(diagnostic);
  }

  /**
   * Obtiene templates por sector
   */
  private async getTemplatesBySector(sector: string): Promise<any[]> {
    try {
      const templates = await this.solutionTemplatesService.getAllTemplates();
      
      // Mapeo de sectores a slugs de templates
      const sectorToSlug: Record<string, string[]> = {
        'restaurante': ['restaurantes'],
        'servicio-tecnico': ['servicio-tecnico'],
        'taller-mecanico': ['taller-mecanico'],
        'fabrica': ['cotizador-fabrica'],
        'muebleria': ['cotizador-fabrica'],
        'web': ['desarrollo-web'],
        'sitio-web': ['desarrollo-web'],
      };

      const matchingSlugs = sectorToSlug[sector?.toLowerCase()] || [];
      
      return templates.filter(t => 
        matchingSlugs.includes(t.slug) || 
        t.is_prefabricated === true
      );
    } catch (error) {
      console.error('Error getting templates by sector:', error);
      return [];
    }
  }

  /**
   * Calcula el score de coincidencia entre template y diagnóstico
   */
  private async calculateMatchScore(
    template: any,
    sector: string,
    needs: string,
  ): Promise<number> {
    let score = 0;

    // Score por sector (40%)
    const sectorKeywords: Record<string, string[]> = {
      'restaurantes': ['restaurante', 'comida', 'menu', 'mesa', 'pedido'],
      'servicio-tecnico': ['reparacion', 'tecnico', 'equipo', 'servicio'],
      'taller-mecanico': ['taller', 'mecanico', 'vehiculo', 'auto', 'reparacion'],
      'cotizador-fabrica': ['cotizacion', 'fabrica', 'mueble', 'produccion'],
      'desarrollo-web': ['web', 'sitio', 'pagina', 'landing'],
    };

    const templateKeywords = sectorKeywords[template.slug] || [];
    const sectorLower = sector?.toLowerCase() || '';
    const needsLower = needs?.toLowerCase() || '';

    // Verificar coincidencias de keywords
    const sectorMatches = templateKeywords.filter(kw => 
      sectorLower.includes(kw) || needsLower.includes(kw)
    ).length;

    score += (sectorMatches / Math.max(templateKeywords.length, 1)) * 0.4;

    // Score por funcionalidades del template (30%)
    if (template.features_list && Array.isArray(template.features_list)) {
      const coreFeatures = template.features_list.filter((f: any) => f.included && f.category === 'core');
      score += Math.min(coreFeatures.length / 5, 1) * 0.3;
    }

    // Score por casos de uso (30%)
    if (template.use_cases && Array.isArray(template.use_cases)) {
      const useCaseMatches = template.use_cases.some((uc: string) =>
        sectorLower.includes(uc.toLowerCase()) || needsLower.includes(uc.toLowerCase())
      );
      score += useCaseMatches ? 0.3 : 0;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Obtiene módulos recomendados basado en necesidades
   */
  private async getRecommendedModules(
    template: any,
    needs: string,
  ): Promise<string[]> {
    if (!this.supabaseService.isConfigured()) {
      return template.included_modules_default || [];
    }

    const supabase = this.supabaseService.getAdminClient();
    const needsLower = needs?.toLowerCase() || '';

    // Obtener módulos del template
    const { data: modules } = await supabase
      .from('solution_modules')
      .select('id, name, description, is_required')
      .eq('solution_template_id', template.id)
      .eq('is_active', true);

    if (!modules) {
      return template.included_modules_default || [];
    }

    // Siempre incluir módulos requeridos
    const requiredModules = modules
      .filter(m => m.is_required)
      .map(m => m.id);

    // Buscar módulos opcionales que coincidan con necesidades
    const optionalModules = modules
      .filter(m => !m.is_required)
      .filter(m => {
        const nameLower = m.name?.toLowerCase() || '';
        const descLower = m.description?.toLowerCase() || '';
        return needsLower.includes(nameLower) || needsLower.includes(descLower);
      })
      .map(m => m.id);

    return [...requiredModules, ...optionalModules];
  }

  /**
   * Obtiene necesidades de personalización
   */
  private async getCustomizationNeeds(
    template: any,
    needs: string,
  ): Promise<any> {
    const needsLower = needs?.toLowerCase() || '';
    const customization: any = {
      logo: needsLower.includes('logo') || needsLower.includes('marca'),
      colors: needsLower.includes('color') || needsLower.includes('diseño'),
      additionalSections: 0,
    };

    // Estimar secciones adicionales basado en necesidades
    const sectionKeywords = ['seccion', 'pagina', 'seccion adicional', 'nueva seccion'];
    sectionKeywords.forEach(keyword => {
      if (needsLower.includes(keyword)) {
        customization.additionalSections += 1;
      }
    });

    return customization;
  }

  /**
   * Crea solución personalizada
   */
  private async createCustomSolution(diagnostic: Diagnostic): Promise<SolutionTypeDecision> {
    const needs = diagnostic.necesidadesAdicionales || '';
    const needsLower = needs.toLowerCase();

    // Estimar secciones
    let estimatedSections = 5; // Base
    if (needsLower.includes('catálogo') || needsLower.includes('catalogo')) {
      estimatedSections += 3;
    }
    if (needsLower.includes('ecommerce') || needsLower.includes('tienda')) {
      estimatedSections += 5;
    }
    if (needsLower.includes('blog')) {
      estimatedSections += 2;
    }

    // Estimar funciones
    let estimatedFunctions = 3; // Base (CRUD básico)
    if (needsLower.includes('reporte') || needsLower.includes('reportes')) {
      estimatedFunctions += 2;
    }
    if (needsLower.includes('notificacion') || needsLower.includes('email')) {
      estimatedFunctions += 1;
    }
    if (needsLower.includes('busqueda') || needsLower.includes('filtro')) {
      estimatedFunctions += 1;
    }

    // Estimar integraciones
    let estimatedIntegrations = 0;
    if (needsLower.includes('pago') || needsLower.includes('transbank') || needsLower.includes('stripe')) {
      estimatedIntegrations += 1;
    }
    if (needsLower.includes('email') || needsLower.includes('correo')) {
      estimatedIntegrations += 1;
    }
    if (needsLower.includes('sms') || needsLower.includes('whatsapp')) {
      estimatedIntegrations += 1;
    }

    // Determinar complejidad
    let complexity: 'simple' | 'medium' | 'complex' = 'medium';
    if (estimatedSections > 10 || estimatedFunctions > 8 || estimatedIntegrations > 2) {
      complexity = 'complex';
    } else if (estimatedSections < 5 && estimatedFunctions < 4 && estimatedIntegrations === 0) {
      complexity = 'simple';
    }

    return {
      type: 'custom',
      estimatedSections,
      estimatedFunctions,
      estimatedIntegrations,
      pricing: {
        total: 0, // Se calculará después
        breakdown: [],
      },
    };
  }
}
