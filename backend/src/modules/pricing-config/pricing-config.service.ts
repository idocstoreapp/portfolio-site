import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

export interface PricingConfig {
  id: string;
  price_type: 'template' | 'module' | 'customization_hour' | 'revision' | 'support_hour' | 'maintenance_month';
  item_id?: string;
  item_code?: string;
  base_price: number;
  currency: string;
  is_active: boolean;
  effective_from?: string;
  effective_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class PricingConfigService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllPricingConfigs(): Promise<PricingConfig[]> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('pricing_config')
      .select('*')
      .eq('is_active', true)
      .order('price_type', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching pricing configs: ${error.message}`);
    }

    return data || [];
  }

  async getPricingConfigByType(priceType: string, itemId?: string, itemCode?: string): Promise<PricingConfig | null> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    let query = supabase
      .from('pricing_config')
      .select('*')
      .eq('price_type', priceType)
      .eq('is_active', true);

    if (itemId) {
      query = query.eq('item_id', itemId);
    } else if (itemCode) {
      query = query.eq('item_code', itemCode);
    }

    const { data, error } = await query
      .order('effective_from', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error fetching pricing config: ${error.message}`);
    }

    return data;
  }

  async createPricingConfig(config: Partial<PricingConfig>): Promise<PricingConfig> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('pricing_config')
      .insert(config)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating pricing config: ${error.message}`);
    }

    return data;
  }

  async updatePricingConfig(id: string, updates: Partial<PricingConfig>): Promise<PricingConfig> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('pricing_config')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating pricing config: ${error.message}`);
    }

    return data;
  }

  async deletePricingConfig(id: string): Promise<void> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { error } = await supabase
      .from('pricing_config')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting pricing config: ${error.message}`);
    }
  }
}
