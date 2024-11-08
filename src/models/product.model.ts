import { Category } from './category.model';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock_quantity: number;
  is_featured: boolean;
  image_url: string;
  category_id: string;
  category?: Category;
  created_at?: Date;
  updated_at?: Date;
  related_products?: Product[];
}

export type SortOrder = 'asc' | 'desc';

export interface ProductQueryParams {
  category?: string;
  sortBy?: 'price';
  order?: SortOrder;
}