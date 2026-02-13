import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderFromDiagnosticDto } from './dto/create-order-from-diagnostic.dto';
import { OrderStatus } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /api/orders
   * Lista todas las órdenes con paginación y filtros
   */
  @Get()
  async getAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
    @Query('projectType') projectType?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    const result = await this.ordersService.getAllOrders(pageNum, limitNum, {
      status,
      projectType,
      search,
    });

    return {
      success: true,
      ...result,
    };
  }

  /**
   * GET /api/orders/:id
   * Obtiene una orden por ID
   */
  @Get(':id')
  async getOrderById(
    @Param('id') id: string,
    @Query('includeRelations') includeRelations?: string,
  ) {
    const order = await this.ordersService.getOrderById(id, includeRelations === 'true');
    return {
      success: true,
      data: order,
    };
  }

  /**
   * POST /api/orders
   * Crea una nueva orden
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const userId = req.user?.id; // Si hay autenticación
    const order = await this.ordersService.createOrder(createOrderDto, userId);
    return {
      success: true,
      data: order,
    };
  }

  /**
   * POST /api/orders/from-diagnostic
   * Crea una orden desde un diagnóstico
   */
  @Post('from-diagnostic')
  @HttpCode(HttpStatus.CREATED)
  async createOrderFromDiagnostic(
    @Body() createFromDiagnosticDto: CreateOrderFromDiagnosticDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id; // Si hay autenticación
    const order = await this.ordersService.createOrderFromDiagnostic(createFromDiagnosticDto, userId);
    return {
      success: true,
      data: order,
    };
  }

  /**
   * PUT /api/orders/:id
   * Actualiza una orden
   */
  @Put(':id')
  async updateOrder(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersService.updateOrder(id, updateOrderDto);
    return {
      success: true,
      data: order,
    };
  }

  /**
   * PUT /api/orders/:id/status
   * Actualiza el estado de una orden
   */
  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; sent_at?: string; accepted_at?: string; started_at?: string; completed_at?: string },
  ) {
    const order = await this.ordersService.updateOrderStatus(id, body.status, {
      sent_at: body.sent_at,
      accepted_at: body.accepted_at,
      started_at: body.started_at,
      completed_at: body.completed_at,
    });
    return {
      success: true,
      data: order,
    };
  }

  /**
   * DELETE /api/orders/:id
   * Elimina una orden
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrder(@Param('id') id: string) {
    await this.ordersService.deleteOrder(id);
    return {
      success: true,
      message: 'Order deleted successfully',
    };
  }
}
