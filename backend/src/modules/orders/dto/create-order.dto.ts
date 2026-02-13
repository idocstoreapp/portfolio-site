import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsBoolean, IsObject, IsEmail, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  IN_DEVELOPMENT = 'in_development',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProjectType {
  SISTEMA = 'sistema',
  WEB = 'web',
  COMBINADO = 'combinado',
  CUSTOM = 'custom',
}

export class CreateOrderDto {
  // Relaciones
  @IsString()
  @IsOptional()
  diagnostico_id?: string;

  @IsString()
  @IsOptional()
  cliente_id?: string;

  @IsString()
  @IsOptional()
  solution_template_id?: string;

  // Información del cliente (snapshot)
  @IsString()
  client_name: string;

  @IsEmail()
  @IsOptional()
  client_email?: string;

  @IsString()
  @IsOptional()
  client_phone?: string;

  @IsString()
  @IsOptional()
  client_company?: string;

  // Estado y tipo
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus = OrderStatus.DRAFT;

  @IsEnum(ProjectType)
  project_type: ProjectType;

  // Alcance
  @IsString()
  @IsOptional()
  scope_description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  included_modules?: string[]; // Array de UUIDs de módulos

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  excluded_modules?: string[]; // Array de UUIDs de módulos

  @IsString()
  @IsOptional()
  custom_features?: string;

  // Personalización
  @IsString()
  @IsOptional()
  branding_logo_url?: string;

  @IsObject()
  @IsOptional()
  branding_colors?: { primary?: string; secondary?: string };

  @IsString()
  @IsOptional()
  branding_notes?: string;

  // Aspectos económicos
  @IsNumber()
  @IsOptional()
  base_price?: number;

  @IsNumber()
  @IsOptional()
  modules_price?: number;

  @IsNumber()
  @IsOptional()
  custom_adjustments?: number;

  @IsNumber()
  @IsOptional()
  discount_amount?: number;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  // Términos de pago
  @IsString()
  @IsOptional()
  payment_terms?: string;

  @IsObject()
  @IsOptional()
  payment_schedule?: any[];

  // Términos legales (básicos, detallados van en order_terms)
  @IsString()
  @IsOptional()
  warranty_text?: string;

  @IsString()
  @IsOptional()
  maintenance_policy?: string;

  @IsString()
  @IsOptional()
  exclusions_text?: string;

  // Fechas estimadas
  @IsDateString()
  @IsOptional()
  estimated_start_date?: string;

  @IsDateString()
  @IsOptional()
  estimated_completion_date?: string;

  // Notas
  @IsString()
  @IsOptional()
  internal_notes?: string;

  @IsString()
  @IsOptional()
  client_notes?: string;
}
