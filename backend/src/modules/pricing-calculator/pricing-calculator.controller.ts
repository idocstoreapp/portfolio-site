import { Controller, Get, Post, Body } from '@nestjs/common';
import { PricingCalculatorService, PricingSpecs } from './pricing-calculator.service';

@Controller('pricing-calculator')
export class PricingCalculatorController {
  constructor(private readonly pricingCalculatorService: PricingCalculatorService) {}

  @Post('calculate-custom-app')
  async calculateCustomApp(@Body() specs: PricingSpecs) {
    const result = await this.pricingCalculatorService.calculateCustomAppPricing(specs);
    return { success: true, data: result };
  }

  @Post('calculate-web')
  async calculateWeb(@Body() specs: PricingSpecs) {
    const result = await this.pricingCalculatorService.calculateWebPricing(specs);
    return { success: true, data: result };
  }

  @Get('rules')
  async getPricingRules() {
    const rules = await this.pricingCalculatorService.getPricingRules();
    return { success: true, data: rules };
  }
}
