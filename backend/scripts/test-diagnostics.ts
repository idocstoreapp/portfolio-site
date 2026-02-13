/**
 * Script para probar la conexión a Supabase y verificar diagnósticos
 * 
 * Uso:
 *   npx ts-node scripts/test-diagnostics.ts
 * 
 * O compilar y ejecutar:
 *   npm run build
 *   node dist/scripts/test-diagnostics.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testDiagnostics() {
  console.log('🔍 Testing Supabase connection and diagnostics...\n');

  // Verificar configuración
  console.log('📋 Configuration:');
  console.log('  SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ NOT FOUND');
  console.log('  SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ NOT FOUND');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? `${supabaseServiceRoleKey.substring(0, 20)}...` : '❌ NOT FOUND');
  console.log('');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required Supabase configuration');
    console.error('   Please configure SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env');
    process.exit(1);
  }

  // Probar con anon key
  console.log('🔐 Testing with ANON key...');
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data: anonData, error: anonError, count: anonCount } = await anonClient
    .from('diagnosticos')
    .select('*', { count: 'exact', head: true });

  if (anonError) {
    console.log('  ❌ Error:', anonError.message);
    console.log('  ⚠️  This is expected - anon key has RLS restrictions');
  } else {
    console.log(`  ✅ Success: Found ${anonCount || 0} diagnostics (may be limited by RLS)`);
  }
  console.log('');

  // Probar con service_role key (si está disponible)
  if (supabaseServiceRoleKey) {
    console.log('🔐 Testing with SERVICE_ROLE key...');
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: adminData, error: adminError, count: adminCount } = await adminClient
      .from('diagnosticos')
      .select('*', { count: 'exact', head: true });

    if (adminError) {
      console.log('  ❌ Error:', adminError.message);
    } else {
      console.log(`  ✅ Success: Found ${adminCount || 0} total diagnostics`);
    }

    // Obtener algunos diagnósticos de ejemplo
    if (adminCount && adminCount > 0) {
      const { data: sampleData, error: sampleError } = await adminClient
        .from('diagnosticos')
        .select('id, nombre, empresa, tipo_empresa, estado, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!sampleError && sampleData) {
        console.log('\n📋 Sample diagnostics:');
        sampleData.forEach((d, i) => {
          console.log(`  ${i + 1}. ${d.nombre || 'Sin nombre'} - ${d.empresa || 'Sin empresa'} (${d.tipo_empresa || 'N/A'}) - ${d.estado || 'N/A'}`);
          console.log(`     Created: ${d.created_at}`);
        });
      }
    } else {
      console.log('\n📋 No diagnostics found in database');
      console.log('   This is normal if no one has completed the wizard yet.');
    }
  } else {
    console.log('⚠️  SERVICE_ROLE key not configured');
    console.log('   Add SUPABASE_SERVICE_ROLE_KEY to backend/.env to bypass RLS');
  }

  console.log('\n✅ Test completed');
}

testDiagnostics().catch(console.error);
