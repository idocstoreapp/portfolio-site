import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class ClientsService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllClients(page: number = 1, limit: number = 20, search?: string, estado?: string) {
    const supabase = this.supabaseService.getAdminClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });

    // Aplicar filtros
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,empresa.ilike.%${search}%`);
    }
    if (estado) {
      query = query.eq('estado', estado);
    }

    const { count } = await query;

    let dataQuery = supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    // Aplicar los mismos filtros a la consulta de datos
    if (search) {
      dataQuery = dataQuery.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,empresa.ilike.%${search}%`);
    }
    if (estado) {
      dataQuery = dataQuery.eq('estado', estado);
    }

    const { data, error } = await dataQuery;

    if (error) {
      throw new Error(`Error fetching clients: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  async getClientById(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching client: ${error.message}`);
    }

    if (!data) {
      throw new Error('Client not found');
    }

    return data;
  }

  async createClient(clientData: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('clientes')
      .insert(clientData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating client: ${error.message}`);
    }

    return data;
  }

  async updateClient(id: string, clientData: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('clientes')
      .update(clientData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating client: ${error.message}`);
    }

    if (!data) {
      throw new Error('Client not found');
    }

    return data;
  }

  async deleteClient(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting client: ${error.message}`);
    }

    return { success: true };
  }

  async getClientMetrics(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    // Llamar a la función de métricas
    const { data, error } = await supabase
      .rpc('get_cliente_metrics', { p_cliente_id: id });

    if (error) {
      throw new Error(`Error fetching client metrics: ${error.message}`);
    }

    // Obtener datos básicos del cliente
    const clientData = await this.getClientById(id);

    return {
      ...data?.[0] || {},
      cliente: clientData,
    };
  }

  async getClientOrders(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('cliente_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching client orders: ${error.message}`);
    }

    return data || [];
  }

  async getClientNotes(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('cliente_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching client notes: ${error.message}`);
    }

    return data || [];
  }

  async createClientNote(clienteId: string, noteData: any, createdBy?: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('client_notes')
      .insert({
        ...noteData,
        cliente_id: clienteId,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating client note: ${error.message}`);
    }

    return data;
  }

  async getClientInteractions(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('client_interactions')
      .select('*')
      .eq('cliente_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching client interactions: ${error.message}`);
    }

    return data || [];
  }

  async createClientInteraction(clienteId: string, interactionData: any, createdBy?: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('client_interactions')
      .insert({
        ...interactionData,
        cliente_id: clienteId,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating client interaction: ${error.message}`);
    }

    return data;
  }

  async getClientPayments(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('cliente_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching client payments: ${error.message}`);
    }

    return data || [];
  }

  async createPayment(paymentData: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating payment: ${error.message}`);
    }

    return data;
  }

  async updatePayment(id: string, paymentData: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('payments')
      .update(paymentData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating payment: ${error.message}`);
    }

    if (!data) {
      throw new Error('Payment not found');
    }

    return data;
  }
}




