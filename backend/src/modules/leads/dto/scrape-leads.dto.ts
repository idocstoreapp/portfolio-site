import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class ScrapeLeadsDto {
  @IsString()
  query: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(50)
  limit?: number = 20;
}
