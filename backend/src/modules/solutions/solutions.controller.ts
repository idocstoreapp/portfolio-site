import { Controller, Get } from '@nestjs/common';
import { SolutionsService } from './solutions.service';

@Controller('solutions')
export class SolutionsController {
  constructor(private readonly solutionsService: SolutionsService) {}

  @Get()
  getSolutions() {
    return {
      success: true,
      data: this.solutionsService.getSolutions(),
    };
  }
}

