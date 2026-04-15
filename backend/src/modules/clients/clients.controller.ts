import { Controller, Get, Post, Put, Delete, Query, Body, Param } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async getAllClients(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('estado') estado?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    const result = await this.clientsService.getAllClients(pageNum, limitNum, search, estado);
    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  async getClientById(@Param('id') id: string) {
    const client = await this.clientsService.getClientById(id);
    return {
      success: true,
      data: client,
    };
  }

  @Post()
  async createClient(@Body() clientData: any) {
    const client = await this.clientsService.createClient(clientData);
    return {
      success: true,
      data: client,
    };
  }

  @Put(':id')
  async updateClient(@Param('id') id: string, @Body() clientData: any) {
    const client = await this.clientsService.updateClient(id, clientData);
    return {
      success: true,
      data: client,
    };
  }

  @Delete(':id')
  async deleteClient(@Param('id') id: string) {
    await this.clientsService.deleteClient(id);
    return {
      success: true,
      message: 'Client deleted successfully',
    };
  }

  @Get(':id/metrics')
  async getClientMetrics(@Param('id') id: string) {
    const metrics = await this.clientsService.getClientMetrics(id);
    return {
      success: true,
      data: metrics,
    };
  }

  @Get(':id/orders')
  async getClientOrders(@Param('id') id: string) {
    const orders = await this.clientsService.getClientOrders(id);
    return {
      success: true,
      data: orders,
    };
  }

  @Get(':id/notes')
  async getClientNotes(@Param('id') id: string) {
    const notes = await this.clientsService.getClientNotes(id);
    return {
      success: true,
      data: notes,
    };
  }

  @Post(':id/notes')
  async createClientNote(@Param('id') id: string, @Body() noteData: any) {
    const note = await this.clientsService.createClientNote(id, noteData);
    return {
      success: true,
      data: note,
    };
  }

  @Get(':id/interactions')
  async getClientInteractions(@Param('id') id: string) {
    const interactions = await this.clientsService.getClientInteractions(id);
    return {
      success: true,
      data: interactions,
    };
  }

  @Post(':id/interactions')
  async createClientInteraction(@Param('id') id: string, @Body() interactionData: any) {
    const interaction = await this.clientsService.createClientInteraction(id, interactionData);
    return {
      success: true,
      data: interaction,
    };
  }

  @Get(':id/payments')
  async getClientPayments(@Param('id') id: string) {
    const payments = await this.clientsService.getClientPayments(id);
    return {
      success: true,
      data: payments,
    };
  }

  @Post(':id/payments')
  async createPayment(@Param('id') id: string, @Body() paymentData: any) {
    const payment = await this.clientsService.createPayment({
      ...paymentData,
      cliente_id: id,
    });
    return {
      success: true,
      data: payment,
    };
  }

  @Put('payments/:paymentId')
  async updatePayment(@Param('paymentId') paymentId: string, @Body() paymentData: any) {
    const payment = await this.clientsService.updatePayment(paymentId, paymentData);
    return {
      success: true,
      data: payment,
    };
  }
}




