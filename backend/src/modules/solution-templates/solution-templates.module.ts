import { Module } from '@nestjs/common';
import { SolutionTemplatesController } from './solution-templates.controller';
import { SolutionTemplatesService } from './solution-templates.service';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SolutionTemplatesController],
  providers: [SolutionTemplatesService],
  exports: [SolutionTemplatesService],
})
export class SolutionTemplatesModule {}
