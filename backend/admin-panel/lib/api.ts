const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
// Asegurar que la URL tenga protocolo (evita recibir HTML en lugar de JSON)
const BACKEND_URL =
  rawBackendUrl.startsWith('http://') || rawBackendUrl.startsWith('https://')
    ? rawBackendUrl.replace(/\/$/, '')
    : `https://${rawBackendUrl.replace(/\/$/, '')}`;

// Log para debugging
if (typeof window !== 'undefined') {
  console.log('🔧 [ADMIN] BACKEND_URL configured:', BACKEND_URL);
  if (BACKEND_URL.startsWith('http://localhost') && window.location.hostname !== 'localhost') {
    console.warn(
      '⚠️ [ADMIN] En producción debes definir NEXT_PUBLIC_BACKEND_URL con la URL de tu backend (ej. Railway). ' +
      'En Vercel: Project → Settings → Environment Variables → NEXT_PUBLIC_BACKEND_URL → Redeploy.'
    );
  }
}

export interface Diagnostic {
  id: string;
  created_at: string;
  nombre?: string;
  email?: string;
  empresa?: string;
  telefono?: string;
  tipo_empresa: string;
  nivel_digital: string;
  objetivos: string[];
  tamano: string;
  necesidades_adicionales?: string[];
  solucion_principal: string;
  soluciones_complementarias?: string[];
  urgencia: 'high' | 'medium' | 'low';
  match_score?: number;
  estado: 'nuevo' | 'contactado' | 'cotizando' | 'proyecto' | 'cerrado';
  asignado_a?: string;
  notas?: string;
  costo_real?: number;
  trabajo_real_horas?: number;
  fecha_aprobacion?: string;
  aprobado_por?: string;
}

export interface DiagnosticListResponse {
  success: boolean;
  data: Diagnostic[];
  total: number;
  page: number;
  limit: number;
}

export interface DiagnosticResponse {
  success: boolean;
  data: Diagnostic;
}

export interface UpdateDiagnosticRequest {
  status: string;
  asignadoA?: string;
  notas?: string;
  costoReal?: number;
  trabajoRealHoras?: number;
  aprobadoPor?: string;
}

/**
 * Obtiene la lista de diagnósticos con paginación
 */
