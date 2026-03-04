import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class GeneratePdfDto {
  /** Data URL (base64) del logo del cliente */
  @IsOptional()
  @IsString()
  logoCliente?: string;

  /** Data URL del logo Maestro Digital (por defecto se usa placeholder) */
  @IsOptional()
  @IsString()
  logoTu?: string;

  /** Data URLs de mockups: 1=móvil, 2=escritorio, 3=muestra PDF orden (vertical), 4=imagen pág 3, 5=imagen pág 4 */
  @IsOptional()
  @IsString()
  mockup1?: string;

  @IsOptional()
  @IsString()
  mockup2?: string;

  @IsOptional()
  @IsString()
  mockup3?: string;

  @IsOptional()
  @IsString()
  mockup4?: string;

  @IsOptional()
  @IsString()
  mockup5?: string;

  /** Color primario hex (ej: #c41e3a) */
  @IsOptional()
  @IsString()
  colorPrimary?: string;

  /** Color secundario hex (ej: #c41e3a) */
  @IsOptional()
  @IsString()
  colorSecondary?: string;

  /** Tipo de plantilla: generic | restaurante | taller | servicio-tecnico */
  @IsOptional()
  @IsString()
  tipoNegocio?: string;

  /** Tipo de web (cuando hay web): landing | multi-pagina | catalogo */
  @IsOptional()
  @IsString()
  tipoWeb?: string;

  /** Tipo de sistema (cuando hay sistema): un-local | multi-sucursal */
  @IsOptional()
  @IsString()
  tipoSistema?: string;

  /** Si el sistema incluye roles (admin, técnicos, empleados): true | false */
  @IsOptional()
  @IsBoolean()
  conRoles?: boolean;

  /** Tipo de oferta: solo-web | solo-sistema | combo */
  @IsOptional()
  @IsString()
  tipoOferta?: string;

  /** Precios en texto (ej: "150.000") */
  @IsOptional()
  @IsString()
  precioBasico?: string;

  @IsOptional()
  @IsString()
  precioProfesional?: string;

  @IsOptional()
  @IsString()
  precioEnterprise?: string;

  /** Subtítulo opcional */
  @IsOptional()
  @IsString()
  subtitle?: string;
}
