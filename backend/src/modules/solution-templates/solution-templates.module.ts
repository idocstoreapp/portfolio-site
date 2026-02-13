import { Module } from '@nestjs/common';
import { SolutionTemplatesController } from './solution-templates.controller';
import { SolutionTemplatesService } from './solution-templates.service';

@Module({
  controllers: [SolutionTemplatesController],
  providers: [SolutionTemplatesService],
  exports: [SolutionTemplatesService],
})
export class SolutionTemplatesModule {}
