import { Controller, Get, Param } from '@nestjs/common';
import { SolutionTemplatesService } from './solution-templates.service';
import { SolutionTemplateDto, SolutionTemplateWithModulesDto } from './dto/solution-template.dto';

@Controller('solution-templates')
export class SolutionTemplatesController {
  constructor(private readonly solutionTemplatesService: SolutionTemplatesService) {}

  /**
   * GET /api/solution-templates
   * Lista todos los templates activos
   */
  @Get()
  async getAllTemplates(): Promise<{ success: boolean; data: SolutionTemplateDto[] }> {
    const templates = await this.solutionTemplatesService.getAllTemplates();
    return {
      success: true,
      data: templates,
    };
  }

  /**
   * GET /api/solution-templates/:id
   * Obtiene un template por ID
   */
  @Get(':id')
  async getTemplateById(@Param('id') id: string): Promise<{ success: boolean; data: SolutionTemplateDto }> {
    const template = await this.solutionTemplatesService.getTemplateById(id);
    return {
      success: true,
      data: template,
    };
  }

  /**
   * GET /api/solution-templates/slug/:slug
   * Obtiene un template por slug
   */
  @Get('slug/:slug')
  async getTemplateBySlug(@Param('slug') slug: string): Promise<{ success: boolean; data: SolutionTemplateDto }> {
    const template = await this.solutionTemplatesService.getTemplateBySlug(slug);
    return {
      success: true,
      data: template,
    };
  }

  /**
   * GET /api/solution-templates/:id/with-modules
   * Obtiene un template con sus módulos
   */
  @Get(':id/with-modules')
  async getTemplateWithModules(@Param('id') id: string): Promise<{ success: boolean; data: SolutionTemplateWithModulesDto }> {
    const template = await this.solutionTemplatesService.getTemplateWithModules(id);
    return {
      success: true,
      data: template,
    };
  }
}
