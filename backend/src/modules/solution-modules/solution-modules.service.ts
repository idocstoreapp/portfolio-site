import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SolutionModuleDto } from './dto/solution-module.dto';

@Injectable()
export class SolutionModulesService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Obtiene todos los módulos activos
   */
  async getAllModules(filters?: {
    templateId?: string;
    category?: string;
    includeInactive?: boolean;
  }): Promise<SolutionModuleDto[]> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    
    let query = supabase
      .from('solution_modules')
      .select('*')
      .order('display_order', { ascending: true });

    if (!filters?.includeInactive) {
      query = query.eq('is_active', true);
    }

    if (filters?.templateId) {
      query = query.eq('solution_template_id', filters.templateId);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching solution modules: ${error.message}`);
    }

    return (data || []).map(item => this.mapToDto(item));
  }

  /**
   * Obtiene un módulo por ID
   */
  async getModuleById(id: string): Promise<SolutionModuleDto> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('solution_modules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching solution module: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Solution module with id ${id} not found`);
    }

    return this.mapToDto(data);
  }

  /**
   * Obtiene módulos por template ID
   */
  async getModulesByTemplateId(templateId: string): Promise<SolutionModuleDto[]> {
    return this.getAllModules({ templateId });
  }

  /**
   * Mapea datos de Supabase a DTO
   */
  private mapToDto(data: any): SolutionModuleDto {
    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      code: data.code,
      name: data.name,
      description: data.description,
      category: data.category,
      solution_template_id: data.solution_template_id,
      base_price: parseFloat(data.base_price) || 0,
      is_required: data.is_required || false,
      manual_title: data.manual_title,
      manual_description: data.manual_description,
      manual_instructions: data.manual_instructions,
      manual_screenshots: data.manual_screenshots,
      is_active: data.is_active !== false,
      display_order: data.display_order || 0,
      estimated_hours: parseFloat(data.estimated_hours) || 0,
    };
  }
}
