import { Injectable } from '@nestjs/common';
import { SupabaseConfig } from '../config/supabase.config';
import { Cart, CartItem } from '../models/cart.model';

@Injectable()
export class CartService {
  constructor(private supabaseConfig: SupabaseConfig) {}

  async createCart(): Promise<Cart> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('carts')
      .insert([{}])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getCart(cartId: string): Promise<Cart> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('carts')
      .select('*, cart_items(*)')
      .eq('id', cartId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async addCartItem(cartItem: Omit<CartItem, 'id' | 'created_at'>): Promise<CartItem> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('cart_items')
      .insert([cartItem])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItem> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async removeCartItem(cartItemId: string): Promise<void> {
    const { error } = await this.supabaseConfig
      .getClient()
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);
    
    if (error) throw error;
  }

  async deleteCart(cartId: string): Promise<void> {
    const { error } = await this.supabaseConfig
      .getClient()
      .from('carts')
      .delete()
      .eq('id', cartId);
    
    if (error) throw error;
  }
}