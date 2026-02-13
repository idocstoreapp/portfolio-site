import { IsString, IsOptional, IsArray, IsNumber, IsObject } from 'class-validator';
import { ProjectType } from './create-order.dto';

export class CreateOrderFromDiagnosticDto {
  @IsString()
  diagnostico_id: string;

  @IsString()
  @IsOptional()
  solution_template_id?: string; // Si no se proporciona, se usa el del diagnóstico

  @IsString()
  @IsOptional()
  project_type?: ProjectType; // Si no se proporciona, se infiere del diagnóstico

  // Módulos a incluir (si no se proporciona, se usan los recomendados del diagnóstico)
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  included_modules?: string[];

  // Ajustes personalizados
  @IsNumber()
  @IsOptional()
  custom_adjustments?: number;

  @IsNumber()
  @IsOptional()
  discount_amount?: number;

  @IsString()
  @IsOptional()
  payment_terms?: string;

  @IsString()
  @IsOptional()
  internal_notes?: string;

  // Garantías y términos legales (opcionales, se aplican automáticamente si no se proporcionan)
  @IsString()
  @IsOptional()
  warranty_text?: string;

  @IsString()
  @IsOptional()
  maintenance_policy?: string;

  @IsString()
  @IsOptional()
  exclusions_text?: string;
}
