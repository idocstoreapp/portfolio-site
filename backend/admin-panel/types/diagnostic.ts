export type DiagnosticStatus = 'nuevo' | 'contactado' | 'cotizando' | 'proyecto' | 'cerrado';
export type UrgencyLevel = 'high' | 'medium' | 'low';

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
  urgencia: UrgencyLevel;
  match_score?: number;
  estado: DiagnosticStatus;
  asignado_a?: string;
  notas?: string;
  costo_real?: number;
  trabajo_real_horas?: number;
  fecha_aprobacion?: string;
  aprobado_por?: string;
}

export interface DiagnosticFilters {
  estado?: DiagnosticStatus;
  tipoEmpresa?: string;
  urgencia?: UrgencyLevel;
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}




