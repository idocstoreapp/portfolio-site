import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';
import { DiagnosticResultDto } from './dto/diagnostic-result.dto';
import { processDiagnostic, DiagnosticResult } from '../../../diagnostic-engine';
import { processEnhancedDiagnostic, DiagnosticEnvelope, EnhancedDiagnosticAnswers, BusinessType } from '../../../enhanced-diagnostic-engine';

// Funciones auxiliares para el sistema conversacional
function getSolutionTitleForSector(sector: string): string {
  const titles: Record<string, string> = {
    'restaurante': 'Sistema para Restaurantes',
    'servicio-tecnico': 'Sistema para Servicio Técnico',
    'taller': 'Sistema para Taller Mecánico',
    'fabrica': 'Sistema Cotizador / Fábrica',
    'comercio': 'Sistema para Comercio',
    'servicios': 'Sistema para Servicios Profesionales'
  };
  return titles[sector] || 'Sistema de Gestión Empresarial';
}

function getSolutionDescriptionForSector(sector: string): string {
  const descriptions: Record<string, string> = {
    'restaurante': 'Menú QR, POS, gestión de mesas y comandas. Deja el papel atrás.',
    'servicio-tecnico': 'Gestiona reparaciones, inventario, comisiones y clientes desde un solo sistema.',
    'taller': 'Organiza reparaciones, repuestos, comisiones y clientes de forma profesional.',
    'fabrica': 'Cotizaciones personalizadas con cálculo automático de costos reales.',
    'comercio': 'Sistema de gestión completo para tu comercio.',
    'servicios': 'Gestiona servicios, clientes y proyectos desde un solo sistema.'
  };
  return descriptions[sector] || 'Sistema de gestión que optimiza tus procesos.';
}

function getSolutionIconForSector(sector: string): string {
  const icons: Record<string, string> = {
    'restaurante': '🍽️',
    'servicio-tecnico': '🔧',
    'taller': '🚗',
    'fabrica': '🏭',
    'comercio': '🏪',
    'servicios': '💼'
  };
  return icons[sector] || '⚙️';
}

function calculateUrgencyFromSummary(summary?: any): 'high' | 'medium' | 'low' {
  if (!summary) return 'medium';
  
  const monthlySavings = summary.totalPotentialSavings?.moneyCost || 0;
  const timeSavings = summary.totalPotentialSavings?.timeHours || 0;
  
  if (monthlySavings > 500 || timeSavings > 15) return 'high';
  if (monthlySavings > 200 || timeSavings > 8) return 'medium';
  return 'low';
}

