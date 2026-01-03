/**
 * Cliente Supabase para el panel admin
 * Usa las mismas variables de entorno que el resto de la app
 * Singleton para evitar múltiples instancias
 */

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: any = null;
let clientPromise: Promise<any> | null = null;

export async function getSupabaseClient() {
  // Si ya existe el cliente, retornarlo
  if (supabaseClient) {
    return supabaseClient;
  }

  // Si hay una promesa en curso, esperarla
  if (clientPromise) {
    return await clientPromise;
  }

  // Crear una nueva promesa para inicializar el cliente
  clientPromise = (async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase no está configurado. Verifica PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY en .env');
    }

    try {
      const supabaseModule = await import('@supabase/supabase-js');
      const { createClient } = supabaseModule;
      
      // Crear cliente con configuración para evitar múltiples instancias
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      });
      
      return supabaseClient;
    } catch (error) {
      clientPromise = null; // Resetear la promesa en caso de error
      throw new Error('Error al inicializar Supabase. Asegúrate de que @supabase/supabase-js esté instalado.');
    }
  })();

  return await clientPromise;
}

