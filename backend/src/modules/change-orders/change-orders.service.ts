import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

export interface ChangeOrder {
  id: string;
  order_id: string;
  change_order_number: string;
  title: string;
  description: string;
  reason?: string;
  estimated_hours?: number;
  estimated_cost: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_reason?: string;
  actual_hours?: number;
  actual_cost?: number;
  started_at?: string;
  completed_at?: string;
  internal_notes?: string;
  client_notes?: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ChangeOrdersService {
  constructor(private supabaseService: SupabaseService) {}

  private async generateChangeOrderNumber(): Promise<string> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    
    // Llamar a la función SQL que genera el número
    const { data, error } = await supabase.rpc('generate_change_order_number');

    if (error) {
      // Fallback: generar manualmente si la función falla
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('change_orders')
        .select('*', { count: 'exact', head: true })
        .like('change_order_number', `CO-${year}-%`);

      const sequence = ((count || 0) + 1).toString().padStart(3, '0');
      return `CO-${year}-${sequence}`;
    }

    return data;
  }

  async getChangeOrdersByOrderId(orderId: string): Promise<ChangeOrder[]> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('change_orders')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching change orders: ${error.message}`);
    }

    return data || [];
  }

  async getChangeOrderById(id: string): Promise<ChangeOrder | null> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('change_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching change order: ${error.message}`);
    }

    return data;
  }

  async createChangeOrder(changeOrder: Partial<ChangeOrder>): Promise<ChangeOrder> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const changeOrderNumber = await this.generateChangeOrderNumber();
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('change_orders')
      .insert({
        ...changeOrder,
        change_order_number: changeOrderNumber,
        currency: changeOrder.currency || 'CLP',
        status: changeOrder.status || 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating change order: ${error.message}`);
    }

    return data;
  }

  async updateChangeOrder(id: string, updates: Partial<ChangeOrder>): Promise<ChangeOrder> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('change_orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating change order: ${error.message}`);
    }

    return data;
  }

  async approveChangeOrder(id: string, approvedBy: string): Promise<ChangeOrder> {
    return this.updateChangeOrder(id, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
    });
  }

  async rejectChangeOrder(id: string, reason: string): Promise<ChangeOrder> {
    return this.updateChangeOrder(id, {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejected_reason: reason,
    });
  }

  async deleteChangeOrder(id: string): Promise<void> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const { error } = await supabase
      .from('change_orders')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting change order: ${error.message}`);
    }
  }
}
