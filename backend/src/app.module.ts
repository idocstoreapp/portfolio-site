import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiagnosticModule } from './modules/diagnostic/diagnostic.module';
import { SolutionsModule } from './modules/solutions/solutions.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AuthModule } from './modules/auth/auth.module';
import { SupabaseModule } from './common/supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', './.env', '../.env'], // Buscar en múltiples ubicaciones
      expandVariables: true,
      cache: false, // No cachear para desarrollo
    }),
    SupabaseModule,
    DiagnosticModule,
    SolutionsModule,
    ClientsModule,
    AuthModule,
  ],
})
export class AppModule {}

