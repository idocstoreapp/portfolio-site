export class SolutionTemplateDto {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  base_price: number;
  currency: string;
  is_active: boolean;
  display_order: number;
  marketing_content?: any;
}

export interface SolutionModuleBasic {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  base_price: number;
  is_required: boolean;
  manual_title?: string;
  manual_description?: string;
  manual_instructions?: string;
  display_order: number;
  estimated_hours: number;
}

export class SolutionTemplateWithModulesDto extends SolutionTemplateDto {
  modules?: SolutionModuleBasic[];
}
