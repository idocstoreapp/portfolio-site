import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { ScrapeLeadsDto } from './dto/scrape-leads.dto';

@Controller('leads')
export class LeadsController {
  private readonly logger = new Logger(LeadsController.name);

  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async getLeads(
    @Query('status') status?: string,
    @Query('city') city?: string,
    @Query('category') category?: string,
  ) {
    try {
      const list = await this.leadsService.getLeads({ status, city, category });
      return list;
    } catch (err: any) {
      this.logger.error(`getLeads failed: ${err?.message}`, err?.stack);
      const isDev = process.env.NODE_ENV !== 'production';
      const message = isDev && err?.message ? err.message : 'Internal server error';
      throw new HttpException(
        { statusCode: 500, message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    try {
      const lead = await this.leadsService.updateLeadStatus(id, body?.status ?? 'new');
      return lead;
    } catch (err: any) {
      this.logger.error(`updateLeadStatus failed: ${err?.message}`, err?.stack);
      const isDev = process.env.NODE_ENV !== 'production';
      const message = isDev && err?.message ? err.message : 'Internal server error';
      throw new HttpException(
        { statusCode: 500, message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('scrape')
  async scrape(@Body() dto: ScrapeLeadsDto) {
    try {
      const result = await this.leadsService.scrapeLeads(dto);
      return result;
    } catch (err: any) {
      this.logger.error(`scrape failed: ${err?.message}`, err?.stack);
      const isDev = process.env.NODE_ENV !== 'production';
      const message = isDev && err?.message ? err.message : 'Internal server error';
      throw new HttpException(
        { statusCode: 500, message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
