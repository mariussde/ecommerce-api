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

    const { data: allProducts, error } = await query;
    
    if (error) throw error;

    if (allProducts && allProducts.length > 0) {
      const featuredProduct = { ...allProducts[0], is_featured: true };
      const otherProducts = allProducts.slice(1);
      
      // Select 3 related products
      const relatedProducts = otherProducts.slice(0, 3);
      
      return [
        { ...featuredProduct, related_products: relatedProducts },
        ...otherProducts
      ];
    }

    return allProducts;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const { data: product, error } = await this.supabaseConfig
      .getClient()
      .from('products')
      .select('*, categories!inner(*)')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;

    // If this is the first product, add related products
    const { data: allProducts } = await this.supabaseConfig
      .getClient()
      .from('products')
      .select('*, categories!inner(*)');

    if (allProducts && allProducts[0]?.id === product.id) {
      const relatedProducts = allProducts.slice(1, 4);
      return { ...product, is_featured: true, related_products: relatedProducts };
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