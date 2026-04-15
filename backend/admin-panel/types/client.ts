export interface Client {
  id: string;
  created_at: string;
  updated_at?: string;
  
  // Información básica
  nombre: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  
  // Relaciones
  diagnostico_id?: string;
  
  // Estado y clasificación
  estado: 'lead' | 'cliente' | 'activo' | 'inactivo';
  tags?: string[];
  notas?: string;
  
  // Métricas (calculadas)
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
  active_maintenance_orders?: number;
}

export interface ClientListResponse {
  success: boolean;
  data: Client[];
  total: number;
  page: number;
  limit: number;
}

export interface ClientResponse {
  success: boolean;
  data: Client;
}

export interface CreateClientRequest {
  nombre: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  estado?: 'lead' | 'cliente' | 'activo' | 'inactivo';
  tags?: string[];
  notas?: string;
}

export interface UpdateClientRequest {
  nombre?: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  estado?: 'lead' | 'cliente' | 'activo' | 'inactivo';
  tags?: string[];
  notas?: string;
}

export interface ClientOrderHistory {
  id: string;
  order_number: string;
  order_type?: string;
  status: string;
  total_price: number;
  created_at: string;
  completed_at?: string;
}

export interface ClientProjectHistory {
  id: string;
  order_number: string;
  project_type?: string;
  status: string;
  total_price: number;
  created_at: string;
  completed_at?: string;
  scope_description?: string;
}

export interface ClientDetail extends Client {
  orders?: ClientOrderHistory[];
  projects?: ClientProjectHistory[];
  maintenance_orders?: ClientOrderHistory[];
}
