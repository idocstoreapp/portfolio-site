import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class ClientsService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllClients(page: number = 1, limit: number = 20) {
    const supabase = this.supabaseService.getClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { count } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

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
}


