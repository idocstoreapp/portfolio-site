import { OrderStatus, ProjectType } from './create-order.dto';

export class OrderDto {
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
}

export class OrderWithRelationsDto extends OrderDto {
  // Relaciones expandidas (opcional)
  diagnostico?: any;
  cliente?: any;
  solution_template?: any;
  modules?: any[];
  terms?: any;
}
