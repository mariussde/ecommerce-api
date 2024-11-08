import { Injectable } from '@nestjs/common';
import { SupabaseConfig } from '../config/supabase.config';
import { Category } from '../models/category.model';

@Injectable()
export class CategoryService {
  constructor(private supabaseConfig: SupabaseConfig) {}

  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('categories')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('categories')
      .insert([category])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabaseConfig
      .getClient()
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}