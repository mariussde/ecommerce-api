import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { Product, ProductQueryParams, SortOrder } from '../models/product.model';
import { PaginatedResponse } from '../models/pagination.model';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProducts(
    @Query('category') category?: string,
    @Query('sortBy') sortBy?: 'price',
    @Query('order') order?: SortOrder,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedResponse<Product>> {
    try {
      return await this.productService.getAllProducts({ 
        category, 
        sortBy, 
        order,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':slug')
  async getProductBySlug(@Param('slug') slug: string): Promise<Product> {
    try {
      return await this.productService.getProductBySlug(slug);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async createProduct(@Body() product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    try {
      return await this.productService.createProduct(product);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() product: Partial<Product>): Promise<Product> {
    try {
      return await this.productService.updateProduct(id, product);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string): Promise<void> {
    try {
      await this.productService.deleteProduct(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}