import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { Cart, CartItem } from '../models/cart.model';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async createCart(): Promise<Cart> {
    try {
      return await this.cartService.createCart();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getCart(@Param('id') id: string): Promise<Cart> {
    try {
      return await this.cartService.getCart(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':cartId/items')
  async addCartItem(
    @Param('cartId') cartId: string,
    @Body() cartItem: Omit<CartItem, 'id' | 'cart_id' | 'created_at'>,
  ): Promise<CartItem> {
    try {
      return await this.cartService.addCartItem({ ...cartItem, cart_id: cartId });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('items/:id')
  async updateCartItemQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<CartItem> {
    try {
      return await this.cartService.updateCartItemQuantity(id, quantity);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':cartId/items/:itemId')
  async removeCartItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string
  ): Promise<void> {
    try {
      await this.cartService.removeCartItem(itemId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteCart(@Param('id') id: string): Promise<void> {
    try {
      await this.cartService.deleteCart(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}