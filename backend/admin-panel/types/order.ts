export enum OrderStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  IN_DEVELOPMENT = 'in_development',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProjectType {
  WEB = 'web',
  SISTEMA = 'sistema',
  APP = 'app',
  MARKETING = 'marketing',
  OTRO = 'otro',
}

export interface OrderModule {
  id: string;
  order_id: string;
  solution_module_id: string;
  module_code: string;
  module_name: string;
  module_description?: string;
  base_price: number;
  custom_price?: number;
  is_included: boolean;
  display_order: number;
}

export interface OrderTerms {
  id: string;
  order_id: string;
  warranty_text?: string;
  maintenance_policy?: string;
  exclusions_text?: string;
  automatic_clause?: string;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  order_number: string;
  
  // Relaciones
  diagnostico_id?: string;
  cliente_id?: string;
  solution_template_id?: string;
  created_by?: string;
  
  // Información del cliente
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_company?: string;
  
  // Estado y tipo
  status: OrderStatus;
  project_type: ProjectType;
  
  // Alcance
  scope_description?: string;
  included_modules?: string[];
  excluded_modules?: string[];
  custom_features?: string;
  
  // Personalización
  branding_logo_url?: string;
  branding_colors?: any;
  branding_notes?: string;
  
  // Aspectos económicos
  base_price: number;
  modules_price: number;
  custom_adjustments: number;
  discount_amount: number;
  total_price: number;
  currency: string;
  
  // Términos de pago
  payment_terms?: string;
  payment_schedule?: any[];
  
  // Términos legales
  warranty_text?: string;
  maintenance_policy?: string;
  exclusions_text?: string;
  
  // Fechas
  sent_at?: string;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  estimated_start_date?: string;
  estimated_completion_date?: string;
  
  // Archivos generados
  contract_pdf_url?: string;
  manual_pdf_url?: string;
  contract_generated_at?: string;
  manual_generated_at?: string;
  
  // Notas
  internal_notes?: string;
  client_notes?: string;
  
  // Metadata
  version: number;
  parent_order_id?: string;
  
  // Relaciones expandidas (opcional)
  modules?: OrderModule[];
  terms?: OrderTerms;
}

export interface CreateOrderRequest {
  diagnostico_id?: string;
  cliente_id?: string;
  solution_template_id?: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_company?: string;
  project_type: ProjectType;
  scope_description?: string;
  included_modules?: string[];
  excluded_modules?: string[];
  custom_features?: string;
  branding_logo_url?: string;
  branding_colors?: any;
  branding_notes?: string;
  base_price: number;
  modules_price?: number;
  custom_adjustments?: number;
  discount_amount?: number;
  payment_terms?: string;
  payment_schedule?: any[];
  warranty_text?: string;
  maintenance_policy?: string;
  exclusions_text?: string;
  estimated_start_date?: string;
  estimated_completion_date?: string;
  internal_notes?: string;
  client_notes?: string;
}

export interface CreateOrderFromDiagnosticRequest {
  diagnostico_id: string;
  solution_template_id?: string;
  included_modules?: string[];
  excluded_modules?: string[];
  custom_features?: string;
  base_price?: number;
  modules_price?: number;
  custom_adjustments?: number;
  discount_amount?: number;
  payment_terms?: string;
  warranty_text?: string;
  maintenance_policy?: string;
  exclusions_text?: string;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  solution_template_id?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_company?: string;
  project_type?: ProjectType;
  scope_description?: string;
  included_modules?: string[];
  excluded_modules?: string[];
  custom_features?: string;
  base_price?: number;
  modules_price?: number;
  custom_adjustments?: number;
  discount_amount?: number;
  total_price?: number;
  payment_terms?: string;
  payment_schedule?: any[];
  warranty_text?: string;
  maintenance_policy?: string;
  exclusions_text?: string;
  estimated_start_date?: string;
  estimated_completion_date?: string;
  internal_notes?: string;
  client_notes?: string;
}

export interface OrderListResponse {
  success: boolean;
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}
