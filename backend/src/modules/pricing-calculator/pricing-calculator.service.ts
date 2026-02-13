import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

export interface PricingSpecs {
  sections?: number;
  functions?: number;
  integrations?: number;
  pages?: number;
  catalogItems?: number;
  hasEcommerce?: boolean;
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface PricingRule {
  id: string;
  rule_type: string;
  rule_name: string;
  description?: string;
  base_price: number;
  unit: string;
  multiplier: number;
  complexity_multipliers: {
    simple?: number;
    medium?: number;
    complex?: number;
  };
}

@Injectable()
export class PricingCalculatorService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Calcula el pricing para una app personalizada
   */
  async calculateCustomAppPricing(specs: PricingSpecs): Promise<{
    base: number;
    sections: number;
    functions: number;
    integrations: number;
    total: number;
    breakdown: Array<{ name: string; quantity: number; unitPrice: number; total: number }>;
  }> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const complexity = specs.complexity || 'medium';
    const breakdown: Array<{ name: string; quantity: number; unitPrice: number; total: number }> = [];

    // Obtener reglas de pricing
    const { data: rules, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Error fetching pricing rules: ${error.message}`);
    }

    if (!rules || rules.length === 0) {
      throw new Error('No pricing rules found');
    }

    let total = 0;
    const basePrice = 200000; // Precio base para app personalizada
    total += basePrice;
    breakdown.push({
      name: 'Precio Base App Personalizada',
      quantity: 1,
      unitPrice: basePrice,
      total: basePrice,
    });

    // Calcular precio de secciones
    if (specs.sections && specs.sections > 0) {
      const sectionRule = rules.find(r => r.rule_type === 'section' && r.rule_name.includes('Básica'));
      if (sectionRule) {
        const multiplier = sectionRule.complexity_multipliers?.[complexity] || 1.0;
        const unitPrice = sectionRule.base_price * multiplier;
        const sectionsTotal = specs.sections * unitPrice;
        total += sectionsTotal;
        breakdown.push({
          name: `Secciones (${specs.sections})`,
          quantity: specs.sections,
          unitPrice: unitPrice,
          total: sectionsTotal,
        });
      }
    }

    // Calcular precio de funciones
    if (specs.functions && specs.functions > 0) {
      const functionRule = rules.find(r => r.rule_type === 'function' && r.rule_name.includes('CRUD Básica'));
      if (functionRule) {
        const multiplier = functionRule.complexity_multipliers?.[complexity] || 1.0;
        const unitPrice = functionRule.base_price * multiplier;
        const functionsTotal = specs.functions * unitPrice;
        total += functionsTotal;
        breakdown.push({
          name: `Funciones (${specs.functions})`,
          quantity: specs.functions,
          unitPrice: unitPrice,
          total: functionsTotal,
        });
      }
    }

    // Calcular precio de integraciones
    if (specs.integrations && specs.integrations > 0) {
      const integrationRule = rules.find(r => r.rule_type === 'integration' && r.rule_name.includes('Pasarela'));
      if (integrationRule) {
        const multiplier = integrationRule.complexity_multipliers?.[complexity] || 1.0;
        const unitPrice = integrationRule.base_price * multiplier;
        const integrationsTotal = specs.integrations * unitPrice;
        total += integrationsTotal;
        breakdown.push({
          name: `Integraciones (${specs.integrations})`,
          quantity: specs.integrations,
          unitPrice: unitPrice,
          total: integrationsTotal,
        });
      }
    }

    return {
      base: basePrice,
      sections: specs.sections || 0,
      functions: specs.functions || 0,
      integrations: specs.integrations || 0,
      total,
      breakdown,
    };
  }

  /**
   * Calcula el pricing para un sitio web
   */
  async calculateWebPricing(specs: PricingSpecs): Promise<{
    base: number;
    pages: number;
    catalogItems?: number;
    total: number;
    breakdown: Array<{ name: string; quantity: number; unitPrice: number; total: number }>;
  }> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const complexity = specs.complexity || 'medium';
    const breakdown: Array<{ name: string; quantity: number; unitPrice: number; total: number }> = [];

    // Obtener reglas de pricing
    const { data: rules, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Error fetching pricing rules: ${error.message}`);
    }

    let total = 0;
    const basePrice = 120000; // Precio base para sitio web
    total += basePrice;
    breakdown.push({
      name: 'Precio Base Sitio Web',
      quantity: 1,
      unitPrice: basePrice,
      total: basePrice,
    });

    // Calcular precio de páginas
    if (specs.pages && specs.pages > 0) {
      const pageRule = rules.find(r => r.rule_type === 'page' && r.rule_name.includes('Básica'));
      if (pageRule) {
        const multiplier = pageRule.complexity_multipliers?.[complexity] || 1.0;
        const unitPrice = pageRule.base_price * multiplier;
        const pagesTotal = specs.pages * unitPrice;
        total += pagesTotal;
        breakdown.push({
          name: `Páginas (${specs.pages})`,
          quantity: specs.pages,
          unitPrice: unitPrice,
          total: pagesTotal,
        });
      }
    }

    // Calcular precio de items de catálogo (si es e-commerce)
    if (specs.hasEcommerce && specs.catalogItems && specs.catalogItems > 0) {
      const catalogRule = rules.find(r => r.rule_type === 'catalog_item' && r.rule_name.includes('Básico'));
      if (catalogRule) {
        const multiplier = catalogRule.complexity_multipliers?.[complexity] || 1.0;
        const unitPrice = catalogRule.base_price * multiplier;
        const catalogTotal = specs.catalogItems * unitPrice;
        total += catalogTotal;
        breakdown.push({
          name: `Items de Catálogo (${specs.catalogItems})`,
          quantity: specs.catalogItems,
          unitPrice: unitPrice,
          total: catalogTotal,
        });
      }
    }

    return {
      base: basePrice,
      pages: specs.pages || 0,
      catalogItems: specs.catalogItems,
      total,
      breakdown,
    };
  }

  /**
   * Obtiene todas las reglas de pricing activas
   */
  async getPricingRules(): Promise<PricingRule[]> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true)
      .order('rule_type', { ascending: true })
      .order('rule_name', { ascending: true });

    if (error) {
      throw new Error(`Error fetching pricing rules: ${error.message}`);
    }

    return (data || []).map(rule => ({
      id: rule.id,
      rule_type: rule.rule_type,
      rule_name: rule.rule_name,
      description: rule.description,
      base_price: parseFloat(rule.base_price),
      unit: rule.unit,
      multiplier: parseFloat(rule.multiplier || '1.0'),
      complexity_multipliers: rule.complexity_multipliers || {},
    }));
  }
}
