import { Module } from '@nestjs/common';
import { PricingCalculatorService } from './pricing-calculator.service';
import { PricingCalculatorController } from './pricing-calculator.controller';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [PricingCalculatorController],
  providers: [PricingCalculatorService],
  exports: [PricingCalculatorService],
})
export class PricingCalculatorModule {}
