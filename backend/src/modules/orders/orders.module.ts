import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { SolutionTypeDeterminerService } from './solution-type-determiner.service';
import { SupabaseModule } from '../../common/supabase/supabase.module';
import { SolutionTemplatesModule } from '../solution-templates/solution-templates.module';
import { PricingCalculatorModule } from '../pricing-calculator/pricing-calculator.module';

@Module({
  imports: [SupabaseModule, SolutionTemplatesModule, PricingCalculatorModule],
  controllers: [OrdersController],
  providers: [OrdersService, SolutionTypeDeterminerService],
  exports: [OrdersService],
})
export class OrdersModule {}
