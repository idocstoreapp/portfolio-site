const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

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

  const response = await fetch(`${BACKEND_URL}/api/diagnostic?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Error fetching diagnostics: ${response.statusText}`);
  }

  return response.json();
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