@Injectable()
export class DiagnosticService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Crea un nuevo diagnóstico y procesa el resultado
   */
  async createDiagnostic(createDiagnosticDto: CreateDiagnosticDto): Promise<DiagnosticResultDto> {
    try {
      console.log('🔄 DiagnosticService.createDiagnostic - Starting...');
      console.log('🔄 Input DTO:', JSON.stringify(createDiagnosticDto, null, 2));
      
      // Determinar si usar el motor conversacional, mejorado o el antiguo
      const useConversationalEngine = createDiagnosticDto.summary || 
                                      createDiagnosticDto.insights || 
                                      createDiagnosticDto.personalizedMessage;
      
      const useEnhancedEngine = !useConversationalEngine && (
        createDiagnosticDto.operacionActual || 
        createDiagnosticDto.dolorPrincipal || 
        createDiagnosticDto.situacionActual
      );

      let result: DiagnosticResult | DiagnosticEnvelope | any;
      let envelope: DiagnosticEnvelope | null = null;

      if (useConversationalEngine) {
        // Usar sistema conversacional (ya viene procesado del frontend)
        console.log('🔄 Using conversational diagnostic system...');
        
        // El frontend ya calculó summary, insights y personalizedMessage
        // Solo necesitamos guardar estos datos y retornarlos
        result = {
          qualifies: true,
          sector: createDiagnosticDto.sector || createDiagnosticDto.businessType || createDiagnosticDto.tipoEmpresa,
          summary: createDiagnosticDto.summary,
          insights: createDiagnosticDto.insights || [],
          personalizedMessage: createDiagnosticDto.personalizedMessage,
          // Generar solución principal basada en el sector
          primarySolution: {
            id: `sistema-${createDiagnosticDto.sector || createDiagnosticDto.tipoEmpresa}`,
            title: getSolutionTitleForSector(createDiagnosticDto.sector || createDiagnosticDto.tipoEmpresa),
            description: getSolutionDescriptionForSector(createDiagnosticDto.sector || createDiagnosticDto.tipoEmpresa),
            icon: getSolutionIconForSector(createDiagnosticDto.sector || createDiagnosticDto.tipoEmpresa),
            link: `/soluciones/${createDiagnosticDto.sector || createDiagnosticDto.tipoEmpresa}`,
            matchScore: 100,
            reason: 'Basado en tu diagnóstico, esta solución puede ayudarte a ahorrar tiempo y dinero.'
          },
          complementarySolutions: [],
          urgency: calculateUrgencyFromSummary(createDiagnosticDto.summary),
          nextSteps: {
            primary: {
              text: 'Solicitar validación operativa',
              link: `/contacto?from=diagnostico&sector=${createDiagnosticDto.sector || createDiagnosticDto.tipoEmpresa}`
            }
          }
        };
        
        console.log('✅ Conversational diagnostic processed. Sector:', result.sector);
      } else if (useEnhancedEngine) {
        // Usar motor mejorado
        console.log('🔄 Using enhanced diagnostic engine...');
        
        // Mapear tipoEmpresa al businessType del motor mejorado
        let businessType: BusinessType = 'otro';
        if ((createDiagnosticDto as any).businessType) {
          businessType = (createDiagnosticDto as any).businessType;
        } else {
          // Mapeo de tipos antiguos a nuevos
          const tipoMap: Record<string, BusinessType> = {
            'restaurante': 'restaurante',
            'servicio-tecnico': 'servicio-tecnico',
            'fabrica': 'fabrica',
            'otro': 'presencia-web',
          };
          businessType = tipoMap[createDiagnosticDto.tipoEmpresa] || 'otro';
        }
        
        // Construir objeto con TODAS las respuestas específicas del wizard dinámico
        // Esto permite que el motor genere recomendaciones muy específicas
        const enhancedAnswers: EnhancedDiagnosticAnswers = {
          businessType,
          operacionActual: createDiagnosticDto.operacionActual,
          nivelDigital: createDiagnosticDto.nivelDigital,
          situacionActual: createDiagnosticDto.situacionActual,
          dolorPrincipal: createDiagnosticDto.dolorPrincipal,
          objetivoPrincipal: createDiagnosticDto.objetivos,
          tipoNegocio: createDiagnosticDto.tipoNegocio,
          tamano: createDiagnosticDto.tamano as any,
          necesidadesAdicionales: createDiagnosticDto.necesidadesAdicionales,
          nombre: createDiagnosticDto.nombre,
          empresa: createDiagnosticDto.empresa,
        };

        // Agregar TODAS las propiedades adicionales del DTO que puedan ser respuestas específicas
        // Esto incluye respuestas como 'tiene-pos', 'tiene-mesas-meseros', 'menu-digital', etc.
        Object.keys(createDiagnosticDto).forEach(key => {
          if (!['tipoEmpresa', 'nivelDigital', 'objetivos', 'tamano', 'necesidadesAdicionales', 
                'operacionActual', 'situacionActual', 'dolorPrincipal', 'tipoNegocio', 'businessType',
                'nombre', 'email', 'empresa', 'telefono', 'ipAddress', 'userAgent'].includes(key)) {
            // Agregar la respuesta específica (puede venir en camelCase o con guiones)
            enhancedAnswers[key] = (createDiagnosticDto as any)[key];
          }
        });

        envelope = processEnhancedDiagnostic(enhancedAnswers);
        envelope.id = ''; // Se asignará después de guardar
        
        // Convertir envelope a formato compatible con DiagnosticResult para guardar en BD
        result = {
          qualifies: true,
          primarySolution: {
            id: envelope.recommendation.primarySolution.title.toLowerCase().replace(/\s+/g, '-'),
            ...envelope.recommendation.primarySolution
          },
          complementarySolutions: envelope.recommendation.complementarySolutions.map(s => ({
            id: s.title.toLowerCase().replace(/\s+/g, '-'),
            ...s,
            matchScore: 0
          })),
          personalizedMessage: envelope.personalizedMessage,
          urgency: envelope.urgency,
          nextSteps: envelope.nextSteps
        };
        
        console.log('✅ Enhanced diagnostic processed. Primary solution:', result.primarySolution.title);
      } else {
        // Usar motor antiguo (compatibilidad)
        console.log('🔄 Using legacy diagnostic engine...');
        const normalizedAnswers = {
          tipoEmpresa: createDiagnosticDto.tipoEmpresa as any,
          nivelDigital: createDiagnosticDto.nivelDigital as any,
          objetivos: createDiagnosticDto.objetivos || [],
          tamano: createDiagnosticDto.tamano as any,
          necesidadesAdicionales: createDiagnosticDto.necesidadesAdicionales,
        };

        result = processDiagnostic(normalizedAnswers);
        console.log('✅ Diagnostic processed. Primary solution:', result.primarySolution.id);
      }

      // Preparar datos para insertar en Supabase
      // Para el sistema conversacional, proporcionar valores por defecto para campos requeridos
      const diagnosticData: any = {
        nombre: createDiagnosticDto.nombre || null,
        email: createDiagnosticDto.email || null,
        empresa: createDiagnosticDto.empresa || null,
        telefono: createDiagnosticDto.telefono || null,
        tipo_empresa: createDiagnosticDto.tipoEmpresa || createDiagnosticDto.sector || createDiagnosticDto.businessType || 'otro',
        // Para diagnósticos conversacionales, usar valores por defecto si no están presentes
        nivel_digital: createDiagnosticDto.nivelDigital || (useConversationalEngine ? 'basica' : null),
        objetivos: createDiagnosticDto.objetivos || (useConversationalEngine ? ['organizar'] : []),
        tamano: createDiagnosticDto.tamano || (useConversationalEngine ? '1-5' : null),
        necesidades_adicionales: createDiagnosticDto.necesidadesAdicionales || [],
        solucion_principal: result.primarySolution.id || result.primarySolution.title.toLowerCase().replace(/\s+/g, '-'),
        soluciones_complementarias: result.complementarySolutions.map(s => s.id || s.title.toLowerCase().replace(/\s+/g, '-')),
        urgencia: result.urgency,
        match_score: result.primarySolution.matchScore,
        estado: 'nuevo',
        ip_address: createDiagnosticDto.ipAddress || null,
        user_agent: createDiagnosticDto.userAgent || null,
        source: 'web',
      };

      // Guardar campos adicionales del diagnóstico mejorado si existen
      if (envelope) {
        diagnosticData.operacion_actual = createDiagnosticDto.operacionActual || null;
        diagnosticData.dolor_principal = createDiagnosticDto.dolorPrincipal || null;
        diagnosticData.situacion_actual = createDiagnosticDto.situacionActual || null;
        diagnosticData.tipo_negocio = createDiagnosticDto.tipoNegocio || null;
        // Guardar el envelope completo como JSON para referencia futura
        diagnosticData.envelope_data = JSON.stringify(envelope);
      }

      // Guardar datos del sistema conversacional si existen
      if (useConversationalEngine) {
        // Guardar summary, insights y personalizedMessage en envelope_data
        // El sector se guarda dentro del envelope, no como columna separada
        diagnosticData.envelope_data = JSON.stringify({
          type: 'conversational',
          summary: createDiagnosticDto.summary,
          insights: createDiagnosticDto.insights,
          personalizedMessage: createDiagnosticDto.personalizedMessage,
          sector: createDiagnosticDto.sector || createDiagnosticDto.businessType || createDiagnosticDto.tipoEmpresa
        });
      }

      // Intentar guardar en Supabase si está configurado
      if (this.supabaseService.isConfigured()) {
        try {
          // Usar el cliente admin (service_role) para operaciones del backend
          // Esto evita problemas con Row Level Security (RLS)
          let supabase;
          try {
            supabase = this.supabaseService.getAdminClient();
            console.log('💾 Using admin client (service_role) for database operations');
          } catch {
            // Si no hay service_role_key, usar el cliente normal
            supabase = this.supabaseService.getClient();
            console.log('💾 Using regular client (anon_key) - may have RLS restrictions');
          }
          
          console.log('💾 Attempting to save diagnostic to Supabase...');
          console.log('💾 Diagnostic data:', JSON.stringify(diagnosticData, null, 2));
          
          const { data, error } = await supabase
            .from('diagnosticos')
            .insert([diagnosticData])
            .select()
            .single();

          if (error) {
            console.error('❌ Error saving to Supabase:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
            throw new Error(`Error saving diagnostic to database: ${error.message}`);
          } else {
            console.log('✅ Diagnostic saved successfully to Supabase');
            return this.mapToDto(data);
          }
        } catch (error) {
          console.error('❌ Supabase error:', error);
          throw error;
        }
      } else {
        console.warn('⚠️  Supabase not configured. Diagnostic will not be persisted.');
      }

      // Si Supabase no está disponible, generar un ID temporal y retornar sin persistir
      const tempId = randomUUID();
      const now = new Date().toISOString();

      console.log('✅ Returning diagnostic with temp ID:', tempId);
      return {
        id: tempId,
        created_at: now,
        nombre: diagnosticData.nombre,
        email: diagnosticData.email,
        empresa: diagnosticData.empresa,
        telefono: diagnosticData.telefono,
        tipo_empresa: diagnosticData.tipo_empresa,
        nivel_digital: diagnosticData.nivel_digital,
        objetivos: diagnosticData.objetivos,
        tamano: diagnosticData.tamano,
        necesidades_adicionales: diagnosticData.necesidades_adicionales,
        solucion_principal: diagnosticData.solucion_principal,
        soluciones_complementarias: diagnosticData.soluciones_complementarias,
        urgencia: diagnosticData.urgencia,
        match_score: diagnosticData.match_score,
        estado: diagnosticData.estado,
        asignado_a: null,
        notas: null,
      };
    } catch (error) {
      console.error('❌ Error in createDiagnostic service:', error);
      console.error('❌ Error message:', (error as Error).message);
      console.error('❌ Error stack:', (error as Error).stack);
      throw error;
    }
  }

  /**
   * Obtiene un diagnóstico por ID
   */
  async getDiagnosticById(id: string): Promise<DiagnosticResultDto> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured. Cannot retrieve diagnostic. Please configure Supabase in your .env file.');
    }

    // Usar el cliente admin para evitar problemas con RLS
    let supabase;
    try {
      supabase = this.supabaseService.getAdminClient();
    } catch {
      supabase = this.supabaseService.getClient();
    }

    const { data, error } = await supabase
      .from('diagnosticos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching diagnostic: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Diagnostic with id ${id} not found`);
    }

    return this.mapToDto(data);
  }

  /**
   * Obtiene el resultado procesado de un diagnóstico
   */
  async getDiagnosticResult(id: string): Promise<DiagnosticResult | DiagnosticEnvelope> {
    console.log('🔄 getDiagnosticResult called with ID:', id);
    
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured. Cannot retrieve diagnostic result by ID. Please configure Supabase in your .env file.');
    }
    
    try {
      // Obtener datos raw de Supabase para acceder a campos adicionales
      let supabase;
      try {
        supabase = this.supabaseService.getAdminClient();
      } catch {
        supabase = this.supabaseService.getClient();
      }

      const { data: diagnosticRaw, error: fetchError } = await supabase
        .from('diagnosticos')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !diagnosticRaw) {
        throw new Error(`Error fetching diagnostic: ${fetchError?.message || 'Not found'}`);
      }

      console.log('✅ Diagnostic retrieved:', diagnosticRaw.id);

      // Verificar si tiene envelope_data (diagnóstico mejorado o conversacional)
      if (diagnosticRaw.envelope_data) {
        try {
          const envelope = JSON.parse(diagnosticRaw.envelope_data);
          
          // Verificar si es conversacional dentro del envelope
          if (envelope.type === 'conversational' || envelope.summary || envelope.insights || envelope.personalizedMessage) {
            const sector = envelope.sector || diagnosticRaw.sector || diagnosticRaw.tipo_empresa;
            const result = {
              id,
              sector,
              summary: envelope.summary,
              insights: envelope.insights,
              personalizedMessage: envelope.personalizedMessage,
              type: 'conversational',
              // Generar primarySolution y nextSteps basados en el sector
              primarySolution: {
                id: `sistema-${sector}`,
                title: getSolutionTitleForSector(sector),
                description: getSolutionDescriptionForSector(sector),
                icon: getSolutionIconForSector(sector),
                link: `/soluciones/${sector}`,
                matchScore: 100,
                reason: 'Basado en tu diagnóstico, esta solución puede ayudarte a ahorrar tiempo y dinero.'
              },
              complementarySolutions: [],
              urgency: envelope.summary?.roi > 50 ? 'high' : envelope.summary?.roi > 20 ? 'medium' : 'low',
              nextSteps: {
                primary: {
                  text: 'Solicitar validación operativa',
                  link: `/contacto?from=diagnostico&sector=${sector}`
                }
              }
            };
            console.log('✅ Returning conversational diagnostic from envelope_data');
            return result as any;
          }
          
          // Si no es conversacional, es un diagnóstico mejorado
          envelope.id = id; // Asegurar que el ID esté presente
          console.log('✅ Returning enhanced diagnostic envelope from stored data');
          return envelope as DiagnosticEnvelope;
        } catch (e) {
          console.warn('⚠️  Could not parse envelope_data, falling back to processing');
        }
      }

      // Si tiene campos del diagnóstico mejorado, usar motor mejorado
      if (diagnosticRaw.operacion_actual || diagnosticRaw.dolor_principal) {
        // Mapear tipo_empresa a businessType
        const tipoMap: Record<string, BusinessType> = {
          'restaurante': 'restaurante',
          'servicio-tecnico': 'servicio-tecnico',
          'fabrica': 'fabrica',
          'otro': 'presencia-web',
        };
        const businessType = tipoMap[diagnosticRaw.tipo_empresa] || 'otro';
        
        const enhancedAnswers: EnhancedDiagnosticAnswers = {
          businessType,
          operacionActual: diagnosticRaw.operacion_actual,
          nivelDigital: diagnosticRaw.nivel_digital as any,
          situacionActual: diagnosticRaw.situacion_actual,
          dolorPrincipal: diagnosticRaw.dolor_principal,
          objetivoPrincipal: diagnosticRaw.objetivos || [],
          tipoNegocio: diagnosticRaw.tipo_negocio,
          tamano: diagnosticRaw.tamano as any,
          necesidadesAdicionales: diagnosticRaw.necesidades_adicionales || [],
        };

        const envelope = processEnhancedDiagnostic(enhancedAnswers);
        envelope.id = id; // Asegurar que el ID esté presente
        console.log('✅ Enhanced diagnostic result processed');
        return envelope;
      }

      // Reconstruir las respuestas originales para motor antiguo
      const normalizedAnswers = {
        tipoEmpresa: diagnosticRaw.tipo_empresa as any,
        nivelDigital: diagnosticRaw.nivel_digital as any,
        objetivos: diagnosticRaw.objetivos || [],
        tamano: diagnosticRaw.tamano as any,
        necesidadesAdicionales: diagnosticRaw.necesidades_adicionales || [],
      };

      console.log('🔄 Processing diagnostic with normalized answers:', normalizedAnswers);

      // Procesar nuevamente para obtener el resultado completo
      const result = processDiagnostic(normalizedAnswers);
      console.log('✅ Diagnostic result processed. Primary solution:', result.primarySolution.id);
      
      // Asegurar que el resultado tenga el ID
      (result as any).id = id;
      return result;
    } catch (error) {
      console.error('❌ Error in getDiagnosticResult:', error);
      throw error;
    }
  }

  /**
   * Lista todos los diagnósticos (con paginación)
   */
  async getAllDiagnostics(page: number = 1, limit: number = 20): Promise<{
    data: DiagnosticResultDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Usar admin client para evitar problemas con RLS
    let supabase;
    try {
      supabase = this.supabaseService.getAdminClient();
    } catch {
      supabase = this.supabaseService.getClient();
    }
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Obtener total
    const { count } = await supabase
      .from('diagnosticos')
      .select('*', { count: 'exact', head: true });

    // Obtener datos paginados
    const { data, error } = await supabase
      .from('diagnosticos')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Error fetching diagnostics: ${error.message}`);
    }

    return {
      data: data.map(item => this.mapToDto(item)),
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Actualiza el estado de un diagnóstico
   */
  async updateDiagnosticStatus(
    id: string,
    status: string,
    asignadoA?: string,
    notas?: string,
    costoReal?: number,
    trabajoRealHoras?: number,
    aprobadoPor?: string,
  ): Promise<DiagnosticResultDto> {
    // Usar admin client para evitar problemas con RLS
    let supabase;
    try {
      supabase = this.supabaseService.getAdminClient();
    } catch {
      supabase = this.supabaseService.getClient();
    }

    const updateData: any = {
      estado: status,
    };

    if (asignadoA) {
      updateData.asignado_a = asignadoA;
    }

    if (notas) {
      updateData.notas = notas;
    }

    if (costoReal !== undefined) {
      updateData.costo_real = costoReal;
    }

    if (trabajoRealHoras !== undefined) {
      updateData.trabajo_real_horas = trabajoRealHoras;
    }

    // Si se aprueba (status = 'proyecto' o 'cerrado'), registrar fecha de aprobación
    if ((status === 'proyecto' || status === 'cerrado') && aprobadoPor) {
      updateData.fecha_aprobacion = new Date().toISOString();
      updateData.aprobado_por = aprobadoPor;
    }

    const { data, error } = await supabase
      .from('diagnosticos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating diagnostic: ${error.message}`);
    }

    return this.mapToDto(data);
  }

  /**
   * Mapea datos de Supabase a DTO
   */
  private mapToDto(data: any): DiagnosticResultDto {
    return {
      id: data.id,
      created_at: data.created_at,
      nombre: data.nombre,
      email: data.email,
      empresa: data.empresa,
      telefono: data.telefono,
      tipo_empresa: data.tipo_empresa,
      nivel_digital: data.nivel_digital,
      objetivos: data.objetivos || [],
      tamano: data.tamano,
      necesidades_adicionales: data.necesidades_adicionales || [],
      solucion_principal: data.solucion_principal,
      soluciones_complementarias: data.soluciones_complementarias || [],
      urgencia: data.urgencia,
      match_score: data.match_score,
      estado: data.estado,
      asignado_a: data.asignado_a,
      notas: data.notas,
      costo_real: data.costo_real,
      trabajo_real_horas: data.trabajo_real_horas,
      fecha_aprobacion: data.fecha_aprobacion,
      aprobado_por: data.aprobado_por,
    };
  }
}

