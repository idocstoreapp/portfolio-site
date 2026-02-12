/**
 * Cliente API para comunicarse con el backend Nest.js
 * 
 * Este cliente maneja todas las peticiones al backend,
 * incluyendo creación y obtención de diagnósticos.
 */

// Detectar la URL del backend según el entorno
const getBackendUrl = () => {
  // Prioridad 1: Variable de entorno explícita (siempre usar si está definida)
  if (import.meta.env.PUBLIC_BACKEND_URL) {
    console.log('🔧 [BACKEND] Using PUBLIC_BACKEND_URL:', import.meta.env.PUBLIC_BACKEND_URL);
    return import.meta.env.PUBLIC_BACKEND_URL;
  }
  
  // Prioridad 2: En desarrollo, usar localhost
  if (import.meta.env.DEV) {
    console.log('🔧 [BACKEND] Development mode, using localhost:3000');
    return 'http://localhost:3000';
  }
  
  // Prioridad 3: En producción sin variable de entorno, usar la misma URL base
  // Esto funciona si el backend está en la misma URL (ej: API routes de Vercel)
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('🔧 [BACKEND] Production mode, using origin:', origin);
    return origin;
  }
  
  // Fallback: solo en casos extremos
  console.warn('⚠️ [BACKEND] No backend URL configured, using localhost fallback');
  return 'http://localhost:3000';
};

const BACKEND_URL = getBackendUrl();
console.log('🚀 [BACKEND] Final BACKEND_URL:', BACKEND_URL);

export interface DiagnosticRequest {
  tipoEmpresa: string;
  nivelDigital?: string;
  objetivos?: string[];
  tamano?: string;
  necesidadesAdicionales?: string[];
  // Nuevos campos del diagnóstico mejorado
  businessType?: string;
  sector?: string;
  operacionActual?: string;
  situacionActual?: string;
  dolorPrincipal?: string;
  tipoNegocio?: string;
  nombre?: string;
  email?: string;
  empresa?: string;
  telefono?: string;
  // Campos del sistema conversacional
  summary?: any;
  insights?: any[];
  personalizedMessage?: any;
  currentSituation?: any;
  opportunities?: any[];
  operationalImpact?: any;
  futureVision?: any;
  // Permitir campos adicionales dinámicos
  [key: string]: any;
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
 * Si el backend Nest.js no está disponible, usa la API route de Astro
 */
export async function createDiagnostic(
  data: DiagnosticRequest
): Promise<DiagnosticResponse> {
  try {
    // Log crítico antes de enviar
    console.log('🚨 [BACKEND CLIENT] Sending to backend:', {
      hasCurrentSituation: !!data.currentSituation,
      hasOpportunities: !!data.opportunities,
      opportunitiesIsArray: Array.isArray(data.opportunities),
      opportunitiesLength: data.opportunities?.length || 0,
      hasOperationalImpact: !!data.operationalImpact,
      hasFutureVision: !!data.futureVision,
      allKeys: Object.keys(data),
      dataSize: JSON.stringify(data).length
    });
    
    // Intentar primero con el backend Nest.js
    try {
    const response = await fetch(`${BACKEND_URL}/api/diagnostic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (nestError: any) {
      // Si falla, usar la API route de Astro como fallback
      console.log('⚠️ [BACKEND CLIENT] Nest.js backend not available, using Astro API route');
    }
    
    // Fallback: usar la API route de Astro
    const astroApiUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/diagnostico`
      : '/api/diagnostico';
    
    console.log('🔄 [BACKEND CLIENT] Using Astro API route:', astroApiUrl);
    
    const response = await fetch(astroApiUrl, {
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
    
    // La API route de Astro retorna un formato diferente, adaptarlo
    if (result.success && result.data) {
      // Generar un ID único para el diagnóstico
      const diagnosticId = `astro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Guardar en localStorage para poder recuperarlo después
      if (typeof window !== 'undefined') {
        const diagnosticData = {
          id: diagnosticId,
          ...result.data,
          selectedServices: data.selectedServices,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem(`diagnostic-${diagnosticId}`, JSON.stringify(diagnosticData));
      }
      
      return {
        success: true,
        data: {
          id: diagnosticId,
          created_at: new Date().toISOString(),
          tipo_empresa: data.tipoEmpresa || data.businessType || '',
          nivel_digital: data.nivelDigital || '',
          objetivos: data.objetivos || [],
          tamano: data.tamano || '',
          necesidades_adicionales: data.necesidadesAdicionales || [],
          nombre: data.nombre,
          empresa: data.empresa,
          email: data.email,
          solucion_principal: '',
          soluciones_complementarias: [],
          urgencia: 'medium' as const,
          match_score: 0,
          estado: 'nuevo',
        }
      };
    }
    
    return result;
  } catch (error: any) {
    console.error('Error creating diagnostic:', error);
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
