import { Module } from '@nestjs/common';
import { LegalTemplatesController } from './legal-templates.controller';
import { LegalTemplatesService } from './legal-templates.service';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [LegalTemplatesController],
  providers: [LegalTemplatesService],
  exports: [LegalTemplatesService],
})
export class LegalTemplatesModule {}
