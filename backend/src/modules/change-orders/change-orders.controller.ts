import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ChangeOrdersService } from './change-orders.service';

@Controller('change-orders')
export class ChangeOrdersController {
  constructor(private readonly changeOrdersService: ChangeOrdersService) {}

  @Get('order/:orderId')
  async getByOrderId(@Param('orderId') orderId: string) {
    const changeOrders = await this.changeOrdersService.getChangeOrdersByOrderId(orderId);
    return { success: true, data: changeOrders };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const changeOrder = await this.changeOrdersService.getChangeOrderById(id);
    return { success: true, data: changeOrder };
  }

  @Post()
  async create(@Body() changeOrder: any) {
    const created = await this.changeOrdersService.createChangeOrder(changeOrder);
    return { success: true, data: created };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updates: any) {
    const updated = await this.changeOrdersService.updateChangeOrder(id, updates);
    return { success: true, data: updated };
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string, @Body() body: { approved_by: string }) {
    const approved = await this.changeOrdersService.approveChangeOrder(id, body.approved_by);
    return { success: true, data: approved };
  }

  @Put(':id/reject')
  async reject(@Param('id') id: string, @Body() body: { reason: string }) {
    const rejected = await this.changeOrdersService.rejectChangeOrder(id, body.reason);
    return { success: true, data: rejected };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.changeOrdersService.deleteChangeOrder(id);
    return { success: true, message: 'Change order deleted' };
  }
}
