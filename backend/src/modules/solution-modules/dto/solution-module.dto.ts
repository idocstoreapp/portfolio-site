export class SolutionModuleDto {
  id: string;
  created_at: string;
  updated_at: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  solution_template_id?: string;
  base_price: number;
  is_required: boolean;
  manual_title?: string;
  manual_description?: string;
  manual_instructions?: string;
  manual_screenshots?: any;
  is_active: boolean;
  display_order: number;
  estimated_hours: number;
}
