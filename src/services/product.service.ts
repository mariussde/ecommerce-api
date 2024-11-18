import { Injectable } from '@nestjs/common';
import { SupabaseConfig } from '../config/supabase.config';
import { Product, ProductQueryParams } from '../models/product.model';
import { PaginationParams, PaginatedResponse } from '../models/pagination.model';

@Injectable()
export class ProductService {
  constructor(private supabaseConfig: SupabaseConfig) {}

  async getAllProducts(
    params?: ProductQueryParams & PaginationParams
  ): Promise<PaginatedResponse<Product>> {
    // Default pagination values
    const page = params?.page || 1;
    const limit = params?.limit || 6;
    const offset = (page - 1) * limit;

    let query = this.supabaseConfig
      .getClient()
      .from('products')
      .select('*, categories!inner(*)', { count: 'exact' });
    
    // Apply category filter
    if (params?.category) {
      query = query.eq('categories.slug', params.category);
    }

    // First get the total count for this query
    const { count } = await query;
    const total = count || 0;
    const last_page = Math.ceil(total / limit);

    // If requested page is greater than last page, adjust to last page
    const adjustedPage = page > last_page ? (last_page || 1) : page;
    const adjustedOffset = (adjustedPage - 1) * limit;

    // Apply sorting
    if (params?.sortBy === 'price') {
      const order = params.order || 'asc';
      query = query.order('price', { ascending: order === 'asc' });
    }

    // Apply pagination with adjusted values
    query = query.range(adjustedOffset, adjustedOffset + limit - 1);

    const { data: products, error } = await query;
    
    if (error) throw error;

    // Handle featured product logic
    const featuredProduct = products?.find(product => product.is_featured);
    let processedProducts = products;
    
    if (featuredProduct) {
      const relatedProducts = products
        .filter(product => product.id !== featuredProduct.id)
        .slice(0, 3);
      
      processedProducts = products.map(product => 
        product.id === featuredProduct.id
          ? { ...product, related_products: relatedProducts }
          : product
      );
    }

    return {
      data: processedProducts,
      meta: {
        total,
        page: adjustedPage, // Return the adjusted page number
        last_page,
        limit
      }
    };
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