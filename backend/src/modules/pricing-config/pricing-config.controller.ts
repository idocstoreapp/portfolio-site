import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PricingConfigService } from './pricing-config.service';

@Controller('pricing-config')
export class PricingConfigController {
  constructor(private readonly pricingConfigService: PricingConfigService) {}

  @Get()
  async getAll(@Query('price_type') priceType?: string) {
    if (priceType) {
      const config = await this.pricingConfigService.getPricingConfigByType(priceType);
      return { success: true, data: config };
    }
    const configs = await this.pricingConfigService.getAllPricingConfigs();
    return { success: true, data: configs };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    // Implementar si es necesario
    return { success: true, data: null };
  }

  @Post()
  async create(@Body() config: any) {
    const created = await this.pricingConfigService.createPricingConfig(config);
    return { success: true, data: created };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updates: any) {
    const updated = await this.pricingConfigService.updatePricingConfig(id, updates);
    return { success: true, data: updated };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.pricingConfigService.deletePricingConfig(id);
    return { success: true, message: 'Pricing config deleted' };
  }
}
