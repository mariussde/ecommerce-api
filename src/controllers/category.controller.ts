import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories(): Promise<Category[]> {
    try {
      return await this.categoryService.getAllCategories();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':slug')
  async getCategoryBySlug(@Param('slug') slug: string): Promise<Category> {
    try {
      return await this.categoryService.getCategoryBySlug(slug);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async createCategory(@Body() category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    try {
      return await this.categoryService.createCategory(category);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() category: Partial<Category>): Promise<Category> {
    try {
      return await this.categoryService.updateCategory(id, category);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string): Promise<void> {
    try {
      await this.categoryService.deleteCategory(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}