export async function getDiagnostics(
  page: number = 1,
  limit: number = 20,
  filters?: {
    estado?: string;
    tipoEmpresa?: string;
    search?: string;
  }
): Promise<DiagnosticListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.estado) {
    params.append('estado', filters.estado);
  }
  if (filters?.tipoEmpresa) {
    params.append('tipoEmpresa', filters.tipoEmpresa);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const url = `${BACKEND_URL}/api/diagnostic?${params.toString()}`;
  console.log('🔍 [ADMIN] Fetching diagnostics from:', url);
  console.log('🔍 [ADMIN] BACKEND_URL:', BACKEND_URL);

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [ADMIN] Error response:', response.status, response.statusText);
      console.error('❌ [ADMIN] Error body:', errorText);
      throw new Error(`Error fetching diagnostics: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [ADMIN] Diagnostics fetched:', data.total || 0, 'total');
    return data;
  } catch (error) {
    console.error('❌ [ADMIN] Fetch error:', error);
    throw error;
  }
}

/**
 * Obtiene un diagnóstico por ID
 */
export async function getDiagnostic(id: string): Promise<DiagnosticResponse> {
  const response = await fetch(`${BACKEND_URL}/api/diagnostic/${id}`);
  
  if (!response.ok) {
    throw new Error(`Error fetching diagnostic: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Actualiza un diagnóstico
 */
export async function updateDiagnostic(
  id: string,
  data: UpdateDiagnosticRequest
): Promise<DiagnosticResponse> {
  const response = await fetch(`${BACKEND_URL}/api/diagnostic/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error updating diagnostic: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene el resultado procesado de un diagnóstico
 */
export async function getDiagnosticResult(id: string) {
  const response = await fetch(`${BACKEND_URL}/api/diagnostic/${id}/result`);
  
  if (!response.ok) {
    throw new Error(`Error fetching diagnostic result: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// ORDERS API
// ============================================

import type {
  Order,
  OrderListResponse,
  OrderResponse,
  CreateOrderRequest,
  CreateOrderFromDiagnosticRequest,
  UpdateOrderRequest,
  OrderStatus,
} from '@/types/order';

/**
 * Obtiene la lista de órdenes con paginación
 */
export async function getOrders(
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: OrderStatus | string;
    projectType?: string;
    search?: string;
  }
): Promise<OrderListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.projectType) {
    params.append('projectType', filters.projectType);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const url = `${BACKEND_URL}/api/orders?${params.toString()}`;
  console.log('🔍 [ADMIN] Fetching orders from:', url);

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [ADMIN] Error response:', response.status, response.statusText);
      console.error('❌ [ADMIN] Error body:', errorText);
      throw new Error(`Error fetching orders: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [ADMIN] Orders fetched:', data.total || 0, 'total');
    return data;
  } catch (error) {
    console.error('❌ [ADMIN] Fetch error:', error);
    throw error;
  }
}

/**
 * Obtiene una orden por ID
 */
export async function getOrder(id: string): Promise<OrderResponse> {
  const response = await fetch(`${BACKEND_URL}/api/orders/${id}`);
  
  if (!response.ok) {
    throw new Error(`Error fetching order: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Crea una nueva orden
 */
export async function createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
  const response = await fetch(`${BACKEND_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error creating order: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Crea una orden desde un diagnóstico
 */
export async function createOrderFromDiagnostic(
  data: CreateOrderFromDiagnosticRequest
): Promise<OrderResponse> {
  const response = await fetch(`${BACKEND_URL}/api/orders/from-diagnostic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error creating order from diagnostic: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Actualiza una orden
 */
export async function updateOrder(
  id: string,
  data: UpdateOrderRequest
): Promise<OrderResponse> {
  const response = await fetch(`${BACKEND_URL}/api/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error updating order: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Duplica una orden
 */
export async function duplicateOrder(id: string): Promise<OrderResponse> {
  const response = await fetch(`${BACKEND_URL}/api/orders/${id}/duplicate`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error duplicating order: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Elimina una orden
 */
export async function deleteOrder(id: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/orders/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error deleting order: ${response.statusText}`);
  }
}

// ============================================
// SOLUTION TEMPLATES & MODULES API
// ============================================

export interface Feature {
  name: string;
  description: string;
  included: boolean;
  category: 'core' | 'optional';
  module_id?: string;
  price?: number;
}

export interface SolutionTemplate {
  id: string;
  slug: string;
  name: string;
  description?: string;
  description_detailed?: string;
  features_list?: Feature[];
  included_modules_default?: string[];
  base_functionality?: string;
  is_prefabricated: boolean;
  estimated_delivery_days?: number;
  use_cases?: string[];
  screenshots_urls?: string[];
  icon?: string;
  base_price: number;
  currency: string;
  is_active: boolean;
  modules?: SolutionModule[];
}

export interface SolutionModule {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  base_price: number;
  is_required: boolean;
  is_active: boolean;
  manual_title?: string;
  manual_description?: string;
  manual_instructions?: string;
  display_order: number;
  estimated_hours: number;
  solution_template_id?: string;
}

/**
 * Obtiene todos los solution templates
 */
export async function getSolutionTemplates(): Promise<{ success: boolean; data: SolutionTemplate[] }> {
  const response = await fetch(`${BACKEND_URL}/api/solution-templates`);
  
  if (!response.ok) {
    throw new Error(`Error fetching solution templates: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene un solution template por ID con sus módulos
 */
export async function getSolutionTemplate(id: string): Promise<{ success: boolean; data: SolutionTemplate }> {
  const response = await fetch(`${BACKEND_URL}/api/solution-templates/${id}/with-modules`);
  
  if (!response.ok) {
    throw new Error(`Error fetching solution template: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene todos los solution modules (opcionalmente filtrados por template)
 */
export async function getSolutionModules(templateId?: string): Promise<{ success: boolean; data: SolutionModule[] }> {
  const url = templateId 
    ? `${BACKEND_URL}/api/solution-modules?solutionTemplateId=${templateId}`
    : `${BACKEND_URL}/api/solution-modules`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching solution modules: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// PRICING CONFIG API
// ============================================

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

export async function getPricingConfigs(priceType?: string): Promise<{ success: boolean; data: PricingConfig[] }> {
  const url = priceType 
    ? `${BACKEND_URL}/api/pricing-config?price_type=${priceType}`
    : `${BACKEND_URL}/api/pricing-config`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching pricing configs: ${response.statusText}`);
  }

  return response.json();
}

export async function createPricingConfig(config: Partial<PricingConfig>): Promise<{ success: boolean; data: PricingConfig }> {
  const response = await fetch(`${BACKEND_URL}/api/pricing-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  
  if (!response.ok) {
    throw new Error(`Error creating pricing config: ${response.statusText}`);
  }

  return response.json();
}

export async function updatePricingConfig(id: string, updates: Partial<PricingConfig>): Promise<{ success: boolean; data: PricingConfig }> {
  const response = await fetch(`${BACKEND_URL}/api/pricing-config/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error(`Error updating pricing config: ${response.statusText}`);
  }

  return response.json();
}

export async function deletePricingConfig(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${BACKEND_URL}/api/pricing-config/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error deleting pricing config: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// LEGAL TEMPLATES API
// ============================================

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

export async function getLegalTemplates(category?: string): Promise<{ success: boolean; data: LegalTemplate[] }> {
  const url = category 
    ? `${BACKEND_URL}/api/legal-templates?category=${category}`
    : `${BACKEND_URL}/api/legal-templates`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching legal templates: ${response.statusText}`);
  }

  return response.json();
}

export async function getDefaultLegalTemplate(category: string): Promise<{ success: boolean; data: LegalTemplate | null }> {
  const response = await fetch(`${BACKEND_URL}/api/legal-templates/default/${category}`);
  
  if (!response.ok) {
    throw new Error(`Error fetching default legal template: ${response.statusText}`);
  }

  return response.json();
}

export async function createLegalTemplate(template: Partial<LegalTemplate>): Promise<{ success: boolean; data: LegalTemplate }> {
  const response = await fetch(`${BACKEND_URL}/api/legal-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  });
  
  if (!response.ok) {
    throw new Error(`Error creating legal template: ${response.statusText}`);
  }

  return response.json();
}

export async function updateLegalTemplate(id: string, updates: Partial<LegalTemplate>): Promise<{ success: boolean; data: LegalTemplate }> {
  const response = await fetch(`${BACKEND_URL}/api/legal-templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error(`Error updating legal template: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteLegalTemplate(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${BACKEND_URL}/api/legal-templates/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error deleting legal template: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// CHANGE ORDERS API
// ============================================

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

export async function getChangeOrdersByOrderId(orderId: string): Promise<{ success: boolean; data: ChangeOrder[] }> {
  const response = await fetch(`${BACKEND_URL}/api/change-orders/order/${orderId}`);
  
  if (!response.ok) {
    // Si no hay change orders, retornar array vacío en lugar de error
    if (response.status === 404) {
      return { success: true, data: [] };
    }
    throw new Error(`Error fetching change orders: ${response.statusText}`);
  }

  return response.json();
}

export async function createChangeOrder(changeOrder: Partial<ChangeOrder>): Promise<{ success: boolean; data: ChangeOrder }> {
  const response = await fetch(`${BACKEND_URL}/change-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changeOrder),
  });
  
  if (!response.ok) {
    throw new Error(`Error creating change order: ${response.statusText}`);
  }

  return response.json();
}

export async function updateChangeOrder(id: string, updates: Partial<ChangeOrder>): Promise<{ success: boolean; data: ChangeOrder }> {
  const response = await fetch(`${BACKEND_URL}/change-orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error(`Error updating change order: ${response.statusText}`);
  }

  return response.json();
}

export async function approveChangeOrder(id: string, approvedBy: string): Promise<{ success: boolean; data: ChangeOrder }> {
  const response = await fetch(`${BACKEND_URL}/api/change-orders/${id}/approve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved_by: approvedBy }),
  });
  
  if (!response.ok) {
    throw new Error(`Error approving change order: ${response.statusText}`);
  }

  return response.json();
}

export async function rejectChangeOrder(id: string, reason: string): Promise<{ success: boolean; data: ChangeOrder }> {
  const response = await fetch(`${BACKEND_URL}/api/change-orders/${id}/reject`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  
  if (!response.ok) {
    throw new Error(`Error rejecting change order: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteChangeOrder(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${BACKEND_URL}/api/change-orders/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error deleting change order: ${response.statusText}`);
  }

  return response.json();
}



