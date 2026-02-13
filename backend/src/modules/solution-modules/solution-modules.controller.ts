import { Controller, Get, Param, Query } from '@nestjs/common';
import { SolutionModulesService } from './solution-modules.service';
import { SolutionModuleDto } from './dto/solution-module.dto';

@Controller('solution-modules')
export class SolutionModulesController {
  constructor(private readonly solutionModulesService: SolutionModulesService) {}

  /**
   * GET /api/solution-modules
   * Lista todos los módulos activos (con filtros opcionales)
   */
  @Get()
  async getAllModules(
    @Query('templateId') templateId?: string,
    @Query('category') category?: string,
    @Query('includeInactive') includeInactive?: string,
  ): Promise<{ success: boolean; data: SolutionModuleDto[] }> {
    const modules = await this.solutionModulesService.getAllModules({
      templateId,
      category,
      includeInactive: includeInactive === 'true',
    });
    return {
      success: true,
      data: modules,
    };
  }

  /**
   * GET /api/solution-modules/:id
   * Obtiene un módulo por ID
   */
  @Get(':id')
  async getModuleById(@Param('id') id: string): Promise<{ success: boolean; data: SolutionModuleDto }> {
    const module = await this.solutionModulesService.getModuleById(id);
    return {
      success: true,
      data: module,
    };
  }

  /**
   * GET /api/solution-modules/template/:templateId
   * Obtiene módulos por template ID
   */
  @Get('template/:templateId')
  async getModulesByTemplateId(@Param('templateId') templateId: string): Promise<{ success: boolean; data: SolutionModuleDto[] }> {
    const modules = await this.solutionModulesService.getModulesByTemplateId(templateId);
    return {
      success: true,
      data: modules,
    };
  }
}
