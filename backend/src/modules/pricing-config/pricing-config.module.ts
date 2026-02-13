import { Module } from '@nestjs/common';
import { PricingConfigController } from './pricing-config.controller';
import { PricingConfigService } from './pricing-config.service';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [PricingConfigController],
  providers: [PricingConfigService],
  exports: [PricingConfigService],
})
export class PricingConfigModule {}
