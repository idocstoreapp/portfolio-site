import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { CreateOrderDto, OrderStatus, ProjectType } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderDto, OrderWithRelationsDto } from './dto/order.dto';
import { CreateOrderFromDiagnosticDto } from './dto/create-order-from-diagnostic.dto';

@Injectable()
export class OrdersService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Genera un número de orden único
   */
  private async generateOrderNumber(): Promise<string> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    
    // Llamar a la función SQL que genera el número
    const { data, error } = await supabase.rpc('generate_order_number');

    if (error) {
      // Fallback: generar manualmente si la función falla
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .like('order_number', `ORD-${year}-%`);

      const sequence = ((count || 0) + 1).toString().padStart(3, '0');
      return `ORD-${year}-${sequence}`;
    }

    return data;
  }

  /**
   * Calcula el precio total de una orden
   */
  private calculateTotalPrice(
    basePrice: number,
    modulesPrice: number,
    customAdjustments: number,
    discountAmount: number,
  ): number {
    return basePrice + modulesPrice + customAdjustments - discountAmount;
  }

  /**
   * Aplica garantías automáticas según tipo de proyecto y módulos
   */
  private async applyAutomaticLegalTerms(
    projectType: ProjectType,
    includedModules?: string[],
    existingWarranty?: string,
    existingMaintenance?: string,
    existingExclusions?: string,
  ): Promise<{ warranty_text: string; maintenance_policy: string; exclusions_text: string; legal_template_id?: string }> {
    if (!this.supabaseService.isConfigured()) {
      return {
        warranty_text: existingWarranty || '',
        maintenance_policy: existingMaintenance || '',
        exclusions_text: existingExclusions || '',
      };
    }

    const supabase = this.supabaseService.getAdminClient();

    // Determinar categoría según tipo de proyecto
    const legalCategory = projectType === ProjectType.WEB ? 'web' :
                         projectType === ProjectType.SISTEMA ? 'system' :
                         projectType === ProjectType.COMBINADO ? 'combined' : 'app';

    // Obtener plantilla legal por defecto
    const { data: legalTemplate } = await supabase
      .from('legal_templates')
      .select('*')
      .eq('category', legalCategory)
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    let warrantyText = existingWarranty || '';
    let maintenancePolicy = existingMaintenance || '';
    let exclusionsText = existingExclusions || '';

    if (legalTemplate) {
      warrantyText = warrantyText || legalTemplate.warranty_text;
      maintenancePolicy = maintenancePolicy || legalTemplate.maintenance_text || '';
      exclusionsText = exclusionsText || legalTemplate.exclusions_text;
    }

    // Si hay módulos adicionales, agregar información
    if (includedModules && includedModules.length > 0) {
      const { data: modules } = await supabase
        .from('solution_modules')
        .select('name, description, category')
        .in('id', includedModules);

      if (modules && modules.length > 0) {
        const modulesList = modules.map(m => m.name).join(', ');
        if (!exclusionsText.includes('Módulos adicionales')) {
          exclusionsText += `\n\nMódulos adicionales incluidos: ${modulesList}. Cada módulo adicional tiene sus propias garantías específicas según su funcionalidad.`;
        }
      }
    }

    return {
      warranty_text: warrantyText,
      maintenance_policy: maintenancePolicy,
      exclusions_text: exclusionsText,
      legal_template_id: legalTemplate?.id,
    };
  }

  /**
   * Calcula el precio de los módulos incluidos
   */
  private async calculateModulesPrice(moduleIds: string[]): Promise<number> {
    if (!moduleIds || moduleIds.length === 0) {
      return 0;
    }

    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('solution_modules')
      .select('base_price')
      .in('id', moduleIds)
      .eq('is_active', true);

    if (error) {
      console.warn(`Error calculating modules price: ${error.message}`);
      return 0;
    }

    return (data || []).reduce((sum, module) => sum + (parseFloat(module.base_price) || 0), 0);
  }

  /**
   * Crea una nueva orden
   */
  async createOrder(createOrderDto: CreateOrderDto, userId?: string): Promise<OrderDto> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();

    // Generar número de orden
    const orderNumber = await this.generateOrderNumber();

    // Calcular precios si no se proporcionaron
    let basePrice = createOrderDto.base_price || 0;
    let modulesPrice = createOrderDto.modules_price || 0;

    // Si hay módulos incluidos, calcular su precio
    if (createOrderDto.included_modules && createOrderDto.included_modules.length > 0) {
      modulesPrice = await this.calculateModulesPrice(createOrderDto.included_modules);
    }

    // Si hay solution_template_id pero no base_price, obtenerlo del template
    if (createOrderDto.solution_template_id && !createOrderDto.base_price) {
      const { data: template } = await supabase
        .from('solution_templates')
        .select('base_price')
        .eq('id', createOrderDto.solution_template_id)
        .single();

      if (template) {
        basePrice = parseFloat(template.base_price) || 0;
      }
    }

    // Calcular total
    const totalPrice = this.calculateTotalPrice(
      basePrice,
      modulesPrice,
      createOrderDto.custom_adjustments || 0,
      createOrderDto.discount_amount || 0,
    );

    // Aplicar garantías automáticas si no se proporcionaron
    let warrantyText = createOrderDto.warranty_text;
    let maintenancePolicy = createOrderDto.maintenance_policy;
    let exclusionsText = createOrderDto.exclusions_text;
    let paymentTerms = createOrderDto.payment_terms;
    let legalTemplateId: string | undefined;

    if (!warrantyText || !maintenancePolicy || !exclusionsText) {
      const legalTerms = await this.applyAutomaticLegalTerms(
        createOrderDto.project_type,
        createOrderDto.included_modules,
        warrantyText,
        maintenancePolicy,
        exclusionsText,
      );
      warrantyText = warrantyText || legalTerms.warranty_text;
      maintenancePolicy = maintenancePolicy || legalTerms.maintenance_policy;
      exclusionsText = exclusionsText || legalTerms.exclusions_text;
      legalTemplateId = legalTerms.legal_template_id;
    }

    // Preparar datos para insertar
    const orderData: any = {
      order_number: orderNumber,
      diagnostico_id: createOrderDto.diagnostico_id || null,
      cliente_id: createOrderDto.cliente_id || null,
      solution_template_id: createOrderDto.solution_template_id || null,
      created_by: userId || null,
      client_name: createOrderDto.client_name,
      client_email: createOrderDto.client_email || null,
      client_phone: createOrderDto.client_phone || null,
      client_company: createOrderDto.client_company || null,
      status: createOrderDto.status || OrderStatus.DRAFT,
      project_type: createOrderDto.project_type,
      scope_description: createOrderDto.scope_description || null,
      included_modules: createOrderDto.included_modules ? JSON.stringify(createOrderDto.included_modules) : null,
      excluded_modules: createOrderDto.excluded_modules ? JSON.stringify(createOrderDto.excluded_modules) : null,
      custom_features: createOrderDto.custom_features || null,
      branding_logo_url: createOrderDto.branding_logo_url || null,
      branding_colors: createOrderDto.branding_colors ? JSON.stringify(createOrderDto.branding_colors) : null,
      branding_notes: createOrderDto.branding_notes || null,
      base_price: basePrice,
      modules_price: modulesPrice,
      custom_adjustments: createOrderDto.custom_adjustments || 0,
      discount_amount: createOrderDto.discount_amount || 0,
      total_price: totalPrice,
      currency: createOrderDto.currency || 'USD',
      payment_terms: paymentTerms || createOrderDto.payment_terms || null,
      payment_schedule: createOrderDto.payment_schedule ? JSON.stringify(createOrderDto.payment_schedule) : null,
      warranty_text: warrantyText,
      maintenance_policy: maintenancePolicy,
      exclusions_text: exclusionsText,
      legal_template_id: legalTemplateId || null,
      estimated_start_date: createOrderDto.estimated_start_date || null,
      estimated_completion_date: createOrderDto.estimated_completion_date || null,
      internal_notes: createOrderDto.internal_notes || null,
      client_notes: createOrderDto.client_notes || null,
    };

    // Insertar orden
    const { data: order, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }

    // Crear relaciones con módulos si hay módulos incluidos
    if (createOrderDto.included_modules && createOrderDto.included_modules.length > 0) {
      const orderModules = createOrderDto.included_modules.map(moduleId => ({
        order_id: order.id,
        module_id: moduleId,
        status: 'included',
      }));

      await supabase.from('order_modules').insert(orderModules);
    }

    // Crear términos por defecto
    await supabase.from('order_terms').insert([{
      order_id: order.id,
      warranty_days: 30,
      maintenance_included: false,
      exclusions_text: 'Cualquier funcionalidad no descrita explícitamente en este documento no está incluida en el alcance del proyecto.',
    }]);

    return this.mapToDto(order);
  }

  /**
   * Crea una orden desde un diagnóstico
   */
  async createOrderFromDiagnostic(
    createFromDiagnosticDto: CreateOrderFromDiagnosticDto,
    userId?: string,
  ): Promise<OrderDto> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();

    // Obtener diagnóstico
    const { data: diagnostic, error: diagnosticError } = await supabase
      .from('diagnosticos')
      .select('*')
      .eq('id', createFromDiagnosticDto.diagnostico_id)
      .single();

    if (diagnosticError || !diagnostic) {
      throw new Error(`Diagnostic with id ${createFromDiagnosticDto.diagnostico_id} not found`);
    }

    // Determinar solution_template_id si no se proporcionó
    let solutionTemplateId = createFromDiagnosticDto.solution_template_id;
    if (!solutionTemplateId && diagnostic.solucion_principal) {
      // Buscar template por slug basado en solucion_principal
      const { data: template } = await supabase
        .from('solution_templates')
        .select('id')
        .eq('slug', diagnostic.solucion_principal)
        .eq('is_active', true)
        .single();

      if (template) {
        solutionTemplateId = template.id;
      }
    }

    // Determinar project_type si no se proporcionó
    let projectType: ProjectType = createFromDiagnosticDto.project_type || ProjectType.SISTEMA;
    if (!createFromDiagnosticDto.project_type) {
      // Inferir del diagnóstico
      if (diagnostic.solucion_principal === 'desarrollo-web') {
        projectType = ProjectType.WEB;
      } else {
        projectType = ProjectType.SISTEMA;
      }
    }

    // Obtener módulos recomendados del template si no se proporcionaron
    let includedModules = createFromDiagnosticDto.included_modules;
    if (!includedModules && solutionTemplateId) {
      const { data: modules } = await supabase
        .from('solution_modules')
        .select('id')
        .eq('solution_template_id', solutionTemplateId)
        .eq('is_required', true)
        .eq('is_active', true);

      if (modules) {
        includedModules = modules.map(m => m.id);
      }
    }

    // Aplicar garantías automáticas según tipo de proyecto
    let warrantyText = createFromDiagnosticDto.warranty_text;
    let maintenancePolicy = createFromDiagnosticDto.maintenance_policy;
    let exclusionsText = createFromDiagnosticDto.exclusions_text;
    let paymentTerms = createFromDiagnosticDto.payment_terms;

    // Obtener plantilla legal según tipo de proyecto
    if (!warrantyText || !maintenancePolicy || !exclusionsText) {
      const legalCategory = projectType === ProjectType.WEB ? 'web' :
                           projectType === ProjectType.SISTEMA ? 'system' :
                           projectType === ProjectType.COMBINADO ? 'combined' : 'app';
      
      const { data: legalTemplate } = await supabase
        .from('legal_templates')
        .select('*')
        .eq('category', legalCategory)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (legalTemplate) {
        if (!warrantyText) warrantyText = legalTemplate.warranty_text;
        if (!maintenancePolicy) maintenancePolicy = legalTemplate.maintenance_text || '';
        if (!exclusionsText) exclusionsText = legalTemplate.exclusions_text;
        if (!paymentTerms && legalTemplate.payment_terms_template) {
          paymentTerms = legalTemplate.payment_terms_template;
        }
      }
    }

    // Si hay módulos adicionales, agregar garantías de módulos
    if (includedModules && includedModules.length > 0) {
      const { data: modules } = await supabase
        .from('solution_modules')
        .select('name, description')
        .in('id', includedModules);

      if (modules && modules.length > 0) {
        const modulesList = modules.map(m => m.name).join(', ');
        if (exclusionsText && !exclusionsText.includes('Módulos adicionales')) {
          exclusionsText += `\n\nMódulos adicionales incluidos: ${modulesList}. Cada módulo adicional tiene sus propias garantías específicas según su funcionalidad.`;
        }
      }
    }

    // Crear DTO para crear orden
    const createOrderDto: CreateOrderDto = {
      diagnostico_id: createFromDiagnosticDto.diagnostico_id,
      solution_template_id: solutionTemplateId,
      client_name: diagnostic.nombre || diagnostic.empresa || 'Cliente',
      client_email: diagnostic.email,
      client_phone: diagnostic.telefono,
      client_company: diagnostic.empresa,
      project_type: projectType,
      status: OrderStatus.DRAFT,
      included_modules: includedModules,
      custom_adjustments: createFromDiagnosticDto.custom_adjustments,
      discount_amount: createFromDiagnosticDto.discount_amount,
      payment_terms: paymentTerms || createFromDiagnosticDto.payment_terms,
      warranty_text: warrantyText,
      maintenance_policy: maintenancePolicy,
      exclusions_text: exclusionsText,
      internal_notes: createFromDiagnosticDto.internal_notes,
      scope_description: `Orden generada desde diagnóstico ${createFromDiagnosticDto.diagnostico_id}`,
    };

    const order = await this.createOrder(createOrderDto, userId);

    // Actualizar estado del diagnóstico a "aprobado" si se creó la orden
    await supabase
      .from('diagnosticos')
      .update({ estado: 'aprobado' })
      .eq('id', createFromDiagnosticDto.diagnostico_id);

    return order;
  }

  /**
   * Obtiene todas las órdenes con paginación
   */
  async getAllOrders(
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: OrderStatus;
      projectType?: string;
      search?: string;
    },
  ): Promise<{ data: OrderDto[]; total: number; page: number; limit: number }> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Construir query
    let countQuery = supabase.from('orders').select('*', { count: 'exact', head: true });
    let dataQuery = supabase.from('orders').select('*');

    // Aplicar filtros
    if (filters?.status) {
      countQuery = countQuery.eq('status', filters.status);
      dataQuery = dataQuery.eq('status', filters.status);
    }

    if (filters?.projectType) {
      countQuery = countQuery.eq('project_type', filters.projectType);
      dataQuery = dataQuery.eq('project_type', filters.projectType);
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      countQuery = countQuery.or(`client_name.ilike."${searchTerm}",client_email.ilike."${searchTerm}",order_number.ilike."${searchTerm}"`);
      dataQuery = dataQuery.or(`client_name.ilike."${searchTerm}",client_email.ilike."${searchTerm}",order_number.ilike."${searchTerm}"`);
    }

    // Obtener total
    const { count, error: countError } = await countQuery;
    if (countError) {
      throw new Error(`Error counting orders: ${countError.message}`);
    }

    // Obtener datos
    const { data, error } = await dataQuery
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }

    // Aplicar garantías automáticas a órdenes que no las tienen (retroactivo)
    const ordersWithLegalTerms = await Promise.all(
      (data || []).map(async (item) => {
        const orderDto = this.mapToDto(item);
        
        // Si no tiene garantías, aplicarlas automáticamente
        if (!orderDto.warranty_text || !orderDto.maintenance_policy || !orderDto.exclusions_text) {
          const legalTerms = await this.applyAutomaticLegalTerms(
            orderDto.project_type as ProjectType,
            orderDto.included_modules,
            orderDto.warranty_text,
            orderDto.maintenance_policy,
            orderDto.exclusions_text,
          );

          // Actualizar en la base de datos si se aplicaron garantías
          if (legalTerms.warranty_text && !orderDto.warranty_text) {
            await supabase
              .from('orders')
              .update({
                warranty_text: legalTerms.warranty_text,
                maintenance_policy: legalTerms.maintenance_policy,
                exclusions_text: legalTerms.exclusions_text,
                legal_template_id: legalTerms.legal_template_id,
              })
              .eq('id', item.id);

            // Actualizar el DTO
            orderDto.warranty_text = legalTerms.warranty_text;
            orderDto.maintenance_policy = legalTerms.maintenance_policy;
            orderDto.exclusions_text = legalTerms.exclusions_text;
          }
        }

        return orderDto;
      })
    );

    return {
      data: ordersWithLegalTerms,
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Obtiene una orden por ID
   */
  async getOrderById(id: string, includeRelations: boolean = false): Promise<OrderDto | OrderWithRelationsDto> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !order) {
      throw new Error(`Order with id ${id} not found`);
    }

    const orderDto = this.mapToDto(order);

    // Aplicar garantías automáticas si no existen (retroactivo)
    if (!orderDto.warranty_text || !orderDto.maintenance_policy || !orderDto.exclusions_text) {
      const legalTerms = await this.applyAutomaticLegalTerms(
        orderDto.project_type as ProjectType,
        orderDto.included_modules,
        orderDto.warranty_text,
        orderDto.maintenance_policy,
        orderDto.exclusions_text,
      );

      // Si se aplicaron garantías automáticas, actualizar la orden
      if (legalTerms.warranty_text && !orderDto.warranty_text) {
        await supabase
          .from('orders')
          .update({
            warranty_text: legalTerms.warranty_text,
            maintenance_policy: legalTerms.maintenance_policy,
            exclusions_text: legalTerms.exclusions_text,
            legal_template_id: legalTerms.legal_template_id,
          })
          .eq('id', id);

        // Actualizar el DTO con los nuevos valores
        orderDto.warranty_text = legalTerms.warranty_text;
        orderDto.maintenance_policy = legalTerms.maintenance_policy;
        orderDto.exclusions_text = legalTerms.exclusions_text;
      }
    }

    if (includeRelations) {
      const orderWithRelations = orderDto as OrderWithRelationsDto;

      // Obtener módulos de la orden
      const { data: orderModules } = await supabase
        .from('order_modules')
        .select(`
          *,
          solution_modules (*)
        `)
        .eq('order_id', id);

      orderWithRelations.modules = orderModules || [];

      // Obtener términos
      const { data: terms } = await supabase
        .from('order_terms')
        .select('*')
        .eq('order_id', id)
        .single();

      orderWithRelations.terms = terms || null;

      return orderWithRelations;
    }

    return orderDto;
  }

  /**
   * Actualiza una orden
   */
  async updateOrder(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderDto> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();

    // Obtener orden actual para aplicar garantías automáticas si cambia template o tipo
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('project_type, solution_template_id, included_modules, base_price')
      .eq('id', id)
      .single();

    // Si se actualizan módulos o template, recalcular precios y aplicar garantías
    if (updateOrderDto.included_modules || updateOrderDto.solution_template_id || updateOrderDto.project_type) {
      if (updateOrderDto.included_modules) {
        const modulesPrice = await this.calculateModulesPrice(updateOrderDto.included_modules);
        updateOrderDto.modules_price = modulesPrice;

        // Recalcular total
        if (currentOrder) {
          updateOrderDto.total_price = this.calculateTotalPrice(
            currentOrder.base_price,
            modulesPrice,
            updateOrderDto.custom_adjustments ?? 0,
            updateOrderDto.discount_amount ?? 0,
          );
        }
      }

      // Aplicar garantías automáticas si cambió el tipo de proyecto o template
      const projectType = updateOrderDto.project_type || (currentOrder?.project_type as ProjectType);
      const includedModules = updateOrderDto.included_modules || 
        (currentOrder?.included_modules ? JSON.parse(currentOrder.included_modules as string) : []);

      if (projectType && (!updateOrderDto.warranty_text || !updateOrderDto.maintenance_policy || !updateOrderDto.exclusions_text)) {
        const legalTerms = await this.applyAutomaticLegalTerms(
          projectType,
          includedModules,
          updateOrderDto.warranty_text,
          updateOrderDto.maintenance_policy,
          updateOrderDto.exclusions_text,
        );
        
        if (!updateOrderDto.warranty_text) updateOrderDto.warranty_text = legalTerms.warranty_text;
        if (!updateOrderDto.maintenance_policy) updateOrderDto.maintenance_policy = legalTerms.maintenance_policy;
        if (!updateOrderDto.exclusions_text) updateOrderDto.exclusions_text = legalTerms.exclusions_text;
        if (legalTerms.legal_template_id) updateOrderDto.legal_template_id = legalTerms.legal_template_id;
      }
    }

    // Preparar datos para actualizar
    const updateData: any = { ...updateOrderDto };
    
    if (updateOrderDto.included_modules) {
      updateData.included_modules = JSON.stringify(updateOrderDto.included_modules);
    }
    if (updateOrderDto.excluded_modules) {
      updateData.excluded_modules = JSON.stringify(updateOrderDto.excluded_modules);
    }
    if (updateOrderDto.branding_colors) {
      updateData.branding_colors = JSON.stringify(updateOrderDto.branding_colors);
    }
    if (updateOrderDto.payment_schedule) {
      updateData.payment_schedule = JSON.stringify(updateOrderDto.payment_schedule);
    }

    // Actualizar orden
    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating order: ${error.message}`);
    }

    // Actualizar relaciones con módulos si se cambiaron
    if (updateOrderDto.included_modules) {
      // Eliminar relaciones existentes
      await supabase.from('order_modules').delete().eq('order_id', id);

      // Crear nuevas relaciones
      if (updateOrderDto.included_modules.length > 0) {
        const orderModules = updateOrderDto.included_modules.map(moduleId => ({
          order_id: id,
          module_id: moduleId,
          status: 'included',
        }));

        await supabase.from('order_modules').insert(orderModules);
      }
    }

    return this.mapToDto(order);
  }

  /**
   * Actualiza el estado de una orden
   */
  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    additionalData?: {
      sent_at?: string;
      accepted_at?: string;
      started_at?: string;
      completed_at?: string;
    },
  ): Promise<OrderDto> {
    const updateData: any = { status };

    // Actualizar fechas según el estado
    if (status === OrderStatus.SENT && !additionalData?.sent_at) {
      updateData.sent_at = new Date().toISOString();
    } else if (status === OrderStatus.ACCEPTED && !additionalData?.accepted_at) {
      updateData.accepted_at = new Date().toISOString();
    } else if (status === OrderStatus.IN_DEVELOPMENT && !additionalData?.started_at) {
      updateData.started_at = new Date().toISOString();
    } else if (status === OrderStatus.COMPLETED && !additionalData?.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    // Agregar datos adicionales si se proporcionaron
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    return this.updateOrder(id, updateData);
  }

  /**
   * Elimina una orden (soft delete recomendado, pero aquí es hard delete)
   */
  async deleteOrder(id: string): Promise<void> {
    if (!this.supabaseService.isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const supabase = this.supabaseService.getAdminClient();

    // Las relaciones se eliminan en cascada (ON DELETE CASCADE)
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting order: ${error.message}`);
    }
  }

  /**
   * Mapea datos de Supabase a DTO
   */
  private mapToDto(data: any): OrderDto {
    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      order_number: data.order_number,
      diagnostico_id: data.diagnostico_id,
      cliente_id: data.cliente_id,
      solution_template_id: data.solution_template_id,
      created_by: data.created_by,
      client_name: data.client_name,
      client_email: data.client_email,
      client_phone: data.client_phone,
      client_company: data.client_company,
      status: data.status as OrderStatus,
      project_type: data.project_type,
      scope_description: data.scope_description,
      included_modules: data.included_modules ? JSON.parse(data.included_modules) : [],
      excluded_modules: data.excluded_modules ? JSON.parse(data.excluded_modules) : [],
      custom_features: data.custom_features,
      branding_logo_url: data.branding_logo_url,
      branding_colors: data.branding_colors ? JSON.parse(data.branding_colors) : null,
      branding_notes: data.branding_notes,
      base_price: parseFloat(data.base_price) || 0,
      modules_price: parseFloat(data.modules_price) || 0,
      custom_adjustments: parseFloat(data.custom_adjustments) || 0,
      discount_amount: parseFloat(data.discount_amount) || 0,
      total_price: parseFloat(data.total_price) || 0,
      currency: data.currency || 'USD',
      payment_terms: data.payment_terms,
      payment_schedule: data.payment_schedule ? JSON.parse(data.payment_schedule) : null,
      warranty_text: data.warranty_text,
      maintenance_policy: data.maintenance_policy,
      exclusions_text: data.exclusions_text,
      sent_at: data.sent_at,
      accepted_at: data.accepted_at,
      started_at: data.started_at,
      completed_at: data.completed_at,
      estimated_start_date: data.estimated_start_date,
      estimated_completion_date: data.estimated_completion_date,
      contract_pdf_url: data.contract_pdf_url,
      manual_pdf_url: data.manual_pdf_url,
      contract_generated_at: data.contract_generated_at,
      manual_generated_at: data.manual_generated_at,
      internal_notes: data.internal_notes,
      client_notes: data.client_notes,
      version: data.version || 1,
      parent_order_id: data.parent_order_id,
    };
  }
}
