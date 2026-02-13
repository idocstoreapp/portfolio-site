import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

export interface LegalTemplate {
  id: string;
  code: string;
  name: string;
  category: 'web' | 'app' | 'system' | 'marketing' | 'combined' | 'custom';
  warranty_text: string;
  warranty_days: number;
  maintenance_text?: string;
  maintenance_months: number;
  exclusions_text: string;
  exclusions_list?: any[];
  payment_terms_template?: string;
  intellectual_property: string;
  source_code_access: boolean;
  automatic_clause?: string;
  is_active: boolean;
  is_default: boolean;
  display_order: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class LegalTemplatesService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllTemplates(category?: string): Promise<LegalTemplate[]> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    let query = supabase
      .from('legal_templates')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching legal templates: ${error.message}`);
    }

    return data || [];
  }

  async getTemplateByCode(code: string): Promise<LegalTemplate | null> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('legal_templates')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching legal template: ${error.message}`);
    }

    return data;
  }

  async getDefaultTemplate(category: string): Promise<LegalTemplate | null> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('legal_templates')
      .select('*')
      .eq('category', category)
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching default template: ${error.message}`);
    }

    return data;
  }

  async createTemplate(template: Partial<LegalTemplate>): Promise<LegalTemplate> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('legal_templates')
      .insert(template)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating legal template: ${error.message}`);
    }

    return data;
  }

  async updateTemplate(id: string, updates: Partial<LegalTemplate>): Promise<LegalTemplate> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('legal_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating legal template: ${error.message}`);
    }

    return data;
  }

  async deleteTemplate(id: string): Promise<void> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { error } = await supabase
      .from('legal_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting legal template: ${error.message}`);
    }
  }
}
