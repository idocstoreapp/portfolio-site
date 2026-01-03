/**
 * Cliente de Supabase para guardar diagnósticos
 * 
 * ⚠️ IMPORTANTE: Para usar Supabase, primero instala:
 * npm install @supabase/supabase-js
 * 
 * Luego configura en .env.local:
 * PUBLIC_SUPABASE_URL=tu_url_de_supabase
 * PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
 * 
 * Ver SUPABASE_SETUP.md para más detalles.
 * 
 * NOTA: Este módulo es opcional. Si Supabase no está instalado,
 * las funciones retornarán false sin romper la aplicación.
 */

// Variables de entorno
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

export interface DiagnosticData {
  tipo_empresa: string;
  nivel_digital: string;
  objetivos: string[];
  tamano: string;
  necesidades_adicionales?: string[];
  nombre?: string;
  empresa?: string;
  solucion_principal: string;
  soluciones_complementarias: string[];
  urgencia: 'high' | 'medium' | 'low';
  ip_address?: string;
  user_agent?: string;
}

/**
 * Guarda un diagnóstico en Supabase
 * Retorna false si Supabase no está configurado o no está instalado
 * No rompe la aplicación si Supabase no está disponible
 */
export async function saveDiagnostic(data: DiagnosticData): Promise<boolean> {
  // Si no hay variables de entorno, no intentar
  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV) {
      console.log('Supabase no configurado - diagnóstico no guardado');
    }
    return false;
  }

  // Intentar cargar Supabase dinámicamente
  // Usamos una función async para evitar que Vite analice el import en build time
  try {
    // @ts-ignore - Supabase puede no estar instalado
    const supabaseModule = await new Function('return import("@supabase/supabase-js")')();
    const { createClient } = supabaseModule;
    
    const client = createClient(supabaseUrl, supabaseAnonKey);
    
    const { error } = await client
      .from('diagnosticos')
      .insert([data]);

    if (error) {
      console.error('Error guardando diagnóstico:', error);
      return false;
    }

    return true;
  } catch (error: any) {
    // Supabase no está instalado o hay un error
    if (import.meta.env.DEV) {
      console.log('Supabase no disponible - diagnóstico no guardado (esto es normal si no está instalado)');
      if (error?.message?.includes('Cannot find module')) {
        console.log('💡 Tip: Instala Supabase con: npm install @supabase/supabase-js');
      }
    }
    return false;
  }
}
