import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.error('');
  console.error('📝 Please create .env.local file in backend/admin-panel/ with:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui');
  throw new Error('Missing Supabase environment variables. Please check CONFIGURACION_VARIABLES_ENTORNO.md');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);




