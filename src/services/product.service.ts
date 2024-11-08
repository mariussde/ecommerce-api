import { Injectable } from '@nestjs/common';
import { SupabaseConfig } from '../config/supabase.config';
import { Product, ProductQueryParams } from '../models/product.model';

@Injectable()
export class ProductService {
  constructor(private supabaseConfig: SupabaseConfig) {}

  async getAllProducts(params?: ProductQueryParams): Promise<Product[]> {
    let query = this.supabaseConfig
      .getClient()
      .from('products')
      .select('*, categories!inner(*)');
    
    // Apply category filter
    if (params?.category) {
      query = query.eq('categories.slug', params.category);
    }

    // Apply sorting
    if (params?.sortBy === 'price') {
      const order = params.order || 'asc';
      query = query.order('price', { ascending: order === 'asc' });
    }

    const { data: products, error } = await query;
    
    if (error) throw error;

    // Find the featured product
    const featuredProduct = products?.find(product => product.is_featured);
    
    if (featuredProduct) {
      // Get related products (excluding the featured product)
      const relatedProducts = products
        .filter(product => product.id !== featuredProduct.id)
        .slice(0, 3);
      
      // Add related products only to the featured product
      return products.map(product => 
        product.id === featuredProduct.id
          ? { ...product, related_products: relatedProducts }
          : product
      );
    }

    return products;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const { data: product, error } = await this.supabaseConfig
      .getClient()
      .from('products')
      .select('*, categories!inner(*)')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;

    // Only fetch related products if this is a featured product
    if (product.is_featured) {
      const { data: relatedProducts } = await this.supabaseConfig
        .getClient()
        .from('products')
        .select('*, categories!inner(*)')
        .neq('id', product.id)
        .limit(3);

      return { ...product, related_products: relatedProducts };
    }

    return product;
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const { data, error } = await this.supabaseConfig
      .getClient()
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabaseConfig
      .getClient()
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}