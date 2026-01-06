import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { DiagnosticService } from './diagnostic.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';

@Controller('diagnostic')
export class DiagnosticController {
  constructor(private readonly diagnosticService: DiagnosticService) {}

  /**
   * POST /api/diagnostic
   * Crea un nuevo diagnóstico
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDiagnostic(
    @Body() createDiagnosticDto: CreateDiagnosticDto,
    @Req() req: any,
  ) {
    try {
      console.log('📥 POST /api/diagnostic - Request received');
      console.log('📥 Request body keys:', Object.keys(createDiagnosticDto));
      console.log('📥 Request body (first 5000 chars):', JSON.stringify(createDiagnosticDto, null, 2).substring(0, 5000));
      
      // Log específico de campos de estructura mejorada
      const dto = createDiagnosticDto as any;
      console.log('📥 [CONTROLLER] Enhanced structure fields:', {
        hasCurrentSituation: !!dto.currentSituation,
        currentSituationType: typeof dto.currentSituation,
        currentSituationIsNull: dto.currentSituation === null,
        currentSituationIsUndefined: dto.currentSituation === undefined,
        hasOpportunities: !!dto.opportunities,
        opportunitiesIsArray: Array.isArray(dto.opportunities),
        opportunitiesCount: dto.opportunities?.length || 0,
        hasOperationalImpact: !!dto.operationalImpact,
        operationalImpactType: typeof dto.operationalImpact,
        hasFutureVision: !!dto.futureVision,
        futureVisionType: typeof dto.futureVision,
        currentSituationImageUrl: dto.currentSituation?.imageUrl || 'MISSING',
        firstOpportunityImageUrl: dto.opportunities?.[0]?.imageUrl || 'MISSING',
        futureVisionImageUrl: dto.futureVision?.imageUrl || 'MISSING',
        allDtoKeys: Object.keys(dto)
      });
      
      // Agregar información de la petición
      createDiagnosticDto.ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      createDiagnosticDto.userAgent = req.headers['user-agent'] || 'unknown';

      console.log('🔄 Calling diagnosticService.createDiagnostic...');
      const diagnostic = await this.diagnosticService.createDiagnostic(createDiagnosticDto);
      console.log('✅ Diagnostic created successfully:', diagnostic.id);
      
      return {
        success: true,
        data: diagnostic,
      };
    } catch (error) {
      console.error('❌ Error creating diagnostic:', error);
      console.error('❌ Error message:', (error as Error).message);
      console.error('❌ Error stack:', (error as Error).stack);
      
      // Retornar error con código HTTP apropiado
      throw new HttpException(
        {
          success: false,
          error: (error as Error).message || 'Error interno del servidor',
          details: process.env.NODE_ENV === 'development' 
            ? (error as Error).stack 
            : undefined,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/diagnostic/:id
   * Obtiene un diagnóstico por ID
   */
  @Get(':id')
  async getDiagnostic(@Param('id') id: string) {
    const diagnostic = await this.diagnosticService.getDiagnosticById(id);
    return {
      success: true,
      data: diagnostic,
    };
  }

  /**
   * GET /api/diagnostic/:id/result
   * Obtiene el resultado procesado de un diagnóstico (incluye el resultado completo del motor)
   * Retorna DiagnosticEnvelope si es diagnóstico mejorado, o DiagnosticResult si es legacy
   */
  @Get(':id/result')
  async getDiagnosticResult(@Param('id') id: string) {
    try {
      const result = await this.diagnosticService.getDiagnosticResult(id);
      
      // Asegurar que el ID esté presente
      if (result && typeof result === 'object' && 'id' in result) {
        (result as any).id = id;
      }
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('❌ Error getting diagnostic result:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * GET /api/diagnostic
   * Lista todos los diagnósticos (con paginación)
   */
  @Get()
  async getAllDiagnostics(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    const result = await this.diagnosticService.getAllDiagnostics(pageNum, limitNum);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * PUT /api/diagnostic/:id/status
   * Actualiza el estado de un diagnóstico
   */
  @Put(':id/status')
  async updateDiagnosticStatus(
    @Param('id') id: string,
    @Body() body: { 
      status: string; 
      asignadoA?: string; 
      notas?: string;
      costoReal?: number;
      trabajoRealHoras?: number;
      aprobadoPor?: string;
    },
  ) {
    const diagnostic = await this.diagnosticService.updateDiagnosticStatus(
      id,
      body.status,
      body.asignadoA,
      body.notas,
      body.costoReal,
      body.trabajoRealHoras,
      body.aprobadoPor,
    );
    return {
      success: true,
      data: diagnostic,
    };
  }
}

