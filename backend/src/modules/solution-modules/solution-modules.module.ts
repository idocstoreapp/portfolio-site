import { Module } from '@nestjs/common';
import { SolutionModulesController } from './solution-modules.controller';
import { SolutionModulesService } from './solution-modules.service';

@Module({
  controllers: [SolutionModulesController],
  providers: [SolutionModulesService],
  exports: [SolutionModulesService],
})
export class SolutionModulesModule {}
