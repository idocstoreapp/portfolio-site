export interface Feature {
  name: string;
  description: string;
  included: boolean;
  category: 'core' | 'optional';
  module_id?: string;
  price?: number;
}

export interface CustomizationOption {
  name: string;
  description: string;
  base_price: number;
  unit: string;
}

export interface PricingStructure {
  base_price: number;
  per_section?: number;
  per_function?: number;
  per_integration?: number;
  per_page?: number;
  per_catalog_item?: number;
}

export class SolutionTemplateDto {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  name: string;
  description?: string;
  description_detailed?: string;
  features_list?: Feature[];
  included_modules_default?: string[];
  base_functionality?: string;
  customization_options?: CustomizationOption[];
  pricing_structure?: PricingStructure;
  is_prefabricated: boolean;
  estimated_delivery_days?: number;
  use_cases?: string[];
  screenshots_urls?: string[];
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
