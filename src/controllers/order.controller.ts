import { Controller, Get, Post, Put, Body, Param, HttpException, HttpStatus, Delete } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { Order, OrderStatus } from '../models/order.model';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    try {
      return await this.orderService.createOrder(order);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getOrder(@Param('id') id: string): Promise<Order> {
    try {
      return await this.orderService.getOrder(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ): Promise<Order> {
    try {
      return await this.orderService.updateOrderStatus(id, status);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getAllOrders(): Promise<Order[]> {
    try {
      return await this.orderService.getAllOrders();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async cancelOrder(@Param('id') id: string): Promise<void> {
    try {
      await this.orderService.cancelOrder(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}