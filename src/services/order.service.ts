import { Injectable } from '@nestjs/common';
import { SupabaseConfig } from '../config/supabase.config';
import { Order, OrderItem, OrderStatus } from '../models/order.model';

@Injectable()
export class OrderService {
  constructor(private supabaseConfig: SupabaseConfig) {}

  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getOrder(orderId: string): Promise<Order> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async addOrderItems(orderItems: Omit<OrderItem, 'id' | 'created_at'>[]): Promise<OrderItem[]> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('order_items')
      .insert(orderItems)
      .select();
    
    if (error) throw error;
    return data;
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('orders')
      .select('*, order_items(*)');
    
    if (error) throw error;
    return data;
  }

  async cancelOrder(orderId: string): Promise<void> {
    const { error } = await this.supabaseConfig
      .getClient()
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);
  }
}
