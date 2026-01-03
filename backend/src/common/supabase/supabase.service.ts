import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('SUPABASE_URL');
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    // Debug: mostrar qué está leyendo
    console.log('🔍 Debug Supabase config:');
    console.log('  SUPABASE_URL:', url ? `${url.substring(0, 20)}...` : 'NOT FOUND');
    console.log('  SUPABASE_ANON_KEY:', anonKey ? `${anonKey.substring(0, 20)}...` : 'NOT FOUND');
    console.log('  SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? `${serviceRoleKey.substring(0, 20)}...` : 'NOT FOUND');

    // En desarrollo, permitir que Supabase sea opcional
    const isDevelopment = this.configService.get<string>('NODE_ENV') !== 'production';

    if (!url || !anonKey) {
      if (isDevelopment) {
        console.warn('⚠️  Supabase configuration is missing. Backend will run but database operations will fail.');
        console.warn('⚠️  To enable Supabase, configure SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
        // No lanzar error, permitir que el backend inicie
        return;
      } else {
        throw new Error('Supabase configuration is missing. Please check your .env file.');
      }
    }

    // Cliente público (anon key)
    this.supabase = createClient(url, anonKey);

    // Cliente admin (service role key) - solo si está disponible
    if (serviceRoleKey) {
      this.supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized. Please configure SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
    }
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      throw new Error('Service role key not configured. Admin operations are not available.');
    }
    return this.supabaseAdmin;
  }

  isConfigured(): boolean {
    return !!this.supabase;
  }
}

