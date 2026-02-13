import { CreateOrderDto, OrderStatus, ProjectType } from './create-order.dto';
import { IsEnum, IsOptional, IsArray, IsString, IsNumber, IsObject, IsEmail, IsDateString } from 'class-validator';

export class UpdateOrderDto {
  // Todos los campos de CreateOrderDto son opcionales
  @IsString()
  @IsOptional()
  diagnostico_id?: string;

  @IsString()
  @IsOptional()
  cliente_id?: string;

  @IsString()
  @IsOptional()
  solution_template_id?: string;

  @IsString()
  @IsOptional()
  client_name?: string;

  @IsEmail()
  @IsOptional()
  client_email?: string;

  @IsString()
  @IsOptional()
  client_phone?: string;

  @IsString()
  @IsOptional()
  client_company?: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(ProjectType)
  @IsOptional()
  project_type?: ProjectType;

  @IsString()
  @IsOptional()
  scope_description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  included_modules?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  excluded_modules?: string[];

  @IsString()
  @IsOptional()
  custom_features?: string;

  @IsString()
  @IsOptional()
  branding_logo_url?: string;

  @IsObject()
  @IsOptional()
  branding_colors?: { primary?: string; secondary?: string };

  @IsString()
  @IsOptional()
  branding_notes?: string;

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

  @IsNumber()
  @IsOptional()
  total_price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  payment_terms?: string;

  @IsObject()
  @IsOptional()
  payment_schedule?: any[];

  @IsString()
  @IsOptional()
  warranty_text?: string;

  @IsString()
  @IsOptional()
  maintenance_policy?: string;

  @IsString()
  @IsOptional()
  exclusions_text?: string;

  @IsDateString()
  @IsOptional()
  estimated_start_date?: string;

  @IsDateString()
  @IsOptional()
  estimated_completion_date?: string;

  @IsString()
  @IsOptional()
  internal_notes?: string;

  @IsString()
  @IsOptional()
  client_notes?: string;

  @IsString()
  @IsOptional()
  legal_template_id?: string;
}
