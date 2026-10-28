export type Gender = 'Pria' | 'Wanita';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface Product {
  id: number;
  product_code: string;
  product_name: string;
  stock: number;
  price: number | string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Customer {
  id: string;
  customer_name: string;
  customer_address: string;
  gender: Gender;
  birth_date: string;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
  product?: {
    id: number;
    product_code: string;
    product_name: string;
    price: number | string;
    stock: number;
  };
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: string;
  created_by: string;
  order_date: string;
  total_amount: number | string;
  customer: {
    id: string;
    customer_name: string;
    customer_address?: string;
    phone?: string | null;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  order_items?: OrderItem[];
  _count?: {
    order_items: number;
  };
}

export interface DashboardSummary {
  total_transactions: number;
  total_sales: number;
  top_selling_products: {
    product_id: number;
    product_code: string;
    product_name: string;
    total_quantity_sold: number;
    total_revenue: number;
    current_stock: number;
  }[];
  low_stock_products: Product[];
  daily_sales: {
    date: string;
    total_orders: number;
    revenue: number;
  }[];
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Record<string, string[]>;
}
