import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProposalService, ProposalRow } from './proposal.service';
import { GeneratePdfDto } from './dto/generate-pdf.dto';

@Controller('proposal')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  /**
   * GET /api/proposal/templates
   * Lista plantillas con categorización (rubro, tipo oferta, descripción) para diseño distinto por PDF.
   */
  @Get('templates')
  getTemplateList(): {
    success: true;
    data: {
      tipo: string;
      name: string;
      rubro: string;
      tipoOferta: string;
      descripcion: string;
    }[];
  } {
    const data = this.proposalService.getTemplateList();
    return { success: true, data };
  }

  /**
   * GET /api/proposal/templates/:tipo
   * Bloques editables de una plantilla (portada, cierre).
   */
  @Get('templates/:tipo')
  async getTemplateBlocks(
    @Param('tipo') tipo: string,
  ): Promise<{ success: true; data: Record<string, string> }> {
    const data = await this.proposalService.getTemplateBlocks(tipo);
    return { success: true, data };
  }

  /**
   * POST /api/proposal/templates/:tipo/preview-html
   * Devuelve el HTML de vista previa con los bloques enviados (datos de ejemplo).
   */
  @Post('templates/:tipo/preview-html')
  @HttpCode(HttpStatus.OK)
  async getPreviewHtml(
    @Param('tipo') tipo: string,
    @Body() body: { blocks?: Record<string, string> },
  ): Promise<{ success: true; html: string }> {
    const html = await this.proposalService.getPreviewHtml(tipo, body.blocks);
    return { success: true, html };
  }

  /**
   * PUT /api/proposal/templates/:tipo
   * Guarda los bloques editables de una plantilla.
   */
  @Put('templates/:tipo')
  @HttpCode(HttpStatus.OK)
  async setTemplateBlocks(
    @Param('tipo') tipo: string,
    @Body() body: { blocks: Record<string, string> },
  ): Promise<{ success: true }> {
    await this.proposalService.setTemplateBlocks(tipo, body.blocks ?? {});
    return { success: true };
  }

  /**
   * POST /api/proposal/from-diagnostic/:diagnosticId
   * Crea el registro de propuesta (sin PDF). El PDF se genera desde el editor con generate-pdf.
   */
  @Post('from-diagnostic/:diagnosticId')
  @HttpCode(HttpStatus.CREATED)
  async createFromDiagnostic(
    @Param('diagnosticId') diagnosticId: string,
  ): Promise<{ success: true; data: ProposalRow }> {
    const proposal = await this.proposalService.createFromDiagnostic(diagnosticId);
    return {
      success: true,
      data: proposal,
    };
  }

  /**
   * POST /api/proposal/:id/generate-pdf
   * Genera el PDF con plantillas (logos, mockups, colores) y sube a Storage.
   */
  @Post(':id/generate-pdf')
  @HttpCode(HttpStatus.OK)
  async generatePdf(
    @Param('id') id: string,
    @Body() dto: GeneratePdfDto,
  ): Promise<{ success: true; data: ProposalRow }> {
    const proposal = await this.proposalService.generatePdfWithTemplates(id, dto);
    return {
      success: true,
      data: proposal,
    };
  }
}
