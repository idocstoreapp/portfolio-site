import { IsString, IsArray, IsOptional, IsEmail, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiagnosticDto {
  @IsString()
  tipoEmpresa: string;

  // Campo para el nuevo sistema conversacional
  @IsString()
  @IsOptional()
  businessType?: string; // Alias de tipoEmpresa para compatibilidad

  @IsString()
  @IsOptional()
  sector?: string; // Nuevo campo para el sistema conversacional

  @IsString()
  @IsOptional()
  nivelDigital?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  objetivos?: string[];

  @IsString()
  @IsOptional()
  tamano?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  necesidadesAdicionales?: string[];

  // Nuevos campos del diagnóstico mejorado
  @IsString()
  @IsOptional()
  operacionActual?: string;

  @IsString()
  @IsOptional()
  situacionActual?: string;

  @IsString()
  @IsOptional()
  dolorPrincipal?: string;

  @IsString()
  @IsOptional()
  tipoNegocio?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  empresa?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  // Nuevos campos del diagnóstico conversacional
  // Usar ValidateIf para hacer la validación más flexible
  @IsOptional()
  summary?: any; // Permitir cualquier estructura para summary

  @IsOptional()
  insights?: any[]; // Permitir cualquier estructura para insights

  @IsOptional()
  personalizedMessage?: any; // Permitir cualquier estructura para personalizedMessage

  // Estructura mejorada de resultados
  @IsOptional()
  @IsObject()
  currentSituation?: any; // Situación actual con imagen

  @IsOptional()
  @IsArray()
  opportunities?: any[]; // Oportunidades detectadas

  @IsOptional()
  @IsObject()
  operationalImpact?: any; // Impacto operativo

  @IsOptional()
  @IsObject()
  futureVision?: any; // Visión futura

  // Permitir campos adicionales dinámicos (para todas las respuestas específicas)
  [key: string]: any;
}

