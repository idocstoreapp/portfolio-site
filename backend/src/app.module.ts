import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiagnosticModule } from './modules/diagnostic/diagnostic.module';
import { SolutionsModule } from './modules/solutions/solutions.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AuthModule } from './modules/auth/auth.module';
import { SupabaseModule } from './common/supabase/supabase.module';
import { SolutionTemplatesModule } from './modules/solution-templates/solution-templates.module';
import { SolutionModulesModule } from './modules/solution-modules/solution-modules.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PricingConfigModule } from './modules/pricing-config/pricing-config.module';
import { LegalTemplatesModule } from './modules/legal-templates/legal-templates.module';
import { ChangeOrdersModule } from './modules/change-orders/change-orders.module';

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
    SolutionTemplatesModule,
    SolutionModulesModule,
    OrdersModule,
    PricingConfigModule,
    LegalTemplatesModule,
    ChangeOrdersModule,
  ],
})
export class AppModule {}

