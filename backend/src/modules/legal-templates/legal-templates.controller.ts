import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LegalTemplatesService } from './legal-templates.service';

@Controller('legal-templates')
export class LegalTemplatesController {
  constructor(private readonly legalTemplatesService: LegalTemplatesService) {}

  @Get()
  async getAll(@Query('category') category?: string) {
    const templates = await this.legalTemplatesService.getAllTemplates(category);
    return { success: true, data: templates };
  }

  @Get('default/:category')
  async getDefault(@Param('category') category: string) {
    const template = await this.legalTemplatesService.getDefaultTemplate(category);
    return { success: true, data: template };
  }

  @Get('code/:code')
  async getByCode(@Param('code') code: string) {
    const template = await this.legalTemplatesService.getTemplateByCode(code);
    return { success: true, data: template };
  }

  @Post()
  async create(@Body() template: any) {
    const created = await this.legalTemplatesService.createTemplate(template);
    return { success: true, data: created };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updates: any) {
    const updated = await this.legalTemplatesService.updateTemplate(id, updates);
    return { success: true, data: updated };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.legalTemplatesService.deleteTemplate(id);
    return { success: true, message: 'Legal template deleted' };
  }
}
