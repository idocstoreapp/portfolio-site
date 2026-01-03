export class DiagnosticResultDto {
  id: string;
  created_at: string;
  
  // Información del cliente
  nombre?: string;
  email?: string;
  empresa?: string;
  telefono?: string;
  
  // Respuestas
  tipo_empresa: string;
  nivel_digital: string;
  objetivos: string[];
  tamano: string;
  necesidades_adicionales?: string[];
  
  // Resultado del motor
  solucion_principal: string;
  soluciones_complementarias?: string[];
  urgencia: 'high' | 'medium' | 'low';
  match_score?: number;
  
  // Estado
  estado: string;
  asignado_a?: string;
  notas?: string;
  
  // Costo y trabajo real
  costo_real?: number;
  trabajo_real_horas?: number;
  fecha_aprobacion?: string;
  aprobado_por?: string;
}

