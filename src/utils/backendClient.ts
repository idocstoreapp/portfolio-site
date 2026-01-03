/**
 * Cliente API para comunicarse con el backend Nest.js
 * 
 * Este cliente maneja todas las peticiones al backend,
 * incluyendo creación y obtención de diagnósticos.
 */

const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3000';

export interface DiagnosticRequest {
  tipoEmpresa: string;
  nivelDigital?: string;
  objetivos?: string[];
  tamano?: string;
  necesidadesAdicionales?: string[];
  // Nuevos campos del diagnóstico mejorado
  businessType?: string;
  operacionActual?: string;
  situacionActual?: string;
  dolorPrincipal?: string;
  tipoNegocio?: string;
  nombre?: string;
  email?: string;
  empresa?: string;
  telefono?: string;
}

export interface DiagnosticData {
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
  necesidades_adicionales: string[];
  solucion_principal: string;
  soluciones_complementarias: string[];
  urgencia: 'high' | 'medium' | 'low';
  match_score: number;
  estado: string;
  asignado_a?: string;
  notas?: string;
  costo_real?: number;
  trabajo_real_horas?: number;
  fecha_aprobacion?: string;
  aprobado_por?: string;
}

export interface DiagnosticResponse {
  success: boolean;
  data: DiagnosticData;
}

export interface DiagnosticListResponse {
  success: boolean;
  data: DiagnosticData[];
  total: number;
  page: number;
  limit: number;
}

export interface DiagnosticResultResponse {
  success: boolean;
  data?: any;
  error?: string;
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
 * Crea un nuevo diagnóstico en el backend
 */
export async function createDiagnostic(
  data: DiagnosticRequest
): Promise<DiagnosticResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/diagnostic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Error HTTP: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error creating diagnostic:', error);
    
    // Detectar si el backend no está disponible
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('ERR_CONNECTION_REFUSED') ||
        error.name === 'TypeError') {
      throw new Error(
        'El servidor backend no está disponible. Por favor, asegúrate de que el backend Nest.js esté corriendo en http://localhost:3000'
      );
    }
    
    throw error;
  }
}

/**
 * Obtiene un diagnóstico por ID
 */
export async function getDiagnostic(id: string): Promise<DiagnosticResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/diagnostic/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Error HTTP: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error fetching diagnostic:', error);
    throw error;
  }
}

/**
 * Obtiene el resultado procesado de un diagnóstico (con soluciones completas)
 */
export async function getDiagnosticResult(id: string): Promise<DiagnosticResultResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/diagnostic/${id}/result`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Diagnóstico con ID ${id} no encontrado`);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error HTTP: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error fetching diagnostic result:', error);
    throw error;
  }
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
  try {
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
  } catch (error: any) {
    console.error('Error fetching diagnostics:', error);
    throw error;
  }
}

/**
 * Actualiza un diagnóstico
 */
export async function updateDiagnostic(
  id: string,
  data: UpdateDiagnosticRequest
): Promise<DiagnosticResponse> {
  try {
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
  } catch (error: any) {
    console.error('Error updating diagnostic:', error);
    throw error;
  }
}
