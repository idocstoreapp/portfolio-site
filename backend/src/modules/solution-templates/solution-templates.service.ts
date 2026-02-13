import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SolutionTemplateDto, SolutionTemplateWithModulesDto } from './dto/solution-template.dto';

@Injectable()
export class SolutionTemplatesService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Obtiene todos los templates activos
   */
  async getAllTemplates(includeInactive: boolean = false): Promise<SolutionTemplateDto[]> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    
    let query = supabase
      .from('solution_templates')
      .select('*')
      .order('display_order', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching solution templates: ${error.message}`);
    }

    return (data || []).map(item => this.mapToDto(item));
  }

  /**
   * Obtiene un template por ID
   */
  async getTemplateById(id: string): Promise<SolutionTemplateDto> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('solution_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching solution template: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Solution template with id ${id} not found`);
    }

    return this.mapToDto(data);
  }

  /**
   * Obtiene un template por slug
   */
  async getTemplateBySlug(slug: string): Promise<SolutionTemplateDto> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('solution_templates')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      throw new Error(`Error fetching solution template: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Solution template with slug ${slug} not found`);
    }

    return this.mapToDto(data);
  }

  /**
   * Obtiene un template con sus módulos
   */
  async getTemplateWithModules(id: string): Promise<SolutionTemplateWithModulesDto> {
    const template = await this.getTemplateById(id);
    
    // Obtener módulos del template
    const supabase = this.supabaseService.getAdminClient();
    const { data: modules, error } = await supabase
      .from('solution_modules')
      .select('*')
      .eq('solution_template_id', id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn(`Error fetching modules for template ${id}: ${error.message}`);
    }

    return {
      ...template,
      modules: (modules || []).map(module => ({
        id: module.id,
        created_at: module.created_at,
        updated_at: module.updated_at,
        code: module.code,
        name: module.name,
        description: module.description,
        category: module.category,
        solution_template_id: module.solution_template_id,
        base_price: parseFloat(module.base_price) || 0,
        is_required: module.is_required || false,
        manual_title: module.manual_title,
        manual_description: module.manual_description,
        manual_instructions: module.manual_instructions,
        manual_screenshots: module.manual_screenshots,
        is_active: module.is_active,
        display_order: module.display_order || 0,
        estimated_hours: parseFloat(module.estimated_hours) || 0,
      })),
    };
  }

  /**
   * Mapea datos de Supabase a DTO
   */
  private mapToDto(data: any): SolutionTemplateDto {
    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      slug: data.slug,
      name: data.name,
      description: data.description,
      icon: data.icon,
      base_price: parseFloat(data.base_price) || 0,
      currency: data.currency || 'USD',
      is_active: data.is_active !== false,
      display_order: data.display_order || 0,
      marketing_content: data.marketing_content,
    };
  }
}
