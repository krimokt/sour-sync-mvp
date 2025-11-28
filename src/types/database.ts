export interface Database {
  public: {
    Tables: {
      payments: {
        Row: {
          id: string;
          created_at: string;
          amount: number;
          bank_name: string;
          user_id: string;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          proof_url?: string;
        };
        Insert: PaymentInsert;
      };
      payment_quotations: {
        Row: {
          payment_id: string;
          quotation_id: string;
        };
        Insert: PaymentQuotationInsert;
      };
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: Partial<ProductInsert>;
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: Partial<CategoryInsert>;
      };
    };
  };
}

// Product types
export interface Product {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  sku: string | null;
  stock: number;
  category: string | null;
  images: string[];
  variants: ProductVariant[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  company_id: string;
  name: string;
  description?: string | null;
  price: number;
  compare_price?: number | null;
  sku?: string | null;
  stock?: number;
  category?: string | null;
  images?: string[];
  variants?: ProductVariant[];
  is_published?: boolean;
}

export interface ProductVariant {
  name: string;
  value: string;
  price_adjustment?: number;
}

// Category types
export interface Category {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface CategoryInsert {
  company_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
}

// Website settings type
export interface WebsiteSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_image: string | null;
  theme_color: string;
  show_prices: boolean;
}

export type PaymentInsert = {
  amount: number;
  bank_name: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  proof_url?: string;
};

export type PaymentQuotationInsert = {
  payment_id: string;
  quotation_id: string;
};

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface PaymentInfo {
  id: string;
  user_id: string;
  total_amount: number;
  bank_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  proof_url?: string;
  quotations?: string[];
  date?: string;
  paymentMethod?: string;
}

export interface QuotationData {
  id: string;
  uuid?: string;
  quotation_id?: string;
  product_name: string;
  quantity: number;
  status: string;
  created_at: string;
  total_amount: number;
  image_url?: string;
  hasImage?: boolean;
  product: {
    name: string;
    image: string;
    category: string;
    description?: string;
  };
  priceOptions?: Array<{
    id: string;
    price: string;
    numericPrice: number;
    supplier: string;
    deliveryTime: string;
    description?: string;
    modelName?: string;
    modelImage?: string;
  }>;
  selectedOption?: string;
} 