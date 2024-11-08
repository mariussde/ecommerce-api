export interface Cart {
  id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  created_at?: Date;
}